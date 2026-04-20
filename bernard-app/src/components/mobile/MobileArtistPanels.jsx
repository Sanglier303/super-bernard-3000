import React from 'react'
import { MobileButton, MobileField } from './MobilePrimitives'
import {
  isArtistValidated,
  formatValidationDate,
  getPrimaryAudioUrl,
} from './MobileDataUtils'

export function MobileQuickEditSheet({ artist, artists, onSave, onClose }) {
  if (!artist) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const data = Object.fromEntries(fd.entries())
    const updated = artists.map(a =>
      String(a.id) === String(artist.id)
        ? { ...a, ...data }
        : a
    )
    await onSave(updated, `Édition mobile rapide : ${artist.nom_artiste || artist.nom || 'Artiste'}`)
    onClose()
  }

  const inputStyle = {
    minHeight: '42px',
    border: '2px solid',
    borderColor: '#808080 #ffffff #ffffff #808080',
    background: '#fff',
    padding: '8px 10px',
    fontSize: '14px',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
  }

  const sectionStyle = {
    background: '#efefef',
    border: '2px solid',
    borderColor: '#fff #808080 #808080 #fff',
    padding: '10px',
    display: 'grid',
    gap: '10px',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', maxHeight: '92vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: '#c0c0c0', borderTop: '2px solid #fff', boxShadow: '0 -2px 0 #404040', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>⚡ Édition rapide</div>
            <div style={{ fontSize: '12px', color: '#333' }}>{artist.nom_artiste || artist.nom}</div>
          </div>
          <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Identité</div>
            <MobileField label="Nom artiste">
              <input name="nom_artiste" defaultValue={artist.nom_artiste || artist.nom || ''} style={inputStyle} />
            </MobileField>
            <MobileField label="Zone">
              <input name="zone" defaultValue={artist.zone || ''} style={inputStyle} />
            </MobileField>
            <MobileField label="Commune précise">
              <input name="commune_precise" defaultValue={artist.commune_precise || ''} style={inputStyle} />
            </MobileField>
            <MobileField label="Style">
              <input name="style" defaultValue={artist.style || ''} style={inputStyle} />
            </MobileField>
            <MobileField label="Sous-genre">
              <input name="sous_genre" defaultValue={artist.sous_genre || ''} style={inputStyle} />
            </MobileField>
            <MobileField label="Type performance">
              <input name="type_performance" defaultValue={artist.type_performance || ''} style={inputStyle} />
            </MobileField>
            <MobileField label="Statut localité">
              <input name="statut_localite" defaultValue={artist.statut_localite || ''} style={inputStyle} />
            </MobileField>
          </div>

          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Visuel & liens</div>
            <MobileField label="URL Photo">
              <input name="photo" defaultValue={artist.photo || ''} style={inputStyle} />
            </MobileField>
            <MobileField label="Photo / Logo (lien)">
              <input name="photo_or_logo_link" defaultValue={artist.photo_or_logo_link || ''} style={inputStyle} />
            </MobileField>
            <MobileField label="Instagram">
              <input name="instagram" defaultValue={artist.instagram || ''} style={inputStyle} />
            </MobileField>
            <MobileField label="Facebook">
              <input name="facebook" defaultValue={artist.facebook || ''} style={inputStyle} />
            </MobileField>
            <MobileField label="SoundCloud">
              <input name="soundcloud" defaultValue={artist.soundcloud || ''} style={inputStyle} />
            </MobileField>
            <MobileField label="Bandcamp">
              <input name="bandcamp" defaultValue={artist.bandcamp || ''} style={inputStyle} />
            </MobileField>
            <MobileField label="Spotify">
              <input name="spotify" defaultValue={artist.spotify || ''} style={inputStyle} />
            </MobileField>
            <MobileField label="YouTube">
              <input name="youtube" defaultValue={artist.youtube || ''} style={inputStyle} />
            </MobileField>
            <MobileField label="Site officiel">
              <input name="site_officiel" defaultValue={artist.site_officiel || ''} style={inputStyle} />
            </MobileField>
          </div>

          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Qualification & validation</div>
            <MobileField label="Source type">
              <input name="source_type" defaultValue={artist.source_type || ''} style={inputStyle} />
            </MobileField>
            <MobileField label="Preuves">
              <textarea name="preuves" defaultValue={artist.preuves || ''} style={{ ...inputStyle, minHeight: '84px', resize: 'vertical' }} />
            </MobileField>
            <MobileField label="Validation 🐗">
              <select name="validation_sanglier" defaultValue={artist.validation_sanglier || ''} style={inputStyle}>
                <option value="">Non validé</option>
                <option value="true">Validé</option>
              </select>
            </MobileField>
            <MobileField label="Date validation">
              <input name="date_validation" defaultValue={artist.date_validation || ''} style={inputStyle} />
            </MobileField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px', paddingBottom: '8px' }}>
            <MobileButton type="button" onClick={onClose}>Annuler</MobileButton>
            <MobileButton type="submit" primary>Enregistrer</MobileButton>
          </div>
        </form>
      </div>
    </div>
  )
}

