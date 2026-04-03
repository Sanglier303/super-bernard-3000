export const RS_FIELDS = ['instagram', 'facebook', 'soundcloud', 'bandcamp', 'spotify']

/**
 * Calculate digital presence score for an artist.
 * Returns { score, total, pct }
 */
export function getRsScore(artist) {
  const filled = RS_FIELDS.filter((f) => artist[f] && artist[f].trim() !== '')
  return {
    score: filled.length,
    total: RS_FIELDS.length,
    pct: Math.round((filled.length / RS_FIELDS.length) * 100),
    filled,
    missing: RS_FIELDS.filter((f) => !artist[f] || artist[f].trim() === ''),
  }
}

/**
 * Returns true if artist is considered "incomplete":
 * missing both style AND instagram
 */
export function isIncomplete(artist) {
  return (!artist.style || artist.style.trim() === '') &&
         (!artist.instagram || artist.instagram.trim() === '')
}

/**
 * RsBar — SVG progress bar component
 */
export function RsBar({ artist }) {
  const { score, total, pct, missing } = getRsScore(artist)

  let color = '#22c55e'  // green
  if (pct < 60) color = '#f59e0b'    // amber
  if (pct < 40) color = '#ef4444'    // red
  if (pct === 0) color = '#6b7280'   // gray

  const tooltip = score === total
    ? 'Présence digitale complète ✅'
    : `Manque : ${missing.join(', ')}`

  return (
    <div className="rs-bar-wrap" title={tooltip}>
      <div className="rs-score-label" style={{ color }}>
        {score}/{total}
      </div>
      <div className="rs-bar-track">
        <div
          className="rs-bar-fill"
          style={{
            width: `${pct}%`,
            background: color,
          }}
        />
      </div>
    </div>
  )
}
