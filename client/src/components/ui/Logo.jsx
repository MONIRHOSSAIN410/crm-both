import { motion } from 'framer-motion';
import LogoMark from './LogoMark';

/**
 * Lockup: the coin-stack mark plus the wordmark.
 *
 * `tone="light"` is for the deep-green panels (sidebar, auth hero) where the
 * word sits on the gradient; the default white plate is for light backgrounds.
 * Both use the same mark, so the brand reads the same everywhere.
 *
 * The Bengali "মূলধন" leads because that is the product's name; the Latin
 * "MULDHON" sits under it, letter-spaced and small, as a transliteration rather
 * than a second name competing for attention.
 */
const SIZES = {
  sm: { gap: 'gap-2.5', pad: 'px-3 py-2', mark: 26, word: 'text-[16px]', latin: 'text-[8px] tracking-[0.3em]' },
  md: { gap: 'gap-3', pad: 'px-3.5 py-2.5', mark: 32, word: 'text-[20px]', latin: 'text-[9px] tracking-[0.3em]' },
  lg: { gap: 'gap-3.5', pad: 'px-4 py-3', mark: 44, word: 'text-[27px]', latin: 'text-[11px] tracking-[0.32em]' },
};

const Logo = ({ size = 'md', tone = 'plate', className = '', animate = true }) => {
  const s = SIZES[size] || SIZES.md;

  const surface =
    tone === 'light'
      ? 'bg-white/[0.07] ring-1 ring-white/15'
      : 'bg-white shadow-soft ring-1 ring-black/5';
  const word = tone === 'light' ? 'text-white' : 'text-brand-800';
  const latin = tone === 'light' ? 'text-sun-300/75' : 'text-brand-600/60';

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: -8 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={`inline-flex items-center rounded-2xl ${surface} ${s.gap} ${s.pad} ${className}`}
    >
      <LogoMark size={s.mark} className="shrink-0" />
      <span className="flex flex-col justify-center">
        <span className={`bn font-bold leading-none ${s.word} ${word}`}>মূলধন</span>
        <span className={`mt-1 font-bold uppercase leading-none ${s.latin} ${latin}`}>
          Muldhon
        </span>
      </span>
    </motion.div>
  );
};

export default Logo;
