/**
 * Footer.jsx
 * Required attribution footer linking back to Digital Heroes, styled to
 * match the rest of the app rather than reading as an afterthought.
 */
export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-pulse-500 animate-blink" aria-hidden="true" />
          <span>© {new Date().getFullYear()} Page Pulse</span>
        </div>
        <a
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-pulse-400"
        >
          Built for Digital Heroes Training Task
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
          </svg>
        </a>
      </div>
    </footer>
  )
}
