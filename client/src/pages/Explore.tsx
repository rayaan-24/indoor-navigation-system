import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, CheckCircle2, Compass } from 'lucide-react';
import { getBuildings, getBuildingLayout } from '../services/buildingService';
import { calculateRoute } from '../services/navigationService';
import { createHistory } from '../services/historyService';
import { useAuth } from '../context/AuthContext';
import IndoorMap from '../components/IndoorMap';
import { exploreContent } from '../content/exploreContent';
import type { Location } from '../types';

export default function Explore() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Directory States
  const [buildings, setBuildings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [landmarks, setLandmarks] = useState<any[]>([]);
  
  // SJT Ground Floor specific structure lists for map visualization
  const [corridors, setCorridors] = useState<any[]>([]);
  const [doors, setDoors] = useState<any[]>([]);
  const [stairs, setStairs] = useState<any[]>([]);
  const [lifts, setLifts] = useState<any[]>([]);
  const [exits, setExits] = useState<any[]>([]);
  const [waypoints, setWaypoints] = useState<any[]>([]);

  // Search/Navigation States
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState<Location[]>([]);
  const [toSuggestions, setToSuggestions] = useState<Location[]>([]);
  const [fromLocation, setFromLocation] = useState<Location | null>(null);
  const [toLocation, setToLocation] = useState<Location | null>(null);
  const [activeRoute, setActiveRoute] = useState<any>(null);

  // Map Navigation States
  const [selectedBuildingId, setSelectedBuildingId] = useState('sjt-ground');
  const [currentFloor, setCurrentFloor] = useState(0);

  // Interactive Simulated Navigation Mode States
  const [navigating, setNavigating] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [recentDestinations, setRecentDestinations] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [routeLoading, setRouteLoading] = useState(false);

  // 1. Fetch campus buildings list on mount
  useEffect(() => {
    const fetchBuildingsList = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getBuildings();
        if (response.success && response.data.length > 0) {
          setBuildings(response.data);
          const sjt = response.data.find((b: any) => b.code === 'sjt-ground');
          if (sjt) {
            setSelectedBuildingId('sjt-ground');
          } else {
            setSelectedBuildingId(response.data[0].code);
          }
        }
      } catch (err) {
        console.error('Error fetching buildings list:', err);
        setError('Failed to load map listings. Ensure backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchBuildingsList();
  }, []);

  // 2. Fetch full building layout details
  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const response = await getBuildingLayout(selectedBuildingId);
        if (response.success && response.data) {
          const { rooms: rList, corridors: cList, stairs: sList, lifts: lList, exits: eList, doors: dList, waypoints: wList } = response.data;
          
          setRooms(rList || []);
          setCorridors(cList || []);
          setStairs(sList || []);
          setLifts(lList || []);
          setExits(eList || []);
          setDoors(dList || []);
          setWaypoints(wList || []);

          // Map landmarks for suggestion filters
          const mappedLandmarks = [
            ...(sList || []).map((s: any) => ({ ...s, name: s.name, category: 'Staircase' })),
            ...(lList || []).map((l: any) => ({ ...l, name: l.name, category: 'Elevator' })),
            ...(eList || []).map((e: any) => ({ ...e, name: e.name, category: 'Exit' }))
          ];
          setLandmarks(mappedLandmarks);
        }
      } catch (err) {
        console.error('Error loading building layout details:', err);
      }
    };

    if (selectedBuildingId) {
      fetchLayout();
    }
  }, [selectedBuildingId]);

  // 3. Map Mongoose documents to UI Location format
  const combinedLocations: Location[] = useMemo(() => {
    const roomsMapped: Location[] = rooms.map(r => ({
      id: r.roomNumber || r._id,
      name: r.name,
      category: r.roomType,
      department: r.department || '',
      buildingId: selectedBuildingId,
      floor: 0,
      description: r.description || '',
      coordinates: r.coordinates
    }));

    const landmarksMapped: Location[] = landmarks.map(l => ({
      id: l.exitId || l.stairId || l.liftId || l._id,
      name: l.name,
      category: l.category,
      department: '',
      buildingId: selectedBuildingId,
      floor: 0,
      description: l.name,
      coordinates: { x: l.x, y: l.y }
    }));

    return [...roomsMapped, ...landmarksMapped];
  }, [rooms, landmarks, selectedBuildingId]);

  // Filter and rank suggestion items
  const getSuggestions = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matches = combinedLocations.filter(loc => {
      const idMatch = (loc.id || '').toLowerCase().includes(q);
      const nameMatch = (loc.name || '').toLowerCase().includes(q);
      const catMatch = (loc.category || '').toLowerCase().includes(q);
      const deptMatch = (loc.department || '').toLowerCase().includes(q);
      return idMatch || nameMatch || catMatch || deptMatch;
    });

    // Score and rank
    return matches.sort((a, b) => {
      const aId = (a.id || '').toLowerCase();
      const bId = (b.id || '').toLowerCase();
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();

      const getScore = (id: string, name: string) => {
        if (id === q) return 1000;
        if (name === q) return 900;
        if (id.startsWith(q)) return 800;
        if (name.startsWith(q)) return 700;
        if (id.includes(q)) return 600;
        if (name.includes(q)) return 500;
        return 400;
      };

      return getScore(bId, bName) - getScore(aId, aName);
    });
  };

  // Load recent destinations from history for the particular authenticated user
  useEffect(() => {
    if (!user) {
      setRecentDestinations([]);
      return;
    }
    const userHistKey = `navHistory_${user.id}`;
    const savedHistory = JSON.parse(localStorage.getItem(userHistKey) || '[]');
    const uniqueDests: string[] = Array.from(new Set(savedHistory.map((h: any) => h.toLocation?.name || h.destination).filter(Boolean)));
    setRecentDestinations(uniqueDests.slice(0, 4));
  }, [activeRoute, user]);

  // Parse query params (e.g., from home page redirects)
  useEffect(() => {
    if (combinedLocations.length === 0) return;

    const toParam = searchParams.get('to');
    const searchParam = searchParams.get('search');

    if (toParam) {
      const match = combinedLocations.find(l => 
        (l.id && l.id.toLowerCase() === toParam.toLowerCase()) || 
        (l.name && l.name.toLowerCase() === toParam.toLowerCase())
      );
      if (match) {
        setToLocation(match);
        setToQuery(`${match.id} - ${match.name}`);
        setCurrentFloor(match.floor);
      }
    } else if (searchParam) {
      const match = combinedLocations.find(l => 
        (l.id && l.id.toLowerCase().includes(searchParam.toLowerCase())) ||
        (l.name && l.name.toLowerCase().includes(searchParam.toLowerCase()))
      );
      if (match) {
        setToLocation(match);
        setToQuery(`${match.id} - ${match.name}`);
        setCurrentFloor(match.floor);
      }
    }

    // Default starting room to G01 for user convenience
    if (!fromLocation) {
      const defaultStart = combinedLocations.find(l => l.id === 'G01');
      if (defaultStart) {
        setFromLocation(defaultStart);
        setFromQuery(`${defaultStart.id} - ${defaultStart.name}`);
      }
    }
  }, [searchParams, combinedLocations]);

  // Autocomplete filter for "From"
  useEffect(() => {
    if (fromQuery.trim().length > 0 && (!fromLocation || `${fromLocation.id} - ${fromLocation.name}` !== fromQuery)) {
      setFromSuggestions(getSuggestions(fromQuery));
    } else {
      setFromSuggestions([]);
    }
  }, [fromQuery, combinedLocations, fromLocation]);

  // Autocomplete filter for "To"
  useEffect(() => {
    if (toQuery.trim().length > 0 && (!toLocation || `${toLocation.id} - ${toLocation.name}` !== toQuery)) {
      setToSuggestions(getSuggestions(toQuery));
    } else {
      setToSuggestions([]);
    }
  }, [toQuery, combinedLocations, toLocation]);

  // Calculate Route action
  const handleFindRoute = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fromLocation || !toLocation) return;

    setRouteLoading(true);
    setNavigating(false);
    setCurrentStepIdx(0);
    setError('');

    try {
      const response = await calculateRoute({
        sourceId: fromLocation.id,
        destinationId: toLocation.id,
        preferences: {}
      });

      if (response.success && response.data) {
        const routeData = response.data;
        
        const mappedRoute = {
          id: `route-${routeData.sourceId}-to-${routeData.destinationId}`,
          fromLocationId: routeData.sourceId,
          toLocationId: routeData.destinationId,
          distance: routeData.distance,
          duration: routeData.estimatedTime,
          steps: routeData.steps,
          pathPoints: routeData.pathPoints
        };

        setActiveRoute(mappedRoute);
        setCurrentFloor(fromLocation.floor);

        // Log to database and local cache for the particular authenticated user
        if (user) {
          try {
            await createHistory({
              userId: user.id,
              source: `${fromLocation.id} - ${fromLocation.name}`,
              destination: `${toLocation.id} - ${toLocation.name}`,
              distance: mappedRoute.distance,
              estimatedTime: mappedRoute.duration
            });

            const historyItem = {
              id: Math.random().toString(36).substring(2, 9),
              fromLocation: { name: `${fromLocation.id} - ${fromLocation.name}`, building: selectedBuildingId, floor: `Floor ${fromLocation.floor}` },
              toLocation: { name: `${toLocation.id} - ${toLocation.name}`, building: selectedBuildingId, floor: `Floor 0` },
              timestamp: new Date().toLocaleString(),
            };
            const userHistKey = `navHistory_${user.id}`;
            const existingHistory = JSON.parse(localStorage.getItem(userHistKey) || '[]');
            localStorage.setItem(userHistKey, JSON.stringify([historyItem, ...existingHistory].slice(0, 10)));
          } catch (histErr) {
            console.warn('Failed to log route to history:', histErr);
          }
        }
      }
    } catch (err: any) {
      console.warn('Route calculation error:', err.message);
      setError(err.response?.data?.message || 'No available route was found between these locations.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setRouteLoading(false);
    }
  };

  const handleRoomClick = (room: Location) => {
    if (!fromLocation) {
      setFromLocation(room);
      setFromQuery(`${room.id} - ${room.name}`);
    } else {
      setToLocation(room);
      setToQuery(`${room.id} - ${room.name}`);
    }
  };

  const handleSetStart = (room: Location) => {
    setFromLocation(room);
    setFromQuery(`${room.id} - ${room.name}`);
  };

  const handleSetEnd = (room: Location) => {
    setToLocation(room);
    setToQuery(`${room.id} - ${room.name}`);
  };

  const handleClearRoute = () => {
    setActiveRoute(null);
    setToLocation(null);
    setToQuery('');
    setNavigating(false);
    setCurrentStepIdx(0);
  };

  const activeFloorPath = activeRoute?.pathPoints?.[currentFloor] || activeRoute?.pathPoints?.[0] || [];

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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 leading-relaxed">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-primary">{exploreContent.header.title}</h1>
          <p className="text-brand-muted text-sm mt-1">{exploreContent.header.subtitle}</p>
        </div>

        {/* Building Selector Dropdown */}
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
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-secondary cursor-pointer"
          >
            {buildings.map(b => (
              <option key={b._id} value={b.code}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold text-center animate-fade-in">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Navigation Inputs (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            
            <h2 className="text-lg font-bold text-brand-primary mb-4 flex items-center">
              <Compass className="w-5 h-5 text-brand-secondary mr-2" />
              <span>{exploreContent.planner.title}</span>
            </h2>

            <form onSubmit={handleFindRoute} className="space-y-4">
              
              {/* From Input */}
              <div className="relative space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Starting Point</label>
                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 focus-within:bg-white focus-within:border-brand-secondary transition-all">
                  <MapPin className="w-4 h-4 text-emerald-600 ml-3 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search starting room (e.g., G01, G02)"
                    value={fromQuery}
                    onChange={(e) => setFromQuery(e.target.value)}
                    className="w-full px-2.5 py-3 text-xs text-brand-primary bg-transparent focus:outline-none"
                  />
                </div>

                {/* From Suggestions dropdown */}
                {fromSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100">
                    {fromSuggestions.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          setFromLocation(loc);
                          setFromQuery(`${loc.id} - ${loc.name}`);
                          setFromSuggestions([]);
                        }}
                        className="w-full px-3.5 py-2.5 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded">
                            {loc.id}
                          </span>
                          <span className="font-bold text-xs text-brand-primary">{loc.name}</span>
                        </div>
                        <span className="text-[10px] text-brand-muted block font-medium mt-0.5">
                          SJT · Ground Floor {loc.department ? `· ${loc.department}` : ''} • {loc.category}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {fromQuery.trim().length > 0 && fromSuggestions.length === 0 && (!fromLocation || `${fromLocation.id} - ${fromLocation.name}` !== fromQuery) && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-3 text-center text-xs text-slate-400">
                    No matching locations found.
                  </div>
                )}
              </div>

              {/* To Input */}
              <div className="relative space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Destination</label>
                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 focus-within:bg-white focus-within:border-brand-secondary transition-all">
                  <Navigation className="w-4 h-4 text-red-500 ml-3 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search destination (e.g., G07, Smart, G20)"
                    value={toQuery}
                    onChange={(e) => setToQuery(e.target.value)}
                    className="w-full px-2.5 py-3 text-xs text-brand-primary bg-transparent focus:outline-none"
                  />
                </div>

                {/* To Suggestions dropdown */}
                {toSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100">
                    {toSuggestions.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          setToLocation(loc);
                          setToQuery(`${loc.id} - ${loc.name}`);
                          setToSuggestions([]);
                        }}
                        className="w-full px-3.5 py-2.5 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="px-1.5 py-0.5 bg-yellow-100 text-amber-900 border border-yellow-300 font-extrabold text-[10px] rounded">
                            {loc.id}
                          </span>
                          <span className="font-bold text-xs text-brand-primary">{loc.name}</span>
                        </div>
                        <span className="text-[10px] text-brand-muted block font-medium mt-0.5">
                          SJT · Ground Floor {loc.department ? `· ${loc.department}` : ''} • {loc.category}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {toQuery.trim().length > 0 && toSuggestions.length === 0 && (!toLocation || `${toLocation.id} - ${toLocation.name}` !== toQuery) && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-3 text-center text-xs text-slate-400">
                    No matching locations found.
                  </div>
                )}
              </div>


              {/* Recent Destinations shortcut links */}
              {recentDestinations.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block mb-1.5">
                    Recent Destinations
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {recentDestinations.map((dest, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const match = combinedLocations.find(l => l.name === dest || `${l.id} - ${l.name}` === dest || l.id === dest);
                          if (match) {
                            setToLocation(match);
                            setToQuery(`${match.id} - ${match.name}`);
                          } else {
                            setToQuery(dest);
                          }
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-brand-primary text-[10px] font-semibold rounded border border-slate-200 transition-colors cursor-pointer"
                      >
                        {dest}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!fromLocation || !toLocation || routeLoading}
                  className="flex-grow inline-flex items-center justify-center rounded-lg bg-brand-secondary hover:bg-yellow-600 text-slate-900 font-bold py-3 px-4 text-xs shadow transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Navigation className="w-4 h-4 mr-1.5 text-slate-900" />
                  {routeLoading ? 'Calculating Route...' : 'Calculate Route'}
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

          {/* Active Route Summary and Direction Steps */}
          {activeRoute && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Route Summary</span>
                <div className="flex space-x-3 text-xs font-bold">
                  <span className="text-brand-primary">{activeRoute.distance} meters</span>
                  <span className="text-brand-muted">•</span>
                  <span className="text-emerald-600">{activeRoute.duration} min walk</span>
                </div>
              </div>

              {/* Live Navigation Simulation controls */}
              <div className="p-3 bg-yellow-50/70 border border-yellow-200 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-brand-primary">
                    {navigating ? `Step ${currentStepIdx + 1} of ${activeRoute.steps.length}` : 'Guided Walk Mode'}
                  </h4>
                  <p className="text-[10px] text-brand-muted">
                    {navigating ? 'Simulating your movement on the floor map.' : 'Step through turn-by-turn directions.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNavigating(!navigating);
                    setCurrentStepIdx(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    navigating ? 'bg-slate-200 text-slate-800' : 'bg-brand-secondary text-slate-900 shadow-sm hover:bg-yellow-600'
                  }`}
                >
                  {navigating ? 'Stop' : 'Start Walk'}
                </button>
              </div>

              {/* Active Step Highlight during guided navigation */}
              {navigating && activeRoute.steps[currentStepIdx] && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2 animate-fade-in">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Current Direction:</span>
                  </div>
                  <p className="text-xs text-brand-primary font-semibold pl-6">
                    {activeRoute.steps[currentStepIdx].instruction}
                  </p>
                  <div className="flex justify-between pt-1 text-[10px]">
                    <button
                      type="button"
                      disabled={currentStepIdx === 0}
                      onClick={() => setCurrentStepIdx(prev => Math.max(0, prev - 1))}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded font-semibold disabled:opacity-40 cursor-pointer"
                    >
                      Previous Step
                    </button>
                    <button
                      type="button"
                      disabled={currentStepIdx >= activeRoute.steps.length - 1}
                      onClick={() => setCurrentStepIdx(prev => Math.min(activeRoute.steps.length - 1, prev + 1))}
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold disabled:opacity-40 cursor-pointer"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              )}

              {/* Complete Step-by-Step Directions List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {activeRoute.steps.map((step: any, idx: number) => (
                  <div
                    key={idx}
                    className={`flex items-start space-x-3 p-2.5 rounded-lg text-xs transition-colors ${
                      navigating && idx === currentStepIdx
                        ? 'bg-yellow-100 border border-yellow-300 font-bold text-brand-primary'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[10px] flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{step.instruction}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Indoor Map SVG Visualization Canvas (8 cols) */}
        <div className="lg:col-span-8">
          <IndoorMap
            buildingId={selectedBuildingId}
            floor={currentFloor}
            currentLocationId={fromLocation?.id}
            destinationId={toLocation?.id}
            routePathPoints={activeFloorPath}
            onRoomClick={handleRoomClick}
            onSetStart={handleSetStart}
            onSetEnd={handleSetEnd}
            locations={combinedLocations}
            corridors={corridors}
            doors={doors}
            stairs={stairs}
            lifts={lifts}
            exits={exits}
            waypoints={waypoints}
          />
        </div>

      </div>
    </div>
  );
}
