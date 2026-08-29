import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import AdminLayout from '../components/layout/AdminLayout';

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
      {/* Public / User Dashboard Pages */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="locations" element={<Locations />} />
        <Route path="locations/:id" element={<LocationDetails />} />
        <Route path="buildings" element={<Buildings />} />
        <Route path="buildings/:id" element={<BuildingDetails />} />
        <Route path="about" element={<About />} />
        <Route path="help" element={<Help />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="profile" element={<Profile />} />
        <Route path="feedback" element={<Feedback />} />
      </Route>

      {/* Admin Panel Pages */}
      <Route path="/admin" element={<AdminLayout />}>
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
