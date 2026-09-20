import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import PageSkeleton from './PageSkeleton';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, loading } = useAuth();

  // Whatever changed the page — a nav link, the bell, the avatar, the back
  // button — the mobile drawer should not still be open on the new one.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas">
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="lg:pl-[236px]">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="px-4 pb-10 pt-4 sm:px-6">
          {/*
            No AnimatePresence here on purpose.

            `AnimatePresence mode="wait"` held the outgoing page on screen for
            the whole length of its exit animation before mounting the next
            one, so every sidebar click cost ~300ms of nothing happening. The
            new page now mounts immediately and fades up on its own; `key` on
            the path still restarts the animation per route, and scroll
            position resets because the subtree is replaced.

            The Suspense boundary sits here rather than around the whole app,
            so a chunk that has not been warmed yet swaps only the content
            area — the sidebar and topbar stay put.
          */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
