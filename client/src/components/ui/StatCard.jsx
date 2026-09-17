import { motion } from 'framer-motion';
import CountUp from './CountUp';

const toneMap = {
  green: 'bg-brand-100',
  lav: 'bg-lav',
  sun: 'bg-sun-200',
  blush: 'bg-blush',
  rose: 'bg-rose-200',
  mint: 'bg-emerald-100',
};

const StatCard = ({
  label,
  value,
  delta,
  deltaTone = 'up',
  tone = 'green',
  icon: Icon,
  suffix = '',
  prefix = '',
  index = 0,
  compact = false,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.06, ease: 'easeOut' }}
    whileHover={{ y: -3 }}
    className="card card-pad flex items-start justify-between gap-3"
  >
    <div className="min-w-0">
      <p className="truncate text-[13px] text-ink-muted">{label}</p>
      <p className={`mt-1 font-bold tracking-tight text-ink ${compact ? 'text-xl' : 'text-2xl sm:text-[26px]'}`}>
        {prefix}
        <CountUp value={value} />
        {suffix}
      </p>
      {delta && (
        <p
          className={`mt-1 text-[11px] font-semibold ${
            deltaTone === 'up' ? 'text-brand-600' : 'text-rose-500'
          }`}
        >
          {delta}
        </p>
      )}
    </div>
    <div
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${toneMap[tone] || toneMap.green}`}
    >
      {Icon ? <Icon size={18} className="text-ink/70" strokeWidth={1.8} /> : null}
    </div>
  </motion.div>
);

export default StatCard;
