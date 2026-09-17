import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { ChevronDown, ChevronRight } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import { Card, SectionHead, bdt, timeAgo } from '../components/ui/Bits';
import useFetch from '../hooks/useFetch';
import { demoDashboard } from '../data/demo';

const ChartTip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-card">
      <p className="font-semibold text-ink">{label}</p>
      <p className="text-brand-600">{bdt(payload[0].value)}</p>
    </div>
  ) : null;

const Dashboard = () => {
  const { data } = useFetch('/dashboard', { fallback: demoDashboard, select: (d) => d });
  // Merge so a partial payload can never blank out a section.
  const d = {
    ...demoDashboard,
    ...(data || {}),
    cards: { ...demoDashboard.cards, ...(data?.cards || {}) },
    projectStatus: { ...demoDashboard.projectStatus, ...(data?.projectStatus || {}) },
    systemStatus: { ...demoDashboard.systemStatus, ...(data?.systemStatus || {}) },
  };
  const [filter, setFilter] = useState('pending');

  const cards = [
    { label: 'Reg Investors', value: d.cards.regInvestors, delta: '+12% this month', tone: 'green' },
    { label: 'Reg Entrepreneurs', value: d.cards.regEntrepreneurs, delta: '-2% this month', deltaTone: 'down', tone: 'lav' },
    { label: 'Active Investors', value: d.cards.activeInvestors, tone: 'sun' },
    { label: 'Pending', value: d.cards.pending, tone: 'sun' },
    { label: 'Total Project', value: d.cards.totalProjects, tone: 'blush' },
    { label: 'Rejected project', value: d.cards.rejectedProjects, tone: 'rose' },
  ];

  const projects = (d.recentProjects || []).filter((p) => (filter === 'all' ? true : p.status === filter));

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold tracking-tight text-ink">Dashboard</h1>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Left column */}
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {cards.map((c, i) => (
              <StatCard key={c.label} {...c} index={i} />
            ))}
          </div>

          <Card delay={0.15}>
            <SectionHead
              title="Projects"
              sub="Latest applications and funding requests"
              right={
                <div className="relative">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="appearance-none rounded-lg border border-brand-200 bg-brand-50/60 py-1.5 pl-3 pr-8 text-xs font-semibold capitalize text-brand-700 outline-none"
                  >
                    {['all', 'pending', 'approved', 'live', 'rejected'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-700" />
                </div>
              }
            />

            <ul className="space-y-2.5">
              {projects.map((p, i) => (
                <motion.li
                  key={p._id || p.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line/70 px-3.5 py-3 transition hover:border-brand-200 hover:bg-brand-50/40"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate text-[13.5px] font-semibold text-ink">
                      {p.title}
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sun-400" />
                    </p>
                    <p className="mt-0.5 truncate text-[11.5px] text-ink-muted">
                      Budget: {Number(p.budget).toLocaleString()} BDT
                    </p>
                    <p className="truncate text-[11.5px] text-ink-muted">User: {p.ownerName}</p>
                  </div>
                  <button className="btn-ghost shrink-0 rounded-full px-3 py-1.5 text-[11.5px]">
                    Details <ChevronRight size={13} />
                  </button>
                </motion.li>
              ))}
              {!projects.length && (
                <li className="py-6 text-center text-sm text-ink-soft">No {filter} projects</li>
              )}
            </ul>

            <div className="mt-3 flex justify-center">
              <button className="grid h-7 w-7 place-items-center rounded-full border border-line text-ink-muted transition hover:bg-brand-50">
                <ChevronDown size={14} />
              </button>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <Card delay={0.1}>
            <p className="text-[13px] text-ink-muted">Total investment</p>
            <p className="mt-1 text-2xl font-bold tracking-tight sm:text-[28px]">
              {Number(d.cards.totalInvestment).toLocaleString()} BDT
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-brand-600">
              +25% increased then the last month
            </p>
            <div className="mt-3 h-[150px] w-full sm:h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.investmentTrend} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gInv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1EA65C" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#1EA65C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" hide />
                  <YAxis hide domain={['dataMin - 400000', 'dataMax + 200000']} />
                  <Tooltip content={<ChartTip />} cursor={{ stroke: '#1EA65C', strokeDasharray: 4 }} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#12904D"
                    strokeWidth={2.4}
                    fill="url(#gInv)"
                    animationDuration={1100}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card delay={0.2}>
            <SectionHead title="Recent activity" sub="Platform updates and admin actions" />
            <ul className="space-y-1">
              {(d.recentActivity || []).map((a, i) => (
                <motion.li
                  key={a._id || i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                    i === 0 ? 'bg-brand-50/70' : 'hover:bg-canvas'
                  }`}
                >
                  <span className="h-6 w-6 shrink-0 rounded-md bg-brand-100" />
                  <p className="min-w-0 flex-1 truncate text-[12.5px] text-ink">
                    <span className="text-ink-muted">{a.activity?.split(' ').slice(0, 2).join(' ')} </span>
                    <span className="font-semibold text-brand-700">
                      {a.activity?.split(' ').slice(2).join(' ')}
                    </span>
                  </p>
                  <span className="shrink-0 text-[11px] text-ink-soft">{timeAgo(a.createdAt)}</span>
                </motion.li>
              ))}
            </ul>
            <div className="mt-2 flex justify-center">
              <button className="grid h-7 w-7 place-items-center rounded-full border border-line text-ink-muted transition hover:bg-brand-50">
                <ChevronDown size={14} />
              </button>
            </div>
          </Card>

          <div className="grid gap-5 sm:grid-cols-2">
            <Card delay={0.26}>
              <h3 className="section-title mb-3">Project Status</h3>
              <ul className="space-y-2.5 text-[13px]">
                {[
                  ['Pending', d.projectStatus.pending],
                  ['Approved', d.projectStatus.approved],
                  ['Live', d.projectStatus.live],
                  ['Closed', d.projectStatus.closed],
                ].map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between">
                    <span className="text-ink-muted">{k}</span>
                    <span className="font-semibold text-brand-700">{v}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card delay={0.3}>
              <h3 className="section-title mb-3">System Status</h3>
              <ul className="space-y-2.5 text-[13px]">
                <li className="flex items-center justify-between">
                  <span className="text-ink-muted">Total Users</span>
                  <span className="font-semibold text-brand-700">{d.systemStatus.totalUsers}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-ink-muted">Active Users</span>
                  <span className="font-semibold text-brand-700">{d.systemStatus.activeUsers}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-ink-muted">Maintenance Mode</span>
                  <span
                    className={`relative h-5 w-9 rounded-full transition ${
                      d.systemStatus.maintenanceMode ? 'bg-brand-500' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                        d.systemStatus.maintenanceMode ? 'left-[18px]' : 'left-0.5'
                      }`}
                    />
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-ink-muted">Server Status</span>
                  <span className="font-semibold text-brand-600">{d.systemStatus.serverStatus}</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
