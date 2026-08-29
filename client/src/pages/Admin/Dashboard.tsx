import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, DoorOpen, Building2, Map, AlertTriangle, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { getBuildings } from '../../services/buildingService';
import { getRooms } from '../../services/roomService';
import { getRoutes } from '../../services/routeService';
import { getFeedback, updateFeedbackStatus } from '../../services/feedbackService';

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
  const [routesCount, setRoutesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load backend stats & reports
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [bRes, rRes, routesRes, fRes] = await Promise.all([
        getBuildings(),
        getRooms(),
        getRoutes(),
        getFeedback()
      ]);

      if (bRes.success) setBuildings(bRes.data);
      if (rRes.success) setRoomsCount(rRes.data.length);
      if (routesRes.success) setRoutesCount(routesRes.data.length);
      
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
        // Reload dashboard
        loadDashboardData();
      }
    } catch (err) {
      console.error('Error resolving report:', err);
    }
  };

  // Dynamic analytics stats
  const stats = [
    { label: 'Total Active Users', value: '2', icon: <Users className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50' },
    { label: 'Total Rooms Indexed', value: roomsCount.toString(), icon: <DoorOpen className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50' },
    { label: 'Total Buildings', value: buildings.length.toString(), icon: <Building2 className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50' },
    { label: 'Wayfinding Routes', value: routesCount.toString(), icon: <Map className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50' },
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-60">
          <div className="lg:col-span-2 bg-slate-200 rounded-xl"></div>
          <div className="bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const unresolvedReports = reports.filter(r => r.status !== 'Resolved' && r.status !== 'resolved');

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-primary">Dashboard Overview</h1>
          <p className="text-brand-muted text-xs mt-1">Real-time building capacity indexes, system logs, and reported map issues.</p>
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

      {/* Charts & Map Stats row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Wayfinding Requests Chart (SaaS style) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider border-b border-slate-100 pb-3">
            Wayfinding Request Traffic
          </h3>
          
          {/* Mock CSS Bar Chart */}
          <div className="flex items-end justify-between h-48 pt-6">
            {[
              { day: 'Mon', count: 180, pct: '40%' },
              { day: 'Tue', count: 290, pct: '65%' },
              { day: 'Wed', count: 420, pct: '95%' },
              { day: 'Thu', count: 350, pct: '80%' },
              { day: 'Fri', count: 240, pct: '55%' },
              { day: 'Sat', count: 90, pct: '20%' },
              { day: 'Sun', count: 120, pct: '28%' }
            ].map((bar, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 space-y-2">
                <span className="text-[9px] text-brand-muted font-bold">{bar.count}</span>
                {/* Visual bar */}
                <div
                  style={{ height: bar.pct }}
                  className="w-8 bg-brand-secondary rounded-t hover:bg-blue-700 transition-colors"
                />
                <span className="text-[10px] text-brand-primary font-semibold">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick building statistics */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider border-b border-slate-100 pb-3">
            Building Coverage Indexes
          </h3>
          <div className="space-y-4 text-xs">
            {buildings.map(b => (
              <div key={b._id} className="space-y-1">
                <div className="flex justify-between font-semibold text-brand-primary">
                  <span>{b.name}</span>
                  <span>{b.numberOfLocations} Rooms</span>
                </div>
                {/* Progress bar represent floor coverage */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: b.code === 'block-b' ? '70%' : b.code === 'block-a' ? '90%' : '45%' }}
                    className="bg-brand-secondary h-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Reported Map Issues queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider flex items-center">
            <AlertTriangle className="w-5 h-5 text-brand-warning mr-2" />
            <span>Map Discrepancies Queue ({unresolvedReports.length})</span>
          </h3>
          <Link to="/admin/reports" className="text-xs font-bold text-brand-secondary hover:underline flex items-center">
            <span>Manage All Reports</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="divide-y divide-slate-150">
          {unresolvedReports.length > 0 ? (
            unresolvedReports.map((rep) => (
              <div key={rep.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-2">
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
            <div className="p-8 text-center text-brand-muted text-xs">
              All user-reported map discrepancies resolved. Queue is clear!
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
