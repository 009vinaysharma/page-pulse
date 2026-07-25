/**
 * Header.jsx
 * A minimal sticky top bar — the small dose of "SaaS product" chrome
 * that frames the page without competing with the hero below it.
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-midnight-900/70 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
            <rect width="24" height="24" rx="6" fill="#0B1120" />
            <polyline
              points="3,12 8,12 10,8 12,16 14,10 16,12 21,12"
              fill="none"
              stroke="url(#headerLine)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="headerLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22D3C6" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
          </svg>
          <span className="font-display font-semibold text-white tracking-tight">
            Page Pulse
          </span>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-pulse-400" />
          v2.0
        </span>
      </div>
    </header>
  )
}
