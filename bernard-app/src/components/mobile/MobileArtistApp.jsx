import React, { useMemo, useState } from 'react'

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

function MobileButton({ children, onClick, type = 'button', primary = false, danger = false, style, disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        minHeight: '40px',
        border: '2px solid',
        borderColor: '#ffffff #404040 #404040 #ffffff',
        background: danger ? '#a40000' : primary ? '#000080' : '#c0c0c0',
        color: danger || primary ? '#fff' : '#000',
        fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
        fontSize: '13px',
        fontWeight: 'bold',
        padding: '8px 12px',
        borderRadius: 0,
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

function MobileField({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#222' }}>
      <span style={{ fontWeight: 'bold' }}>{label}</span>
      {children}
    </label>
  )
}

function MobileBottomSheet({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1800, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', maxHeight: '75vh', overflowY: 'auto', background: '#c0c0c0', borderTop: '2px solid #fff', boxShadow: '0 -2px 0 #404040', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#000080' }}>{title}</div>
          <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
        </div>
        {children}
      </div>
    </div>
  )
}

function MobileTabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: '48px',
        border: '2px solid',
        borderColor: active ? '#808080 #ffffff #ffffff #808080' : '#ffffff #404040 #404040 #ffffff',
        background: active ? '#d4d0c8' : '#c0c0c0',
        color: '#000',
        fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
        fontSize: '12px',
        fontWeight: 'bold',
        padding: '6px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </button>
  )
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

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', maxHeight: '92vh', overflowY: 'auto', background: '#c0c0c0', borderTop: '2px solid #fff', boxShadow: '0 -2px 0 #404040', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>⚡ Édition rapide</div>
            <div style={{ fontSize: '12px', color: '#333' }}>{artist.nom_artiste || artist.nom}</div>
          </div>
          <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1900, background: '#c0c0c0', overflowY: 'auto' }}>
      <div style={{ position: 'sticky', top: 0, background: '#000080', color: '#fff', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold' }}>Fiche artiste</div>
        <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
      </div>

      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
          </div>
        </div>

        <div style={{ display: 'grid', gap: '8px', background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px' }}>
          <div><b>Zone :</b> {artist.zone || '—'}{artist.commune_precise ? ` (${artist.commune_precise})` : ''}</div>
          <div><b>Sous-genre :</b> {artist.sous_genre || '—'}</div>
          <div><b>Statut :</b> {artist.statut_localite || '—'}</div>
          <div><b>Source :</b> {artist.source_type || '—'}</div>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingBottom: '12px' }}>
          <MobileButton onClick={() => onToggleValidation(artist)}>{validated ? '↺ Retirer 🐗' : '🐗 Valider'}</MobileButton>
          <MobileButton primary onClick={() => onQuickEdit(artist)}>⚡ Modifier</MobileButton>
        </div>
      </div>
    </div>
  )
}

