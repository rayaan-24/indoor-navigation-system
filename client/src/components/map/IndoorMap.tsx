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
  waypoints = [],
  hazards = [],
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
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.8));
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

  // Helper map coordinates lookup for active hazards positioning
  const waypointMap: Record<string, { x: number; y: number }> = {};
  waypoints.forEach(wp => {
    waypointMap[wp.waypointId] = { x: wp.x, y: wp.y };
  });
  exits.forEach(ex => {
    waypointMap[ex.exitId] = { x: ex.x, y: ex.y };
  });

  const findElementRect = (id: string) => {
    const corr = corridors.find(c => c.corridorId === id);
    if (corr) return { x: corr.x, y: corr.y, w: corr.width, h: corr.height };

    const rm = rooms.find(r => r.id === id);
    if (rm) return { x: rm.coordinates.x, y: rm.coordinates.y, w: 8.0, h: 10.0 }; // estimate dimensions for standard room if missing

    const st = stairs.find(s => s.stairId === id);
    if (st) return { x: st.x, y: st.y, w: st.width, h: st.height };

    const lf = lifts.find(l => l.liftId === id);
    if (lf) return { x: lf.x, y: lf.y, w: lf.width, h: lf.height };

    const ex = exits.find(e => e.exitId === id);
    if (ex) return { x: ex.x, y: ex.y, w: ex.width, h: ex.height };

    return null;
  };

  return (
    <div className="relative w-full h-[620px] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      
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
              Set Dest
            </button>
          </div>
        </div>
      )}

      {/* SVG Canvas Map Area */}
      <svg
        ref={containerRef}
        viewBox="0 0 1440 1128"
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
              stroke="#E2E8F0"
              strokeWidth="1.5"
            />
          ))}

          {/* 2. Room Compartments Layer */}
          {rooms.map((room) => {
            const isStart = currentLocationId === room.id;
            const isEnd = destinationId === room.id;
            const isSelected = isStart || isEnd || inspectedRoom?.id === room.id;

            // Room dimensions
            const rx = room.coordinates.x * 12;
            const ry = room.coordinates.y * 12;
            
            // Look up seeded room dimension fields or default
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
                <rect
                  x={rx}
                  y={ry}
                  width={rw}
                  height={rh}
                  rx="6"
                  className={`transition-all duration-200 ${
                    isStart
                      ? 'fill-emerald-50 stroke-emerald-600 stroke-3'
                      : isEnd
                      ? 'fill-red-50 stroke-red-600 stroke-3'
                      : inspectedRoom?.id === room.id
                      ? 'fill-blue-50/80 stroke-blue-600 stroke-3'
                      : isSelected
                      ? 'fill-blue-50 stroke-blue-500 stroke-2'
                      : 'fill-white stroke-slate-300 stroke-1.5 hover:fill-slate-50 hover:stroke-slate-400'
                  }`}
                />
                
                {/* Room label text */}
                <text
                  x={rx + rw / 2}
                  y={ry + rh / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-[9px] font-bold transition-colors select-none ${
                    isStart
                      ? 'fill-emerald-800'
                      : isEnd
                      ? 'fill-red-800'
                      : 'fill-slate-800 group-hover:fill-blue-600'
                  }`}
                >
                  {room.id}
                </text>
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

          {/* 7. Route Path Overlay */}
          {routePathPoints.length > 1 && (
            <g>
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
              <polyline
                points={routePathPoints.map((p) => `${p.x * 12},${p.y * 12}`).join(' ')}
                fill="none"
                stroke="#60A5FA"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
              />

              {/* Start Coordinate Circle Marker */}
              <circle
                cx={routePathPoints[0].x * 12}
                cy={routePathPoints[0].y * 12}
                r="11"
                fill="#10B981"
                stroke="#FFFFFF"
                strokeWidth="3"
              />

              {/* End Coordinate Pin Marker */}
              <g transform={`translate(${routePathPoints[routePathPoints.length - 1].x * 12}, ${routePathPoints[routePathPoints.length - 1].y * 12})`}>
                <circle cx="0" cy="0" r="11" fill="#EF4444" stroke="#FFFFFF" strokeWidth="3" />
                <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
              </g>
            </g>
          )}

          {/* 8. Pulse Warning Emergency Hazards Overlay */}
          {hazards.map((h, idx) => {
            let cx = 0;
            let cy = 0;
            let radius = h.radius || 3.0;
            if (h.type === 'FIRE') radius = 5.0; // 2m + 3m safety zone
            else if (h.type === 'GAS') radius = 3.0;

            const rect = findElementRect(h.locationId);
            if (rect) {
              cx = (rect.x + rect.w / 2) * 12;
              cy = (rect.y + rect.h / 2) * 12;
            } else if (waypointMap[h.locationId]) {
              cx = waypointMap[h.locationId].x * 12;
              cy = waypointMap[h.locationId].y * 12;
            } else if (h.x && h.y) {
              cx = h.x * 12;
              cy = h.y * 12;
            } else {
              return null;
            }

            const color = h.type === 'FIRE' ? '#EF4444' : h.type === 'GAS' ? '#F59E0B' : h.type === 'BLOCKAGE' ? '#B91C1C' : '#8B5CF6';

            return (
              <g key={h._id || idx}>
                {/* Semi-transparent pulsing danger zone */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={radius * 12}
                  fill={color}
                  fillOpacity="0.25"
                  stroke={color}
                  strokeWidth="2"
                  strokeDasharray="4, 4"
                  className="animate-pulse"
                />
                
                {/* Central Warning Badge */}
                <circle cx={cx} cy={cy} r="10" fill={color} stroke="#FFFFFF" strokeWidth="1.5" />
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#FFFFFF"
                  className="text-[9px] font-extrabold select-none"
                >
                  !
                </text>
              </g>
            );
          })}

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
          <div className="flex items-center space-x-1">
            <Info className="w-3.5 h-3.5 text-brand-secondary" />
            <span><strong>{hoveredRoom.name}</strong> • Floor {hoveredRoom.floor} • {hoveredRoom.category}</span>
          </div>
        ) : (
          <span className="text-brand-muted">Click any room to inspect. Pulse circles indicate active hazard zones.</span>
        )}
        <div className="flex items-center space-x-3 text-brand-muted text-[10px] font-bold uppercase tracking-wider">
          <span className="flex items-center">
            <MapPin className="w-3 h-3 text-emerald-600 mr-1" /> Start
          </span>
          <span className="flex items-center">
            <Navigation className="w-3 h-3 text-red-500 mr-1" /> Dest
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-red-100 border border-red-500 mr-1 rounded-full inline-block animate-pulse"></span> Hazard
          </span>
          <span className="flex items-center font-bold text-green-700">
            [SJT GROUND FLOOR]
          </span>
        </div>
      </div>
    </div>
  );
}
