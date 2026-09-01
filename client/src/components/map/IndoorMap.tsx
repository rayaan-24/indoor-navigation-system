import { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Info, MapPin, Navigation } from 'lucide-react';
import type { Location } from '../../types';

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
  corridors?: any[];
  doors?: any[];
  stairs?: any[];
  lifts?: any[];
  exits?: any[];
  waypoints?: any[];
  hazards?: any[];
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
  locations = [],
  corridors = [],
  doors = [],
  stairs = [],
  lifts = [],
  exits = [],
}: IndoorMapProps) {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredRoom, setHoveredRoom] = useState<Location | null>(null);
  const [inspectedRoom, setInspectedRoom] = useState<Location | null>(null);

  const containerRef = useRef<SVGSVGElement>(null);

  // Filter locations for current building & floor
  const floorLocations = locations.filter(
    (loc) => loc.buildingId === buildingId && loc.floor === floor
  );

  // Separate standard rooms from infrastructure landmarks
  const rooms = floorLocations.filter(
    (loc) => !['Staircase', 'Elevator', 'Restroom', 'Exit', 'Entrance', 'Cafeteria', 'Reception'].includes(loc.category)
  );

  // Handle Zooming
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3.5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.75));
  const handleReset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
    setInspectedRoom(null);
  };

  // Handle dragging (panning)
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
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

  const handleRoomSelect = (room: Location) => {
    setInspectedRoom(room);
    onRoomClick?.(room);
  };

  return (
    <div className="relative w-full h-[640px] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col select-none">
      
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
        <div className="map-overlay absolute top-4 left-4 z-25 bg-white border border-slate-200 rounded-xl p-4 shadow-lg max-w-[280px] animate-fade-in space-y-3">
          <div className="flex justify-between items-start gap-2">
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 font-extrabold text-[10px] rounded">
                  {inspectedRoom.id}
                </span>
                <h4 className="font-bold text-xs text-brand-primary leading-tight">{inspectedRoom.name}</h4>
              </div>
              <p className="text-[10px] text-brand-muted font-medium mt-1">
                Floor {inspectedRoom.floor} • {inspectedRoom.category}
              </p>
            </div>
            <button
              onClick={() => setInspectedRoom(null)}
              className="text-slate-400 hover:text-slate-600 font-bold text-xs p-0.5 cursor-pointer"
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
              className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded cursor-pointer transition-colors border border-emerald-200"
            >
              Set Start
            </button>
            <button
              onClick={() => {
                if (onSetEnd) onSetEnd(inspectedRoom);
                setInspectedRoom(null);
              }}
              className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-brand-secondary font-bold rounded cursor-pointer transition-colors border border-blue-200"
            >
              Set Destination
            </button>
          </div>
        </div>
      )}

      {/* SVG Canvas Map Area */}
      <svg
        ref={containerRef}
        viewBox="0 0 1440 1128"
        preserveAspectRatio="xMidYMid meet"
        className={`w-full flex-grow select-none bg-slate-100/50 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Dynamic Zoom & Pan Group wrapper */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
          
          {/* Background Grid Pattern */}
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="1440" height="1128" fill="url(#grid)" />

          {/* 1. Walkable Corridors Layout Layer */}
          {corridors.map((c) => (
            <rect
              key={c.corridorId}
              x={c.x * 12}
              y={c.y * 12}
              width={c.width * 12}
              height={c.height * 12}
              fill="#F8FAFC"
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
          ))}

          {/* 2. Room Compartments Layer */}
          {rooms.map((room) => {
            const isStart = currentLocationId === room.id;
            const isEnd = destinationId === room.id;
            const isInspected = inspectedRoom?.id === room.id;

            // Room dimensions (scaled 1 unit = 12 pixels)
            const rx = room.coordinates.x * 12;
            const ry = room.coordinates.y * 12;
            
            const rawRoom = locations.find(l => l.id === room.id) as any;
            const rw = (rawRoom?.width || 8.0) * 12;
            const rh = (rawRoom?.height || 10.0) * 12;

            return (
              <g
                key={room.id}
                className="cursor-pointer group"
                onClick={() => handleRoomSelect(room)}
                onMouseEnter={() => setHoveredRoom(room)}
                onMouseLeave={() => setHoveredRoom(null)}
              >
                {/* Room Boundary Rect */}
                <rect
                  x={rx}
                  y={ry}
                  width={rw}
                  height={rh}
                  rx="6"
                  className={`transition-all duration-200 ${
                    isStart
                      ? 'fill-emerald-50 stroke-emerald-600 stroke-[3.5]'
                      : isEnd
                      ? 'fill-blue-50 stroke-blue-600 stroke-[3.5]'
                      : isInspected
                      ? 'fill-blue-50/70 stroke-blue-500 stroke-2'
                      : 'fill-white stroke-slate-300 stroke-1.5 hover:fill-slate-50 hover:stroke-slate-400'
                  }`}
                />
                
                {/* Centered Room ID Label */}
                <text
                  x={rx + rw / 2}
                  y={ry + rh / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-[10px] font-extrabold select-none ${
                    isStart
                      ? 'fill-emerald-900'
                      : isEnd
                      ? 'fill-blue-900'
                      : 'fill-slate-800 group-hover:fill-blue-600'
                  }`}
                >
                  {room.id}
                </text>

                {/* Destination Badge Indicator inside room */}
                {isEnd && (
                  <g transform={`translate(${rx + rw - 16}, ${ry + 16})`}>
                    <circle cx="0" cy="0" r="8" fill="#2563EB" />
                    <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" className="text-[7px] font-bold">
                      ★
                    </text>
                  </g>
                )}

                {/* Start Badge Indicator inside room */}
                {isStart && (
                  <g transform={`translate(${rx + rw - 16}, ${ry + 16})`}>
                    <circle cx="0" cy="0" r="8" fill="#10B981" />
                    <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" className="text-[7px] font-bold">
                      ●
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* 3. Door Entryways Layer */}
          {doors.map((d) => (
            <rect
              key={d.doorId}
              x={d.x * 12}
              y={d.y * 12}
              width={d.width * 12}
              height={d.height * 12}
              fill="#475569"
              stroke="#FFFFFF"
              strokeWidth="0.5"
            />
          ))}

          {/* 4. Stairs Block Boxes */}
          {stairs.map((s) => (
            <g key={s.stairId} transform={`translate(${s.x * 12}, ${s.y * 12})`}>
              <rect
                width={s.width * 12}
                height={s.height * 12}
                rx="4"
                fill="#EDF2F7"
                stroke="#94A3B8"
                strokeWidth="2"
              />
              <line x1="2" y1="2" x2={(s.width * 12) - 2} y2={(s.height * 12) - 2} stroke="#64748B" strokeWidth="2" />
              <text
                x={(s.width * 12) / 2}
                y={(s.height * 12) / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[8px] fill-slate-700 font-extrabold select-none"
              >
                {s.stairId}
              </text>
            </g>
          ))}

          {/* 5. Lifts Block Boxes */}
          {lifts.map((l) => (
            <g key={l.liftId} transform={`translate(${l.x * 12}, ${l.y * 12})`}>
              <rect
                width={l.width * 12}
                height={l.height * 12}
                rx="4"
                fill="#EFF6FF"
                stroke="#3B82F6"
                strokeWidth="2"
              />
              <text
                x={(l.width * 12) / 2}
                y={(l.height * 12) / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[8px] fill-blue-800 font-extrabold select-none"
              >
                LIFT
              </text>
            </g>
          ))}

          {/* 6. Exits Block Boxes */}
          {exits.map((e) => (
            <g 
              key={e.exitId} 
              transform={`translate(${e.x * 12}, ${e.y * 12})`}
              className="cursor-pointer group"
              onClick={() => onRoomClick?.({ id: e.exitId, name: e.name, category: 'Exit', buildingId, floor, description: e.name, coordinates: { x: e.x, y: e.y } })}
            >
              <rect
                width={e.width * 12}
                height={e.height * 12}
                rx="4"
                fill="#DCFCE7"
                stroke="#16A34A"
                strokeWidth="2.5"
                className="hover:fill-green-100 transition-colors"
              />
              <text
                x={(e.width * 12) / 2}
                y={(e.height * 12) / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[8px] fill-green-800 font-extrabold select-none"
              >
                EXIT {e.exitId}
              </text>
            </g>
          ))}

          {/* 7. Route Path Overlay strictly connecting Door-to-Door along Corridors */}
          {routePathPoints.length > 1 && (
            <g>
              {/* Outer glowing trace line */}
              <polyline
                points={routePathPoints.map((p) => `${p.x * 12},${p.y * 12}`).join(' ')}
                fill="none"
                stroke="#2563EB"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="14, 8"
                className="animate-[dash_3.5s_linear_infinite]"
              />
              
              {/* Inner crisp line */}
              <polyline
                points={routePathPoints.map((p) => `${p.x * 12},${p.y * 12}`).join(' ')}
                fill="none"
                stroke="#60A5FA"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.95"
              />

              {/* Start Door Coordinate Indicator Marker */}
              <g transform={`translate(${routePathPoints[0].x * 12}, ${routePathPoints[0].y * 12})`}>
                <circle cx="0" cy="0" r="10" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" />
              </g>

              {/* Destination Door Coordinate Pin Marker */}
              <g transform={`translate(${routePathPoints[routePathPoints.length - 1].x * 12}, ${routePathPoints[routePathPoints.length - 1].y * 12})`}>
                <circle cx="0" cy="0" r="10" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" />
              </g>
            </g>
          )}

        </g>
      </svg>

      {/* SVG Path animation style */}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -120;
          }
        }
      `}</style>

      {/* Legend Tooltip Info Bar */}
      <div className="bg-white border-t border-slate-200 px-4 py-3 flex flex-col md:flex-row items-center justify-between text-xs text-brand-primary gap-2">
        {hoveredRoom ? (
          <div className="flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-brand-secondary" />
            <span><strong>{hoveredRoom.id} • {hoveredRoom.name}</strong> (Floor {hoveredRoom.floor} • {hoveredRoom.category})</span>
          </div>
        ) : (
          <span className="text-brand-muted">Click any room or door to inspect and navigate.</span>
        )}
        <div className="flex items-center space-x-3 text-brand-muted text-[10px] font-bold uppercase tracking-wider">
          <span className="flex items-center">
            <MapPin className="w-3 h-3 text-emerald-600 mr-1" /> Start Door
          </span>
          <span className="flex items-center">
            <Navigation className="w-3 h-3 text-red-500 mr-1" /> Dest Door
          </span>
          <span className="flex items-center font-bold text-blue-700">
            [SJT GROUND FLOOR - 120m × 94m]
          </span>
        </div>
      </div>
    </div>
  );
}
