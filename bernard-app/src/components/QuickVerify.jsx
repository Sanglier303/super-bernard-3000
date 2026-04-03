import { useState, useEffect, useCallback } from 'react'
import { getRsScore } from '../utils/rsScore'
import { displayTags } from './NotionMultiSelect'
import LinkPreview from './LinkPreview'

const RS_FIELDS = ['instagram', 'facebook', 'soundcloud', 'bandcamp', 'spotify']

function daysSince(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d)) return null
  return Math.floor((Date.now() - d) / (1000 * 60 * 60 * 24))
}

function isStale(artist, days = 30) {
  const d = daysSince(artist.derniere_verification)
  return d === null || d >= days
}

export default function QuickVerify({ artists, onConfirm, onEdit, onClose }) {
  // Only show artists that are stale (> 30 days) or never verified
  const staleArtists = artists.filter((a) => isStale(a))
  const allArtists = artists  // "All" mode includes everyone

  const [mode, setMode] = useState('stale') // 'stale' | 'all'
  const [idx, setIdx] = useState(0)
  const [verified, setVerified] = useState(new Set())
  const [confirming, setConfirming] = useState(false)

  const list = mode === 'stale' ? staleArtists : allArtists
  const artist = list[idx]
  const progress = Math.round((idx / list.length) * 100)
  const days = artist ? daysSince(artist.derniere_verification) : null

  useEffect(() => {
    setIdx(0)
    setVerified(new Set())
  }, [mode])

  const go = useCallback((delta) => {
    setIdx((i) => Math.min(Math.max(0, i + delta), list.length - 1))
  }, [list.length])

  const handleConfirm = async () => {
    if (!artist) return
    setConfirming(true)
    const today = new Date().toISOString().split('T')[0]
    await onConfirm(artist._id, 'derniere_verification', today)
    setVerified((prev) => new Set([...prev, artist._id]))
    setTimeout(() => {
      setConfirming(false)
      go(1)
    }, 400)
  }

  const handleEdit = () => {
    onClose()
    onEdit(artist)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1)
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(-1)
      if (e.key === 'Enter') handleConfirm()
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [go, artist])

  if (list.length === 0) {
    return (
      <div className="qv-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="qv-panel">
          <div className="qv-header">
            <h2>⚡ Vérification rapide</h2>
            <button className="btn-icon" onClick={onClose}>✕</button>
          </div>
          <div className="qv-empty">
            <div style={{ fontSize: 48 }}>✅</div>
            <p>Tous les artistes ont été vérifiés récemment !</p>
            <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => setMode('all')}>
              Voir tous les artistes quand même
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { score, total, pct } = getRsScore(artist)
  let rsColor = '#22c55e'
  if (pct < 60) rsColor = '#f59e0b'
  if (pct < 40) rsColor = '#ef4444'
  if (pct === 0) rsColor = '#6b7280'

  const isVerifiedNow = verified.has(artist._id)

  return (
    <div className="qv-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="qv-panel">

        {/* Header */}
        <div className="qv-header">
          <h2>⚡ Vérification rapide</h2>
          <div className="qv-mode-toggle">
            <button
              className={`btn btn-ghost ${mode === 'stale' ? 'btn-active' : ''}`}
              onClick={() => setMode('stale')}
            >
              ⚠️ À vérifier ({staleArtists.length})
            </button>
            <button
              className={`btn btn-ghost ${mode === 'all' ? 'btn-active' : ''}`}
              onClick={() => setMode('all')}
            >
              Tous ({allArtists.length})
            </button>
          </div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* Progress bar */}
        <div className="qv-progress-wrap">
          <div className="qv-progress-bar" style={{ width: `${progress}%` }} />
          <span className="qv-progress-label">
            {idx + 1} / {list.length} — {verified.size} confirmé{verified.size > 1 ? 's' : ''}
          </span>
        </div>

        {/* Card */}
        <div className={`qv-card ${isVerifiedNow ? 'qv-card-done' : ''}`}>
          <div className="qv-card-header">
            <div className="qv-avatar">
              {(artist.nom_artiste || '?')[0].toUpperCase()}
            </div>
            <div>
              <div className="qv-name">{artist.nom_artiste || '—'}</div>
              <div className="qv-tags">
                {artist.zone && <span className="tag zone-tag">{artist.zone}</span>}
                {displayTags(artist.style)}
              </div>
            </div>
            {isVerifiedNow && <span className="qv-checkmark">✅</span>}
          </div>

          {/* Stale warning */}
          {days !== null && (
            <div className={`qv-staleness ${days > 60 ? 'qv-very-stale' : days > 30 ? 'qv-stale' : 'qv-fresh'}`}>
              {days === 0 ? '✅ Vérifié aujourd\'hui'
                : days <= 7 ? `✅ Vérifié il y a ${days}j`
                : days <= 30 ? `🟡 Vérifié il y a ${days}j`
                : days <= 60 ? `🟠 Vérifié il y a ${days}j — à revoir`
                : `🔴 Non vérifié depuis ${days}j !`}
            </div>
          )}
          {days === null && (
            <div className="qv-staleness qv-very-stale">⛔ Jamais vérifié</div>
          )}

          {/* Info grid */}
          <div className="qv-info-grid">
            <div><span className="info-label">Type</span> {artist.type_performance || <span className="empty-cell">—</span>}</div>
            <div><span className="info-label">Sous-genre</span> {artist.sous_genre || <span className="empty-cell">—</span>}</div>
          </div>

          {/* RS Score */}
          <div className="qv-rs">
            <span className="info-label">Présence digitale</span>
            <span style={{ color: rsColor, fontWeight: 700 }}>{score}/5</span>
            <div className="rs-bar-track" style={{ flex: 1 }}>
              <div className="rs-bar-fill" style={{ width: `${pct}%`, background: rsColor }} />
            </div>
          </div>

          {/* Links */}
          <div className="qv-links">
            {RS_FIELDS.map((f) => artist[f] ? (
              <LinkPreview key={f} url={artist[f]} label={f.charAt(0).toUpperCase() + f.slice(1)} platform={f} />
            ) : (
              <span key={f} className="qv-missing-link">{f}</span>
            ))}
          </div>

          {/* Notes */}
          {artist.notes && (
            <blockquote className="qv-notes">{artist.notes}</blockquote>
          )}
        </div>

        {/* Actions */}
        <div className="qv-actions">
          <button className="btn btn-secondary" onClick={() => go(-1)} disabled={idx === 0}>
            ← Précédent
          </button>
          <button className="btn btn-ghost" onClick={handleEdit}>
            ✏️ Éditer
          </button>
          <button className="btn btn-ghost" onClick={() => go(1)} disabled={idx >= list.length - 1}>
            ⏭ Passer
          </button>
          <button
            className="btn btn-primary qv-confirm-btn"
            onClick={handleConfirm}
            disabled={confirming || isVerifiedNow}
          >
            {confirming ? '⏳' : isVerifiedNow ? '✅ Confirmé' : '✅ Confirmer'}
          </button>
        </div>

        {/* Keyboard hint */}
        <div className="qv-keyboard-hint">
          ← → pour naviguer &nbsp;·&nbsp; Entrée pour confirmer &nbsp;·&nbsp; Échap pour quitter
        </div>
      </div>
    </div>
  )
}
