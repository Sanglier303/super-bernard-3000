import React, { useState, useRef, useMemo } from "react";

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
  const [activeTab, setActiveTab] = useState('general')

  const TABS = [
    { id: 'general', label: 'Général' },
    { id: 'links', label: 'Réseaux' },
    { id: 'quality', label: 'Qualification' },
    { id: 'admin', label: 'Admin' },
  ];

  const winFont = { fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif', fontSize: '11px' };
  const raised = { boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf' };
  const sunken = { boxShadow: 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff, inset 2px 2px #808080, inset -2px -2px #dfdfdf' };

  const editingArtist = useMemo(() => {
    if (editingArtistId === null) return null;
    return artists.find(a => String(a._id) === String(editingArtistId));
  }, [editingArtistId, artists]);

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
    if (!window.confirm(`Mettre "${selectedArtist.nom_artiste || selectedArtist.nom}" à la corbeille ?`)) return
    const updated = artists.map(a => String(a._id) === String(selectedArtist._id) ? { ...a, archive: "true" } : a)
    setSelectedArtist(null)
    setDetailOpen(false)
    await saveArtists(updated, `Archivage artiste : ${selectedArtist.nom_artiste || selectedArtist.nom}`)
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
                    const isSelected = selectedArtist?._id === artist._id;
                    return (
                        <div
                          key={artist._id}
                          onDoubleClick={() => openDetail(artist)}
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
                    <img src={selectedArtist.photo || "/sanglier.png"} style={{ width: 64, height: 64, objectFit: 'cover', ...raised }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ ...winFont, fontSize: '16px', fontWeight: 'bold' }}>{selectedArtist.nom_artiste || selectedArtist.nom}</div>
                      <div style={{ ...winFont, color: '#444' }}>{selectedArtist.style || '—'} ({selectedArtist.type_performance || '—'})</div>
                      <div style={{ ...winFont, color: '#000080', fontWeight: 'bold' }}>{selectedArtist.statut_localite || 'Statut inconnu'}</div>
                    </div>
                  </div>
                  
                  <div style={{ height: '2px', ...sunken, marginBottom: '12px' }} />

                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', alignItems: 'start' }}>
                     <span style={winFont}>Localisation :</span>
                     <span style={winFont}>{selectedArtist.zone || '—'}{selectedArtist.commune_precise ? ` (${selectedArtist.commune_precise})` : ''}</span>

                     <span style={winFont}>Sous-genre :</span>
                     <span style={winFont}>{selectedArtist.sous_genre || '—'}</span>

                     <span style={winFont}>Qualif / Source :</span>
                     <span style={winFont}>{selectedArtist.source_type || '—'} {selectedArtist.source_localite ? `(ref: ${selectedArtist.source_localite})` : ''}</span>
                     
                     <span style={winFont}>Preuves :</span>
                     <span style={{ ...winFont, fontStyle: 'italic', color: '#555' }}>
                       {selectedArtist.preuves || 'Aucune preuve renseignée'}
                       {selectedArtist.date_preuve ? ` [Le ${selectedArtist.date_preuve}]` : ''}
                     </span>
                  </div>

                  <div style={{ height: '2px', ...sunken, margin: '12px 0' }} />
                  
                  <div style={{ ...winFont, marginBottom: '4px', fontWeight: 'bold' }}>Liens & Réseaux :</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                     {[
                       { label: 'Instagram', url: selectedArtist.instagram },
                       { label: 'Facebook', url: selectedArtist.facebook },
                       { label: 'SoundCloud', url: selectedArtist.soundcloud },
                       { label: 'Bandcamp', url: selectedArtist.bandcamp },
                       { label: 'Spotify', url: selectedArtist.spotify },
                       { label: 'YouTube', url: selectedArtist.youtube },
                       { label: 'Site Officiel', url: selectedArtist.site_officiel }
                     ].filter(x => x.url).map(x => (
                        <a key={x.label} href={x.url} target="_blank" style={{ ...winFont, color: '#000080', textDecoration: 'underline' }}>{x.label}</a>
                     ))}
                  </div>

                  <div style={{ height: '2px', ...sunken, margin: '12px 0' }} />
                  <div style={{ ...winFont, fontWeight: 'bold' }}>Notes :</div>
                  <div style={{ ...winFont, whiteSpace: 'pre-wrap', maxHeight: '100px', overflowY: 'auto', background: '#fcfcfc', ...sunken, padding: '4px' }}>
                    {selectedArtist.notes || '—'}
                  </div>
                  {selectedArtist.note_perso && (
                    <div style={{ ...winFont, marginTop: '8px', color: '#800080' }}>
                      <b>Note perso :</b> {selectedArtist.note_perso}
                    </div>
                  )}
                  <div style={{ ...winFont, marginTop: '8px', fontSize: '9px', textAlign: 'right', color: '#888' }}>
                    Dernière vérification : {selectedArtist.derniere_verification || '—'}
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
              if (editingArtistId !== null) {
                updated = artists.map(a => String(a._id) === String(editingArtistId) ? { ...a, ...data } : a)
                label = `Édition : ${data.nom_artiste}`
              } else {
                const newArtist = { _id: Date.now() + Math.random().toString() }
                for(let k in data) newArtist[k] = data[k]
                updated = [...artists, newArtist]
                label = `Ajout : ${data.nom_artiste}`
              }
              setAddEditOpen(false)
              setDetailOpen(false)
              setActiveTab('general') // Reset for next time
              saveArtists(updated, label)
            }} style={{ padding: '0', display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'hidden' }}>
                
                {/* Windows 95 Tab Bar */}
                <div style={{ display: 'flex', padding: '8px 8px 0 8px', gap: '2px', background: '#c0c0c0' }}>
                  {TABS.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                      <div
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                          padding: '3px 10px',
                          cursor: 'default',
                          background: '#c0c0c0',
                          ...winFont,
                          borderLeft: '1px solid #fff',
                          borderTop: '1px solid #fff',
                          borderRight: '1px solid #000',
                          borderBottom: isActive ? '1px solid #c0c0c0' : 'none',
                          boxShadow: isActive ? 'none' : 'inset -1px 0 #808080',
                          marginTop: isActive ? '0' : '2px',
                          zIndex: isActive ? 10 : 1,
                          position: 'relative',
                          marginBottom: '-1px'
                        }}
                      >
                        {tab.label}
                      </div>
                    );
                  })}
                </div>

                <div style={{ 
                  margin: '0 8px 8px 8px', 
                  ...raised, 
                  padding: '16px', 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  background: '#c0c0c0',
                  minHeight: '320px'
                }}>
                   
                   {/* Section 1: Général */}
                   <div style={{ display: activeTab === 'general' ? 'block' : 'none' }}>
                     <fieldset style={{ border: '1px solid #dfdfdf', padding: '12px', position: 'relative' }}>
                       <legend style={{ ...winFont, background: '#c0c0c0', padding: '0 4px' }}>Informations Générales</legend>
                       <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', alignItems: 'center' }}>
                          <label style={winFont}>Nom de l'artiste :</label>
                          <input name="nom_artiste" required defaultValue={editingArtist?.nom_artiste || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />

                          <label style={winFont}>Zone / Ville :</label>
                          <input name="zone" defaultValue={editingArtist?.zone || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />

                          <label style={winFont}>Commune précise :</label>
                          <input name="commune_precise" defaultValue={editingArtist?.commune_precise || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />

                          <label style={winFont}>Style musical :</label>
                          <input name="style" defaultValue={editingArtist?.style || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />

                          <label style={winFont}>Sous-genre :</label>
                          <input name="sous_genre" defaultValue={editingArtist?.sous_genre || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />

                          <label style={winFont}>Type Performance :</label>
                          <input name="type_performance" defaultValue={editingArtist?.type_performance || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                          
                          <label style={winFont}>URL Photo :</label>
                          <input name="photo" defaultValue={editingArtist?.photo || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                       </div>
                     </fieldset>
                   </div>

                   {/* Section 2: Réseaux Sociaux */}
                   <div style={{ display: activeTab === 'links' ? 'block' : 'none' }}>
                     <fieldset style={{ border: '1px solid #dfdfdf', padding: '12px' }}>
                       <legend style={{ ...winFont, background: '#c0c0c0', padding: '0 4px' }}>Réseaux Sociaux & Liens</legend>
                       <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', alignItems: 'center' }}>
                          <label style={winFont}>Instagram :</label>
                          <input name="instagram" defaultValue={editingArtist?.instagram || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                          <label style={winFont}>Facebook :</label>
                          <input name="facebook" defaultValue={editingArtist?.facebook || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                          <label style={winFont}>SoundCloud :</label>
                          <input name="soundcloud" defaultValue={editingArtist?.soundcloud || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                          <label style={winFont}>Bandcamp :</label>
                          <input name="bandcamp" defaultValue={editingArtist?.bandcamp || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                          <label style={winFont}>Spotify :</label>
                          <input name="spotify" defaultValue={editingArtist?.spotify || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                          <label style={winFont}>YouTube :</label>
                          <input name="youtube" defaultValue={editingArtist?.youtube || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                          <label style={winFont}>Site Officiel :</label>
                          <input name="site_officiel" defaultValue={editingArtist?.site_officiel || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                       </div>
                     </fieldset>
                     <p style={{ ...winFont, fontSize: '10px', color: '#555', marginTop: '8px' }}>Astuce : Laissez vide si non applicable.</p>
                   </div>

                   {/* Section 3: Qualification & Preuves */}
                   <div style={{ display: activeTab === 'quality' ? 'block' : 'none' }}>
                     <fieldset style={{ border: '1px solid #dfdfdf', padding: '12px' }}>
                       <legend style={{ ...winFont, background: '#c0c0c0', padding: '0 4px' }}>Qualification & Preuves</legend>
                       <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', alignItems: 'center' }}>
                          <label style={winFont}>Statut localité :</label>
                          <input name="statut_localite" defaultValue={editingArtist?.statut_localite || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} placeholder="ex: Actif Montpellier" />
                          <label style={winFont}>Source Type :</label>
                          <input name="source_type" defaultValue={editingArtist?.source_type || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                          <label style={winFont}>Source Localité :</label>
                          <input name="source_localite" defaultValue={editingArtist?.source_localite || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                          <label style={winFont}>Preuves :</label>
                          <input name="preuves" defaultValue={editingArtist?.preuves || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                          <label style={winFont}>Date preuve :</label>
                          <input name="date_preuve" defaultValue={editingArtist?.date_preuve || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} placeholder="JJ/MM/AAAA" />
                       </div>
                     </fieldset>
                   </div>

                   {/* Section 4: Notes & Admin */}
                   <div style={{ display: activeTab === 'admin' ? 'block' : 'none' }}>
                     <fieldset style={{ border: '1px solid #dfdfdf', padding: '12px' }}>
                       <legend style={{ ...winFont, background: '#c0c0c0', padding: '0 4px' }}>Notes & Administration</legend>
                       <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', alignItems: 'start' }}>
                          <label style={winFont}>Notes métier :</label>
                          <textarea name="notes" defaultValue={editingArtist?.notes || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none', height: '100px', resize: 'none' }} />
                          <label style={winFont}>Note perso :</label>
                          <input name="note_perso" defaultValue={editingArtist?.note_perso || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                          <label style={winFont}>Dernière vérif. :</label>
                          <input name="derniere_verification" defaultValue={editingArtist?.derniere_verification || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                          <label style={winFont}>Archive (true/empty):</label>
                          <input name="archive" defaultValue={editingArtist?.archive || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                       </div>
                     </fieldset>
                   </div>
                </div>

               <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', padding: '0 12px 12px 12px' }}>
                  <Win95Button type="submit" style={{ width: '80px', fontWeight: 'bold' }}>Enregistrer</Win95Button>
                  <Win95Button type="button" onClick={() => { setAddEditOpen(false); setActiveTab('general'); }} style={{ width: '80px' }}>Annuler</Win95Button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
