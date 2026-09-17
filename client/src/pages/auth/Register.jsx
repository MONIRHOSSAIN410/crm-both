import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Building2, MapPin, ArrowRight, Loader2, Lock, Users, Eye, EyeOff,
} from 'lucide-react';
import AuthShell from '../../components/AuthShell';
import { useAuth } from '../../context/AuthContext';
import { defaultAvatar } from '../../utils/avatar';

const copy = {
  investor: {
    eyebrow: 'Investor registration',
    heading: 'Create an investor profile and manage your investments.',
    sub: 'Register to message admins, track payments, and keep your investment preferences organized.',
    title: 'Investor Register',
    cta: 'Create Investor Account',
    orgPlaceholder: 'Investment group',
    focusPlaceholder: 'Agriculture, clean energy, women-led ventures',
  },
  entrepreneur: {
    eyebrow: 'Entrepreneur registration',
    heading: 'Create an entrepreneur profile and prepare your project.',
    sub: 'Register to contact admins, submit payment records, and manage your project information.',
    title: 'Entrepreneur Register',
    cta: 'Create Entrepreneur Account',
    orgPlaceholder: 'Business name',
    focusPlaceholder: 'Project category or business sector',
  },
};

const Field = ({ icon: Icon, label, required, children }) => (
  <div>
    <label className="label">
      {Icon && <Icon size={14} className="text-ink-soft" />}
      {label}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

/** Male / Female picker. The choice is saved on the account and decides the
 *  default profile photo, so a female account never shows a male avatar. */
const GenderPicker = ({ value, onChange, disabled }) => (
  <div className="grid grid-cols-2 gap-2.5">
    {['male', 'female'].map((g) => {
      const active = value === g;
      return (
        <button
          key={g}
          type="button"
          disabled={disabled}
          onClick={() => onChange(g)}
          aria-pressed={active}
          className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-[13px] font-semibold capitalize transition disabled:opacity-60 ${
            active
              ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500'
              : 'border-line bg-white text-ink-muted hover:bg-brand-50/50'
          }`}
        >
          <img src={defaultAvatar(g)} alt="" className="h-7 w-7 rounded-full" />
          {g}
        </button>
      );
    })}
  </div>
);

const Register = ({ role = 'investor' }) => {
  const t = copy[role];
  const { register } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    gender: '',
    phone: '',
    organization: '',
    location: 'Dhaka, Bangladesh',
    focusArea: '',
    bio: '',
    password: '',
    confirmPassword: '',
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');

    // Validate here so the user gets an instant, specific message instead of
    // a round trip that comes back as a generic failure.
    if (!form.fullName.trim()) return setError('Please enter your full name.');
    if (!form.email.trim()) return setError('Please enter your email address.');
    if (!form.gender) return setError('Please select your gender.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirmPassword) return setError('The two passwords do not match.');

    setBusy(true);
    const { confirmPassword, ...payload } = form;
    const res = await register({ ...payload, role });
    setBusy(false);

    if (res.ok) navigate('/dashboard');
    else setError(res.message || 'Registration failed. Please try again.');
  };

  return (
    <AuthShell eyebrow={t.eyebrow} heading={t.heading} sub={t.sub} wide>
      <div className="mx-auto max-w-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-500">
              Create account
            </p>
            <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink">{t.title}</h2>
          </div>
          <Link to="/login" className="shrink-0 text-xs font-semibold text-brand-600 hover:underline">
            Already have an account? Login
          </Link>
        </div>

        <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field icon={User} label="Full Name" required>
            <input required disabled={busy} className="input" placeholder="Your full name" value={form.fullName} onChange={set('fullName')} />
          </Field>
          <Field icon={Mail} label="Email" required>
            <input required disabled={busy} type="email" autoComplete="email" className="input" placeholder="example@gmail.com" value={form.email} onChange={set('email')} />
          </Field>

          <div className="sm:col-span-2">
            <label className="label">
              <Users size={14} className="text-ink-soft" />
              Gender
              <span className="ml-0.5 text-rose-500">*</span>
            </label>
            <GenderPicker
              value={form.gender}
              disabled={busy}
              onChange={(g) => setForm({ ...form, gender: g })}
            />
          </div>

          <Field icon={Lock} label="Password" required>
            <div className="relative">
              <input
                required
                disabled={busy}
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={6}
                className="input pr-10"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={set('password')}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft transition hover:text-ink"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
          <Field icon={Lock} label="Confirm Password" required>
            <input
              required
              disabled={busy}
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              className="input"
              placeholder="Re-type your password"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
            />
          </Field>

          <Field icon={Phone} label="Phone">
            <input disabled={busy} className="input" placeholder="+880 1627441627" value={form.phone} onChange={set('phone')} />
          </Field>
          <Field icon={Building2} label="Organization">
            <input disabled={busy} className="input" placeholder={t.orgPlaceholder} value={form.organization} onChange={set('organization')} />
          </Field>
          <Field icon={MapPin} label="Location">
            <input disabled={busy} className="input" placeholder="Dhaka, Bangladesh" value={form.location} onChange={set('location')} />
          </Field>
          <Field label="Focus Area">
            <input disabled={busy} className="input" placeholder={t.focusPlaceholder} value={form.focusArea} onChange={set('focusArea')} />
          </Field>

          <div className="sm:col-span-2">
            <label className="label">Short Bio</label>
            <textarea
              rows={4}
              disabled={busy}
              className="input resize-none"
              placeholder="Write a short professional profile"
              value={form.bio}
              onChange={set('bio')}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 sm:col-span-2"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileTap={!busy ? { scale: 0.985 } : {}}
            type="submit"
            disabled={busy}
            className="btn-primary flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-2"
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                {t.cta}
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </form>
      </div>
    </AuthShell>
  );
};

export default Register;
