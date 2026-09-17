import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronRight, ChevronDown } from 'lucide-react';
import { Card, SectionHead, Avatar } from '../ui/Bits';

const AccountsList = ({ accounts = [], delay = 0 }) => {
  const [q, setQ] = useState('');
  const rows = accounts.filter(
    (a) =>
      a.fullName?.toLowerCase().includes(q.toLowerCase()) ||
      a.email?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <Card delay={delay}>
      <SectionHead title="Accounts" />

      <div className="relative mb-3">
        <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="input h-10 rounded-xl bg-brand-50/50 pl-9 text-[13px]"
          placeholder="Search by Name or ID"
        />
      </div>

      <ul className="space-y-1">
        {rows.map((a, i) => (
          <motion.li
            key={a._id || i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 transition hover:bg-brand-50/50"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar src={a.avatar} name={a.fullName} gender={a.gender} size={34} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-ink">{a.fullName}</p>
                <p className="truncate text-[11.5px] text-ink-muted">{a.email}</p>
              </div>
            </div>
            <button className="btn-ghost shrink-0 rounded-full px-3.5 py-1.5 text-[11.5px]">
              Details <ChevronRight size={13} />
            </button>
          </motion.li>
        ))}
        {!rows.length && <li className="py-6 text-center text-sm text-ink-soft">No accounts found</li>}
      </ul>

      <div className="mt-3 flex justify-center">
        <button className="grid h-7 w-7 place-items-center rounded-full border border-line text-ink-muted transition hover:bg-brand-50">
          <ChevronDown size={14} />
        </button>
      </div>
    </Card>
  );
};

export default AccountsList;
