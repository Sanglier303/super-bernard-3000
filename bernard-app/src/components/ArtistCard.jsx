import { useState, useRef, useEffect } from 'react'
import LinkPreview from './LinkPreview'
import { getRsScore } from '../utils/rsScore'
import { displayTags } from './NotionMultiSelect'

const RS_FIELDS = ['instagram', 'facebook', 'soundcloud', 'bandcamp', 'spotify']

function SocialButton({ url, platform, label, color, icon }) {
  if (!url) return null
  return (
    <a
      className="artist-card-social-btn"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ '--btn-color': color }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </a>
  )
}

export default function ArtistCard({ artist, onClose, onEdit }) {
  const { score, total, pct } = getRsScore(artist)
  const overlayRef = useRef(null)

  let rsColor = '#22c55e'
  if (pct < 60) rsColor = '#f59e0b'
  if (pct < 40) rsColor = '#ef4444'
  if (pct === 0) rsColor = '#6b7280'

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div className="modal-overlay artist-card-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="modal artist-card" role="dialog" aria-modal="true">

        {/* Header */}
        <div className="artist-card-header">
          <div className="artist-card-avatar">
            {(artist.nom_artiste || '?')[0].toUpperCase()}
          </div>
          <div className="artist-card-title-block">
            <h2 className="artist-card-name">{artist.nom_artiste || '—'}</h2>
            <div className="artist-card-tags">
              {artist.zone && <span className="tag zone-tag">{artist.zone}</span>}
              {displayTags(artist.style)}
              {artist.type_performance && <span className="tag">{artist.type_performance}</span>}
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} title="Fermer">✕</button>
        </div>

        {/* RS Score */}
        <div className="artist-card-rs">
          <span className="artist-card-rs-label">Présence digitale</span>
          <div className="artist-card-rs-bar-wrap">
            <div className="rs-bar-track" style={{ flex: 1 }}>
              <div className="rs-bar-fill" style={{ width: `${pct}%`, background: rsColor }} />
            </div>
            <span style={{ color: rsColor, fontWeight: 700, fontSize: 14 }}>{score}/{total}</span>
          </div>
        </div>

        {/* Social Links */}
        <div className="artist-card-section">
          <div className="artist-card-section-title">🔗 Réseaux &amp; Liens</div>
          <div className="artist-card-socials">
            <SocialButton url={artist.instagram}     platform="instagram"  label="Instagram"   color="#E1306C" icon="📷" />
            <SocialButton url={artist.facebook}      platform="facebook"   label="Facebook"    color="#1877F2" icon="📘" />
            <SocialButton url={artist.soundcloud}    platform="soundcloud" label="SoundCloud"  color="#FF5500" icon="🎵" />
            <SocialButton url={artist.bandcamp}      platform="bandcamp"   label="Bandcamp"    color="#1DA0C3" icon="🎸" />
            <SocialButton url={artist.spotify}       platform="spotify"    label="Spotify"     color="#1DB954" icon="🎧" />
            <SocialButton url={artist.site_officiel} platform="site"       label="Site officiel" color="#8b8fa8" icon="🌐" />
          </div>
          {!artist.instagram && !artist.facebook && !artist.soundcloud && !artist.bandcamp && !artist.spotify && !artist.site_officiel && (
            <p style={{ color: 'var(--text-dim)', fontSize: 13, fontStyle: 'italic' }}>Aucun lien renseigné</p>
          )}
        </div>

        {/* Info */}
        <div className="artist-card-section">
          <div className="artist-card-section-title">ℹ️ Informations</div>
          <div className="artist-card-info-grid">
            {artist.sous_genre && (
              <div><span className="info-label">Sous-genre</span><span>{artist.sous_genre}</span></div>
            )}
            {artist.source_localite && (
              <div><span className="info-label">Source localité</span><span style={{ fontSize: 12 }}>{artist.source_localite}</span></div>
            )}
            {artist.derniere_verification && (
              <div><span className="info-label">Dernière vérif.</span><span>{artist.derniere_verification}</span></div>
            )}
          </div>
        </div>

        {/* Notes */}
        {artist.notes && (
          <div className="artist-card-section">
            <div className="artist-card-section-title">📝 Notes</div>
            <blockquote className="artist-card-notes">{artist.notes}</blockquote>
          </div>
        )}

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Fermer</button>
          <button className="btn btn-primary" onClick={() => { onClose(); onEdit(artist); }}>
            ✏️ Éditer
          </button>
        </div>
      </div>
    </div>
  )
}
