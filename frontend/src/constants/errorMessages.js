/**
 * Maps backend `error_type` codes to a short, human-readable label shown
 * as the error card's heading. Keeping this in one place means adding a
 * new backend error type never requires touching component code.
 */
export const ERROR_LABELS = {
  INVALID_URL: 'Invalid URL',
  BLOCKED_URL: 'Address Not Allowed',
  SSL_ERROR: 'SSL Certificate Issue',
  TIMEOUT: 'Request Timed Out',
  CONNECTION_ERROR: 'Connection Failed',
  TOO_MANY_REDIRECTS: 'Redirect Loop',
  REQUEST_FAILED: 'Request Failed',
  NETWORK_ERROR: 'Network Error',
  CLIENT_TIMEOUT: 'Request Timed Out',
  SERVER_ERROR: 'Server Error',
  UNKNOWN_ERROR: 'Unexpected Error',
}

export function labelForErrorType(errorType) {
  return ERROR_LABELS[errorType] || 'Audit Failed'
}
