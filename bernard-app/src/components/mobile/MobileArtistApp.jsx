import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  mobilePageStyle,
  mobileHeaderStyle,
  mobileSectionSelectStyle,
  mobileContentStyle,
  mobileCardStyle,
  mobileBottomNavStyle,
  MobileSummaryCard,
  MobileButton,
  MobileField,
  MobileBottomSheet,
  MobileTabButton,
  MobileSectionHeader,
  MobileStatsGrid,
  MobileStandardBottomNav,
} from './MobilePrimitives'

function isArtistValidated(artist) {
  const raw = String(artist?.validation_sanglier || '').trim().toLowerCase()
  return ['true', '1', 'yes', 'oui', '🐗', 'valide', 'validé'].includes(raw)
}

function formatValidationDate(date) {
  if (!date) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-')
    return `${d}/${m}/${y}`
  }
  return date
}

function getArtistLinkCount(artist) {
  return [
    'instagram',
    'facebook',
    'soundcloud',
    'bandcamp',
    'spotify',
    'youtube',
    'site_officiel'
  ].filter(key => String(artist?.[key] || '').trim()).length
}

function getArtistSortValue(artist, key) {
  switch (key) {
    case 'artist':
      return artist?.nom_artiste || artist?.nom || ''
    case 'zone':
      return artist?.zone || ''
    case 'style':
      return artist?.style || ''
    case 'performance':
      return artist?.type_performance || ''
    case 'status':
      return artist?.statut_localite || ''
    case 'validation':
      return isArtistValidated(artist) ? 1 : 0
    case 'links':
      return getArtistLinkCount(artist)
    default:
      return artist?.nom_artiste || artist?.nom || ''
  }
}

function compareSortValues(a, b, direction) {
  const dir = direction === 'desc' ? -1 : 1
  const aEmpty = a === null || a === undefined || a === ''
  const bEmpty = b === null || b === undefined || b === ''

  if (aEmpty && bEmpty) return 0
  if (aEmpty) return 1
  if (bEmpty) return -1

  if (typeof a === 'number' && typeof b === 'number') {
    return (a - b) * dir
  }

  return String(a).localeCompare(String(b), 'fr', { sensitivity: 'base' }) * dir
}

function getPrimaryAudioUrl(artist) {
  return artist?.spotify || artist?.soundcloud || artist?.youtube || artist?.bandcamp || ''
}

function getCollectifSortValue(collectif, key) {
  switch (key) {
    case 'name':
      return collectif?.nom || ''
    case 'style':
      return collectif?.style || ''
    case 'date':
      return collectif?.date_creation || ''
    case 'instagram':
      return String(collectif?.instagram || '').trim() ? 1 : 0
    case 'photo':
      return String(collectif?.photo || '').trim() ? 1 : 0
    default:
      return collectif?.nom || ''
  }
}

function getLieuSortValue(lieu, key) {
  switch (key) {
    case 'name':
      return lieu?.nom || ''
    case 'type':
      return lieu?.type || ''
    case 'capacity':
      return Number.parseInt(lieu?.capacite || '0', 10) || 0
    case 'instagram':
      return String(lieu?.instagram || '').trim() ? 1 : 0
    case 'photo':
      return String(lieu?.photo || '').trim() ? 1 : 0
    default:
      return lieu?.nom || ''
  }
}

function getFestivalSortValue(festival, key) {
  switch (key) {
    case 'name':
      return festival?.nom || ''
    case 'style':
      return festival?.style || ''
    case 'period':
      return festival?.periode || ''
    case 'instagram':
      return String(festival?.instagram || '').trim() ? 1 : 0
    case 'photo':
      return String(festival?.photo || '').trim() ? 1 : 0
    default:
      return festival?.nom || ''
  }
}

