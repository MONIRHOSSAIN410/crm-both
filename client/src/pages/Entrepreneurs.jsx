import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { Briefcase, Activity, Users, Clock, Target } from 'lucide-react';
import api from '../api/axios';
import StatCard from '../components/ui/StatCard';
import { Card } from '../components/ui/Bits';
import ApplicationManagement from '../components/people/ApplicationManagement';
import AccountsList from '../components/people/AccountsList';
import useFetch from '../hooks/useFetch';
import { demoApplications, demoAccounts, demoEntrepreneurStats } from '../data/demo';

const reach = Array.from({ length: 14 }, (_, i) => ({
  x: i,
  y: 20 + i * 4 + Math.round(14 * Math.sin(i / 1.7)),
}));

const Entrepreneurs = () => {
  const { data: stats } = useFetch('/users/stats?role=entrepreneur', {
    fallback: { stats: demoEntrepreneurStats },
  });
  const { data: pending, reload } = useFetch('/users?role=entrepreneur&status=pending', {
    fallback: { users: demoApplications },
  });
  const { data: accounts } = useFetch('/users?role=entrepreneur&limit=8', {
    fallback: { users: demoAccounts },
  });

  const s = stats?.stats || demoEntrepreneurStats;

  const review = async (user) => {
    try {
      await api.patch(`/users/${user._id}/status`, { status: 'accepted' });
      reload();
    } catch {
      /* offline demo */
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold tracking-tight text-ink">Entrepreneur</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Entrepreneurs" value={s.total} delta="+12% this month" tone="green" icon={Briefcase} index={0} />
        <StatCard label="Active Entrepreneurs" value={s.active} delta="-2% this month" deltaTone="down" tone="lav" icon={Activity} index={1} />
        <StatCard label="Active Investors" value={s.activeInvestors ?? s.accepted ?? 500} tone="sun" icon={Users} index={2} />
        <StatCard label="Pending" value={s.pending} tone="blush" icon={Clock} index={3} />
      </div>

      <ApplicationManagement
        applications={(pending?.users?.length ? pending.users : demoApplications).map((u) => ({
          ...u,
          status: u.status || 'pending',
        }))}
        onReview={review}
        delay={0.1}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <AccountsList accounts={accounts?.users?.length ? accounts.users : demoAccounts} delay={0.16} />

        <Card delay={0.2} className="flex flex-col">
          <h3 className="section-title">Entrepreneur Reach this month</h3>

          <div className="mt-4 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-100 text-lg">
              <Target size={20} className="text-brand-700" />
            </span>
            <div>
              <p className="text-2xl font-extrabold tracking-tight text-ink">25% ↑</p>
              <p className="text-[12px] text-ink-muted">More than previous month</p>
            </div>
          </div>

          <p className="mt-3 text-[12px] leading-relaxed text-ink-muted">
            Entrepreneur sign-ups and project submissions keep climbing month over month. Approved
            ventures now reach a wider pool of verified investors across every category.
          </p>

          <div className="mt-auto h-[140px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reach} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#12904D" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#12904D" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Tooltip
                  cursor={false}
                  contentStyle={{ borderRadius: 10, border: '1px solid #E6ECE8', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="y" stroke="#0F7340" strokeWidth={2.4} fill="url(#gReach)" animationDuration={1100} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Entrepreneurs;
