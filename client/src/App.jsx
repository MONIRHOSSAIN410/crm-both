import { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import DashboardLayout from './components/DashboardLayout';
import { ScreenSpinner } from './components/PageSkeleton';
import {
  Login, Register, Dashboard, Investors, Entrepreneurs, Payment,
  Messages, Notifications, Reports, ActivityLogs, Settings,
  preloadAllRoutes,
} from './routes';

const App = () => {
  // Fetch every page chunk once the browser goes idle after first paint, so a
  // sidebar click renders the page in the same frame instead of waiting on a
  // network round trip. See routes.js.
  useEffect(() => {
    preloadAllRoutes();
  }, []);

  return (
    <Routes>
      {/* Auth screens sit outside the dashboard shell, so they carry their
          own boundary. */}
      <Route
        path="/login"
        element={
          <Suspense fallback={<ScreenSpinner />}>
            <Login />
          </Suspense>
        }
      />
      <Route
        path="/register/investor"
        element={
          <Suspense fallback={<ScreenSpinner />}>
            <Register role="investor" />
          </Suspense>
        }
      />
      <Route
        path="/register/entrepreneur"
        element={
          <Suspense fallback={<ScreenSpinner />}>
            <Register role="entrepreneur" />
          </Suspense>
        }
      />
      <Route path="/register" element={<Navigate to="/register/investor" replace />} />

      {/* The shell stays mounted across every dashboard route — its own
          Suspense boundary lives around the outlet inside DashboardLayout, so
          the sidebar and topbar never blank out mid-navigation. */}
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
  );
};

export default App;
