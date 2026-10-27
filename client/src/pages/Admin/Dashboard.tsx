import { useState, useEffect } from 'react';
import { Users, DoorOpen, Building2, Map, AlertTriangle, Clock, ShieldCheck } from 'lucide-react';
import { getBuildings, getBuildingLayout } from '../../services/buildingService';
import { getFeedback, updateFeedbackStatus } from '../../services/feedbackService';
import { getUsers, getConnections } from '../../services/adminService';

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

  // Load backend stats, user directories, and active building layout
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [bRes, fRes, uRes, cRes, layoutRes] = await Promise.all([
        getBuildings(),
        getFeedback(),
        getUsers(1, 1),
        getConnections(),
        getBuildingLayout('sjt-ground')
      ]);

      if (bRes.success) setBuildings(bRes.data);
      if (uRes.success) setUsersCount(uRes.pagination?.totalResults || uRes.count || 2);
      
      if (cRes.success) {
        setConnectionsCount(cRes.data.length);
      }

      if (layoutRes.success && layoutRes.data) {
        setRoomsCount(layoutRes.data.rooms?.length || 0);
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

  const stats = [
    { label: 'Registered Users', value: usersCount.toString(), icon: <Users className="w-5 h-5 text-amber-700" />, bg: 'bg-yellow-100 border border-yellow-300' },
    { label: 'Rooms Indexed', value: roomsCount.toString(), icon: <DoorOpen className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50' },
    { label: 'Buildings Managed', value: buildings.length.toString(), icon: <Building2 className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50' },
    { label: 'Total Graph Edges', value: connectionsCount.toString(), icon: <Map className="w-5 h-5 text-yellow-700" />, bg: 'bg-yellow-100 border border-yellow-300' },
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
          <p className="text-brand-muted text-xs mt-1">Real-time building capacity indexes, campus locations, and map discrepancy logs.</p>
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
                      : 'bg-yellow-100 border-yellow-300 text-amber-900'
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
