import { forwardRef } from 'react'
import Card from '../common/Card.jsx'
import StatCard from './StatCard.jsx'
import {
  altTextTone,
  formatNumber,
  h1Tone,
  speedTone,
  statusCaption,
  statusTone,
  TONE,
} from '../../utils/formatters.js'

/**
 * ResultCards.jsx
 * Renders a successful audit as a grid of "vital sign" cards — a small
 * label above a large mono-spaced number/value, echoing a diagnostic
 * monitor readout. Forwards a ref to its heading so the app can move
 * focus here once results land (screen-reader friendly success state).
 */
const ResultCards = forwardRef(function ResultCards({ result }, ref) {
  const {
    requested_url,
    final_url,
    http_status,
    response_time_ms,
    title,
    meta_description,
    h1_count,
    image_count,
    images_missing_alt,
    word_count,
    was_redirected,
  } = result

  const statusDotClass =
    statusTone(http_status) === TONE.GOOD
      ? 'bg-pulse-400'
      : statusTone(http_status) === TONE.WARN
      ? 'bg-amber-400'
      : 'bg-vital-400'

  return (
    <section
      aria-labelledby="results-heading"
      className="max-w-5xl mx-auto px-6 mt-10 animate-fadeUp"
    >
      <h2 ref={ref} tabIndex={-1} id="results-heading" className="sr-only">
        Audit results for {requested_url}
      </h2>

      {/* Summary banner */}
      <Card className="p-5 sm:p-6 mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusDotClass} animate-blink`} aria-hidden="true" />
          <span className="font-mono text-sm text-slate-300 truncate">{requested_url}</span>
        </div>
        {was_redirected && (
          <span className="text-xs font-mono px-2 py-1 rounded-full bg-indigoglow-600/20 text-indigoglow-500 w-fit shrink-0">
            Redirected
          </span>
        )}
      </Card>

      {/* Vitals grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
        <StatCard
          label="HTTP Status"
          value={http_status}
          tone={statusTone(http_status)}
          caption={statusCaption(http_status)}
          delayMs={0}
        />
        <StatCard
          label="Response Time"
          value={`${formatNumber(response_time_ms)} ms`}
          tone={speedTone(response_time_ms)}
          delayMs={40}
        />
        <StatCard
          label="H1 Count"
          value={h1_count}
          tone={h1Tone(h1_count)}
          caption={h1_count === 1 ? 'Ideal (exactly one)' : 'Best practice is one H1'}
          delayMs={80}
        />
        <StatCard label="Images Found" value={image_count} delayMs={120} />
        <StatCard
          label="Missing Alt Text"
          value={images_missing_alt}
          tone={altTextTone(images_missing_alt, image_count)}
          caption={image_count > 0 ? `of ${image_count} images` : 'No images on page'}
          delayMs={160}
        />
        <StatCard label="Approx. Word Count" value={formatNumber(word_count)} delayMs={200} />
      </div>

      {/* Text-heavy fields get full-width cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-5">
        <Card hoverable className="p-5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
            Page Title
          </span>
          <p className="mt-1.5 text-slate-100 break-words">
            {title || <span className="text-slate-500 italic">No title tag found</span>}
          </p>
        </Card>
        <Card hoverable className="p-5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
            Meta Description
          </span>
          <p className="mt-1.5 text-slate-100 break-words">
            {meta_description || (
              <span className="text-slate-500 italic">No meta description found</span>
            )}
          </p>
        </Card>
      </div>

      <Card hoverable className="p-5 mt-5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
          Final Redirect URL
        </span>
        <p className="mt-1.5 font-mono text-sm text-pulse-400 break-all">{final_url}</p>
      </Card>
    </section>
  )
})

export default ResultCards
