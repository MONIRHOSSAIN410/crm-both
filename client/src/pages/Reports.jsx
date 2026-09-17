import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { PiggyBank, Users, Briefcase, CheckCircle2, ChevronDown } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import { Card, SectionHead } from '../components/ui/Bits';
import useFetch from '../hooks/useFetch';
import { demoReports } from '../data/demo';

const donutColors = ['#0B3D24', '#12904D', '#45BE7B', '#B0E8C5'];
// Distinct scale so five categories never repeat a colour.
const categoryColors = ['#0B3D24', '#12904D', '#45BE7B', '#F5D547', '#F0857D'];

const VisitTip = ({ active, payload }) =>
  active && payload?.length ? (
    <div className="rounded-xl border border-line bg-white px-3 py-2 shadow-card">
      <p className="text-[13px] font-bold text-ink">{payload[0].value.toLocaleString()},342,123 BDT</p>
      <p className="text-[11px] text-ink-muted">Avg</p>
    </div>
  ) : null;

const Reports = () => {
  const { data } = useFetch('/dashboard/reports', { fallback: demoReports });
  const d = {
    ...demoReports,
    ...(data || {}),
    cards: { ...demoReports.cards, ...(data?.cards || {}) },
  };
  const [month, setMonth] = useState('August 2026');

  const donut = (d.topClients?.length ? d.topClients : demoReports.topClients).map((c, i) => ({
    name: c.fullName,
    value: c.totalInvested,
    fill: donutColors[i % donutColors.length],
  }));

  const active = d.activePercentage || demoReports.activePercentage;
  const onlinePct = Math.round((active.online / (active.total || 1)) * 100);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink">Reports</h1>
        <p className="section-sub mt-0.5">Track overall performance and insights</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Investment" value={d.cards.totalInvestment} tone="green" icon={PiggyBank} index={0} />
        <StatCard label="Active Investors" value={d.cards.activeInvestors} tone="sun" icon={Users} index={1} />
        <StatCard label="Total Entrepreneurs" value={d.cards.totalEntrepreneurs} tone="lav" icon={Briefcase} index={2} />
        <StatCard label="Successful Projects" value={d.cards.successfulProjects} tone="mint" icon={CheckCircle2} index={3} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card delay={0.1}>
          <SectionHead title="Top Clients of all category" />
          <div className="relative h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donut}
                  dataKey="value"
                  innerRadius={62}
                  outerRadius={86}
                  paddingAngle={2}
                  stroke="none"
                  animationDuration={1000}
                >
                  {donut.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => `${Number(v).toLocaleString()} BDT`}
                  contentStyle={{ borderRadius: 10, border: '1px solid #E6ECE8', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="text-lg font-extrabold text-ink">
                  {(d.donutTotal ?? demoReports.donutTotal).toLocaleString()}
                </p>
                <p className="text-[11px] text-ink-soft">Label</p>
              </div>
            </div>
          </div>
          <ul className="mt-3 space-y-1.5">
            {donut.map((c) => (
              <li key={c.name} className="flex items-center justify-between text-[12.5px]">
                <span className="flex items-center gap-2 text-ink-muted">
                  <span className="h-2 w-2 rounded-full" style={{ background: c.fill }} />
                  {c.name}
                </span>
                <span className="font-semibold text-ink">{c.value.toLocaleString()} BDT</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card delay={0.16}>
          <SectionHead title="Active Percentage" />
          <p className="text-2xl font-extrabold text-ink">{active.total}</p>
          <p className="text-[11.5px] text-ink-muted">Total</p>

          <div className="mt-4 space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-[11.5px] text-ink-muted">
                <span>Online</span>
                <span>{active.online} users</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-brand-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${onlinePct}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className="h-full rounded-full bg-brand-600"
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-[11.5px] text-ink-muted">
                <span>Offline</span>
                <span>{active.offline} users</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-sun-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${100 - onlinePct}%` }}
                  transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-sun-400"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card delay={0.2}>
          <SectionHead
            title="Investment by category"
            right={<span className="chip bg-brand-100 text-brand-700">Percent</span>}
          />
          <ul className="space-y-3">
            {(d.byCategory?.length ? d.byCategory : demoReports.byCategory).map((c, i) => (
              <li key={c.category}>
                <div className="mb-1 flex justify-between text-[12px]">
                  <span className="text-ink-muted">{c.category}</span>
                  <span className="font-semibold text-ink">{c.percent}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-canvas">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.percent}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: categoryColors[i % categoryColors.length] }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card delay={0.26}>
        <SectionHead
          title="Total visits"
          right={
            <div className="relative">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="appearance-none rounded-lg border border-line bg-white py-1.5 pl-3 pr-8 text-xs font-semibold outline-none"
              >
                {['June 2026', 'July 2026', 'August 2026'].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          }
        />
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={d.visits || demoReports.visits} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="gVisit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#12904D" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="#12904D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#EEF3F0" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#9AA8A1' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#9AA8A1' }} />
              <Tooltip content={<VisitTip />} cursor={{ stroke: '#12904D', strokeDasharray: 4 }} />
              <Area type="monotone" dataKey="prev" stroke="#F5D547" strokeWidth={2} fill="none" animationDuration={1000} />
              <Area type="monotone" dataKey="value" stroke="#12904D" strokeWidth={2.4} fill="url(#gVisit)" animationDuration={1200} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
