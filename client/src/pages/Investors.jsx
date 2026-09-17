import { motion } from 'framer-motion';
import { Users, Activity, Clock, Trophy } from 'lucide-react';
import api from '../api/axios';
import StatCard from '../components/ui/StatCard';
import { Card, SectionHead, Avatar, bdt } from '../components/ui/Bits';
import ApplicationManagement from '../components/people/ApplicationManagement';
import AccountsList from '../components/people/AccountsList';
import useFetch from '../hooks/useFetch';
import { demoApplications, demoAccounts, demoTopInvestors, demoInvestorStats } from '../data/demo';

const medals = ['🥇', '🥈', '🥉', '🏅'];

const Investors = () => {
  const { data: stats } = useFetch('/users/stats?role=investor', {
    fallback: { stats: demoInvestorStats, topInvestors: demoTopInvestors },
  });
  const { data: pending, reload } = useFetch('/users?role=investor&status=pending', {
    fallback: { users: demoApplications },
  });
  const { data: accounts } = useFetch('/users?role=investor&limit=8', {
    fallback: { users: demoAccounts },
  });

  const s = stats?.stats || demoInvestorStats;
  const top = stats?.topInvestors?.length ? stats.topInvestors : demoTopInvestors;

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
      <h1 className="text-xl font-bold tracking-tight text-ink">Investors</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Investors" value={s.total} delta="+12% this month" tone="green" icon={Users} index={0} />
        <StatCard label="Active Investors" value={s.active} delta="-2% this month" deltaTone="down" tone="lav" icon={Activity} index={1} />
        <StatCard label="Pending" value={s.pending} tone="sun" icon={Clock} index={2} />
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

        <Card delay={0.2}>
          <SectionHead title="Top Investors" sub="People who invest the most." />
          <ul className="space-y-2">
            {top.map((t, i) => (
              <motion.li
                key={t._id || i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 * i }}
                className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-brand-50/50"
              >
                <span className="w-5 text-center text-base">{medals[i] || <Trophy size={14} />}</span>
                <Avatar src={t.avatar} name={t.fullName} gender={t.gender} size={34} />
                <p className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-ink">{t.fullName}</p>
                <span className="shrink-0 text-[13px] font-bold text-brand-700">{bdt(t.totalInvested)}</span>
              </motion.li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Investors;
