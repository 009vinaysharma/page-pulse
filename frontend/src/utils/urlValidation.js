/**
 * Lightweight client-side URL validation. This is a UX convenience layer
 * only — it catches obviously malformed input before spending a network
 * round trip, but it is NOT the security boundary. The backend re-validates
 * and applies SSRF protections independently, since client-side checks can
 * always be bypassed.
 */

const MAX_URL_LENGTH = 2048

// Accepts an optional scheme, a dotted hostname (or "localhost"), an
// optional port, and an optional path/query/fragment.
const DOMAIN_PATTERN =
  /^(https?:\/\/)?((([a-z0-9]([a-z0-9-]*[a-z0-9])?)\.)+[a-z]{2,63}|localhost)(:\d{1,5})?(\/[^\s]*)?$/i

/**
 * Validates a raw URL string typed by the user.
 * @returns {{ valid: boolean, message: string }}
 */
export function validateUrlInput(rawValue) {
  const value = (rawValue || '').trim()

  if (!value) {
    return { valid: false, message: 'Enter a URL to analyze.' }
  }

  if (value.length > MAX_URL_LENGTH) {
    return { valid: false, message: `URL is too long (max ${MAX_URL_LENGTH} characters).` }
  }

  if (/\s/.test(value)) {
    return { valid: false, message: "URLs can't contain spaces." }
  }

  if (!DOMAIN_PATTERN.test(value)) {
    return { valid: false, message: 'Enter a valid domain, like example.com.' }
  }

  return { valid: true, message: '' }
}

/** Trims and defaults to https:// the same way the backend does, for display purposes. */
export function normalizeForDisplay(rawValue) {
  const trimmed = (rawValue || '').trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}
