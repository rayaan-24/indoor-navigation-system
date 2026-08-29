import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Compass, Layers, Accessibility, ArrowRight, Building2, MapPin, Award } from 'lucide-react';
import { mockBuildings } from '../../data/mockBuildings';
import { mockLocations } from '../../data/mockLocations';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<typeof mockLocations>([]);
  const navigate = useNavigate();

  // Search logic
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const filtered = mockLocations.filter(loc =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.id.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (locName: string) => {
    navigate(`/explore?to=${encodeURIComponent(locName)}`);
  };

  const popularDestinations = mockLocations.filter(loc => 
    ['b-comp-lab-204', 'a-central-library', 'a-auditorium', 'b-cafeteria', 'c-admin-office'].includes(loc.id)
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-28 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-brand-secondary px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
              <Award className="w-4 h-4" />
              <span>Smart Indoor Wayfinding</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-primary leading-tight">
              Find Your Way <br />
              <span className="text-brand-secondary">Inside.</span>
            </h1>
            <p className="text-lg text-brand-muted max-w-lg leading-relaxed">
              Navigate classrooms, laboratories, offices, departments, and campus facilities with simple, clear indoor directions.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/explore"
                className="inline-flex items-center justify-center rounded-lg bg-brand-secondary px-6 py-3.5 text-base font-semibold text-white shadow-md hover:bg-blue-700 transition-colors"
              >
                Start Navigation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/buildings"
                className="inline-flex items-center justify-center rounded-lg border border-slate-250 bg-white px-6 py-3.5 text-base font-semibold text-brand-primary hover:bg-slate-50 transition-colors border-slate-200"
              >
                Explore Buildings
              </Link>
            </div>

            {/* Quick Search */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-md pt-4">
              <div className="flex items-center border border-slate-300 rounded-xl bg-white shadow-sm overflow-hidden focus-within:border-brand-secondary focus-within:ring-1 focus-within:ring-brand-secondary transition-all">
                <Search className="w-5 h-5 text-brand-muted ml-3" />
                <input
                  type="text"
                  placeholder="Where do you want to go? e.g. Lab B204..."
                  className="w-full px-3 py-3.5 text-sm text-brand-primary bg-transparent focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-slate-100 hover:bg-slate-200 text-brand-primary px-4 py-3.5 text-xs font-semibold border-l border-slate-200"
                >
                  Search
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden divide-y divide-slate-100">
                  {suggestions.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => handleSuggestionClick(loc.name)}
                      className="flex items-center justify-between w-full px-4 py-3 text-left text-sm hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <span className="font-medium text-brand-primary">{loc.name}</span>
                        <span className="text-xs text-brand-muted ml-2">({loc.category})</span>
                      </div>
                      <div className="text-xs text-brand-secondary flex items-center">
                        <span>Floor {loc.floor}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* Hero Right: Custom SVG schematic indoor floor map */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[480px] bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xl overflow-hidden aspect-[4/3] flex items-center justify-center">
              
              {/* Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>

              {/* SVG Floor plan illustration */}
              <svg viewBox="0 0 400 300" className="w-full h-full relative z-10 text-slate-800">
                {/* Rooms */}
                <rect x="20" y="20" width="80" height="70" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
                <text x="60" y="60" textAnchor="middle" className="text-[10px] font-bold fill-brand-primary">Room B201</text>
                
                <rect x="110" y="20" width="180" height="70" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
                <text x="200" y="60" textAnchor="middle" className="text-[10px] font-bold fill-brand-primary">Computer Lab B204</text>
                
                <rect x="300" y="20" width="80" height="70" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
                <text x="340" y="60" textAnchor="middle" className="text-[10px] font-bold fill-brand-primary">Room B202</text>

                {/* Restrooms & Elevator */}
                <rect x="20" y="210" width="60" height="70" rx="4" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
                <text x="50" y="250" textAnchor="middle" className="text-[8px] font-semibold fill-slate-55/40 fill-slate-500">Restroom</text>

                <rect x="90" y="210" width="60" height="70" rx="4" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="2" />
                <text x="120" y="245" textAnchor="middle" className="text-[8px] font-bold fill-brand-secondary">Elevator B2</text>
                
                <rect x="320" y="210" width="60" height="70" rx="4" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="2" strokeDasharray="3,3" />
                <text x="350" y="250" textAnchor="middle" className="text-[8px] font-semibold fill-brand-accent-loc">Exit Stairs</text>

                {/* Main Corridor */}
                <rect x="20" y="110" width="360" height="80" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
                <text x="200" y="150" textAnchor="middle" className="text-[10px] tracking-widest font-semibold fill-slate-400 uppercase">Main Corridor</text>

                {/* Path overlay */}
                <path d="M 120,210 L 120,150 L 200,150 L 200,90" fill="none" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="animate-[dash_2s_linear_infinite]" strokeDasharray="8, 4" />

                {/* Markers */}
                {/* Start Marker */}
                <circle cx="120" cy="210" r="6" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
                
                {/* End Marker */}
                <path d="M 200,75 L 204,83 L 196,83 Z" fill="#EF4444" />
                <circle cx="200" cy="90" r="5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />

                {/* Floor Label overlay */}
                <g transform="translate(310, 160)">
                  <rect width="65" height="20" rx="4" fill="#0A192F" />
                  <text x="32.5" y="13" textAnchor="middle" fill="#FFFFFF" className="text-[9px] font-semibold">2nd Floor</text>
                </g>
              </svg>
            </div>
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold text-brand-primary">How It Works</h2>
            <p className="text-brand-muted text-sm leading-relaxed">
              Navigating complex buildings has never been simpler. Follow these three steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              { num: '01', title: 'Search', desc: 'Find the room, laboratory, department, or facility you need in our directory.' },
              { num: '02', title: 'Choose', desc: 'Select your current location (or starting point) and your target destination.' },
              { num: '03', title: 'Navigate', desc: 'Follow the generated multi-floor route overlay on our interactive map.' }
            ].map((step, idx) => (
              <div key={idx} className="relative bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:shadow-md transition-shadow">
                <span className="text-5xl font-black text-blue-100 absolute top-4 right-6">{step.num}</span>
                <h3 className="text-xl font-bold text-brand-primary mt-4 mb-2">{step.title}</h3>
                <p className="text-sm text-brand-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-brand-primary">Popular Destinations</h2>
              <p className="text-brand-muted text-sm">Frequently visited rooms and amenities across the campus.</p>
            </div>
            <Link to="/locations" className="text-sm font-semibold text-brand-secondary hover:text-blue-700 flex items-center">
              View All Locations
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularDestinations.map(loc => (
              <div key={loc.id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-lg hover:border-slate-300 transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-brand-secondary">
                      {loc.category}
                    </span>
                    <span className="text-xs text-brand-muted font-medium">Floor {loc.floor}</span>
                  </div>
                  <h3 className="text-lg font-bold text-brand-primary group-hover:text-brand-secondary transition-colors">{loc.name}</h3>
                  <p className="text-xs text-brand-muted mt-1 flex items-center">
                    <Building2 className="w-3.5 h-3.5 mr-1" />
                    <span>{loc.buildingId === 'block-b' ? 'Computer Science Block' : loc.buildingId === 'block-a' ? 'Academic Block' : 'Administration Block'}</span>
                  </p>
                  <p className="text-sm text-brand-muted mt-3 line-clamp-2 leading-relaxed">{loc.description}</p>
                </div>
                <div className="mt-6 flex items-center gap-2">
                  <Link
                    to={`/explore?to=${encodeURIComponent(loc.name)}`}
                    className="flex-1 inline-flex items-center justify-center rounded-lg bg-brand-secondary px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Navigate
                  </Link>
                  <Link
                    to={`/locations/${loc.id}`}
                    className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-brand-primary hover:bg-slate-50 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Buildings Preview */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-brand-primary">Explore Campus Buildings</h2>
              <p className="text-brand-muted text-sm">Browse our complex layout floor plans by block.</p>
            </div>
            <Link to="/buildings" className="text-sm font-semibold text-brand-secondary hover:text-blue-700 flex items-center">
              View All Buildings
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockBuildings.map(b => (
              <div key={b.id} className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary text-white mb-4">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-primary">{b.name}</h3>
                  <p className="text-xs text-brand-secondary font-semibold uppercase tracking-wider mt-0.5">{b.id === 'block-b' ? 'Computer Science Block' : b.id === 'block-a' ? 'Academic Block' : 'Administration Block'}</p>
                  <p className="text-sm text-brand-muted mt-3 leading-relaxed">{b.description}</p>
                  
                  <div className="flex gap-4 mt-4 text-xs font-medium text-brand-primary">
                    <span className="flex items-center">
                      <Layers className="w-3.5 h-3.5 mr-1 text-brand-secondary" />
                      {b.floors.length} Floors
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-brand-secondary" />
                      {b.totalLocations} Locations
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200">
                  <Link
                    to={`/buildings/${b.id}`}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-slate-250 bg-white py-2 text-sm font-semibold text-brand-primary hover:bg-slate-50 transition-colors border-slate-200"
                  >
                    View Building Plan
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why IndoorNav? Features */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <h2 className="text-3xl font-bold text-brand-primary">Why IndoorNav?</h2>
            <p className="text-brand-muted text-sm leading-relaxed">
              Designed specifically to resolve modern navigation bottlenecks in high-complexity structures.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Compass className="w-6 h-6" />, title: 'Interactive Indoor Maps', desc: 'Vector SVG maps that allow zoom and click navigation rather than static PDFs.' },
              { icon: <Search className="w-6 h-6" />, title: 'Fast Location Search', desc: 'Find classrooms, faculties, and utilities instantly with responsive autocomplete search.' },
              { icon: <Layers className="w-6 h-6" />, title: 'Multi-Floor Navigation', desc: 'Seamlessly calculate routes going upstairs or via elevators across levels.' },
              { icon: <Accessibility className="w-6 h-6" />, title: 'Accessible Routes', desc: 'Easily isolate routes avoiding staircases for wheelchair access.' }
            ].map((feat, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="h-10 w-10 bg-blue-50 text-brand-secondary rounded-lg flex items-center justify-center mb-4">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-brand-primary mb-2">{feat.title}</h3>
                <p className="text-sm text-brand-muted leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-brand-primary text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1.5px,transparent_1.5px)] bg-[size:32px_32px] opacity-10"></div>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to find your way?</h2>
          <p className="text-slate-300 max-w-xl mx-auto leading-relaxed">
            Access the indoor wayfinding client from any desktop or mobile device. No installations required.
          </p>
          <div>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center rounded-lg bg-brand-secondary px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-blue-700 transition-colors"
            >
              Start Navigating
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
