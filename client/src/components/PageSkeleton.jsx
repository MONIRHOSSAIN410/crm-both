/**
 * Shown only in the rare case a page is reached before its chunk has been
 * warmed (a hard refresh straight onto a deep link, or a cold cache). It keeps
 * the shape of a dashboard page so the layout does not jump when the real
 * content arrives — far less jarring than the word "Loading...".
 */
const Bar = ({ className = '' }) => (
  <div className={`relative overflow-hidden rounded-lg bg-line/60 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
  </div>
);

const PageSkeleton = () => (
  <div className="space-y-4" aria-busy="true" aria-label="Loading page">
    <Bar className="h-6 w-44" />
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="card card-pad space-y-3">
          <Bar className="h-3 w-20" />
          <Bar className="h-7 w-28" />
        </div>
      ))}
    </div>
    <div className="card card-pad space-y-3">
      <Bar className="h-4 w-36" />
      {[0, 1, 2, 3, 4].map((i) => (
        <Bar key={i} className="h-10 w-full" />
      ))}
    </div>
  </div>
);

/** Full-screen version, for routes rendered outside the dashboard shell. */
export const ScreenSpinner = () => (
  <div className="grid min-h-screen place-items-center bg-canvas">
    <span className="h-7 w-7 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
  </div>
);

export default PageSkeleton;
