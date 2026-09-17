import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout (keep standard import or lazy load as needed)
import DashboardLayout from './components/DashboardLayout';

// Dynamically imported components
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Investors = lazy(() => import('./pages/Investors'));
const Entrepreneurs = lazy(() => import('./pages/Entrepreneurs'));
const Payment = lazy(() => import('./pages/Payment'));
const Messages = lazy(() => import('./pages/Messages'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Reports = lazy(() => import('./pages/Reports'));
const ActivityLogs = lazy(() => import('./pages/ActivityLogs'));
const Settings = lazy(() => import('./pages/Settings'));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register/investor" element={<Register role="investor" />} />
      <Route path="/register/entrepreneur" element={<Register role="entrepreneur" />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/investors" element={<Investors />} />
        <Route path="/entrepreneurs" element={<Entrepreneurs />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/activity" element={<ActivityLogs />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Suspense>
);

export default App;