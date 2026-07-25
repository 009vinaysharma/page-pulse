/**
 * Loader.jsx
 * A skeleton that mirrors the shape of the results grid, so the layout
 * doesn't visibly "jump" once real data arrives. Paired with the pulse-
 * line motif from the hero for brand consistency.
 */

function SkeletonCard({ delayMs = 0, className = '' }) {
  return (
    <div
      className={`pulse-card p-5 flex flex-col gap-3 animate-pulse ${className}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="h-2.5 w-20 rounded-full bg-white/10" />
      <div className="h-6 w-16 rounded-md bg-white/10" />
    </div>
  )
}

export default function Loader() {
  return (
    <div role="status" aria-live="polite" className="max-w-5xl mx-auto px-6 mt-10 animate-fadeUp">
      <span className="sr-only">Analyzing website, please wait…</span>

      <div className="pulse-card p-4 mb-6 flex items-center gap-3">
        <svg viewBox="0 0 200 40" className="w-24 h-8 shrink-0" aria-hidden="true">
          <polyline
            points="0,20 60,20 72,6 84,34 96,20 200,20"
            fill="none"
            stroke="#22D3C6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="10 6"
            className="animate-pulseLine"
          />
        </svg>
        <p className="font-mono text-sm text-slate-400 tracking-wide">
          Reading vitals<span className="animate-blink">…</span>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} delayMs={i * 60} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-5">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}
