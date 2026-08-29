import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navigation, MapPin, Building2, Clock, ArrowLeft, Heart, CheckCircle } from 'lucide-react';
import { mockLocations } from '../../data/mockLocations';
import { mockBuildings } from '../../data/mockBuildings';
import IndoorMap from '../../components/map/IndoorMap';

export default function LocationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [location, setLocation] = useState<typeof mockLocations[0] | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const foundLoc = mockLocations.find(l => l.id === id);
    if (foundLoc) {
      setLocation(foundLoc);
      
      // Check favorites list
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favorites.some((favId: string) => favId === foundLoc.id));
    }
  }, [id]);

  if (!location) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold text-brand-primary">Location not found</h2>
        <p className="text-brand-muted text-sm mt-2">The room or amenity ID you requested does not exist in our directory.</p>
        <Link to="/locations" className="mt-5 inline-flex items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-2 px-4 text-xs shadow hover:bg-blue-700 transition-colors">
          Back to Directory
        </Link>
      </div>
    );
  }

  const bName = mockBuildings.find(b => b.id === location.buildingId)?.name || location.buildingId;

  // Toggle favorite
  const handleToggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let updatedFavorites;
    if (isFavorite) {
      updatedFavorites = favorites.filter((favId: string) => favId !== location.id);
      setToastMessage('Removed from favorites.');
    } else {
      updatedFavorites = [...favorites, location.id];
      setToastMessage('Added to favorites.');
    }
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setIsFavorite(!isFavorite);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Find nearby location details
  const nearbyLocs = mockLocations.filter(loc => 
    location.nearbyLocations?.includes(loc.id)
  );

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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-brand-secondary">
                  {location.category}
                </span>
                <span className="text-xs text-brand-muted font-medium">Floor {location.floor === 0 ? 'Ground' : `${location.floor}st`}</span>
              </div>
              <h1 className="text-2xl font-extrabold text-brand-primary">{location.name}</h1>
              <p className="text-xs text-brand-muted flex items-center mt-1">
                <Building2 className="w-4 h-4 mr-1 text-slate-400" />
                <span>{bName}</span>
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
                  {location.openingHours || '09:00 AM - 05:00 PM'}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-brand-muted font-medium block">Room Number</span>
                <span className="font-bold text-brand-primary">{location.id.split('-').pop()?.toUpperCase()}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-3">
              <Link
                to={`/explore?to=${encodeURIComponent(location.name)}`}
                className="flex-grow inline-flex items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-3 px-4 text-sm shadow hover:bg-blue-700 transition-colors cursor-pointer"
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
                title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
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

    </div>
  );
}
