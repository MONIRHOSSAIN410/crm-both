import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity as ActivityIcon, CalendarDays, Download, SlidersHorizontal, Search,
  Users, ShieldCheck, XCircle, Info, Send,
} from 'lucide-react';
import api from '../api/axios';
import StatCard from '../components/ui/StatCard';
import { Card, Avatar, StatusDot } from '../components/ui/Bits';
import useFetch from '../hooks/useFetch';
import { demoActivities, demoActivityStats } from '../data/demo';

const dt = (d) =>
  new Date(d).toLocaleString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

const Select = ({ icon: Icon, value, onChange, options, placeholder }) => (
  <div className="relative">
    {Icon && <Icon size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`input h-9 appearance-none py-0 pr-8 text-[12.5px] ${Icon ? 'pl-8' : ''}`}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

const ActivityLogs = () => {
  const { data: statRes } = useFetch('/activities/stats', { fallback: { stats: demoActivityStats } });
  const { data: logRes } = useFetch('/activities?limit=40', { fallback: { activities: demoActivities } });

  const stats = statRes?.stats || demoActivityStats;
  const logs = logRes?.activities?.length ? logRes.activities : demoActivities;

  const [q, setQ] = useState('');
  const [user, setUser] = useState('');
  const [mod, setMod] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [selected, setSelected] = useState(logs[3] || logs[0]);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  const rows = useMemo(
    () =>
      logs.filter(
        (l) =>
          (!q || l.activity?.toLowerCase().includes(q.toLowerCase())) &&
          (!user || l.userName === user) &&
          (!mod || l.module === mod) &&
          (!status || l.status === status) &&
          (!date || new Date(l.createdAt).toISOString().slice(0, 10) === date)
      ),
    [logs, q, user, mod, status, date]
  );

  const exportLogs = async () => {
    try {
      const res = await api.get('/activities/export', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'muldhon-activity-logs.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      const csv = ['User,Activity,Module,Date,Status']
        .concat(rows.map((r) => [r.userName, r.activity, r.module, r.createdAt, r.status].join(',')))
        .join('\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'muldhon-activity-logs.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setComments((c) => [...c, { author: 'You', text: comment, createdAt: new Date().toISOString() }]);
    const text = comment;
    setComment('');
    try {
      await api.post(`/activities/${selected._id}/comments`, { text });
    } catch {
      /* offline demo */
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink">Activity Logs</h1>
        <p className="section-sub mt-0.5">History of important activities</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Activities" value={stats.total} tone="green" icon={ActivityIcon} index={0} />
        <StatCard label="Today" value={stats.today} tone="lav" icon={Users} index={1} />
        <StatCard label="Admin actions" value={stats.adminActions} tone="sun" icon={ShieldCheck} index={2} />
        <StatCard label="Total canceled" value={stats.canceled} tone="blush" icon={XCircle} index={3} />
      </div>

      <Card delay={0.1}>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="input h-9 pl-8 text-[12.5px]"
              placeholder="Search activities"
            />
          </div>
          <Select icon={Users} value={user} onChange={setUser} placeholder="All users" options={[...new Set(logs.map((l) => l.userName))]} />
          <Select value={mod} onChange={setMod} placeholder="All modules" options={['Projects', 'Payments', 'Accounts', 'Messages', 'System', 'Reports']} />
          <Select value={status} onChange={setStatus} placeholder="All actions" options={['Success', 'Failed', 'Pending']} />
          <div className="relative">
            <CalendarDays size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input h-9 pl-8 text-[12.5px]"
            />
          </div>
          <div className="flex gap-2 lg:col-start-4">
            <button onClick={exportLogs} className="btn-ghost h-9 flex-1 py-0 text-[12.5px]">
              Export Logs <Download size={14} />
            </button>
            <button className="btn-sun h-9 py-0 text-[12.5px]">
              Filter <SlidersHorizontal size={14} />
            </button>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Card delay={0.16} pad={false}>
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line/70 text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">
                  {['User', 'Activity', 'Module', 'Date & time', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="whitespace-nowrap px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[13px]">
                <AnimatePresence initial={false}>
                  {rows.map((r, i) => (
                    <motion.tr
                      key={r._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.025 }}
                      onClick={() => setSelected(r)}
                      className={`cursor-pointer border-b border-line/50 transition ${
                        selected?._id === r._id ? 'bg-brand-100/70' : 'hover:bg-brand-50/50'
                      }`}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar src={r.userAvatar} name={r.userName} size={30} />
                          <div className="min-w-0">
                            <p className="truncate text-[12.5px] font-semibold text-ink">{r.userName}</p>
                            <p className="truncate text-[11px] text-ink-muted">{r.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">{r.activity}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-ink-muted">{r.module}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-ink-muted">{dt(r.createdAt)}</td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <StatusDot status={r.status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <button className="btn-ghost rounded-full px-3 py-1 text-[11px]">View</button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {!rows.length && <p className="py-10 text-center text-sm text-ink-soft">No matching activities</p>}
        </Card>

        {/* Detail panel */}
        <Card delay={0.2} className="h-fit">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="section-title">Activity details</h3>
            <Info size={15} className="text-ink-soft" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selected?._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="space-y-4 text-[12.5px]"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-ink">{selected?.activity} informations</p>
                <StatusDot status={selected?.status} />
              </div>

              <dl className="space-y-1.5">
                {[
                  ['User', selected?.userName],
                  ['Module', selected?.module],
                  ['Date & time', selected?.createdAt ? dt(selected.createdAt) : '—'],
                  ['Project ID', selected?.projectId || '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-ink-muted">{k}</dt>
                    <dd className="truncate font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>

              <div>
                <p className="mb-1.5 font-semibold text-ink">Changes Made</p>
                <dl className="space-y-1.5">
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-muted">Payment status</dt>
                    <dd>
                      <span className="text-ink-muted">{selected?.changes?.paymentStatus?.from}</span>
                      <span className="mx-1.5 text-brand-500">→</span>
                      <span className="font-semibold text-brand-700">{selected?.changes?.paymentStatus?.to}</span>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-muted">Investment target</dt>
                    <dd>
                      <span className="text-ink-muted">
                        {selected?.changes?.investmentTarget?.from?.toLocaleString()}
                      </span>
                      <span className="mx-1.5 text-brand-500">→</span>
                      <span className="font-semibold text-brand-700">
                        {selected?.changes?.investmentTarget?.to?.toLocaleString()}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-muted">Deadline</dt>
                    <dd>
                      <span className="text-ink-muted">{selected?.changes?.deadline?.from}</span>
                      <span className="mx-1.5 text-brand-500">→</span>
                      <span className="font-semibold text-brand-700">{selected?.changes?.deadline?.to}</span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <p className="mb-1 font-semibold text-ink">Description</p>
                <p className="leading-relaxed text-ink-muted">{selected?.description}</p>
              </div>

              <div>
                <p className="mb-2 font-semibold text-ink">Comments</p>
                <ul className="mb-2 space-y-2">
                  {[...(selected?.comments || []), ...comments].map((c, i) => (
                    <li key={i} className="rounded-xl bg-canvas px-3 py-2">
                      <p className="text-[11px] font-semibold text-brand-700">{c.author}</p>
                      <p className="text-[12px] text-ink-muted">{c.text}</p>
                    </li>
                  ))}
                </ul>
                <form onSubmit={addComment} className="flex gap-2">
                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="input h-9 text-[12.5px]"
                    placeholder="Write your comment here"
                  />
                  <button type="submit" className="btn-primary shrink-0 px-3 py-2">
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
};

export default ActivityLogs;
