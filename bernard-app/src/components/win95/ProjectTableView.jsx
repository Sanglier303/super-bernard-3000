import React from "react";
import { getProjectLinkedId } from "./ProjectManagerUtils";

export function ProjectTableView({
  loading,
  filteredProjects,
  selectedProjectId,
  setSelectedProjectId,
  handleEdit,
  getEntityName,
}) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', boxShadow: 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff, inset 2px 2px #808080, inset -2px -2px #dfdfdf', background: '#fff' }}>
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
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              onDoubleClick={handleEdit}
              style={{
                background: String(selectedProjectId) === String(p.id) ? '#000080' : i % 2 === 0 ? '#fff' : '#f4f4f4',
                color: String(selectedProjectId) === String(p.id) ? '#fff' : '#000',
                cursor: 'default'
              }}
            >
              <td style={{ padding: '4px' }}>{p.nom}</td>
              <td style={{ padding: '4px' }}>{p.statut}</td>
              <td style={{ padding: '4px' }}>{p.priorite}</td>
              <td style={{ padding: '4px' }}>
                {p.linked_type && getProjectLinkedId(p) ? (
                  <span title={`Lié à: ${p.linked_type}`} style={{ color: String(selectedProjectId) === String(p.id) ? '#fff' : '#000080' }}>
                    🔗 {getEntityName(p.linked_type, getProjectLinkedId(p))}
                  </span>
                ) : '—'}
              </td>
              <td style={{ padding: '4px' }}>{p.echeance || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