export function MobileArtistApp({ artists, loading, saveArtists, onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [validationFilter, setValidationFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState({ key: 'artist', direction: 'asc' })
  const [detailArtist, setDetailArtist] = useState(null)
  const [quickEditArtist, setQuickEditArtist] = useState(null)
  const [activePanel, setActivePanel] = useState('browse')

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
  }

  const togglePanel = (panel) => {
    setActivePanel(prev => prev === panel ? 'browse' : panel)
  }

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

  return (
    <div style={{ minHeight: '100vh', background: '#008080', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: '#c0c0c0', borderBottom: '2px solid #808080', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#000080' }}>Super Bernard 3000</div>
            <div style={{ fontSize: '12px', color: '#333' }}>Mode mobile artistes</div>
          </div>
          <MobileButton onClick={onRefresh} style={{ minHeight: '34px', padding: '6px 10px' }}>↻</MobileButton>
        </div>

        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Rechercher un artiste, style, zone..."
          style={{
            minHeight: '44px',
            border: '2px solid',
            borderColor: '#808080 #ffffff #ffffff #808080',
            background: '#fff',
            padding: '10px 12px',
            fontSize: '15px',
            fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
          }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <select value={validationFilter} onChange={e => setValidationFilter(e.target.value)} style={selectStyle}>
            <option value="all">Tous</option>
            <option value="validated">Validés 🐗</option>
            <option value="pending">À valider</option>
          </select>
          <select value={sortConfig.key} onChange={e => setSortConfig(prev => ({ ...prev, key: e.target.value }))} style={selectStyle}>
            {sortOptions.map(option => (
              <option key={option.key} value={option.key}>{option.label}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#333' }}>
            {filteredArtists.length} visibles · {validatedCount}/{activeCount} validés 🐗
          </div>
          <MobileButton onClick={() => setSortConfig(prev => ({ ...prev, direction: 'asc' }))} primary={sortConfig.direction === 'asc'} style={{ minHeight: '34px', padding: '6px 10px' }}>▲</MobileButton>
          <MobileButton onClick={() => setSortConfig(prev => ({ ...prev, direction: 'desc' }))} primary={sortConfig.direction === 'desc'} style={{ minHeight: '34px', padding: '6px 10px' }}>▼</MobileButton>
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {[
            { id: 'all', label: 'Tous' },
            { id: 'validated', label: 'Validés 🐗' },
            { id: 'pending', label: 'À valider' },
          ].map(item => (
            <MobileButton
              key={item.id}
              onClick={() => setValidationFilter(item.id)}
              primary={validationFilter === item.id}
              style={{ minHeight: '34px', padding: '6px 10px', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {item.label}
            </MobileButton>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: '12px 12px 84px 12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ background: '#c0c0c0', padding: '16px', border: '2px solid', borderColor: '#fff #404040 #404040 #fff' }}>Chargement...</div>
        ) : filteredArtists.length === 0 ? (
          <div style={{ background: '#c0c0c0', padding: '16px', border: '2px solid', borderColor: '#fff #404040 #404040 #fff' }}>Aucun artiste trouvé.</div>
        ) : filteredArtists.map(artist => {
          const validated = isArtistValidated(artist)
          const linkCount = getArtistLinkCount(artist)
          const primaryAudio = getPrimaryAudioUrl(artist)
          return (
            <div key={artist.id} style={{ background: '#c0c0c0', border: '2px solid', borderColor: '#fff #404040 #404040 #fff', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                <MobileButton onClick={() => setDetailArtist(artist)}>Voir</MobileButton>
                <MobileButton primary onClick={() => setQuickEditArtist(artist)}>⚡ Modifier</MobileButton>
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
          onClose={() => setDetailArtist(null)}
          onQuickEdit={(artist) => {
            setDetailArtist(null)
            setQuickEditArtist(artist)
          }}
          onToggleValidation={handleToggleValidation}
        />
      )}

      {quickEditArtist && (
        <MobileQuickEditSheet
          artist={quickEditArtist}
          artists={artists}
          onSave={saveArtists}
          onClose={() => setQuickEditArtist(null)}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: 'Actifs', value: activeCount },
              { label: 'Validés 🐗', value: validatedCount },
              { label: 'Avec photo', value: withPhotoCount },
              { label: 'Avec liens', value: withLinksCount },
              { label: 'Avec audio', value: withAudioCount },
              { label: 'À valider', value: activeCount - validatedCount },
            ].map(item => (
              <div key={item.label} style={{ background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '12px' }}>
                <div style={{ fontSize: '12px', color: '#333' }}>{item.label}</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#000080', marginTop: '4px' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </MobileBottomSheet>
      )}

      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 25, background: '#c0c0c0', borderTop: '2px solid #fff', padding: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
        <MobileTabButton active={activePanel === 'browse'} onClick={() => setActivePanel('browse')}>Liste</MobileTabButton>
        <MobileTabButton active={activePanel === 'filters'} onClick={() => togglePanel('filters')}>Filtres</MobileTabButton>
        <MobileTabButton active={activePanel === 'sort'} onClick={() => togglePanel('sort')}>Tri</MobileTabButton>
        <MobileTabButton active={activePanel === 'stats'} onClick={() => togglePanel('stats')}>Stats</MobileTabButton>
      </div>
    </div>
  )
}
