import React, { useState, useMemo } from "react";

// Reuse Win95 style helpers
function Win95Button({ children, onClick, active, disabled, style, type = "button" }) {
  const winFont = { fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif', fontSize: '11px' };
  const raised = { boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf' };
  const sunken = { boxShadow: 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff, inset 2px 2px #808080, inset -2px -2px #dfdfdf' };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseDown={e => e.stopPropagation()} // Prevent window drag when clicking buttons
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
    <div className="win95-titlebar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000080', color: 'white', padding: '2px 4px', fontWeight: 'bold', fontSize: '11px' }}>
      <div className="flex items-center gap-1 overflow-hidden">
        <span>{title}</span>
      </div>
      <div className="flex items-center gap-0.5">
        {['×'].map((btn, i) => (
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

function ProjectFormModal({ project, onSave, onCancel, artists, collectifs, lieux, festivals }) {
  const winFont = { fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif', fontSize: '11px' };
  const sunken = { boxShadow: 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff, inset 2px 2px #808080, inset -2px -2px #dfdfdf' };
  const raised = { boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf' };
  
  const [type, setType] = useState(project?.linked_type || '');
  const [linkedId, setLinkedId] = useState(project?.linked_id || '');

  const entities = useMemo(() => {
    if (type === 'Artiste') return artists || [];
    if (type === 'Collectif') return collectifs || [];
    if (type === 'Lieu') return lieux || [];
    if (type === 'Festival') return festivals || [];
    return [];
  }, [type, artists, collectifs, lieux, festivals]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    data.linked_type = type;
    data.linked_id = linkedId;
    onSave(data);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, background: 'rgba(0,0,0,0.1)' }}>
      <div style={{ background: '#c0c0c0', ...raised, width: '440px', position: 'relative' }}>
        <TitleBar title={project ? "Propriétés du Projet" : "Nouveau Projet (Workspace)"} onClose={onCancel} />
        <form onSubmit={handleSubmit} style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '8px', alignItems: 'center' }}>
            <label style={winFont}>Nom :</label>
            <input name="nom" required defaultValue={project?.nom || ''} style={{ ...sunken, padding: '2px', ...winFont, border: 'none' }} />
            
            <label style={winFont}>Statut :</label>
            <select name="statut" defaultValue={project?.statut || 'À faire'} style={{ ...sunken, ...winFont, border: 'none' }}>
              {["À faire", "En cours", "Terminé", "En attente"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            
            <label style={winFont}>Priorité :</label>
            <select name="priorite" defaultValue={project?.priorite || 'Normale'} style={{ ...sunken, ...winFont, border: 'none' }}>
              <option value="!!! Haute">!!! Haute</option>
              <option value="Normale">Normale</option>
              <option value="Faible">Faible</option>
            </select>
            
            <label style={winFont}>Échéance :</label>
            <input name="echeance" type="date" defaultValue={project?.echeance || ''} style={{ ...sunken, ...winFont, border: 'none', padding: '2px' }} />
            
            <div style={{ gridColumn: '1 / span 2', borderTop: '1px solid #808080', borderBottom: '1px solid #fff', margin: '4px 0' }} />
            
            <label style={winFont}>Lié à (Type) :</label>
            <select value={type} onChange={e => { setType(e.target.value); setLinkedId(''); }} style={{ ...sunken, ...winFont, border: 'none' }}>
              <option value="">Aucun</option>
              <option value="Artiste">Artiste</option>
              <option value="Collectif">Collectif</option>
              <option value="Lieu">Lieu</option>
              <option value="Festival">Festival</option>
            </select>

            <label style={winFont}>Entité :</label>
            <select value={linkedId} onChange={e => setLinkedId(e.target.value)} disabled={!type} style={{ ...sunken, ...winFont, border: 'none', background: type ? '#fff' : '#dfdfdf' }}>
              <option value="">-- Sélectionner --</option>
              {entities.map(ent => (
                <option key={ent._id} value={ent._id}>
                  {ent.nom_artiste || ent.nom_collectif || ent.nom_structure || ent.nom_festival || 'Inconnu'}
                </option>
              ))}
            </select>

            <div style={{ gridColumn: '1 / span 2', borderTop: '1px solid #808080', borderBottom: '1px solid #fff', margin: '4px 0' }} />

            <label style={winFont}>Notes :</label>
            <textarea name="notes" defaultValue={project?.notes || ''} style={{ ...sunken, height: '60px', ...winFont, border: 'none', padding: '2px', resize: 'none' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #808080' }}>
            <Win95Button type="submit" style={{ width: '80px', fontWeight: 'bold' }}>Enregistrer</Win95Button>
            <Win95Button onClick={onCancel} style={{ width: '80px' }}>Annuler</Win95Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function ProjectManager({ projects, artists, collectifs, lieux, festivals, loading, saveProjects, onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStatus, setActiveStatus] = useState(null)
  const [addEditOpen, setAddEditOpen] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
  const [dragOverStatus, setDragOverStatus] = useState(null);

  const winFont = { fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif', fontSize: '11px' };
  const sunken = { boxShadow: 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff, inset 2px 2px #808080, inset -2px -2px #dfdfdf' };
  const raised = { boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf' };

  const selectedProject = useMemo(() => 
    (projects || []).find(p => String(p._id) === String(selectedProjectId)), 
    [projects, selectedProjectId]
  );

  const filteredProjects = useMemo(() => {
    const q = (searchQuery || '').toLowerCase();
    return (projects || []).filter(p => {
      // Archive filter
      if (p.archive === "true") return false;
      
      const n = (p.nom || '').toLowerCase();
      const s = (p.statut || '').toLowerCase();
      const matchSearch = !q || n.includes(q);
      const matchStatus = !activeStatus || s === activeStatus;
      return matchSearch && matchStatus;
    });
  }, [projects, searchQuery, activeStatus])

  const statuses = ["À faire", "En cours", "En attente", "Terminé"]

  const handleDragStart = (e, project) => {
    e.stopPropagation();
    const pid = String(project._id);
    
    // Set standard and custom MIME types
    e.dataTransfer.setData("text/plain", pid);
    e.dataTransfer.setData("application/x-project-id", pid);
    
    // Configure drag appearance and behavior
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.dropEffect = "move";
    
    // Set active state
    setSelectedProjectId(project._id);
    console.log("Kanban: dragStart", pid, project.nom);
  };

  const handleDragEnd = () => {
    setDragOverStatus(null);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverStatus(null);
    
    let projectId = e.dataTransfer.getData("application/x-project-id") || 
                    e.dataTransfer.getData("text/plain");
    
    // Fallback if dataTransfer was cleared or intercepted
    if (!projectId || projectId === "drag") {
      projectId = String(selectedProjectId);
    }

    if (!projectId || projectId === "null" || projectId === "undefined") {
      console.warn("Kanban: No valid project ID found for drop");
      return;
    }

    const project = (projects || []).find(p => String(p._id) === String(projectId));
    if (project) {
      if (project.statut !== newStatus) {
        console.log(`Kanban: Moving ${project.nom} (${projectId}) to ${newStatus}`);
        const updated = projects.map(p => String(p._id) === String(projectId) ? { ...p, statut: newStatus } : p);
        saveProjects(updated, `Déplacement Kanban : ${project.nom} -> ${newStatus}`);
      }
    } else {
      console.warn("Kanban: Project not found for ID", projectId);
    }
  };

  const onDragOver = (e, status) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragOverStatus !== status) {
      setDragOverStatus(status);
    }
    e.dataTransfer.dropEffect = "move";
  };
  
  const onDragEnter = (e, status) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverStatus(status);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // We only clear if we are leaving the column itself, not a child
    // but in simple Win95 UI, resetting to null is usually fine as DragOver will set it back
    // However, checking relatedTarget is more robust
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverStatus(null);
    }
  };

  const handleAdd = () => {
    setEditingProjectId(null)
    setAddEditOpen(true)
  }

  const handleEdit = () => {
    if (!selectedProject) return
    setEditingProjectId(selectedProject._id)
    setAddEditOpen(true)
  }

  const handleDelete = () => {
    if (!selectedProject) return;
    if (!window.confirm(`Voulez-vous envoyer "${selectedProject.nom}" à la corbeille ?`)) return;
    
    const updated = (projects || []).map(p => 
      String(p._id) === String(selectedProject._id) ? { ...p, archive: "true" } : p
    );
    saveProjects(updated, `Archivage projet: ${selectedProject.nom}`);
    setSelectedProjectId(null);
  };

  const getEntityName = (type, id) => {
    if (!type || !id) return '';
    if (type === 'Artiste') return artists?.find(a => String(a._id) === String(id))?.nom_artiste || 'Inconnu';
    if (type === 'Collectif') return collectifs?.find(c => String(c._id) === String(id))?.nom_collectif || 'Inconnu';
    if (type === 'Lieu') return lieux?.find(l => String(l._id) === String(id))?.nom_structure || 'Inconnu';
    if (type === 'Festival') return festivals?.find(f => String(f._id) === String(id))?.nom_festival || 'Inconnu';
    return type;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#c0c0c0' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 6px', borderBottom: '2px solid', borderColor: '#808080 #dfdfdf #dfdfdf #808080' }}>
        <Win95Button onClick={handleAdd}>Nouveau</Win95Button>
        <Win95Button onClick={handleEdit} disabled={!selectedProject}>Modifier</Win95Button>
        <Win95Button onClick={handleDelete} disabled={!selectedProject}>Supprimer</Win95Button>
        <div style={{ width: '1px', background: '#808080', height: '20px', margin: '0 4px', borderRight: '1px solid #fff' }} />
        <Win95Button onClick={() => setViewMode('table')} active={viewMode === 'table'}>Tableau</Win95Button>
        <Win95Button onClick={() => setViewMode('kanban')} active={viewMode === 'kanban'}>Kanban</Win95Button>
        <div style={{ width: '1px', background: '#808080', height: '20px', margin: '0 4px', borderRight: '1px solid #fff' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Rechercher..."
          onMouseDown={e => e.stopPropagation()}
          style={{ ...winFont, ...sunken, border: 'none', background: '#fff', padding: '2px 4px', width: '120px', outline: 'none' }}
        />
        <Win95Button onClick={onRefresh}>Actualiser</Win95Button>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <div style={{ width: '140px', borderRight: '2px solid', borderColor: '#808080 #dfdfdf #dfdfdf #808080', display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...winFont, fontWeight: 'bold', padding: '4px 6px', background: '#000080', color: '#fff', fontSize: '10px' }}>STAGES</div>
          <div style={{ overflowY: 'auto', flex: 1, background: '#fff', ...sunken, margin: '2px' }}>
            <div 
              onClick={() => setActiveStatus(null)} 
              style={{ ...winFont, padding: '2px 8px', cursor: 'default', background: !activeStatus ? '#000080' : 'transparent', color: !activeStatus ? '#fff' : '#000' }}
            >
              Tous les projets
            </div>
            {statuses.map(s => (
              <div 
                key={s} 
                onClick={() => setActiveStatus(s)} 
                style={{ ...winFont, padding: '2px 8px', cursor: 'default', background: activeStatus === s ? '#000080' : 'transparent', color: activeStatus === s ? '#fff' : '#000' }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 2, overflow: 'hidden' }}>
          {viewMode === 'table' ? (
            <div style={{ flex: 1, overflowY: 'auto', ...sunken, background: '#fff' }}>
              <table className="win95-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ position: 'sticky', top: 0, background: '#c0c0c0', zIndex: 1 }}>
                    <th style={{ textAlign: 'left', padding: '4px', borderRight: '1px solid #808080', borderBottom: '1px solid #808080' }}>Désignation</th>
                    <th style={{ textAlign: 'left', padding: '4px', borderRight: '1px solid #808080', borderBottom: '1px solid #808080' }}>Statut</th>
                    <th style={{ textAlign: 'left', padding: '4px', borderRight: '1px solid #808080', borderBottom: '1px solid #808080' }}>Priorité</th>
                    <th style={{ textAlign: 'left', padding: '4px', borderRight: '1px solid #808080', borderBottom: '1px solid #808080' }}>Lien</th>
                    <th style={{ textAlign: 'left', padding: '4px', borderBottom: '1px solid #808080' }}>Échéance</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Chargement...</td></tr>
                  ) : filteredProjects.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#808080' }}>Aucun projet.</td></tr>
                  ) : filteredProjects.map((p, i) => (
                    <tr
                      key={p._id}
                      onClick={() => setSelectedProjectId(p._id)}
                      onDoubleClick={handleEdit}
                      style={{ 
                        background: String(selectedProjectId) === String(p._id) ? '#000080' : i % 2 === 0 ? '#fff' : '#f4f4f4', 
                        color: String(selectedProjectId) === String(p._id) ? '#fff' : '#000', 
                        cursor: 'default' 
                      }}
                    >
                      <td style={{ padding: '4px' }}>{p.nom}</td>
                      <td style={{ padding: '4px' }}>{p.statut}</td>
                      <td style={{ padding: '4px' }}>{p.priorite}</td>
                      <td style={{ padding: '4px' }}>
                        {p.linked_type && p.linked_id ? (
                          <span title={`Lié à: ${p.linked_type}`} style={{color: String(selectedProjectId) === String(p._id) ? '#fff' : '#000080'}}>
                            🔗 {getEntityName(p.linked_type, p.linked_id)}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '4px' }}>{p.echeance || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', gap: '4px', overflowX: 'auto', padding: '2px' }}>
              {statuses.map(status => (
                <div 
                  key={status} 
                  onDragOver={(e) => onDragOver(e, status)}
                  onDragEnter={(e) => onDragEnter(e, status)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => handleDrop(e, status)}
                  style={{ 
                    width: '180px', 
                    minWidth: '180px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    ...sunken, 
                    background: dragOverStatus === status ? '#ffffcc' : '#dfdfdf',
                    outline: dragOverStatus === status ? '2px dashed #000080' : 'none',
                    outlineOffset: '-4px',
                    transition: 'background 0.1s'
                  }}
                >
                  <div style={{ ...winFont, fontWeight: 'bold', padding: '4px', background: '#000080', color: '#fff', textAlign: 'center' }}>
                    {status}
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {filteredProjects.filter(p => (p.statut || '') === status).map(p => (
                      <div
                        key={p._id}
                        className="win95-raised"
                        draggable
                        onDragStart={(e) => handleDragStart(e, p)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedProjectId(p._id)}
                        data-id={p._id}
                        style={{ 
                          ...raised, 
                          background: String(selectedProjectId) === String(p._id) ? '#000080' : '#fff', 
                          color: String(selectedProjectId) === String(p._id) ? '#fff' : '#000',
                          padding: "8px", 
                          cursor: "grab",
                          fontSize: "11px",
                          position: 'relative'
                        }}
                      >
                        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{p.nom}</div>
                        <div style={{ fontSize: '9px', opacity: 0.8 }}>{p.priorite}</div>
                        {p.linked_type && (
                          <div style={{ fontSize: '9px', marginTop: '2px', color: String(selectedProjectId) === String(p._id) ? '#ccf' : '#000080' }}>
                            🔗 {getEntityName(p.linked_type, p.linked_id)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer / Status bar */}
      <div className="win95-statusbar">
         <div className="win95-statusbar-panel" style={{ flex: 1 }}>{filteredProjects.length} projet(s) répertorié(s)</div>
         <div className="win95-statusbar-panel" style={{ width: '100px' }}>SB-3000</div>
      </div>

      {/* Add/Edit Modal */}
      {addEditOpen && (
        <ProjectFormModal
          project={editingProjectId ? projects.find(p => p._id === editingProjectId) : null}
          artists={artists}
          collectifs={collectifs}
          lieux={lieux}
          festivals={festivals}
          onSave={(data) => {
             let updated
             if (editingProjectId) {
               updated = projects.map(p => p._id === editingProjectId ? { ...p, ...data } : p)
             } else {
               updated = [...projects, { _id: Date.now() + Math.random().toString(), ...data }]
             }
             setAddEditOpen(false)
             saveProjects(updated, editingProjectId ? `Édition : ${data.nom}` : `Nouveau : ${data.nom}`)
          }}
          onCancel={() => setAddEditOpen(false)}
        />
      )}
    </div>
  )
}
