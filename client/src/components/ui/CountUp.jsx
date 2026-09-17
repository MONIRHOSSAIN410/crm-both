import { useEffect, useRef, useState } from 'react';

const format = (n) => (typeof n === 'number' ? n.toLocaleString('en-US') : n);

const CountUp = ({ value = 0, duration = 900 }) => {
  const numeric = typeof value === 'number';
  const [display, setDisplay] = useState(numeric ? 0 : value);
  const frame = useRef();

  useEffect(() => {
    if (!numeric) {
      setDisplay(value);
      return undefined;
    }
    const start = performance.now();
    const from = 0;

    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, duration, numeric]);

  return <>{format(display)}</>;
};

export default CountUp;
