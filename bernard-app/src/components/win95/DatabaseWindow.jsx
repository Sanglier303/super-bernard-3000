import React, { useState, useRef, useMemo } from "react";

function isArtistValidated(artist) {
  const raw = String(artist?.validation_sanglier || '').trim().toLowerCase();
  return ['true', '1', 'yes', 'oui', '🐗', 'valide', 'validé'].includes(raw);
}

function formatValidationDate(date) {
  if (!date) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  }
  return date;
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
  ].filter(key => String(artist?.[key] || '').trim()).length;
}

function getArtistSortValue(artist, key) {
  switch (key) {
    case 'artist':
      return artist?.nom_artiste || artist?.nom || '';
    case 'zone':
      return artist?.zone || '';
    case 'style':
      return artist?.style || '';
    case 'performance':
      return artist?.type_performance || '';
    case 'status':
      return artist?.statut_localite || '';
    case 'validation':
      return isArtistValidated(artist) ? 1 : 0;
    case 'links':
      return getArtistLinkCount(artist);
    default:
      return '';
  }
}

function compareSortValues(a, b, direction) {
  const dir = direction === 'desc' ? -1 : 1;
  const aEmpty = a === null || a === undefined || a === '';
  const bEmpty = b === null || b === undefined || b === '';

  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1;
  if (bEmpty) return -1;

  if (typeof a === 'number' && typeof b === 'number') {
    return (a - b) * dir;
  }

  return String(a).localeCompare(String(b), 'fr', { sensitivity: 'base' }) * dir;
}

// Helper components
function Win95Button({ children, onClick, active, disabled, style, type = "button" }) {
  const winFont = { fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif', fontSize: '11px' };
  const raised = { boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf' };
  const sunken = { boxShadow: 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff, inset 2px 2px #808080, inset -2px -2px #dfdfdf' };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...winFont,
        ...(active ? sunken : raised),
        background: '#c0c0c0',
        border: 'none',
        padding: '3px 8px',
        cursor: 'default',
        whiteSpace: 'nowrap',
        color: disabled ? '#808080' : active ? '#000080' : '#000',
        fontWeight: active ? 'bold' : 'normal',
        textShadow: disabled ? '1px 1px 0px #fff' : 'none',
        ...style
      }}
    >
      {children}
    </button>
  )
}

