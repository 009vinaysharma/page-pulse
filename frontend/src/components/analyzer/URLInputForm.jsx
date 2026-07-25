import { useId, useState } from 'react'
import Button from '../common/Button.jsx'
import { validateUrlInput } from '../../utils/urlValidation.js'

/**
 * URLInputForm.jsx
 * The single control that matters most on this page. Validates input
 * locally for fast feedback, but always defers to the backend as the
 * real source of truth (see utils/urlValidation.js for why).
 */
export default function URLInputForm({ onAnalyze, isLoading }) {
  const [value, setValue] = useState('')
  const [touched, setTouched] = useState(false)
  const inputId = useId()
  const errorId = useId()

  const validation = validateUrlInput(value)
  const showError = touched && !validation.valid

  function handleChange(e) {
    setValue(e.target.value)
  }

  function handleBlur() {
    setTouched(true)
  }

  function handleClear() {
    setValue('')
    setTouched(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    setTouched(true)
    if (isLoading || !validation.valid) return
    onAnalyze(value.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto -mt-4 px-6" noValidate>
      <label htmlFor={inputId} className="sr-only">
        Website URL to analyze
      </label>

      <div
        className={`pulse-card flex flex-col sm:flex-row items-stretch gap-3 p-3 shadow-2xl shadow-black/30 transition-colors duration-200 ${
          showError ? 'border-vital-500/40' : 'focus-within:border-pulse-500/40'
        }`}
      >
        <div className="flex-1 flex items-center gap-3 px-3 min-w-0">
          <span className="font-mono text-sm text-slate-500 select-none shrink-0">
            https://
          </span>
          <input
            id={inputId}
            type="text"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            placeholder="example.com"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            aria-invalid={showError}
            aria-describedby={showError ? errorId : undefined}
            className="w-full min-w-0 bg-transparent py-3 text-slate-100 placeholder:text-slate-600 font-mono text-sm sm:text-base outline-none disabled:opacity-60"
          />
          {value && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear URL"
              className="shrink-0 rounded-full p-1 text-slate-500 transition-colors hover:text-slate-300 hover:bg-white/5"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <Button type="submit" isLoading={isLoading} className="shrink-0">
          {isLoading ? 'Analyzing…' : 'Analyze site'}
        </Button>
      </div>

      <p
        id={errorId}
        role={showError ? 'alert' : undefined}
        className={`mt-2 min-h-[1.25rem] text-sm font-mono transition-opacity duration-150 ${
          showError ? 'text-vital-400 opacity-100' : 'opacity-0'
        }`}
      >
        {showError ? validation.message : '\u00A0'}
      </p>
    </form>
  )
}
