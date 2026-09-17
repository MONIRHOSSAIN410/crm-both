import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BadgeCheck, Upload, FileText, Trash2, Loader2, Check, Clock, X, ExternalLink,
} from 'lucide-react';
import api from '../../api/axios';
import {
  validateDocument, fileToDocumentDataUrl, formatBytes, DOC_TYPES,
} from '../../utils/image';
import { useAuth } from '../../context/AuthContext';

/** Must match VERIFICATION_DOCS in the API — the server rejects anything else. */
const REQUIRED_DOCS = [
  { key: 'nid-front', label: 'National ID (front)', hint: 'Photo page, all four corners visible' },
  { key: 'nid-back', label: 'National ID (back)', hint: 'Address side of the card' },
  { key: 'trade-licence', label: 'Trade licence / TIN certificate', hint: 'PDF or a clear photo' },
];

const STATUS = {
  unverified: {
    tone: 'bg-canvas text-ink-muted',
    icon: Clock,
    title: 'Not verified yet',
    sub: 'Upload the three documents below, then submit them for review.',
  },
  submitted: {
    tone: 'bg-sun-100 text-amber-700',
    icon: Clock,
    title: 'Under review',
    sub: 'Your documents are with the admin team. This usually takes 1–2 working days.',
  },
  approved: {
    tone: 'bg-brand-100 text-brand-700',
    icon: BadgeCheck,
    title: 'Account verified',
    sub: 'Escrow release is unlocked on your account.',
  },
  rejected: {
    tone: 'bg-rose-100 text-rose-600',
    icon: X,
    title: 'Verification rejected',
    sub: 'Please re-upload the documents noted below and submit again.',
  },
};

