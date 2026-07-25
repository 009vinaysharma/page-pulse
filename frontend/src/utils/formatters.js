/**
 * Pure formatting/classification helpers. Extracted from components so
 * the "what counts as good/warn/bad" logic lives in exactly one place
 * and can be unit-tested independently of any rendering.
 */

export const TONE = {
  DEFAULT: 'default',
  GOOD: 'good',
  WARN: 'warn',
  BAD: 'bad',
}

export function statusTone(status) {
  if (!status) return TONE.DEFAULT
  if (status >= 200 && status < 300) return TONE.GOOD
  if (status >= 300 && status < 400) return TONE.WARN
  return TONE.BAD
}

export function statusCaption(status) {
  const tone = statusTone(status)
  if (tone === TONE.GOOD) return 'Healthy response'
  if (tone === TONE.WARN) return 'Redirect response'
  return 'Error response'
}

export function speedTone(ms) {
  if (ms < 600) return TONE.GOOD
  if (ms < 1500) return TONE.WARN
  return TONE.BAD
}

export function altTextTone(missing, total) {
  if (total === 0) return TONE.DEFAULT
  if (missing === 0) return TONE.GOOD
  return missing / total < 0.3 ? TONE.WARN : TONE.BAD
}

export function h1Tone(count) {
  return count === 1 ? TONE.GOOD : TONE.WARN
}

export function formatNumber(value) {
  return Number(value ?? 0).toLocaleString()
}
