import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Navigation, MapPin, Building2, Clock, ArrowLeft, Heart, CheckCircle, AlertCircle } from 'lucide-react';
import { getRoomById } from '../services/roomService';
import { getLandmarks } from '../services/landmarkService';
import { getFavorites, createFavorite, deleteFavorite } from '../services/favoriteService';
import { useAuth } from '../context/AuthContext';
import IndoorMap from '../components/IndoorMap';
import type { Location } from '../types';

export default function LocationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [location, setLocation] = useState<Location | null>(null);
  const [nearbyLocs, setNearbyLocs] = useState<Location[]>([]);
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'auth_required'>('success');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLocationData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError('');

        // 1. Fetch room details
        const roomRes = await getRoomById(id);
        if (!roomRes.success) {
          setError('Location not found in database.');
          setLoading(false);
          return;
        }

        const data = roomRes.data;
        const mappedLoc: Location = {
          id: data.roomNumber || data._id,
          name: data.name,
          category: data.roomType,
          buildingId: data.buildingId?.code || data.buildingId,
          floor: data.floorId?.floorNumber !== undefined ? data.floorId.floorNumber : 0,
          description: data.description || '',
          capacity: data.capacity || '',
          department: data.department || '',
          coordinates: data.coordinates,
          facilities: data.facilities || [],
          openingHours: '08:00 AM - 09:00 PM'
        };
        setLocation(mappedLoc);

        // Check favorites for the particular authenticated user
        if (isAuthenticated && user?.id) {
          try {
            const favRes = await getFavorites(user.id);
            if (favRes.success && Array.isArray(favRes.data)) {
              const userFavIds = favRes.data.map((f: any) => f.locationId);
              localStorage.setItem(`favorites_${user.id}`, JSON.stringify(userFavIds));
              setIsFavorite(userFavIds.includes(mappedLoc.id));
            } else {
              const userFavs = JSON.parse(localStorage.getItem(`favorites_${user.id}`) || '[]');
              setIsFavorite(userFavs.includes(mappedLoc.id));
            }
          } catch {
            const userFavs = JSON.parse(localStorage.getItem(`favorites_${user.id}`) || '[]');
            setIsFavorite(userFavs.includes(mappedLoc.id));
          }
        } else {
          setIsFavorite(false);
        }

        // 2. Fetch landmarks on the same floor for "Nearby Locations"
        const lRes = await getLandmarks();
        if (lRes.success) {
          const fId = data.floorId?._id || data.floorId;
          const filteredLandmarks = lRes.data.filter((l: any) => 
            (l.floorId === fId || l.floorId?._id === fId) && l._id !== data._id
          );
          
          const mappedLandmarks: Location[] = filteredLandmarks.map((l: any) => ({
            id: l._id,
            name: l.name,
            category: l.type,
            buildingId: mappedLoc.buildingId,
            floor: mappedLoc.floor,
            description: l.description || '',
            coordinates: l.coordinates
          }));
          setNearbyLocs(mappedLandmarks);
        }

      } catch (err: any) {
        console.error('Error fetching location details:', err);
        setError('Failed to fetch details from the backend database.');
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, [id, isAuthenticated, user]);

  const handleToggleFavorite = async () => {
    if (!location) return;

    // Authentication is strictly mandatory to add or modify favorites
    if (!isAuthenticated || !user) {
      setToastType('auth_required');
      setToastMessage('Authentication is mandatory to add favorites. Please log in first.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4500);
      return;
    }

    const userFavKey = `favorites_${user.id}`;
    const favorites: string[] = JSON.parse(localStorage.getItem(userFavKey) || '[]');

    if (isFavorite) {
      const updated = favorites.filter((favId: string) => favId !== location.id);
      localStorage.setItem(userFavKey, JSON.stringify(updated));
      setIsFavorite(false);
      setToastType('success');
      setToastMessage('Removed from favorites.');
      try {
        await deleteFavorite(location.id, user.id);
      } catch (err) {
        console.warn('Failed to delete favorite from server:', err);
      }
    } else {
      const updated = [...favorites, location.id];
      localStorage.setItem(userFavKey, JSON.stringify(updated));
      setIsFavorite(true);
      setToastType('success');
      setToastMessage('Added to your account favorites.');
      try {
        await createFavorite(user.id, location.id, 'Room');
      } catch (err) {
        console.warn('Failed to create favorite on server:', err);
      }
    }

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4 mx-auto mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-96">
          <div className="lg:col-span-5 bg-slate-100 rounded-xl"></div>
          <div className="lg:col-span-7 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-brand-accent-dest mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-brand-primary">Location not found</h2>
        <p className="text-brand-muted text-sm mt-2">{error || 'The room details are not available.'}</p>
        <Link to="/locations" className="mt-5 inline-flex items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-2 px-4 text-xs shadow hover:bg-violet-700 transition-colors">
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative">
      
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center bg-brand-primary text-white px-4 py-3 rounded-lg shadow-lg border border-slate-700 animate-slide-in text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-brand-accent-loc mr-2" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-semibold text-brand-muted hover:text-brand-secondary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Room Information (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-brand-secondary">
                  {location.category}
                </span>
                <span className="text-xs text-brand-muted font-medium">Floor {location.floor === 0 ? 'Ground' : `${location.floor}st`}</span>
              </div>
              <h1 className="text-2xl font-extrabold text-brand-primary">{location.name}</h1>
              <p className="text-xs text-brand-muted flex items-center mt-1">
                <Building2 className="w-4 h-4 mr-1 text-slate-400" />
                <span className="capitalize">{location.buildingId.replace('-', ' ')}</span>
              </p>
            </div>

            <p className="text-sm text-brand-muted leading-relaxed">{location.description}</p>

            {/* Meta attributes */}
            <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-4 text-xs">
              <div className="space-y-1">
                <span className="text-brand-muted font-medium block">Department</span>
                <span className="font-bold text-brand-primary">{location.department || 'General Campus'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-brand-muted font-medium block">Capacity</span>
                <span className="font-bold text-brand-primary">{location.capacity || 'N/A'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-brand-muted font-medium block">Hours of Operation</span>
                <span className="font-bold text-brand-primary flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {location.openingHours}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-brand-muted font-medium block">Room ID</span>
                <span className="font-bold text-brand-primary uppercase">{location.id.split('-').pop()}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-3">
              <Link
                to={`/explore?to=${encodeURIComponent(location.name)}`}
                className="flex-grow inline-flex items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-3 px-4 text-sm shadow hover:bg-violet-700 transition-colors cursor-pointer"
              >
                <Navigation className="w-4 h-4 mr-1.5" />
                Navigate Here
              </Link>
              <button
                onClick={handleToggleFavorite}
                className={`px-3 py-3 border rounded-lg text-sm font-semibold transition-colors flex items-center justify-center cursor-pointer ${
                  isFavorite
                    ? 'border-red-200 bg-red-50 text-brand-accent-dest hover:bg-red-100'
                    : 'border-slate-200 hover:bg-slate-50 text-brand-muted hover:text-brand-secondary'
                }`}
                title={!isAuthenticated ? 'Sign in required to save favorites' : (isFavorite ? 'Remove from Favorites' : 'Add to Favorites')}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-brand-accent-dest' : ''}`} />
              </button>
            </div>

          </div>

          {/* Nearby Locations Card */}
          {nearbyLocs.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-4">Nearby Locations & Landmarks</h3>
              <div className="space-y-3">
                {nearbyLocs.map((nLoc) => (
                  <Link
                    key={nLoc.id}
                    to={`/locations/${nLoc.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 bg-slate-100 rounded text-brand-primary">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-primary">{nLoc.name}</p>
                        <p className="text-[10px] text-brand-muted capitalize">Floor {nLoc.floor} • {nLoc.category}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-brand-secondary hover:underline">View</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Map highlight focused on the room (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-sm font-bold text-brand-primary">Location on Floor Plan</h3>
            <p className="text-xs text-brand-muted mt-0.5">Highlighted below is Room {location.id.split('-').pop()?.toUpperCase()} on Floor {location.floor}.</p>
          </div>

          <IndoorMap
            buildingId={location.buildingId}
            floor={location.floor}
            destinationId={location.id}
          />
        </div>

      </div>

      {/* Toast Notification */}
      {showToast && (
        <div
          className={`fixed bottom-6 right-6 ${
            toastType === 'auth_required'
              ? 'bg-slate-900 border border-amber-500/80 shadow-2xl'
              : 'bg-brand-primary border border-slate-700 shadow-xl'
          } text-white text-xs px-4 py-3 rounded-xl flex items-center space-x-3 z-50 animate-fade-in`}
        >
          {toastType === 'auth_required' ? (
            <>
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-amber-300 text-xs">Authentication Mandatory</p>
                <p className="text-[11px] text-slate-300">{toastMessage}</p>
              </div>
              <button
                onClick={() => navigate('/login', { state: { from: routerLocation } })}
                className="ml-2 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-[11px] rounded transition-colors whitespace-nowrap cursor-pointer shadow"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 text-brand-accent-loc flex-shrink-0" />
              <span>{toastMessage}</span>
            </>
          )}
        </div>
      )}

    </div>
  );
}
