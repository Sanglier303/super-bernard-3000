import React, { useState, useRef, useMemo } from "react";

function Win95Button({ children, onClick, active, disabled, style, type = "button" }) {
  const winFont = { fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif', fontSize: '11px' };
  const raised = { boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf' };
  const sunken = { boxShadow: 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff, inset 2px 2px #808080, inset -2px -2px #dfdfdf' };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      ...winFont, ...(active ? sunken : raised), background: '#c0c0c0', border: 'none',
      padding: '3px 8px', cursor: 'default', whiteSpace: 'nowrap',
      color: disabled ? '#808080' : active ? '#000080' : '#000',
      fontWeight: active ? 'bold' : 'normal', textShadow: disabled ? '1px 1px 0px #fff' : 'none', ...style
    }}>{children}</button>
  );
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
          <button key={i} onClick={btn === '×' ? onClose : undefined} style={{
            ...raised, background: '#c0c0c0', color: '#000', border: 'none', width: '16px', height: '14px',
            fontSize: '9px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
          }}>{btn}</button>
        ))}
      </div>
    </div>
  );
}

export function CollectifsWindow({ collectifs, loading, saveCollectifs, onRefresh }) {

  const [searchQuery, setSearchQuery] = useState('');
  const [activeStyle, setActiveStyle] = useState(null);
  const [selected, setSelected] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [showAvatars, setShowAvatars] = useState(true);
  const searchInputRef = useRef(null);

  const [editingId, setEditingId] = useState(null);
  const [addEditOpen, setAddEditOpen] = useState(false);

  const winFont = { fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif', fontSize: '11px' };
  const raised = { boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf' };
  const sunken = { boxShadow: 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff, inset 2px 2px #808080, inset -2px -2px #dfdfdf' };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return collectifs.filter(c => {
      if (c.archive === "true") return false;
      const n = (c.nom || '').toLowerCase();
      const s = (c.style || '').toLowerCase();
      const matchSearch = !q || n.includes(q) || s.includes(q);
      const matchStyle = !activeStyle || s.includes(activeStyle.toLowerCase());
      return matchSearch && matchStyle;
    });
  }, [collectifs, searchQuery, activeStyle]);

  const allStyles = Array.from(new Set(collectifs.flatMap(c => (c.style || '').split(/[/,]/).map(x => x.trim()).filter(Boolean)))).sort();

  const handleAdd = () => { setEditingId(null); setAddEditOpen(true); };
  const handleEdit = () => { if (!selected) return; setEditingId(selected._id); setAddEditOpen(true); };
  const handleDelete = async () => {
    if (!selected) return;
    if (!window.confirm(`Mettre "${selected.nom}" à la corbeille ?`)) return;
    const updated = collectifs.map(c => c._id === selected._id ? { ...c, archive: "true" } : c);
    setSelected(null);
    await saveCollectifs(updated, `Archivage collectif : ${selected.nom}`);
  };

  const exportCSV = () => {
    setOpenMenu(null);
    let csv = "Nom,Style,Date_Creation,Instagram,Notes\n";
    collectifs.forEach(c => {
      csv += `"${(c.nom||'').replace(/"/g,'""')}","${(c.style||'').replace(/"/g,'""')}","${(c.date_creation||'').replace(/"/g,'""')}","${(c.instagram||'').replace(/"/g,'""')}","${(c.notes||'').replace(/"/g,'""')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = "export_collectifs.csv"; link.click();
    URL.revokeObjectURL(url);
  };

  const COL = compactMode ? '0px 6px' : '10px 8px';
  const FS = compactMode ? '10px' : '12px';
  const AVATAR_SIZE = compactMode ? 14 : 48;
  const GRID = 'minmax(180px, 2fr) minmax(130px, 1.5fr) minmax(130px, 1.5fr) 100px';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#c0c0c0', position: 'relative' }}>
      {openMenu && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 199 }} onMouseDown={() => setOpenMenu(null)} />}

      {/* Menu bar */}
      <div className="win95-menubar" style={{ position: 'relative', zIndex: 200 }}>
        {['Fichier', 'Affichage', 'Recherche'].map(m => (
          <div key={m} className={`win95-menu-item ${openMenu === m ? 'active' : ''}`}
            onClick={() => setOpenMenu(openMenu === m ? null : m)}
            style={{ fontSize: '10px', padding: '2px 6px', background: openMenu === m ? '#000080' : 'transparent', color: openMenu === m ? '#fff' : '#000' }}>
            {m}
          </div>
        ))}
        {openMenu === 'Fichier' && (
          <div style={{ position: 'absolute', top: '100%', left: '2px', background: '#c0c0c0', padding: '2px', ...raised, display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
            <div className="win95-menu-item" style={{ fontSize: '11px', padding: '3px 12px' }} onClick={() => { setOpenMenu(null); handleAdd(); }}>Nouveau collectif</div>
            <div className="win95-menu-item" style={{ fontSize: '11px', padding: '3px 12px' }} onClick={exportCSV}>Exporter (CSV)</div>
          </div>
        )}
        {openMenu === 'Affichage' && (
          <div style={{ position: 'absolute', top: '100%', left: '44px', background: '#c0c0c0', padding: '2px', ...raised, display: 'flex', flexDirection: 'column', minWidth: '180px' }}>
            <div className="win95-menu-item" style={{ fontSize: '11px', padding: '3px 12px' }} onClick={() => { setOpenMenu(null); onRefresh?.(); }}>Actualiser (F5)</div>
            <div style={{ borderBottom: '1px solid #808080', borderTop: '1px solid #fff', margin: '2px 0' }} />
            <div className="win95-menu-item" style={{ fontSize: '11px', padding: '3px 12px', display: 'flex', gap: '6px' }} onClick={() => { setShowFilters(!showFilters); setOpenMenu(null); }}>
              <span style={{ width: '12px' }}>{showFilters ? '✔' : ''}</span> Afficher la sidebar
            </div>
            <div className="win95-menu-item" style={{ fontSize: '11px', padding: '3px 12px', display: 'flex', gap: '6px' }} onClick={() => { setCompactMode(!compactMode); setOpenMenu(null); }}>
              <span style={{ width: '12px' }}>{compactMode ? '✔' : ''}</span> Mode Compact
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
        <Win95Button onClick={handleEdit} disabled={!selected}>Modifier</Win95Button>
        <Win95Button onClick={handleDelete} disabled={!selected}>Supprimer</Win95Button>
        <div style={{ width: '1px', background: '#808080', height: '20px', margin: '0 4px', borderRight: '1px solid #fff' }} />
        <span style={{ ...winFont, color: '#444' }}>Rechercher :</span>
        <input ref={searchInputRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Nom, style..."
          style={{ ...winFont, ...sunken, border: 'none', background: '#fff', padding: '2px 4px', width: '180px', outline: 'none' }} />
        <Win95Button onClick={() => setSearchQuery('')}>Effacer</Win95Button>
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {showFilters && (
          <div style={{ width: '180px', borderRight: '2px solid', borderColor: '#808080 #dfdfdf #dfdfdf #808080', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ ...winFont, fontWeight: 'bold', padding: '4px 6px', background: '#000080', color: '#fff', fontSize: '10px' }}>INDEX / STYLES</div>
            <div style={{ overflowY: 'auto', flex: 1, background: '#fff', ...sunken, margin: '2px' }}>
              <div onClick={() => setActiveStyle(null)} style={{ ...winFont, padding: '2px 8px', cursor: 'default', display: 'flex', justifyContent: 'space-between', background: !activeStyle ? '#000080' : 'transparent', color: !activeStyle ? '#fff' : '#000' }}>
                <span>Tous</span><span style={{ color: !activeStyle ? '#adf' : '#666' }}>[{collectifs.length}]</span>
              </div>
              {allStyles.map(s => {
                const count = collectifs.filter(c => (c.style || '').toLowerCase().includes(s.toLowerCase())).length;
                const isActive = activeStyle === s;
                return (
                  <div key={s} onClick={() => setActiveStyle(s)} style={{ ...winFont, padding: '2px 8px', cursor: 'default', display: 'flex', justifyContent: 'space-between', background: isActive ? '#000080' : 'transparent', color: isActive ? '#fff' : '#000' }}>
                    <span>{s}</span><span style={{ color: isActive ? '#adf' : '#666' }}>[{count}]</span>
                  </div>
                );
              })}
            </div>
            <div style={{ borderTop: '2px solid', borderColor: '#808080 #dfdfdf #dfdfdf #808080', padding: '6px', background: '#c0c0c0' }}>
              <div style={{ ...sunken, background: '#fff', padding: '6px' }}>
                <div style={{ ...winFont, fontSize: '10px' }}>Collectifs : <b>{collectifs.length}</b></div>
                <div style={{ ...winFont, fontSize: '10px' }}>Styles : <b>{allStyles.length}</b></div>
              </div>
            </div>
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, padding: 2 }}>
          <div style={{ overflowX: 'auto', flex: 1, display: 'flex', flexDirection: 'column', ...sunken, background: '#fff' }}>
            <div style={{ display: 'grid', gridTemplateColumns: GRID, ...raised, background: '#c0c0c0', flexShrink: 0 }}>
              {['Nom du Collectif', 'Style', 'Date Création', 'Instagram'].map((h, i) => (
                <div key={i} style={{ ...winFont, fontWeight: 'bold', padding: '3px 6px', borderRight: '1px solid #808080', borderBottom: '1px solid #808080', fontSize: '11px', cursor: 'default', userSelect: 'none' }}>{h}</div>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ ...winFont, padding: '20px', textAlign: 'center', color: '#000080' }}>Chargement...</div>
              ) : filtered.length === 0 ? (
                <div style={{ ...winFont, padding: '20px', color: '#808080', textAlign: 'center' }}>Aucun résultat.</div>
              ) : filtered.map((c, idx) => {
                const isSel = selected?._id === c._id;
                return (
                  <div key={c._id} onDoubleClick={() => { setSelected(c); handleEdit(); }} onClick={() => setSelected(c)}
                    style={{ display: 'grid', gridTemplateColumns: GRID, background: isSel ? '#000080' : idx % 2 === 0 ? '#fff' : '#f4f4f4', color: isSel ? '#fff' : '#000', cursor: 'default', borderBottom: '1px solid #e0e0e0' }}>
                    <div style={{ ...winFont, padding: COL, borderRight: '1px dotted #ccc', display: 'flex', alignItems: 'center', gap: compactMode ? '4px' : '10px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {showAvatars && <img src={c.photo || '/sanglier.png'} style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, objectFit: 'cover', flexShrink: 0, background: '#ccc', border: compactMode ? 'none' : '1px solid #808080' }} alt="" />}
                      {!showAvatars && <span style={{ fontSize: compactMode ? '10px' : '12px' }}>▶</span>}
                      <span style={{ fontSize: FS }}>{c.nom || ''}</span>
                    </div>
                    <div style={{ ...winFont, padding: COL, borderRight: '1px dotted #ccc', fontSize: FS, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center' }}>{c.style || ''}</div>
                    <div style={{ ...winFont, padding: COL, borderRight: '1px dotted #ccc', fontSize: FS, color: isSel ? '#cce' : '#666', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center' }}>{c.date_creation || ''}</div>
                    <div style={{ padding: COL, display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {c.instagram && <a href={c.instagram} target="_blank" onClick={e => e.stopPropagation()} style={{ ...raised, ...winFont, background: '#c0c0c0', color: '#000', textDecoration: 'none', padding: '1px 3px', fontSize: '9px', fontWeight: 'bold' }}>IG</a>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="win95-statusbar">
        <div className="win95-statusbar-panel">{filtered.length} élément(s)</div>
        <div className="win95-statusbar-panel" style={{ flex: 1 }}>
          {selected ? `Sélectionné : ${selected.nom} — Double-cliquer pour éditer` : 'Prêt'}
        </div>
      </div>

      {/* ADD/EDIT DIALOG */}
      {addEditOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div style={{ background: '#c0c0c0', ...raised, width: '420px', maxHeight: '90vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <TitleBar title={editingId ? "Modifier le collectif" : "Nouveau Collectif"} onClose={() => setAddEditOpen(false)} />
            <form onSubmit={e => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const data = Object.fromEntries(fd.entries());
              let updated;
              if (editingId) {
                updated = collectifs.map(c => c._id === editingId ? { ...c, ...data } : c);
              } else {
                updated = [...collectifs, { _id: Date.now() + Math.random().toString(), ...data }];
              }
              setAddEditOpen(false);
              saveCollectifs(updated, editingId ? `Édition : ${data.nom}` : `Ajout : ${data.nom}`);
            }} style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '6px', alignItems: 'center' }}>
                {[['Nom :', 'nom'], ['Style musical :', 'style'], ['Date de création :', 'date_creation'], ['Instagram :', 'instagram'], ['Photo (URL) :', 'photo']].map(([label, name]) => (
                  <React.Fragment key={name}>
                    <label style={winFont}>{label}</label>
                    <input name={name} defaultValue={editingId ? collectifs.find(c => c._id === editingId)?.[name] : ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                  </React.Fragment>
                ))}
                <label style={winFont}>Notes :</label>
                <textarea name="notes" defaultValue={editingId ? collectifs.find(c => c._id === editingId)?.notes : ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none', height: '60px' }} />
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
  );
}