/** One document row: empty drop target, or the uploaded file with a preview. */
const DocRow = ({ doc, uploaded, busy, onPick, onRemove, disabled }) => {
  const inputRef = useRef(null);
  const isPdf = uploaded?.fileType === 'application/pdf';
  // `dataUrl` is only present once the file itself has been fetched; a row can
  // exist with metadata alone while that request is still in flight.
  const preview = uploaded?.dataUrl || '';

  return (
    <div
      className={`rounded-xl border px-4 py-3.5 transition ${
        uploaded ? 'border-brand-200 bg-brand-50/40' : 'border-dashed border-line'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={DOC_TYPES.join(',')}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = ''; // so re-picking the same file still fires
          if (file) onPick(doc, file);
        }}
      />

      <div className="flex items-center gap-3">
        {uploaded ? (
          isPdf || !preview ? (
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white ring-1 ring-line">
              <FileText size={18} className="text-brand-600" />
            </span>
          ) : (
            <img
              src={preview}
              alt={doc.label}
              className="h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-line"
            />
          )
        ) : (
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-canvas text-ink-soft">
            <Upload size={17} />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-[13px] font-semibold text-ink">
            {doc.label}
            {uploaded && <Check size={13} className="shrink-0 text-brand-600" />}
          </p>
          <p className="truncate text-[11.5px] text-ink-muted">
            {uploaded
              ? `${uploaded.fileName || 'Uploaded'}${
                  uploaded.fileSize ? ` · ${formatBytes(uploaded.fileSize)}` : ''
                }`
              : doc.hint}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {preview && (
            <a
              href={preview}
              target="_blank"
              rel="noreferrer"
              title="Open full size"
              className="btn-ghost px-2 py-1.5 text-[11.5px]"
            >
              <ExternalLink size={13} />
            </a>
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy || disabled}
            className="btn-ghost py-1.5 text-[11.5px] disabled:opacity-50"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {uploaded ? 'Replace' : 'Upload'}
          </button>
          {uploaded && (
            <button
              type="button"
              onClick={() => onRemove(doc)}
              disabled={busy || disabled}
              title="Remove"
              className="btn-ghost px-2 py-1.5 text-[11.5px] text-rose-500 disabled:opacity-50"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const VerificationPanel = ({ flash }) => {
  const { user, applyUser } = useAuth();
  const [busyKey, setBusyKey] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /*
    The account carried on the session deliberately leaves out the file bytes —
    three ID scans would be about a megabyte riding along with every /auth/me
    call. This screen is the one place that needs the files, so it fetches them
    once, here. Until they arrive, the metadata already on the user object is
    enough to draw the rows.
  */
  const [docs, setDocs] = useState(user?.verificationDocs || []);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/auth/verification')
      .then(({ data }) => {
        if (!cancelled && Array.isArray(data.documents)) setDocs(data.documents);
      })
      .catch(() => {
        /* keep the metadata-only rows; uploading still works */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const byKey = useMemo(
    () => Object.fromEntries((docs || []).map((d) => [d.key, d])),
    [docs]
  );

  const status = user?.verified ? 'approved' : user?.verificationStatus || 'unverified';
  const meta = STATUS[status] || STATUS.unverified;
  const StatusIcon = meta.icon;

  const uploadedCount = REQUIRED_DOCS.filter((d) => byKey[d.key]).length;
  const complete = uploadedCount === REQUIRED_DOCS.length;
  const locked = status === 'submitted' || status === 'approved';

  const onPick = async (doc, file) => {
    const invalid = validateDocument(file);
    if (invalid) return flash(invalid);

    setBusyKey(doc.key);
    try {
      const dataUrl = await fileToDocumentDataUrl(file);
      const { data } = await api.put('/auth/verification', {
        key: doc.key,
        dataUrl,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });
      applyUser(data.user);
      if (Array.isArray(data.documents)) setDocs(data.documents);
      flash(`${doc.label} uploaded`);
    } catch (error) {
      flash(
        error?.response?.data?.message ||
          error.message ||
          'Could not upload that file. Please try again.'
      );
    } finally {
      setBusyKey('');
    }
  };

  const onRemove = async (doc) => {
    setBusyKey(doc.key);
    try {
      const { data } = await api.delete(`/auth/verification/${doc.key}`);
      applyUser(data.user);
      if (Array.isArray(data.documents)) setDocs(data.documents);
      flash(`${doc.label} removed`);
    } catch (error) {
      flash(error?.response?.data?.message || 'Could not remove that file.');
    } finally {
      setBusyKey('');
    }
  };

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/verification/submit');
      applyUser(data.user);
      if (Array.isArray(data.documents)) setDocs(data.documents);
      flash('Submitted for review');
    } catch (error) {
      flash(error?.response?.data?.message || 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl space-y-4">
      <div className={`flex items-start gap-3 rounded-xl px-4 py-3.5 ${meta.tone}`}>
        <StatusIcon size={20} className="mt-0.5 shrink-0" />
        <div>
          <p className="text-[13.5px] font-semibold">{meta.title}</p>
          <p className="text-[11.5px] opacity-80">{meta.sub}</p>
          {status === 'rejected' && user?.verificationNote && (
            <p className="mt-1.5 text-[11.5px] font-medium">Reason: {user.verificationNote}</p>
          )}
        </div>
      </div>

      {/* Progress: how many of the required documents are in. */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-[11.5px] font-medium text-ink-muted">
          <span>
            {uploadedCount} of {REQUIRED_DOCS.length} documents uploaded
          </span>
          <span>Max 8 MB · JPG, PNG, WEBP or PDF</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-line">
          <motion.div
            className="h-full rounded-full bg-brand-500"
            initial={false}
            animate={{ width: `${(uploadedCount / REQUIRED_DOCS.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 28 }}
          />
        </div>
      </div>

      <div className="space-y-2.5">
        {REQUIRED_DOCS.map((doc) => (
          <DocRow
            key={doc.key}
            doc={doc}
            uploaded={byKey[doc.key]}
            busy={busyKey === doc.key}
            disabled={locked}
            onPick={onPick}
            onRemove={onRemove}
          />
        ))}
      </div>

      {locked ? (
        <p className="text-[12px] text-ink-muted">
          {status === 'approved'
            ? 'Your documents have been accepted. Contact an admin if anything needs changing.'
            : 'Your documents are locked while the review is in progress.'}
        </p>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!complete || submitting}
          className="btn-primary py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <BadgeCheck size={14} />}
          {complete ? 'Submit for review' : `Upload all ${REQUIRED_DOCS.length} documents first`}
        </button>
      )}
    </div>
  );
};

export default VerificationPanel;
