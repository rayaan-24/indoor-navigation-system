import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Building2, Filter, Eye, Navigation, RotateCcw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { getBuildings } from '../services/buildingService';
import { getRooms } from '../services/roomService';
import { getLandmarks } from '../services/landmarkService';
import { locationsContent } from '../content/locationsContent';
import type { LocationCategory, Location } from '../types';

export default function Locations() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [landmarks, setLandmarks] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_LIMIT = locationsContent.expandControls.initialLimit;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories: (LocationCategory | 'all')[] = [
    'all',
    'Classroom',
    'Laboratory',
    'Department',
    'Office',
    'Facility',
    'Library',
    'Cafeteria',
    'Restroom',
    'Elevator',
    'Staircase',
    'Exit',
    'Emergency'
  ];

  // Fetch all required directory data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [bRes, rRes, lRes] = await Promise.all([
          getBuildings(),
          getRooms(),
          getLandmarks()
        ]);

        if (bRes.success) setBuildings(bRes.data);
        if (rRes.success) setRooms(rRes.data);
        if (lRes.success) setLandmarks(lRes.data);

      } catch (err: any) {
        console.error('Error fetching locations:', err);
        setError('Failed to connect to the directory server.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Map Mongoose records to UI Location format
  const combinedLocations: Location[] = useMemo(() => {
    const roomsMapped: Location[] = rooms.map(r => ({
      id: r.roomNumber || r._id,
      name: r.name,
      category: r.roomType,
      buildingId: r.buildingId?.code || r.buildingId,
      floor: r.floorId?.floorNumber !== undefined ? r.floorId.floorNumber : 0,
      description: r.description || '',
      coordinates: r.coordinates || { x: 0, y: 0 }
    }));

    const landmarksMapped: Location[] = landmarks.map(l => ({
      id: l._id,
      name: l.name,
      category: l.type,
      buildingId: l.buildingId?.code || l.buildingId,
      floor: l.floorId?.floorNumber !== undefined ? l.floorId.floorNumber : 0,
      description: l.description || '',
      coordinates: l.coordinates || { x: 0, y: 0 }
    }));

    return [...roomsMapped, ...landmarksMapped];
  }, [rooms, landmarks]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedBuilding('all');
    setSelectedFloor('all');
    setSelectedCategory('all');
  };

  // Filter Logic
  const filteredLocations = useMemo(() => {
    return combinedLocations.filter((loc) => {
      const matchesSearch =
        (loc.id && loc.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBuilding = selectedBuilding === 'all' || loc.buildingId === selectedBuilding;
      const matchesFloor = selectedFloor === 'all' || loc.floor.toString() === selectedFloor;
      const matchesCategory = selectedCategory === 'all' || loc.category === selectedCategory;

      return matchesSearch && matchesBuilding && matchesFloor && matchesCategory;
    });
  }, [combinedLocations, searchQuery, selectedBuilding, selectedFloor, selectedCategory]);

  // Sliced locations for Expand / Collapse
  const displayedLocations = useMemo(() => {
    if (isExpanded) return filteredLocations;
    return filteredLocations.slice(0, INITIAL_LIMIT);
  }, [filteredLocations, isExpanded]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Header */}
      <div className="pb-6 mb-8 border-b border-slate-200">
        <h1 className="text-3xl font-extrabold text-brand-primary">{locationsContent.header.title}</h1>
        <p className="text-brand-muted text-sm mt-1">{locationsContent.header.subtitle}</p>
      </div>

      {loading ? (
        // Loading Skeleton Grid
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 h-80 bg-slate-100 rounded-xl animate-pulse"></div>
          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6 h-96">
            <div className="bg-slate-100 rounded-xl animate-pulse"></div>
            <div className="bg-slate-100 rounded-xl animate-pulse"></div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-xl mx-auto space-y-4">
          <AlertCircle className="w-10 h-10 text-brand-accent-dest mx-auto" />
          <h3 className="text-lg font-bold text-red-900">API Error</h3>
          <p className="text-xs text-red-700 leading-normal">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Side: Filter Control Panel (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-brand-primary flex items-center">
                  <Filter className="w-4 h-4 text-brand-secondary mr-2" />
                  <span>Filters</span>
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-brand-muted hover:text-brand-secondary flex items-center cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Reset
                </button>
              </div>

              {/* Building Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Building</label>
                <select
                  value={selectedBuilding}
                  onChange={(e) => setSelectedBuilding(e.target.value)}
                  className="w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-sm text-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-secondary border-slate-200"
                >
                  <option value="all">All Buildings</option>
                  {buildings.map(b => (
                    <option key={b._id} value={b.code}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Floor Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Floor Level</label>
                <select
                  value={selectedFloor}
                  onChange={(e) => setSelectedFloor(e.target.value)}
                  className="w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-sm text-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-secondary border-slate-200"
                >
                  <option value="all">All Floors</option>
                  <option value="0">Ground Floor</option>
                  <option value="1">1st Floor</option>
                  <option value="2">2nd Floor</option>
                  <option value="3">3rd Floor</option>
                </select>
              </div>

              {/* Category selection list */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted block">Category</label>
                <div className="flex flex-wrap lg:flex-col gap-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-brand-secondary text-white'
                          : 'text-brand-muted hover:bg-slate-50 hover:text-brand-primary'
                      }`}
                    >
                      {cat === 'all' ? 'All Categories' : cat}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Right Side: Search input & Results Grid (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Search Box */}
            <div className="relative">
              <div className="flex items-center border border-slate-300 rounded-xl bg-white shadow-sm overflow-hidden focus-within:border-brand-secondary focus-within:ring-1 focus-within:ring-brand-secondary transition-all">
                <Search className="w-5 h-5 text-brand-muted ml-4" />
                <input
                  type="text"
                  placeholder={locationsContent.search.placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-4 text-sm text-brand-primary bg-transparent focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 text-xs font-bold text-brand-muted hover:text-brand-accent-dest cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Results Summary */}
            <div className="text-xs text-brand-muted font-semibold uppercase tracking-wider flex justify-between items-center">
              <span>
                {locationsContent.expandControls.summaryText(
                  displayedLocations.length,
                  filteredLocations.length,
                  filteredLocations.length - displayedLocations.length
                )}
              </span>
              {filteredLocations.length === 0 && (
                <span className="text-brand-accent-dest">Try resetting filters to view all entries.</span>
              )}
            </div>

            {/* Location Cards Grid */}
            {filteredLocations.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayedLocations.map((loc) => {
                    const bName = buildings.find(b => b.code === loc.buildingId)?.name || loc.buildingId;
                    
                    return (
                      <div key={loc.id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-lg transition-all group">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-brand-secondary">
                              {loc.category}
                            </span>
                            <span className="text-xs text-brand-muted font-medium">Floor {loc.floor === 0 ? 'Ground' : `${loc.floor}st`}</span>
                          </div>
                          
                          <h3 className="text-lg font-bold text-brand-primary group-hover:text-brand-secondary transition-colors">{loc.name}</h3>
                          
                          <p className="text-xs text-brand-muted mt-1.5 flex items-center font-medium">
                            <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            <span>{bName}</span>
                          </p>

                          <p className="text-sm text-brand-muted mt-3 line-clamp-2 leading-relaxed">{loc.description}</p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                          <Link
                            to={`/explore?to=${encodeURIComponent(loc.name)}`}
                            className="flex-1 inline-flex items-center justify-center rounded-lg bg-brand-secondary px-3 py-2.5 text-xs font-semibold text-white hover:bg-violet-700 transition-colors shadow-sm"
                          >
                            <Navigation className="w-3.5 h-3.5 mr-1" />
                            {locationsContent.buttons.navigateHere}
                          </Link>
                          <Link
                            to={`/locations/${loc.id}`}
                            className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-brand-primary hover:bg-slate-50 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            {locationsContent.buttons.viewDetails}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Expand / Collapse Toggle Button */}
                {filteredLocations.length > INITIAL_LIMIT && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-white border border-slate-300 hover:border-brand-secondary text-brand-primary hover:text-brand-secondary font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4 text-brand-secondary" />
                          <span>{locationsContent.expandControls.collapseButtonText(INITIAL_LIMIT)}</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 text-brand-secondary" />
                          <span>{locationsContent.expandControls.expandButtonText(filteredLocations.length)}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Empty State View
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-150">
                  <Search className="w-7 h-7 text-brand-muted" />
                </div>
                <h3 className="text-lg font-bold text-brand-primary">{locationsContent.emptyState.title}</h3>
                <p className="text-brand-muted text-sm max-w-sm mx-auto mt-2 leading-relaxed">
                  {locationsContent.emptyState.description}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-5 inline-flex items-center justify-center rounded-lg bg-brand-primary text-white font-semibold py-2 px-4 text-xs shadow hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {locationsContent.emptyState.resetButtonText}
                </button>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
