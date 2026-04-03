import { useMemo } from 'react'
import { parseTags } from './NotionMultiSelect'
import { getRsScore } from '../utils/rsScore'

function BarChart({ data, colorVar = '--rose-pastel', maxItems = 12 }) {
  if (!data || data.length === 0) return <p className="dash-empty">Aucune donnée</p>
  const maxVal = Math.max(...data.map((d) => d.count))
  const items = data.slice(0, maxItems)
  return (
    <div className="bar-chart">
      {items.map((d) => (
        <div key={d.label} className="bar-row">
          <div className="bar-label" title={d.label}>{d.label || '—'}</div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                width: `${(d.count / maxVal) * 100}%`,
                background: `var(${colorVar})`,
              }}
            />
          </div>
          <span className="bar-count">{d.count}</span>
        </div>
      ))}
    </div>
  )
}

function TagCloud({ data, maxItems = 30 }) {
  if (!data || data.length === 0) return <p className="dash-empty">Aucune donnée</p>
  const maxCount = Math.max(...data.map((d) => d.count))
  const minCount = Math.min(...data.map((d) => d.count))
  const range = maxCount - minCount || 1
  const items = data.slice(0, maxItems)
  return (
    <div className="tag-cloud">
      {items.map((d) => {
        const size = 11 + Math.round(((d.count - minCount) / range) * 12)
        const opacity = 0.5 + ((d.count - minCount) / range) * 0.5
        return (
          <span
            key={d.label}
            className="tag-cloud-item"
            style={{ fontSize: size, opacity }}
            title={`${d.label} : ${d.count} artiste${d.count > 1 ? 's' : ''}`}
          >
            {d.label}
          </span>
        )
      })}
    </div>
  )
}

function DonutChart({ data, total }) {
  if (!data || data.length === 0) return <p className="dash-empty">Aucune donnée</p>

  // Compute segments
  const COLORS = ['var(--rose-pastel)', 'var(--rose-warm)', 'var(--accent)', '#7c94c4', '#88c4a8', '#c48888']
  let cumulative = 0
  const segments = data.slice(0, 6).map((d, i) => {
    const pct = d.count / total
    const start = cumulative
    cumulative += pct
    return { ...d, pct, start, color: COLORS[i % COLORS.length] }
  })

  // SVG donut: r=15.9 gives circumference = ~100
  const R = 15.9155
  const circ = 2 * Math.PI * R

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 42 42" className="donut-svg">
        <circle cx="21" cy="21" r={R} fill="none" stroke="var(--bg-elevated)" strokeWidth="3" />
        {segments.map((s, i) => (
          <circle
            key={i}
            cx="21" cy="21" r={R}
            fill="none"
            stroke={s.color}
            strokeWidth="3"
            strokeDasharray={`${s.pct * circ} ${circ}`}
            strokeDashoffset={-s.start * circ}
            strokeLinecap="round"
            transform="rotate(-90 21 21)"
          />
        ))}
        <text x="21" y="21" textAnchor="middle" dy="0.3em" fontSize="6" fill="var(--text)" fontWeight="700">
          {total}
        </text>
      </svg>
      <div className="donut-legend">
        {segments.map((s, i) => (
          <div key={i} className="donut-legend-item">
            <span className="donut-dot" style={{ background: s.color }} />
            <span className="donut-legend-label" title={s.label}>{s.label}</span>
            <span className="donut-legend-count">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function countBy(artists, keyFn) {
  const map = {}
  artists.forEach((a) => {
    const keys = keyFn(a)
    ;(Array.isArray(keys) ? keys : [keys]).forEach((k) => {
      if (!k || k.trim() === '') return
      map[k] = (map[k] || 0) + 1
    })
  })
  return Object.entries(map)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
}

export default function Dashboard({ artists, onClose }) {
  const byZone = useMemo(() => countBy(artists, (a) => a.zone), [artists])
  const byStyle = useMemo(() => countBy(artists, (a) => parseTags(a.style)), [artists])
  const byType = useMemo(() => countBy(artists, (a) => a.type_performance), [artists])

  const avgRs = useMemo(() => {
    if (!artists.length) return 0
    const total = artists.reduce((sum, a) => sum + getRsScore(a).score, 0)
    return (total / artists.length).toFixed(1)
  }, [artists])

  const completeCount = artists.filter((a) => getRsScore(a).pct === 100).length
  const incompleteCount = artists.filter((a) => (!a.style || !a.instagram)).length

  return (
    <div className="dashboard-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dashboard-panel">
        <div className="dashboard-header">
          <h2 className="dashboard-title">📊 Statistiques de la base</h2>
          <button className="btn-icon" onClick={onClose} title="Fermer">✕</button>
        </div>

        {/* KPI row */}
        <div className="dash-kpis">
          <div className="dash-kpi">
            <div className="dash-kpi-value">{artists.length}</div>
            <div className="dash-kpi-label">Artistes total</div>
          </div>
          <div className="dash-kpi">
            <div className="dash-kpi-value" style={{ color: 'var(--rose-warm)' }}>{avgRs}/5</div>
            <div className="dash-kpi-label">Score RS moyen</div>
          </div>
          <div className="dash-kpi">
            <div className="dash-kpi-value" style={{ color: 'var(--success)' }}>{completeCount}</div>
            <div className="dash-kpi-label">Profils complets (5/5)</div>
          </div>
          <div className="dash-kpi">
            <div className="dash-kpi-value" style={{ color: '#f59e0b' }}>{incompleteCount}</div>
            <div className="dash-kpi-label">À compléter</div>
          </div>
        </div>

        <div className="dash-grid">
          {/* Zone distribution */}
          <div className="dash-card">
            <h3 className="dash-card-title">📍 Répartition par zone</h3>
            <BarChart data={byZone} colorVar="--gold" />
          </div>

          {/* Type de performance */}
          <div className="dash-card">
            <h3 className="dash-card-title">🎤 Type de performance</h3>
            <DonutChart data={byType} total={artists.length} />
          </div>

          {/* Style nuage */}
          <div className="dash-card dash-card-wide">
            <h3 className="dash-card-title">🎵 Styles musicaux</h3>
            <TagCloud data={byStyle} maxItems={40} />
          </div>
        </div>

        <div className="dashboard-footer">
          <button className="btn btn-secondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  )
}