export function DatabaseWindow({ artists, loading, saveArtists, onRefresh, openWindow, closeWindow, playTrack }) {
  
  // Layout states
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStyle, setActiveStyle] = useState(null)
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [validationFilter, setValidationFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState({ key: 'artist', direction: 'asc' })
  const [contextArtist, setContextArtist] = useState(null)
  const [contextMenuPos, setContextMenuPos] = useState(null)
  
  // Menu states
  const [openMenu, setOpenMenu] = useState(null)
  const [showFilters, setShowFilters] = useState(true)
  const [compactMode, setCompactMode] = useState(false)
  const [showAvatars, setShowAvatars] = useState(true)
  
  const searchInputRef = useRef(null)
  
  const winFont = { fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif', fontSize: '11px' };
  const raised = { boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf' };
  const sunken = { boxShadow: 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff, inset 2px 2px #808080, inset -2px -2px #dfdfdf' };

  const handleAdd = () => {
    openWindow('artist_edit_new', { artist: null, artistName: 'Nouv. Entité' });
  }

  const handleEdit = () => {
    if (!selectedArtist) return
    openWindow(`artist_edit_${selectedArtist.id}`, { artist: selectedArtist, artistName: selectedArtist.nom_artiste || selectedArtist.nom, artistId: selectedArtist.id });
  }

  const handleDelete = async () => {
    if (!selectedArtist) return
    if (!window.confirm(`Mettre "${selectedArtist.nom_artiste || selectedArtist.nom}" à la corbeille ?`)) return
    const updated = artists.map(a => String(a.id) === String(selectedArtist.id) ? { ...a, archive: "true" } : a)
    const name = selectedArtist.nom_artiste || selectedArtist.nom;
    setSelectedArtist(null)
    closeWindow(`artist_props_${selectedArtist.id}`);
    await saveArtists(updated, `Archivage artiste : ${name}`)
  }

  const handleToggleValidation = async () => {
    if (!selectedArtist) return
    const name = selectedArtist.nom_artiste || selectedArtist.nom || 'Artiste'
    const isValidated = isArtistValidated(selectedArtist)
    const today = new Date().toISOString().slice(0, 10)
    let nextSelected = null
    const updated = artists.map(a => {
      if (String(a.id) !== String(selectedArtist.id)) return a
      nextSelected = {
        ...a,
        validation_sanglier: isValidated ? '' : 'true',
        date_validation: isValidated ? '' : today,
      }
      return nextSelected
    })
    if (nextSelected) setSelectedArtist(nextSelected)
    await saveArtists(updated, `${isValidated ? 'Retrait validation sanglier' : 'Validation sanglier'} : ${name}`)
  }

  const closeContextMenu = () => {
    setContextArtist(null)
    setContextMenuPos(null)
  }

  const openQuickEdit = () => {
    if (!contextArtist) return
    openWindow(`artist_quickedit_${contextArtist.id}`, {
      artist: contextArtist,
      artistName: contextArtist.nom_artiste || contextArtist.nom,
      artistId: contextArtist.id,
    })
    closeContextMenu()
  }

  const openFullEdit = () => {
    if (!contextArtist) return
    openWindow(`artist_edit_${contextArtist.id}`, {
      artist: contextArtist,
      artistName: contextArtist.nom_artiste || contextArtist.nom,
      artistId: contextArtist.id,
    })
    closeContextMenu()
  }

  const openProperties = () => {
    if (!contextArtist) return
    openWindow(`artist_props_${contextArtist.id}`, {
      artist: contextArtist,
      artistName: contextArtist.nom_artiste || contextArtist.nom,
    })
    closeContextMenu()
  }

  const handleContextToggleValidation = async () => {
    if (!contextArtist) return
    const name = contextArtist.nom_artiste || contextArtist.nom || 'Artiste'
    const isValidated = isArtistValidated(contextArtist)
    const today = new Date().toISOString().slice(0, 10)
    const updated = artists.map(a =>
      String(a.id) === String(contextArtist.id)
        ? {
            ...a,
            validation_sanglier: isValidated ? '' : 'true',
            date_validation: isValidated ? '' : today,
          }
        : a
    )
    closeContextMenu()
    await saveArtists(updated, `${isValidated ? 'Retrait validation sanglier' : 'Validation sanglier'} : ${name}`)
  }

  const handleSort = (key) => {
    setSortConfig(prev => (
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    ))
  }

  const columns = [
    { key: 'artist', label: 'Artiste' },
    { key: 'zone', label: 'Zone' },
    { key: 'style', label: 'Style' },
    { key: 'performance', label: 'Performance' },
    { key: 'status', label: 'Statut' },
    { key: 'validation', label: '🐗' },
    { key: 'links', label: 'Liens' },
  ]

  // ─── Filters & Parsings ───
  const filteredArtists = useMemo(() => {
    const q = searchQuery.toLowerCase()
    const filtered = artists.filter(artist => {
      // Archive filter
      if (artist.archive === "true") return false;
      
      const n = (artist.nom_artiste || artist.nom || '').toLowerCase()
      const s = (artist.style || '').toLowerCase()
      const g = (artist.sous_genre || '').toLowerCase()
      const matchSearch = !q || n.includes(q) || s.includes(q) || g.includes(q)
      const matchStyle = !activeStyle || s.includes(activeStyle.toLowerCase()) || g.includes(activeStyle.toLowerCase())
      const matchValidation = validationFilter === 'all'
        || (validationFilter === 'validated' && isArtistValidated(artist))
        || (validationFilter === 'pending' && !isArtistValidated(artist))
      return matchSearch && matchStyle && matchValidation
    })

    return [...filtered].sort((a, b) => {
      const aValue = getArtistSortValue(a, sortConfig.key)
      const bValue = getArtistSortValue(b, sortConfig.key)
      const primary = compareSortValues(aValue, bValue, sortConfig.direction)
      if (primary !== 0) return primary

      if (sortConfig.key === 'links') {
        return compareSortValues(
          a.nom_artiste || a.nom || '',
          b.nom_artiste || b.nom || '',
          'asc'
        )
      }

      return compareSortValues(
        a.nom_artiste || a.nom || '',
        b.nom_artiste || b.nom || '',
        'asc'
      )
    })
  }, [artists, searchQuery, activeStyle, validationFilter, sortConfig])

  // Extract all styles for Sidebar
  const allStylesRaw = artists.flatMap(a => (a.style || '').split(' / ').concat((a.style || '').split(', ')).map(x => x.trim()).filter(Boolean))
  const stylesSet = new Set()
  allStylesRaw.forEach(s => {
    const norm = s.toLowerCase()
    if (norm.includes('hard techno')) stylesSet.add('Hard Techno')
    else if (norm.includes('techno')) stylesSet.add('Techno')
    else if (norm.includes('house')) stylesSet.add('House')
    else if (norm.includes('electro')) stylesSet.add('Electro')
    else if (norm.includes('darkwave') || norm.includes('ebm') || norm.includes('synthpop')) stylesSet.add('Darkwave/EBM')
    else if (norm.includes('dnb') || norm.includes('drum and bass') || norm.includes('jungle')) stylesSet.add('DnB')
    else if (norm.includes('tekno')) stylesSet.add('Tekno')
    else if (norm.includes('idm')) stylesSet.add('IDM')
    else if (norm.includes('chill') || norm.includes('ambient')) stylesSet.add('Chill/Ambient')
    else if (norm.includes('psy')) stylesSet.add('Psy')
  })
  const mainStyles = Array.from(stylesSet).sort()
  const uniqueZones = new Set(artists.map(a => a.zone).filter(Boolean)).size
  const validatedCount = artists.filter(isArtistValidated).length

  const exportCSV = () => {
    setOpenMenu(null);
    let csv = "Nom,Zone,Style,Sous-Genre,Performance,Validation Sanglier,Date Validation\n";
    artists.forEach(a => {
      csv += `"${(a.nom_artiste || a.nom || '').replace(/"/g, '""')}","${(a.zone || '').replace(/"/g, '""')}","${(a.style || '').replace(/"/g, '""')}","${(a.sous_genre || '').replace(/"/g, '""')}","${(a.type_performance || '').replace(/"/g, '""')}","${isArtistValidated(a) ? 'true' : ''}","${(a.date_validation || '').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "export_artistes.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    setOpenMenu(null);
    if (onRefresh) onRefresh();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#c0c0c0', position: 'relative' }}>
      {openMenu && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 199 }} onMouseDown={() => setOpenMenu(null)} />
      )}
      {contextMenuPos && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 209 }} onMouseDown={closeContextMenu} />
      )}
      
      {/* Menu bar */}
      <div className="win95-menubar" style={{ position: 'relative', zIndex: 200 }}>
        {['Fichier', 'Affichage', 'Recherche'].map(m => (
          <div
            key={m}
            className={`win95-menu-item ${openMenu === m ? 'active' : ''}`}
            onClick={() => setOpenMenu(openMenu === m ? null : m)}
            style={{ fontSize: "10px", padding: '2px 6px', background: openMenu === m ? '#000080' : 'transparent', color: openMenu === m ? '#fff' : '#000' }}
          >
            {m}
          </div>
        ))}

        {/* Dropdowns */}
        {openMenu === 'Fichier' && (
          <div style={{ position: 'absolute', top: '100%', left: '2px', background: '#c0c0c0', padding: '2px', ...raised, display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
            <div className="win95-menu-item" style={{ fontSize: '11px', padding: '3px 12px' }} onClick={() => { setOpenMenu(null); handleAdd(); }}>Nouveau profil</div>
            <div className="win95-menu-item" style={{ fontSize: '11px', padding: '3px 12px' }} onClick={exportCSV}>Exporter (CSV)</div>
          </div>
        )}
        {openMenu === 'Affichage' && (
          <div style={{ position: 'absolute', top: '100%', left: '44px', background: '#c0c0c0', padding: '2px', ...raised, display: 'flex', flexDirection: 'column', minWidth: '180px' }}>
            <div className="win95-menu-item" style={{ fontSize: '11px', padding: '3px 12px' }} onClick={handleRefresh}>Actualiser (F5)</div>
            <div style={{ borderBottom: '1px solid #808080', borderTop: '1px solid #fff', margin: '2px 0' }} />
            <div className="win95-menu-item" style={{ fontSize: '11px', padding: '3px 12px', display: 'flex', gap: '6px' }} onClick={() => { setShowFilters(!showFilters); setOpenMenu(null); }}>
              <span style={{ width: '12px' }}>{showFilters ? '✔' : ''}</span> Afficher la sidebar Filtres
            </div>
            <div className="win95-menu-item" style={{ fontSize: '11px', padding: '3px 12px', display: 'flex', gap: '6px' }} onClick={() => { setCompactMode(!compactMode); setOpenMenu(null); }}>
              <span style={{ width: '12px' }}>{compactMode ? '✔' : ''}</span> Mode Listage Compact
            </div>
            <div className="win95-menu-item" style={{ fontSize: '11px', padding: '3px 12px', display: 'flex', gap: '6px' }} onClick={() => { setShowAvatars(!showAvatars); setOpenMenu(null); }}>
              <span style={{ width: '12px' }}>{showAvatars ? '✔' : ''}</span> Afficher les avatars
            </div>
            <div style={{ borderBottom: '1px solid #808080', borderTop: '1px solid #fff', margin: '2px 0' }} />
            <div className="win95-menu-item" style={{ fontSize: '11px', padding: '3px 12px', display: 'flex', gap: '6px' }} onClick={() => { setValidationFilter('all'); setOpenMenu(null); }}>
              <span style={{ width: '12px' }}>{validationFilter === 'all' ? '✔' : ''}</span> Tous les artistes
            </div>
            <div className="win95-menu-item" style={{ fontSize: '11px', padding: '3px 12px', display: 'flex', gap: '6px' }} onClick={() => { setValidationFilter('validated'); setOpenMenu(null); }}>
              <span style={{ width: '12px' }}>{validationFilter === 'validated' ? '✔' : ''}</span> Seulement validés 🐗
            </div>
            <div className="win95-menu-item" style={{ fontSize: '11px', padding: '3px 12px', display: 'flex', gap: '6px' }} onClick={() => { setValidationFilter('pending'); setOpenMenu(null); }}>
              <span style={{ width: '12px' }}>{validationFilter === 'pending' ? '✔' : ''}</span> Seulement à valider
            </div>
          </div>
        )}
        {openMenu === 'Recherche' && (
          <div style={{ position: 'absolute', top: '100%', left: '96px', background: '#c0c0c0', padding: '2px', ...raised, display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
            <div className="win95-menu-item" style={{ fontSize: '11px', padding: '3px 12px' }} onClick={() => { setOpenMenu(null); searchInputRef.current?.focus(); }}>Trouver (Focus)</div>
            <div className="win95-menu-item" style={{ fontSize: '11px', padding: '3px 12px' }} onClick={() => { setOpenMenu(null); setSearchQuery(''); setActiveStyle(null); }}>Vider la recherche</div>
          </div>
        )}

        {contextMenuPos && contextArtist && (
          <div
            style={{
              position: 'fixed',
              top: contextMenuPos.y,
              left: contextMenuPos.x,
              background: '#c0c0c0',
              padding: '2px',
              ...raised,
              display: 'flex',
              flexDirection: 'column',
              minWidth: '210px',
              zIndex: 210,
            }}
            onMouseDown={e => e.stopPropagation()}
          >
            <div style={{ ...winFont, fontSize: '10px', padding: '4px 10px', color: '#000080', fontWeight: 'bold', borderBottom: '1px solid #808080' }}>
              {contextArtist.nom_artiste || contextArtist.nom}
            </div>
            <div className="win95-menu-item" style={{ fontSize: '11px', padding: '4px 12px' }} onClick={openQuickEdit}>⚡ Édition rapide liens / photo</div>
            <div className="win95-menu-item" style={{ fontSize: '11px', padding: '4px 12px' }} onClick={openFullEdit}>✍️ Modifier la fiche complète</div>
            <div className="win95-menu-item" style={{ fontSize: '11px', padding: '4px 12px' }} onClick={openProperties}>🔎 Ouvrir la fiche artiste</div>
            <div style={{ borderBottom: '1px solid #808080', borderTop: '1px solid #fff', margin: '2px 0' }} />
            <div className="win95-menu-item" style={{ fontSize: '11px', padding: '4px 12px' }} onClick={handleContextToggleValidation}>
              {isArtistValidated(contextArtist) ? '↺ Retirer validation 🐗' : '🐗 Marquer validé'}
            </div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 6px', borderBottom: '2px solid', borderColor: '#808080 #dfdfdf #dfdfdf #808080' }}>
        <Win95Button onClick={handleAdd}>Nouveau</Win95Button>
        <Win95Button onClick={handleEdit} disabled={!selectedArtist}>Modifier</Win95Button>
        <Win95Button 
          onClick={() => playTrack(selectedArtist)} 
          disabled={!selectedArtist || !(selectedArtist.spotify || selectedArtist.soundcloud || selectedArtist.youtube || selectedArtist.bandcamp)}
        >
          ▷ Écouter
        </Win95Button>
        <Win95Button onClick={handleDelete} disabled={!selectedArtist}>Supprimer</Win95Button>
        <Win95Button onClick={handleToggleValidation} disabled={!selectedArtist}>
          {selectedArtist && isArtistValidated(selectedArtist) ? '↺ Retirer 🐗' : '🐗 Valider'}
        </Win95Button>
        <div style={{ width: '1px', background: '#808080', height: '20px', margin: '0 4px', borderRight: '1px solid #fff' }} />
        <span style={{ ...winFont, color: '#444' }}>Rechercher :</span>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Nom, style..."
          style={{
            ...winFont, ...sunken, border: 'none', background: '#fff',
            padding: '2px 4px', width: '180px', outline: 'none',
          }}
        />
        <Win95Button onClick={() => setSearchQuery('')}>Effacer</Win95Button>
      </div>

      {/* Main content area */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left panel — filters */}
        {showFilters && (
          <div style={{ width: '200px', borderRight: '2px solid', borderColor: '#808080 #dfdfdf #dfdfdf #808080', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ ...winFont, fontWeight: 'bold', padding: '4px 6px', background: '#000080', color: '#fff', fontSize: '10px' }}>
              INDEX / STYLES
            </div>
            <div style={{ overflowY: 'auto', flex: 1, background: '#fff', ...sunken, margin: '2px' }}>
              <div
                onClick={() => setActiveStyle(null)}
                style={{
                  ...winFont, padding: '2px 8px', cursor: 'default', display: 'flex', justifyContent: 'space-between',
                  background: !activeStyle ? '#000080' : 'transparent', color: !activeStyle ? '#fff' : '#000',
                }}
              >
                <span>Tous les styles</span>
                <span style={{ color: !activeStyle ? '#adf' : '#666' }}>[{artists.length}]</span>
              </div>
              {mainStyles.map(style => {
                const count = artists.filter(a => {
                  const s = (a.style || '').toLowerCase()
                  const g = (a.sous_genre || '').toLowerCase()
                  const searchRaw = style.toLowerCase()
                  return s.includes(searchRaw) || g.includes(searchRaw)
                }).length

                const isActive = activeStyle === style
                return (
                  <div
                    key={style}
                    onClick={() => setActiveStyle(style)}
                    style={{
                      ...winFont, padding: '2px 8px', cursor: 'default', display: 'flex', justifyContent: 'space-between',
                      background: isActive ? '#000080' : 'transparent', color: isActive ? '#fff' : '#000',
                    }}
                  >
                    <span>{style}</span>
                    <span style={{ color: isActive ? '#adf' : '#666' }}>[{count}]</span>
                  </div>
                )
              })}
            </div>

            <div style={{ borderTop: '2px solid', borderColor: '#808080 #dfdfdf #dfdfdf #808080', padding: '6px', background: '#c0c0c0' }}>
              <div style={{ ...sunken, background: '#fff', padding: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', paddingBottom: '6px', borderBottom: '1px solid #ddd' }}>
                  <img src="/sanglier.png" style={{ width: 40, height: 40, objectFit: 'cover', flexShrink: 0, ...raised }} alt="logo" />
                  <div>
                    <div style={{ ...winFont, fontSize: '10px', fontWeight: 'bold', color: '#000080', lineHeight: 1.2 }}>Super Bernard</div>
                    <div style={{ ...winFont, fontSize: '10px', fontWeight: 'bold', color: '#000080', lineHeight: 1.2 }}>3000</div>
                  </div>
                </div>
                <div style={{ ...winFont, fontSize: '10px' }}>Artistes : <b>{artists.length}</b></div>
                <div style={{ ...winFont, fontSize: '10px' }}>Styles : <b>{mainStyles.length}</b></div>
                <div style={{ ...winFont, fontSize: '10px' }}>Zones : <b>{uniqueZones}</b></div>
                <div style={{ ...winFont, fontSize: '10px' }}>Validés 🐗 : <b>{validatedCount}</b></div>
              </div>
            </div>

            <div style={{ borderTop: '2px solid', borderColor: '#808080 #dfdfdf #dfdfdf #808080', padding: '6px', background: '#c0c0c0' }}>
              <div style={{ ...sunken, background: '#fff', padding: '6px' }}>
                <div style={{ ...winFont, fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}>Validation 🐗</div>
                {[
                  { id: 'all', label: 'Tous', count: artists.length },
                  { id: 'validated', label: 'Validés', count: validatedCount },
                  { id: 'pending', label: 'À valider', count: artists.length - validatedCount },
                ].map(item => (
                  <div
                    key={item.id}
                    onClick={() => setValidationFilter(item.id)}
                    style={{
                      ...winFont,
                      padding: '2px 4px',
                      cursor: 'default',
                      display: 'flex',
                      justifyContent: 'space-between',
                      background: validationFilter === item.id ? '#000080' : 'transparent',
                      color: validationFilter === item.id ? '#fff' : '#000',
                    }}
                  >
                    <span>{item.label}</span>
                    <span style={{ color: validationFilter === item.id ? '#adf' : '#666' }}>[{item.count}]</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Right panel — list view */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, padding: 2 }}>
          <div style={{ overflowX: 'auto', flex: 1, display: 'flex', flexDirection: 'column', ...sunken, background: '#fff' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 2fr) minmax(100px, 1fr) minmax(120px, 1.2fr) minmax(120px, 1.2fr) minmax(110px, 1fr) 64px 100px', ...raised, background: '#c0c0c0', flexShrink: 0 }}>
                  {columns.map((column, i) => (
                    <div
                      key={i}
                      onClick={() => handleSort(column.key)}
                      title={`Trier par ${column.label}`}
                      style={{ ...winFont, fontWeight: 'bold', padding: '3px 6px', borderRight: '1px solid #808080', borderBottom: '1px solid #808080', fontSize: '11px', cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: column.key === 'validation' ? 'center' : 'space-between', gap: '6px' }}
                    >
                      <span>{column.label}</span>
                      <span style={{ color: sortConfig.key === column.key ? '#000080' : '#666', fontSize: '10px', minWidth: '10px', textAlign: 'right' }}>
                        {sortConfig.key === column.key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {loading ? (
                    <div style={{ ...winFont, padding: '20px', textAlign: 'center', color: '#000080' }}>Chargement...</div>
                  ) : filteredArtists.length === 0 ? (
                    <div style={{ ...winFont, padding: '20px', color: '#808080', textAlign: 'center' }}>Aucun résultat trouvé.</div>
                  ) : filteredArtists.map((artist, idx) => {
                    const isSelected = selectedArtist?.id === artist.id;
                    const validated = isArtistValidated(artist);
                    const validationDate = formatValidationDate(artist.date_validation);
                    return (
                        <div
                          key={artist.id}
                          onDoubleClick={() => openWindow(`artist_props_${artist.id}`, { artist, artistName: artist.nom_artiste || artist.nom })}
                          onClick={() => setSelectedArtist(artist)}
                          onContextMenu={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setSelectedArtist(artist)
                            setContextArtist(artist)
                            setContextMenuPos({ x: e.clientX, y: e.clientY })
                          }}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(180px, 2fr) minmax(100px, 1fr) minmax(120px, 1.2fr) minmax(120px, 1.2fr) minmax(110px, 1fr) 64px 100px',
                            background: isSelected ? '#000080' : idx % 2 === 0 ? '#ffffff' : '#f4f4f4',
                            color: isSelected ? '#ffffff' : '#000000',
                            cursor: 'default',
                            borderBottom: '1px solid #e0e0e0',
                          }}
                        >
                          <div style={{ ...winFont, padding: compactMode ? '0px 6px' : '10px 8px', borderRight: '1px dotted #ccc', display: 'flex', alignItems: 'center', gap: compactMode ? '4px' : '10px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {showAvatars && (
                              <img src={artist.photo_or_logo_link || artist.photo || artist.image_url || "/sanglier.png"} style={{ width: compactMode ? 14 : 48, height: compactMode ? 14 : 48, objectFit: 'cover', flexShrink: 0, background: '#ccc', border: compactMode ? 'none' : '1px solid #808080' }} alt="" />
                            )}
                            {!showAvatars && <span style={{ fontSize: compactMode ? '10px' : '12px' }}>▶</span>}
                            <span style={{ fontSize: compactMode ? '11px' : '13px' }}>{validated ? '🐗 ' : ''}{artist.nom_artiste || artist.nom || ''}</span>
                          </div>
                          <div style={{ ...winFont, padding: compactMode ? '0px 6px' : '10px 8px', borderRight: '1px dotted #ccc', fontSize: compactMode ? '10px' : '12px', color: isSelected ? '#ddd' : '#555', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center' }}>
                            {artist.zone || ''}
                          </div>
                          <div style={{ ...winFont, padding: compactMode ? '0px 6px' : '10px 8px', borderRight: '1px dotted #ccc', fontSize: compactMode ? '10px' : '12px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center' }}>
                            {artist.style || ''}
                          </div>
                          <div style={{ ...winFont, padding: compactMode ? '0px 6px' : '10px 8px', borderRight: '1px dotted #ccc', fontSize: compactMode ? '10px' : '12px', color: isSelected ? '#ddd' : '#555', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center' }}>
                            {artist.type_performance || '—'}
                          </div>
                          <div style={{ ...winFont, padding: compactMode ? '0px 6px' : '10px 8px', borderRight: '1px dotted #ccc', fontSize: compactMode ? '10px' : '11px', color: isSelected ? '#adf' : '#000080', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                            {artist.statut_localite || '—'}
                          </div>
                          <div
                            title={validated ? `Validé 🐗${validationDate ? ` le ${validationDate}` : ''}` : 'Non validé'}
                            style={{ ...winFont, padding: compactMode ? '0px 6px' : '10px 8px', borderRight: '1px dotted #ccc', fontSize: compactMode ? '12px' : '14px', color: isSelected ? '#fff' : (validated ? '#0a5f00' : '#777'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                          >
                            {validated ? '🐗' : '·'}
                          </div>
                          <div style={{ padding: compactMode ? '2px 4px' : '10px 8px', display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', overflow: 'hidden' }}>
                            {(artist.spotify || artist.soundcloud || artist.youtube || artist.bandcamp) && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); playTrack(artist); }}
                                style={{ ...raised, ...winFont, background: '#c0c0c0', color: '#000080', cursor: 'default', padding: '1px 4px', fontSize: '10px', fontWeight: 'bold' }}
                                title="Lancer dans Radio Bernard"
                              >
                                ▷
                              </button>
                            )}
                            {artist.soundcloud && <a title="SoundCloud" href={artist.soundcloud} target="_blank" onClick={e => e.stopPropagation()} style={{ ...raised, ...winFont, background: '#c0c0c0', color: '#000', textDecoration: 'none', padding: '1px 3px', fontSize: '9px', fontWeight: 'bold' }}>SC</a>}
                            {artist.instagram && <a title="Instagram" href={artist.instagram} target="_blank" onClick={e => e.stopPropagation()} style={{ ...raised, ...winFont, background: '#c0c0c0', color: '#000', textDecoration: 'none', padding: '1px 3px', fontSize: '9px', fontWeight: 'bold' }}>IG</a>}
                          </div>
                        </div>
                    )
                  })}
                </div>
          </div>
        </div>
      </div>

      <div className="win95-statusbar">
        <div className="win95-statusbar-panel">{filteredArtists.length} élément(s)</div>
        <div className="win95-statusbar-panel" style={{ flex: 1 }}>
          {selectedArtist ? `Sélectionné : ${selectedArtist.nom_artiste || selectedArtist.nom}${isArtistValidated(selectedArtist) ? ' — validé 🐗' : ''} — Double-cliquer pour éditer` : `Prêt${validationFilter === 'validated' ? ' — filtre validés 🐗' : validationFilter === 'pending' ? ' — filtre à valider' : ''} — tri ${columns.find(c => c.key === sortConfig.key)?.label || sortConfig.key} ${sortConfig.direction === 'asc' ? '▲' : '▼'}`}
        </div>
      </div>
    </div>
  )
}
