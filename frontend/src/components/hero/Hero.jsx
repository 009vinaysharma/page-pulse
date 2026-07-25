/**
 * Hero.jsx
 * The page's thesis statement: Page Pulse reads a website's "vitals"
 * the way a monitor reads a patient's — instantly, in plain numbers.
 * The animated pulse line is the signature visual element of the app.
 */
export default function Hero() {
  return (
    <section className="relative overflow-hidden grid-backdrop">
      {/* Ambient gradient glow behind the content */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigoglow-600/20 via-transparent to-pulse-500/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-pulse-500/20 blur-[120px]"
      />

      <div className="relative max-w-5xl mx-auto px-6 pt-16 sm:pt-20 pb-12 sm:pb-14 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-mono tracking-wide text-pulse-400 animate-fadeUp">
          <span className="h-1.5 w-1.5 rounded-full bg-pulse-400 animate-blink" />
          LIVE SITE DIAGNOSTICS
        </div>

        <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white leading-[1.1] animate-fadeUp [animation-delay:80ms]">
          Check any website&rsquo;s
          <span className="block bg-gradient-to-r from-pulse-400 to-indigoglow-500 bg-clip-text text-transparent">
            vital signs.
          </span>
        </h1>

        <p className="mt-5 max-w-xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed animate-fadeUp [animation-delay:160ms]">
          Drop in a URL and Page Pulse reads its status, speed, and structure
          in seconds &mdash; no signup, no fuss.
        </p>

        {/* Signature element: an animated heartbeat / pulse line */}
        <div className="mt-8 sm:mt-10 animate-fadeUp [animation-delay:220ms]">
          <svg
            viewBox="0 0 600 80"
            className="w-full max-w-xl mx-auto h-14 sm:h-20"
            aria-hidden="true"
          >
            <polyline
              points="0,40 120,40 145,10 165,70 190,40 260,40 285,20 305,55 330,40 600,40"
              fill="none"
              stroke="url(#pulseGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="12 8"
              className="animate-pulseLine motion-reduce:animate-none"
            />
            <defs>
              <linearGradient id="pulseGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22D3C6" stopOpacity="0.15" />
                <stop offset="35%" stopColor="#22D3C6" />
                <stop offset="65%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0.15" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </section>
  )
}
