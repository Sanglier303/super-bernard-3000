import React, { useState, useEffect, useRef } from "react";

// Helper components that were originally in App.jsx
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

function TitleBar({ title, onClose }) {
  const raised = { boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf' };
  return (
    <div className="win95-titlebar">
      <div className="flex items-center gap-1 overflow-hidden">
        <img src="/sanglier.png" style={{ width: 14, height: 14, objectFit: 'cover', borderRadius: '1px', flexShrink: 0 }} alt="logo" />
        <span>{title}</span>
      </div>
      <div className="flex items-center gap-0.5">
        {['_', '□', '×'].map((btn, i) => (
          <button
            key={i}
            onClick={btn === '×' ? onClose : undefined}
            style={{
              ...raised,
              background: '#c0c0c0', color: '#000', border: 'none', width: '16px', height: '14px',
              fontSize: '9px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0
            }}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  )
}

export function DatabaseWindow({ artists, loading, saveArtists, onRefresh }) {
  const [filteredArtists, setFilteredArtists] = useState([])
  
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
  
  // Modals
  const [detailOpen, setDetailOpen] = useState(false)
  const [editingArtistId, setEditingArtistId] = useState(null)
  const [addEditOpen, setAddEditOpen] = useState(false)

  const winFont = { fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif', fontSize: '11px' };
  const raised = { boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf' };
  const sunken = { boxShadow: 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff, inset 2px 2px #808080, inset -2px -2px #dfdfdf' };

  const handleAdd = () => {
    setEditingArtistId(null)
    setAddEditOpen(true)
  }

  const handleEdit = () => {
    if (!selectedArtist) return
    setEditingArtistId(selectedArtist._id)
    setAddEditOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedArtist) return
    if (!window.confirm(`Supprimer "${selectedArtist.nom_artiste || selectedArtist.nom}" ?`)) return
    const updated = artists.filter(a => a._id !== selectedArtist._id)
    setSelectedArtist(null)
    setDetailOpen(false)
    await saveArtists(updated, `Suppression`)
  }

  // ─── Filters & Parsings ───
  useEffect(() => {
    const q = searchQuery.toLowerCase()
    const result = artists.filter(artist => {
      const n = (artist.nom_artiste || artist.nom || '').toLowerCase()
      const s = (artist.style || '').toLowerCase()
      const g = (artist.sous_genre || '').toLowerCase()
      const matchSearch = !q || n.includes(q) || s.includes(q) || g.includes(q)
      const matchStyle = !activeStyle || s.includes(activeStyle.toLowerCase()) || g.includes(activeStyle.toLowerCase())
      return matchSearch && matchStyle
    })
    setFilteredArtists(result)
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

  const openDetail = (artist) => {
    setSelectedArtist(artist)
    setDetailOpen(true)
  }


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
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 2fr) minmax(100px, 1.2fr) minmax(130px, 1.5fr) minmax(150px, 1.5fr) minmax(100px, 1fr) 130px', ...raised, background: '#c0c0c0', flexShrink: 0 }}>
                  {['Nom de l\'Artiste', 'Zone', 'Style', 'Sous-Genre', 'Perf.', 'Liens'].map((h, i) => (
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
                    const isSelected = selectedArtist?._id === artist._id;
                    return (
                      <div
                        key={artist._id}
                        onDoubleClick={() => openDetail(artist)}
                        onClick={() => setSelectedArtist(artist)}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(180px, 2fr) minmax(100px, 1.2fr) minmax(130px, 1.5fr) minmax(150px, 1.5fr) minmax(100px, 1fr) 130px',
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
                        <div style={{ ...winFont, padding: compactMode ? '0px 6px' : '10px 8px', borderRight: '1px dotted #ccc', fontSize: compactMode ? '10px' : '12px', color: isSelected ? '#cce' : '#666', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center' }}>
                          {artist.sous_genre || artist.sousGenre || ''}
                        </div>
                        <div style={{ ...winFont, padding: compactMode ? '0px 6px' : '10px 8px', borderRight: '1px dotted #ccc', fontSize: compactMode ? '10px' : '12px', color: isSelected ? '#ddd' : '#555', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center' }}>
                          {artist.type_performance || artist.typePerf || '—'}
                        </div>
                        <div style={{ padding: compactMode ? '2px 4px' : '10px 8px', display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {artist.soundcloud && <a href={artist.soundcloud} target="_blank" onClick={e => e.stopPropagation()} style={{ ...raised, ...winFont, background: '#c0c0c0', color: '#000', textDecoration: 'none', padding: '1px 3px', fontSize: '9px', fontWeight: 'bold' }}>SC</a>}
                          {artist.instagram && <a href={artist.instagram} target="_blank" onClick={e => e.stopPropagation()} style={{ ...raised, ...winFont, background: '#c0c0c0', color: '#000', textDecoration: 'none', padding: '1px 3px', fontSize: '9px', fontWeight: 'bold' }}>IG</a>}
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

      {/* DETAIL DIALOG */}
      {detailOpen && selectedArtist && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#c0c0c0', ...raised, width: '520px', maxHeight: '80vh', position: 'relative' }}>
            <TitleBar title={`Propriétés — ${selectedArtist.nom_artiste || selectedArtist.nom}`} onClose={() => setDetailOpen(false)} />

            <div style={{ padding: '12px', overflow: 'auto', maxHeight: 'calc(80vh - 60px)' }}>
              {/* Properties Tab Look */}
              <div style={{ borderBottom: '1px solid #fff', marginBottom: '8px', display: 'flex' }}>
                 <div style={{ padding: '4px 8px', ...raised, borderBottom: 'none', background: '#c0c0c0', zIndex: 2, marginBottom: '-1px' }}>
                   <span style={winFont}>Général</span>
                 </div>
              </div>

              <div style={{ border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '12px', background: '#c0c0c0', marginTop: '-2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <img src="/sanglier.png" style={{ width: 32, height: 32, ...raised }} />
                    <div>
                      <div style={{ ...winFont, fontSize: '16px', fontWeight: 'bold' }}>{selectedArtist.nom_artiste || selectedArtist.nom}</div>
                      <div style={{ ...winFont, color: '#444' }}>Type : Fichier Artiste Local</div>
                    </div>
                  </div>
                  
                  <div style={{ height: '2px', ...sunken, marginBottom: '12px' }} />

                  <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px', alignItems: 'center' }}>
                     <span style={winFont}>Emplacement :</span>
                     <span style={winFont}>{selectedArtist.zone || 'Inconnu'}</span>

                     <span style={winFont}>Style musical :</span>
                     <span style={winFont}>{selectedArtist.style || '—'}</span>

                     <span style={winFont}>Sous-genre :</span>
                     <span style={winFont}>{selectedArtist.sous_genre || '—'}</span>

                     <span style={winFont}>Performance :</span>
                     <span style={winFont}>{selectedArtist.type_performance || '—'}</span>
                  </div>

                  <div style={{ height: '2px', ...sunken, margin: '12px 0' }} />
                  
                  <div style={{ ...winFont, marginBottom: '4px' }}>Liens :</div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                     {[
                       { label: 'SoundCloud', url: selectedArtist.soundcloud },
                       { label: 'Instagram', url: selectedArtist.instagram },
                       { label: 'Bandcamp', url: selectedArtist.bandcamp },
                       { label: 'Spotify', url: selectedArtist.spotify }
                     ].filter(x => x.url).map(x => (
                        <a key={x.label} href={x.url} target="_blank" style={{ ...winFont, color: '#000080' }}>{x.label}</a>
                     ))}
                  </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '12px' }}>
                <Win95Button onClick={() => setDetailOpen(false)} style={{ width: '80px' }}>OK</Win95Button>
                <Win95Button onClick={handleEdit} style={{ width: '80px' }}>Ouvrir...</Win95Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT DIALOG */}
      {addEditOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div style={{ background: '#c0c0c0', ...raised, width: '480px', maxHeight: '90vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <TitleBar title={editingArtistId ? "Modifier l'entité" : "Nouv. Entité"} onClose={() => setAddEditOpen(false)} />
            
            <form onSubmit={e => {
              e.preventDefault()
              const fd = new FormData(e.target)
              const data = Object.fromEntries(fd.entries())
              
              let updated
              let label
              if (editingArtistId) {
                updated = artists.map(a => a._id === editingArtistId ? { ...a, ...data } : a)
                label = `Édition : ${data.nom_artiste}`
              } else {
                const newArtist = { _id: Date.now() + Math.random().toString() }
                for(let k in data) newArtist[k] = data[k]
                updated = [...artists, newArtist]
                label = `Ajout : ${data.nom_artiste}`
              }
              setAddEditOpen(false)
              setDetailOpen(false)
              saveArtists(updated, label)
            }} style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
               
               <div style={{ ...winFont, fontStyle: 'italic', marginBottom: '8px' }}>Veuillez entrer les propriétés de l'artiste.</div>

               <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '6px', alignItems: 'center' }}>
                  <label style={winFont}>Nom de l'artiste :</label>
                  <input name="nom_artiste" required defaultValue={editingArtistId ? artists.find(a=>a._id===editingArtistId)?.nom_artiste : ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />

                  <label style={winFont}>Zone :</label>
                  <input name="zone" defaultValue={editingArtistId ? artists.find(a=>a._id===editingArtistId)?.zone : ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />

                  <label style={winFont}>Style musical :</label>
                  <input name="style" defaultValue={editingArtistId ? artists.find(a=>a._id===editingArtistId)?.style : ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />

                  <label style={winFont}>Sous-genre :</label>
                  <input name="sous_genre" defaultValue={editingArtistId ? artists.find(a=>a._id===editingArtistId)?.sous_genre : ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />

                  <label style={winFont}>Type Performance :</label>
                  <input name="type_performance" defaultValue={editingArtistId ? artists.find(a=>a._id===editingArtistId)?.type_performance : ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />

                  <label style={winFont}>SoundCloud :</label>
                  <input name="soundcloud" defaultValue={editingArtistId ? artists.find(a=>a._id===editingArtistId)?.soundcloud : ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />

                  <label style={winFont}>Instagram :</label>
                  <input name="instagram" defaultValue={editingArtistId ? artists.find(a=>a._id===editingArtistId)?.instagram : ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                  
                  <label style={winFont}>Notes diverses :</label>
                  <textarea name="notes" defaultValue={editingArtistId ? artists.find(a=>a._id===editingArtistId)?.notes : ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none', height: '60px' }} />
               </div>

               <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', borderTop: '2px solid', borderColor: '#808080 #dfdfdf #dfdfdf #808080', paddingTop: '12px', marginTop: '12px' }}>
                  <Win95Button type="submit" style={{ width: '80px', fontWeight: 'bold' }}>Enregistrer</Win95Button>
                  <Win95Button type="button" onClick={() => setAddEditOpen(false)} style={{ width: '80px' }}>Annuler</Win95Button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
