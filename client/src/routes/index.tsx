import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import AdminLayout from '../components/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';

import Home from '../pages/Home';
import Explore from '../pages/Explore';
import Locations from '../pages/Locations';
import LocationDetails from '../pages/LocationDetails';
import Buildings from '../pages/Buildings';
import BuildingDetails from '../pages/BuildingDetails';
import About from '../pages/About';
import Help from '../pages/Help';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Feedback from '../pages/Feedback';

import AdminDashboard from '../pages/Admin/Dashboard';
import {
  AdminBuildings,
  AdminFloors,
  AdminRooms,
  AdminLandmarks,
  AdminRoutes,
  AdminUsers,
  AdminFeedback,
  AdminReports,
  AdminAnalytics
} from '../pages/Admin/ResourcePages';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Protected User & Navigation Pages */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="locations" element={<ProtectedRoute><Locations /></ProtectedRoute>} />
        <Route path="locations/:id" element={<ProtectedRoute><LocationDetails /></ProtectedRoute>} />
        <Route path="buildings" element={<ProtectedRoute><Buildings /></ProtectedRoute>} />
        <Route path="buildings/:id" element={<ProtectedRoute><BuildingDetails /></ProtectedRoute>} />
        <Route path="about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        <Route path="help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
      </Route>

      {/* Admin Panel Pages */}
      <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="buildings" element={<AdminBuildings />} />
        <Route path="floors" element={<AdminFloors />} />
        <Route path="rooms" element={<AdminRooms />} />
        <Route path="landmarks" element={<AdminLandmarks />} />
        <Route path="routes" element={<AdminRoutes />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="feedback" element={<AdminFeedback />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>
    </Routes>
  );
}
