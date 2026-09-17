import { useNavigate } from 'react-router-dom';
import { Menu, Search, LogOut, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar } from './ui/Bits';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ onMenu }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-20 flex items-center gap-3 border-b border-line/70 bg-canvas/85 px-4 py-3 backdrop-blur sm:px-6"
    >
      <button
        onClick={onMenu}
        aria-label="Open menu"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line bg-white lg:hidden"
      >
        <Menu size={18} />
      </button>

      <div className="relative max-w-md flex-1">
        <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input
          className="input h-10 rounded-full pl-9 text-[13px]"
          placeholder="Search"
          aria-label="Search"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-xl border border-line bg-white transition hover:bg-brand-50"
        >
          <Bell size={16} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-3 pr-1 transition hover:bg-brand-50"
        >
          <span className="hidden text-[13px] font-semibold sm:block">{user?.fullName || 'Admin'}</span>
          <Avatar src={user?.avatar} name={user?.fullName} gender={user?.gender} size={28} />
        </button>

        <button
          onClick={logout}
          aria-label="Sign out"
          className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-white text-ink-muted transition hover:bg-rose-50 hover:text-rose-500"
        >
          <LogOut size={16} />
        </button>
      </div>
    </motion.header>
  );
};

export default Topbar;
