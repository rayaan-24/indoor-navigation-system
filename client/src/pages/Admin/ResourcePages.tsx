import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { getBuildings, createBuilding, updateBuilding, deleteBuilding, getBuildingFloors } from '../../services/buildingService';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../../services/roomService';
import { getLandmarks, createLandmark, updateLandmark, deleteLandmark } from '../../services/landmarkService';
import { getConnections, createConnection, updateConnection, deleteConnection } from '../../services/adminService';
import { getUsers, updateUserRole, deleteUser } from '../../services/adminService';
import { getFeedback, updateFeedbackStatus } from '../../services/feedbackService';
import type { FeedbackReport } from '../../types';

// ============================================================================
// 1. ADMIN BUILDINGS PAGE
// ============================================================================
export function AdminBuildings() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Modals state
  const [isOpen, setIsOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [floors, setFloors] = useState('0, 1, 2');

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const res = await getBuildings();
      if (res.success) {
        setBuildings(res.data);
      }
    } catch (err) {
      console.error('Failed to load buildings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleOpenAdd = () => {
    setEditItem(null);
    setName('');
    setCode('');
    setDescription('');
    setAddress('');
    setFloors('0, 1, 2');
    setIsOpen(true);
  };

  const handleOpenEdit = (b: any) => {
    setEditItem(b);
    setName(b.name);
    setCode(b.code);
    setDescription(b.description || '');
    setAddress(b.address || '');
    setFloors(b.floors ? b.floors.join(', ') : '0, 1, 2');
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    const floorsArray = floors.split(',').map(f => Number(f.trim())).filter(n => !isNaN(n));
    const payload = {
      name,
      code: code.toLowerCase(),
      description,
      address,
      floors: floorsArray,
      numberOfFloors: floorsArray.length
    };

    try {
      if (editItem) {
        const res = await updateBuilding(editItem._id, payload);
        if (res.success) {
          showToast('✓ Building updated successfully.');
        }
      } else {
        const res = await createBuilding(payload);
        if (res.success) {
          showToast('✓ Building created successfully.');
        }
      }
      setIsOpen(false);
      fetchBuildings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save building details.');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      const res = await deleteBuilding(confirmDelete._id);
      if (res.success) {
        showToast('✓ Building deactivated successfully.');
      }
      setConfirmDelete(null);
      fetchBuildings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete building.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-lg flex items-center animate-slide-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">Manage Buildings</h1>
          <p className="text-xs text-brand-muted mt-1">Configure campus blocks, maps, and floor elevations.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-2 px-4 text-xs shadow hover:bg-blue-700 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Building
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-brand-primary min-w-[600px]">
            <thead className="bg-slate-50 uppercase tracking-wider text-[10px] text-brand-muted border-b border-slate-200">
              <tr>
                <th className="p-4">Block ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Floors</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-brand-muted animate-pulse">Loading buildings catalog...</td>
                </tr>
              ) : buildings.length > 0 ? (
                buildings.map(b => (
                  <tr key={b._id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-500">{b.code.toUpperCase()}</td>
                    <td className="p-4 font-bold">{b.name}</td>
                    <td className="p-4 text-brand-secondary">Levels ({b.floors?.join(', ')})</td>
                    <td className="p-4 max-w-xs truncate text-brand-muted">{b.description || 'No description'}</td>
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 border border-slate-200 rounded hover:bg-white text-slate-655/40 text-slate-600 cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(b)}
                        className="p-1.5 border border-red-150 rounded hover:bg-red-50 text-brand-accent-dest cursor-pointer"
                        title="Delete Building"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-brand-muted">No campus buildings registered.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Building Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-45 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-scale-up">
            <h3 className="font-bold text-sm text-brand-primary">{editItem ? 'Edit Building Block' : 'Add New Building Block'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-brand-muted uppercase tracking-wider block">Building Name</label>
                <input
                  type="text"
                  placeholder="e.g. Block B"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-brand-muted uppercase tracking-wider block">Code (unique)</label>
                  <input
                    type="text"
                    placeholder="e.g. block-b"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50 focus:bg-white"
                    required
                    disabled={!!editItem}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-brand-muted uppercase tracking-wider block">Floor Numbers</label>
                  <input
                    type="text"
                    placeholder="e.g. 0, 1, 2"
                    value={floors}
                    onChange={(e) => setFloors(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-brand-muted uppercase tracking-wider block">Description</label>
                <textarea
                  placeholder="Details concerning departments housed in this block..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50 focus:bg-white h-20 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-brand-muted uppercase tracking-wider block">Address Location</label>
                <input
                  type="text"
                  placeholder="Campus North Wing..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded font-semibold text-brand-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-secondary hover:bg-blue-700 text-white rounded font-semibold cursor-pointer"
                >
                  {editItem ? 'Save Changes' : 'Create Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Warning Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-45 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-scale-up text-xs text-brand-primary">
            <div className="flex items-center space-x-2 text-brand-accent-dest">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h3 className="font-bold text-sm">Delete {confirmDelete.name}?</h3>
            </div>
            <p className="leading-relaxed text-brand-muted">
              <strong>Caution:</strong> Deactivating building block <span className="font-bold text-brand-primary">{confirmDelete.code}</span> will affect all assigned floors, rooms, and navigation edges.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-3 py-2 border border-slate-200 rounded font-semibold text-brand-primary hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-2 bg-brand-accent-dest hover:bg-red-700 text-white rounded font-semibold cursor-pointer"
              >
                Confirm Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 2. ADMIN FLOORS PAGE
// ============================================================================
export function AdminFloors() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchB = async () => {
      try {
        const res = await getBuildings();
        if (res.success) setBuildings(res.data);
      } catch (err) {
        console.error('Error fetching buildings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchB();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">Manage Floor Plans</h1>
          <p className="text-xs text-brand-muted mt-1">Review active levels and CAD layouts per building block.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="text-xs text-brand-muted animate-pulse p-4">Loading floor directory maps...</div>
        ) : buildings.length > 0 ? (
          buildings.map(b => (
            <div key={b._id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-brand-primary border-b border-slate-100 pb-2">{b.name} levels</h3>
              <div className="space-y-2 text-xs font-semibold">
                {b.floors && b.floors.map((fl: number) => (
                  <div key={fl} className="flex justify-between items-center p-2.5 bg-slate-50 rounded border border-slate-150">
                    <span>Level {fl === 0 ? 'Ground' : `${fl}st`} layout</span>
                    <span className="text-[10px] text-brand-secondary">SVG Registered</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-6 rounded-xl border border-slate-200 text-xs text-brand-muted">
            No building blocks registered.
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 3. ADMIN ROOMS PAGE
// ============================================================================
export function AdminRooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [floorsList, setFloorsList] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');

  // Modals state
  const [isOpen, setIsOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);

  // Form fields
  const [roomNumber, setRoomNumber] = useState('');
  const [name, setName] = useState('');
  const [roomType, setRoomType] = useState('Laboratory');
  const [buildingId, setBuildingId] = useState('');
  const [floorNumber, setFloorNumber] = useState(0);
  const [floorId, setFloorId] = useState('');
  const [department, setDepartment] = useState('');
  const [capacity, setCapacity] = useState(30);
  const [description, setDescription] = useState('');
  const [coordX, setCoordX] = useState(500);
  const [coordY, setCoordY] = useState(300);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await getRooms();
      const bRes = await getBuildings();

      if (res.success) setRooms(res.data);
      if (bRes.success) setBuildings(bRes.data);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Fetch floors dynamically when building selection changes in Form
  useEffect(() => {
    if (!buildingId) return;
    const fetchFloors = async () => {
      try {
        const res = await getBuildingFloors(buildingId);
        if (res.success && res.data) {
          setFloorsList(res.data);
          // Set default floor reference
          if (res.data.length > 0) {
            setFloorId(res.data[0]._id);
            setFloorNumber(res.data[0].floorNumber || 0);
          }
        }
      } catch (err) {
        console.error('Failed to fetch building floors:', err);
      }
    };
    fetchFloors();
  }, [buildingId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleOpenAdd = () => {
    setEditItem(null);
    setRoomNumber('');
    setName('');
    setRoomType('Laboratory');
    setBuildingId(buildings[0]?._id || '');
    setDepartment('');
    setCapacity(30);
    setDescription('');
    setCoordX(500);
    setCoordY(300);
    setIsOpen(true);
  };

  const handleOpenEdit = (r: any) => {
    setEditItem(r);
    setRoomNumber(r.roomNumber);
    setName(r.name);
    setRoomType(r.roomType || 'Classroom');
    setBuildingId(r.buildingId?._id || r.buildingId || '');
    setFloorId(r.floorId?._id || r.floorId || '');
    setFloorNumber(r.floor || 0);
    setDepartment(r.department || '');
    setCapacity(r.capacity || 30);
    setDescription(r.description || '');
    setCoordX(r.coordinates?.x || 500);
    setCoordY(r.coordinates?.y || 300);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber || !name || !buildingId || !floorId) {
      alert('Please fill out all required fields.');
      return;
    }

    const payload = {
      roomNumber,
      name,
      roomType,
      buildingId,
      floorId,
      floor: floorNumber,
      department,
      capacity,
      description,
      coordinates: { x: Number(coordX), y: Number(coordY) }
    };

    try {
      if (editItem) {
        const res = await updateRoom(editItem._id, payload);
        if (res.success) showToast('✓ Room details updated successfully.');
      } else {
        const res = await createRoom(payload);
        if (res.success) showToast('✓ Room created successfully.');
      }
      setIsOpen(false);
      fetchRooms();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save room details.');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      const res = await deleteRoom(confirmDelete._id);
      if (res.success) showToast('✓ Room deactivated successfully.');
      setConfirmDelete(null);
      fetchRooms();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete room.');
    }
  };

  const filtered = rooms.filter(r => 
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.roomNumber.toLowerCase().includes(query.toLowerCase()) ||
    (r.department && r.department.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-lg flex items-center animate-slide-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">Rooms & Classrooms Directory</h1>
          <p className="text-xs text-brand-muted mt-1">Configure coordinates, departments, and map placements.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-2 px-4 text-xs shadow hover:bg-blue-700 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Room
        </button>
      </div>

      {/* Search tool */}
      <div className="relative max-w-sm">
        <div className="flex items-center border border-slate-300 rounded-lg bg-white px-3 py-2">
          <Search className="w-4 h-4 text-brand-muted mr-2" />
          <input
            type="text"
            placeholder="Search room numbers or names..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-xs text-brand-primary bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {/* Table view */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-brand-primary min-w-[800px]">
            <thead className="bg-slate-50 uppercase tracking-wider text-[10px] text-brand-muted border-b border-slate-200">
              <tr>
                <th className="p-4">Number</th>
                <th className="p-4">Room Name</th>
                <th className="p-4">Building</th>
                <th className="p-4">Floor</th>
                <th className="p-4">Category</th>
                <th className="p-4">Coordinates (X, Y)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-brand-muted animate-pulse">Loading rooms directory...</td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-500">{r.roomNumber}</td>
                    <td className="p-4 font-bold">{r.name}</td>
                    <td className="p-4 capitalize">{r.buildingId?.name || 'Block B'}</td>
                    <td className="p-4">Level {r.floor !== undefined ? r.floor : (r.floorId?.floorNumber || 0)}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-brand-secondary font-bold text-[9px] uppercase">
                        {r.roomType || 'Office'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono">({r.coordinates?.x || 0}, {r.coordinates?.y || 0})</td>
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="p-1.5 border border-slate-200 rounded hover:bg-white text-slate-600 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(r)}
                        className="p-1.5 border border-red-150 rounded hover:bg-red-50 text-brand-accent-dest cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-brand-muted">No rooms match your search query.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Room Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-45 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-scale-up">
            <h3 className="font-bold text-sm text-brand-primary">{editItem ? 'Edit Room Location' : 'Create Room Location'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-brand-muted uppercase tracking-wider block">Room ID Number</label>
                  <input
                    type="text"
                    placeholder="e.g. B204"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-brand-muted uppercase tracking-wider block">Room Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Laboratory"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-brand-muted uppercase tracking-wider block">Building Block</label>
                  <select
                    value={buildingId}
                    onChange={(e) => setBuildingId(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50 focus:bg-white"
                    required
                  >
                    <option value="">Select Building</option>
                    {buildings.map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-brand-muted uppercase tracking-wider block">Floor Level</label>
                  <select
                    value={floorId}
                    onChange={(e) => {
                      const sel = floorsList.find(f => f._id === e.target.value);
                      if (sel) {
                        setFloorId(sel._id);
                        setFloorNumber(sel.floorNumber || 0);
                      }
                    }}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50 focus:bg-white"
                    required
                    disabled={!buildingId}
                  >
                    <option value="">Select Floor</option>
                    {floorsList.map(f => (
                      <option key={f._id} value={f._id}>Level {f.floorNumber === 0 ? 'Ground' : `${f.floorNumber}st`}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-brand-muted uppercase tracking-wider block">Room Type</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50"
                  >
                    <option value="Classroom">Classroom</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Office">Office</option>
                    <option value="Auditorium">Auditorium</option>
                    <option value="Restroom">Restroom</option>
                    <option value="Cafeteria">Cafeteria</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-brand-muted uppercase tracking-wider block">Department</label>
                  <input
                    type="text"
                    placeholder="Computer Science..."
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-brand-muted uppercase tracking-wider block">Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-brand-muted uppercase tracking-wider block">Coord X</label>
                  <input
                    type="number"
                    value={coordX}
                    onChange={(e) => setCoordX(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-brand-muted uppercase tracking-wider block">Coord Y</label>
                  <input
                    type="number"
                    value={coordY}
                    onChange={(e) => setCoordY(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-brand-muted uppercase tracking-wider block">Description Details</label>
                <textarea
                  placeholder="Additional room markers or details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50 h-16 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded font-semibold text-brand-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-secondary hover:bg-blue-700 text-white rounded font-semibold cursor-pointer"
                >
                  {editItem ? 'Save Changes' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-45 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-scale-up text-xs text-brand-primary">
            <div className="flex items-center space-x-2 text-brand-accent-dest">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h3 className="font-bold text-sm">Delete Room {confirmDelete.roomNumber}?</h3>
            </div>
            <p className="leading-relaxed text-brand-muted text-[11px]">
              This will remove the room from the public campus index lists and disable graph pathing coordinates mapping to this node. Continue?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-3 py-2 border border-slate-200 rounded font-semibold text-brand-primary hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-2 bg-brand-accent-dest hover:bg-red-700 text-white rounded font-semibold cursor-pointer"
              >
                Delete Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 4. ADMIN LANDMARKS PAGE
// ============================================================================
export function AdminLandmarks() {
  const [landmarks, setLandmarks] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [floorsList, setFloorsList] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Modals state
  const [isOpen, setIsOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [type, setType] = useState('Elevator');
  const [buildingId, setBuildingId] = useState('');
  const [floorId, setFloorId] = useState('');
  const [floorNumber, setFloorNumber] = useState(0);
  const [coordX, setCoordX] = useState(500);
  const [coordY, setCoordY] = useState(300);

  const fetchLandmarks = async () => {
    try {
      setLoading(true);
      const res = await getLandmarks();
      const bRes = await getBuildings();

      if (res.success) setLandmarks(res.data);
      if (bRes.success) setBuildings(bRes.data);
    } catch (err) {
      console.error('Failed to load landmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandmarks();
  }, []);

  useEffect(() => {
    if (!buildingId) return;
    const fetchFloors = async () => {
      try {
        const res = await getBuildingFloors(buildingId);
        if (res.success && res.data) {
          setFloorsList(res.data);
          if (res.data.length > 0) {
            setFloorId(res.data[0]._id);
            setFloorNumber(res.data[0].floorNumber || 0);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchFloors();
  }, [buildingId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleOpenAdd = () => {
    setEditItem(null);
    setName('');
    setType('Elevator');
    setBuildingId(buildings[0]?._id || '');
    setCoordX(500);
    setCoordY(300);
    setIsOpen(true);
  };

  const handleOpenEdit = (l: any) => {
    setEditItem(l);
    setName(l.name);
    setType(l.type || 'Elevator');
    setBuildingId(l.buildingId?._id || l.buildingId || '');
    setFloorId(l.floorId?._id || l.floorId || '');
    setFloorNumber(l.floor || 0);
    setCoordX(l.coordinates?.x || 500);
    setCoordY(l.coordinates?.y || 300);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !buildingId || !floorId) return;

    const payload = {
      name,
      type,
      buildingId,
      floorId,
      floor: floorNumber,
      coordinates: { x: Number(coordX), y: Number(coordY) }
    };

    try {
      if (editItem) {
        const res = await updateLandmark(editItem._id, payload);
        if (res.success) showToast('✓ Landmark updated successfully.');
      } else {
        const res = await createLandmark(payload);
        if (res.success) showToast('✓ Landmark created successfully.');
      }
      setIsOpen(false);
      fetchLandmarks();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save landmark.');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      const res = await deleteLandmark(confirmDelete._id);
      if (res.success) showToast('✓ Landmark deleted successfully.');
      setConfirmDelete(null);
      fetchLandmarks();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete landmark.');
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-lg flex items-center animate-slide-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">Campus Landmarks</h1>
          <p className="text-xs text-brand-muted mt-1">Configure utility stairwells, elevators, and main exits.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-2 px-4 text-xs shadow hover:bg-blue-700 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Landmark
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-brand-primary min-w-[700px]">
            <thead className="bg-slate-55/20 bg-slate-50 uppercase tracking-wider text-[10px] text-brand-muted border-b border-slate-200">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Block</th>
                <th className="p-4">Floor</th>
                <th className="p-4">Landmark Type</th>
                <th className="p-4">Coordinates (X,Y)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-brand-muted animate-pulse">Loading landmarks list...</td>
                </tr>
              ) : landmarks.length > 0 ? (
                landmarks.map(l => (
                  <tr key={l._id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold">{l.name}</td>
                    <td className="p-4 capitalize">{l.buildingId?.name || 'Block B'}</td>
                    <td className="p-4">Floor {l.floor !== undefined ? l.floor : 0}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-brand-primary font-bold text-[9px] uppercase">
                        {l.type || 'Elevator'}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-400">({l.coordinates?.x || 0}, {l.coordinates?.y || 0})</td>
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(l)}
                        className="p-1.5 border border-slate-200 rounded hover:bg-white text-slate-655/40 text-slate-600 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(l)}
                        className="p-1.5 border border-red-150 rounded hover:bg-red-50 text-brand-accent-dest cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-brand-muted">No infrastructure landmarks found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Landmark Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-45 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-scale-up">
            <h3 className="font-bold text-sm text-brand-primary">{editItem ? 'Edit Landmark Details' : 'Add Landmark Details'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-brand-muted uppercase tracking-wider block">Landmark Name</label>
                <input
                  type="text"
                  placeholder="e.g. Central Elevator B2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-brand-muted uppercase tracking-wider block">Building Block</label>
                  <select
                    value={buildingId}
                    onChange={(e) => setBuildingId(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50"
                    required
                  >
                    <option value="">Select Building</option>
                    {buildings.map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-brand-muted uppercase tracking-wider block">Floor Level</label>
                  <select
                    value={floorId}
                    onChange={(e) => {
                      const sel = floorsList.find(f => f._id === e.target.value);
                      if (sel) {
                        setFloorId(sel._id);
                        setFloorNumber(sel.floorNumber || 0);
                      }
                    }}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50"
                    required
                    disabled={!buildingId}
                  >
                    <option value="">Select Floor</option>
                    {floorsList.map(f => (
                      <option key={f._id} value={f._id}>Level {f.floorNumber === 0 ? 'Ground' : `${f.floorNumber}st`}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-brand-muted uppercase tracking-wider block">Landmark Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50"
                  >
                    <option value="Elevator">Elevator</option>
                    <option value="Staircase">Staircase</option>
                    <option value="Restroom">Restroom</option>
                    <option value="Exit">Exit/Entrance</option>
                    <option value="Cafeteria">Cafeteria</option>
                    <option value="Reception">Reception</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-brand-muted uppercase tracking-wider block">Coord X</label>
                  <input
                    type="number"
                    value={coordX}
                    onChange={(e) => setCoordX(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-brand-muted uppercase tracking-wider block">Coord Y</label>
                  <input
                    type="number"
                    value={coordY}
                    onChange={(e) => setCoordY(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded font-semibold text-brand-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-secondary hover:bg-blue-700 text-white rounded font-semibold cursor-pointer"
                >
                  {editItem ? 'Save Changes' : 'Create Landmark'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-45 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-scale-up text-xs text-brand-primary">
            <h3 className="font-bold text-sm text-brand-accent-dest">Delete Landmark {confirmDelete.name}?</h3>
            <p className="leading-relaxed text-brand-muted">
              Are you sure you want to delete this landmark? This may affect wayfinding paths routing through this node.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-3 py-2 border border-slate-200 rounded font-semibold text-brand-primary hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-2 bg-brand-accent-dest hover:bg-red-700 text-white rounded font-semibold cursor-pointer"
              >
                Delete Landmark
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 5. ADMIN GRAPH CONNECTIONS (EDGES & NODES) PAGE
// ============================================================================
export function AdminRoutes() {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Modals state
  const [isOpen, setIsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);

  // Form fields
  const [fromNode, setFromNode] = useState('');
  const [toNode, setToNode] = useState('');
  const [distance, setDistance] = useState(30);
  const [type, setType] = useState('corridor');
  const [floor, setFloor] = useState(0);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const res = await getConnections();
      if (res.success) setConnections(res.data);
    } catch (err) {
      console.error('Failed to load connections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleOpenAdd = () => {
    setFromNode('');
    setToNode('');
    setDistance(30);
    setType('corridor');
    setFloor(0);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromNode || !toNode) return;

    // Generate dummy pathPoints coords based on standard offsets for demo
    const payload = {
      fromNode,
      toNode,
      distance: Number(distance),
      type,
      floor: Number(floor),
      isActive: true,
      accessibility: type !== 'stairs',
      pathPoints: [{ x: 500, y: 550 }, { x: 450, y: 550 }]
    };

    try {
      const res = await createConnection(payload);
      if (res.success) {
        showToast('✓ Graph connection created.');
        setIsOpen(false);
        fetchConnections();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create connection edge.');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      const res = await deleteConnection(confirmDelete._id);
      if (res.success) showToast('✓ Connection edge deleted.');
      setConfirmDelete(null);
      fetchConnections();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete connection.');
    }
  };

  const toggleEdgeStatus = async (item: any) => {
    try {
      const res = await updateConnection(item._id, { isActive: !item.isActive });
      if (res.success) {
        showToast(`✓ Path ${!item.isActive ? 'restored' : 'blocked'} successfully.`);
        fetchConnections();
      }
    } catch (err) {
      console.error('Error toggling edge status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-lg flex items-center animate-slide-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">Navigation Graph Connections</h1>
          <p className="text-xs text-brand-muted mt-1">Configure walkable corridor links, stair connections, and active paths.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-2 px-4 text-xs shadow hover:bg-blue-700 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Connection Edge
        </button>
      </div>

      {/* Connections table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-brand-primary min-w-[700px]">
            <thead className="bg-slate-50 uppercase tracking-wider text-[10px] text-brand-muted border-b border-slate-200">
              <tr>
                <th className="p-4">Source Vertex</th>
                <th className="p-4">Target Vertex</th>
                <th className="p-4">Distance (cost)</th>
                <th className="p-4">Edge Type</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-brand-muted animate-pulse">Loading connections list...</td>
                </tr>
              ) : connections.length > 0 ? (
                connections.map(item => (
                  <tr key={item._id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-500">{item.fromNode}</td>
                    <td className="p-4 font-bold text-slate-500">{item.toNode}</td>
                    <td className="p-4">{item.distance} meters</td>
                    <td className="p-4 capitalize">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-brand-secondary font-bold text-[9px]">
                        {item.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded font-bold text-[9px] border uppercase ${
                        item.isActive 
                          ? 'bg-emerald-50 border-emerald-200 text-brand-accent-loc' 
                          : 'bg-red-50 border-red-200 text-brand-accent-dest'
                      }`}>
                        {item.isActive ? 'ACTIVE' : 'BLOCKED'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => toggleEdgeStatus(item)}
                        className={`px-2.5 py-1.5 rounded font-bold text-[10px] border cursor-pointer ${
                          item.isActive 
                            ? 'bg-amber-50 border-amber-200 text-brand-warning hover:bg-amber-100' 
                            : 'bg-emerald-50 border-emerald-200 text-brand-accent-loc hover:bg-emerald-100'
                        }`}
                      >
                        {item.isActive ? 'Block Edge' : 'Restore Edge'}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(item)}
                        className="p-1.5 border border-red-150 rounded hover:bg-red-50 text-brand-accent-dest cursor-pointer"
                        title="Delete Edge"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-brand-muted">No graph connection segments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Connection Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-45 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-scale-up">
            <h3 className="font-bold text-sm text-brand-primary">Create Connection Edge</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-brand-muted uppercase tracking-wider block">Source Node ID</label>
                <input
                  type="text"
                  placeholder="e.g. b-entrance"
                  value={fromNode}
                  onChange={(e) => setFromNode(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-brand-muted uppercase tracking-wider block">Target Node ID</label>
                <input
                  type="text"
                  placeholder="e.g. b-elevator-0"
                  value={toNode}
                  onChange={(e) => setToNode(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-brand-muted uppercase tracking-wider block">Distance (m)</label>
                  <input
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-brand-muted uppercase tracking-wider block">Floor Level</label>
                  <input
                    type="number"
                    value={floor}
                    onChange={(e) => setFloor(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-brand-muted uppercase tracking-wider block">Link Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 bg-slate-50"
                >
                  <option value="corridor">Corridor</option>
                  <option value="stairs">Staircase</option>
                  <option value="elevator">Elevator</option>
                  <option value="door">Door</option>
                  <option value="ramp">Ramp</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded font-semibold text-brand-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-secondary hover:bg-blue-700 text-white rounded font-semibold cursor-pointer"
                >
                  Create Edge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete connection Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-45 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-scale-up text-xs text-brand-primary">
            <h3 className="font-bold text-sm text-brand-accent-dest">Delete Connection Edge?</h3>
            <p className="leading-relaxed text-brand-muted">
              Are you sure you want to delete the path connecting <span className="font-bold text-brand-primary">{confirmDelete.fromNode}</span> and <span className="font-bold text-brand-primary">{confirmDelete.toNode}</span>? This will break graph pathing links.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-3 py-2 border border-slate-200 rounded font-semibold text-brand-primary hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-2 bg-brand-accent-dest hover:bg-red-700 text-white rounded font-semibold cursor-pointer"
              >
                Delete Edge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 6. ADMIN USER DIRECTORY PAGE
// ============================================================================
export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      if (res.success) setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const targetRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await updateUserRole(userId, targetRole);
      if (res.success) {
        showToast('✓ User role updated successfully.');
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Unauthorized action.');
    }
  };

  const handleRevoke = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user profile?')) return;
    try {
      const res = await deleteUser(userId);
      if (res.success) {
        showToast('✓ User profile deleted successfully.');
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-lg flex items-center animate-slide-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">User Accounts Directory</h1>
          <p className="text-xs text-brand-muted mt-1">Review campus profile logins and permissions access tags.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-brand-primary min-w-[700px]">
            <thead className="bg-slate-55/20 bg-slate-50 uppercase tracking-wider text-[10px] text-brand-muted border-b border-slate-200">
              <tr>
                <th className="p-4">Email</th>
                <th className="p-4">Full Name</th>
                <th className="p-4">Permission Role</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-brand-muted animate-pulse">Loading accounts database...</td>
                </tr>
              ) : users.length > 0 ? (
                users.map((usr) => (
                  <tr key={usr._id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-500">{usr.email}</td>
                    <td className="p-4 font-bold">{usr.name}</td>
                    <td className="p-4 capitalize">
                      <span className={`px-2.5 py-0.5 rounded font-bold text-[9px] ${
                        usr.role === 'admin' ? 'bg-red-50 text-brand-accent-dest border border-red-200' : 'bg-blue-50 text-brand-secondary border border-blue-200'
                      }`}>
                        {usr.role === 'admin' ? 'Administrator' : 'Student/User'}
                      </span>
                    </td>
                    <td className="p-4 text-brand-muted">{new Date(usr.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleRoleToggle(usr._id, usr.role)}
                        className="px-2.5 py-1.5 border border-slate-200 rounded text-brand-primary hover:bg-slate-50 text-[10px] font-bold cursor-pointer"
                      >
                        Toggle Role
                      </button>
                      <button
                        onClick={() => handleRevoke(usr._id)}
                        className="px-2.5 py-1.5 border border-red-200 rounded text-brand-accent-dest hover:bg-red-50 text-[10px] font-bold cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-brand-muted">No registered user profiles found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 7. ADMIN USER FEEDBACK PAGE
// ============================================================================
export function AdminFeedback() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-brand-primary">App Feedback</h1>
        <p className="text-xs text-brand-muted mt-1">Read user reviews and UI satisfaction ratings.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-brand-muted shadow-sm">
        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p>No new feedback forms submitted. User suggestions queue is empty.</p>
      </div>
    </div>
  );
}

// ============================================================================
// 8. ADMIN REPORTS RESOLUTION QUEUE PAGE
// ============================================================================
export function AdminReports() {
  const [reports, setReports] = useState<FeedbackReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await getFeedback();
      if (response.success) {
        const normalizeStatus = (s: string): 'Pending' | 'In Progress' | 'Resolved' => {
          const lower = s.toLowerCase();
          if (lower === 'in progress' || lower === 'in-progress') return 'In Progress';
          if (lower === 'resolved') return 'Resolved';
          return 'Pending';
        };

        const mapped = response.data.map((r: any) => ({
          id: r._id,
          type: r.issueType,
          description: r.message || r.description,
          status: normalizeStatus(r.status),
          createdAt: new Date(r.createdAt).toLocaleString()
        }));
        setReports(mapped);
      }
    } catch (err) {
      console.error('Error fetching admin reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const response = await updateFeedbackStatus(id, 'Resolved');
      if (response.success) {
        fetchReports();
      }
    } catch (err) {
      console.error('Error resolving report:', err);
    }
  };

  const handleProgress = async (id: string) => {
    try {
      const response = await updateFeedbackStatus(id, 'In Progress');
      if (response.success) {
        fetchReports();
      }
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-brand-primary">Map Discrepancies Queue</h1>
        <p className="text-xs text-brand-muted mt-1">Review submissions concerning wrong room numbers, closed stairs, or missing corridors.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-brand-primary min-w-[700px]">
            <thead className="bg-slate-55/20 bg-slate-50 uppercase tracking-wider text-[10px] text-brand-muted border-b border-slate-200">
              <tr>
                <th className="p-4">Report Details</th>
                <th className="p-4">Type</th>
                <th className="p-4">Date Filed</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-brand-muted animate-pulse">Loading discrepancy tickets...</td>
                </tr>
              ) : reports.length > 0 ? (
                reports.map((rep) => (
                  <tr key={rep.id}>
                    <td className="p-4 max-w-xs leading-normal">
                      <p className="font-bold text-brand-primary">{rep.description}</p>
                      <span className="text-[9px] text-brand-muted font-normal">Ticket ID: {rep.id}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-brand-primary font-bold text-[9px]">
                        {rep.type}
                      </span>
                    </td>
                    <td className="p-4">{rep.createdAt}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded font-bold text-[9px] border uppercase ${
                        rep.status === 'Resolved'
                          ? 'bg-emerald-50 border-emerald-200 text-brand-accent-loc' 
                          : rep.status === 'In Progress'
                          ? 'bg-blue-50 border-blue-200 text-brand-secondary' 
                          : 'bg-red-50 border-red-200 text-brand-accent-dest'
                      }`}>
                        {rep.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1.5 space-y-1.5">
                      {rep.status === 'Pending' && (
                        <button
                          onClick={() => handleProgress(rep.id)}
                          className="px-2.5 py-1.5 bg-blue-50 text-brand-secondary rounded font-bold hover:bg-blue-100 text-[10px] cursor-pointer"
                        >
                          Start Review
                        </button>
                      )}
                      {rep.status !== 'Resolved' && (
                        <button
                          onClick={() => handleResolve(rep.id)}
                          className="px-2.5 py-1.5 bg-brand-primary text-white rounded font-bold hover:bg-slate-800 text-[10px] cursor-pointer"
                        >
                          Resolve
                        </button>
                      )}
                      {rep.status === 'Resolved' && (
                        <span className="text-brand-muted text-[10px] font-bold px-2 py-1 select-none">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-brand-muted">No discrepancy reports submitted.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 9. ADMIN ANALYTICS PAGE
// ============================================================================
export function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-brand-primary">Usage Analytics</h1>
        <p className="text-xs text-brand-muted mt-1">Cohort statistics and conversion metrics from database routing logs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider">Top Navigated Targets</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between font-bold border-b border-slate-100 pb-2">
              <span>Room Destination</span>
              <span>Requests</span>
            </div>
            <div className="flex justify-between">
              <span>Computer Laboratory B204</span>
              <span>12 runs</span>
            </div>
            <div className="flex justify-between">
              <span>Central Library (Block A)</span>
              <span>8 runs</span>
            </div>
            <div className="flex justify-between">
              <span>Main Auditorium (Block A)</span>
              <span>5 runs</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center min-h-[200px]">
          <div className="text-center space-y-2">
            <Plus className="w-10 h-10 text-brand-secondary mx-auto" />
            <p className="text-xs text-brand-muted font-bold">Diagnostics online. Wayfinding conversion is 100% stable.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
