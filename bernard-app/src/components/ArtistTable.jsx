import { useState, useRef, useEffect } from 'react'
import NotionMultiSelect, { displayTags, parseTags } from './NotionMultiSelect'
import LinkPreview from './LinkPreview'
import { isIncomplete, getRsScore } from '../utils/rsScore'

function EditableCell({ artist, field, value, display, onSave, cellProps = {}, options = null }) {
  const [isEditing, setIsEditing] = useState(false)
  const [internalValue, setInternalValue] = useState(value || '')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (inputRef.current.setSelectionRange) {
        inputRef.current.setSelectionRange(internalValue.length, internalValue.length)
      }
    }
  }, [isEditing])

  const handleDoubleClick = () => {
    setInternalValue(value || '')
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (internalValue !== (value || '')) {
      onSave(artist._id, field, internalValue)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') inputRef.current?.blur()
    if (e.key === 'Escape') {
      setIsEditing(false)
      setInternalValue(value || '')
    }
  }

  if (isEditing) {
    if (options !== null) {
      return (
        <td {...cellProps}>
          <NotionMultiSelect
            value={internalValue}
            onChange={(newVal) => {
              setInternalValue(newVal)
              onSave(artist._id, field, newVal)
            }}
            availableOptions={options}
            autoFocus={true}
          />
          <button style={{ fontSize: 10, marginTop: 4, width: '100%' }} onClick={handleBlur}>
            Appliquer
          </button>
        </td>
      )
    }
    return (
      <td {...cellProps}>
        <input
          ref={inputRef}
          value={internalValue}
          onChange={(e) => setInternalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%', minWidth: '80px', padding: '4px 6px',
            fontSize: '13px', border: '1px solid var(--accent)',
            background: 'var(--bg-elevated)', color: 'var(--text)',
            borderRadius: '4px', outline: 'none',
            boxShadow: '0 0 0 2px var(--accent-glow)',
          }}
        />
      </td>
    )
  }

  return (
    <td
      {...cellProps}
      onDoubleClick={handleDoubleClick}
      title="Double-clic pour éditer"
      style={{ ...cellProps.style, cursor: 'pointer' }}
    >
      {display}
    </td>
  )
}

// ── Sort helpers ──────────────────────────────────────────────
function getSortValue(artist, key) {
  if (key === 'nom_artiste') return (artist.nom_artiste || '').toLowerCase()
  if (key === 'zone') return (artist.zone || '').toLowerCase()
  if (key === 'derniere_verification') return artist.derniere_verification || '0000-00-00'
  return ''
}

function SortableHeader({ label, sortKey, sortBy, sortDir, onSort, ...props }) {
  const active = sortBy === sortKey
  const indicator = active ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ' ↕'
  return (
    <th
      className={`sortable ${active ? 'sort-active' : ''}`}
      onClick={() => onSort(sortKey)}
      title={`Trier par ${label}`}
      {...props}
    >
      {label}
      <span className="sort-indicator">{indicator}</span>
    </th>
  )
}

// ─────────────────────────────────────────────────────────────

