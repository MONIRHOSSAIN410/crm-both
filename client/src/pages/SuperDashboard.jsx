import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  ShieldCheck, Users, Briefcase, Wallet, FolderKanban, Search, Trash2, RefreshCw, Database,
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import { Card, SectionHead, Avatar, Spinner, Empty, bdt, timeAgo, fmtDate } from '../components/ui/Bits';
import useFetch from '../hooks/useFetch';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ROLES = ['admin', 'investor', 'entrepreneur'];
const STATUSES = ['pending', 'accepted', 'active', 'live', 'rejected'];

const errorText = (e, fallback) => e?.response?.data?.message || fallback;

/** A small labelled count, used for the role / status breakdowns. */
const Tally = ({ label, value }) => (
  <div className="rounded-xl bg-brand-50/60 px-3 py-2.5">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
    <p className="mt-0.5 text-lg font-bold text-ink">{Number(value || 0).toLocaleString('en-US')}</p>
  </div>
);

/**
 * One account in the manager. On a phone it is a stacked card; from `md` up
 * the same markup lines up as a row. Role and status are plain <select>s, which
 * give phones their native picker instead of a custom dropdown fighting touch.
 */
const AccountRow = ({ user, busy, onChange, onDelete }) => (
  <li className="rounded-xl border border-line/70 p-3 md:grid md:grid-cols-[minmax(0,1fr)_140px_140px_40px] md:items-center md:gap-3">
    <div className="flex min-w-0 items-center gap-3">
      <Avatar src={user.avatar} name={user.fullName} gender={user.gender} size={36} />
      <div className="min-w-0">
        <p className="truncate text-[13.5px] font-semibold text-ink">{user.fullName}</p>
        <p className="truncate text-[11.5px] text-ink-muted">{user.email}</p>
        <p className="text-[11px] text-ink-soft">Joined {fmtDate(user.createdAt)}</p>
      </div>
    </div>

    <div className="mt-3 grid grid-cols-[1fr_1fr_40px] gap-2 md:contents">
      <select
        aria-label={`Role of ${user.fullName}`}
        value={user.role}
        disabled={busy}
        onChange={(e) => onChange(user, { role: e.target.value })}
        className="input h-10 py-0 capitalize"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <select
        aria-label={`Status of ${user.fullName}`}
        value={user.status}
        disabled={busy}
        onChange={(e) => onChange(user, { status: e.target.value })}
        className="input h-10 py-0 capitalize"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onDelete(user)}
        disabled={busy}
        aria-label={`Delete ${user.fullName}`}
        className="grid h-10 w-10 place-items-center rounded-xl border border-line text-rose-500 transition hover:bg-rose-50 disabled:opacity-50"
      >
        <Trash2 size={16} />
      </button>
    </div>
  </li>
);

