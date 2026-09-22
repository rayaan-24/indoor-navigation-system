import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MapPin, Menu, X, User, LogOut, Compass, Building2, Search, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: <Compass className="w-4 h-4 mr-1.5" /> },
    { path: '/explore', label: 'Explore', icon: <MapPin className="w-4 h-4 mr-1.5" /> },
    { path: '/buildings', label: 'Buildings', icon: <Building2 className="w-4 h-4 mr-1.5" /> },
    { path: '/locations', label: 'Locations', icon: <Search className="w-4 h-4 mr-1.5" /> },
    { path: '/about', label: 'About', icon: null },
    { path: '/help', label: 'Help', icon: null },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link to={isAuthenticated ? "/" : "/login"} className="flex items-center space-x-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-secondary text-white transition-transform group-hover:scale-105">
            <MapPin className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-brand-primary">IndoorNav</span>
            <span className="text-[10px] text-brand-muted -mt-1">Find Your Way Inside.</span>
          </div>
        </Link>

        {/* Desktop Navigation - Only visible when authenticated */}
        {isAuthenticated && (
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-brand-secondary'
                      : 'text-brand-text hover:bg-slate-55/40 hover:text-brand-secondary hover:bg-slate-55'
                  }`
                }
              >
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
                className="flex items-center space-x-2 text-sm font-medium text-brand-text hover:text-brand-secondary transition-colors px-2 py-1.5 rounded-md hover:bg-slate-50"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-brand-primary font-bold border border-slate-300">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span>Profile</span>
              </Link>
              
              {/* Optional Admin quick link */}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="p-2 text-brand-muted hover:text-brand-secondary transition-colors"
                  title="Admin Dashboard"
                >
                  <Settings className="w-5 h-5" />
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center text-sm font-medium text-brand-muted hover:text-brand-accent-dest transition-colors px-2 py-1.5 rounded-md hover:bg-slate-50 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-1" />
                <span>Logout</span>
              </button>

              <Link
                to="/explore"
                className="inline-flex items-center justify-center rounded-lg bg-brand-secondary px-4 py-2 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.02] hover:bg-blue-700 active:scale-100"
              >
                Start Navigation
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-sm font-medium text-brand-text hover:text-brand-secondary transition-colors px-3 py-2 rounded-md hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-lg bg-brand-secondary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center space-x-2">
          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin" className="p-1.5 text-brand-muted hover:text-brand-secondary">
              <Settings className="w-5 h-5" />
            </Link>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-brand-text hover:bg-slate-100 hover:text-brand-secondary transition-colors"
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
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-brand-secondary'
                        : 'text-brand-text hover:bg-slate-55'
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
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-base font-medium text-brand-text hover:bg-slate-50 hover:text-brand-secondary"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-brand-primary font-bold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span>My Profile</span>
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center w-full px-3 py-2.5 rounded-md text-base font-medium text-brand-muted hover:bg-slate-50 hover:text-brand-accent-dest text-left cursor-pointer"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </button>
                <Link
                  to="/explore"
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center justify-center rounded-lg bg-brand-secondary py-2.5 text-base font-medium text-white shadow-sm hover:bg-blue-700"
                >
                  Start Navigation
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-brand-text hover:bg-slate-50"
              >
                <User className="w-5 h-5 mr-3" />
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center rounded-lg bg-brand-secondary py-2.5 text-base font-medium text-white shadow-sm hover:bg-blue-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
