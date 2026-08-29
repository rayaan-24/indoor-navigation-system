import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, Map, Layers, Accessibility, AlertCircle } from 'lucide-react';
import { getBuildings } from '../../services/buildingService';
import { getRooms } from '../../services/roomService';
import { getLandmarks } from '../../services/landmarkService';
import { getRouteMatch } from '../../services/routeService';
import IndoorMap from '../../components/map/IndoorMap';
import type { Location, Route } from '../../types';

export default function Explore() {
  const [searchParams] = useSearchParams();

  // Directory States
  const [buildings, setBuildings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [landmarks, setLandmarks] = useState<any[]>([]);

  // Search/Navigation States
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState<Location[]>([]);
  const [toSuggestions, setToSuggestions] = useState<Location[]>([]);
  const [fromLocation, setFromLocation] = useState<Location | null>(null);
  const [toLocation, setToLocation] = useState<Location | null>(null);
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);

  // Map Navigation States
  const [selectedBuildingId, setSelectedBuildingId] = useState('block-b');
  const [currentFloor, setCurrentFloor] = useState(0);
  const [avoidStairs, setAvoidStairs] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch campus directories
  useEffect(() => {
    const fetchExploreData = async () => {
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

      } catch (err) {
        console.error('Error fetching wayfinding data:', err);
        setError('Failed to load map listings. Ensure backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchExploreData();
  }, []);

  // Map Mongoose documents to UI Location layout
  const combinedLocations: Location[] = useMemo(() => {
    const roomsMapped: Location[] = rooms.map(r => ({
      id: r.roomNumber || r._id,
      name: r.name,
      category: r.roomType,
      buildingId: r.buildingId?.code || r.buildingId,
      floor: r.floorId?.floorNumber !== undefined ? r.floorId.floorNumber : 0,
      description: r.description || '',
      coordinates: r.coordinates
    }));

    const landmarksMapped: Location[] = landmarks.map(l => ({
      id: l._id,
      name: l.name,
      category: l.type,
      buildingId: l.buildingId?.code || l.buildingId,
      floor: l.floorId?.floorNumber !== undefined ? l.floorId.floorNumber : 0,
      description: l.description || '',
      coordinates: l.coordinates
    }));

    return [...roomsMapped, ...landmarksMapped];
  }, [rooms, landmarks]);

  // Parse query params (e.g., from home page redirects)
  useEffect(() => {
    if (combinedLocations.length === 0) return;

    const toParam = searchParams.get('to');
    const searchParam = searchParams.get('search');

    if (toParam) {
      const match = combinedLocations.find(l => l.name.toLowerCase() === toParam.toLowerCase());
      if (match) {
        setToLocation(match);
        setToQuery(match.name);
        setSelectedBuildingId(match.buildingId);
        setCurrentFloor(match.floor);
      }
    } else if (searchParam) {
      const match = combinedLocations.find(l => 
        l.name.toLowerCase().includes(searchParam.toLowerCase())
      );
      if (match) {
        setToLocation(match);
        setToQuery(match.name);
        setSelectedBuildingId(match.buildingId);
        setCurrentFloor(match.floor);
      }
    }

    // Default start location (entrance of block B) for demo convenience
    const defaultStart = combinedLocations.find(l => l.id === 'b-entrance');
    if (defaultStart) {
      setFromLocation(defaultStart);
      setFromQuery(defaultStart.name);
    }
  }, [searchParams, combinedLocations]);

  // Autocomplete filter for "From"
  useEffect(() => {
    if (fromQuery.trim().length > 1 && (!fromLocation || fromLocation.name !== fromQuery)) {
      const filtered = combinedLocations.filter(loc =>
        loc.name.toLowerCase().includes(fromQuery.toLowerCase()) &&
        loc.buildingId === selectedBuildingId
      );
      setFromSuggestions(filtered);
    } else {
      setFromSuggestions([]);
    }
  }, [fromQuery, selectedBuildingId, fromLocation, combinedLocations]);

  // Autocomplete filter for "To"
  useEffect(() => {
    if (toQuery.trim().length > 1 && (!toLocation || toLocation.name !== toQuery)) {
      const filtered = combinedLocations.filter(loc =>
        loc.name.toLowerCase().includes(toQuery.toLowerCase()) &&
        loc.buildingId === selectedBuildingId
      );
      setToSuggestions(filtered);
    } else {
      setToSuggestions([]);
    }
  }, [toQuery, selectedBuildingId, toLocation, combinedLocations]);

  // Calculate Route action
  const handleFindRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromLocation || !toLocation) return;

    try {
      // Query database for pre-calculated route
      const response = await getRouteMatch(fromLocation.id, toLocation.id);
      
      if (response.success && response.data) {
        const foundRoute = response.data;
        let updatedRoute = { ...foundRoute };
        
        // Wheelchair-accessible stairs filter hook
        if (avoidStairs) {
          updatedRoute.steps = foundRoute.steps.map((step: any) => {
            if (step.type === 'up-stairs') {
              return { ...step, instruction: 'Use Elevator B2 to go up to Floor ' + step.floor, type: 'elevator' };
            }
            if (step.type === 'down-stairs') {
              return { ...step, instruction: 'Use Elevator B2 to go down to Floor ' + step.floor, type: 'elevator' };
            }
            return step;
          });
        }
        
        setActiveRoute(updatedRoute);
        setCurrentFloor(fromLocation.floor);
      }
    } catch (err) {
      console.warn('Pre-calculated route not found, generating vector fallback line:', err);
      
      // Fallback: Mock dynamic route line
      const mockRouteObj: Route = {
        id: `mock-${fromLocation.id}-${toLocation.id}`,
        fromLocationId: fromLocation.id,
        toLocationId: toLocation.id,
        distance: 120,
        duration: 2,
        steps: [
          { instruction: `Depart from ${fromLocation.name}.`, type: 'straight' },
          { instruction: fromLocation.floor !== toLocation.floor 
            ? `Take nearest stairs or elevator to Floor ${toLocation.floor}.` 
            : 'Walk along the corridor.', 
            type: fromLocation.floor !== toLocation.floor ? 'up-stairs' : 'straight', 
            floor: toLocation.floor 
          },
          { instruction: `Proceed toward ${toLocation.name}.`, type: 'straight' },
          { instruction: `Arrive at ${toLocation.name} is ahead.`, type: 'destination' }
        ],
        pathPoints: {
          [fromLocation.floor]: [fromLocation.coordinates, { x: 500, y: 550 }],
          [toLocation.floor]: [{ x: 500, y: 550 }, toLocation.coordinates]
        }
      };
      setActiveRoute(mockRouteObj);
      setCurrentFloor(fromLocation.floor);
    }

    // Save to local storage search log history
    const historyItem = {
      id: Math.random().toString(36).substring(2, 9),
      fromLocation: { name: fromLocation.name, building: fromLocation.buildingId, floor: `Floor ${fromLocation.floor}` },
      toLocation: { name: toLocation.name, building: toLocation.buildingId, floor: `Floor ${toLocation.floor}` },
      timestamp: new Date().toLocaleString(),
    };
    const existingHistory = JSON.parse(localStorage.getItem('navHistory') || '[]');
    localStorage.setItem('navHistory', JSON.stringify([historyItem, ...existingHistory].slice(0, 10)));
  };

  const handleRoomClick = (room: Location) => {
    if (!fromLocation) {
      setFromLocation(room);
      setFromQuery(room.name);
    } else {
      setToLocation(room);
      setToQuery(room.name);
    }
  };

  const handleClearRoute = () => {
    setActiveRoute(null);
    setToLocation(null);
    setToQuery('');
  };

  const currentBuilding = buildings.find(b => b.code === selectedBuildingId);
  const activeFloorPath = activeRoute?.pathPoints[currentFloor] || [];

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto mb-10"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[500px]">
          <div className="lg:col-span-4 bg-slate-100 rounded-xl"></div>
          <div className="lg:col-span-8 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-brand-accent-dest mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-brand-primary">Wayfinding Unavailable</h2>
        <p className="text-brand-muted text-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-primary">Explore & Navigate</h1>
          <p className="text-brand-muted text-sm mt-1">Select starting point and destination to find real-time indoor route plans.</p>
        </div>

        {/* Building Code Selector Dropdown */}
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <span className="text-xs font-bold text-brand-muted uppercase">Active Building:</span>
          <select
            value={selectedBuildingId}
            onChange={(e) => {
              setSelectedBuildingId(e.target.value);
              setCurrentFloor(0);
              handleClearRoute();
              setFromLocation(null);
              setFromQuery('');
            }}
            className="rounded-lg border border-slate-350 bg-white px-3 py-2 text-xs font-semibold text-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-secondary border-slate-200"
          >
            {buildings.map(b => (
              <option key={b._id} value={b.code}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Navigation Inputs (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-brand-primary mb-4 flex items-center">
              <Navigation className="w-5 h-5 text-brand-secondary mr-2" />
              <span>Wayfinding Planner</span>
            </h2>

            <form onSubmit={handleFindRoute} className="space-y-4">
              
              {/* From Input */}
              <div className="relative space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Starting Point</label>
                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 focus-within:bg-white focus-within:border-brand-secondary transition-all">
                  <MapPin className="w-4 h-4 text-brand-muted ml-3 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search start location..."
                    value={fromQuery}
                    onChange={(e) => setFromQuery(e.target.value)}
                    className="w-full px-2.5 py-3 text-xs text-brand-primary bg-transparent focus:outline-none"
                  />
                </div>

                {/* From Suggestions dropdown */}
                {fromSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                    {fromSuggestions.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          setFromLocation(loc);
                          setFromQuery(loc.name);
                          setFromSuggestions([]);
                        }}
                        className="w-full px-3 py-2.5 hover:bg-slate-50 text-left text-xs text-brand-primary border-b border-slate-50 last:border-0 cursor-pointer"
                      >
                        {loc.name}
                        <span className="text-[9px] text-brand-muted block">Floor {loc.floor} • {loc.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* To Input */}
              <div className="relative space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Destination</label>
                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 focus-within:bg-white focus-within:border-brand-secondary transition-all">
                  <MapPin className="w-4 h-4 text-brand-muted ml-3 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search target location..."
                    value={toQuery}
                    onChange={(e) => setToQuery(e.target.value)}
                    className="w-full px-2.5 py-3 text-xs text-brand-primary bg-transparent focus:outline-none"
                  />
                </div>

                {/* To Suggestions dropdown */}
                {toSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                    {toSuggestions.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          setToLocation(loc);
                          setToQuery(loc.name);
                          setToSuggestions([]);
                        }}
                        className="w-full px-3 py-2.5 hover:bg-slate-50 text-left text-xs text-brand-primary border-b border-slate-50 last:border-0 cursor-pointer"
                      >
                        {loc.name}
                        <span className="text-[9px] text-brand-muted block">Floor {loc.floor} • {loc.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Accessibility Settings */}
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                <input
                  type="checkbox"
                  id="accessibleCheck"
                  checked={avoidStairs}
                  onChange={(e) => setAvoidStairs(e.target.checked)}
                  className="rounded border-slate-350 text-brand-secondary focus:ring-brand-secondary h-4 w-4 border-slate-200 cursor-pointer"
                />
                <label htmlFor="accessibleCheck" className="text-xs font-semibold text-brand-primary flex items-center cursor-pointer select-none">
                  <Accessibility className="w-4 h-4 text-brand-secondary mr-1.5" />
                  Avoid Stairs (Wheelchair Route)
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!fromLocation || !toLocation}
                  className="flex-grow inline-flex items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-3 px-4 text-xs shadow hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Navigation className="w-4 h-4 mr-1.5" />
                  Route Pathway
                </button>
                {activeRoute && (
                  <button
                    type="button"
                    onClick={handleClearRoute}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-3 text-xs font-semibold text-brand-primary hover:bg-slate-50 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

            </form>
          </div>

          {/* Active Navigation Steps List */}
          {activeRoute && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 animate-fade-in">
              <div className="border-b border-slate-150 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-brand-primary text-sm">Navigation Guide</h3>
                  <p className="text-[10px] font-medium text-brand-muted uppercase tracking-wider mt-0.5">Route Directions</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-brand-secondary block">{activeRoute.distance} meters</span>
                  <span className="text-[10px] text-brand-muted block">Est: {activeRoute.duration} mins</span>
                </div>
              </div>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {activeRoute.steps.map((step, idx) => (
                  <div key={idx} className="flex space-x-3 text-xs">
                    <div className="flex flex-col items-center">
                      <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-brand-primary font-bold text-[10px]">
                        {idx + 1}
                      </div>
                      {idx < activeRoute.steps.length - 1 && (
                        <div className="w-0.5 bg-slate-200 flex-grow my-1"></div>
                      )}
                    </div>
                    <div className="pt-0.5">
                      <p className="text-brand-primary font-medium">{step.instruction}</p>
                      {step.floor !== undefined && step.floor !== currentFloor && (
                        <button
                          onClick={() => setCurrentFloor(step.floor!)}
                          className="mt-1 text-[9px] font-bold text-brand-secondary hover:underline flex items-center"
                        >
                          <Layers className="w-3 h-3 mr-1" />
                          Switch Map to Floor {step.floor === 0 ? 'Ground' : `${step.floor}`}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Map visual view (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          {/* Map info bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Map className="w-5 h-5 text-brand-secondary" />
              <span className="text-sm font-bold text-brand-primary capitalize">
                {currentBuilding?.name || 'Layout Scheme'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-brand-muted uppercase">Floor Level:</span>
              <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                {currentBuilding ? (
                  Array.from({ length: currentBuilding.numberOfFloors }, (_, i) => i).map((fl) => (
                    <button
                      key={fl}
                      onClick={() => setCurrentFloor(fl)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer ${
                        currentFloor === fl
                          ? 'bg-white text-brand-primary shadow-sm'
                          : 'text-brand-muted hover:text-brand-primary'
                      }`}
                    >
                      {fl === 0 ? 'Ground' : `${fl}st`}
                    </button>
                  ))
                ) : (
                  <button className="px-3 py-1.5 rounded bg-white text-brand-primary shadow-sm text-xs font-semibold">FL 0</button>
                )}
              </div>
            </div>
          </div>

          {/* Interactive SVG IndoorMap */}
          <IndoorMap
            buildingId={selectedBuildingId}
            floor={currentFloor}
            currentLocationId={fromLocation?.id}
            destinationId={toLocation?.id}
            routePathPoints={activeFloorPath}
            onRoomClick={handleRoomClick}
            locations={combinedLocations}
          />
        </div>

      </div>

    </div>
  );
}
