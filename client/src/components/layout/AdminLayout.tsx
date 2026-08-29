import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Layers,
  DoorOpen,
  MapPin,
  GitCommit,
  Users,
  MessageSquare,
  AlertTriangle,
  BarChart3,
  ArrowLeft,
  Menu,
  X,
  ShieldAlert
} from 'lucide-react';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5 mr-3" />, exact: true },
    { path: '/admin/buildings', label: 'Buildings', icon: <Building2 className="w-5 h-5 mr-3" /> },
    { path: '/admin/floors', label: 'Floors', icon: <Layers className="w-5 h-5 mr-3" /> },
    { path: '/admin/rooms', label: 'Rooms/Locations', icon: <DoorOpen className="w-5 h-5 mr-3" /> },
    { path: '/admin/landmarks', label: 'Landmarks', icon: <MapPin className="w-5 h-5 mr-3" /> },
    { path: '/admin/routes', label: 'Routes Config', icon: <GitCommit className="w-5 h-5 mr-3" /> },
    { path: '/admin/users', label: 'User Directory', icon: <Users className="w-5 h-5 mr-3" /> },
    { path: '/admin/feedback', label: 'User Feedback', icon: <MessageSquare className="w-5 h-5 mr-3" /> },
    { path: '/admin/reports', label: 'Issue Reports', icon: <AlertTriangle className="w-5 h-5 mr-3" /> },
    { path: '/admin/analytics', label: 'Usage Analytics', icon: <BarChart3 className="w-5 h-5 mr-3" /> },
  ];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-brand-primary text-white transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <Link to="/admin" className="flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-brand-secondary" />
            <span className="text-lg font-bold tracking-wider">IndoorNav Admin</span>
          </Link>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-secondary text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800">
          <Link
            to="/"
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Public Site
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="flex items-center">
            <button
              className="p-1 text-slate-55/40 text-slate-500 hover:text-brand-secondary md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="hidden md:block text-lg font-semibold text-brand-primary">Management Console</h2>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-brand-primary">System Administrator</p>
              <p className="text-xs text-brand-muted">admin@indoornav.com</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-brand-primary font-bold border border-slate-300">
              A
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
