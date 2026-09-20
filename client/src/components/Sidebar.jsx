import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Briefcase, Wallet, MessagesSquare, Bell,
  BarChart3, ScrollText, Settings, X, LogOut, ShieldCheck,
} from 'lucide-react';
import Logo from './ui/Logo';
import { useAuth } from '../context/AuthContext';
import { preloadRoute } from '../routes';

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

/** Only the super admin sees this entry. */
export const superItem = { to: '/super', label: 'Super Dashboard', icon: ShieldCheck };

const NavList = ({ onNavigate, animated = true, isSuper = false }) => (
  <nav className="flex flex-1 flex-col gap-1 px-3">
    {(isSuper ? [superItem, ...navItems] : navItems).map(({ to, label, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        onClick={onNavigate}
        /*
          Warm the page's chunk the moment the pointer arrives — and again on
          press, which covers touch, where there is no hover. By the time the
          click registers the module is already loaded, so the page renders
          straight away instead of flashing a loader.
        */
        onMouseEnter={() => preloadRoute(to)}
        onFocus={() => preloadRoute(to)}
        onTouchStart={() => preloadRoute(to)}
        onPointerDown={() => preloadRoute(to)}
        className={({ isActive }) =>
          `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition ${
            isActive ? 'text-white' : 'text-white/65 hover:bg-white/10 hover:text-white'
          }`
        }
      >
        {({ isActive }) => (
          <>
            {isActive && animated && (
              <motion.span
                layoutId="side-active"
                className="absolute inset-0 rounded-xl bg-white/15 ring-1 ring-white/15"
                transition={{ type: 'spring', stiffness: 520, damping: 40 }}
              />
            )}
            {isActive && !animated && (
              <span className="absolute inset-0 rounded-xl bg-white/15 ring-1 ring-white/15" />
            )}
            <Icon size={17} strokeWidth={1.9} className="relative z-10 shrink-0" />
            <span className="relative z-10">{label}</span>
          </>
        )}
      </NavLink>
    ))}
  </nav>
);

/**
 * The panel lives at module level on purpose. It used to be declared inside
 * Sidebar, which made it a brand-new component type on every render — React
 * threw the whole drawer away and rebuilt it each time, and a tap that landed
 * mid-rebuild was lost.
 */
const Panel = ({ mobile = false, onClose }) => {
  const { user, logout } = useAuth();
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-deep-green py-5 text-white">
      <div className="flex items-center justify-between px-5 pb-6">
        <Logo size="sm" tone="light" animate={false} />
        {mobile && (
          <button onClick={onClose} aria-label="Close menu" className="rounded-lg p-1.5 hover:bg-white/10">
            <X size={18} />
          </button>
        )}
      </div>

      <NavList onNavigate={mobile ? onClose : undefined} animated={!mobile} isSuper={user?.role === 'superadmin'} />

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
};

/**
 * Mobile drawer.
 *
 * It is always mounted and simply slides in and out. The previous version
 * mounted it inside <AnimatePresence>, and on phones the exit never finished
 * unmounting: the backdrop faded to opacity 0 but stayed on top of the page,
 * an invisible sheet that swallowed every tap after the first navigation.
 * Now, when closed, both layers get `pointer-events: none` and `invisible`,
 * so nothing can sit over the page.
 */
const Sidebar = ({ open, onClose }) => (
  <>
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[236px] lg:block">
      <Panel />
    </aside>

    <div className="lg:hidden">
      <motion.div
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-40 bg-ink/40 ${open ? '' : 'pointer-events-none invisible'}`}
        style={{ transitionProperty: 'visibility', transitionDelay: open ? '0s' : '0.2s' }}
      />
      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-50 w-[264px] ${open ? '' : 'pointer-events-none'}`}
      >
        <Panel mobile onClose={onClose} />
      </motion.aside>
    </div>
  </>
);

export default Sidebar;
