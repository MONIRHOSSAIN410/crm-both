import { motion } from 'framer-motion';
import Logo from './ui/Logo';

/**
 * Split-panel auth frame: deep green gradient on the left, form on the right.
 * Stacks vertically below `lg`.
 */
const AuthShell = ({ eyebrow, heading, sub, children, wide = false }) => (
  <div className="flex min-h-screen w-full items-center bg-canvas p-4 sm:p-6 lg:p-8">
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`mx-auto w-full grid overflow-hidden rounded-[28px] bg-white shadow-lift lg:grid-cols-[minmax(280px,42%)_1fr] ${
        wide ? 'max-w-6xl' : 'max-w-5xl'
      }`}
    >
      {/* Left panel */}
      <div className="relative isolate flex min-h-[240px] flex-col justify-between overflow-hidden bg-deep-green p-7 text-white sm:p-9 lg:min-h-[560px]">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-10 top-4 h-56 w-56 rounded-full bg-sun-300/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-brand-400/25 blur-3xl"
        />

        <Logo size="lg" className="animate-floaty self-start" />

        <div className="relative mt-10">
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-[11px] font-bold uppercase tracking-[0.18em] text-sun-300"
          >
            {eyebrow}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.22, duration: 0.55 }}
            className="mt-3 max-w-[15ch] text-3xl font-extrabold leading-[1.12] tracking-tight sm:text-[38px]"
          >
            {heading}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mt-4 max-w-sm text-[13px] leading-relaxed text-white/70"
          >
            {sub}
          </motion.p>
        </div>
      </div>

      {/* Right panel */}
      <div className="p-6 sm:p-9 lg:p-10">{children}</div>
    </motion.div>
  </div>
);

export default AuthShell;
