import { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react';
import type { Location } from '../../types';
import { mockLocations } from '../../data/mockLocations';

interface IndoorMapProps {
  buildingId: string;
  floor: number;
  currentLocationId?: string;
  destinationId?: string;
  routePathPoints?: { x: number; y: number }[];
  onRoomClick?: (location: Location) => void;
  locations?: Location[];
}

export default function IndoorMap({
  buildingId,
  floor,
  currentLocationId,
  destinationId,
  routePathPoints = [],
  onRoomClick,
  locations,
}: IndoorMapProps) {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredRoom, setHoveredRoom] = useState<Location | null>(null);

  const containerRef = useRef<SVGSVGElement>(null);

  // Filter locations for current building & floor
  const floorLocations = (locations || mockLocations).filter(
    (loc) => loc.buildingId === buildingId && loc.floor === floor
  );

  // Separate standard rooms from infrastructure landmarks
  const rooms = floorLocations.filter(
    (loc) => !['Staircase', 'Elevator', 'Restroom', 'Exit'].includes(loc.category)
  );

  const landmarks = floorLocations.filter(
    (loc) => ['Staircase', 'Elevator', 'Restroom', 'Exit'].includes(loc.category)
  );

  // Handle Zooming
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.8));
  const handleReset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  // Handle dragging (panning)
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
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
        <g fill="none" stroke="#E2E8F0" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
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
      <g fill="none" stroke="#E2E8F0" strokeWidth="50" strokeLinecap="round" opacity="0.6">
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

  return (
    <div className="relative w-full h-[500px] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Map Control Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex flex-col bg-white rounded-lg shadow-md border border-slate-200 p-1 space-y-1">
        <button
          onClick={handleZoomIn}
          className="p-2 text-brand-primary hover:bg-slate-100 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 text-brand-primary hover:bg-slate-100 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 text-brand-primary hover:bg-slate-100 rounded transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* SVG Canvas Map Area */}
      <svg
        ref={containerRef}
        viewBox="0 0 1000 700"
        className={`w-full flex-grow select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
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
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="1000" height="700" fill="url(#grid)" />

          {/* Corridor layout layer */}
          {renderCorridors()}

          {/* Rooms Layer */}
          {rooms.map((room) => {
            const isSelected = currentLocationId === room.id || destinationId === room.id;
            const isStart = currentLocationId === room.id;
            const isEnd = destinationId === room.id;

            // Room boxes coordinates (dynamic offsets from center)
            const rWidth = 140;
            const rHeight = 90;
            const rx = room.coordinates.x - rWidth / 2;
            const ry = room.coordinates.y - rHeight / 2;

            return (
              <g
                key={room.id}
                className="cursor-pointer group"
                onClick={() => onRoomClick?.(room)}
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

          {/* Landmarks / Amenities Layer */}
          {landmarks.map((landmark) => {
            const isStart = currentLocationId === landmark.id;
            const isEnd = destinationId === landmark.id;
            
            return (
              <g
                key={landmark.id}
                transform={`translate(${landmark.coordinates.x}, ${landmark.coordinates.y})`}
                className="cursor-pointer group"
                onClick={() => onRoomClick?.(landmark)}
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

      {/* Hover Info Tooltip Bar */}
      <div className="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-brand-primary">
        {hoveredRoom ? (
          <div className="flex items-center space-x-1">
            <Info className="w-3.5 h-3.5 text-brand-secondary" />
            <span><strong>{hoveredRoom.name}</strong> • Floor {hoveredRoom.floor} • {hoveredRoom.category}</span>
          </div>
        ) : (
          <span className="text-brand-muted">Use mouse drag to pan, wheel to zoom. Click rooms/icons to inspect.</span>
        )}
        <div className="flex items-center space-x-2 text-brand-muted">
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-accent-loc mr-1"></span> Start
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-accent-dest mr-1"></span> Destination
          </span>
        </div>
      </div>
    </div>
  );
}
