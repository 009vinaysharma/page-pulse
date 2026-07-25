import { useEffect, useRef } from 'react'
import Card from '../common/Card.jsx'
import Button from '../common/Button.jsx'
import { labelForErrorType } from '../../constants/errorMessages.js'

/**
 * ErrorState.jsx
 * Shown when the backend returns success: false (or the request never
 * reached it). Speaks in the interface's voice — states what happened,
 * no apology, no vagueness — and moves keyboard/screen-reader focus to
 * itself so the failure isn't silently missed.
 */
export default function ErrorState({ error, onRetry }) {
  const headingRef = useRef(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [error])

  const label = labelForErrorType(error?.error_type)

  return (
    <div className="max-w-2xl mx-auto px-6 mt-10 animate-fadeUp">
      <Card
        role="alert"
        className="border-vital-500/30 p-6 sm:p-8 flex gap-4 items-start"
      >
        <div
          className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-vital-500/15 text-vital-400"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4m0 4h.01M10.29 3.86l-8.2 14.2A1.5 1.5 0 003.36 20h17.28a1.5 1.5 0 001.27-1.94l-8.2-14.2a1.5 1.5 0 00-2.42 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p
            ref={headingRef}
            tabIndex={-1}
            className="font-mono text-xs uppercase tracking-wider text-vital-400 outline-none"
          >
            {label}
          </p>
          <p className="mt-1 text-slate-200">{error?.message}</p>
          <Button
            type="button"
            variant="ghost"
            onClick={onRetry}
            className="mt-4 !px-4 !py-2 text-sm"
          >
            Try another URL
          </Button>
        </div>
      </Card>
    </div>
  )
}
