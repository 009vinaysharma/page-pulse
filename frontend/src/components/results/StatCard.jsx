import { memo } from 'react'
import Card from '../common/Card.jsx'
import { TONE } from '../../utils/formatters.js'

const TONE_CLASSES = {
  [TONE.DEFAULT]: 'text-white',
  [TONE.GOOD]: 'text-pulse-400',
  [TONE.WARN]: 'text-amber-400',
  [TONE.BAD]: 'text-vital-400',
}

/**
 * StatCard.jsx
 * One metric, one job: a label above a large value, with an optional
 * caption. Memoized since the results grid can render several of these
 * and none of them need to re-render unless their own props change.
 */
function StatCard({ label, value, caption, tone = TONE.DEFAULT, delayMs = 0 }) {
  return (
    <Card
      hoverable
      className="p-5 flex flex-col gap-1.5 animate-fadeUp"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className={`font-display text-2xl sm:text-3xl font-semibold ${TONE_CLASSES[tone]}`}>
        {value}
      </span>
      {caption && <span className="text-sm text-slate-400 break-words">{caption}</span>}
    </Card>
  )
}

export default memo(StatCard)
