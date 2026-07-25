import { lazy, Suspense, useCallback, useEffect, useRef } from 'react'
import Header from './components/layout/Header.jsx'
import Hero from './components/hero/Hero.jsx'
import URLInputForm from './components/analyzer/URLInputForm.jsx'
import Loader from './components/feedback/Loader.jsx'
import ErrorState from './components/feedback/ErrorState.jsx'
import Footer from './components/layout/Footer.jsx'
import { useAnalyzeUrl, STATUS } from './hooks/useAnalyzeUrl.js'

// Results only need to render after a successful audit, so they're
// code-split into their own chunk and loaded on demand — the initial
// bundle stays smaller for everyone who's just landing on the page.
const ResultCards = lazy(() => import('./components/results/ResultCards.jsx'))

export default function App() {
  const { status, result, error, analyze, reset } = useAnalyzeUrl()
  const resultsHeadingRef = useRef(null)

  // Move focus to the results heading once a successful audit renders,
  // so screen-reader users are told the outcome without hunting for it.
  useEffect(() => {
    if (status === STATUS.SUCCESS) {
      resultsHeadingRef.current?.focus()
    }
  }, [status])

  const handleAnalyze = useCallback((url) => analyze(url), [analyze])
  const handleRetry = useCallback(() => reset(), [reset])

  return (
    <div className="min-h-screen flex flex-col bg-midnight-900">
      <Header />
      <main className="flex-1">
        <Hero />
        <URLInputForm onAnalyze={handleAnalyze} isLoading={status === STATUS.LOADING} />

        <div aria-live="polite">
          {status === STATUS.LOADING && <Loader />}
          {status === STATUS.ERROR && <ErrorState error={error} onRetry={handleRetry} />}
          {status === STATUS.SUCCESS && result && (
            <Suspense fallback={<Loader />}>
              <ResultCards result={result} ref={resultsHeadingRef} />
            </Suspense>
          )}
        </div>

        {status === STATUS.IDLE && (
          <div className="max-w-2xl mx-auto px-6 mt-10 text-center">
            <p className="text-sm text-slate-600 font-mono">
              Try it with any site &mdash; e.g. &ldquo;wikipedia.org&rdquo; or &ldquo;github.com&rdquo;
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
