import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, ArrowRight, Clock, Map, Layers, Accessibility } from 'lucide-react';
import { mockLocations } from '../../data/mockLocations';
import { mockRoutes } from '../../data/mockRoutes';
import { mockBuildings } from '../../data/mockBuildings';
import IndoorMap from '../../components/map/IndoorMap';
import type { Location, Route } from '../../types';

export default function Explore() {
  const [searchParams] = useSearchParams();

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

  // Parse query params (e.g., from home page redirects)
  useEffect(() => {
    const toParam = searchParams.get('to');
    const searchParam = searchParams.get('search');

    if (toParam) {
      const match = mockLocations.find(l => l.name.toLowerCase() === toParam.toLowerCase());
      if (match) {
        setToLocation(match);
        setToQuery(match.name);
        setSelectedBuildingId(match.buildingId);
        setCurrentFloor(match.floor);
      }
    } else if (searchParam) {
      const match = mockLocations.find(l => 
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
    const defaultStart = mockLocations.find(l => l.id === 'b-entrance');
    if (defaultStart) {
      setFromLocation(defaultStart);
      setFromQuery(defaultStart.name);
    }
  }, [searchParams]);

  // Autocomplete filter for "From"
  useEffect(() => {
    if (fromQuery.trim().length > 1 && (!fromLocation || fromLocation.name !== fromQuery)) {
      const filtered = mockLocations.filter(loc =>
        loc.name.toLowerCase().includes(fromQuery.toLowerCase()) &&
        loc.buildingId === selectedBuildingId
      );
      setFromSuggestions(filtered);
    } else {
      setFromSuggestions([]);
    }
  }, [fromQuery, selectedBuildingId, fromLocation]);

  // Autocomplete filter for "To"
  useEffect(() => {
    if (toQuery.trim().length > 1 && (!toLocation || toLocation.name !== toQuery)) {
      const filtered = mockLocations.filter(loc =>
        loc.name.toLowerCase().includes(toQuery.toLowerCase()) &&
        loc.buildingId === selectedBuildingId
      );
      setToSuggestions(filtered);
    } else {
      setToSuggestions([]);
    }
  }, [toQuery, selectedBuildingId, toLocation]);

  // Calculate Route action
  const handleFindRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromLocation || !toLocation) return;

    // Search pre-calculated routes
    const routeKey = `${fromLocation.id}-to-${toLocation.id}`;
    const foundRoute = mockRoutes.find(r => r.id === routeKey || 
      (r.fromLocationId === fromLocation.id && r.toLocationId === toLocation.id)
    );

    if (foundRoute) {
      // Modify steps if wheelchair-accessible route requested
      let updatedRoute = { ...foundRoute };
      if (avoidStairs) {
        updatedRoute.steps = foundRoute.steps.map(step => {
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

      // Save to mock navigation history
      const historyItem = {
        id: Math.random().toString(36).substr(2, 9),
        fromLocation: { name: fromLocation.name, building: fromLocation.buildingId, floor: `Floor ${fromLocation.floor}` },
        toLocation: { name: toLocation.name, building: toLocation.buildingId, floor: `Floor ${toLocation.floor}` },
        timestamp: new Date().toLocaleString(),
      };
      const existingHistory = JSON.parse(localStorage.getItem('navHistory') || '[]');
      localStorage.setItem('navHistory', JSON.stringify([historyItem, ...existingHistory].slice(0, 10)));
    } else {
      // Mock route fallback for any other selections in current building
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
  };

  const handleRoomClick = (room: Location) => {
    // If we don't have start, or if To is already filled, set as destination
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

  const currentBuilding = mockBuildings.find(b => b.id === selectedBuildingId);

  // Get coordinates for active floor
  const activeFloorPath = activeRoute?.pathPoints[currentFloor] || [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-primary">Explore & Navigate</h1>
          <p className="text-brand-muted text-sm mt-1">Select locations on the floor plan or search to generate directions.</p>
        </div>

        {/* Building Selector */}
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Active Building:</label>
          <select
            value={selectedBuildingId}
            onChange={(e) => {
              setSelectedBuildingId(e.target.value);
              setCurrentFloor(0);
              handleClearRoute();
              // Reset start location to entrance of selected building
              const entrance = mockLocations.find(l => l.buildingId === e.target.value && l.category === 'Exit');
              if (entrance) {
                setFromLocation(entrance);
                setFromQuery(entrance.name);
              } else {
                setFromLocation(null);
                setFromQuery('');
              }
            }}
            className="rounded-lg border border-slate-250 bg-white px-3 py-2 text-sm font-medium text-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-secondary border-slate-200"
          >
            {mockBuildings.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Search & Routing Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-brand-primary mb-4 flex items-center">
              <Navigation className="w-5 h-5 text-brand-secondary mr-2" />
              <span>Wayfinding Route Finder</span>
            </h2>

            <form onSubmit={handleFindRoute} className="space-y-4">
              {/* FROM Input */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">Start Location</label>
                <div className="flex items-center border border-slate-300 rounded-lg focus-within:border-brand-secondary px-3 py-2 bg-slate-50 focus-within:bg-white transition-colors">
                  <MapPin className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search start location..."
                    value={fromQuery}
                    onChange={(e) => setFromQuery(e.target.value)}
                    className="w-full text-sm text-brand-primary bg-transparent focus:outline-none"
                  />
                </div>

                {/* Autocomplete Dropdown */}
                {fromSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-30 overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {fromSuggestions.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          setFromLocation(loc);
                          setFromQuery(loc.name);
                          setFromSuggestions([]);
                        }}
                        className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 text-brand-primary font-medium"
                      >
                        {loc.name} <span className="text-[10px] text-brand-muted font-normal">(Floor {loc.floor})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* TO Input */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">Destination</label>
                <div className="flex items-center border border-slate-300 rounded-lg focus-within:border-brand-secondary px-3 py-2 bg-slate-50 focus-within:bg-white transition-colors">
                  <MapPin className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search destination..."
                    value={toQuery}
                    onChange={(e) => setToQuery(e.target.value)}
                    className="w-full text-sm text-brand-primary bg-transparent focus:outline-none"
                  />
                </div>

                {/* Autocomplete Dropdown */}
                {toSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-30 overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {toSuggestions.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          setToLocation(loc);
                          setToQuery(loc.name);
                          setToSuggestions([]);
                        }}
                        className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 text-brand-primary font-medium"
                      >
                        {loc.name} <span className="text-[10px] text-brand-muted font-normal">(Floor {loc.floor})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Accessibility Settings */}
              <div className="pt-2">
                <label className="flex items-center text-xs font-medium text-brand-primary select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={avoidStairs}
                    onChange={(e) => {
                      setAvoidStairs(e.target.checked);
                      if (activeRoute) {
                        // Re-trigger route logic to replace stairs
                        setTimeout(() => handleFindRoute(e as any), 10);
                      }
                    }}
                    className="rounded text-brand-secondary focus:ring-brand-secondary mr-2 h-4 w-4 border-slate-350"
                  />
                  <Accessibility className="w-4 h-4 text-brand-muted mr-1.5" />
                  <span>Accessible route (avoid stairs / use elevator)</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!fromLocation || !toLocation}
                  className="flex-grow inline-flex items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-2.5 px-4 text-sm shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Find Route
                </button>
                {activeRoute && (
                  <button
                    type="button"
                    onClick={handleClearRoute}
                    className="px-3 border border-slate-200 hover:bg-slate-50 text-brand-muted hover:text-brand-accent-dest rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                    title="Clear route"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Route details step-by-step panel */}
          {activeRoute && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 max-h-[420px] overflow-y-auto">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-brand-primary">Route Found</h3>
                  <p className="text-xs text-brand-muted mt-0.5">
                    From {fromLocation?.name.split(' ').pop()} to {toLocation?.name.split(' ').pop()}
                  </p>
                </div>
                <div className="flex gap-3 text-xs font-semibold text-brand-primary">
                  <span className="flex items-center bg-slate-100 px-2 py-1 rounded">
                    <Map className="w-3.5 h-3.5 mr-1 text-brand-secondary" />
                    {activeRoute.distance} m
                  </span>
                  <span className="flex items-center bg-slate-100 px-2 py-1 rounded">
                    <Clock className="w-3.5 h-3.5 mr-1 text-brand-secondary" />
                    {activeRoute.duration} min
                  </span>
                </div>
              </div>

              {/* Floor alert if multi-floor */}
              {fromLocation && toLocation && fromLocation.floor !== toLocation.floor && (
                <div className="p-3 bg-amber-50 rounded-lg text-amber-800 text-xs flex items-start">
                  <Layers className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Multi-Floor Route:</span> This navigation traverses levels. Use the floor tabs above the map to view the layout at each stage of your route.
                  </div>
                </div>
              )}

              {/* Steps List */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted">Directions</h4>
                <ol className="relative border-l border-slate-200 ml-2.5 space-y-4 text-xs">
                  {activeRoute.steps.map((step, idx) => (
                    <li key={idx} className="relative pl-6">
                      {/* Step Indicator Bullet */}
                      <span className={`absolute left-[-6px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white text-[8px] font-bold text-white shadow ${
                        step.type === 'destination'
                          ? 'bg-brand-accent-dest'
                          : step.type === 'up-stairs' || step.type === 'elevator'
                          ? 'bg-brand-warning'
                          : 'bg-brand-secondary'
                      }`}>
                        {idx + 1}
                      </span>
                      
                      <div className="space-y-1">
                        <p className="font-medium text-brand-primary leading-normal">{step.instruction}</p>
                        
                        {/* Floor transition action trigger button */}
                        {step.floor !== undefined && currentFloor !== step.floor && (
                          <button
                            onClick={() => setCurrentFloor(step.floor!)}
                            className="inline-flex items-center text-[10px] text-brand-secondary hover:underline font-bold mt-1 cursor-pointer"
                          >
                            <span>Switch map to Floor {step.floor}</span>
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Map & Interactive Controls (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          {/* Floor Tabs & Floor Details Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">Floors:</span>
              <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                {currentBuilding?.floors.map((fl) => (
                  <button
                    key={fl}
                    onClick={() => setCurrentFloor(fl)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      currentFloor === fl
                        ? 'bg-white text-brand-primary shadow-sm'
                        : 'text-brand-muted hover:text-brand-primary'
                    }`}
                  >
                    {fl === 0 ? 'Ground' : `${fl}st`}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-brand-muted font-medium">
              <span>Viewing: <strong>{currentBuilding?.name}</strong> • <strong>{currentFloor === 0 ? 'Ground Floor' : `Floor ${currentFloor}`}</strong></span>
            </div>
          </div>

          {/* Interactive Map Wrapper */}
          <IndoorMap
            buildingId={selectedBuildingId}
            floor={currentFloor}
            currentLocationId={fromLocation?.id}
            destinationId={toLocation?.id}
            routePathPoints={activeFloorPath}
            onRoomClick={handleRoomClick}
          />
          
          {/* Quick Guidance Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start text-xs text-brand-primary">
            <InfoIcon className="w-4.5 h-4.5 text-brand-secondary mr-2.5 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">Map Interactive Tips</p>
              <p className="text-brand-muted">You can click rooms directly on the floor layout above. The first room sets your starting coordinate, and the second room sets the target destination. Use the top-right toolbar to zoom or reset the layout view.</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

// Inline InfoIcon helper to replace lucide
function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
