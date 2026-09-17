import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import AuthShell from '../../components/AuthShell';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return; // Prevent duplicate submissions via Enter key

    setError('');
    if (!form.email.trim()) return setError('Please enter your email address.');
    if (!form.password) return setError('Please enter your password.');

    setBusy(true);
    try {
      const res = await login(form.email, form.password);
      if (res?.ok) {
        navigate('/dashboard');
      } else {
        setError(res?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Muldhon"
      heading="Manage investment, projects and accounts with confidence."
      sub="Secure dashboard access for Muldhon members."
    >
      <div className="mx-auto max-w-md">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-500">Welcome back</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ink">Login to dashboard</h2>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
          Sign in with the email and password you registered with. Your own profile — name,
          gender and photo — loads with your account.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <Link to="/register/investor" className="btn-ghost whitespace-nowrap px-3 text-[12.5px]">
            Register as Investor
          </Link>
          <Link to="/register/entrepreneur" className="btn-ghost whitespace-nowrap px-3 text-[12.5px]">
            Register as Entrepreneur
          </Link>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <Mail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                id="email"
                type="email"
                required
                disabled={busy}
                className="input pl-10 disabled:opacity-60"
                placeholder="admin@muldhon.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                id="password"
                type={show ? 'text' : 'password'}
                required
                autoComplete="current-password"
                disabled={busy}
                className="input pl-10 pr-10 disabled:opacity-60"
                placeholder="••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft transition hover:text-ink focus:outline-none"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileTap={!busy ? { scale: 0.98 } : {}}
            type="submit"
            disabled={busy}
            className="btn-primary flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              'Login'
            )}
          </motion.button>
        </form>
      </div>
    </AuthShell>
  );
};

export default Login;