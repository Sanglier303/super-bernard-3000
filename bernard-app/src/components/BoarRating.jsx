import { useState } from 'react'

const MAX = 5
const BOAR = '🐗'
const EMPTY = '·'

export function BoarRating({ value, onChange, size = 'md' }) {
  const [hovered, setHovered] = useState(null)
  const current = parseInt(value) || 0
  const display = hovered !== null ? hovered : current

  return (
    <div
      className={`boar-rating boar-rating-${size}`}
      onMouseLeave={() => setHovered(null)}
    >
      {Array.from({ length: MAX }, (_, i) => {
        const star = i + 1
        return (
          <button
            key={star}
            className="boar-btn"
            onMouseEnter={() => setHovered(star)}
            onClick={() => {
              // click same value = reset to 0
              onChange(current === star ? '0' : String(star))
            }}
            title={`${star} sanglier${star > 1 ? 's' : ''} ${current === star ? '(retirer)' : ''}`}
            aria-label={`Note ${star}`}
          >
            <span className={star <= display ? 'boar-filled' : 'boar-empty'}>
              {star <= display ? BOAR : EMPTY}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// Compact read-only display (for table cells)
export function BoarDisplay({ value }) {
  const n = parseInt(value) || 0
  if (n === 0) return <span className="boar-none">—</span>
  return (
    <span className="boar-display" title={`${n}/5 sanglier${n > 1 ? 's' : ''}`}>
      {BOAR.repeat(n)}
    </span>
  )
}
