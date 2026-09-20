import { lazy } from 'react';

/**
 * Route chunks, each with a `preload()` handle.
 *
 * Code-splitting keeps the first load small, but it also means the chunk for a
 * page is only requested at the moment it is clicked — which is exactly when
 * the user is watching, so the wait is the most visible one in the app.
 *
 * Wrapping each `lazy()` with the same factory lets us fetch a chunk *before*
 * the click: on hover or pointer-down over a nav link, and for every route
 * once the browser is idle after first paint. `import()` caches its module, so
 * calling the factory again is free — by the time the route actually renders,
 * React has the component in hand and mounts it in the same frame, with no
 * Suspense fallback in between.
 */
const withPreload = (factory) => {
  const Component = lazy(factory);
  Component.preload = factory;
  return Component;
};

export const Login = withPreload(() => import('./pages/auth/Login'));
export const Register = withPreload(() => import('./pages/auth/Register'));
export const Dashboard = withPreload(() => import('./pages/Dashboard'));
export const Investors = withPreload(() => import('./pages/Investors'));
export const Entrepreneurs = withPreload(() => import('./pages/Entrepreneurs'));
export const Payment = withPreload(() => import('./pages/Payment'));
export const Messages = withPreload(() => import('./pages/Messages'));
export const Notifications = withPreload(() => import('./pages/Notifications'));
export const Reports = withPreload(() => import('./pages/Reports'));
export const ActivityLogs = withPreload(() => import('./pages/ActivityLogs'));
export const Settings = withPreload(() => import('./pages/Settings'));
export const SuperDashboard = withPreload(() => import('./pages/SuperDashboard'));

/** Path → chunk, so a nav link can warm exactly the page it points at. */
export const routePreloaders = {
  '/login': Login.preload,
  '/register/investor': Register.preload,
  '/register/entrepreneur': Register.preload,
  '/dashboard': Dashboard.preload,
  '/investors': Investors.preload,
  '/entrepreneurs': Entrepreneurs.preload,
  '/payment': Payment.preload,
  '/messages': Messages.preload,
  '/notifications': Notifications.preload,
  '/reports': Reports.preload,
  '/activity': ActivityLogs.preload,
  '/settings': Settings.preload,
  '/super': SuperDashboard.preload,
};

/** Warm one route's chunk. Safe to call as often as you like. */
export const preloadRoute = (path) => {
  const load = routePreloaders[path];
  if (load) load().catch(() => {});
};

/**
 * Warm every dashboard chunk once the browser has nothing better to do, one at
 * a time so the prefetch never competes with the data the visible page is
 * fetching. After this runs, every sidebar click is an instant render.
 */
export const preloadAllRoutes = () => {
  const queue = [
    Dashboard, Investors, Entrepreneurs, Payment, Messages,
    Notifications, Reports, ActivityLogs, Settings,
  ];

  const idle =
    typeof window !== 'undefined' && window.requestIdleCallback
      ? window.requestIdleCallback
      : (cb) => setTimeout(cb, 200);

  const next = (i) => {
    if (i >= queue.length) return;
    idle(() => {
      queue[i]
        .preload()
        .catch(() => {})
        .finally(() => next(i + 1));
    });
  };

  next(0);
};
