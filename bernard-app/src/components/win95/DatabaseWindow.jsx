import React, { useState, useRef, useMemo } from "react";

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

  // ─── Filters & Parsings ───
  const filteredArtists = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return artists.filter(artist => {
      // Archive filter
      if (artist.archive === "true") return false;
      
      const n = (artist.nom_artiste || artist.nom || '').toLowerCase()
      const s = (artist.style || '').toLowerCase()
      const g = (artist.sous_genre || '').toLowerCase()
      const matchSearch = !q || n.includes(q) || s.includes(q) || g.includes(q)
      const matchStyle = !activeStyle || s.includes(activeStyle.toLowerCase()) || g.includes(activeStyle.toLowerCase())
      return matchSearch && matchStyle
    })
  }, [artists, searchQuery, activeStyle])

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

  const exportCSV = () => {
    setOpenMenu(null);
    let csv = "Nom,Zone,Style,Sous-Genre,Performance\n";
    artists.forEach(a => {
      csv += `"${(a.nom_artiste || a.nom || '').replace(/"/g, '""')}","${(a.zone || '').replace(/"/g, '""')}","${(a.style || '').replace(/"/g, '""')}","${(a.sous_genre || '').replace(/"/g, '""')}","${(a.type_performance || '').replace(/"/g, '""')}"\n`;
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
          </div>
        )}
        {openMenu === 'Recherche' && (
          <div style={{ position: 'absolute', top: '100%', left: '96px', background: '#c0c0c0', padding: '2px', ...raised, display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
            <div className="win95-menu-item" style={{ fontSize: '11px', padding: '3px 12px' }} onClick={() => { setOpenMenu(null); searchInputRef.current?.focus(); }}>Trouver (Focus)</div>
            <div className="win95-menu-item" style={{ fontSize: '11px', padding: '3px 12px' }} onClick={() => { setOpenMenu(null); setSearchQuery(''); setActiveStyle(null); }}>Vider la recherche</div>
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
              </div>
            </div>
          </div>
        )}

        {/* Right panel — list view */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, padding: 2 }}>
          <div style={{ overflowX: 'auto', flex: 1, display: 'flex', flexDirection: 'column', ...sunken, background: '#fff' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 2fr) minmax(100px, 1fr) minmax(120px, 1.2fr) minmax(120px, 1.2fr) minmax(110px, 1fr) 100px', ...raised, background: '#c0c0c0', flexShrink: 0 }}>
                  {['Artiste', 'Zone', 'Style', 'Performance', 'Statut', 'Liens'].map((h, i) => (
                    <div key={i} style={{ ...winFont, fontWeight: 'bold', padding: '3px 6px', borderRight: '1px solid #808080', borderBottom: '1px solid #808080', fontSize: '11px', cursor: 'default', userSelect: 'none' }}>
                      {h}
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
                    return (
                        <div
                          key={artist.id}
                          onDoubleClick={() => openWindow(`artist_props_${artist.id}`, { artist, artistName: artist.nom_artiste || artist.nom })}
                          onClick={() => setSelectedArtist(artist)}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(180px, 2fr) minmax(100px, 1fr) minmax(120px, 1.2fr) minmax(120px, 1.2fr) minmax(110px, 1fr) 100px',
                            background: isSelected ? '#000080' : idx % 2 === 0 ? '#ffffff' : '#f4f4f4',
                            color: isSelected ? '#ffffff' : '#000000',
                            cursor: 'default',
                            borderBottom: '1px solid #e0e0e0',
                          }}
                        >
                          <div style={{ ...winFont, padding: compactMode ? '0px 6px' : '10px 8px', borderRight: '1px dotted #ccc', display: 'flex', alignItems: 'center', gap: compactMode ? '4px' : '10px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {showAvatars && (
                              <img src={artist.photo || artist.image_url || "/sanglier.png"} style={{ width: compactMode ? 14 : 48, height: compactMode ? 14 : 48, objectFit: 'cover', flexShrink: 0, background: '#ccc', border: compactMode ? 'none' : '1px solid #808080' }} alt="" />
                            )}
                            {!showAvatars && <span style={{ fontSize: compactMode ? '10px' : '12px' }}>▶</span>}
                            <span style={{ fontSize: compactMode ? '11px' : '13px' }}>{artist.nom_artiste || artist.nom || ''}</span>
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
          {selectedArtist ? `Sélectionné : ${selectedArtist.nom_artiste || selectedArtist.nom} — Double-cliquer pour éditer` : `Prêt`}
        </div>
      </div>
    </div>
  )
}
