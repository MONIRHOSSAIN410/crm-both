import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Briefcase, Wallet, MessagesSquare, Bell,
  BarChart3, ScrollText, Settings, X, LogOut,
} from 'lucide-react';
import Logo from './ui/Logo';
import { useAuth } from '../context/AuthContext';

export const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/investors', label: 'Investors', icon: Users },
  { to: '/entrepreneurs', label: 'Entrepreneur', icon: Briefcase },
  { to: '/payment', label: 'Payment', icon: Wallet },
  { to: '/messages', label: 'Contacts', icon: MessagesSquare },
  { to: '/notifications', label: 'Notification', icon: Bell },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/activity', label: 'Activity Logs', icon: ScrollText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const NavList = ({ onNavigate }) => (
  <nav className="flex flex-1 flex-col gap-1 px-3">
    {navItems.map(({ to, label, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        onClick={onNavigate}
        className={({ isActive }) =>
          `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition ${
            isActive ? 'text-white' : 'text-white/65 hover:bg-white/10 hover:text-white'
          }`
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <motion.span
                layoutId="side-active"
                className="absolute inset-0 rounded-xl bg-white/15 ring-1 ring-white/15"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <Icon size={17} strokeWidth={1.9} className="relative z-10 shrink-0" />
            <span className="relative z-10">{label}</span>
          </>
        )}
      </NavLink>
    ))}
  </nav>
);

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();

  const Panel = ({ mobile = false }) => (
    <div className="flex h-full flex-col bg-deep-green py-5 text-white">
      <div className="flex items-center justify-between px-5 pb-6">
        <Logo size="sm" />
        {mobile && (
          <button onClick={onClose} aria-label="Close menu" className="rounded-lg p-1.5 hover:bg-white/10">
            <X size={18} />
          </button>
        )}
      </div>

      <NavList onNavigate={mobile ? onClose : undefined} />

      <div className="mt-4 px-3">
        <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
          <p className="truncate text-[13px] font-semibold">{user?.fullName || 'Admin'}</p>
          <p className="truncate text-[11px] text-white/60">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-lg bg-white/15 py-2 text-xs font-semibold transition hover:bg-white/25"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[236px] lg:block">
        <Panel />
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 w-[264px] lg:hidden"
            >
              <Panel mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
