import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Map } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { footerNavGroups } from '../config/navigation';
import { footerContent } from '../content/footerContent';

export default function Footer() {
  const currentYear = siteConfig.copyrightYear;

  return (
    <footer className="w-full bg-white text-slate-600 border-t border-slate-200 pt-12 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2.5 text-slate-900">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-secondary text-white shadow-xs">
                <MapPin className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">{siteConfig.name}</span>
            </Link>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              {footerContent.aboutBrand}
            </p>
            <div className="flex flex-col space-y-2 text-xs text-slate-500">
              <div className="flex items-center">
                <Mail className="w-3.5 h-3.5 mr-2 text-brand-secondary flex-shrink-0" />
                <span>{footerContent.contact.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-3.5 h-3.5 mr-2 text-brand-secondary flex-shrink-0" />
                <span>{footerContent.contact.phone}</span>
              </div>
            </div>
          </div>

          {/* Navigation Groups from config */}
          {footerNavGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase mb-4">{group.title}</h3>
              <ul className="space-y-2.5 text-xs text-slate-500">
                {group.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    {link.path.startsWith('#') ? (
                      <a href={link.path} className="hover:text-brand-secondary transition-colors">{link.label}</a>
                    ) : (
                      <Link to={link.path} className="hover:text-brand-secondary transition-colors">{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 text-xs text-slate-400 text-center sm:text-left gap-2">
          <p>{footerContent.copyrightNotice(currentYear)}</p>
          <p className="flex items-center justify-center text-slate-400">
            <Map className="w-3.5 h-3.5 mr-1.5 text-brand-secondary" />
            <span>{footerContent.bottomTagline}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
