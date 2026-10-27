import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Heart, History, Navigation, Eye, LogOut, Settings, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRooms } from '../services/roomService';
import { getLandmarks } from '../services/landmarkService';
import { getFavorites, deleteFavorite } from '../services/favoriteService';
import { getHistory, clearHistory } from '../services/historyService';
import type { HistoryItem, Location } from '../types';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [favorites, setFavorites] = useState<Location[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Favorites and history for the particular logged-in user on mount
  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      try {
        setLoading(true);
        const userFavKey = `favorites_${user.id}`;
        const userHistKey = `navHistory_${user.id}`;

        // Fetch all rooms, landmarks, user favorites, and user navigation history in parallel
        const [rRes, lRes, favRes, histRes] = await Promise.all([
          getRooms(),
          getLandmarks(),
          getFavorites(user.id).catch(() => ({ success: false, data: [] })),
          getHistory(user.id).catch(() => ({ success: false, data: [] }))
        ]);

        const roomsData = rRes.success ? rRes.data : [];
        const landmarksData = lRes.success ? lRes.data : [];

        const roomsMapped: Location[] = roomsData.map((r: any) => ({
          id: r.roomNumber || r._id,
          name: r.name,
          category: r.roomType,
          buildingId: r.buildingId?.code || r.buildingId,
          floor: r.floorId?.floorNumber !== undefined ? r.floorId.floorNumber : 0,
          description: r.description || '',
          coordinates: r.coordinates
        }));

        const landmarksMapped: Location[] = landmarksData.map((l: any) => ({
          id: l._id,
          name: l.name,
          category: l.type,
          buildingId: l.buildingId?.code || l.buildingId,
          floor: l.floorId?.floorNumber !== undefined ? l.floorId.floorNumber : 0,
          description: l.description || '',
          coordinates: l.coordinates
        }));

        const allLocs = [...roomsMapped, ...landmarksMapped];

        // 1. Resolve user's favorites
        let savedFavIds: string[] = [];
        if (favRes.success && Array.isArray(favRes.data)) {
          savedFavIds = favRes.data.map((f: any) => f.locationId);
          localStorage.setItem(userFavKey, JSON.stringify(savedFavIds));
        } else {
          savedFavIds = JSON.parse(localStorage.getItem(userFavKey) || '[]');
        }

        const mappedFavs = allLocs.filter((l) => savedFavIds.includes(l.id));
        setFavorites(mappedFavs);

        // 2. Resolve user's navigation history
        let finalHistory: HistoryItem[] = [];
        if (histRes.success && Array.isArray(histRes.data)) {
          finalHistory = histRes.data.map((h: any) => ({
            id: h._id || h.id || Math.random().toString(),
            fromLocation: { name: h.source },
            toLocation: { name: h.destination },
            timestamp: h.createdAt ? new Date(h.createdAt).toLocaleString() : new Date().toLocaleString()
          }));
          localStorage.setItem(userHistKey, JSON.stringify(finalHistory));
        } else {
          finalHistory = JSON.parse(localStorage.getItem(userHistKey) || '[]');
        }

        setHistory(finalHistory);

      } catch (err) {
        console.error('Error loading profile listings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRemoveFavorite = async (id: string) => {
    if (!user) return;
    const userFavKey = `favorites_${user.id}`;
    const updatedIds = JSON.parse(localStorage.getItem(userFavKey) || '[]').filter((favId: string) => favId !== id);
    localStorage.setItem(userFavKey, JSON.stringify(updatedIds));
    setFavorites((prev) => prev.filter((f) => f.id !== id));
    try {
      await deleteFavorite(id, user.id);
    } catch (err) {
      console.warn('Failed to delete favorite from server:', err);
    }
  };

  const handleClearHistory = async () => {
    if (!user) return;
    const userHistKey = `navHistory_${user.id}`;
    localStorage.setItem(userHistKey, JSON.stringify([]));
    setHistory([]);
    try {
      await clearHistory(user.id);
    } catch (err) {
      console.warn('Failed to clear history on server:', err);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Profile Header card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center border border-yellow-200">
            <User className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">{user.name}</h1>
            <p className="text-xs text-brand-muted flex items-center mt-1">
              <Mail className="w-3.5 h-3.5 mr-1" />
              {user.email}
              <span className="ml-2.5 px-2 py-0.5 rounded bg-yellow-100 text-[10px] text-amber-900 border border-yellow-300 font-bold capitalize">
                {user.role} Account
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user.role === 'admin' && (
            <Link
              to="/admin"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-brand-primary hover:bg-slate-50 transition-colors"
            >
              <Settings className="w-4 h-4 mr-1.5" />
              Admin Portal
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-brand-muted hover:text-brand-accent-dest hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            Logout Session
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-96 animate-pulse">
          <div className="bg-slate-100 rounded-xl"></div>
          <div className="bg-slate-100 rounded-xl"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Saved Favorites (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-base font-bold text-brand-primary mb-4 flex items-center border-b border-slate-100 pb-3">
                <Heart className="w-5 h-5 text-brand-accent-dest mr-2 fill-brand-accent-dest" />
                <span>Favorite Locations ({favorites.length})</span>
              </h3>

              {favorites.length > 0 ? (
                <div className="space-y-3">
                  {favorites.map((loc) => {
                    const bName = loc.buildingId.replace('-', ' ');
                    
                    return (
                      <div
                        key={loc.id}
                        className="p-4 border border-slate-100 rounded-lg flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-xs text-brand-primary">{loc.name}</h4>
                          <p className="text-[10px] text-brand-muted capitalize">
                            {bName} • Floor {loc.floor} • {loc.category}
                          </p>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <Link
                            to={`/explore?to=${encodeURIComponent(loc.name)}`}
                            className="p-1.5 bg-yellow-100 text-amber-900 border border-yellow-300 rounded hover:bg-yellow-200"
                            title="Navigate Here"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            to={`/locations/${loc.id}`}
                            className="p-1.5 border border-slate-200 text-brand-muted hover:text-brand-primary rounded hover:bg-white"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleRemoveFavorite(loc.id)}
                            className="p-1.5 text-slate-400 hover:text-brand-accent-dest rounded hover:bg-red-50 cursor-pointer"
                            title="Remove Favorite"
                          >
                            <Heart className="w-3.5 h-3.5 fill-current text-brand-accent-dest" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-brand-muted">
                  You haven't bookmarked any favorite locations yet.
                </div>
              )}
            </div>
          </div>

          {/* Right: Wayfinding Navigation History (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-base font-bold text-brand-primary flex items-center">
                  <History className="w-5 h-5 text-brand-secondary mr-2" />
                  <span>Navigation History</span>
                </h3>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-[10px] font-bold text-brand-muted hover:text-brand-accent-dest cursor-pointer"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border border-slate-50 rounded-lg hover:border-slate-200 transition-colors space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-center text-[10px] text-brand-muted font-medium">
                        <span>Logged route run</span>
                        <span>{item.timestamp}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-brand-primary font-bold">
                        <div className="text-left">
                          <p>{item.fromLocation.name}</p>
                          <span className="text-[9px] text-brand-muted font-normal block capitalize">
                            {item.fromLocation.building ? `${item.fromLocation.building.replace('-', ' ')} • ` : ''}{item.fromLocation.floor || 'Wayfinding Route'}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 mx-2 flex-shrink-0" />
                        <div className="text-right">
                          <p>{item.toLocation.name}</p>
                          <span className="text-[9px] text-brand-muted font-normal block capitalize">
                            {item.toLocation.building ? `${item.toLocation.building.replace('-', ' ')} • ` : ''}{item.toLocation.floor || 'Campus Destination'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-50 flex justify-end">
                        <Link
                          to={`/explore?to=${encodeURIComponent(item.toLocation.name)}`}
                          className="inline-flex items-center text-[10px] font-bold text-brand-secondary hover:underline"
                        >
                          <Navigation className="w-3.5 h-3.5 mr-1" />
                          Re-Run Path
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-brand-muted">
                  No recently navigated route logs found.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
