import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Layers, MapPin, Navigation, Eye, Clipboard, AlertCircle } from 'lucide-react';
import { getBuildingById, getBuildingFloors, getBuildingRooms } from '../../services/buildingService';
import { getLandmarks } from '../../services/landmarkService';
import IndoorMap from '../../components/map/IndoorMap';
import type { Location } from '../../types';

interface BuildingBackendData {
  _id: string;
  name: string;
  code: string;
  description: string;
  numberOfFloors: number;
  numberOfLocations: number;
}

export default function BuildingDetails() {
  const { id } = useParams<{ id: string }>();
  const [building, setBuilding] = useState<BuildingBackendData | null>(null);
  const [floors, setFloors] = useState<any[]>([]);
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [rooms, setRooms] = useState<any[]>([]);
  const [landmarks, setLandmarks] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch Building metadata, Floors, Rooms, and Landmarks
  useEffect(() => {
    const fetchBuildingData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError('');
        
        // 1. Fetch building by code/id
        const bRes = await getBuildingById(id);
        if (!bRes.success) {
          setError('Building not found.');
          setLoading(false);
          return;
        }
        const bData = bRes.data;
        setBuilding(bData);

        // 2. Fetch floors for building
        const fRes = await getBuildingFloors(bData._id);
        if (fRes.success) {
          const sortedFloors = fRes.data.sort((a: any, b: any) => a.floorNumber - b.floorNumber);
          setFloors(sortedFloors);
          if (sortedFloors.length > 0) {
            setSelectedFloor(sortedFloors[0].floorNumber);
          }
        }

        // 3. Fetch rooms for building
        const rRes = await getBuildingRooms(bData._id);
        if (rRes.success) {
          setRooms(rRes.data);
        }

        // 4. Fetch landmarks
        const lRes = await getLandmarks();
        if (lRes.success) {
          // Filter landmarks for this building
          const filteredLandmarks = lRes.data.filter((l: any) => l.buildingId?._id === bData._id || l.buildingId === bData._id);
          setLandmarks(filteredLandmarks);
        }

      } catch (err: any) {
        console.error('Error fetching building details:', err);
        setError('Unable to load building floor plans. Check server connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchBuildingData();
  }, [id]);

  // Combine rooms and landmarks on the active floor into the Location type array
  const activeLocationsList: Location[] = (() => {
    if (!building) return [];
    
    // Find active floor _id
    const activeFloorObj = floors.find(f => f.floorNumber === selectedFloor);
    if (!activeFloorObj) return [];

    const activeRooms = rooms.filter(r => r.floorId === activeFloorObj._id || r.floorId?._id === activeFloorObj._id);
    const activeLandmarks = landmarks.filter(l => l.floorId === activeFloorObj._id || l.floorId?._id === activeFloorObj._id);

    const roomsMapped: Location[] = activeRooms.map(r => ({
      id: r.roomNumber || r._id,
      name: r.name,
      category: r.roomType,
      buildingId: building.code,
      floor: selectedFloor,
      description: r.description || '',
      capacity: r.capacity || '',
      department: r.department || '',
      coordinates: r.coordinates,
      facilities: r.facilities || []
    }));

    const landmarksMapped: Location[] = activeLandmarks.map(l => ({
      id: l._id,
      name: l.name,
      category: l.type,
      buildingId: building.code,
      floor: selectedFloor,
      description: l.description || '',
      coordinates: l.coordinates
    }));

    return [...roomsMapped, ...landmarksMapped];
  })();

  const roomsList = activeLocationsList.filter(
    (loc) => !['Staircase', 'Elevator', 'Restroom', 'Exit'].includes(loc.category)
  );

  const handleRoomClick = (room: Location) => {
    setSelectedRoom(room);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto mb-4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto mb-10"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-96">
          <div className="lg:col-span-8 bg-slate-100 rounded-xl"></div>
          <div className="lg:col-span-4 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !building) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-brand-accent-dest mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-brand-primary">Building details not available</h2>
        <p className="text-brand-muted text-sm mt-2">{error || 'The building code you requested does not exist.'}</p>
        <Link to="/buildings" className="mt-5 inline-flex items-center justify-center rounded-lg bg-brand-primary text-white font-semibold py-2 px-4 text-xs shadow hover:bg-slate-800 transition-colors">
          Back to Buildings
        </Link>
      </div>
    );
  }

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
                {floors.map((fl) => (
                  <button
                    key={fl._id}
                    onClick={() => {
                      setSelectedFloor(fl.floorNumber);
                      setSelectedRoom(null); // Reset room details on floor change
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      selectedFloor === fl.floorNumber
                        ? 'bg-white text-brand-primary shadow-sm'
                        : 'text-brand-muted hover:text-brand-primary'
                    }`}
                  >
                    {fl.floorNumber === 0 ? 'Ground' : `${fl.floorNumber}st`}
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
            buildingId={building.code}
            floor={selectedFloor}
            destinationId={selectedRoom?.id}
            onRoomClick={handleRoomClick}
            locations={activeLocationsList}
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
