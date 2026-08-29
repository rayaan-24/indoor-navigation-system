import { Link } from 'react-router-dom';
import { Building2, Layers, MapPin, ArrowRight } from 'lucide-react';
import { mockBuildings } from '../../data/mockBuildings';

export default function Buildings() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Header */}
      <div className="pb-6 mb-8 border-b border-slate-200">
        <h1 className="text-3xl font-extrabold text-brand-primary">Explore Campus Buildings</h1>
        <p className="text-brand-muted text-sm mt-1">Browse building layouts, floor maps, and directories of classrooms, labs, and office spaces.</p>
      </div>

      {/* Buildings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {mockBuildings.map((building) => (
          <div
            key={building.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all group"
          >
            {/* Custom SVG building illustration preview */}
            <div className="h-48 bg-slate-900 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:16px_16px] opacity-10"></div>
              <Building2 className="w-16 h-16 text-slate-500 absolute scale-110 opacity-10" />
              
              {/* Animated schematic representation of layers */}
              <div className="flex flex-col space-y-1 relative z-10 w-24">
                {building.floors.slice().reverse().map((fl) => (
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
                {building.id.toUpperCase()}
              </div>
            </div>

            {/* Building Body Details */}
            <div className="p-6 flex-grow flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-brand-primary group-hover:text-brand-secondary transition-colors">
                  {building.name}
                </h3>
                <p className="text-xs text-brand-muted font-semibold uppercase mt-0.5 tracking-wider">
                  {building.id === 'block-b'
                    ? 'Computer Science Block'
                    : building.id === 'block-a'
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
                    {building.floors.length} Floor Levels
                  </span>
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1.5 text-brand-secondary" />
                    {building.totalLocations} Managed Rooms
                  </span>
                </div>

                <Link
                  to={`/buildings/${building.id}`}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-2.5 px-4 text-sm shadow hover:bg-blue-700 transition-colors group cursor-pointer"
                >
                  <span>Explore Floor Plans</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
