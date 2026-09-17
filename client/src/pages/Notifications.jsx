import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CheckCheck, SlidersHorizontal, MoreHorizontal, ChevronDown } from 'lucide-react';
import api from '../api/axios';
import { Card, timeAgo } from '../components/ui/Bits';
import useFetch from '../hooks/useFetch';
import { demoNotifications } from '../data/demo';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
];

const Notifications = () => {
  const { data, setData, reload } = useFetch('/notifications', {
    fallback: { notifications: demoNotifications, unread: 4 },
  });
  const [filter, setFilter] = useState('all');
  const [openFilter, setOpenFilter] = useState(false);

  const list = data?.notifications?.length ? data.notifications : demoNotifications;
  const rows = list.filter((n) =>
    filter === 'all' ? true : filter === 'unread' ? !n.read : n.read
  );

  const toggle = async (n) => {
    setData((d) => ({
      ...d,
      notifications: d.notifications.map((x) => (x._id === n._id ? { ...x, read: !x.read } : x)),
    }));
    try {
      await api.patch(`/notifications/${n._id}/read`, { read: !n.read });
    } catch {
      /* offline demo */
    }
  };

  const markAll = async () => {
    setData((d) => ({ ...d, notifications: d.notifications.map((x) => ({ ...x, read: true })) }));
    try {
      await api.patch('/notifications/read-all');
      reload();
    } catch {
      /* offline demo */
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold tracking-tight text-ink">Notification</h1>

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button onClick={markAll} className="btn-sun py-2 text-xs">
            <Check size={14} /> Mark
          </button>
          <button onClick={markAll} className="btn-sun py-2 text-xs">
            <CheckCheck size={14} /> Mark all
          </button>

          <div className="relative ml-auto">
            <button
              onClick={() => setOpenFilter((o) => !o)}
              className="btn-ghost py-2 text-xs"
              aria-expanded={openFilter}
            >
              <SlidersHorizontal size={14} /> Filter
              <ChevronDown size={13} />
            </button>
            <AnimatePresence>
              {openFilter && (
                <motion.ul
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 z-10 mt-1.5 w-36 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-card"
                >
                  {FILTERS.map((f) => (
                    <li key={f.value}>
                      <button
                        onClick={() => {
                          setFilter(f.value);
                          setOpenFilter(false);
                        }}
                        className={`block w-full px-3 py-2 text-left text-xs transition hover:bg-brand-50 ${
                          filter === f.value ? 'font-semibold text-brand-700' : 'text-ink-muted'
                        }`}
                      >
                        {f.label}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>

        <ul className="divide-y divide-line/70">
          <AnimatePresence initial={false}>
            {rows.map((n, i) => (
              <motion.li
                key={n._id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group flex items-start gap-3 py-3.5"
              >
                <button
                  onClick={() => toggle(n)}
                  aria-label={n.read ? 'Mark unread' : 'Mark read'}
                  className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border transition ${
                    n.read ? 'border-line bg-white' : 'border-brand-500 bg-brand-500'
                  }`}
                >
                  {!n.read && <Check size={10} className="text-white" />}
                </button>

                <p
                  className={`min-w-0 flex-1 text-[13px] leading-relaxed ${
                    n.read ? 'text-ink-muted' : 'font-medium text-ink'
                  }`}
                >
                  {n.title}
                </p>

                <span className="shrink-0 whitespace-nowrap text-[11px] text-ink-soft">
                  {timeAgo(n.createdAt)}
                </span>
                <button className="shrink-0 rounded-lg p-1 text-ink-soft opacity-0 transition hover:bg-canvas group-hover:opacity-100">
                  <MoreHorizontal size={16} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
          {!rows.length && <li className="py-10 text-center text-sm text-ink-soft">Nothing here</li>}
        </ul>

        <div className="mt-4 flex flex-col items-center gap-1 text-[11.5px] text-ink-soft">
          Scroll down to see more
          <ChevronDown size={14} className="animate-bounce" />
        </div>
      </Card>
    </div>
  );
};

export default Notifications;
