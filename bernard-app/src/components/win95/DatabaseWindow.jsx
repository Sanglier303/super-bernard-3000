import React, { useState, useRef, useMemo } from "react";
import { isArtistValidated, raised, sunken, winFont, Win95Button } from "./ArtistWindowCommon";
import { compareSortValues, getArtistSortValue, getMainStyles } from "./DatabaseArtistUtils";
import { DatabaseSidebar } from "./DatabaseSidebar";
import { DatabaseArtistTable } from "./DatabaseArtistTable";

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

  const mainStyles = useMemo(() => getMainStyles(artists), [artists])
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

      </div>

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
          onClick={e => e.stopPropagation()}
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
        <DatabaseSidebar
          artists={artists}
          showFilters={showFilters}
          activeStyle={activeStyle}
          setActiveStyle={setActiveStyle}
          mainStyles={mainStyles}
          uniqueZones={uniqueZones}
          validatedCount={validatedCount}
          validationFilter={validationFilter}
          setValidationFilter={setValidationFilter}
        />

        <DatabaseArtistTable
          columns={columns}
          sortConfig={sortConfig}
          handleSort={handleSort}
          loading={loading}
          filteredArtists={filteredArtists}
          selectedArtist={selectedArtist}
          setSelectedArtist={setSelectedArtist}
          compactMode={compactMode}
          showAvatars={showAvatars}
          openWindow={openWindow}
          setContextArtist={setContextArtist}
          setContextMenuPos={setContextMenuPos}
          playTrack={playTrack}
        />
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