function getProjectSortValue(project, key) {
  switch (key) {
    case 'name':
      return project?.nom || ''
    case 'status':
      return project?.statut || ''
    case 'priority':
      return project?.priorite || ''
    case 'deadline':
      return project?.echeance || ''
    case 'linked':
      return project?.linked_type || ''
    default:
      return project?.nom || ''
  }
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function MobileQuickEditSheet({ artist, artists, onSave, onClose }) {
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

function MobileArtistDetail({ artist, onClose, onQuickEdit, onToggleValidation }) {
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
  const quickFacts = [
    { label: 'Zone', value: artist.zone || '—' },
    { label: 'Commune', value: artist.commune_precise || '—' },
    { label: 'Statut', value: artist.statut_localite || '—' },
    { label: 'Audio', value: getPrimaryAudioUrl(artist) ? 'Oui' : 'Non' },
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
            <MobileButton onClick={() => getPrimaryAudioUrl(artist) ? window.open(getPrimaryAudioUrl(artist), '_blank', 'noopener,noreferrer') : null} disabled={!getPrimaryAudioUrl(artist)}>▷ Audio</MobileButton>
            <MobileButton onClick={onClose}>Retour</MobileButton>
          </div>
        </div>
      </div>
    </div>
  )
}

function MobilePlaceholderSection({ title, count, description }) {
  return (
    <div style={mobilePageStyle}>
      <div style={mobileHeaderStyle}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#000080' }}>{title}</div>
        <div style={{ fontSize: '12px', color: '#333' }}>Mode mobile en préparation</div>
      </div>

      <div style={mobileContentStyle}>
        <div style={{ ...mobileCardStyle, padding: '14px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>{count} élément(s)</div>
          <div style={{ fontSize: '13px', color: '#333', lineHeight: 1.45 }}>{description}</div>
        </div>

        <div style={{ background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '12px', display: 'grid', gap: '8px' }}>
          <div style={{ fontWeight: 'bold', color: '#000080' }}>Prochain chantier mobile</div>
          <div style={{ fontSize: '13px', color: '#333' }}>- liste responsive</div>
          <div style={{ fontSize: '13px', color: '#333' }}>- fiche plein écran</div>
          <div style={{ fontSize: '13px', color: '#333' }}>- actions tactiles simples</div>
          <div style={{ fontSize: '13px', color: '#333' }}>- navigation cohérente avec la base artistes</div>
        </div>
      </div>
    </div>
  )
}

function MobileCollectifDetail({ collectif, onClose, onQuickEdit }) {
  if (!collectif) return null

  const quickFacts = [
    { label: 'Style', value: collectif.style || '—' },
    { label: 'Création', value: collectif.date_creation || '—' },
    { label: 'Instagram', value: collectif.instagram ? 'Oui' : 'Non' },
    { label: 'Photo', value: collectif.photo ? 'Oui' : 'Non' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1900, background: '#c0c0c0', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ position: 'sticky', top: 0, background: '#000080', color: '#fff', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold' }}>Fiche collectif</div>
        <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
      </div>

      <div style={{ padding: '12px 12px 84px 12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <img
            src={collectif.photo || '/sanglier.png'}
            alt=""
            style={{ width: '92px', height: '92px', objectFit: 'cover', border: '2px solid #808080', background: '#ddd', flexShrink: 0 }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', lineHeight: 1.15 }}>{collectif.nom || 'Collectif'}</div>
            <div style={{ marginTop: '6px', fontSize: '13px', color: '#333' }}>{collectif.style || '—'}</div>
            <div style={{ marginTop: '4px', fontSize: '13px', color: '#444' }}>Création : {collectif.date_creation || '—'}</div>
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
          <div><b>Style :</b> {collectif.style || '—'}</div>
          <div><b>Date de création :</b> {collectif.date_creation || '—'}</div>
          <div><b>Instagram :</b> {collectif.instagram || '—'}</div>
        </div>

        {collectif.notes && (
          <div style={{ background: '#fff', border: '2px solid', borderColor: '#808080 #fff #fff #808080', padding: '10px', whiteSpace: 'pre-wrap', fontSize: '13px' }}>
            <b>Notes</b>
            <div style={{ marginTop: '6px' }}>{collectif.notes}</div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingBottom: '12px' }}>
          <MobileButton onClick={() => collectif.instagram ? window.open(collectif.instagram, '_blank', 'noopener,noreferrer') : null} disabled={!collectif.instagram}>Instagram</MobileButton>
          <MobileButton primary onClick={() => onQuickEdit(collectif)}>⚡ Modifier</MobileButton>
          <MobileButton onClick={onClose}>Retour</MobileButton>
        </div>
      </div>
    </div>
  )
}

function MobileCollectifQuickEditSheet({ collectif, collectifs, onSave, onClose }) {
  if (!collectif) return null

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const data = Object.fromEntries(fd.entries())
    const updated = collectifs.map(c =>
      String(c.id) === String(collectif.id)
        ? { ...c, ...data }
        : c
    )
    await onSave(updated, `Édition mobile collectif : ${collectif.nom || 'Collectif'}`)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', maxHeight: '92vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: '#c0c0c0', borderTop: '2px solid #fff', boxShadow: '0 -2px 0 #404040', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>⚡ Édition rapide collectif</div>
            <div style={{ fontSize: '12px', color: '#333' }}>{collectif.nom || 'Collectif'}</div>
          </div>
          <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Identité collectif</div>
            <MobileField label="Nom">
              <input name="nom" defaultValue={collectif.nom || ''} style={inputStyle} />
            </MobileField>
            <MobileField label="Style">
              <input name="style" defaultValue={collectif.style || ''} style={inputStyle} />
            </MobileField>
            <MobileField label="Date de création">
              <input name="date_creation" defaultValue={collectif.date_creation || ''} style={inputStyle} />
            </MobileField>
          </div>

          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Présence en ligne</div>
            <MobileField label="Instagram">
              <input name="instagram" defaultValue={collectif.instagram || ''} style={inputStyle} />
            </MobileField>
            <MobileField label="Photo (URL)">
              <input name="photo" defaultValue={collectif.photo || ''} style={inputStyle} />
            </MobileField>
          </div>

          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Notes</div>
            <MobileField label="Notes">
              <textarea name="notes" defaultValue={collectif.notes || ''} style={{ ...inputStyle, minHeight: '110px', resize: 'vertical' }} />
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

function MobileLieuDetail({ lieu, onClose, onQuickEdit }) {
  if (!lieu) return null

  const quickFacts = [
    { label: 'Type', value: lieu.type || '—' },
    { label: 'Capacité', value: lieu.capacite || '—' },
    { label: 'Instagram', value: lieu.instagram ? 'Oui' : 'Non' },
    { label: 'Photo', value: lieu.photo ? 'Oui' : 'Non' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1900, background: '#c0c0c0', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ position: 'sticky', top: 0, background: '#000080', color: '#fff', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold' }}>Fiche lieu</div>
        <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
      </div>

      <div style={{ padding: '12px 12px 84px 12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <img src={lieu.photo || '/sanglier.png'} alt="" style={{ width: '92px', height: '92px', objectFit: 'cover', border: '2px solid #808080', background: '#ddd', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', lineHeight: 1.15 }}>{lieu.nom || 'Lieu'}</div>
            <div style={{ marginTop: '6px', fontSize: '13px', color: '#333' }}>{lieu.type || '—'}</div>
            <div style={{ marginTop: '4px', fontSize: '13px', color: '#444' }}>{lieu.adresse || '—'}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {quickFacts.map(item => <MobileSummaryCard key={item.label} label={item.label} value={item.value} />)}
        </div>

        <div style={{ display: 'grid', gap: '8px', background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px' }}>
          <div><b>Adresse :</b> {lieu.adresse || '—'}</div>
          <div><b>Type :</b> {lieu.type || '—'}</div>
          <div><b>Capacité :</b> {lieu.capacite || '—'}</div>
          <div><b>Instagram :</b> {lieu.instagram || '—'}</div>
        </div>

        {lieu.notes && <div style={{ background: '#fff', border: '2px solid', borderColor: '#808080 #fff #fff #808080', padding: '10px', whiteSpace: 'pre-wrap', fontSize: '13px' }}><b>Notes</b><div style={{ marginTop: '6px' }}>{lieu.notes}</div></div>}
        {lieu.note_perso && <div style={{ background: '#fff7ff', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px', whiteSpace: 'pre-wrap', fontSize: '13px' }}><b>Note perso</b><div style={{ marginTop: '6px' }}>{lieu.note_perso}</div></div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <MobileButton onClick={() => lieu.instagram ? window.open(lieu.instagram, '_blank', 'noopener,noreferrer') : null} disabled={!lieu.instagram}>Instagram</MobileButton>
          <MobileButton primary onClick={() => onQuickEdit(lieu)}>⚡ Modifier</MobileButton>
          <MobileButton onClick={onClose}>Retour</MobileButton>
        </div>
      </div>
    </div>
  )
}

function MobileLieuQuickEditSheet({ lieu, lieux, onSave, onClose }) {
  if (!lieu) return null

  const inputStyle = {
    minHeight: '42px',
    border: '2px solid',
    borderColor: '#808080 #ffffff #ffffff #808080',
    background: '#fff',
    padding: '8px 10px',
    fontSize: '14px',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
  }
  const sectionStyle = { background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px', display: 'grid', gap: '10px' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const data = Object.fromEntries(fd.entries())
    const updated = lieux.map(l => String(l.id) === String(lieu.id) ? { ...l, ...data } : l)
    await onSave(updated, `Édition mobile lieu : ${lieu.nom || 'Lieu'}`)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', maxHeight: '92vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: '#c0c0c0', borderTop: '2px solid #fff', boxShadow: '0 -2px 0 #404040', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div><div style={{ fontSize: '16px', fontWeight: 'bold' }}>⚡ Édition rapide lieu</div><div style={{ fontSize: '12px', color: '#333' }}>{lieu.nom || 'Lieu'}</div></div>
          <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Identité lieu</div>
            <MobileField label="Nom"><input name="nom" defaultValue={lieu.nom || ''} style={inputStyle} /></MobileField>
            <MobileField label="Type"><input name="type" defaultValue={lieu.type || ''} style={inputStyle} /></MobileField>
            <MobileField label="Capacité"><input name="capacite" defaultValue={lieu.capacite || ''} style={inputStyle} /></MobileField>
            <MobileField label="Adresse"><input name="adresse" defaultValue={lieu.adresse || ''} style={inputStyle} /></MobileField>
          </div>
          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Présence en ligne</div>
            <MobileField label="Instagram"><input name="instagram" defaultValue={lieu.instagram || ''} style={inputStyle} /></MobileField>
            <MobileField label="Photo (URL)"><input name="photo" defaultValue={lieu.photo || ''} style={inputStyle} /></MobileField>
          </div>
          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Notes</div>
            <MobileField label="Notes"><textarea name="notes" defaultValue={lieu.notes || ''} style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} /></MobileField>
            <MobileField label="Note perso"><textarea name="note_perso" defaultValue={lieu.note_perso || ''} style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} /></MobileField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingBottom: '8px' }}>
            <MobileButton type="button" onClick={onClose}>Annuler</MobileButton>
            <MobileButton type="submit" primary>Enregistrer</MobileButton>
          </div>
        </form>
      </div>
    </div>
  )
}

function MobileFestivalDetail({ festival, onClose, onQuickEdit }) {
  if (!festival) return null

  const quickFacts = [
    { label: 'Période', value: festival.periode || '—' },
    { label: 'Durée', value: festival.duree || '—' },
    { label: 'Instagram', value: festival.instagram ? 'Oui' : 'Non' },
    { label: 'Photo', value: festival.photo ? 'Oui' : 'Non' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1900, background: '#c0c0c0', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ position: 'sticky', top: 0, background: '#000080', color: '#fff', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold' }}>Fiche festival</div>
        <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
      </div>
      <div style={{ padding: '12px 12px 84px 12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <img src={festival.photo || '/sanglier.png'} alt="" style={{ width: '92px', height: '92px', objectFit: 'cover', border: '2px solid #808080', background: '#ddd', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', lineHeight: 1.15 }}>{festival.nom || 'Festival'}</div>
            <div style={{ marginTop: '6px', fontSize: '13px', color: '#333' }}>{festival.style || '—'}</div>
            <div style={{ marginTop: '4px', fontSize: '13px', color: '#444' }}>{festival.lieu || '—'}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {quickFacts.map(item => <MobileSummaryCard key={item.label} label={item.label} value={item.value} />)}
        </div>
        <div style={{ display: 'grid', gap: '8px', background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px' }}>
          <div><b>Lieu :</b> {festival.lieu || '—'}</div>
          <div><b>Style :</b> {festival.style || '—'}</div>
          <div><b>Période :</b> {festival.periode || '—'}</div>
          <div><b>Durée :</b> {festival.duree || '—'}</div>
          <div><b>Instagram :</b> {festival.instagram || '—'}</div>
        </div>
        {festival.notes && <div style={{ background: '#fff', border: '2px solid', borderColor: '#808080 #fff #fff #808080', padding: '10px', whiteSpace: 'pre-wrap', fontSize: '13px' }}><b>Notes</b><div style={{ marginTop: '6px' }}>{festival.notes}</div></div>}
        {festival.note_perso && <div style={{ background: '#fff7ff', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px', whiteSpace: 'pre-wrap', fontSize: '13px' }}><b>Note perso</b><div style={{ marginTop: '6px' }}>{festival.note_perso}</div></div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <MobileButton onClick={() => festival.instagram ? window.open(festival.instagram, '_blank', 'noopener,noreferrer') : null} disabled={!festival.instagram}>Instagram</MobileButton>
          <MobileButton primary onClick={() => onQuickEdit(festival)}>⚡ Modifier</MobileButton>
          <MobileButton onClick={onClose}>Retour</MobileButton>
        </div>
      </div>
    </div>
  )
}

function MobileFestivalQuickEditSheet({ festival, festivals, onSave, onClose }) {
  if (!festival) return null

  const inputStyle = {
    minHeight: '42px',
    border: '2px solid',
    borderColor: '#808080 #ffffff #ffffff #808080',
    background: '#fff',
    padding: '8px 10px',
    fontSize: '14px',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
  }
  const sectionStyle = { background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px', display: 'grid', gap: '10px' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const data = Object.fromEntries(fd.entries())
    const updated = festivals.map(f => String(f.id) === String(festival.id) ? { ...f, ...data } : f)
    await onSave(updated, `Édition mobile festival : ${festival.nom || 'Festival'}`)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', maxHeight: '92vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: '#c0c0c0', borderTop: '2px solid #fff', boxShadow: '0 -2px 0 #404040', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div><div style={{ fontSize: '16px', fontWeight: 'bold' }}>⚡ Édition rapide festival</div><div style={{ fontSize: '12px', color: '#333' }}>{festival.nom || 'Festival'}</div></div>
          <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Identité festival</div>
            <MobileField label="Nom"><input name="nom" defaultValue={festival.nom || ''} style={inputStyle} /></MobileField>
            <MobileField label="Style"><input name="style" defaultValue={festival.style || ''} style={inputStyle} /></MobileField>
            <MobileField label="Lieu"><input name="lieu" defaultValue={festival.lieu || ''} style={inputStyle} /></MobileField>
            <MobileField label="Période"><input name="periode" defaultValue={festival.periode || ''} style={inputStyle} /></MobileField>
            <MobileField label="Durée"><input name="duree" defaultValue={festival.duree || ''} style={inputStyle} /></MobileField>
          </div>
          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Présence en ligne</div>
            <MobileField label="Instagram"><input name="instagram" defaultValue={festival.instagram || ''} style={inputStyle} /></MobileField>
            <MobileField label="Photo (URL)"><input name="photo" defaultValue={festival.photo || ''} style={inputStyle} /></MobileField>
          </div>
          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Notes</div>
            <MobileField label="Notes"><textarea name="notes" defaultValue={festival.notes || ''} style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} /></MobileField>
            <MobileField label="Note perso"><textarea name="note_perso" defaultValue={festival.note_perso || ''} style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} /></MobileField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingBottom: '8px' }}>
            <MobileButton type="button" onClick={onClose}>Annuler</MobileButton>
            <MobileButton type="submit" primary>Enregistrer</MobileButton>
          </div>
        </form>
      </div>
    </div>
  )
}

function MobileProjectDetail({ project, onClose, onQuickEdit }) {
  if (!project) return null

  const quickFacts = [
    { label: 'Statut', value: project.statut || '—' },
    { label: 'Priorité', value: project.priorite || '—' },
    { label: 'Échéance', value: project.echeance || '—' },
    { label: 'Lien', value: project.linked_type ? `${project.linked_type}${project.linked_id ? ` #${project.linked_id}` : ''}` : '—' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1900, background: '#c0c0c0', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ position: 'sticky', top: 0, background: '#000080', color: '#fff', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold' }}>Fiche projet</div>
        <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
      </div>
      <div style={{ padding: '12px 12px 84px 12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '12px' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', lineHeight: 1.15 }}>{project.nom || 'Projet'}</div>
          <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {project.statut && <span style={{ fontSize: '11px', padding: '2px 6px', background: '#fff', border: '1px solid #808080' }}>{project.statut}</span>}
            {project.priorite && <span style={{ fontSize: '11px', padding: '2px 6px', background: '#fff', border: '1px solid #808080' }}>{project.priorite}</span>}
            {project.echeance && <span style={{ fontSize: '11px', padding: '2px 6px', background: '#fff', border: '1px solid #808080' }}>{project.echeance}</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {quickFacts.map(item => <MobileSummaryCard key={item.label} label={item.label} value={item.value} />)}
        </div>

        <div style={{ display: 'grid', gap: '8px', background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px' }}>
          <div><b>Statut :</b> {project.statut || '—'}</div>
          <div><b>Priorité :</b> {project.priorite || '—'}</div>
          <div><b>Échéance :</b> {project.echeance || '—'}</div>
          <div><b>Type lié :</b> {project.linked_type || '—'}</div>
          <div><b>ID lié :</b> {project.linked_id || '—'}</div>
        </div>

        {project.notes && (
          <div style={{ background: '#fff', border: '2px solid', borderColor: '#808080 #fff #fff #808080', padding: '10px', whiteSpace: 'pre-wrap', fontSize: '13px' }}>
            <b>Notes</b>
            <div style={{ marginTop: '6px' }}>{project.notes}</div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <MobileButton primary onClick={() => onQuickEdit(project)}>⚡ Modifier</MobileButton>
          <MobileButton onClick={onClose}>Retour</MobileButton>
        </div>
      </div>
    </div>
  )
}

function MobileProjectQuickEditSheet({ project, projects, onSave, onClose }) {
  if (!project) return null

  const inputStyle = {
    minHeight: '42px',
    border: '2px solid',
    borderColor: '#808080 #ffffff #ffffff #808080',
    background: '#fff',
    padding: '8px 10px',
    fontSize: '14px',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
  }
  const sectionStyle = { background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px', display: 'grid', gap: '10px' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const data = Object.fromEntries(fd.entries())
    const updated = projects.map(p => String(p.id) === String(project.id) ? { ...p, ...data } : p)
    await onSave(updated, `Édition mobile projet : ${project.nom || 'Projet'}`)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', maxHeight: '92vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: '#c0c0c0', borderTop: '2px solid #fff', boxShadow: '0 -2px 0 #404040', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div><div style={{ fontSize: '16px', fontWeight: 'bold' }}>⚡ Édition rapide projet</div><div style={{ fontSize: '12px', color: '#333' }}>{project.nom || 'Projet'}</div></div>
          <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Identité projet</div>
            <MobileField label="Nom"><input name="nom" defaultValue={project.nom || ''} style={inputStyle} /></MobileField>
            <MobileField label="Statut"><input name="statut" defaultValue={project.statut || ''} style={inputStyle} /></MobileField>
            <MobileField label="Priorité"><input name="priorite" defaultValue={project.priorite || ''} style={inputStyle} /></MobileField>
            <MobileField label="Échéance"><input name="echeance" defaultValue={project.echeance || ''} style={inputStyle} /></MobileField>
          </div>
          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Liens internes</div>
            <MobileField label="Type lié"><input name="linked_type" defaultValue={project.linked_type || ''} style={inputStyle} /></MobileField>
            <MobileField label="ID lié"><input name="linked_id" defaultValue={project.linked_id || ''} style={inputStyle} /></MobileField>
          </div>
          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Notes</div>
            <MobileField label="Notes"><textarea name="notes" defaultValue={project.notes || ''} style={{ ...inputStyle, minHeight: '110px', resize: 'vertical' }} /></MobileField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingBottom: '8px' }}>
            <MobileButton type="button" onClick={onClose}>Annuler</MobileButton>
            <MobileButton type="submit" primary>Enregistrer</MobileButton>
          </div>
        </form>
      </div>
    </div>
  )
}

function MobileNoteEditSheet({ note, notes, onSave, onClose }) {
  const inputStyle = {
    minHeight: '42px',
    border: '2px solid',
    borderColor: '#808080 #ffffff #ffffff #808080',
    background: '#fff',
    padding: '8px 10px',
    fontSize: '14px',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const data = Object.fromEntries(fd.entries())
    const now = new Date().toISOString().slice(0, 10)
    let updated

    if (note?.id) {
      updated = notes.map(n => String(n.id) === String(note.id) ? { ...n, ...data, date_derniere_modif: now } : n)
    } else {
      updated = [...notes, { id: makeId(), archive: '', ...data, date_derniere_modif: now }]
    }

    await onSave(updated, `${note?.id ? 'Édition' : 'Ajout'} note mobile : ${data.titre || 'Sans titre'}`)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', maxHeight: '92vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: '#c0c0c0', borderTop: '2px solid #fff', boxShadow: '0 -2px 0 #404040', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div><div style={{ fontSize: '16px', fontWeight: 'bold' }}>📝 Note mobile</div><div style={{ fontSize: '12px', color: '#333' }}>{note?.titre || 'Nouvelle note'}</div></div>
          <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <MobileField label="Titre"><input name="titre" defaultValue={note?.titre || ''} style={inputStyle} /></MobileField>
          <MobileField label="Contenu"><textarea name="contenu" defaultValue={note?.contenu || ''} style={{ ...inputStyle, minHeight: '180px', resize: 'vertical' }} /></MobileField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingBottom: '8px' }}>
            <MobileButton type="button" onClick={onClose}>Annuler</MobileButton>
            <MobileButton type="submit" primary>Enregistrer</MobileButton>
          </div>
        </form>
      </div>
    </div>
  )
}

function MobileTodoEditSheet({ todo, todos, onSave, onClose }) {
  const inputStyle = {
    minHeight: '42px',
    border: '2px solid',
    borderColor: '#808080 #ffffff #ffffff #808080',
    background: '#fff',
    padding: '8px 10px',
    fontSize: '14px',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const data = Object.fromEntries(fd.entries())
    let updated

    if (todo?.id) {
      updated = todos.map(t => String(t.id) === String(todo.id) ? { ...t, ...data } : t)
    } else {
      updated = [...todos, { id: makeId(), archive: '', complete: '', date_creation: new Date().toISOString().slice(0, 10), ...data }]
    }

    await onSave(updated, `${todo?.id ? 'Édition' : 'Ajout'} todo mobile : ${data.texte || 'Sans texte'}`)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', maxHeight: '92vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: '#c0c0c0', borderTop: '2px solid #fff', boxShadow: '0 -2px 0 #404040', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div><div style={{ fontSize: '16px', fontWeight: 'bold' }}>✅ Todo mobile</div><div style={{ fontSize: '12px', color: '#333' }}>{todo?.texte || 'Nouveau todo'}</div></div>
          <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <MobileField label="Texte"><textarea name="texte" defaultValue={todo?.texte || ''} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} /></MobileField>
          <MobileField label="Statut">
            <select name="complete" defaultValue={todo?.complete || ''} style={inputStyle}>
              <option value="">À faire</option>
              <option value="true">Fait</option>
            </select>
          </MobileField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingBottom: '8px' }}>
            <MobileButton type="button" onClick={onClose}>Annuler</MobileButton>
            <MobileButton type="submit" primary>Enregistrer</MobileButton>
          </div>
        </form>
      </div>
    </div>
  )
}

function MobileStickyEditSheet({ sticky, stickies, onSave, onClose }) {
  const inputStyle = {
    minHeight: '42px',
    border: '2px solid',
    borderColor: '#808080 #ffffff #ffffff #808080',
    background: '#fff8a6',
    padding: '8px 10px',
    fontSize: '14px',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const data = Object.fromEntries(fd.entries())
    let updated

    if (sticky?.id) {
      updated = stickies.map(s => String(s.id) === String(sticky.id) ? { ...s, ...data } : s)
    } else {
      updated = [...stickies, { id: makeId(), archive: '', ...data }]
    }

    await onSave(updated, `${sticky?.id ? 'Édition' : 'Ajout'} sticky mobile`)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', maxHeight: '92vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: '#c0c0c0', borderTop: '2px solid #fff', boxShadow: '0 -2px 0 #404040', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div><div style={{ fontSize: '16px', fontWeight: 'bold' }}>📌 Sticky mobile</div><div style={{ fontSize: '12px', color: '#333' }}>{sticky?.text ? 'Modifier sticky' : 'Nouveau sticky'}</div></div>
          <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <MobileField label="Texte"><textarea name="text" defaultValue={sticky?.text || ''} style={{ ...inputStyle, minHeight: '180px', resize: 'vertical' }} /></MobileField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingBottom: '8px' }}>
            <MobileButton type="button" onClick={onClose}>Annuler</MobileButton>
            <MobileButton type="submit" primary>Enregistrer</MobileButton>
          </div>
        </form>
      </div>
    </div>
  )
}

export function MobileArtistApp({ artists, loading, saveArtists, saveCollectifs, saveLieux, saveFestivals, saveProjects, saveNotes, saveTodos, saveStickies, onRefresh, collectifs = [], lieux = [], festivals = [], projects = [], notes = [], todos = [], stickies = [] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [validationFilter, setValidationFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState({ key: 'artist', direction: 'asc' })
  const [detailArtist, setDetailArtist] = useState(null)
  const [quickEditArtist, setQuickEditArtist] = useState(null)
  const [activePanel, setActivePanel] = useState('browse')
  const [activeSection, setActiveSection] = useState('artists')
  const [collectifSearchQuery, setCollectifSearchQuery] = useState('')
  const [detailCollectif, setDetailCollectif] = useState(null)
  const [quickEditCollectif, setQuickEditCollectif] = useState(null)
  const [collectifFilter, setCollectifFilter] = useState('all')
  const [collectifSortConfig, setCollectifSortConfig] = useState({ key: 'name', direction: 'asc' })
  const [activeCollectifPanel, setActiveCollectifPanel] = useState('browse')
  const [lieuSearchQuery, setLieuSearchQuery] = useState('')
  const [detailLieu, setDetailLieu] = useState(null)
  const [quickEditLieu, setQuickEditLieu] = useState(null)
  const [lieuFilter, setLieuFilter] = useState('all')
  const [lieuSortConfig, setLieuSortConfig] = useState({ key: 'name', direction: 'asc' })
  const [activeLieuPanel, setActiveLieuPanel] = useState('browse')
  const [festivalSearchQuery, setFestivalSearchQuery] = useState('')
  const [detailFestival, setDetailFestival] = useState(null)
  const [quickEditFestival, setQuickEditFestival] = useState(null)
  const [festivalFilter, setFestivalFilter] = useState('all')
  const [festivalSortConfig, setFestivalSortConfig] = useState({ key: 'name', direction: 'asc' })
  const [activeFestivalPanel, setActiveFestivalPanel] = useState('browse')
  const [projectSearchQuery, setProjectSearchQuery] = useState('')
  const [detailProject, setDetailProject] = useState(null)
  const [quickEditProject, setQuickEditProject] = useState(null)
  const [projectFilter, setProjectFilter] = useState('all')
  const [projectSortConfig, setProjectSortConfig] = useState({ key: 'name', direction: 'asc' })
  const [activeProjectPanel, setActiveProjectPanel] = useState('browse')
  const [toolsSearchQuery, setToolsSearchQuery] = useState('')
  const [activeToolsPanel, setActiveToolsPanel] = useState('browse')
  const [editingNote, setEditingNote] = useState(null)
  const [editingTodo, setEditingTodo] = useState(null)
  const [editingSticky, setEditingSticky] = useState(null)
  const scrollRestoreRef = useRef(null)

  const filteredArtists = useMemo(() => {
    const q = searchQuery.toLowerCase()
    const filtered = artists.filter(artist => {
      if (artist.archive === 'true') return false
      const name = (artist.nom_artiste || artist.nom || '').toLowerCase()
      const style = (artist.style || '').toLowerCase()
      const genre = (artist.sous_genre || '').toLowerCase()
      const zone = (artist.zone || '').toLowerCase()
      const status = (artist.statut_localite || '').toLowerCase()
      const matchSearch = !q || name.includes(q) || style.includes(q) || genre.includes(q) || zone.includes(q) || status.includes(q)
      const matchValidation = validationFilter === 'all'
        || (validationFilter === 'validated' && isArtistValidated(artist))
        || (validationFilter === 'pending' && !isArtistValidated(artist))
      return matchSearch && matchValidation
    })

    return [...filtered].sort((a, b) => {
      const primary = compareSortValues(
        getArtistSortValue(a, sortConfig.key),
        getArtistSortValue(b, sortConfig.key),
        sortConfig.direction
      )
      if (primary !== 0) return primary
      return compareSortValues(a.nom_artiste || a.nom || '', b.nom_artiste || b.nom || '', 'asc')
    })
  }, [artists, searchQuery, validationFilter, sortConfig])

  const validatedCount = artists.filter(artist => artist.archive !== 'true' && isArtistValidated(artist)).length
  const activeCount = artists.filter(artist => artist.archive !== 'true').length
  const withPhotoCount = artists.filter(artist => artist.archive !== 'true' && String(artist.photo_or_logo_link || artist.photo || artist.image_url || '').trim()).length
  const withLinksCount = artists.filter(artist => artist.archive !== 'true' && getArtistLinkCount(artist) > 0).length
  const withAudioCount = artists.filter(artist => artist.archive !== 'true' && !!getPrimaryAudioUrl(artist)).length

  const handleToggleValidation = async (artist) => {
    const validated = isArtistValidated(artist)
    const today = new Date().toISOString().slice(0, 10)
    const scrollingElement = document.scrollingElement || document.documentElement || document.body
    const currentScrollTop = typeof window !== 'undefined' ? (window.scrollY || scrollingElement?.scrollTop || 0) : 0
    scrollRestoreRef.current = currentScrollTop

    const updated = artists.map(a =>
      String(a.id) === String(artist.id)
        ? {
            ...a,
            validation_sanglier: validated ? '' : 'true',
            date_validation: validated ? '' : today,
          }
        : a
    )
    await saveArtists(updated, `${validated ? 'Retrait validation sanglier' : 'Validation sanglier'} : ${artist.nom_artiste || artist.nom}`)
    if (detailArtist && String(detailArtist.id) === String(artist.id)) {
      setDetailArtist({
        ...artist,
        validation_sanglier: validated ? '' : 'true',
        date_validation: validated ? '' : today,
      })
    }

    const restore = () => {
      const target = scrollRestoreRef.current
      if (typeof target !== 'number') return
      const element = document.scrollingElement || document.documentElement || document.body
      window.scrollTo(0, target)
      if (element) element.scrollTop = target
    }

    requestAnimationFrame(() => {
      restore()
      requestAnimationFrame(restore)
    })
  }

  const togglePanel = (panel) => {
    setActivePanel(prev => prev === panel ? 'browse' : panel)
  }

  const openArtistDetail = (artist) => {
    setActivePanel('browse')
    setQuickEditArtist(null)
    setDetailArtist(artist)
  }

  const openArtistQuickEdit = (artist) => {
    setActivePanel('browse')
    setDetailArtist(null)
    setQuickEditArtist(artist)
  }

  const closeArtistDetail = () => setDetailArtist(null)
  const closeArtistQuickEdit = () => setQuickEditArtist(null)

  const selectStyle = {
    minHeight: '42px',
    border: '2px solid',
    borderColor: '#808080 #ffffff #ffffff #808080',
    background: '#fff',
    padding: '8px 10px',
    fontSize: '14px',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
    width: '100%',
  }

  const sortOptions = [
    { key: 'artist', label: 'Artiste' },
    { key: 'zone', label: 'Zone' },
    { key: 'style', label: 'Style' },
    { key: 'performance', label: 'Performance' },
    { key: 'status', label: 'Statut' },
    { key: 'validation', label: 'Validation 🐗' },
    { key: 'links', label: 'Liens' },
  ]

  const sectionTabs = [
    { id: 'artists', label: 'Artistes' },
    { id: 'collectifs', label: 'Collectifs' },
    { id: 'lieux', label: 'Lieux' },
    { id: 'festivals', label: 'Festivals' },
    { id: 'projects', label: 'Projets' },
    { id: 'tools', label: 'Outils' },
  ]

  useEffect(() => {
    setDetailArtist(null)
    setQuickEditArtist(null)
    setActivePanel('browse')
    setDetailCollectif(null)
    setQuickEditCollectif(null)
    setActiveCollectifPanel('browse')
    setDetailLieu(null)
    setQuickEditLieu(null)
    setActiveLieuPanel('browse')
    setDetailFestival(null)
    setQuickEditFestival(null)
    setActiveFestivalPanel('browse')
    setDetailProject(null)
    setQuickEditProject(null)
    setActiveProjectPanel('browse')
    setActiveToolsPanel('browse')
    setEditingNote(null)
    setEditingTodo(null)
    setEditingSticky(null)
  }, [activeSection])

  const hasOverlayOpen = !!(
    detailArtist || quickEditArtist || activePanel !== 'browse'
    || detailCollectif || quickEditCollectif || activeCollectifPanel !== 'browse'
    || detailLieu || quickEditLieu || activeLieuPanel !== 'browse'
    || detailFestival || quickEditFestival || activeFestivalPanel !== 'browse'
    || detailProject || quickEditProject || activeProjectPanel !== 'browse'
    || editingNote || editingTodo || editingSticky || activeToolsPanel !== 'browse'
  )

  useEffect(() => {
    if (typeof document === 'undefined') return undefined

    const previousOverflow = document.body.style.overflow
    const previousTouchAction = document.body.style.touchAction

    if (hasOverlayOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    }

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.touchAction = previousTouchAction
    }
  }, [hasOverlayOpen])

  const mobileCollectifs = useMemo(() => {
    const q = collectifSearchQuery.toLowerCase()
    return collectifs
      .filter(collectif => collectif.archive !== 'true')
      .filter(collectif => {
        const name = (collectif.nom || '').toLowerCase()
        const style = (collectif.style || '').toLowerCase()
        const matchSearch = !q || name.includes(q) || style.includes(q)
        const hasInstagram = !!String(collectif.instagram || '').trim()
        const matchFilter = collectifFilter === 'all'
          || (collectifFilter === 'instagram' && hasInstagram)
          || (collectifFilter === 'noinstagram' && !hasInstagram)
        return matchSearch && matchFilter
      })
      .sort((a, b) => {
        const primary = compareSortValues(
          getCollectifSortValue(a, collectifSortConfig.key),
          getCollectifSortValue(b, collectifSortConfig.key),
          collectifSortConfig.direction
        )
        if (primary !== 0) return primary
        return compareSortValues(a.nom || '', b.nom || '', 'asc')
      })
  }, [collectifs, collectifSearchQuery, collectifFilter, collectifSortConfig])

  const mobileLieux = useMemo(() => {
    const q = lieuSearchQuery.toLowerCase()
    return lieux
      .filter(lieu => lieu.archive !== 'true')
      .filter(lieu => {
        const name = (lieu.nom || '').toLowerCase()
        const type = (lieu.type || '').toLowerCase()
        const address = (lieu.adresse || '').toLowerCase()
        const matchSearch = !q || name.includes(q) || type.includes(q) || address.includes(q)
        const hasInstagram = !!String(lieu.instagram || '').trim()
        const matchFilter = lieuFilter === 'all'
          || (lieuFilter === 'instagram' && hasInstagram)
          || (lieuFilter === 'noinstagram' && !hasInstagram)
        return matchSearch && matchFilter
      })
      .sort((a, b) => {
        const primary = compareSortValues(
          getLieuSortValue(a, lieuSortConfig.key),
          getLieuSortValue(b, lieuSortConfig.key),
          lieuSortConfig.direction
        )
        if (primary !== 0) return primary
        return compareSortValues(a.nom || '', b.nom || '', 'asc')
      })
  }, [lieux, lieuSearchQuery, lieuFilter, lieuSortConfig])

  const mobileFestivals = useMemo(() => {
    const q = festivalSearchQuery.toLowerCase()
    return festivals
      .filter(festival => festival.archive !== 'true')
      .filter(festival => {
        const name = (festival.nom || '').toLowerCase()
        const style = (festival.style || '').toLowerCase()
        const place = (festival.lieu || '').toLowerCase()
        const matchSearch = !q || name.includes(q) || style.includes(q) || place.includes(q)
        const hasInstagram = !!String(festival.instagram || '').trim()
        const matchFilter = festivalFilter === 'all'
          || (festivalFilter === 'instagram' && hasInstagram)
          || (festivalFilter === 'noinstagram' && !hasInstagram)
        return matchSearch && matchFilter
      })
      .sort((a, b) => {
        const primary = compareSortValues(
          getFestivalSortValue(a, festivalSortConfig.key),
          getFestivalSortValue(b, festivalSortConfig.key),
          festivalSortConfig.direction
        )
        if (primary !== 0) return primary
        return compareSortValues(a.nom || '', b.nom || '', 'asc')
      })
  }, [festivals, festivalSearchQuery, festivalFilter, festivalSortConfig])

  const mobileProjects = useMemo(() => {
    const q = projectSearchQuery.toLowerCase()
    return projects
      .filter(project => project.archive !== 'true')
      .filter(project => {
        const name = (project.nom || '').toLowerCase()
        const status = (project.statut || '').toLowerCase()
        const priority = (project.priorite || '').toLowerCase()
        const matchSearch = !q || name.includes(q) || status.includes(q) || priority.includes(q)
        const matchFilter = projectFilter === 'all'
          || (projectFilter === 'urgent' && (project.priorite || '').toLowerCase().includes('haut'))
          || (projectFilter === 'todo' && (project.statut || '').toLowerCase().includes('todo'))
          || (projectFilter === 'done' && (project.statut || '').toLowerCase().includes('fait'))
        return matchSearch && matchFilter
      })
      .sort((a, b) => {
        const primary = compareSortValues(
          getProjectSortValue(a, projectSortConfig.key),
          getProjectSortValue(b, projectSortConfig.key),
          projectSortConfig.direction
        )
        if (primary !== 0) return primary
        return compareSortValues(a.nom || '', b.nom || '', 'asc')
      })
  }, [projects, projectSearchQuery, projectFilter, projectSortConfig])

  const toolsQuery = toolsSearchQuery.toLowerCase()
  const mobileNotes = useMemo(
    () => notes.filter(note => note.archive !== 'true').filter(note => !toolsQuery || (note.titre || '').toLowerCase().includes(toolsQuery) || (note.contenu || '').toLowerCase().includes(toolsQuery)),
    [notes, toolsQuery]
  )
  const mobileTodos = useMemo(
    () => todos.filter(todo => todo.archive !== 'true').filter(todo => !toolsQuery || (todo.texte || '').toLowerCase().includes(toolsQuery)),
    [todos, toolsQuery]
  )
  const mobileStickies = useMemo(
    () => stickies.filter(sticky => sticky.archive !== 'true').filter(sticky => !toolsQuery || (sticky.text || '').toLowerCase().includes(toolsQuery)),
    [stickies, toolsQuery]
  )

  const collectifsActiveCount = collectifs.filter(collectif => collectif.archive !== 'true').length
  const collectifsInstagramCount = collectifs.filter(collectif => collectif.archive !== 'true' && String(collectif.instagram || '').trim()).length
  const collectifsPhotoCount = collectifs.filter(collectif => collectif.archive !== 'true' && String(collectif.photo || '').trim()).length
  const lieuxActiveCount = lieux.filter(lieu => lieu.archive !== 'true').length
  const lieuxInstagramCount = lieux.filter(lieu => lieu.archive !== 'true' && String(lieu.instagram || '').trim()).length
  const lieuxPhotoCount = lieux.filter(lieu => lieu.archive !== 'true' && String(lieu.photo || '').trim()).length
  const festivalsActiveCount = festivals.filter(festival => festival.archive !== 'true').length
  const festivalsInstagramCount = festivals.filter(festival => festival.archive !== 'true' && String(festival.instagram || '').trim()).length
  const festivalsPhotoCount = festivals.filter(festival => festival.archive !== 'true' && String(festival.photo || '').trim()).length
  const projectsActiveCount = projects.filter(project => project.archive !== 'true').length
  const projectsUrgentCount = projects.filter(project => project.archive !== 'true' && (project.priorite || '').toLowerCase().includes('haut')).length
  const projectsDoneCount = projects.filter(project => project.archive !== 'true' && (project.statut || '').toLowerCase().includes('fait')).length
  const notesActiveCount = notes.filter(note => note.archive !== 'true').length
  const todosActiveCount = todos.filter(todo => todo.archive !== 'true').length
  const todosDoneCount = todos.filter(todo => todo.archive !== 'true' && todo.complete === 'true').length
  const stickiesActiveCount = stickies.filter(sticky => sticky.archive !== 'true').length

  const collectifSortOptions = [
    { key: 'name', label: 'Nom' },
    { key: 'style', label: 'Style' },
    { key: 'date', label: 'Date création' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'photo', label: 'Photo' },
  ]
  const lieuSortOptions = [
    { key: 'name', label: 'Nom' },
    { key: 'type', label: 'Type' },
    { key: 'capacity', label: 'Capacité' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'photo', label: 'Photo' },
  ]
  const festivalSortOptions = [
    { key: 'name', label: 'Nom' },
    { key: 'style', label: 'Style' },
    { key: 'period', label: 'Période' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'photo', label: 'Photo' },
  ]
  const projectSortOptions = [
    { key: 'name', label: 'Nom' },
    { key: 'status', label: 'Statut' },
    { key: 'priority', label: 'Priorité' },
    { key: 'deadline', label: 'Échéance' },
    { key: 'linked', label: 'Lien' },
  ]

  const toggleTodoComplete = async (todo) => {
    const updated = todos.map(t => String(t.id) === String(todo.id) ? { ...t, complete: t.complete === 'true' ? '' : 'true' } : t)
    await saveTodos(updated, `${todo.complete === 'true' ? 'Réouverture' : 'Validation'} todo mobile : ${todo.texte || 'Todo'}`)
  }

  const openCollectifDetail = (collectif) => {
    setActiveCollectifPanel('browse')
    setQuickEditCollectif(null)
    setDetailCollectif(collectif)
  }

  const openCollectifQuickEdit = (collectif) => {
    setActiveCollectifPanel('browse')
    setDetailCollectif(null)
    setQuickEditCollectif(collectif)
  }

  const toggleCollectifPanel = (panel) => {
    setActiveCollectifPanel(prev => prev === panel ? 'browse' : panel)
  }

  const openLieuDetail = (lieu) => {
    setActiveLieuPanel('browse')
    setQuickEditLieu(null)
    setDetailLieu(lieu)
  }

  const openLieuQuickEdit = (lieu) => {
    setActiveLieuPanel('browse')
    setDetailLieu(null)
    setQuickEditLieu(lieu)
  }

  const toggleLieuPanel = (panel) => {
    setActiveLieuPanel(prev => prev === panel ? 'browse' : panel)
  }

  const openFestivalDetail = (festival) => {
    setActiveFestivalPanel('browse')
    setQuickEditFestival(null)
    setDetailFestival(festival)
  }

  const openFestivalQuickEdit = (festival) => {
    setActiveFestivalPanel('browse')
    setDetailFestival(null)
    setQuickEditFestival(festival)
  }

  const toggleFestivalPanel = (panel) => {
    setActiveFestivalPanel(prev => prev === panel ? 'browse' : panel)
  }

  const openProjectDetail = (project) => {
    setActiveProjectPanel('browse')
    setQuickEditProject(null)
    setDetailProject(project)
  }

  const openProjectQuickEdit = (project) => {
    setActiveProjectPanel('browse')
    setDetailProject(null)
    setQuickEditProject(project)
  }

  const toggleProjectPanel = (panel) => {
    setActiveProjectPanel(prev => prev === panel ? 'browse' : panel)
  }

  if (activeSection === 'collectifs') {
    return (
      <div style={mobilePageStyle}>
        <MobileSectionHeader
          title="Super Bernard 3000"
          subtitle="Mode mobile collectifs"
          onRefresh={onRefresh}
          searchValue={collectifSearchQuery}
          onSearchChange={setCollectifSearchQuery}
          searchPlaceholder="Rechercher un collectif, style..."
          activeSection={activeSection}
          sectionTabs={sectionTabs}
          onSectionChange={setActiveSection}
          summaryText={`${mobileCollectifs.length} collectif(s) visible(s)`}
          sortDirection={collectifSortConfig.direction}
          onSortAsc={() => setCollectifSortConfig(prev => ({ ...prev, direction: 'asc' }))}
          onSortDesc={() => setCollectifSortConfig(prev => ({ ...prev, direction: 'desc' }))}
          sortKey={collectifSortConfig.key}
          onSortKeyChange={(value) => setCollectifSortConfig(prev => ({ ...prev, key: value }))}
          sortOptions={collectifSortOptions}
        />

        <div style={mobileContentStyle}>
          <MobileStatsGrid
            items={[
              { label: 'Actifs', value: collectifsActiveCount },
              { label: 'Instagram', value: collectifsInstagramCount },
              { label: 'Photo', value: collectifsPhotoCount },
            ]}
            columns={3}
          />

          {loading ? (
            <div style={{ ...mobileCardStyle, padding: '16px' }}>Chargement...</div>
          ) : mobileCollectifs.length === 0 ? (
            <div style={{ ...mobileCardStyle, padding: '16px' }}>Aucun collectif trouvé.</div>
          ) : mobileCollectifs.map(collectif => (
            <div key={collectif.id} style={mobileCardStyle}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <img
                  src={collectif.photo || '/sanglier.png'}
                  alt=""
                  style={{ width: '72px', height: '72px', objectFit: 'cover', background: '#ddd', border: '2px solid #808080', flexShrink: 0 }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '17px', fontWeight: 'bold', lineHeight: 1.1 }}>{collectif.nom || 'Collectif'}</div>
                  <div style={{ marginTop: '4px', fontSize: '13px', color: '#333' }}>{collectif.style || '—'}</div>
                  <div style={{ marginTop: '4px', fontSize: '12px', color: '#444' }}>Création : {collectif.date_creation || '—'}</div>
                  <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', padding: '2px 6px', background: '#efefef', border: '1px solid #808080' }}>{collectif.instagram ? 'Instagram ok' : 'Sans Instagram'}</span>
                    {collectif.photo && <span style={{ fontSize: '11px', padding: '2px 6px', background: '#efefef', border: '1px solid #808080' }}>Photo ok</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <MobileButton onClick={() => openCollectifDetail(collectif)}>Voir</MobileButton>
                <MobileButton primary onClick={() => openCollectifQuickEdit(collectif)}>⚡ Modifier</MobileButton>
              </div>
            </div>
          ))}
        </div>

        {detailCollectif && (
          <MobileCollectifDetail
            collectif={detailCollectif}
            onClose={() => setDetailCollectif(null)}
            onQuickEdit={(collectif) => {
              openCollectifQuickEdit(collectif)
            }}
          />
        )}

        {quickEditCollectif && (
          <MobileCollectifQuickEditSheet
            collectif={quickEditCollectif}
            collectifs={collectifs}
            onSave={saveCollectifs}
            onClose={() => setQuickEditCollectif(null)}
          />
        )}

        {activeCollectifPanel === 'filters' && (
          <MobileBottomSheet title="Filtres collectifs" onClose={() => setActiveCollectifPanel('browse')}>
            <div style={{ display: 'grid', gap: '8px' }}>
              <MobileButton primary={collectifFilter === 'all'} onClick={() => { setCollectifFilter('all'); setActiveCollectifPanel('browse') }}>Tous les collectifs</MobileButton>
              <MobileButton primary={collectifFilter === 'instagram'} onClick={() => { setCollectifFilter('instagram'); setActiveCollectifPanel('browse') }}>Avec Instagram</MobileButton>
              <MobileButton primary={collectifFilter === 'noinstagram'} onClick={() => { setCollectifFilter('noinstagram'); setActiveCollectifPanel('browse') }}>Sans Instagram</MobileButton>
              <MobileButton onClick={() => { setCollectifSearchQuery(''); setCollectifFilter('all'); setActiveCollectifPanel('browse') }}>Réinitialiser</MobileButton>
            </div>
          </MobileBottomSheet>
        )}

        {activeCollectifPanel === 'sort' && (
          <MobileBottomSheet title="Tri collectifs" onClose={() => setActiveCollectifPanel('browse')}>
            <div style={{ display: 'grid', gap: '8px' }}>
              {collectifSortOptions.map(option => (
                <MobileButton
                  key={option.key}
                  primary={collectifSortConfig.key === option.key}
                  onClick={() => {
                    setCollectifSortConfig(prev => ({ ...prev, key: option.key }))
                    setActiveCollectifPanel('browse')
                  }}
                >
                  {option.label}{collectifSortConfig.key === option.key ? ` ${collectifSortConfig.direction === 'asc' ? '▲' : '▼'}` : ''}
                </MobileButton>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                <MobileButton primary={collectifSortConfig.direction === 'asc'} onClick={() => setCollectifSortConfig(prev => ({ ...prev, direction: 'asc' }))}>Croissant ▲</MobileButton>
                <MobileButton primary={collectifSortConfig.direction === 'desc'} onClick={() => setCollectifSortConfig(prev => ({ ...prev, direction: 'desc' }))}>Décroissant ▼</MobileButton>
              </div>
            </div>
          </MobileBottomSheet>
        )}

        {activeCollectifPanel === 'stats' && (
          <MobileBottomSheet title="Statistiques collectifs" onClose={() => setActiveCollectifPanel('browse')}>
            <MobileStatsGrid
              items={[
                { label: 'Actifs', value: collectifsActiveCount },
                { label: 'Avec Instagram', value: collectifsInstagramCount },
                { label: 'Avec photo', value: collectifsPhotoCount },
                { label: 'Sans Instagram', value: collectifsActiveCount - collectifsInstagramCount },
              ]}
              columns={2}
            />
          </MobileBottomSheet>
        )}

        <MobileStandardBottomNav
          activePanel={activeCollectifPanel}
          onBrowse={() => setActiveCollectifPanel('browse')}
          onFilters={() => toggleCollectifPanel('filters')}
          onSort={() => toggleCollectifPanel('sort')}
          onStats={() => toggleCollectifPanel('stats')}
        />
      </div>
    )
  }

  if (activeSection === 'lieux') {
    return (
      <div style={mobilePageStyle}>
        <MobileSectionHeader
          title="Super Bernard 3000"
          subtitle="Mode mobile lieux"
          onRefresh={onRefresh}
          searchValue={lieuSearchQuery}
          onSearchChange={setLieuSearchQuery}
          searchPlaceholder="Rechercher un lieu, type, adresse..."
          activeSection={activeSection}
          sectionTabs={sectionTabs}
          onSectionChange={setActiveSection}
          summaryText={`${mobileLieux.length} lieu(x) visible(s)`}
          sortDirection={lieuSortConfig.direction}
          onSortAsc={() => setLieuSortConfig(prev => ({ ...prev, direction: 'asc' }))}
          onSortDesc={() => setLieuSortConfig(prev => ({ ...prev, direction: 'desc' }))}
          sortKey={lieuSortConfig.key}
          onSortKeyChange={(value) => setLieuSortConfig(prev => ({ ...prev, key: value }))}
          sortOptions={lieuSortOptions}
        />

        <div style={mobileContentStyle}>
          <MobileStatsGrid
            items={[
              { label: 'Actifs', value: lieuxActiveCount },
              { label: 'Instagram', value: lieuxInstagramCount },
              { label: 'Photo', value: lieuxPhotoCount },
            ]}
            columns={3}
          />

          {loading ? (
            <div style={{ ...mobileCardStyle, padding: '16px' }}>Chargement...</div>
          ) : mobileLieux.length === 0 ? (
            <div style={{ ...mobileCardStyle, padding: '16px' }}>Aucun lieu trouvé.</div>
          ) : mobileLieux.map(lieu => (
            <div key={lieu.id} style={mobileCardStyle}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <img src={lieu.photo || '/sanglier.png'} alt="" style={{ width: '72px', height: '72px', objectFit: 'cover', background: '#ddd', border: '2px solid #808080', flexShrink: 0 }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '17px', fontWeight: 'bold', lineHeight: 1.1 }}>{lieu.nom || 'Lieu'}</div>
                  <div style={{ marginTop: '4px', fontSize: '13px', color: '#333' }}>{lieu.type || '—'}</div>
                  <div style={{ marginTop: '4px', fontSize: '12px', color: '#444' }}>{lieu.adresse || '—'}</div>
                  <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {lieu.capacite && <span style={{ fontSize: '11px', padding: '2px 6px', background: '#efefef', border: '1px solid #808080' }}>{lieu.capacite}</span>}
                    <span style={{ fontSize: '11px', padding: '2px 6px', background: '#efefef', border: '1px solid #808080' }}>{lieu.instagram ? 'Instagram ok' : 'Sans Instagram'}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <MobileButton onClick={() => openLieuDetail(lieu)}>Voir</MobileButton>
                <MobileButton primary onClick={() => openLieuQuickEdit(lieu)}>⚡ Modifier</MobileButton>
              </div>
            </div>
          ))}
        </div>

        {detailLieu && <MobileLieuDetail lieu={detailLieu} onClose={() => setDetailLieu(null)} onQuickEdit={openLieuQuickEdit} />}
        {quickEditLieu && <MobileLieuQuickEditSheet lieu={quickEditLieu} lieux={lieux} onSave={saveLieux} onClose={() => setQuickEditLieu(null)} />}

        {activeLieuPanel === 'filters' && (
          <MobileBottomSheet title="Filtres lieux" onClose={() => setActiveLieuPanel('browse')}>
            <div style={{ display: 'grid', gap: '8px' }}>
              <MobileButton primary={lieuFilter === 'all'} onClick={() => { setLieuFilter('all'); setActiveLieuPanel('browse') }}>Tous les lieux</MobileButton>
              <MobileButton primary={lieuFilter === 'instagram'} onClick={() => { setLieuFilter('instagram'); setActiveLieuPanel('browse') }}>Avec Instagram</MobileButton>
              <MobileButton primary={lieuFilter === 'noinstagram'} onClick={() => { setLieuFilter('noinstagram'); setActiveLieuPanel('browse') }}>Sans Instagram</MobileButton>
              <MobileButton onClick={() => { setLieuSearchQuery(''); setLieuFilter('all'); setActiveLieuPanel('browse') }}>Réinitialiser</MobileButton>
            </div>
          </MobileBottomSheet>
        )}

        {activeLieuPanel === 'sort' && (
          <MobileBottomSheet title="Tri lieux" onClose={() => setActiveLieuPanel('browse')}>
            <div style={{ display: 'grid', gap: '8px' }}>
              {lieuSortOptions.map(option => (
                <MobileButton key={option.key} primary={lieuSortConfig.key === option.key} onClick={() => { setLieuSortConfig(prev => ({ ...prev, key: option.key })); setActiveLieuPanel('browse') }}>{option.label}{lieuSortConfig.key === option.key ? ` ${lieuSortConfig.direction === 'asc' ? '▲' : '▼'}` : ''}</MobileButton>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                <MobileButton primary={lieuSortConfig.direction === 'asc'} onClick={() => setLieuSortConfig(prev => ({ ...prev, direction: 'asc' }))}>Croissant ▲</MobileButton>
                <MobileButton primary={lieuSortConfig.direction === 'desc'} onClick={() => setLieuSortConfig(prev => ({ ...prev, direction: 'desc' }))}>Décroissant ▼</MobileButton>
              </div>
            </div>
          </MobileBottomSheet>
        )}

        {activeLieuPanel === 'stats' && (
          <MobileBottomSheet title="Statistiques lieux" onClose={() => setActiveLieuPanel('browse')}>
            <MobileStatsGrid
              items={[
                { label: 'Actifs', value: lieuxActiveCount },
                { label: 'Avec Instagram', value: lieuxInstagramCount },
                { label: 'Avec photo', value: lieuxPhotoCount },
                { label: 'Sans Instagram', value: lieuxActiveCount - lieuxInstagramCount },
              ]}
              columns={2}
            />
          </MobileBottomSheet>
        )}

        <MobileStandardBottomNav
          activePanel={activeLieuPanel}
          onBrowse={() => setActiveLieuPanel('browse')}
          onFilters={() => toggleLieuPanel('filters')}
          onSort={() => toggleLieuPanel('sort')}
          onStats={() => toggleLieuPanel('stats')}
        />
      </div>
    )
  }

  if (activeSection === 'festivals') {
    return (
      <div style={mobilePageStyle}>
        <MobileSectionHeader
          title="Super Bernard 3000"
          subtitle="Mode mobile festivals"
          onRefresh={onRefresh}
          searchValue={festivalSearchQuery}
          onSearchChange={setFestivalSearchQuery}
          searchPlaceholder="Rechercher un festival, style, lieu..."
          activeSection={activeSection}
          sectionTabs={sectionTabs}
          onSectionChange={setActiveSection}
          summaryText={`${mobileFestivals.length} festival(s) visible(s)`}
          sortDirection={festivalSortConfig.direction}
          onSortAsc={() => setFestivalSortConfig(prev => ({ ...prev, direction: 'asc' }))}
          onSortDesc={() => setFestivalSortConfig(prev => ({ ...prev, direction: 'desc' }))}
          sortKey={festivalSortConfig.key}
          onSortKeyChange={(value) => setFestivalSortConfig(prev => ({ ...prev, key: value }))}
          sortOptions={festivalSortOptions}
        />

        <div style={mobileContentStyle}>
          <MobileStatsGrid
            items={[
              { label: 'Actifs', value: festivalsActiveCount },
              { label: 'Instagram', value: festivalsInstagramCount },
              { label: 'Photo', value: festivalsPhotoCount },
            ]}
            columns={3}
          />

          {loading ? (
            <div style={{ ...mobileCardStyle, padding: '16px' }}>Chargement...</div>
          ) : mobileFestivals.length === 0 ? (
            <div style={{ ...mobileCardStyle, padding: '16px' }}>Aucun festival trouvé.</div>
          ) : mobileFestivals.map(festival => (
            <div key={festival.id} style={mobileCardStyle}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <img src={festival.photo || '/sanglier.png'} alt="" style={{ width: '72px', height: '72px', objectFit: 'cover', background: '#ddd', border: '2px solid #808080', flexShrink: 0 }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '17px', fontWeight: 'bold', lineHeight: 1.1 }}>{festival.nom || 'Festival'}</div>
                  <div style={{ marginTop: '4px', fontSize: '13px', color: '#333' }}>{festival.style || '—'}</div>
                  <div style={{ marginTop: '4px', fontSize: '12px', color: '#444' }}>{festival.lieu || '—'}</div>
                  <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {festival.periode && <span style={{ fontSize: '11px', padding: '2px 6px', background: '#efefef', border: '1px solid #808080' }}>{festival.periode}</span>}
                    <span style={{ fontSize: '11px', padding: '2px 6px', background: '#efefef', border: '1px solid #808080' }}>{festival.instagram ? 'Instagram ok' : 'Sans Instagram'}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <MobileButton onClick={() => openFestivalDetail(festival)}>Voir</MobileButton>
                <MobileButton primary onClick={() => openFestivalQuickEdit(festival)}>⚡ Modifier</MobileButton>
              </div>
            </div>
          ))}
        </div>

        {detailFestival && <MobileFestivalDetail festival={detailFestival} onClose={() => setDetailFestival(null)} onQuickEdit={openFestivalQuickEdit} />}
        {quickEditFestival && <MobileFestivalQuickEditSheet festival={quickEditFestival} festivals={festivals} onSave={saveFestivals} onClose={() => setQuickEditFestival(null)} />}

        {activeFestivalPanel === 'filters' && (
          <MobileBottomSheet title="Filtres festivals" onClose={() => setActiveFestivalPanel('browse')}>
            <div style={{ display: 'grid', gap: '8px' }}>
              <MobileButton primary={festivalFilter === 'all'} onClick={() => { setFestivalFilter('all'); setActiveFestivalPanel('browse') }}>Tous les festivals</MobileButton>
              <MobileButton primary={festivalFilter === 'instagram'} onClick={() => { setFestivalFilter('instagram'); setActiveFestivalPanel('browse') }}>Avec Instagram</MobileButton>
              <MobileButton primary={festivalFilter === 'noinstagram'} onClick={() => { setFestivalFilter('noinstagram'); setActiveFestivalPanel('browse') }}>Sans Instagram</MobileButton>
              <MobileButton onClick={() => { setFestivalSearchQuery(''); setFestivalFilter('all'); setActiveFestivalPanel('browse') }}>Réinitialiser</MobileButton>
            </div>
          </MobileBottomSheet>
        )}

        {activeFestivalPanel === 'sort' && (
          <MobileBottomSheet title="Tri festivals" onClose={() => setActiveFestivalPanel('browse')}>
            <div style={{ display: 'grid', gap: '8px' }}>
              {festivalSortOptions.map(option => (
                <MobileButton key={option.key} primary={festivalSortConfig.key === option.key} onClick={() => { setFestivalSortConfig(prev => ({ ...prev, key: option.key })); setActiveFestivalPanel('browse') }}>{option.label}{festivalSortConfig.key === option.key ? ` ${festivalSortConfig.direction === 'asc' ? '▲' : '▼'}` : ''}</MobileButton>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                <MobileButton primary={festivalSortConfig.direction === 'asc'} onClick={() => setFestivalSortConfig(prev => ({ ...prev, direction: 'asc' }))}>Croissant ▲</MobileButton>
                <MobileButton primary={festivalSortConfig.direction === 'desc'} onClick={() => setFestivalSortConfig(prev => ({ ...prev, direction: 'desc' }))}>Décroissant ▼</MobileButton>
              </div>
            </div>
          </MobileBottomSheet>
        )}

        {activeFestivalPanel === 'stats' && (
          <MobileBottomSheet title="Statistiques festivals" onClose={() => setActiveFestivalPanel('browse')}>
            <MobileStatsGrid
              items={[
                { label: 'Actifs', value: festivalsActiveCount },
                { label: 'Avec Instagram', value: festivalsInstagramCount },
                { label: 'Avec photo', value: festivalsPhotoCount },
                { label: 'Sans Instagram', value: festivalsActiveCount - festivalsInstagramCount },
              ]}
              columns={2}
            />
          </MobileBottomSheet>
        )}

        <MobileStandardBottomNav
          activePanel={activeFestivalPanel}
          onBrowse={() => setActiveFestivalPanel('browse')}
          onFilters={() => toggleFestivalPanel('filters')}
          onSort={() => toggleFestivalPanel('sort')}
          onStats={() => toggleFestivalPanel('stats')}
        />
      </div>
    )
  }

  if (activeSection === 'projects') {
    return (
      <div style={mobilePageStyle}>
        <MobileSectionHeader
          title="Super Bernard 3000"
          subtitle="Mode mobile projets"
          onRefresh={onRefresh}
          searchValue={projectSearchQuery}
          onSearchChange={setProjectSearchQuery}
          searchPlaceholder="Rechercher un projet, statut, priorité..."
          activeSection={activeSection}
          sectionTabs={sectionTabs}
          onSectionChange={setActiveSection}
          summaryText={`${mobileProjects.length} projet(s) visible(s)`}
          sortDirection={projectSortConfig.direction}
          onSortAsc={() => setProjectSortConfig(prev => ({ ...prev, direction: 'asc' }))}
          onSortDesc={() => setProjectSortConfig(prev => ({ ...prev, direction: 'desc' }))}
          sortKey={projectSortConfig.key}
          onSortKeyChange={(value) => setProjectSortConfig(prev => ({ ...prev, key: value }))}
          sortOptions={projectSortOptions}
        />

        <div style={mobileContentStyle}>
          <MobileStatsGrid
            items={[
              { label: 'Actifs', value: projectsActiveCount },
              { label: 'Urgents', value: projectsUrgentCount, accent: '#a40000' },
              { label: 'Faits', value: projectsDoneCount, accent: '#0a5f00' },
            ]}
            columns={3}
          />

          {loading ? (
            <div style={{ ...mobileCardStyle, padding: '16px' }}>Chargement...</div>
          ) : mobileProjects.length === 0 ? (
            <div style={{ ...mobileCardStyle, padding: '16px' }}>Aucun projet trouvé.</div>
          ) : mobileProjects.map(project => (
            <div key={project.id} style={mobileCardStyle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '17px', fontWeight: 'bold', lineHeight: 1.1 }}>{project.nom || 'Projet'}</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {project.statut && <span style={{ fontSize: '11px', padding: '2px 6px', background: '#efefef', border: '1px solid #808080' }}>{project.statut}</span>}
                  {project.priorite && <span style={{ fontSize: '11px', padding: '2px 6px', background: '#efefef', border: '1px solid #808080' }}>{project.priorite}</span>}
                  {project.echeance && <span style={{ fontSize: '11px', padding: '2px 6px', background: '#efefef', border: '1px solid #808080' }}>{project.echeance}</span>}
                </div>
                {project.linked_type && <div style={{ fontSize: '12px', color: '#444' }}>Lié : {project.linked_type}{project.linked_id ? ` #${project.linked_id}` : ''}</div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <MobileButton onClick={() => openProjectDetail(project)}>Voir</MobileButton>
                <MobileButton primary onClick={() => openProjectQuickEdit(project)}>⚡ Modifier</MobileButton>
              </div>
            </div>
          ))}
        </div>

        {detailProject && <MobileProjectDetail project={detailProject} onClose={() => setDetailProject(null)} onQuickEdit={openProjectQuickEdit} />}
        {quickEditProject && <MobileProjectQuickEditSheet project={quickEditProject} projects={projects} onSave={saveProjects} onClose={() => setQuickEditProject(null)} />}

        {activeProjectPanel === 'filters' && (
          <MobileBottomSheet title="Filtres projets" onClose={() => setActiveProjectPanel('browse')}>
            <div style={{ display: 'grid', gap: '8px' }}>
              <MobileButton primary={projectFilter === 'all'} onClick={() => { setProjectFilter('all'); setActiveProjectPanel('browse') }}>Tous les projets</MobileButton>
              <MobileButton primary={projectFilter === 'urgent'} onClick={() => { setProjectFilter('urgent'); setActiveProjectPanel('browse') }}>Priorité haute</MobileButton>
              <MobileButton primary={projectFilter === 'todo'} onClick={() => { setProjectFilter('todo'); setActiveProjectPanel('browse') }}>À faire</MobileButton>
              <MobileButton primary={projectFilter === 'done'} onClick={() => { setProjectFilter('done'); setActiveProjectPanel('browse') }}>Faits</MobileButton>
              <MobileButton onClick={() => { setProjectSearchQuery(''); setProjectFilter('all'); setActiveProjectPanel('browse') }}>Réinitialiser</MobileButton>
            </div>
          </MobileBottomSheet>
        )}

        {activeProjectPanel === 'sort' && (
          <MobileBottomSheet title="Tri projets" onClose={() => setActiveProjectPanel('browse')}>
            <div style={{ display: 'grid', gap: '8px' }}>
              {projectSortOptions.map(option => (
                <MobileButton key={option.key} primary={projectSortConfig.key === option.key} onClick={() => { setProjectSortConfig(prev => ({ ...prev, key: option.key })); setActiveProjectPanel('browse') }}>{option.label}{projectSortConfig.key === option.key ? ` ${projectSortConfig.direction === 'asc' ? '▲' : '▼'}` : ''}</MobileButton>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                <MobileButton primary={projectSortConfig.direction === 'asc'} onClick={() => setProjectSortConfig(prev => ({ ...prev, direction: 'asc' }))}>Croissant ▲</MobileButton>
                <MobileButton primary={projectSortConfig.direction === 'desc'} onClick={() => setProjectSortConfig(prev => ({ ...prev, direction: 'desc' }))}>Décroissant ▼</MobileButton>
              </div>
            </div>
          </MobileBottomSheet>
        )}

        {activeProjectPanel === 'stats' && (
          <MobileBottomSheet title="Statistiques projets" onClose={() => setActiveProjectPanel('browse')}>
            <MobileStatsGrid
              items={[
                { label: 'Actifs', value: projectsActiveCount },
                { label: 'Urgents', value: projectsUrgentCount, accent: '#a40000' },
                { label: 'Faits', value: projectsDoneCount, accent: '#0a5f00' },
                { label: 'Ouverts', value: projectsActiveCount - projectsDoneCount },
              ]}
              columns={2}
            />
          </MobileBottomSheet>
        )}

        <MobileStandardBottomNav
          activePanel={activeProjectPanel}
          onBrowse={() => setActiveProjectPanel('browse')}
          onFilters={() => toggleProjectPanel('filters')}
          onSort={() => toggleProjectPanel('sort')}
          onStats={() => toggleProjectPanel('stats')}
        />
      </div>
    )
  }

  if (activeSection === 'tools') {
    return (
      <div style={mobilePageStyle}>
        <MobileSectionHeader
          title="Super Bernard 3000"
          subtitle="Mode mobile outils"
          onRefresh={onRefresh}
          searchValue={toolsSearchQuery}
          onSearchChange={setToolsSearchQuery}
          searchPlaceholder="Rechercher une note, un todo, un sticky..."
          activeSection={activeSection}
          sectionTabs={sectionTabs}
          onSectionChange={setActiveSection}
        />

        <div style={mobileContentStyle}>
          <MobileStatsGrid
            items={[
              { label: 'Notes', value: notesActiveCount },
              { label: 'Todos', value: todosActiveCount },
              { label: 'Stickies', value: stickiesActiveCount },
            ]}
            columns={3}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <MobileButton onClick={() => setEditingNote({})}>+ Note</MobileButton>
            <MobileButton onClick={() => setEditingTodo({})}>+ Todo</MobileButton>
            <MobileButton onClick={() => setEditingSticky({})}>+ Sticky</MobileButton>
          </div>

          <div style={mobileCardStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Notes</div>
            {mobileNotes.length === 0 ? <div style={{ fontSize: '13px', color: '#666' }}>Aucune note trouvée.</div> : mobileNotes.slice(0, 12).map(note => (
              <div key={note.id} style={{ background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px', display: 'grid', gap: '6px' }}>
                <div style={{ fontWeight: 'bold' }}>{note.titre || 'Sans titre'}</div>
                <div style={{ fontSize: '12px', color: '#555', whiteSpace: 'pre-wrap' }}>{(note.contenu || '').slice(0, 180) || '—'}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <MobileButton onClick={() => setEditingNote(note)}>Modifier</MobileButton>
                  <MobileButton onClick={() => setToolsSearchQuery(note.titre || '')}>Filtrer</MobileButton>
                </div>
              </div>
            ))}
          </div>

          <div style={mobileCardStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Todos</div>
            {mobileTodos.length === 0 ? <div style={{ fontSize: '13px', color: '#666' }}>Aucun todo trouvé.</div> : mobileTodos.slice(0, 12).map(todo => (
              <div key={todo.id} style={{ background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px', display: 'grid', gap: '6px' }}>
                <div style={{ fontWeight: 'bold', textDecoration: todo.complete === 'true' ? 'line-through' : 'none' }}>{todo.texte || 'Sans texte'}</div>
                <div style={{ fontSize: '12px', color: '#555' }}>{todo.complete === 'true' ? 'Fait' : 'À faire'}{todo.date_creation ? ` · ${todo.date_creation}` : ''}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <MobileButton onClick={() => toggleTodoComplete(todo)}>{todo.complete === 'true' ? 'Réouvrir' : 'Valider'}</MobileButton>
                  <MobileButton onClick={() => setEditingTodo(todo)}>Modifier</MobileButton>
                </div>
              </div>
            ))}
          </div>

          <div style={mobileCardStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Stickies</div>
            {mobileStickies.length === 0 ? <div style={{ fontSize: '13px', color: '#666' }}>Aucun sticky trouvé.</div> : mobileStickies.slice(0, 12).map(sticky => (
              <div key={sticky.id} style={{ background: '#fff8a6', border: '2px solid', borderColor: '#fff7cf #9f8c1a #9f8c1a #fff7cf', padding: '10px', display: 'grid', gap: '6px' }}>
                <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>{sticky.text || '—'}</div>
                <MobileButton onClick={() => setEditingSticky(sticky)}>Modifier</MobileButton>
              </div>
            ))}
          </div>
        </div>

        {editingNote && <MobileNoteEditSheet note={editingNote} notes={notes} onSave={saveNotes} onClose={() => setEditingNote(null)} />}
        {editingTodo && <MobileTodoEditSheet todo={editingTodo} todos={todos} onSave={saveTodos} onClose={() => setEditingTodo(null)} />}
        {editingSticky && <MobileStickyEditSheet sticky={editingSticky} stickies={stickies} onSave={saveStickies} onClose={() => setEditingSticky(null)} />}

        {activeToolsPanel === 'stats' && (
          <MobileBottomSheet title="Statistiques outils" onClose={() => setActiveToolsPanel('browse')}>
            <MobileStatsGrid
              items={[
                { label: 'Notes', value: notesActiveCount },
                { label: 'Todos', value: todosActiveCount },
                { label: 'Todos faits', value: todosDoneCount, accent: '#0a5f00' },
                { label: 'Stickies', value: stickiesActiveCount },
              ]}
              columns={2}
            />
          </MobileBottomSheet>
        )}

        <div style={mobileBottomNavStyle}>
          <MobileTabButton active={activeToolsPanel === 'browse'} onClick={() => setActiveToolsPanel('browse')}>Liste</MobileTabButton>
          <MobileTabButton active={false} onClick={() => setEditingNote({})}>Note</MobileTabButton>
          <MobileTabButton active={false} onClick={() => setEditingTodo({})}>Todo</MobileTabButton>
          <MobileTabButton active={activeToolsPanel === 'stats'} onClick={() => setActiveToolsPanel(activeToolsPanel === 'stats' ? 'browse' : 'stats')}>Stats</MobileTabButton>
        </div>
      </div>
    )
  }

  if (activeSection !== 'artists') {
    const sectionMeta = {
      collectifs: {
        title: 'Collectifs',
        count: collectifs.length,
        description: 'La base collectifs sera branchée sur le même schéma mobile : cartes, fiche plein écran et actions tactiles simples.'
      },
      lieux: {
        title: 'Lieux',
        count: lieux.length,
        description: 'La base lieux aura ensuite sa vue mobile dédiée pour repérer rapidement salles, spots et infos utiles.'
      },
      festivals: {
        title: 'Festivals',
        count: festivals.length,
        description: 'La partie festivals sera ensuite adaptée au téléphone avec navigation directe et lecture confortable.'
      },
      projects: {
        title: 'Projets',
        count: projects.length,
        description: 'Le gestionnaire de projets passera ensuite en version mobile simple, avec priorités et statut bien visibles.'
      },
    }

    const current = sectionMeta[activeSection]
    return (
      <div style={{ minHeight: '100vh', background: '#008080' }}>
        <MobilePlaceholderSection title={current.title} count={current.count} description={current.description} />
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 60, zIndex: 24, background: '#c0c0c0', borderTop: '2px solid #fff', padding: '6px 8px' }}>
          <select value={activeSection} onChange={e => setActiveSection(e.target.value)} style={mobileSectionSelectStyle}>
            {sectionTabs.map(tab => (
              <option key={tab.id} value={tab.id}>{tab.label}</option>
            ))}
          </select>
        </div>
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 25, background: '#c0c0c0', borderTop: '2px solid #fff', padding: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
          <MobileTabButton active={false} onClick={() => setActivePanel('browse')}>Liste</MobileTabButton>
          <MobileTabButton active={false} onClick={() => setActivePanel('filters')}>Filtres</MobileTabButton>
          <MobileTabButton active={false} onClick={() => setActivePanel('sort')}>Tri</MobileTabButton>
          <MobileTabButton active={false} onClick={() => setActivePanel('stats')}>Stats</MobileTabButton>
        </div>
      </div>
    )
  }

  return (
    <div style={mobilePageStyle}>
      <MobileSectionHeader
        title="Super Bernard 3000"
        subtitle="Mode mobile artistes"
        onRefresh={onRefresh}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher un artiste, style, zone..."
        activeSection={activeSection}
        sectionTabs={sectionTabs}
        onSectionChange={setActiveSection}
        summaryText={`${filteredArtists.length} visibles · ${validatedCount}/${activeCount} validés 🐗`}
        sortDirection={sortConfig.direction}
        onSortAsc={() => setSortConfig(prev => ({ ...prev, direction: 'asc' }))}
        onSortDesc={() => setSortConfig(prev => ({ ...prev, direction: 'desc' }))}
        sortKey={sortConfig.key}
        onSortKeyChange={(value) => setSortConfig(prev => ({ ...prev, key: value }))}
        sortOptions={sortOptions}
      >
        <select value={validationFilter} onChange={e => setValidationFilter(e.target.value)} style={selectStyle}>
          <option value="all">Tous</option>
          <option value="validated">Validés 🐗</option>
          <option value="pending">À valider</option>
        </select>
      </MobileSectionHeader>

      <div style={mobileContentStyle}>
        <MobileStatsGrid
          items={[
            { label: 'Actifs', value: activeCount },
            { label: 'Validés 🐗', value: validatedCount, accent: '#0a5f00' },
            { label: 'Avec liens', value: withLinksCount },
          ]}
          columns={3}
        />

        {loading ? (
          <div style={{ ...mobileCardStyle, padding: '16px' }}>Chargement...</div>
        ) : filteredArtists.length === 0 ? (
          <div style={{ ...mobileCardStyle, padding: '16px' }}>Aucun artiste trouvé.</div>
        ) : filteredArtists.map(artist => {
          const validated = isArtistValidated(artist)
          const linkCount = getArtistLinkCount(artist)
          const primaryAudio = getPrimaryAudioUrl(artist)
          return (
            <div key={artist.id} style={mobileCardStyle}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <img
                  src={artist.photo_or_logo_link || artist.photo || artist.image_url || '/sanglier.png'}
                  alt=""
                  style={{ width: '72px', height: '72px', objectFit: 'cover', background: '#ddd', border: '2px solid #808080', flexShrink: 0 }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '17px', fontWeight: 'bold', lineHeight: 1.1 }}>{artist.nom_artiste || artist.nom}</div>
                    {validated && <span style={{ fontSize: '14px', color: '#0a5f00', fontWeight: 'bold' }}>🐗</span>}
                  </div>
                  <div style={{ marginTop: '4px', fontSize: '13px', color: '#333' }}>{artist.style || '—'}</div>
                  <div style={{ marginTop: '4px', fontSize: '12px', color: '#444' }}>{artist.zone || '—'} · {artist.type_performance || '—'}</div>
                  <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', padding: '2px 6px', background: '#efefef', border: '1px solid #808080' }}>{artist.statut_localite || '—'}</span>
                    <span style={{ fontSize: '11px', padding: '2px 6px', background: '#efefef', border: '1px solid #808080' }}>{linkCount} lien{linkCount > 1 ? 's' : ''}</span>
                    {validated && <span style={{ fontSize: '11px', padding: '2px 6px', background: '#dff0d8', border: '1px solid #5b8a3c' }}>Validé</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <MobileButton onClick={() => openArtistDetail(artist)}>Voir</MobileButton>
                <MobileButton primary onClick={() => openArtistQuickEdit(artist)}>⚡ Modifier</MobileButton>
                <MobileButton onClick={() => handleToggleValidation(artist)}>{validated ? '↺ Retirer 🐗' : '🐗 Valider'}</MobileButton>
                <MobileButton onClick={() => primaryAudio ? window.open(primaryAudio, '_blank', 'noopener,noreferrer') : null} disabled={!primaryAudio}>▷ Audio</MobileButton>
              </div>
            </div>
          )
        })}
      </div>

      {detailArtist && (
        <MobileArtistDetail
          artist={detailArtist}
          onClose={closeArtistDetail}
          onQuickEdit={(artist) => {
            openArtistQuickEdit(artist)
          }}
          onToggleValidation={handleToggleValidation}
        />
      )}

      {quickEditArtist && (
        <MobileQuickEditSheet
          artist={quickEditArtist}
          artists={artists}
          onSave={saveArtists}
          onClose={closeArtistQuickEdit}
        />
      )}

      {activePanel === 'filters' && (
        <MobileBottomSheet title="Filtres mobile" onClose={() => setActivePanel('browse')}>
          <div style={{ display: 'grid', gap: '8px' }}>
            <MobileButton primary={validationFilter === 'all'} onClick={() => { setValidationFilter('all'); setActivePanel('browse') }}>Tous les artistes</MobileButton>
            <MobileButton primary={validationFilter === 'validated'} onClick={() => { setValidationFilter('validated'); setActivePanel('browse') }}>Seulement validés 🐗</MobileButton>
            <MobileButton primary={validationFilter === 'pending'} onClick={() => { setValidationFilter('pending'); setActivePanel('browse') }}>Seulement à valider</MobileButton>
            <MobileButton onClick={() => { setSearchQuery(''); setValidationFilter('all'); setActivePanel('browse') }}>Réinitialiser les filtres</MobileButton>
          </div>
        </MobileBottomSheet>
      )}

      {activePanel === 'sort' && (
        <MobileBottomSheet title="Tri mobile" onClose={() => setActivePanel('browse')}>
          <div style={{ display: 'grid', gap: '8px' }}>
            {sortOptions.map(option => (
              <MobileButton
                key={option.key}
                primary={sortConfig.key === option.key}
                onClick={() => {
                  setSortConfig(prev => ({ ...prev, key: option.key }))
                  setActivePanel('browse')
                }}
              >
                {option.label}{sortConfig.key === option.key ? ` ${sortConfig.direction === 'asc' ? '▲' : '▼'}` : ''}
              </MobileButton>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
              <MobileButton primary={sortConfig.direction === 'asc'} onClick={() => setSortConfig(prev => ({ ...prev, direction: 'asc' }))}>Croissant ▲</MobileButton>
              <MobileButton primary={sortConfig.direction === 'desc'} onClick={() => setSortConfig(prev => ({ ...prev, direction: 'desc' }))}>Décroissant ▼</MobileButton>
            </div>
          </div>
        </MobileBottomSheet>
      )}

      {activePanel === 'stats' && (
        <MobileBottomSheet title="Statistiques mobile" onClose={() => setActivePanel('browse')}>
          <MobileStatsGrid
            items={[
              { label: 'Actifs', value: activeCount },
              { label: 'Validés 🐗', value: validatedCount, accent: '#0a5f00' },
              { label: 'Avec photo', value: withPhotoCount },
              { label: 'Avec liens', value: withLinksCount },
              { label: 'Avec audio', value: withAudioCount },
              { label: 'À valider', value: activeCount - validatedCount },
            ]}
            columns={2}
          />
        </MobileBottomSheet>
      )}

      <MobileStandardBottomNav
        activePanel={activePanel}
        onBrowse={() => setActivePanel('browse')}
        onFilters={() => togglePanel('filters')}
        onSort={() => togglePanel('sort')}
        onStats={() => togglePanel('stats')}
      />
    </div>
  )
}
