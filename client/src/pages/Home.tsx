import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Compass, Layers, Accessibility, ArrowRight, Building2, MapPin, Award } from 'lucide-react';
import { getBuildings } from '../services/buildingService';
import { getRooms, searchLocations } from '../services/roomService';
import { homeContent } from '../content/homeContent';
import type { Location } from '../types';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<Location[]>([]);
  
  const navigate = useNavigate();

  // Load buildings and popular rooms on mount
  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [bRes, rRes] = await Promise.all([
          getBuildings(),
          getRooms()
        ]);

        if (bRes.success) {
          setBuildings(bRes.data.slice(0, 3)); // show top 3 buildings
        }

        if (rRes.success) {
          const allRooms = rRes.data;
          const popularCodes = ['G07', 'G01', 'G13', 'G18', 'G20', 'G02'];
          
          const filteredPopular: Location[] = allRooms
            .filter((r: any) => popularCodes.includes(r.roomNumber))
            .map((r: any) => ({
              id: r.roomNumber || r._id,
              name: r.name,
              category: r.roomType,
              buildingId: r.buildingId?.code || r.buildingId,
              floor: r.floorId?.floorNumber !== undefined ? r.floorId.floorNumber : 0,
              description: r.description || ''
            }));
          setPopularDestinations(filteredPopular);
        }
      } catch (err) {
        console.error('Error loading homepage data:', err);
      }
    };
    loadHomeData();
  }, []);

  // Search logic (live autocomplete suggestions query)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const response = await searchLocations(searchQuery);
          if (response.success) {
            setSuggestions(response.results.slice(0, 5));
          }
        } catch (err) {
          console.error('Error querying suggestions:', err);
        }
      } else {
        setSuggestions([]);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchSuggestions();
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (loc: any) => {
    navigate(`/explore?to=${encodeURIComponent(loc.roomNumber || loc.name)}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-28 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-violet-50 text-brand-secondary px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
              <Award className="w-4 h-4" />
              <span>{homeContent.hero.badge}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-primary leading-tight">
              {homeContent.hero.titleLine1} <br />
              <span className="text-brand-secondary">{homeContent.hero.titleLine2}</span>
            </h1>
            <p className="text-lg text-brand-muted max-w-lg leading-relaxed">
              {homeContent.hero.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/explore"
                className="inline-flex items-center justify-center rounded-lg bg-brand-secondary px-6 py-3.5 text-base font-semibold text-white shadow-md hover:bg-violet-700 transition-colors"
              >
                {homeContent.hero.ctaPrimary}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/buildings"
                className="inline-flex items-center justify-center rounded-lg border border-slate-250 bg-white px-6 py-3.5 text-base font-semibold text-brand-primary hover:bg-slate-50 transition-colors border-slate-200"
              >
                {homeContent.hero.ctaSecondary}
              </Link>
            </div>

            {/* Quick Search */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-md pt-4">
              <div className="flex items-center border border-slate-300 rounded-xl bg-white shadow-sm overflow-hidden focus-within:border-brand-secondary focus-within:ring-1 focus-within:ring-brand-secondary transition-all">
                <Search className="w-5 h-5 text-brand-muted ml-4 flex-shrink-0" />
                <input
                  type="text"
                  placeholder={homeContent.hero.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-4 text-sm text-brand-primary bg-transparent focus:outline-none"
                />
              </div>

              {/* Autocomplete suggestions dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-55 overflow-hidden animate-fade-in divide-y divide-slate-100">
                  {suggestions.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => handleSuggestionClick(loc)}
                      className="w-full px-4 py-3 hover:bg-slate-50 text-left flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          {loc.roomNumber && (
                            <span className="px-1.5 py-0.5 bg-violet-100 text-violet-800 font-extrabold text-[10px] rounded">
                              {loc.roomNumber}
                            </span>
                          )}
                          <p className="text-xs font-bold text-brand-primary">{loc.name}</p>
                        </div>
                        <p className="text-[10px] text-brand-muted mt-0.5">
                          {loc.building} • Floor {loc.floorNumber === 0 ? 'Ground' : `${loc.floorNumber}`} {loc.department ? `• ${loc.department}` : ''}
                        </p>
                      </div>
                      <span className="text-[9px] font-bold text-brand-secondary bg-violet-50 px-2 py-0.5 rounded-full capitalize">
                        {loc.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* Hero Right Visual */}
          <div className="lg:col-span-6 flex justify-center relative">
            <div className="absolute w-72 h-72 bg-violet-100/50 rounded-full blur-3xl -top-12 -left-12 z-0"></div>
            <div className="absolute w-72 h-72 bg-slate-100/60 rounded-full blur-3xl -bottom-12 -right-12 z-0"></div>

            {/* Custom vector architectural map mockup */}
            <div className="relative z-10 w-full max-w-md bg-slate-900 aspect-[4/3] rounded-2xl border border-slate-700 shadow-2xl p-6 overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] bg-[size:20px_20px] opacity-10"></div>
              
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Wayfinding HUD</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>

              {/* Schematic Map Visual lines */}
              <div className="flex-grow flex items-center justify-center relative">
                <svg className="w-full h-40 opacity-40" viewBox="0 0 400 200">
                  <path d="M 50,50 L 150,50 L 150,150 L 300,150" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />
                  <circle cx="50" cy="50" r="4" fill="#475569" />
                  <circle cx="300" cy="150" r="4" fill="#475569" />
                  
                  {/* Glowing dynamic navigation path */}
                  <path d="M 80,100 L 220,100 L 220,50 L 350,50" fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" className="animate-[dash_8s_linear_infinite]" strokeDasharray="8 6" />
                  <circle cx="80" cy="100" r="6" fill="#10b981" />
                  <circle cx="350" cy="50" r="6" fill="#ef4444" />
                </svg>
                
                {/* Floating tags */}
                <div className="absolute top-8 left-12 bg-slate-800/90 text-[8px] font-bold text-white px-2 py-0.5 rounded border border-slate-700">
                  YOU (B-Entrance)
                </div>
                <div className="absolute bottom-8 right-12 bg-brand-secondary/90 text-[8px] font-bold text-white px-2 py-0.5 rounded border border-slate-700">
                  DEST (B-Lab 204)
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                <span>Dist: 180m</span>
                <span>Time: ~3 mins</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Core Features Overview */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl font-extrabold text-brand-primary">{homeContent.features.title}</h2>
            <p className="text-brand-muted text-sm leading-relaxed">
              {homeContent.features.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {homeContent.features.items.map((feat, idx) => {
              const IconComp = idx === 0 ? Compass : idx === 1 ? Layers : Accessibility;
              return (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-8 space-y-4 hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 bg-violet-50 text-brand-secondary rounded-xl flex items-center justify-center">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-primary">{feat.title}</h3>
                  <p className="text-brand-muted text-sm leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      {popularDestinations.length > 0 && (
        <section className="py-16 border-b border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-brand-primary">{homeContent.popularDestinations.title}</h2>
                <p className="text-brand-muted text-sm">{homeContent.popularDestinations.subtitle}</p>
              </div>
              <Link to="/locations" className="text-sm font-semibold text-brand-secondary hover:text-violet-700 flex items-center">
                {homeContent.popularDestinations.viewAllButton}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularDestinations.map(loc => (
                <div key={loc.id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-lg hover:border-slate-300 transition-all group animate-fade-in">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-brand-secondary">
                        {loc.category}
                      </span>
                      <span className="text-xs text-brand-muted font-medium">Floor {loc.floor === 0 ? 'Ground' : `${loc.floor}st`}</span>
                    </div>
                    <h3 className="text-lg font-bold text-brand-primary group-hover:text-brand-secondary transition-colors">{loc.name}</h3>
                    <p className="text-xs text-brand-muted mt-1 flex items-center">
                      <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      <span className="capitalize">{loc.buildingId?.replace('-', ' ')}</span>
                    </p>
                    <p className="text-sm text-brand-muted mt-3 line-clamp-2 leading-relaxed">{loc.description}</p>
                  </div>
                  <div className="mt-6 flex items-center gap-2">
                    <Link
                      to={`/explore?to=${encodeURIComponent(loc.name)}`}
                      className="flex-1 inline-flex items-center justify-center rounded-lg bg-brand-secondary px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 transition-colors shadow-sm"
                    >
                      Navigate
                    </Link>
                    <Link
                      to={`/locations/${loc.id}`}
                      className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-brand-primary hover:bg-slate-50 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Buildings Preview */}
      {buildings.length > 0 && (
        <section className="py-16 bg-white border-b border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-brand-primary">{homeContent.campusBuildings.title}</h2>
                <p className="text-brand-muted text-sm">{homeContent.campusBuildings.subtitle}</p>
              </div>
              <Link to="/buildings" className="text-sm font-semibold text-brand-secondary hover:text-violet-700 flex items-center">
                {homeContent.campusBuildings.viewBuildingsButton}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {buildings.map(b => (
                <div key={b._id} className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary text-white mb-4">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-brand-primary">{b.name}</h3>
                    <p className="text-xs text-brand-secondary font-semibold uppercase tracking-wider mt-0.5">
                      {b.code === 'block-b' ? 'Computer Science Block' : b.code === 'block-a' ? 'Academic Block' : 'Administration Block'}
                    </p>
                    <p className="text-sm text-brand-muted mt-3 leading-relaxed">{b.description}</p>
                    
                    <div className="flex gap-4 mt-4 text-xs font-medium text-brand-primary">
                      <span className="flex items-center">
                        <Layers className="w-3.5 h-3.5 mr-1 text-brand-secondary" />
                        {b.numberOfFloors} Floors
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-brand-secondary" />
                        {b.numberOfLocations} Locations
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <Link
                      to={`/buildings/${b.code}`}
                      className="inline-flex w-full items-center justify-center rounded-lg border border-slate-250 bg-white py-2 text-sm font-semibold text-brand-primary hover:bg-slate-50 transition-colors border-slate-200"
                    >
                      View Building Plan
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
