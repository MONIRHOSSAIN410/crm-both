/**
 * The Muldhon mark.
 *
 * "মূলধন" means capital — money kept working rather than spent — so the mark is
 * a stack of coins whose top coin doubles as the base of a rising column. Read
 * one way it is savings; read the other it is growth. The gold sits only on the
 * top coin and the rising bar, so the eye lands on the part that grows.
 *
 * Drawn as inline SVG rather than an emoji, so the colour and weight are the
 * same on every platform, it scales to any size, and the same geometry can be
 * reused for the favicon.
 */
const LogoMark = ({ size = 32, className = '', title = 'Muldhon' }) => {
  // Unique gradient ids: two marks on one page must not share a <defs> id, or
  // the second silently paints with the first one's gradient.
  const uid = `mdn-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label={title}
      className={className}
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="4" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1EA65C" />
          <stop offset="0.5" stopColor="#12904D" />
          <stop offset="1" stopColor="#0A3A28" />
        </linearGradient>
        <linearGradient id={`${uid}-gold`} x1="16" y1="34" x2="34" y2="10" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F5D547" />
          <stop offset="1" stopColor="#FCEFA8" />
        </linearGradient>
        <linearGradient id={`${uid}-sheen`} x1="10" y1="4" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Rounded-square badge */}
      <rect x="2" y="2" width="44" height="44" rx="14" fill={`url(#${uid}-bg)`} />
      {/* Light catching the top-left corner, so the badge reads as a surface */}
      <path d="M2 16C2 8.3 8.3 2 16 2h16L2 32V16Z" fill={`url(#${uid}-sheen)`} />

      {/* Two coins at rest — the principal */}
      <ellipse cx="24" cy="35.5" rx="12" ry="4.2" fill="#ffffff" fillOpacity="0.22" />
      <ellipse cx="24" cy="30.5" rx="12" ry="4.2" fill="#ffffff" fillOpacity="0.34" />

      {/* The top coin, in gold: the capital that is put to work */}
      <ellipse cx="24" cy="25.5" rx="12" ry="4.2" fill={`url(#${uid}-gold)`} />

      {/* Rising column, growing out of the gold coin */}
      <rect x="15.5" y="19" width="4.6" height="5" rx="2.3" fill="#ffffff" fillOpacity="0.85" />
      <rect x="21.7" y="14" width="4.6" height="10" rx="2.3" fill="#ffffff" fillOpacity="0.92" />
      <rect x="27.9" y="8.5" width="4.6" height="15.5" rx="2.3" fill={`url(#${uid}-gold)`} />
    </svg>
  );
};

export default LogoMark;
