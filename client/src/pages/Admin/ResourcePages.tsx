import { useState, useEffect } from 'react';
import { mockBuildings } from '../../data/mockBuildings';
import { mockLocations } from '../../data/mockLocations';
import { mockRoutes } from '../../data/mockRoutes';
import type { FeedbackReport } from '../../types';
import { Plus, Search, BarChart3, MessageSquare } from 'lucide-react';
import { getFeedback, updateFeedbackStatus } from '../../services/feedbackService';

// ==========================================
// 1. ADMIN BUILDINGS PAGE
// ==========================================
export function AdminBuildings() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">Manage Buildings</h1>
          <p className="text-xs text-brand-muted mt-1">Configure campus blocks, base SVG maps, and coordinate offsets.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-2 px-4 text-xs shadow hover:bg-blue-700 transition-all cursor-pointer">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Building
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-brand-primary">
          <thead className="bg-slate-55/20 bg-slate-50 uppercase tracking-wider text-[10px] text-brand-muted border-b border-slate-200">
            <tr>
              <th className="p-4">Block ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Floors</th>
              <th className="p-4">Total Rooms</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {mockBuildings.map(b => (
              <tr key={b.id}>
                <td className="p-4 font-bold">{b.id.toUpperCase()}</td>
                <td className="p-4">{b.name}</td>
                <td className="p-4">{b.floors.length} Levels ({b.floors.join(', ')})</td>
                <td className="p-4">{b.totalLocations} Locations</td>
                <td className="p-4 text-right space-x-2">
                  <button className="px-2.5 py-1.5 border border-slate-200 rounded text-brand-primary hover:bg-slate-50 text-[10px] font-bold">Edit</button>
                  <button className="px-2.5 py-1.5 border border-red-200 rounded text-brand-accent-dest hover:bg-red-50 text-[10px] font-bold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 2. ADMIN FLOORS PAGE
// ==========================================
export function AdminFloors() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">Manage Floor Plans</h1>
          <p className="text-xs text-brand-muted mt-1">Configure CAD schematics, dimensions, and navigation nodes per level.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-2 px-4 text-xs shadow hover:bg-blue-700 transition-all cursor-pointer">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Floor Layout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockBuildings.map(b => (
          <div key={b.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-brand-primary border-b border-slate-100 pb-2">{b.name} Floor levels</h3>
            <div className="space-y-2">
              {b.floors.map(fl => (
                <div key={fl} className="flex justify-between items-center text-xs font-semibold p-2 bg-slate-50 rounded border border-slate-150">
                  <span>Level {fl === 0 ? 'Ground' : `${fl}st`} Layout</span>
                  <div className="flex gap-2">
                    <button className="text-[10px] text-brand-secondary hover:underline">Update SVG</button>
                    <span className="text-slate-300">|</span>
                    <button className="text-[10px] text-brand-muted hover:underline">Grid nodes</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 3. ADMIN ROOMS / LOCATIONS PAGE
// ==========================================
export function AdminRooms() {
  const [query, setQuery] = useState('');
  const filtered = mockLocations.filter(r => 
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">Rooms & Locations Directory</h1>
          <p className="text-xs text-brand-muted mt-1">Submit coordinates, categories, and neighboring landmarks for indoor nodes.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-2 px-4 text-xs shadow hover:bg-blue-700 transition-all cursor-pointer">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Room
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <div className="flex items-center border border-slate-350 rounded-lg bg-white px-3 py-2">
          <Search className="w-4 h-4 text-brand-muted mr-2" />
          <input
            type="text"
            placeholder="Search active rooms..."
            className="w-full text-xs text-brand-primary bg-transparent focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-brand-primary">
          <thead className="bg-slate-55/20 bg-slate-50 uppercase tracking-wider text-[10px] text-brand-muted border-b border-slate-200">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Room Name</th>
              <th className="p-4">Block</th>
              <th className="p-4">Floor</th>
              <th className="p-4">Category</th>
              <th className="p-4">Coordinates (X, Y)</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.map(r => (
              <tr key={r.id}>
                <td className="p-4 text-brand-muted">{r.id}</td>
                <td className="p-4 font-bold">{r.name}</td>
                <td className="p-4 capitalize">{r.buildingId.replace('-', ' ')}</td>
                <td className="p-4">Floor {r.floor}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-brand-secondary font-semibold text-[10px]">
                    {r.category}
                  </span>
                </td>
                <td className="p-4">x: {r.coordinates.x}, y: {r.coordinates.y}</td>
                <td className="p-4 text-right space-x-1">
                  <button className="px-2.5 py-1.5 border border-slate-200 rounded text-brand-primary hover:bg-slate-50 text-[10px] font-bold">Edit</button>
                  <button className="px-2.5 py-1.5 border border-red-200 rounded text-brand-accent-dest hover:bg-red-50 text-[10px] font-bold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 4. ADMIN LANDMARKS PAGE
// ==========================================
export function AdminLandmarks() {
  const landmarks = mockLocations.filter(loc => 
    ['Staircase', 'Elevator', 'Restroom', 'Exit'].includes(loc.category)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">Infrastructure Landmarks</h1>
          <p className="text-xs text-brand-muted mt-1">Configure stairs, utility rooms, fire exits, and elevator nodes.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-2 px-4 text-xs shadow hover:bg-blue-700 transition-all cursor-pointer">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Landmark
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-brand-primary">
          <thead className="bg-slate-55/20 bg-slate-50 uppercase tracking-wider text-[10px] text-brand-muted border-b border-slate-200">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Block</th>
              <th className="p-4">Floor</th>
              <th className="p-4">Type</th>
              <th className="p-4">Coordinates (X,Y)</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {landmarks.map(l => (
              <tr key={l.id}>
                <td className="p-4 font-bold">{l.name}</td>
                <td className="p-4 capitalize">{l.buildingId.replace('-', ' ')}</td>
                <td className="p-4">Floor {l.floor}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded bg-slate-105 text-brand-primary bg-slate-100 font-semibold text-[10px]">
                    {l.category}
                  </span>
                </td>
                <td className="p-4">({l.coordinates.x}, {l.coordinates.y})</td>
                <td className="p-4 text-right space-x-1">
                  <button className="px-2.5 py-1.5 border border-slate-200 rounded text-brand-primary hover:bg-slate-50 text-[10px] font-bold">Edit</button>
                  <button className="px-2.5 py-1.5 border border-red-200 rounded text-brand-accent-dest hover:bg-red-50 text-[10px] font-bold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 5. ADMIN ROUTES PAGE
// ==========================================
export function AdminRoutes() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">A* Routing Algorithms Config</h1>
          <p className="text-xs text-brand-muted mt-1">Configure routing vectors weight, path points, and multi-floor stairs coordinates.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-2 px-4 text-xs shadow hover:bg-blue-700 transition-all cursor-pointer">
          <Plus className="w-4 h-4 mr-1.5" />
          Pre-calculate Route
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-brand-primary">
          <thead className="bg-slate-55/20 bg-slate-50 uppercase tracking-wider text-[10px] text-brand-muted border-b border-slate-200">
            <tr>
              <th className="p-4">Route ID</th>
              <th className="p-4">From Location</th>
              <th className="p-4">To Location</th>
              <th className="p-4">Distance (Est)</th>
              <th className="p-4">Duration</th>
              <th className="p-4">Steps Count</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {mockRoutes.map(r => (
              <tr key={r.id}>
                <td className="p-4 font-mono text-brand-muted">{r.id}</td>
                <td className="p-4 font-bold">{mockLocations.find(l => l.id === r.fromLocationId)?.name || r.fromLocationId}</td>
                <td className="p-4 font-bold">{mockLocations.find(l => l.id === r.toLocationId)?.name || r.toLocationId}</td>
                <td className="p-4">{r.distance} meters</td>
                <td className="p-4">{r.duration} minutes</td>
                <td className="p-4">{r.steps.length} directions</td>
                <td className="p-4 text-right space-x-1">
                  <button className="px-2.5 py-1.5 border border-slate-200 rounded text-brand-primary hover:bg-slate-50 text-[10px] font-bold">Edit</button>
                  <button className="px-2.5 py-1.5 border border-red-200 rounded text-brand-accent-dest hover:bg-red-50 text-[10px] font-bold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 6. ADMIN USERS PAGE
// ==========================================
export function AdminUsers() {
  const usersList = [
    { email: 'admin@indoornav.com', name: 'Admin User', role: 'Administrator', joined: '08/15/2026' },
    { email: 'student@campus.edu', name: 'Jane Doe', role: 'Student', joined: '08/20/2026' },
    { email: 'guest@visitor.com', name: 'Visiting Guest', role: 'Guest', joined: '08/28/2026' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">User Accounts Directory</h1>
          <p className="text-xs text-brand-muted mt-1">Review active wayfinding log tokens, logins, and registered account permissions.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-brand-primary">
          <thead className="bg-slate-55/20 bg-slate-50 uppercase tracking-wider text-[10px] text-brand-muted border-b border-slate-200">
            <tr>
              <th className="p-4">Email</th>
              <th className="p-4">Full Name</th>
              <th className="p-4">Role Permission</th>
              <th className="p-4">Registered Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {usersList.map((usr) => (
              <tr key={usr.email}>
                <td className="p-4 font-bold">{usr.email}</td>
                <td className="p-4">{usr.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                    usr.role === 'Administrator' ? 'bg-red-50 text-brand-accent-dest' : 'bg-blue-50 text-brand-secondary'
                  }`}>
                    {usr.role}
                  </span>
                </td>
                <td className="p-4">{usr.joined}</td>
                <td className="p-4 text-right space-x-1">
                  <button className="px-2.5 py-1.5 border border-slate-200 rounded text-brand-primary hover:bg-slate-50 text-[10px] font-bold">Edit</button>
                  <button className="px-2.5 py-1.5 border border-red-200 rounded text-brand-accent-dest hover:bg-red-50 text-[10px] font-bold">Revoke</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 7. ADMIN FEEDBACK PAGE
// ==========================================
export function AdminFeedback() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-brand-primary">General App Feedback</h1>
        <p className="text-xs text-brand-muted mt-1">Read user reviews, UX satisfaction feedback, and feature recommendations.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-brand-muted">
        <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p>No new general user suggestions found. User feedback ticket queues are empty.</p>
      </div>
    </div>
  );
}

// ==========================================
// 8. ADMIN REPORTS PAGE
// ==========================================
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
        <p className="text-xs text-brand-muted mt-1">Review user submissions concerning missing locations, incorrect routing lines, or closed stairs.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-brand-primary">
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
                <td colSpan={5} className="p-8 text-center text-brand-muted animate-pulse font-semibold">
                  Loading discrepancy tickets...
                </td>
              </tr>
            ) : reports.length > 0 ? (
              reports.map((rep) => (
                <tr key={rep.id}>
                  <td className="p-4 max-w-xs leading-normal">
                    <p className="font-bold text-brand-primary">{rep.description}</p>
                    <span className="text-[9px] text-brand-muted font-normal">Ticket ID: {rep.id}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-brand-primary font-semibold text-[10px]">
                      {rep.type}
                    </span>
                  </td>
                  <td className="p-4">{rep.createdAt}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-semibold text-[10px] border uppercase ${
                      rep.status === 'Resolved'
                        ? 'bg-emerald-50 border-emerald-200 text-brand-accent-loc' 
                        : rep.status === 'In Progress'
                        ? 'bg-blue-50 border-blue-200 text-brand-secondary' 
                        : 'bg-red-50 border-red-200 text-brand-accent-dest'
                    }`}>
                      {rep.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1 space-y-1">
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
                      <span className="text-brand-muted text-[10px] font-bold px-2 py-1 select-none">No Actions</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-brand-muted">
                  No discrepancy reports submitted.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 9. ADMIN ANALYTICS PAGE
// ==========================================
export function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-brand-primary">Usage Analytics</h1>
        <p className="text-xs text-brand-muted mt-1">Detailed graphs showing peak navigation request hours and path conversion rates.</p>
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
              <span>1,249 requests</span>
            </div>
            <div className="flex justify-between">
              <span>Central Library (Block A)</span>
              <span>950 requests</span>
            </div>
            <div className="flex justify-between">
              <span>Block A Auditorium</span>
              <span>824 requests</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center min-h-[200px]">
          <div className="text-center space-y-2">
            <BarChart3 className="w-10 h-10 text-brand-secondary mx-auto" />
            <p className="text-xs text-brand-muted">Detailed cohort chart analytics reserved for Phase 4 integration.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
