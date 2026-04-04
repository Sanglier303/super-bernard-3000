import React, { useState, useRef, useMemo } from "react";

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

export function ProjectManager({ projects, loading, saveProjects, onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStatus, setActiveStatus] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [addEditOpen, setAddEditOpen] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState(null)

  const winFont = { fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif', fontSize: '11px' };
  const sunken = { boxShadow: 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff, inset 2px 2px #808080, inset -2px -2px #dfdfdf' };
  const raised = { boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf' };

  const filteredProjects = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return (projects || []).filter(p => {
      const n = (p.nom || '').toLowerCase()
      const s = (p.statut || '').toLowerCase()
      const matchSearch = !q || n.includes(q) || s.includes(q)
      const matchStatus = !activeStatus || s === activeStatus.toLowerCase()
      return matchSearch && matchStatus
    })
  }, [projects, searchQuery, activeStatus])

  const statuses = ["À faire", "En cours", "Terminé", "En attente"]

  const handleAdd = () => {
    setEditingProjectId(null)
    setAddEditOpen(true)
  }

  const handleEdit = () => {
    if (!selectedProject) return
    setEditingProjectId(selectedProject._id)
    setAddEditOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedProject) return
    if (!window.confirm(`Supprimer le projet "${selectedProject.nom}" ?`)) return
    const updated = projects.filter(p => p._id !== selectedProject._id)
    setSelectedProject(null)
    await saveProjects(updated, `Suppression projet`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#c0c0c0' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 6px', borderBottom: '2px solid', borderColor: '#808080 #dfdfdf #dfdfdf #808080' }}>
        <Win95Button onClick={handleAdd}>Nouveau</Win95Button>
        <Win95Button onClick={handleEdit} disabled={!selectedProject}>Modifier</Win95Button>
        <Win95Button onClick={handleDelete} disabled={!selectedProject}>Supprimer</Win95Button>
        <div style={{ width: '1px', background: '#808080', height: '20px', margin: '0 4px', borderRight: '1px solid #fff' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Rechercher projet..."
          onMouseDown={e => e.stopPropagation()}
          style={{ ...winFont, ...sunken, border: 'none', background: '#fff', padding: '2px 4px', width: '150px', outline: 'none' }}
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

        {/* List View */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 2 }}>
          <div style={{ flex: 1, overflowY: 'auto', ...sunken, background: '#fff' }}>
            <table className="win95-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ position: 'sticky', top: 0, background: '#c0c0c0', zIndex: 1 }}>
                  <th style={{ textAlign: 'left', padding: '4px', borderRight: '1px solid #808080', borderBottom: '1px solid #808080' }}>Désignation</th>
                  <th style={{ textAlign: 'left', padding: '4px', borderRight: '1px solid #808080', borderBottom: '1px solid #808080' }}>Statut</th>
                  <th style={{ textAlign: 'left', padding: '4px', borderRight: '1px solid #808080', borderBottom: '1px solid #808080' }}>Priorité</th>
                  <th style={{ textAlign: 'left', padding: '4px', borderBottom: '1px solid #808080' }}>Échéance</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Chargement...</td></tr>
                ) : filteredProjects.length === 0 ? (
                   <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#808080' }}>Aucun projet.</td></tr>
                ) : filteredProjects.map((p, i) => (
                  <tr
                    key={p._id}
                    onClick={() => setSelectedProject(p)}
                    onDoubleClick={handleEdit}
                    style={{ background: selectedProject?._id === p._id ? '#000080' : i % 2 === 0 ? '#fff' : '#f4f4f4', color: selectedProject?._id === p._id ? '#fff' : '#000', cursor: 'default' }}
                  >
                    <td style={{ padding: '4px' }}>{p.nom}</td>
                    <td style={{ padding: '4px' }}>{p.statut}</td>
                    <td style={{ padding: '4px' }}>{p.priorite}</td>
                    <td style={{ padding: '4px' }}>{p.echeance || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer / Status bar */}
      <div className="win95-statusbar">
         <div className="win95-statusbar-panel" style={{ flex: 1 }}>{filteredProjects.length} projet(s) répertorié(s)</div>
         <div className="win95-statusbar-panel" style={{ width: '100px' }}>SB-3000</div>
      </div>

      {/* Add/Edit Modal */}
      {addEditOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, background: 'rgba(0,0,0,0.1)' }}>
          <div style={{ background: '#c0c0c0', ...raised, width: '420px', position: 'relative' }}>
            <TitleBar title={editingProjectId ? "Propriétés du Projet" : "Nouveau Projet (Workspace)"} onClose={() => setAddEditOpen(false)} />
            <form onSubmit={e => {
              e.preventDefault()
              const fd = new FormData(e.target)
              const data = Object.fromEntries(fd.entries())
              let updated
              if (editingProjectId) {
                updated = projects.map(p => p._id === editingProjectId ? { ...p, ...data } : p)
              } else {
                updated = [...projects, { _id: Date.now() + Math.random().toString(), ...data }]
              }
              setAddEditOpen(false)
              saveProjects(updated, editingProjectId ? `Édition : ${data.nom}` : `Nouveau : ${data.nom}`)
            }} style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '10px', alignItems: 'center' }}>
                <label style={winFont}>Nom :</label>
                <input name="nom" required defaultValue={editingProjectId ? projects.find(p=>p._id===editingProjectId)?.nom : ''} style={{ ...sunken, padding: '2px', ...winFont, border: 'none' }} />
                
                <label style={winFont}>Statut :</label>
                <select name="statut" defaultValue={editingProjectId ? projects.find(p=>p._id===editingProjectId)?.statut : 'À faire'} style={{ ...sunken, ...winFont, border: 'none' }}>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                
                <label style={winFont}>Priorité :</label>
                <select name="priorite" defaultValue={editingProjectId ? projects.find(p=>p._id===editingProjectId)?.priorite : 'Normale'} style={{ ...sunken, ...winFont, border: 'none' }}>
                  <option value="!!! Haute">!!! Haute</option>
                  <option value="Normale">Normale</option>
                  <option value="Faible">Faible</option>
                </select>
                
                <label style={winFont}>Échéance :</label>
                <input name="echeance" type="date" defaultValue={editingProjectId ? projects.find(p=>p._id===editingProjectId)?.echeance : ''} style={{ ...sunken, ...winFont, border: 'none', padding: '2px' }} />
                
                <label style={winFont}>Notes / Détails :</label>
                <textarea name="notes" defaultValue={editingProjectId ? projects.find(p=>p._id===editingProjectId)?.notes : ''} style={{ ...sunken, height: '80px', ...winFont, border: 'none', padding: '2px', resize: 'none' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #808080' }}>
                <Win95Button type="submit" style={{ width: '80px', fontWeight: 'bold' }}>Enregistrer</Win95Button>
                <Win95Button onClick={() => setAddEditOpen(false)} style={{ width: '80px' }}>Annuler</Win95Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
