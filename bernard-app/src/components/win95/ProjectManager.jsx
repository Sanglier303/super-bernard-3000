import React, { useState, useMemo } from "react";
import { sunken, winFont, Win95Button } from "./ArtistWindowCommon";
import { ProjectFormModal } from "./ProjectFormModal";
import { ProjectStatusSidebar } from "./ProjectStatusSidebar";
import { ProjectTableView } from "./ProjectTableView";
import { ProjectKanbanView } from "./ProjectKanbanView";
import { PROJECT_STATUSES, getEntityName as getProjectEntityName, getProjectLinkedId } from "./ProjectManagerUtils";

export function ProjectManager({ projects, artists, collectifs, lieux, festivals, loading, saveProjects, onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStatus, setActiveStatus] = useState(null)
  const [addEditOpen, setAddEditOpen] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
  const [dragOverStatus, setDragOverStatus] = useState(null);


  const selectedProject = useMemo(() => 
    (projects || []).find(p => String(p.id) === String(selectedProjectId)), 
    [projects, selectedProjectId]
  );

  const filteredProjects = useMemo(() => {
    const q = (searchQuery || '').toLowerCase();
    const activeStatusNormalized = (activeStatus || '').toLowerCase();
    return (projects || []).filter(p => {
      // Archive filter
      if (p.archive === "true") return false;
      
      const n = (p.nom || '').toLowerCase();
      const s = (p.statut || '').toLowerCase();
      const matchSearch = !q || n.includes(q);
      const matchStatus = !activeStatusNormalized || s === activeStatusNormalized;
      return matchSearch && matchStatus;
    });
  }, [projects, searchQuery, activeStatus])

  const statuses = PROJECT_STATUSES

  const handleDragStart = (e, project) => {
    e.stopPropagation();
    const pid = String(project.id);
    
    // Set standard and custom MIME types
    e.dataTransfer.setData("text/plain", pid);
    e.dataTransfer.setData("application/x-project-id", pid);
    
    // Configure drag appearance and behavior
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.dropEffect = "move";
    
    // Set active state
    setSelectedProjectId(project.id);
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

    const project = (projects || []).find(p => String(p.id) === String(projectId));
    if (project) {
      if (project.statut !== newStatus) {
        console.log(`Kanban: Moving ${project.nom} (${projectId}) to ${newStatus}`);
        const updated = projects.map(p => String(p.id) === String(projectId) ? { ...p, statut: newStatus } : p);
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
    setEditingProjectId(selectedProject.id)
    setAddEditOpen(true)
  }

  const handleDelete = () => {
    if (!selectedProject) return;
    if (!window.confirm(`Voulez-vous envoyer "${selectedProject.nom}" à la corbeille ?`)) return;
    
    const updated = (projects || []).map(p => 
      String(p.id) === String(selectedProject.id) ? { ...p, archive: "true" } : p
    );
    saveProjects(updated, `Archivage projet: ${selectedProject.nom}`);
    setSelectedProjectId(null);
  };

  const getEntityName = (type, id) => getProjectEntityName(type, id, artists, collectifs, lieux, festivals);

  const normalizeProject = (project) => {
    if (!project) return project;
    const linked_id = getProjectLinkedId(project);
    return {
      ...project,
      linked_id,
    };
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
        <ProjectStatusSidebar statuses={statuses} activeStatus={activeStatus} setActiveStatus={setActiveStatus} />

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 2, overflow: 'hidden' }}>
          {viewMode === 'table' ? (
            <ProjectTableView
              loading={loading}
              filteredProjects={filteredProjects}
              selectedProjectId={selectedProjectId}
              setSelectedProjectId={setSelectedProjectId}
              handleEdit={handleEdit}
              getEntityName={getEntityName}
            />
          ) : (
            <ProjectKanbanView
              statuses={statuses}
              filteredProjects={filteredProjects}
              dragOverStatus={dragOverStatus}
              onDragOver={onDragOver}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              handleDrop={handleDrop}
              handleDragStart={handleDragStart}
              handleDragEnd={handleDragEnd}
              selectedProjectId={selectedProjectId}
              setSelectedProjectId={setSelectedProjectId}
              getEntityName={getEntityName}
            />
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
          project={editingProjectId ? projects.find(p => String(p.id) === String(editingProjectId)) : null}
          artists={artists}
          collectifs={collectifs}
          lieux={lieux}
          festivals={festivals}
          onSave={(data) => {
             let updated
             let savedProjectId
             if (editingProjectId) {
               savedProjectId = editingProjectId
               updated = projects.map(p => String(p.id) === String(editingProjectId) ? normalizeProject({ ...p, ...data }) : normalizeProject(p))
             } else {
               savedProjectId = crypto.randomUUID?.() || Date.now().toString()
               updated = [...projects.map(normalizeProject), normalizeProject({ id: savedProjectId, ...data })]
               setSearchQuery('')
               setActiveStatus(null)
             }
             setSelectedProjectId(savedProjectId)
             setAddEditOpen(false)
             saveProjects(updated, editingProjectId ? `Édition : ${data.nom}` : `Nouveau : ${data.nom}`)
          }}
          onCancel={() => setAddEditOpen(false)}
        />
      )}
    </div>
  )
}
