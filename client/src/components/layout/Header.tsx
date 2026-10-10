import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MapPin, Menu, X, User, LogOut, Compass, Building2, Search, Settings, Info, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { siteConfig } from '../../config/siteConfig';
import { headerNavLinks, actionLabels } from '../../config/navigation';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Compass': return <Compass className="w-4 h-4 mr-1.5" />;
      case 'MapPin': return <MapPin className="w-4 h-4 mr-1.5" />;
      case 'Building2': return <Building2 className="w-4 h-4 mr-1.5" />;
      case 'Search': return <Search className="w-4 h-4 mr-1.5" />;
      case 'Info': return <Info className="w-4 h-4 mr-1.5" />;
      case 'HelpCircle': return <HelpCircle className="w-4 h-4 mr-1.5" />;
      default: return null;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link to={isAuthenticated ? "/" : "/login"} className="flex items-center space-x-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-secondary text-white transition-transform group-hover:scale-105">
            <MapPin className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-brand-primary">{siteConfig.name}</span>
            <span className="text-[10px] text-brand-muted -mt-1">{siteConfig.tagline}</span>
          </div>
        </Link>

        {/* Desktop Navigation - Only visible when authenticated */}
        {isAuthenticated && (
          <nav className="hidden md:flex space-x-1 lg:space-x-1.5">
            {headerNavLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-violet-50 text-brand-secondary font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-brand-secondary'
                  }`
                }
              >
                {getNavIcon(link.iconName)}
                {link.label}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Right Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated && user ? (
            <>
              {/* User Dropdown/Profile Link */}
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-sm font-medium text-slate-700 hover:text-brand-secondary transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-50"
              >
                <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center text-brand-secondary font-bold border border-violet-100 text-xs">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span>Profile</span>
              </Link>
              
              {/* Optional Admin quick link */}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="p-2 text-slate-500 hover:text-brand-secondary hover:bg-slate-50 rounded-lg transition-colors"
                  title="Admin Dashboard"
                >
                  <Settings className="w-4 h-4" />
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center text-sm font-medium text-slate-500 hover:text-brand-accent-dest transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-1" />
                <span>Logout</span>
              </button>

              <Link
                to="/explore"
                className="inline-flex items-center justify-center rounded-lg bg-brand-secondary px-4 py-2 text-sm font-semibold text-white shadow-xs transition-all hover:bg-violet-700 active:scale-[0.98]"
              >
                {actionLabels.startNavigation}
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-600 hover:text-brand-secondary transition-colors px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                {actionLabels.login}
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-lg bg-brand-secondary px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-violet-700 transition-colors"
              >
                {actionLabels.register}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center space-x-2">
          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin" className="p-1.5 text-slate-500 hover:text-brand-secondary" title={actionLabels.adminDashboard}>
              <Settings className="w-5 h-5" />
            </Link>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center p-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-secondary transition-colors"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Navigation */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {isAuthenticated ? (
            <>
              {headerNavLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-violet-50 text-brand-secondary font-semibold'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-brand-secondary'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <hr className="my-2 border-slate-200" />
              <div className="pt-2 flex flex-col space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-secondary"
                >
                  <div className="w-7 h-7 rounded-full bg-violet-50 flex items-center justify-center text-brand-secondary font-bold text-xs border border-violet-100">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span>{actionLabels.myProfile}</span>
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-brand-accent-dest text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  {actionLabels.logout}
                </button>
                <Link
                  to="/explore"
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center justify-center rounded-lg bg-brand-secondary py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-violet-700"
                >
                  {actionLabels.startNavigation}
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <User className="w-4 h-4 mr-3" />
                {actionLabels.login}
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center rounded-lg bg-brand-secondary py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-violet-700"
              >
                {actionLabels.register}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
