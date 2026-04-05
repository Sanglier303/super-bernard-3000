import React, { useState, useMemo } from "react";

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
        color: disabled ? '#808080' : '#000',
        ...style
      }}
    >
      {children}
    </button>
  );
}

export function TrashWindow({ 
  projects, notes, todos, artists, collectifs, lieux, festivals,
  saveProjects, saveNotes, saveTodos, saveArtists, saveCollectifs, saveLieux, saveFestivals
}) {
  const [selectedItem, setSelectedItem] = useState(null);

  const winFont = { fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif', fontSize: '11px' };
  const sunken = { boxShadow: 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff, inset 2px 2px #808080, inset -2px -2px #dfdfdf' };
  const raised = { boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf' };

  const archivedItems = useMemo(() => {
    const items = [];
    (projects || []).filter(p => p.archive === "true").forEach(p => items.push({ ...p, _type: 'projets', _label: 'Projet', _name: p.nom || 'Sans nom' }));
    (notes || []).filter(n => n.archive === "true").forEach(n => items.push({ ...n, _type: 'notes', _label: 'Note', _name: n.titre || 'Sans titre' }));
    (todos || []).filter(t => t.archive === "true").forEach(t => items.push({ ...t, _type: 'todos', _label: 'Todo', _name: t.texte || 'Tâche' }));
    (artists || []).filter(a => a.archive === "true").forEach(a => items.push({ ...a, _type: 'artistes', _label: 'Artiste', _name: a.nom_artiste || a.nom || 'Artiste' }));
    (collectifs || []).filter(c => c.archive === "true").forEach(c => items.push({ ...c, _type: 'collectifs', _label: 'Collectif', _name: c.nom || 'Collectif' }));
    (lieux || []).filter(l => l.archive === "true").forEach(l => items.push({ ...l, _type: 'lieux', _label: 'Lieu', _name: l.nom || 'Lieu' }));
    (festivals || []).filter(f => f.archive === "true").forEach(f => items.push({ ...f, _type: 'festivals', _label: 'Festival', _name: f.nom || 'Festival' }));
    return items;
  }, [projects, notes, todos, artists, collectifs, lieux, festivals]);

  const handleRestore = () => {
    if (!selectedItem) return;
    const type = selectedItem._type;
    const collectionMap = { 
      'projets': { list: projects, save: saveProjects }, 
      'notes': { list: notes, save: saveNotes }, 
      'todos': { list: todos, save: saveTodos }, 
      'artistes': { list: artists, save: saveArtists }, 
      'collectifs': { list: collectifs, save: saveCollectifs }, 
      'lieux': { list: lieux, save: saveLieux }, 
      'festivals': { list: festivals, save: saveFestivals } 
    };
    const { list, save } = collectionMap[type] || {};
    if (!list || !save) return;
    
    const updated = list.map(item => 
      String(item._id) === String(selectedItem._id) ? { ...item, archive: "false" } : item
    );
    
    save(updated);
    setSelectedItem(null);
  };

  const handleDeletePermanently = () => {
    if (!selectedItem) return;
    if (!window.confirm(`Supprimer définitivement "${selectedItem._name}" ?`)) return;
    const type = selectedItem._type;
    const collectionMap = { 
      'projets': { list: projects, save: saveProjects }, 
      'notes': { list: notes, save: saveNotes }, 
      'todos': { list: todos, save: saveTodos }, 
      'artistes': { list: artists, save: saveArtists }, 
      'collectifs': { list: collectifs, save: saveCollectifs }, 
      'lieux': { list: lieux, save: saveLieux }, 
      'festivals': { list: festivals, save: saveFestivals } 
    };
    const { list, save } = collectionMap[type] || {};
    if (!list || !save) return;
    
    const updated = list.filter(item => String(item._id) !== String(selectedItem._id));
    
    save(updated);
    setSelectedItem(null);
  };

  const handleEmptyTrash = () => {
    if (!window.confirm("Vider TOUTE la corbeille ? Cette action est irréversible.")) return;
    
    const collectionMap = { 
      'projets': { list: projects, save: saveProjects }, 
      'notes': { list: notes, save: saveNotes }, 
      'todos': { list: todos, save: saveTodos }, 
      'artistes': { list: artists, save: saveArtists }, 
      'collectifs': { list: collectifs, save: saveCollectifs }, 
      'lieux': { list: lieux, save: saveLieux }, 
      'festivals': { list: festivals, save: saveFestivals } 
    };
    
    Object.keys(collectionMap).forEach(type => {
      const { list, save } = collectionMap[type];
      const updated = list.filter(item => item.archive !== "true");
      if (list.length !== updated.length) {
        save(updated);
      }
    });
    
    setSelectedItem(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#c0c0c0', padding: '2px' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '4px', padding: '4px', borderBottom: '1px solid #808080' }}>
        <Win95Button onClick={handleRestore} disabled={!selectedItem}>Restaurer</Win95Button>
        <Win95Button onClick={handleDeletePermanently} disabled={!selectedItem}>Supprimer définitivement</Win95Button>
        <div style={{ flex: 1 }} />
        <Win95Button onClick={handleEmptyTrash} disabled={archivedItems.length === 0}>Vider la corbeille</Win95Button>
      </div>

      {/* List Area */}
      <div style={{ flex: 1, margin: '4px', background: '#fff', ...sunken, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ position: 'sticky', top: 0, background: '#c0c0c0', textAlign: 'left' }}>
              <th style={{ padding: '4px', borderRight: '1px solid #808080', borderBottom: '1px solid #808080' }}>Nom</th>
              <th style={{ padding: '4px', borderRight: '1px solid #808080', borderBottom: '1px solid #808080' }}>Type</th>
              <th style={{ padding: '4px', borderBottom: '1px solid #808080' }}>Détails</th>
            </tr>
          </thead>
          <tbody>
            {archivedItems.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#808080', ...winFont }}>
                  La corbeille est vide.
                </td>
              </tr>
            ) : (
              archivedItems.map((item, idx) => (
                <tr 
                  key={`${item._type}-${item._id}`}
                  onClick={() => setSelectedItem(item)}
                  style={{ 
                    background: selectedItem?._id === item._id && selectedItem?._type === item._type ? '#000080' : idx % 2 === 0 ? '#fff' : '#f4f4f4',
                    color: selectedItem?._id === item._id && selectedItem?._type === item._type ? '#fff' : '#000',
                    cursor: 'default'
                  }}
                >
                  <td style={{ padding: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <img src={item.photo || "/sanglier.png"} style={{ width: 16, height: 16, objectFit: 'cover' }} alt="" />
                    {item._name}
                  </td>
                  <td style={{ padding: '4px' }}>{item._label}</td>
                  <td style={{ padding: '4px', fontSize: '9px', opacity: 0.8 }}>
                    {item._type === 'projets' ? item.statut : item._type === 'notes' ? item.date_derniere_modif : item._type === 'todos' ? item.texte : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Status */}
      <div className="win95-statusbar">
        <div className="win95-statusbar-panel" style={{ flex: 1 }}>{archivedItems.length} objet(s) dans la corbeille</div>
      </div>
    </div>
  );
}
