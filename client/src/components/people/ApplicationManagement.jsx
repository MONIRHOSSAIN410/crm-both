import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Card, SectionHead, Tabs, Avatar, fmtDate } from '../ui/Bits';

const TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'live', label: 'Live' },
];

const ApplicationManagement = ({ applications = [], onReview, delay = 0 }) => {
  const [tab, setTab] = useState('pending');

  const rows = useMemo(
    () => applications.filter((a) => (a.status ? a.status === tab : tab === 'pending')),
    [applications, tab]
  );

  return (
    <Card delay={delay}>
      <SectionHead
        title="Application Management"
        right={<Tabs tabs={TABS} value={tab} onChange={setTab} />}
      />

      <div className="-mx-1 overflow-x-auto scroll-thin">
        <AnimatePresence mode="wait">
          <motion.ul
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="min-w-[540px] space-y-1 px-1"
          >
            {rows.map((a, i) => (
              <motion.li
                key={a._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 rounded-xl px-2 py-2.5 transition hover:bg-brand-50/50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar src={a.avatar} name={a.fullName} gender={a.gender} size={36} />
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-semibold text-ink">{a.fullName}</p>
                    <p className="truncate text-[11.5px] text-ink-muted">{a.email}</p>
                  </div>
                </div>
                <span className="whitespace-nowrap text-[12.5px] text-ink-muted">{a.phone}</span>
                <span className="whitespace-nowrap text-[12.5px] text-ink-muted">
                  {a.ref || fmtDate(a.createdAt)}
                </span>
                <button
                  onClick={() => onReview?.(a)}
                  className="btn-ghost whitespace-nowrap rounded-full px-4 py-1.5 text-[11.5px]"
                >
                  Review
                </button>
              </motion.li>
            ))}
            {!rows.length && (
              <li className="py-8 text-center text-sm text-ink-soft">No {tab} applications</li>
            )}
          </motion.ul>
        </AnimatePresence>
      </div>

      <div className="mt-3 flex justify-center">
        <button className="grid h-7 w-7 place-items-center rounded-full border border-line text-ink-muted transition hover:bg-brand-50">
          <ChevronDown size={14} />
        </button>
      </div>
    </Card>
  );
};

export default ApplicationManagement;
