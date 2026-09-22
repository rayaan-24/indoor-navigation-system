import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Map } from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';
import { footerNavGroups } from '../../config/navigation';
import { footerContent } from '../../content/footerContent';

export default function Footer() {
  const currentYear = siteConfig.copyrightYear;

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
              <span className="text-lg font-bold tracking-tight">{siteConfig.name}</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              {footerContent.aboutBrand}
            </p>
            <div className="flex flex-col space-y-2 text-xs text-slate-400">
              <div className="flex items-center">
                <Mail className="w-3.5 h-3.5 mr-2 text-brand-secondary" />
                <span>{footerContent.contact.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-3.5 h-3.5 mr-2 text-brand-secondary" />
                <span>{footerContent.contact.phone}</span>
              </div>
            </div>
          </div>

          {/* Navigation Groups from config */}
          {footerNavGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">{group.title}</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                {group.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    {link.path.startsWith('#') ? (
                      <a href={link.path} className="hover:text-white transition-colors">{link.label}</a>
                    ) : (
                      <Link to={link.path} className="hover:text-white transition-colors">{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 text-xs text-slate-500 text-center sm:text-left">
          <p>{footerContent.copyrightNotice(currentYear)}</p>
          <p className="mt-2 sm:mt-0 flex items-center justify-center">
            <Map className="w-3.5 h-3.5 mr-1" />
            <span>{footerContent.bottomTagline}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
