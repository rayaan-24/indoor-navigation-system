import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Heart, History, Navigation, Eye, LogOut, Settings } from 'lucide-react';
import { mockLocations } from '../../data/mockLocations';
import { mockBuildings } from '../../data/mockBuildings';
import type { HistoryItem } from '../../types';

export default function Profile() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('John Doe');
  const [userEmail, setUserEmail] = useState('john.doe@campus.edu');
  const [favorites, setFavorites] = useState<typeof mockLocations>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Check login session & load user data
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    setUserName(localStorage.getItem('userName') || 'John Doe');
    setUserEmail(localStorage.getItem('userEmail') || 'john.doe@campus.edu');

    // Load Favorites from localStorage
    const savedFavIds = JSON.parse(localStorage.getItem('favorites') || '[]');
    let mappedFavs = mockLocations.filter((l) => savedFavIds.includes(l.id));
    
    // Pre-populate demo favorites if empty
    if (savedFavIds.length === 0) {
      const demoFavIds = ['b-comp-lab-204', 'a-central-library'];
      mappedFavs = mockLocations.filter((l) => demoFavIds.includes(l.id));
      localStorage.setItem('favorites', JSON.stringify(demoFavIds));
    }
    setFavorites(mappedFavs);

    // Load Navigation History
    const savedHistory = JSON.parse(localStorage.getItem('navHistory') || '[]');
    let finalHistory = savedHistory;
    
    // Pre-populate demo history if empty
    if (savedHistory.length === 0) {
      const demoHistory: HistoryItem[] = [
        {
          id: 'hist-1',
          fromLocation: { name: 'Main Entrance (Block B)', building: 'Block B', floor: 'Floor 0' },
          toLocation: { name: 'Computer Laboratory B204', building: 'Block B', floor: 'Floor 2' },
          timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString(),
        },
        {
          id: 'hist-2',
          fromLocation: { name: 'Admin Main Entrance', building: 'Block C', floor: 'Floor 0' },
          toLocation: { name: 'Central Library (Block A)', building: 'Block A', floor: 'Floor 1' },
          timestamp: new Date(Date.now() - 3600000 * 24).toLocaleString(),
        },
      ];
      finalHistory = demoHistory;
      localStorage.setItem('navHistory', JSON.stringify(demoHistory));
    }
    setHistory(finalHistory);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const handleRemoveFavorite = (id: string) => {
    const updatedIds = JSON.parse(localStorage.getItem('favorites') || '[]').filter((favId: string) => favId !== id);
    localStorage.setItem('favorites', JSON.stringify(updatedIds));
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearHistory = () => {
    localStorage.setItem('navHistory', JSON.stringify([]));
    setHistory([]);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Profile Header card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
            <User className="w-8 h-8 text-brand-secondary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">{userName}</h1>
            <p className="text-xs text-brand-muted flex items-center mt-1">
              <Mail className="w-3.5 h-3.5 mr-1" />
              {userEmail}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {userEmail === 'admin@indoornav.com' && (
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
                  const bName = mockBuildings.find(b => b.id === loc.buildingId)?.name || loc.buildingId;
                  
                  return (
                    <div
                      key={loc.id}
                      className="p-4 border border-slate-100 rounded-lg flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-brand-primary">{loc.name}</h4>
                        <p className="text-[10px] text-brand-muted">
                          {bName} • Floor {loc.floor} • {loc.category}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/explore?to=${encodeURIComponent(loc.name)}`}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-brand-secondary rounded transition-colors"
                          title="Navigate to room"
                        >
                          <Navigation className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/locations/${loc.id}`}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-brand-primary rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleRemoveFavorite(loc.id)}
                          className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-brand-accent-dest rounded transition-colors cursor-pointer"
                          title="Remove favorite"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-brand-muted">
                <Heart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>No favorites saved yet. Add rooms to favorites from their detail pages.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Recent Navigation History (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-brand-primary flex items-center">
                <History className="w-5 h-5 text-brand-secondary mr-2" />
                <span>Recent Navigation Activity</span>
              </h3>
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-xs font-bold text-brand-muted hover:text-brand-accent-dest cursor-pointer"
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
                    className="p-4 border border-slate-100 rounded-lg space-y-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-brand-muted font-medium">{item.timestamp}</span>
                      <Link
                        to={`/explore?from=${encodeURIComponent(item.fromLocation.name)}&to=${encodeURIComponent(item.toLocation.name)}`}
                        className="inline-flex items-center text-[10px] font-bold text-brand-secondary hover:underline"
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        Navigate Again
                      </Link>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-brand-primary">
                      <div className="flex flex-col">
                        <span>{item.fromLocation.name}</span>
                        <span className="text-[9px] text-brand-muted font-normal">
                          {item.fromLocation.building} • {item.fromLocation.floor}
                        </span>
                      </div>
                      <ArrowIcon className="w-4 h-4 text-brand-muted mx-3 flex-shrink-0" />
                      <div className="flex flex-col text-right">
                        <span>{item.toLocation.name}</span>
                        <span className="text-[9px] text-brand-muted font-normal">
                          {item.toLocation.building} • {item.toLocation.floor}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-brand-muted">
                <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>No recent navigation logs found. Your search routes will appear here.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

function ArrowIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
