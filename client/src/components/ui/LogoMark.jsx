/**
 * The Muldhon mark.
 *
 * "মূলধন" means capital — the money that is put to work rather than spent —
 * so the mark is a coin with a growth arrow rising out of it: the deep green
 * of the brand for the coin, the gold accent for the value it carries. It is
 * drawn as inline SVG rather than an emoji so it keeps its colour and weight
 * on every platform, scales to any size, and can be reused as the favicon.
 */
const LogoMark = ({ size = 32, className = '', title = 'Muldhon' }) => (
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
      <linearGradient id="mdn-coin" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1EA65C" />
        <stop offset="0.55" stopColor="#12904D" />
        <stop offset="1" stopColor="#0A3A28" />
      </linearGradient>
      <linearGradient id="mdn-gold" x1="14" y1="30" x2="36" y2="14" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F9E36B" />
        <stop offset="1" stopColor="#EFC42B" />
      </linearGradient>
    </defs>

    {/* Coin body */}
    <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#mdn-coin)" />
    <rect
      x="2"
      y="2"
      width="44"
      height="44"
      rx="13"
      stroke="#ffffff"
      strokeOpacity="0.18"
      strokeWidth="1.5"
    />

    {/* Inner rim, the way a struck coin catches light */}
    <circle cx="24" cy="24" r="16.5" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1.4" />

    {/* Growth arrow: capital compounding */}
    <path
      d="M13.5 30.5 L20 24 L25 29 L34 19.5"
      stroke="url(#mdn-gold)"
      strokeWidth="3.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M27.5 18.5 H35 V26"
      stroke="url(#mdn-gold)"
      strokeWidth="3.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Base line: the principal the growth stands on */}
    <path
      d="M13.5 35.5 H34.5"
      stroke="#ffffff"
      strokeOpacity="0.45"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

export default LogoMark;