const SuperDashboard = () => {
  const { user } = useAuth();
  const isSuper = user?.role === 'superadmin';

  const overview = useFetch('/super/overview', { skip: !isSuper });

  const [filters, setFilters] = useState({ role: '', status: '', search: '' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [list, setList] = useState({ users: [], total: 0, pages: 1 });
  const [listLoading, setListLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [message, setMessage] = useState({ tone: '', text: '' });

  // Debounce the search box so every keystroke is not a request.
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => ({ ...f, search }));
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadUsers = async () => {
    if (!isSuper) return;
    setListLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
      const { data } = await api.get(`/super/users?${params}`);
      setList({ users: data.users || [], total: data.total || 0, pages: data.pages || 1 });
    } catch (e) {
      setMessage({ tone: 'bad', text: errorText(e, 'Could not load accounts.') });
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, isSuper]);

  if (!isSuper) return <Navigate to="/dashboard" replace />;

  const changeAccess = async (target, patch) => {
    setBusyId(target._id);
    setMessage({ tone: '', text: '' });
    try {
      const { data } = await api.patch(`/super/users/${target._id}`, patch);
      setList((l) => ({ ...l, users: l.users.map((u) => (u._id === target._id ? { ...u, ...data.user } : u)) }));
      setMessage({ tone: 'good', text: `${target.fullName} updated.` });
      overview.reload();
    } catch (e) {
      setMessage({ tone: 'bad', text: errorText(e, 'Update failed.') });
    } finally {
      setBusyId('');
    }
  };

  const deleteAccount = async (target) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Delete ${target.fullName}? This cannot be undone.`)) return;
    setBusyId(target._id);
    setMessage({ tone: '', text: '' });
    try {
      await api.delete(`/super/users/${target._id}`);
      setList((l) => ({ ...l, users: l.users.filter((u) => u._id !== target._id), total: l.total - 1 }));
      setMessage({ tone: 'good', text: `${target.fullName} deleted.` });
      overview.reload();
    } catch (e) {
      setMessage({ tone: 'bad', text: errorText(e, 'Delete failed.') });
    } finally {
      setBusyId('');
    }
  };

  const o = overview.data || {};
  const users = o.users || { byRole: {}, byStatus: {} };
  const projects = o.projects || { byStatus: {} };
  const payments = o.payments || { byStatus: [] };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-100 text-brand-700">
            <ShieldCheck size={18} />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ink">Super Dashboard</h1>
            <p className="text-xs text-ink-muted">The whole platform — every account, project and payment</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            overview.reload();
            loadUsers();
          }}
          className="btn-ghost py-2 text-xs"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {overview.offline && !overview.loading && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
          Could not load platform numbers from the server.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total accounts" value={users.total || 0} tone="green" icon={Users} index={0} />
        <StatCard label="Online now" value={users.online || 0} tone="mint" icon={Users} index={1} />
        <StatCard label="Projects" value={projects.total || 0} tone="lav" icon={FolderKanban} index={2} />
        <StatCard label="Total invested" value={payments.total || 0} suffix=" BDT" tone="sun" icon={Wallet} index={3} />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card delay={0.05}>
          <SectionHead title="Accounts by role" />
          <div className="grid grid-cols-3 gap-2">
            <Tally label="Admins" value={users.byRole.admin} />
            <Tally label="Investors" value={users.byRole.investor} />
            <Tally label="Entrepr." value={users.byRole.entrepreneur} />
          </div>
          <div className="mt-5">
            <SectionHead title="Accounts by status" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {STATUSES.map((s) => (
              <Tally key={s} label={s} value={users.byStatus[s]} />
            ))}
          </div>
        </Card>

        <Card delay={0.1}>
          <SectionHead title="Projects by status" />
          <div className="grid grid-cols-3 gap-2">
            {['pending', 'approved', 'live', 'closed', 'rejected'].map((s) => (
              <Tally key={s} label={s} value={projects.byStatus[s]} />
            ))}
          </div>
          <div className="mt-5">
            <SectionHead title="Money" />
          </div>
          <div className="space-y-1.5 text-[13px]">
            <p className="flex justify-between"><span className="text-ink-muted">Payments</span><b>{payments.count || 0}</b></p>
            <p className="flex justify-between"><span className="text-ink-muted">Commission</span><b>{bdt(payments.commission || 0)}</b></p>
            {payments.byStatus.map((p) => (
              <p key={p.status} className="flex justify-between gap-2">
                <span className="text-ink-muted">{p.status} ({p.count})</span>
                <b>{bdt(p.amount)}</b>
              </p>
            ))}
          </div>
        </Card>

        <Card delay={0.15}>
          <SectionHead
            title="Recent activity"
            right={
              <span className="chip bg-brand-50 text-brand-700">
                <Database size={12} /> DB {o.database?.state || '—'}
              </span>
            }
          />
          {overview.loading ? (
            <Spinner />
          ) : (o.recentActivity || []).length ? (
            <ul className="space-y-3">
              {o.recentActivity.map((a) => (
                <li key={a._id} className="text-[12.5px]">
                  <p className="font-semibold text-ink">{a.activity}</p>
                  <p className="text-ink-muted">{a.description}</p>
                  <p className="text-[11px] text-ink-soft">
                    {a.userName} · {timeAgo(a.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="No activity yet" />
          )}
        </Card>
      </div>

      <Card delay={0.2}>
        <SectionHead
          title="Manage accounts"
          sub={`${list.total} account${list.total === 1 ? '' : 's'} · change role or status, or delete`}
          right={<Briefcase size={16} className="text-ink-soft" />}
        />

        <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_150px_150px]">
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input h-10 pl-9"
              placeholder="Search name, email or phone"
              aria-label="Search accounts"
            />
          </div>
          <select
            aria-label="Filter by role"
            value={filters.role}
            onChange={(e) => {
              setFilters((f) => ({ ...f, role: e.target.value }));
              setPage(1);
            }}
            className="input h-10 py-0 capitalize"
          >
            <option value="">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select
            aria-label="Filter by status"
            value={filters.status}
            onChange={(e) => {
              setFilters((f) => ({ ...f, status: e.target.value }));
              setPage(1);
            }}
            className="input h-10 py-0 capitalize"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {message.text && (
          <p
            className={`mb-3 rounded-lg px-3 py-2 text-xs font-medium ${
              message.tone === 'bad' ? 'bg-rose-50 text-rose-600' : 'bg-brand-50 text-brand-700'
            }`}
          >
            {message.text}
          </p>
        )}

        {listLoading ? (
          <Spinner />
        ) : list.users.length ? (
          <ul className="space-y-2">
            {list.users.map((u) => (
              <AccountRow
                key={u._id}
                user={u}
                busy={busyId === u._id}
                onChange={changeAccess}
                onDelete={deleteAccount}
              />
            ))}
          </ul>
        ) : (
          <Empty text="No accounts match" />
        )}

        {list.pages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3 text-xs">
            <button type="button" className="btn-ghost py-1.5" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span className="text-ink-muted">
              Page {page} of {list.pages}
            </span>
            <button
              type="button"
              className="btn-ghost py-1.5"
              disabled={page >= list.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SuperDashboard;
