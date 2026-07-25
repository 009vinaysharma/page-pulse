import axios from 'axios'

// The backend base URL comes from an environment variable so the same
// build works locally (FastAPI on :8000) and in production (Render).
// Set VITE_API_BASE_URL in a .env file or in Vercel's project settings.
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL,
  timeout: 20000, // generous client-side ceiling; the backend has its own request timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Sends a URL to the backend for a full audit. Always resolves (never
 * throws) to a plain object with a `success` boolean — every failure
 * mode, whether it's a structured backend error or a raw network
 * failure, is normalized into the same `{ success, error_type, message }`
 * shape so callers never need a try/catch.
 *
 * @param {string} url - the URL to analyze
 * @param {AbortSignal} [signal] - lets callers cancel an in-flight request
 */
export async function analyzeUrl(url, signal) {
  try {
    const { data } = await apiClient.post('/api/analyze', { url }, { signal })
    return data
  } catch (err) {
    if (axios.isCancel(err) || err.code === 'ERR_CANCELED') {
      // A newer request superseded this one; caller ignores this result.
      return { success: false, error_type: 'CANCELED', message: 'Request canceled.' }
    }

    // The backend responded with our structured error envelope (4xx/5xx).
    const backendError = err.response?.data
    if (backendError && typeof backendError === 'object' && 'error_type' in backendError) {
      return backendError
    }

    if (err.code === 'ECONNABORTED') {
      return {
        success: false,
        error_type: 'CLIENT_TIMEOUT',
        message: 'The request took too long to reach Page Pulse. Please try again.',
      }
    }

    if (err.response) {
      return {
        success: false,
        error_type: 'SERVER_ERROR',
        message: `Page Pulse responded with an unexpected error (HTTP ${err.response.status}). Please try again.`,
      }
    }

    return {
      success: false,
      error_type: 'NETWORK_ERROR',
      message: 'Could not reach the Page Pulse API. Check your connection or try again shortly.',
    }
  }
}

export default apiClient
