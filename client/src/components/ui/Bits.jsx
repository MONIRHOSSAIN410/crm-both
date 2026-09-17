import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { defaultAvatar } from '../../utils/avatar';

/**
 * `gender` gives an account without an uploaded photo the right placeholder:
 * a male silhouette for a male account, a female one for a female account.
 */
export const Avatar = ({ src, name = '', size = 36, ring = false, gender = '' }) => {
  const [broken, setBroken] = useState(false);

  // Clear the failure flag whenever a new image is supplied, otherwise one
  // broken URL would permanently hide every photo uploaded afterwards.
  useEffect(() => {
    setBroken(false);
  }, [src]);

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const shown = src && !broken ? src : gender ? defaultAvatar(gender) : '';

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-brand-100 ${
        ring ? 'ring-2 ring-white' : ''
      }`}
      style={{ width: size, height: size }}
    >
      {shown ? (
        <img
          src={shown}
          alt={name}
          onError={() => setBroken(true)}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span
          className="grid h-full w-full place-items-center font-semibold text-brand-800"
          style={{ fontSize: size * 0.36 }}
        >
          {initials || '?'}
        </span>
      )}
    </div>
  );
};

const statusTones = {
  Success: 'text-brand-600',
  Failed: 'text-rose-500',
  Pending: 'text-sun-500',
  Released: 'bg-brand-100 text-brand-700',
  'In Escrow': 'bg-sun-100 text-amber-700',
  Refunded: 'bg-rose-100 text-rose-600',
  pending: 'bg-sun-100 text-amber-700',
  approved: 'bg-brand-100 text-brand-700',
  live: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-100 text-slate-600',
  rejected: 'bg-rose-100 text-rose-600',
  accepted: 'bg-brand-100 text-brand-700',
  active: 'bg-brand-100 text-brand-700',
};

export const StatusDot = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusTones[status] || 'text-ink-muted'}`}>
    <span
      className={`h-1.5 w-1.5 rounded-full ${
        status === 'Failed' ? 'bg-rose-500' : status === 'Pending' ? 'bg-sun-400' : 'bg-brand-500'
      }`}
    />
    {status}
  </span>
);

export const Pill = ({ status, children }) => (
  <span className={`chip ${statusTones[status] || 'bg-slate-100 text-slate-600'}`}>
    {children || status}
  </span>
);

export const Card = ({ children, className = '', delay = 0, pad = true }) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay, ease: 'easeOut' }}
    className={`card ${pad ? 'card-pad' : ''} ${className}`}
  >
    {children}
  </motion.section>
);

export const SectionHead = ({ title, sub, right }) => (
  <div className="mb-4 flex items-start justify-between gap-3">
    <div>
      <h3 className="section-title">{title}</h3>
      {sub && <p className="section-sub mt-0.5">{sub}</p>}
    </div>
    {right}
  </div>
);

export const Tabs = ({ tabs, value, onChange }) => (
  <div className="relative flex flex-wrap items-center gap-1 rounded-xl bg-brand-50/70 p-1">
    {tabs.map((t) => {
      const key = typeof t === 'string' ? t : t.value;
      const label = typeof t === 'string' ? t : t.label;
      const active = key === value;
      return (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`relative rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
            active ? 'text-white' : 'text-ink-muted hover:text-ink'
          }`}
        >
          {active && (
            <motion.span
              layoutId={`tab-${tabs.map((x) => (typeof x === 'string' ? x : x.value)).join('')}`}
              className="absolute inset-0 rounded-lg bg-brand-600"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10">{label}</span>
        </button>
      );
    })}
  </div>
);

export const Empty = ({ text = 'Nothing here yet' }) => (
  <div className="grid place-items-center py-10 text-sm text-ink-soft">{text}</div>
);

export const Spinner = () => (
  <div className="grid place-items-center py-12">
    <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
  </div>
);

export const bdt = (n = 0) => `${Number(n).toLocaleString('en-US')} BDT`;

export const timeAgo = (date) => {
  if (!date) return '';
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
