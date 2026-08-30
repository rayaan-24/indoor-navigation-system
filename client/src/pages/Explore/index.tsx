import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, Map, Accessibility, AlertTriangle } from 'lucide-react';
import { getBuildings, getBuildingLayout } from '../../services/buildingService';
import { calculateRoute, calculateEvacuationRoute } from '../../services/navigationService';
import { createHistory } from '../../services/historyService';
import { useAuth } from '../../context/AuthContext';
import IndoorMap from '../../components/map/IndoorMap';
import type { Location } from '../../types';

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
  const [hazards, setHazards] = useState<any[]>([]);

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
  const [avoidStairs, setAvoidStairs] = useState(false);

  // Simulated emergency evacuation toggle
  const [isEvacMode, setIsEvacMode] = useState(false);
  const [evacInfo, setEvacInfo] = useState<{ exitName: string; hazardsAvoided: string[] } | null>(null);

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
          
          // Default to SJT Ground Floor if seeded, otherwise take the first
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

  // 2. Fetch full building layout details (dynamic rooms, corridors, stairs, lifts, exits, waypoints, hazards)
  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const response = await getBuildingLayout(selectedBuildingId);
        if (response.success && response.data) {
          const { rooms: rList, corridors: cList, stairs: sList, lifts: lList, exits: eList, doors: dList, waypoints: wList, hazards: hList } = response.data;
          
          setRooms(rList);
          setCorridors(cList);
          setStairs(sList);
          setLifts(lList);
          setExits(eList);
          setDoors(dList);
          setWaypoints(wList);
          setHazards(hList);

          // Map landmarks for suggestion filters
          const mappedLandmarks = [
            ...sList.map((s: any) => ({ ...s, name: s.name, category: 'Staircase' })),
            ...lList.map((l: any) => ({ ...l, name: l.name, category: 'Elevator' })),
            ...eList.map((e: any) => ({ ...e, name: e.name, category: 'Exit' }))
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

  // 3. Map Mongoose documents to UI Location layout
  const combinedLocations: Location[] = useMemo(() => {
    const roomsMapped: Location[] = rooms.map(r => ({
      id: r.roomNumber || r._id,
      name: r.name,
      category: r.roomType,
      buildingId: selectedBuildingId,
      floor: 0,
      description: r.description || '',
      coordinates: r.coordinates
    }));

    const landmarksMapped: Location[] = landmarks.map(l => ({
      id: l.exitId || l.stairId || l.liftId || l._id,
      name: l.name,
      category: l.category,
      buildingId: selectedBuildingId,
      floor: 0,
      description: l.name,
      coordinates: { x: l.x, y: l.y }
    }));

    return [...roomsMapped, ...landmarksMapped];
  }, [rooms, landmarks, selectedBuildingId]);

  // Load recent destinations from localStorage history
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('navHistory') || '[]');
    const uniqueDests: string[] = Array.from(new Set(savedHistory.map((h: any) => h.toLocation?.name).filter(Boolean)));
    setRecentDestinations(uniqueDests.slice(0, 3));
  }, [activeRoute]);

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
        setCurrentFloor(match.floor);
      }
    } else if (searchParam) {
      const match = combinedLocations.find(l => 
        l.name.toLowerCase().includes(searchParam.toLowerCase())
      );
      if (match) {
        setToLocation(match);
        setToQuery(match.name);
        setCurrentFloor(match.floor);
      }
    }

    // Default starting room to G01 for demo convenience
    const defaultStart = combinedLocations.find(l => l.id === 'G01');
    if (defaultStart) {
      setFromLocation(defaultStart);
      setFromQuery(defaultStart.name);
    }
  }, [searchParams, combinedLocations]);

  // Autocomplete filter for "From"
  useEffect(() => {
    if (fromQuery.trim().length > 0 && (!fromLocation || fromLocation.name !== fromQuery)) {
      const filtered = combinedLocations.filter(loc =>
        loc.name.toLowerCase().includes(fromQuery.toLowerCase())
      );
      setFromSuggestions(filtered);
    } else {
      setFromSuggestions([]);
    }
  }, [fromQuery, combinedLocations, fromLocation]);

  // Autocomplete filter for "To"
  useEffect(() => {
    if (toQuery.trim().length > 0 && (!toLocation || toLocation.name !== toQuery)) {
      const filtered = combinedLocations.filter(loc =>
        loc.name.toLowerCase().includes(toQuery.toLowerCase())
      );
      setToSuggestions(filtered);
    } else {
      setToSuggestions([]);
    }
  }, [toQuery, combinedLocations, toLocation]);

  // Calculate Route action (Standard or Evacuation calculations)
  const handleFindRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromLocation) return;

    setRouteLoading(true);
    setNavigating(false); 
    setEvacInfo(null);

    try {
      let response;
      if (isEvacMode) {
        // Run Emergency Evacuation calculations
        response = await calculateEvacuationRoute({
          sourceId: fromLocation.id,
          preferences: { avoidStairs }
        });
      } else {
        // Run Standard Wayfinding calculations
        if (!toLocation) return;
        response = await calculateRoute({
          sourceId: fromLocation.id,
          destinationId: toLocation.id,
          preferences: { avoidStairs }
        });
      }

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

        if (isEvacMode) {
          setEvacInfo({
            exitName: routeData.bestExit,
            hazardsAvoided: routeData.hazardsAvoided || []
          });
        }

        // Log run into MongoDB history collection if authenticated
        if (user) {
          try {
            await createHistory({
              userId: user.id,
              source: fromLocation.name,
              destination: isEvacMode ? `Evacuation Exit (${routeData.bestExit})` : toLocation!.name,
              distance: mappedRoute.distance,
              estimatedTime: mappedRoute.duration
            });

            const historyItem = {
              id: Math.random().toString(36).substring(2, 9),
              fromLocation: { name: fromLocation.name, building: selectedBuildingId, floor: `Floor ${fromLocation.floor}` },
              toLocation: { name: isEvacMode ? `Exit (${routeData.bestExit})` : toLocation!.name, building: selectedBuildingId, floor: `Floor 0` },
              timestamp: new Date().toLocaleString(),
            };
            const existingHistory = JSON.parse(localStorage.getItem('navHistory') || '[]');
            localStorage.setItem('navHistory', JSON.stringify([historyItem, ...existingHistory].slice(0, 10)));
          } catch (histErr) {
            console.warn('Failed to log route to database history:', histErr);
          }
        }
      }
    } catch (err: any) {
      console.warn('Route calculations error:', err.message);
      setError(err.response?.data?.message || 'No safe route was found between these locations.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setRouteLoading(false);
    }
  };

  const handleRoomClick = (room: Location) => {
    if (!fromLocation) {
      setFromLocation(room);
      setFromQuery(room.name);
    } else if (!isEvacMode) {
      setToLocation(room);
      setToQuery(room.name);
    }
  };

  const handleClearRoute = () => {
    setActiveRoute(null);
    setToLocation(null);
    setToQuery('');
    setNavigating(false);
    setEvacInfo(null);
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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 leading-relaxed">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-primary">Explore & Navigate</h1>
          <p className="text-brand-muted text-sm mt-1">SJT Ground Floor Map Workspace with dynamic hazard routing.</p>
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
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-secondary border-slate-250 cursor-pointer animate-fade-in"
          >
            {buildings.map(b => (
              <option key={b._id} value={b.code}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-150 text-red-650 text-red-600 rounded-xl text-xs font-semibold text-center animate-fade-in">
          {error}
        </div>
      )}

      {/* Evacuation Alert Banner */}
      {evacInfo && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-250 rounded-xl flex items-start space-x-3 text-xs text-amber-850 text-amber-900 animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Emergency Evacuation Evac Plan Calculated</h4>
            <p className="mt-1">
              Follow highlighted path to <strong>{evacInfo.exitName}</strong>. 
              {evacInfo.hazardsAvoided.length > 0 && ` Active threat sectors avoided: ${evacInfo.hazardsAvoided.join(', ')}.`}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Navigation Inputs (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            
            {/* Mode selector tab */}
            <div className="flex border-b border-slate-200 mb-6 bg-slate-50 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => { setIsEvacMode(false); handleClearRoute(); }}
                className={`flex-1 py-2 text-xs font-bold text-center rounded-md transition-all cursor-pointer ${
                  !isEvacMode 
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Normal Route
              </button>
              <button
                type="button"
                onClick={() => { setIsEvacMode(true); handleClearRoute(); }}
                className={`flex-1 py-2 text-xs font-bold text-center rounded-md transition-all cursor-pointer ${
                  isEvacMode 
                    ? 'bg-red-500 text-white shadow-sm' 
                    : 'text-red-500 hover:bg-red-50'
                }`}
              >
                🚨 Evacuation Exit
              </button>
            </div>

            <h2 className="text-lg font-bold text-brand-primary mb-4 flex items-center">
              <Navigation className="w-5 h-5 text-brand-secondary mr-2" />
              <span>Wayfinding Planner</span>
            </h2>

            <form onSubmit={handleFindRoute} className="space-y-4">
              
              {/* From Input */}
              <div className="relative space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Starting Point</label>
                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 focus-within:bg-white focus-within:border-brand-secondary transition-all">
                  <MapPin className="w-4 h-4 text-brand-muted ml-3 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search starting room (e.g., G01)"
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
                        className="w-full px-3 py-2.5 hover:bg-slate-50 text-left text-xs text-brand-primary border-b border-slate-100 last:border-0 cursor-pointer"
                      >
                        {loc.name}
                        <span className="text-[9px] text-brand-muted block font-semibold">Room {loc.id} • {loc.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* To Input (Hidden during Evacuation Mode) */}
              {!isEvacMode && (
                <div className="relative space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Destination</label>
                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 focus-within:bg-white focus-within:border-brand-secondary transition-all">
                    <MapPin className="w-4 h-4 text-brand-muted ml-3 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Search destination room (e.g., G05)"
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
                          className="w-full px-3 py-2.5 hover:bg-slate-50 text-left text-xs text-brand-primary border-b border-slate-100 last:border-0 cursor-pointer"
                        >
                          {loc.name}
                          <span className="text-[9px] text-brand-muted block font-semibold">Room {loc.id} • {loc.category}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Accessibility Settings */}
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                <input
                  type="checkbox"
                  id="accessibleCheck"
                  checked={avoidStairs}
                  onChange={(e) => setAvoidStairs(e.target.checked)}
                  className="rounded border-slate-200 text-brand-secondary focus:ring-brand-secondary h-4 w-4 cursor-pointer"
                />
                <label htmlFor="accessibleCheck" className="text-xs font-semibold text-brand-primary flex items-center cursor-pointer select-none">
                  <Accessibility className="w-4 h-4 text-brand-secondary mr-1.5" />
                  Wheelchair Accessible Route
                </label>
              </div>

              {/* Recent Destinations shortcut links */}
              {!isEvacMode && recentDestinations.length > 0 && (
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
                          const match = combinedLocations.find(l => l.name === dest);
                          if (match) {
                            setToLocation(match);
                            setToQuery(match.name);
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
                  disabled={!fromLocation || (!isEvacMode && !toLocation) || routeLoading}
                  className={`flex-grow inline-flex items-center justify-center rounded-lg text-white font-semibold py-3 px-4 text-xs shadow transition-colors disabled:opacity-50 cursor-pointer ${
                    isEvacMode ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-secondary hover:bg-blue-700'
                  }`}
                >
                  <Navigation className="w-4 h-4 mr-1.5" />
                  {routeLoading ? 'Calculating...' : isEvacMode ? 'Evacuate nearest Exit' : 'Calculate Route'}
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
                  <span className="text-[10px] text-brand-muted block">ETA: {activeRoute.duration} min</span>
                </div>
              </div>

              {!navigating ? (
                <>
                  <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                    {activeRoute.steps.map((step: any, idx: number) => (
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
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setNavigating(true);
                      setCurrentStepIdx(0);
                    }}
                    className="w-full mt-4 inline-flex items-center justify-center rounded-lg bg-emerald-650 bg-emerald-650 bg-emerald-600 text-white font-semibold py-2.5 px-4 text-xs shadow hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    Start Navigation
                  </button>
                </>
              ) : (
                <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-4 mt-2 space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                    <span>Navigation HUD</span>
                    <button
                      onClick={() => setNavigating(false)}
                      className="text-red-400 hover:underline cursor-pointer"
                    >
                      Exit Mode
                    </button>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Step {currentStepIdx + 1} of {activeRoute.steps.length}</span>
                    <p className="text-sm font-bold leading-normal">{activeRoute.steps[currentStepIdx]?.instruction}</p>
                  </div>

                  <div className="flex justify-between items-center gap-2 pt-2 text-xs">
                    <button
                      type="button"
                      disabled={currentStepIdx === 0}
                      onClick={() => setCurrentStepIdx(prev => prev - 1)}
                      className="flex-1 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-750 text-white font-semibold rounded disabled:opacity-30 cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={currentStepIdx === activeRoute.steps.length - 1}
                      onClick={() => setCurrentStepIdx(prev => prev + 1)}
                      className="flex-1 py-2 bg-brand-secondary hover:bg-blue-700 text-white font-semibold rounded disabled:opacity-30 cursor-pointer"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              )}
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
                {currentBuilding?.name || 'SJT Ground Floor'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-brand-muted uppercase">Floor Level:</span>
              <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                <button className="px-3 py-1.5 rounded-md bg-white text-brand-primary shadow-sm text-xs font-semibold">Ground Floor</button>
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
            onSetStart={(loc) => {
              setFromLocation(loc);
              setFromQuery(loc.name);
            }}
            onSetEnd={(loc) => {
              setToLocation(loc);
              setToQuery(loc.name);
            }}
            locations={combinedLocations}
            corridors={corridors}
            doors={doors}
            stairs={stairs}
            lifts={lifts}
            exits={exits}
            waypoints={waypoints}
            hazards={hazards}
          />
        </div>

      </div>

    </div>
  );
}
