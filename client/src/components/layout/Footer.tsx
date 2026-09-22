import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Map } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-brand-primary text-slate-350 border-t border-slate-800 pt-12 pb-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-secondary">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">IndoorNav</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              Smart indoor navigation for modern campuses and complex architectural buildings. Find rooms and facilities with ease.
            </p>
            <div className="flex flex-col space-y-2 text-xs text-slate-405 text-slate-400">
              <div className="flex items-center">
                <Mail className="w-3.5 h-3.5 mr-2 text-brand-secondary" />
                <span>support@indoornav.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-3.5 h-3.5 mr-2 text-brand-secondary" />
                <span>+91 8838545775</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">Explore Map</Link>
              </li>
              <li>
                <Link to="/buildings" className="hover:text-white transition-colors">Buildings</Link>
              </li>
              <li>
                <Link to="/locations" className="hover:text-white transition-colors">Locations Directory</Link>
              </li>
            </ul>
          </div>

          {/* Information & Support */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Information</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-white transition-colors">Help & FAQ</Link>
              </li>
              <li>
                <Link to="/feedback" className="hover:text-white transition-colors">Report an Issue</Link>
              </li>
              <li>
                <Link to="/feedback" className="hover:text-white transition-colors">Submit Feedback</Link>
              </li>
            </ul>
          </div>

          {/* Legal Pages */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">System Admin Access</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 text-xs text-slate-500 text-center sm:text-left">
          <p>© {currentYear} IndoorNav. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center justify-center">
            <Map className="w-3.5 h-3.5 mr-1" />
            <span>Designed for modern academic and office campuses.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
