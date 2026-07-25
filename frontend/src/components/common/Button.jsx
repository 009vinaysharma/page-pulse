import { forwardRef } from 'react'
import Spinner from './Spinner.jsx'

/**
 * Button.jsx
 * A single reusable button used everywhere in the app, so hover/focus/
 * disabled/loading behavior only has to be implemented (and fixed) once.
 */
const VARIANTS = {
  primary:
    'bg-gradient-to-r from-pulse-500 to-indigoglow-600 text-white shadow-lg shadow-pulse-500/10 hover:shadow-pulse-500/20 hover:brightness-110',
  ghost:
    'bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 hover:border-white/20',
}

const Button = forwardRef(function Button(
  { children, isLoading = false, variant = 'primary', className = '', disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-display font-semibold
        transition-all duration-200 ease-out active:scale-[0.97]
        disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
        ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  )
})

export default Button