function ArtistTable({ artists, allArtists, onEdit, onDelete, onCellSave, compact, favorites, onToggleFavorite, onOpenCard }) {
  const [sortBy, setSortBy] = useState(null)
  const [sortDir, setSortDir] = useState('desc')

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(key)
      setSortDir('desc')
    }
  }

  const sorted = sortBy
    ? [...artists].sort((a, b) => {
        const va = getSortValue(a, sortBy)
        const vb = getSortValue(b, sortBy)
        if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va
        return sortDir === 'asc' ? va.localeCompare(vb, 'fr') : vb.localeCompare(va, 'fr')
      })
    : artists

  if (artists.length === 0) {
    return (
      <div className="empty-state">
        <div className="emoji">🐗</div>
        <p>Aucun artiste trouvé pour ces critères.</p>
      </div>
    )
  }

  const allStyles = [...new Set((allArtists || artists).flatMap((x) => parseTags(x.style)))].sort()
  const allGenres = [...new Set((allArtists || artists).flatMap((x) => parseTags(x.sous_genre)))].sort()

  const sortProps = { sortBy, sortDir, onSort: handleSort }

  return (
    <div className="table-container">
      <div className="table-wrap">
        <table id="artists-table" className={compact ? 'table-compact' : ''}>
          <thead>
            <tr>
              <th style={{ width: 36, position: 'sticky', left: 0, zIndex: 6, background: 'var(--bg-elevated)' }}>⭐</th>
              <th style={{ position: 'sticky', left: 36, zIndex: 6, background: 'var(--bg-elevated)' }}>Actions</th>
              <SortableHeader label="Nom"  sortKey="nom_artiste" {...sortProps} style={{ minWidth: 140, position: 'sticky', left: 120, zIndex: 6, background: 'var(--bg-elevated)', borderRight: '1px solid var(--line-strong)' }} />
              <SortableHeader label="Zone" sortKey="zone"        {...sortProps} />
              <th>Style</th>
              <th>Type</th>
              <th>Instagram</th>
              <th>Facebook</th>
              <th>SoundCloud</th>
              <th>Bandcamp</th>
              <th>Spotify</th>
              <th>Site</th>
              <th>Source</th>
              <th>Notes</th>
              <SortableHeader label="Vérification" sortKey="derniere_verification" {...sortProps} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((a) => {
              const incomplete = isIncomplete(a)
              const isFav = favorites?.has(a.nom_artiste)
              return (
                <tr
                  key={a._id}
                  className={`${incomplete ? 'row-incomplete' : ''} ${isFav ? 'row-favorite' : ''}`}
                  title={incomplete ? 'Artiste incomplet — style et instagram manquants' : ''}
                >
                  {/* ⭐ Favorite */}
                  <td style={{ textAlign: 'center', padding: '4px', position: 'sticky', left: 0, background: 'var(--bg-card)', zIndex: 2 }}>
                    <button
                      className="btn-star"
                      onClick={() => onToggleFavorite(a.nom_artiste)}
                      title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      {isFav ? '⭐' : '☆'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td style={{ position: 'sticky', left: 36, background: 'var(--bg-card)', zIndex: 2 }}>
                    <div className="row-actions">
                      <button className="btn-icon" title="Éditer via le formulaire" onClick={() => onEdit(a)}>
                        ✏️
                      </button>
                      <button className="btn-icon" title="Supprimer" onClick={() => onDelete(a)}>
                        🗑
                      </button>
                    </div>
                  </td>

                  {/* Nom — clic pour ouvrir la carte */}
                  <td
                    className="artist-name"
                    onClick={() => onOpenCard(a)}
                    style={{ cursor: 'pointer', position: 'sticky', left: 120, background: 'var(--bg-card)', zIndex: 2, borderRight: '1px solid var(--line-strong)', minWidth: 140 }}
                    title="Cliquer pour voir la fiche complète"
                  >
                    {a.nom_artiste || <span className="empty-cell">—</span>}
                  </td>

                  <EditableCell
                    artist={a} field="zone" value={a.zone} onSave={onCellSave}
                    display={a.zone ? <span className="tag zone-tag">{a.zone}</span> : <span className="empty-cell">—</span>}
                  />
                  <EditableCell
                    artist={a} field="style" value={a.style} onSave={onCellSave}
                    options={allStyles}
                    display={displayTags(a.style)}
                  />
                  <EditableCell
                    artist={a} field="type_performance" value={a.type_performance} onSave={onCellSave}
                    cellProps={{ style: { fontSize: 12 } }}
                    display={a.type_performance || <span className="empty-cell">—</span>}
                  />

                  {/* Liens avec preview */}
                  <td><LinkPreview url={a.instagram}    label="Instagram"  platform="instagram"  /></td>
                  <td><LinkPreview url={a.facebook}     label="Facebook"   platform="facebook"   /></td>
                  <td><LinkPreview url={a.soundcloud}   label="SoundCloud" platform="soundcloud" /></td>
                  <td><LinkPreview url={a.bandcamp}     label="Bandcamp"   platform="bandcamp"   /></td>
                  <td><LinkPreview url={a.spotify}      label="Spotify"    platform="spotify"    /></td>
                  <td><LinkPreview url={a.site_officiel}label="Site"       platform="site_officiel"/></td>

                  <EditableCell
                    artist={a} field="source_localite" value={a.source_localite} onSave={onCellSave}
                    cellProps={{ style: { fontSize: 11, maxWidth: 200 } }}
                    display={a.source_localite || <span className="empty-cell">—</span>}
                  />
                  <EditableCell
                    artist={a} field="notes" value={a.notes} onSave={onCellSave}
                    cellProps={{ style: { fontSize: 11, color: 'var(--text-dim)', maxWidth: 220 } }}
                    display={a.notes || <span className="empty-cell">—</span>}
                  />
                  <EditableCell
                    artist={a} field="derniere_verification" value={a.derniere_verification} onSave={onCellSave}
                    cellProps={{ style: { fontSize: 12, whiteSpace: 'nowrap' } }}
                    display={a.derniere_verification || <span className="empty-cell">—</span>}
                  />
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ArtistTable
