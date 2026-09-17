import { motion } from 'framer-motion';

const Logo = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-9 px-2.5 text-base',
    md: 'h-12 px-3.5 text-xl',
    lg: 'h-16 px-5 text-2xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`inline-flex items-center gap-2 rounded-xl bg-white shadow-soft ring-1 ring-black/5 ${sizes[size]} ${className}`}
    >
      <span aria-hidden className="leading-none" style={{ fontSize: '1.15em' }}>
        💰
      </span>
      <span className="bn font-bold leading-none text-brand-800">মূলধন</span>
    </motion.div>
  );
};

export default Logo;
