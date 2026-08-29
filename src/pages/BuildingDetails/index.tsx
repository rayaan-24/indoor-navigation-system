import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Layers, MapPin, Navigation, Eye, Clipboard } from 'lucide-react';
import { mockBuildings } from '../../data/mockBuildings';
import { mockLocations } from '../../data/mockLocations';
import IndoorMap from '../../components/map/IndoorMap';
import type { Location } from '../../types';

export default function BuildingDetails() {
  const { id } = useParams<{ id: string }>();
  const [building, setBuilding] = useState<typeof mockBuildings[0] | null>(null);
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<Location | null>(null);

  useEffect(() => {
    const foundB = mockBuildings.find(b => b.id === id);
    if (foundB) {
      setBuilding(foundB);
      setSelectedFloor(foundB.floors[0]);
    }
  }, [id]);

  if (!building) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold text-brand-primary">Building not found</h2>
        <p className="text-brand-muted text-sm mt-2">The building code you requested does not exist in our directory.</p>
        <Link to="/buildings" className="mt-5 inline-flex items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-2 px-4 text-xs shadow hover:bg-blue-700 transition-colors">
          Back to Buildings
        </Link>
      </div>
    );
  }

  // Filter locations for selected building & floor
  const floorLocations = mockLocations.filter(
    (loc) => loc.buildingId === building.id && loc.floor === selectedFloor
  );

  const roomsList = floorLocations.filter(
    (loc) => !['Staircase', 'Elevator', 'Restroom', 'Exit'].includes(loc.category)
  );

  const handleRoomClick = (room: Location) => {
    setSelectedRoom(room);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/buildings"
          className="inline-flex items-center text-xs font-semibold text-brand-muted hover:text-brand-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Buildings
        </Link>
      </div>

      {/* Building Title block */}
      <div className="pb-6 mb-8 border-b border-slate-200">
        <h1 className="text-3xl font-extrabold text-brand-primary">{building.name}</h1>
        <p className="text-brand-muted text-sm mt-1">{building.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Map controls & Floor plan (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          {/* Floor selector bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">Floors:</span>
              <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                {building.floors.map((fl) => (
                  <button
                    key={fl}
                    onClick={() => {
                      setSelectedFloor(fl);
                      setSelectedRoom(null); // Reset room details on floor change
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      selectedFloor === fl
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
              <span>Currently showing: <strong>{selectedFloor === 0 ? 'Ground Floor' : `Floor ${selectedFloor}`}</strong></span>
            </div>
          </div>

          {/* Interactive Map */}
          <IndoorMap
            buildingId={building.id}
            floor={selectedFloor}
            destinationId={selectedRoom?.id}
            onRoomClick={handleRoomClick}
          />
        </div>

        {/* Right Side: Floor directory & Room inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Room Inspector Panel */}
          {selectedRoom ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-brand-primary text-base">Room Details</h3>
                  <p className="text-[10px] text-brand-muted font-medium uppercase tracking-wider mt-0.5">{selectedRoom.category}</p>
                </div>
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="text-xs font-bold text-brand-muted hover:text-brand-accent-dest cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-lg font-bold text-brand-primary">{selectedRoom.name}</h4>
                  <p className="text-xs text-brand-muted flex items-center mt-0.5">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    <span>Floor {selectedRoom.floor} • {building.name}</span>
                  </p>
                </div>

                <p className="text-xs text-brand-muted leading-relaxed">{selectedRoom.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-brand-muted font-medium block">Capacity</span>
                    <span className="font-bold text-brand-primary">{selectedRoom.capacity || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-brand-muted font-medium block">Department</span>
                    <span className="font-bold text-brand-primary">{selectedRoom.department || 'General'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Link
                  to={`/explore?to=${encodeURIComponent(selectedRoom.name)}`}
                  className="flex-grow inline-flex items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-2 px-3 text-xs shadow hover:bg-blue-700 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 mr-1" />
                  Navigate Here
                </Link>
                <Link
                  to={`/locations/${selectedRoom.id}`}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-brand-primary hover:bg-slate-50 transition-colors"
                  title="View full details page"
                >
                  <Eye className="w-4 h-4" />
                </Link>
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-slate-200 border-dashed p-6 text-center text-xs text-brand-muted">
              <Clipboard className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p>Click any room on the map plan to inspect room capacity, department, and direct wayfinding links.</p>
            </div>
          )}

          {/* Floor Directory Rooms List */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-4 flex items-center">
              <Layers className="w-4 h-4 text-brand-secondary mr-2" />
              <span>Floor Directory ({roomsList.length})</span>
            </h3>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {roomsList.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all text-xs cursor-pointer ${
                    selectedRoom?.id === room.id
                      ? 'bg-blue-50 border-brand-secondary text-brand-primary font-bold shadow-sm'
                      : 'border-slate-100 hover:bg-slate-50 text-brand-primary hover:border-slate-200'
                  }`}
                >
                  <div>
                    <span>{room.name}</span>
                    <span className="text-[10px] text-brand-muted block font-normal">{room.category}</span>
                  </div>
                  <span className="text-[10px] text-brand-muted font-normal uppercase">FL {room.floor}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
