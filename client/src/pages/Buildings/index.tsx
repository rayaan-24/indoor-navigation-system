import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Layers, MapPin, ArrowRight, AlertCircle } from 'lucide-react';
import { getBuildings } from '../../services/buildingService';

interface BuildingBackendData {
  _id: string;
  name: string;
  code: string;
  description: string;
  numberOfFloors: number;
  numberOfLocations: number;
  isActive: boolean;
}

export default function Buildings() {
  const [buildings, setBuildings] = useState<BuildingBackendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const response = await getBuildings();
        if (response.success) {
          setBuildings(response.data);
        } else {
          setError('Failed to retrieve buildings data.');
        }
      } catch (err: any) {
        console.error('Error fetching buildings:', err);
        setError('Unable to load buildings. Please ensure the server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchBuildings();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Header */}
      <div className="pb-6 mb-8 border-b border-slate-200">
        <h1 className="text-3xl font-extrabold text-brand-primary">Explore Campus Buildings</h1>
        <p className="text-brand-muted text-sm mt-1">Browse building layouts, floor maps, and directories of classrooms, labs, and office spaces.</p>
      </div>

      {loading ? (
        // Loading Skeleton State
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-xl border border-slate-200 shadow-sm h-96 animate-pulse p-6 space-y-4">
              <div className="h-40 bg-slate-100 rounded-lg"></div>
              <div className="h-6 bg-slate-100 rounded w-2/3"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2"></div>
              <div className="h-4 bg-slate-100 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        // Error State View
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-xl mx-auto space-y-4">
          <AlertCircle className="w-10 h-10 text-brand-accent-dest mx-auto" />
          <h3 className="text-lg font-bold text-red-900">API Error</h3>
          <p className="text-xs text-red-700 leading-normal">{error}</p>
          <button
            onClick={() => { setLoading(true); setError(''); window.location.reload(); }}
            className="inline-flex items-center justify-center rounded-lg bg-red-650 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 text-xs shadow cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        // Buildings Grid
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {buildings.map((building) => {
            const buildingFloors = Array.from({ length: building.numberOfFloors }, (_, i) => i);
            
            return (
              <div
                key={building._id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all group"
              >
                {/* Custom SVG building illustration preview */}
                <div className="h-48 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:16px_16px] opacity-10"></div>
                  <Building2 className="w-16 h-16 text-slate-500 absolute scale-110 opacity-10" />
                  
                  {/* Animated schematic representation of layers */}
                  <div className="flex flex-col space-y-1 relative z-10 w-24">
                    {buildingFloors.slice().reverse().map((fl) => (
                      <div
                        key={fl}
                        className="h-4 border border-brand-secondary/60 rounded flex items-center justify-center text-[8px] font-bold text-white transition-all bg-brand-secondary/40 hover:bg-brand-secondary"
                      >
                        <span>FL {fl}</span>
                      </div>
                    ))}
                  </div>

                  {/* Building Tag */}
                  <div className="absolute bottom-4 left-4 bg-brand-primary text-white text-xs font-semibold px-2.5 py-1 rounded border border-slate-700">
                    {building.code.toUpperCase()}
                  </div>
                </div>

                {/* Building Body Details */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-brand-primary group-hover:text-brand-secondary transition-colors">
                      {building.name}
                    </h3>
                    <p className="text-xs text-brand-muted font-semibold uppercase mt-0.5 tracking-wider">
                      {building.code === 'block-b'
                        ? 'Computer Science Block'
                        : building.code === 'block-a'
                        ? 'Academic Block'
                        : 'Administration Block'}
                    </p>
                    <p className="text-sm text-brand-muted mt-3 leading-relaxed">
                      {building.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-semibold text-brand-primary mb-4">
                      <span className="flex items-center">
                        <Layers className="w-4 h-4 mr-1.5 text-brand-secondary" />
                        {building.numberOfFloors} Floor Levels
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1.5 text-brand-secondary" />
                        {building.numberOfLocations} Managed Rooms
                      </span>
                    </div>

                    <Link
                      to={`/buildings/${building.code}`}
                      className="inline-flex w-full items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-2.5 px-4 text-sm shadow hover:bg-blue-700 transition-colors group cursor-pointer"
                    >
                      <span>Explore Floor Plans</span>
                      <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
