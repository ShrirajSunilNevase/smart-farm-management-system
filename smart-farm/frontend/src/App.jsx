import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import FarmerLogin from './pages/FarmerLogin';
import FarmerRegister from './pages/FarmerRegister';
import AdminLogin from './pages/AdminLogin';

import FarmerLayout from './components/farmer/FarmerLayout';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FarmerProfile from './pages/farmer/FarmerProfile';
import FarmerLand from './pages/farmer/FarmerLand';
import FarmerCrops from './pages/farmer/FarmerCrops';
import FarmerEquipment from './pages/farmer/FarmerEquipment';

import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFarmers from './pages/admin/AdminFarmers';
import AdminLandVerification from './pages/admin/AdminLandVerification';
import AdminCropMonitor from './pages/admin/AdminCropMonitor';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/farmer'} replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/farmer/login" element={<PublicRoute><FarmerLogin /></PublicRoute>} />
          <Route path="/farmer/register" element={<PublicRoute><FarmerRegister /></PublicRoute>} />
          <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />

          <Route path="/farmer" element={<ProtectedRoute role="farmer"><FarmerLayout /></ProtectedRoute>}>
            <Route index element={<FarmerDashboard />} />
            <Route path="profile" element={<FarmerProfile />} />
            <Route path="land" element={<FarmerLand />} />
            <Route path="crops" element={<FarmerCrops />} />
            <Route path="equipment" element={<FarmerEquipment />} />
          </Route>

          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="farmers" element={<AdminFarmers />} />
            <Route path="land" element={<AdminLandVerification />} />
            <Route path="crops" element={<AdminCropMonitor />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
