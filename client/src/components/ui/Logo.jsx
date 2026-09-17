import { motion } from 'framer-motion';
import LogoMark from './LogoMark';

/**
 * Lockup: the coin mark plus the wordmark.
 *
 * `tone="light"` is for the deep-green panels (sidebar, auth hero) where the
 * word sits directly on the gradient; the default white plate is for light
 * backgrounds. Both use the same mark, so the brand reads the same everywhere.
 */
const SIZES = {
  sm: { box: 'h-9 gap-2 px-2.5', mark: 22, word: 'text-[15px]', latin: 'text-[8.5px]' },
  md: { box: 'h-12 gap-2.5 px-3.5', mark: 30, word: 'text-xl', latin: 'text-[10px]' },
  lg: { box: 'h-16 gap-3 px-4', mark: 40, word: 'text-2xl', latin: 'text-[11px]' },
};

const Logo = ({ size = 'md', tone = 'plate', className = '', animate = true }) => {
  const s = SIZES[size] || SIZES.md;

  const surface =
    tone === 'light'
      ? 'bg-white/10 ring-1 ring-white/15 backdrop-blur-sm'
      : 'bg-white shadow-soft ring-1 ring-black/5';
  const word = tone === 'light' ? 'text-white' : 'text-brand-800';
  const latin = tone === 'light' ? 'text-white/55' : 'text-ink-soft';

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: -8 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={`inline-flex items-center rounded-2xl ${surface} ${s.box} ${className}`}
    >
      <LogoMark size={s.mark} className="shrink-0" />
      <span className="flex flex-col justify-center leading-none">
        <span className={`bn font-bold leading-none ${s.word} ${word}`}>মূলধন</span>
        <span
          className={`mt-[3px] font-semibold uppercase leading-none tracking-[0.22em] ${s.latin} ${latin}`}
        >
          Muldhon
        </span>
      </span>
    </motion.div>
  );
};

export default Logo;
