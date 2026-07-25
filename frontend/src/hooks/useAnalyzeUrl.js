import { useCallback, useEffect, useRef, useState } from 'react'
import { analyzeUrl } from '../api/pagePulseApi.js'

export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
}

/**
 * Owns all state for a single "analyze a URL" workflow.
 *
 * Notably cancels any in-flight request before starting a new one (and
 * on unmount) via AbortController — without this, rapidly submitting two
 * different URLs could let an older, slower response overwrite a newer
 * one's result on screen.
 */
export function useAnalyzeUrl() {
  const [status, setStatus] = useState(STATUS.IDLE)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const abortControllerRef = useRef(null)

  const analyze = useCallback(async (url) => {
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setStatus(STATUS.LOADING)
    setError(null)
    setResult(null)

    const data = await analyzeUrl(url, controller.signal)

    // A newer request superseded this one — drop the stale result.
    if (controller.signal.aborted) return

    if (data.success) {
      setResult(data)
      setStatus(STATUS.SUCCESS)
    } else {
      setError(data)
      setStatus(STATUS.ERROR)
    }
  }, [])

  const reset = useCallback(() => {
    abortControllerRef.current?.abort()
    setStatus(STATUS.IDLE)
    setResult(null)
    setError(null)
  }, [])

  // Cancel any in-flight request if the component unmounts mid-request.
  useEffect(() => () => abortControllerRef.current?.abort(), [])

  return { status, result, error, analyze, reset }
}
