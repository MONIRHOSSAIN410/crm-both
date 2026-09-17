import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Bell, BadgeCheck, Camera, Trash2, Save, Loader2 } from 'lucide-react';
import { fileToAvatarDataUrl, validateImage, ACCEPTED_TYPES } from '../utils/image';
import api from '../api/axios';
import { Card, Avatar } from '../components/ui/Bits';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { value: 'profile', label: 'Profile Settings', icon: User },
  { value: 'password', label: 'Password', icon: Lock },
  { value: 'notifications', label: 'Notifications', icon: Bell },
  { value: 'verification', label: 'Verification', icon: BadgeCheck },
];

const Field = ({ label, required, children }) => (
  <div>
    <label className="label">
      {label}
      {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [tab, setTab] = useState('profile');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const [profile, setProfile] = useState({
    firstName: user?.fullName?.split(' ')[0] || '',
    lastName: user?.fullName?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    nid: user?.nid || '',
    tin: user?.tin || '',
    taxCountry: user?.taxCountry || 'Bangladesh',
    residentialAddress: user?.residentialAddress || '',
  });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  // --- Profile photo ---------------------------------------------------
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  // Shows the new photo immediately, before the save round-trip finishes.
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');

  // Keep the preview in sync when the user object arrives or changes.
  useEffect(() => {
    setAvatarPreview(user?.avatar || '');
  }, [user?.avatar]);

  const pickPhoto = () => fileRef.current?.click();

  const onPhotoChange = async (e) => {
    const file = e.target.files?.[0];
    // Reset so picking the same file twice still fires onChange.
    e.target.value = '';
    if (!file) return;

    const invalid = validateImage(file);
    if (invalid) return flash(invalid);

    setUploading(true);
    const previous = avatarPreview;
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setAvatarPreview(dataUrl);

      const res = await updateProfile({ avatar: dataUrl });
      if (res.ok) {
        flash(res.demo ? 'Photo saved locally (server offline)' : 'Profile photo updated');
      } else {
        setAvatarPreview(previous); // roll back so the UI matches the server
        flash(res.message || 'Could not save the photo');
      }
    } catch (error) {
      setAvatarPreview(previous);
      flash(error.message || 'Could not process that image');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    setUploading(true);
    const previous = avatarPreview;
    setAvatarPreview('');
    const res = await updateProfile({ avatar: '' });
    if (!res.ok) {
      setAvatarPreview(previous);
      flash(res.message || 'Could not remove the photo');
    } else {
      flash('Profile photo removed');
    }
    setUploading(false);
  };
  const [prefs, setPrefs] = useState(user?.notificationPrefs || { email: true, push: true, sms: false });

  const set = (k) => (e) => setProfile({ ...profile, [k]: e.target.value });

  const flash = (m) => {
    setToast(m);
    setTimeout(() => setToast(''), 2600);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setBusy(true);
    const res = await updateProfile({
      fullName: `${profile.firstName} ${profile.lastName}`.trim(),
      phone: profile.phone,
      gender: profile.gender,
      nid: profile.nid,
      tin: profile.tin,
      taxCountry: profile.taxCountry,
      residentialAddress: profile.residentialAddress,
    });
    setBusy(false);
    flash(res.ok ? 'Profile saved' : res.message);
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return flash('Passwords do not match');
    setBusy(true);
    try {
      await api.put('/auth/password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      flash('Password updated');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      flash(err.response?.data?.message || 'Saved locally (offline demo)');
    }
    setBusy(false);
  };

  const savePrefs = async () => {
    setBusy(true);
    const res = await updateProfile({ notificationPrefs: prefs });
    setBusy(false);
    flash(res.ok ? 'Preferences saved' : res.message);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink">Settings</h1>
        <p className="section-sub mt-0.5 capitalize">{tab.replace(/([A-Z])/g, ' $1')}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <Card pad={false} className="h-fit p-2">
          <ul className="space-y-1">
            {TABS.map(({ value, label, icon: Icon }) => (
              <li key={value}>
                <button
                  onClick={() => setTab(value)}
                  className={`relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition ${
                    tab === value ? 'text-brand-800' : 'text-ink-muted hover:bg-canvas'
                  }`}
                >
                  {tab === value && (
                    <motion.span layoutId="set-active" className="absolute inset-0 rounded-xl bg-brand-100" />
                  )}
                  <Icon size={16} className="relative z-10" />
                  <span className="relative z-10">{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {tab === 'profile' && (
                <form onSubmit={saveProfile} className="space-y-5">
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={pickPhoto}
                      title="Change profile photo"
                      className="group relative rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25"
                    >
                      <Avatar src={avatarPreview} name={user?.fullName} gender={profile.gender} size={72} />
                      <span className="absolute -bottom-0.5 -right-0.5 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-brand-600 text-white transition group-hover:bg-brand-700">
                        {uploading ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Camera size={12} />
                        )}
                      </span>
                    </button>

                    {/* Hidden native picker driven by the buttons above/below. */}
                    <input
                      ref={fileRef}
                      type="file"
                      accept={ACCEPTED_TYPES.join(',')}
                      onChange={onPhotoChange}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={pickPhoto}
                      disabled={uploading}
                      className="btn-primary py-2 text-xs"
                    >
                      {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                      {uploading ? 'Uploading…' : 'Change Photo'}
                    </button>

                    <button
                      type="button"
                      onClick={removePhoto}
                      disabled={uploading || !avatarPreview}
                      className="btn-ghost py-2 text-xs text-rose-500 disabled:opacity-40"
                    >
                      <Trash2 size={14} /> Delete avatar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="First Name" required>
                      <input className="input" placeholder="First name" value={profile.firstName} onChange={set('firstName')} />
                    </Field>
                    <Field label="Last Name" required>
                      <input className="input" placeholder="Last name" value={profile.lastName} onChange={set('lastName')} />
                    </Field>
                    <Field label="Email" required>
                      <input className="input" type="email" placeholder="example@gmail.com" value={profile.email} readOnly />
                    </Field>
                    <Field label="Mobile Number" required>
                      <input className="input" placeholder="+880 1627441627" value={profile.phone} onChange={set('phone')} />
                    </Field>

                    <Field label="Gender">
                      <div className="flex items-center gap-5 pt-1.5">
                        {['male', 'female'].map((g) => (
                          <label key={g} className="flex cursor-pointer items-center gap-2 text-[13px] capitalize">
                            <input
                              type="radio"
                              name="gender"
                              checked={profile.gender === g}
                              onChange={() => setProfile({ ...profile, gender: g })}
                              className="h-4 w-4 accent-brand-600"
                            />
                            {g}
                          </label>
                        ))}
                      </div>
                    </Field>
                    <Field label="ID">
                      <input className="input" placeholder="NID 0000 4029 1640 8934" value={profile.nid} onChange={set('nid')} />
                    </Field>
                    <Field label="Tax Identification Number">
                      <input className="input" placeholder="TIN 1234567890" value={profile.tin} onChange={set('tin')} />
                    </Field>
                    <Field label="Tax Identification Country">
                      <input className="input" placeholder="Bangladesh" value={profile.taxCountry} onChange={set('taxCountry')} />
                    </Field>
                  </div>

                  <Field label="Residential Address">
                    <textarea
                      rows={3}
                      className="input resize-none"
                      placeholder="Address to comply with valid Roadmap"
                      value={profile.residentialAddress}
                      onChange={set('residentialAddress')}
                    />
                  </Field>

                  <div className="flex justify-end">
                    <button type="submit" disabled={busy} className="btn-primary py-2.5 text-xs">
                      {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
                    </button>
                  </div>
                </form>
              )}

              {tab === 'password' && (
                <form onSubmit={savePassword} className="max-w-md space-y-4">
                  <Field label="Current Password" required>
                    <input type="password" className="input" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
                  </Field>
                  <Field label="New Password" required>
                    <input type="password" className="input" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
                  </Field>
                  <Field label="Confirm New Password" required>
                    <input type="password" className="input" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
                  </Field>
                  <button type="submit" disabled={busy} className="btn-primary py-2.5 text-xs">
                    {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Update Password
                  </button>
                </form>
              )}

              {tab === 'notifications' && (
                <div className="max-w-lg space-y-3">
                  {[
                    ['email', 'Email notifications', 'Applications, payouts and weekly summaries'],
                    ['push', 'Push notifications', 'Real-time alerts in the dashboard'],
                    ['sms', 'SMS alerts', 'Critical escrow and payment events only'],
                  ].map(([key, title, sub]) => (
                    <div key={key} className="flex items-center justify-between rounded-xl border border-line/70 px-4 py-3">
                      <div>
                        <p className="text-[13.5px] font-semibold text-ink">{title}</p>
                        <p className="text-[11.5px] text-ink-muted">{sub}</p>
                      </div>
                      <button
                        onClick={() => setPrefs({ ...prefs, [key]: !prefs[key] })}
                        aria-label={title}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition ${prefs[key] ? 'bg-brand-600' : 'bg-slate-200'}`}
                      >
                        <motion.span
                          layout
                          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${prefs[key] ? 'left-[22px]' : 'left-0.5'}`}
                        />
                      </button>
                    </div>
                  ))}
                  <button onClick={savePrefs} disabled={busy} className="btn-primary py-2.5 text-xs">
                    <Save size={14} /> Save Preferences
                  </button>
                </div>
              )}

              {tab === 'verification' && (
                <div className="max-w-lg space-y-4">
                  <div className="flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3.5">
                    <BadgeCheck size={20} className="text-brand-600" />
                    <div>
                      <p className="text-[13.5px] font-semibold text-ink">
                        {user?.verified ? 'Account verified' : 'Verification pending'}
                      </p>
                      <p className="text-[11.5px] text-ink-muted">
                        Upload your NID and business documents to unlock escrow release.
                      </p>
                    </div>
                  </div>
                  {['National ID (front)', 'National ID (back)', 'Trade licence / TIN certificate'].map((doc) => (
                    <div key={doc} className="flex items-center justify-between rounded-xl border border-dashed border-line px-4 py-3.5">
                      <span className="text-[13px] text-ink-muted">{doc}</span>
                      <button className="btn-ghost py-1.5 text-[11.5px]">Upload</button>
                    </div>
                  ))}
                  <button className="btn-primary py-2.5 text-xs">Submit for review</button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-white shadow-lift"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
