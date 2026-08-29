import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ZoomIn, ZoomOut, RotateCcw, Info, MapPin, Navigation } from 'lucide-react';
import type { Location } from '../../types';
import { mockLocations } from '../../data/mockLocations';

interface IndoorMapProps {
  buildingId: string;
  floor: number;
  currentLocationId?: string;
  destinationId?: string;
  routePathPoints?: { x: number; y: number }[];
  onRoomClick?: (location: Location) => void;
  onSetStart?: (location: Location) => void;
  onSetEnd?: (location: Location) => void;
  locations?: Location[];
}

export default function IndoorMap({
  buildingId,
  floor,
  currentLocationId,
  destinationId,
  routePathPoints = [],
  onRoomClick,
  onSetStart,
  onSetEnd,
  locations,
}: IndoorMapProps) {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredRoom, setHoveredRoom] = useState<Location | null>(null);
  const [inspectedRoom, setInspectedRoom] = useState<Location | null>(null);

  const containerRef = useRef<SVGSVGElement>(null);

  // Filter locations for current building & floor
  const floorLocations = (locations || mockLocations).filter(
    (loc) => loc.buildingId === buildingId && loc.floor === floor
  );

  // Separate standard rooms from infrastructure landmarks
  const rooms = floorLocations.filter(
    (loc) => !['Staircase', 'Elevator', 'Restroom', 'Exit', 'Entrance', 'Cafeteria', 'Reception'].includes(loc.category)
  );

  const landmarks = floorLocations.filter(
    (loc) => ['Staircase', 'Elevator', 'Restroom', 'Exit', 'Entrance', 'Cafeteria', 'Reception'].includes(loc.category)
  );

  // Handle Zooming
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.8));
  const handleReset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
    setInspectedRoom(null);
  };

  // Handle dragging (panning)
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // Prevent dragging when clicking buttons inside the overlay
    if ((e.target as HTMLElement).closest('.map-overlay')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Draw Corridor SVG Layout based on building floor
  const renderCorridors = () => {
    if (buildingId === 'block-b') {
      return (
        <g fill="none" stroke="#F1F5F9" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
          {/* Main vertical corridor */}
          <line x1="500" y1="300" x2="500" y2="700" />
          {/* Main horizontal corridors */}
          <line x1="150" y1="550" x2="850" y2="550" />
          <line x1="200" y1="300" x2="800" y2="300" />
        </g>
      );
    }
    // Block A
    return (
      <g fill="none" stroke="#F1F5F9" strokeWidth="50" strokeLinecap="round" opacity="0.8">
        <line x1="500" y1="200" x2="500" y2="800" />
        <line x1="200" y1="500" x2="800" y2="500" />
      </g>
    );
  };

  // Render icons for landmarks (Elevator, Stairs, Restroom)
  const renderLandmarkIcon = (category: string) => {
    switch (category) {
      case 'Elevator':
        return (
          <g fill="currentColor">
            <rect x="-8" y="-8" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M-4,-2 L0,-6 L4,-2 M-4,2 L0,6 L4,2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      case 'Staircase':
        return (
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="-8" y1="6" x2="8" y2="6" />
            <line x1="-8" y1="2" x2="4" y2="2" />
            <line x1="-8" y1="-2" x2="0" y2="-2" />
            <line x1="-8" y1="-6" x2="-4" y2="-6" />
            <path d="M8,6 L8,-6" />
          </g>
        );
      case 'Restroom':
        return (
          <g fill="currentColor">
            <circle cx="-3" cy="-5" r="2.5" />
            <path d="M-6,-2 C-6,-1 -5,2 -5,5 L-4,5 L-4,1 L-3,1 L-3,5 L-2,5 C-2,2 -1,-1 -1,-2 Z" />
            <circle cx="3" cy="-5" r="2.5" />
            <path d="M1,-2 L1,2 L2,2 L2,5 L4,5 L4,2 L5,2 L5,-2 C5,-3 4,-4 3,-4 C2,-4 1,-3 1,-2 Z" fillRule="evenodd" />
          </g>
        );
      case 'Exit':
      case 'Entrance':
        return (
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M-8,-4 L-2,-4 L-2,4 L-8,4" />
            <path d="M2,-3 L6,0 L2,3" />
            <line x1="-4" y1="0" x2="6" y2="0" />
          </g>
        );
      default:
        return <circle r="6" fill="currentColor" />;
    }
  };

  const handleRoomSelect = (room: Location) => {
    setInspectedRoom(room);
    onRoomClick?.(room);
  };

  return (
    <div className="relative w-full h-[520px] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      
      {/* Map Control Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex flex-col bg-white rounded-lg shadow-md border border-slate-200 p-1 space-y-1">
        <button
          onClick={handleZoomIn}
          className="p-2 text-brand-primary hover:bg-slate-100 rounded transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 text-brand-primary hover:bg-slate-100 rounded transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 text-brand-primary hover:bg-slate-100 rounded transition-colors cursor-pointer"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive inspected room popup sheet */}
      {inspectedRoom && (
        <div className="map-overlay absolute top-4 left-4 z-25 bg-white border border-slate-200 rounded-xl p-4 shadow-lg max-w-[260px] animate-fade-in space-y-3">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h4 className="font-bold text-xs text-brand-primary leading-tight">{inspectedRoom.name}</h4>
              <p className="text-[9px] text-brand-muted font-semibold mt-0.5 capitalize">Floor {inspectedRoom.floor} • {inspectedRoom.category}</p>
            </div>
            <button
              onClick={() => setInspectedRoom(null)}
              className="text-slate-400 hover:text-slate-655/40 text-slate-600 font-bold text-xs p-0.5 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex gap-2 text-[10px]">
            <button
              onClick={() => {
                if (onSetStart) onSetStart(inspectedRoom);
                setInspectedRoom(null);
              }}
              className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-brand-primary font-bold rounded cursor-pointer transition-colors"
            >
              Set Start
            </button>
            <button
              onClick={() => {
                if (onSetEnd) onSetEnd(inspectedRoom);
                setInspectedRoom(null);
              }}
              className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-brand-secondary font-bold rounded cursor-pointer transition-colors"
            >
              Set Destination
            </button>
            <Link
              to={`/locations/${inspectedRoom.id}`}
              className="py-1.5 px-2 border border-slate-250 hover:bg-slate-50 text-brand-muted font-bold rounded text-center border-slate-200"
            >
              Details
            </Link>
          </div>
        </div>
      )}

      {/* SVG Canvas Map Area */}
      <svg
        ref={containerRef}
        viewBox="0 0 1000 700"
        className={`w-full flex-grow select-none bg-slate-100/50 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Dynamic Zoom & Pan Group wrapper */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
          
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="1000" height="700" fill="url(#grid)" />

          {/* Corridor layout layer */}
          {renderCorridors()}

          {/* Rooms Layer */}
          {rooms.map((room) => {
            const isStart = currentLocationId === room.id;
            const isEnd = destinationId === room.id;
            const isSelected = isStart || isEnd || inspectedRoom?.id === room.id;

            // Room boxes coordinates (dynamic offsets from center)
            const rWidth = 140;
            const rHeight = 90;
            const rx = room.coordinates.x - rWidth / 2;
            const ry = room.coordinates.y - rHeight / 2;

            return (
              <g
                key={room.id}
                className="cursor-pointer group"
                onClick={() => handleRoomSelect(room)}
                onMouseEnter={() => setHoveredRoom(room)}
                onMouseLeave={() => setHoveredRoom(null)}
              >
                {/* Room Boundary Box */}
                <rect
                  x={rx}
                  y={ry}
                  width={rWidth}
                  height={rHeight}
                  rx="6"
                  className={`transition-all duration-200 ${
                    isStart
                      ? 'fill-emerald-50 stroke-brand-accent-loc stroke-3'
                      : isEnd
                      ? 'fill-red-50 stroke-brand-accent-dest stroke-3'
                      : inspectedRoom?.id === room.id
                      ? 'fill-blue-50/80 stroke-brand-secondary stroke-3'
                      : isSelected
                      ? 'fill-blue-50 stroke-brand-secondary stroke-2'
                      : 'fill-white stroke-slate-300 stroke-2 hover:fill-slate-50 hover:stroke-slate-400'
                  }`}
                />
                
                {/* Room label text */}
                <text
                  x={room.coordinates.x}
                  y={room.coordinates.y - 10}
                  textAnchor="middle"
                  className={`text-xs font-bold transition-colors ${
                    isStart
                      ? 'fill-emerald-800'
                      : isEnd
                      ? 'fill-red-800'
                      : 'fill-brand-primary group-hover:fill-brand-secondary'
                  }`}
                >
                  {room.name.split(' ').pop()} {/* Show room ID like B204 */}
                </text>
                
                <text
                  x={room.coordinates.x}
                  y={room.coordinates.y + 12}
                  textAnchor="middle"
                  className="text-[9px] fill-brand-muted tracking-tight font-medium"
                >
                  {room.category}
                </text>

                {/* Status indicator dots */}
                {isStart && (
                  <circle cx={room.coordinates.x} cy={room.coordinates.y + 28} r="4" className="fill-brand-accent-loc" />
                )}
                {isEnd && (
                  <circle cx={room.coordinates.x} cy={room.coordinates.y + 28} r="4" className="fill-brand-accent-dest" />
                )}
              </g>
            );
          })}

          {/* Landmarks Layer */}
          {landmarks.map((landmark) => {
            const isStart = currentLocationId === landmark.id;
            const isEnd = destinationId === landmark.id;
            
            return (
              <g
                key={landmark.id}
                transform={`translate(${landmark.coordinates.x}, ${landmark.coordinates.y})`}
                className="cursor-pointer group"
                onClick={() => handleRoomSelect(landmark)}
              >
                {/* Outer ring */}
                <circle
                  r="20"
                  className={`transition-all duration-200 ${
                    isStart
                      ? 'fill-emerald-50 stroke-brand-accent-loc stroke-2'
                      : isEnd
                      ? 'fill-red-50 stroke-brand-accent-dest stroke-2'
                      : 'fill-slate-100 stroke-slate-350 hover:fill-slate-200 stroke-slate-300'
                  }`}
                />
                
                {/* Icon wrapper */}
                <g className={`transition-colors ${
                  isStart
                    ? 'text-brand-accent-loc'
                    : isEnd
                    ? 'text-brand-accent-dest'
                    : 'text-brand-primary'
                }`}>
                  {renderLandmarkIcon(landmark.category)}
                </g>

                {/* Text Label */}
                <text
                  y="32"
                  textAnchor="middle"
                  className="text-[9px] font-semibold fill-brand-primary opacity-0 group-hover:opacity-100 transition-opacity bg-white px-1"
                >
                  {landmark.name}
                </text>
              </g>
            );
          })}

          {/* Route path Overlay */}
          {routePathPoints.length > 1 && (
            <g>
              {/* Outer stroke line */}
              <polyline
                points={routePathPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#2563EB"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="12, 6"
                className="animate-[dash_3s_linear_infinite]"
              />
              {/* Inner highlight line */}
              <polyline
                points={routePathPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#60A5FA"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />

              {/* Start Coordinate Circle Marker */}
              <circle
                cx={routePathPoints[0].x}
                cy={routePathPoints[0].y}
                r="9"
                fill="#10B981"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                className="shadow"
              />

              {/* End Coordinate Pin Marker */}
              <g transform={`translate(${routePathPoints[routePathPoints.length - 1].x}, ${routePathPoints[routePathPoints.length - 1].y})`}>
                <circle cx="0" cy="0" r="9" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
              </g>
            </g>
          )}

        </g>
      </svg>

      {/* SVG Animation stylesheet */}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -120;
          }
        }
      `}</style>

      {/* Legend & Hover Info Tooltip Bar */}
      <div className="bg-white border-t border-slate-200 px-4 py-3 flex flex-col md:flex-row items-center justify-between text-xs text-brand-primary gap-2">
        {hoveredRoom ? (
          <div className="flex items-center space-x-1">
            <Info className="w-3.5 h-3.5 text-brand-secondary" />
            <span><strong>{hoveredRoom.name}</strong> • Floor {hoveredRoom.floor} • {hoveredRoom.category}</span>
          </div>
        ) : (
          <span className="text-brand-muted">Click any room/amenity to select start/destination nodes. Drag to pan.</span>
        )}
        <div className="flex items-center space-x-3 text-brand-muted text-[10px] font-bold uppercase tracking-wider">
          <span className="flex items-center">
            <MapPin className="w-3 h-3 text-brand-accent-loc mr-1" /> Start
          </span>
          <span className="flex items-center">
            <Navigation className="w-3 h-3 text-brand-accent-dest mr-1" /> End
          </span>
          <span className="flex items-center">
            <span className="w-4 h-1 border-t-2 border-dashed border-blue-600 mr-1.5 inline-block"></span> Route
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 bg-slate-100 border border-slate-300 mr-1 rounded inline-block"></span> Amenity
          </span>
        </div>
      </div>
    </div>
  );
}