export function MobileArtistDetail({ artist, onClose, onQuickEdit, onToggleValidation }) {
  if (!artist) return null

  const links = [
    { label: 'Instagram', key: 'instagram', value: artist.instagram },
    { label: 'Facebook', key: 'facebook', value: artist.facebook },
    { label: 'SoundCloud', key: 'soundcloud', value: artist.soundcloud },
    { label: 'Bandcamp', key: 'bandcamp', value: artist.bandcamp },
    { label: 'Spotify', key: 'spotify', value: artist.spotify },
    { label: 'YouTube', key: 'youtube', value: artist.youtube },
    { label: 'Site officiel', key: 'site_officiel', value: artist.site_officiel },
  ].filter(link => link.value)

  const validated = isArtistValidated(artist)
  const validationDate = formatValidationDate(artist.date_validation)
  const primaryAudioUrl = getPrimaryAudioUrl(artist)
  const quickFacts = [
    { label: 'Zone', value: artist.zone || '—' },
    { label: 'Commune', value: artist.commune_precise || '—' },
    { label: 'Statut', value: artist.statut_localite || '—' },
    { label: 'Audio', value: primaryAudioUrl ? 'Oui' : 'Non' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1900, background: '#c0c0c0', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ position: 'sticky', top: 0, background: '#000080', color: '#fff', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold' }}>Fiche artiste</div>
        <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
      </div>

      <div style={{ padding: '12px 12px 84px 12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <img
            src={artist.photo_or_logo_link || artist.photo || artist.image_url || '/sanglier.png'}
            alt=""
            style={{ width: '92px', height: '92px', objectFit: 'cover', border: '2px solid #808080', background: '#ddd', flexShrink: 0 }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', lineHeight: 1.15 }}>{artist.nom_artiste || artist.nom}</div>
            <div style={{ marginTop: '6px', fontSize: '13px', color: '#333' }}>{artist.style || '—'}</div>
            <div style={{ marginTop: '4px', fontSize: '13px', color: '#444' }}>{artist.type_performance || '—'}</div>
            <div style={{ marginTop: '6px', fontSize: '13px', fontWeight: 'bold', color: validated ? '#0a5f00' : '#555' }}>
              {validated ? `🐗 Validé${validationDate ? ` le ${validationDate}` : ''}` : 'À valider'}
            </div>
            <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {artist.style && <span style={{ fontSize: '11px', padding: '2px 6px', background: '#efefef', border: '1px solid #808080' }}>{artist.style}</span>}
              {artist.type_performance && <span style={{ fontSize: '11px', padding: '2px 6px', background: '#efefef', border: '1px solid #808080' }}>{artist.type_performance}</span>}
              {artist.sous_genre && <span style={{ fontSize: '11px', padding: '2px 6px', background: '#efefef', border: '1px solid #808080' }}>{artist.sous_genre}</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {quickFacts.map(item => (
            <div key={item.label} style={{ background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px' }}>
              <div style={{ fontSize: '11px', color: '#555' }}>{item.label}</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '3px' }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gap: '8px', background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px' }}>
          <div><b>Zone :</b> {artist.zone || '—'}{artist.commune_precise ? ` (${artist.commune_precise})` : ''}</div>
          <div><b>Sous-genre :</b> {artist.sous_genre || '—'}</div>
          <div><b>Statut :</b> {artist.statut_localite || '—'}</div>
          <div><b>Source :</b> {artist.source_type || '—'}</div>
          <div><b>Source localité :</b> {artist.source_localite || '—'}</div>
          <div><b>Preuves :</b> {artist.preuves || '—'}</div>
          <div><b>Dernière vérification :</b> {artist.derniere_verification || '—'}</div>
        </div>

        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Liens</div>
          {links.length === 0 ? (
            <div style={{ color: '#555', fontSize: '13px' }}>Aucun lien renseigné.</div>
          ) : links.map(link => (
            <a
              key={link.key}
              href={link.value}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#000080', background: '#fff', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px', textDecoration: 'none', wordBreak: 'break-word' }}
            >
              <b>{link.label}</b><br />
              <span style={{ fontSize: '12px' }}>{link.value}</span>
            </a>
          ))}
        </div>

        {artist.notes && (
          <div style={{ background: '#fff', border: '2px solid', borderColor: '#808080 #fff #fff #808080', padding: '10px', whiteSpace: 'pre-wrap', fontSize: '13px' }}>
            <b>Notes</b>
            <div style={{ marginTop: '6px' }}>{artist.notes}</div>
          </div>
        )}

        {artist.note_perso && (
          <div style={{ background: '#fff7ff', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px', whiteSpace: 'pre-wrap', fontSize: '13px' }}>
            <b>Note perso</b>
            <div style={{ marginTop: '6px' }}>{artist.note_perso}</div>
          </div>
        )}

        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Actions rapides</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <MobileButton onClick={() => onToggleValidation(artist)}>{validated ? '↺ Retirer 🐗' : '🐗 Valider'}</MobileButton>
            <MobileButton primary onClick={() => onQuickEdit(artist)}>⚡ Modifier</MobileButton>
            <MobileButton onClick={() => primaryAudioUrl ? window.open(primaryAudioUrl, '_blank', 'noopener,noreferrer') : null} disabled={!primaryAudioUrl}>▷ Audio</MobileButton>
            <MobileButton onClick={onClose}>Retour</MobileButton>
          </div>
        </div>
      </div>
    </div>
  )
}
