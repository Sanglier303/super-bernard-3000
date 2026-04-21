import React from "react";
import { raised, sunken, winFont } from "./ArtistWindowCommon";
import { getProjectLinkedId } from "./ProjectManagerUtils";

export function ProjectKanbanView({
  statuses,
  filteredProjects,
  dragOverStatus,
  onDragOver,
  onDragEnter,
  onDragLeave,
  handleDrop,
  handleDragStart,
  handleDragEnd,
  selectedProjectId,
  setSelectedProjectId,
  getEntityName,
}) {
  return (
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
                key={p.id}
                className="win95-raised"
                draggable
                onDragStart={(e) => handleDragStart(e, p)}
                onDragEnd={handleDragEnd}
                onClick={() => setSelectedProjectId(p.id)}
                data-id={p.id}
                style={{
                  ...raised,
                  background: String(selectedProjectId) === String(p.id) ? '#000080' : '#fff',
                  color: String(selectedProjectId) === String(p.id) ? '#fff' : '#000',
                  padding: '8px',
                  cursor: 'grab',
                  fontSize: '11px',
                  position: 'relative'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{p.nom}</div>
                <div style={{ fontSize: '9px', opacity: 0.8 }}>{p.priorite}</div>
                {p.linked_type && getProjectLinkedId(p) && (
                  <div style={{ fontSize: '9px', marginTop: '2px', color: String(selectedProjectId) === String(p.id) ? '#ccf' : '#000080' }}>
                    🔗 {getEntityName(p.linked_type, getProjectLinkedId(p))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
