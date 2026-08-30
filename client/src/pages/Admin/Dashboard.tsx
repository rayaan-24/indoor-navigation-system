import { useState, useEffect } from 'react';
import { Users, DoorOpen, Building2, Map, AlertTriangle, Clock, ShieldCheck } from 'lucide-react';
import { getBuildings, getBuildingLayout } from '../../services/buildingService';
import { getFeedback, updateFeedbackStatus } from '../../services/feedbackService';
import { getUsers, getConnections } from '../../services/adminService';
import { getHazards, createHazard, deleteHazard } from '../../services/hazardService';

interface MappedReport {
  id: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [reports, setReports] = useState<MappedReport[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [roomsCount, setRoomsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // SJT Ground Floor map layout & active simulated hazards states
  const [rooms, setRooms] = useState<any[]>([]);
  const [corridors, setCorridors] = useState<any[]>([]);
  const [activeHazards, setActiveHazards] = useState<any[]>([]);

  // Simulation form states
  const [hazType, setHazType] = useState('FIRE');
  const [hazLoc, setHazLoc] = useState('');
  const [hazRadius, setHazRadius] = useState(0);
  const [hazWeight, setHazWeight] = useState(1);
  const [simError, setSimError] = useState('');
  const [simSuccess, setSimSuccess] = useState('');

  // Load backend stats, user directories, active building layout and active hazards
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [bRes, fRes, uRes, cRes, layoutRes, hazRes] = await Promise.all([
        getBuildings(),
        getFeedback(),
        getUsers(1, 1),
        getConnections(),
        getBuildingLayout('sjt-ground'),
        getHazards()
      ]);

      if (bRes.success) setBuildings(bRes.data);
      if (uRes.success) setUsersCount(uRes.pagination?.totalResults || uRes.count || 2);
      
      if (cRes.success) {
        setConnectionsCount(cRes.data.length);
      }

      if (layoutRes.success && layoutRes.data) {
        setRooms(layoutRes.data.rooms);
        setRoomsCount(layoutRes.data.rooms.length);
        setCorridors(layoutRes.data.corridors);
      }

      if (hazRes.success) {
        setActiveHazards(hazRes.data);
      }

      if (fRes.success) {
        const mapped: MappedReport[] = fRes.data.map((r: any) => ({
          id: r._id,
          type: r.issueType,
          description: r.message || r.description,
          status: r.status,
          createdAt: new Date(r.createdAt).toLocaleString()
        }));
        setReports(mapped);
      }
    } catch (err) {
      console.error('Error loading admin dashboard details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleResolveReport = async (id: string) => {
    try {
      const response = await updateFeedbackStatus(id, 'Resolved');
      if (response.success) {
        loadDashboardData();
      }
    } catch (err) {
      console.error('Error resolving report:', err);
    }
  };

  // Submit hazard simulation
  const handleSpawnHazard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimError('');
    setSimSuccess('');

    if (!hazLoc) {
      setSimError('Please select a target location');
      return;
    }

    try {
      // FIRE has default 2m, GAS default 3m, others default 0m
      let radius = hazRadius;
      if (hazType === 'FIRE' && !radius) radius = 2.0;
      else if (hazType === 'GAS' && !radius) radius = 3.0;

      const response = await createHazard({
        type: hazType,
        locationId: hazLoc,
        radius,
        weight: hazWeight
      });

      if (response.success) {
        setSimSuccess('Emergency hazard activated successfully!');
        setHazLoc('');
        setHazRadius(0);
        setHazWeight(1);
        loadDashboardData();
      }
    } catch (err: any) {
      setSimError(err.response?.data?.message || 'Failed to activate simulated hazard.');
    }
  };

  // Clear hazard simulation
  const handleClearHazard = async (id: string) => {
    try {
      const response = await deleteHazard(id);
      if (response.success) {
        loadDashboardData();
      }
    } catch (err) {
      console.error('Error clearing hazard:', err);
    }
  };

  const stats = [
    { label: 'Registered Users', value: usersCount.toString(), icon: <Users className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50' },
    { label: 'Rooms Indexed', value: roomsCount.toString(), icon: <DoorOpen className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50' },
    { label: 'Buildings Managed', value: buildings.length.toString(), icon: <Building2 className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50' },
    { label: 'Total Graph Edges', value: connectionsCount.toString(), icon: <Map className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50' },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-slate-200 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 h-24">
          <div className="bg-slate-200 rounded-xl"></div>
          <div className="bg-slate-200 rounded-xl"></div>
          <div className="bg-slate-200 rounded-xl"></div>
          <div className="bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const unresolvedReports = reports.filter(r => r.status !== 'Resolved' && r.status !== 'resolved');

  return (
    <div className="space-y-8 leading-relaxed">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-primary">Dashboard Overview</h1>
          <p className="text-brand-muted text-xs mt-1">Real-time building capacity indexes, active hazards, and system logs.</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-bold text-brand-accent-loc bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <ShieldCheck className="w-4 h-4" />
          <span>System Online • MERN Live Mode</span>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] text-brand-muted font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-extrabold text-brand-primary mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Emergency Simulation HUD Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Simulation Spawning Controller */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center">
            <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
            <span>Emergency Simulator HUD</span>
          </h3>

          {simError && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded text-xs text-center font-bold">
              {simError}
            </div>
          )}
          {simSuccess && (
            <div className="p-2.5 bg-green-50 border border-green-200 text-green-700 rounded text-xs text-center font-bold">
              {simSuccess}
            </div>
          )}

          <form onSubmit={handleSpawnHazard} className="space-y-4 text-xs font-semibold text-brand-primary">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-brand-muted">Hazard Type</label>
              <select
                value={hazType}
                onChange={(e) => setHazType(e.target.value)}
                className="w-full rounded border border-slate-200 p-2.5 focus:outline-none"
              >
                <option value="FIRE">FIRE (Blocks with 2m + 3m safety)</option>
                <option value="SMOKE">SMOKE (Adds +5 cost weight)</option>
                <option value="BLOCKAGE">BLOCKAGE (Blocks walkway/room)</option>
                <option value="CROWD">CROWD (Adds +3 cost weight)</option>
                <option value="GAS">GAS (Blocks with 3m radius)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-brand-muted">Target Area Location</label>
              <select
                value={hazLoc}
                onChange={(e) => setHazLoc(e.target.value)}
                className="w-full rounded border border-slate-200 p-2.5 focus:outline-none"
              >
                <option value="">Select Location...</option>
                <optgroup label="Corridors">
                  {corridors.map(c => (
                    <option key={c.corridorId} value={c.corridorId}>{c.name} ({c.corridorId})</option>
                  ))}
                </optgroup>
                <optgroup label="Rooms">
                  {rooms.map(r => (
                    <option key={r.roomNumber} value={r.roomNumber}>{r.name} ({r.roomNumber})</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-brand-muted">Radius (m)</label>
                <input
                  type="number"
                  value={hazRadius}
                  onChange={(e) => setHazRadius(Number(e.target.value))}
                  className="w-full rounded border border-slate-200 p-2.5 focus:outline-none"
                  min="0"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-brand-muted">Weight Penalty</label>
                <input
                  type="number"
                  value={hazWeight}
                  onChange={(e) => setHazWeight(Number(e.target.value))}
                  className="w-full rounded border border-slate-200 p-2.5 focus:outline-none"
                  min="1"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!hazLoc}
              className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded shadow transition-colors cursor-pointer disabled:opacity-50"
            >
              Activate Hazard
            </button>
          </form>
        </div>

        {/* Active Simulated Emergency Sectors List */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4 flex flex-col h-[320px]">
          <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider border-b border-slate-100 pb-3">
            Active Simulated Emergency Sectors ({activeHazards.length})
          </h3>
          
          <div className="divide-y divide-slate-100 overflow-y-auto pr-1 flex-grow">
            {activeHazards.length > 0 ? (
              activeHazards.map((h) => (
                <div key={h._id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className={`inline-flex px-2 py-0.5 rounded font-bold mr-2 text-[10px] ${
                      h.type === 'FIRE' || h.type === 'GAS' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {h.type}
                    </span>
                    <span className="text-brand-primary font-bold">Location ID: {h.locationId}</span>
                    <span className="text-brand-muted block mt-0.5 text-[10px]">
                      {h.type === 'FIRE' ? 'Threat Radius: 5m' : h.type === 'GAS' ? 'Threat Radius: 3m' : `Weight Penalty: +${h.weight}`}
                    </span>
                  </div>
                  <button
                    onClick={() => handleClearHazard(h._id)}
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded cursor-pointer transition-colors text-[10px]"
                  >
                    Clear Sector
                  </button>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-brand-muted text-xs">
                No active threats simulated. Layout graph is running under normal safe conditions.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Reported Map Issues Queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider flex items-center">
            <AlertTriangle className="w-5 h-5 text-brand-warning mr-2" />
            <span>Map Discrepancies Queue ({unresolvedReports.length})</span>
          </h3>
        </div>

        <div className="divide-y divide-slate-150 flex-grow">
          {unresolvedReports.length > 0 ? (
            unresolvedReports.slice(0, 3).map((rep) => (
              <div key={rep.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex px-2 py-0.5 rounded bg-amber-50 text-brand-warning font-semibold">
                      {rep.type}
                    </span>
                    <span className="text-[10px] text-brand-muted flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {rep.createdAt}
                    </span>
                  </div>
                  <p className="text-brand-primary font-medium">{rep.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded border font-semibold text-[10px] uppercase ${
                    rep.status === 'Pending' || rep.status === 'pending'
                      ? 'bg-red-50 border-red-200 text-brand-accent-dest' 
                      : 'bg-blue-50 border-blue-200 text-brand-secondary'
                  }`}>
                    {rep.status}
                  </span>
                  <button
                    onClick={() => handleResolveReport(rep.id)}
                    className="px-3 py-1.5 bg-brand-primary text-white font-bold rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-brand-muted text-xs flex items-center justify-center h-full">
              All user-reported map discrepancies resolved. Queue is clear!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
