import { useRef, useEffect, useState } from 'react'

/**
 * Parse boolean search query.
 * Supports: AND, NOT operators
 * Returns a filter function (artist) => boolean
 */
export function parseBooleanQuery(raw) {
  const q = raw.trim()
  if (!q) return { fn: () => true, isBool: false }

  // Detect NOT: "dj NOT set" → must contain "dj" AND NOT contain "set"
  const notMatch = q.match(/^(.+?)\s+NOT\s+(.+)$/i)
  if (notMatch) {
    const must = notMatch[1].trim().toLowerCase()
    const mustNot = notMatch[2].trim().toLowerCase()
    return {
      fn: (a) => {
        const hay = Object.values(a).join(' ').toLowerCase()
        return hay.includes(must) && !hay.includes(mustNot)
      },
      isBool: true,
    }
  }

  // Detect AND: "techno AND montpellier" → must contain all terms
  const andMatch = q.match(/\s+AND\s+/i)
  if (andMatch) {
    const terms = q.split(/\s+AND\s+/i).map((t) => t.trim().toLowerCase()).filter(Boolean)
    return {
      fn: (a) => {
        const hay = Object.values(a).join(' ').toLowerCase()
        return terms.every((t) => hay.includes(t))
      },
      isBool: true,
    }
  }

  // Simple search
  const lq = q.toLowerCase()
  return {
    fn: (a) => Object.values(a).join(' ').toLowerCase().includes(lq),
    isBool: false,
  }
}

/**
 * useLocalStorage hook
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch { /* noop */ }
  }, [key, value])

  return [value, setValue]
}
