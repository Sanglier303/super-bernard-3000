import React from 'react'
import { MobileSummaryCard, MobileButton, MobileField } from './MobilePrimitives'
import { getProjectFlags } from './MobileDataUtils'

export function MobileProjectDetail({ project, onClose, onQuickEdit }) {
  if (!project) return null

  const { isUrgent, isDone, isDoing, isTodo } = getProjectFlags(project)

  const quickFacts = [
    { label: 'Statut', value: project.statut || '—' },
    { label: 'Priorité', value: project.priorite || '—' },
    { label: 'Échéance', value: project.echeance || '—' },
    { label: 'Lien', value: project.linked_type ? `${project.linked_type}${project.linked_id ? ` #${project.linked_id}` : ''}` : '—' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1900, background: '#c0c0c0', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ position: 'sticky', top: 0, background: '#000080', color: '#fff', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold' }}>Fiche projet</div>
        <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
      </div>
      <div style={{ padding: '12px 12px 84px 12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
          <MobileButton primary onClick={() => onQuickEdit(project)}>⚡ Modifier</MobileButton>
          <MobileButton onClick={onClose}>Retour</MobileButton>
        </div>

        <div style={{ background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', lineHeight: 1.15 }}>{project.nom || 'Projet'}</div>
            <div style={{ fontSize: '11px', padding: '3px 7px', background: isDone ? '#dff0d8' : isUrgent ? '#f8d7da' : isDoing ? '#fff3cd' : '#fff', border: '1px solid', borderColor: isDone ? '#5b8a3c' : isUrgent ? '#a40000' : isDoing ? '#b58900' : '#808080' }}>
              {isDone ? 'Fait' : isUrgent ? 'Urgent' : isDoing ? 'En cours' : isTodo ? 'À faire' : (project.statut || 'À faire')}
            </div>
          </div>
          <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {project.priorite && <span style={{ fontSize: '11px', padding: '2px 6px', background: isUrgent ? '#f8d7da' : '#fff', border: '1px solid', borderColor: isUrgent ? '#a40000' : '#808080' }}>{project.priorite}</span>}
            {project.echeance && <span style={{ fontSize: '11px', padding: '2px 6px', background: '#fff', border: '1px solid #808080' }}>⏱ {project.echeance}</span>}
            {project.linked_type && <span style={{ fontSize: '11px', padding: '2px 6px', background: '#eef3ff', border: '1px solid #5d78a6' }}>↪ {project.linked_type}{project.linked_id ? ` #${project.linked_id}` : ''}</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
          {quickFacts.map(item => <MobileSummaryCard key={item.label} label={item.label} value={item.value} />)}
        </div>

        <div style={{ display: 'grid', gap: '8px', background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px' }}>
          <div><b>Statut :</b> {project.statut || '—'}</div>
          <div><b>Priorité :</b> {project.priorite || '—'}</div>
          <div><b>Échéance :</b> {project.echeance || '—'}</div>
          <div><b>Type lié :</b> {project.linked_type || '—'}</div>
          <div><b>ID lié :</b> {project.linked_id || '—'}</div>
        </div>

        {project.linked_type && (
          <div style={{ background: '#eef3ff', border: '2px solid', borderColor: '#fff #5d78a6 #5d78a6 #fff', padding: '10px', fontSize: '13px' }}>
            <b>Lien interne</b>
            <div style={{ marginTop: '4px' }}>{project.linked_type}{project.linked_id ? ` #${project.linked_id}` : ''}</div>
          </div>
        )}

        {project.notes && (
          <div style={{ background: '#fff', border: '2px solid', borderColor: '#808080 #fff #fff #808080', padding: '10px', whiteSpace: 'pre-wrap', fontSize: '13px' }}>
            <b>Notes</b>
            <div style={{ marginTop: '6px' }}>{project.notes}</div>
          </div>
        )}

      </div>
    </div>
  )
}

export function MobileProjectQuickEditSheet({ project, projects, onSave, onClose }) {
  if (!project) return null

  const inputStyle = {
    minHeight: '42px',
    border: '2px solid',
    borderColor: '#808080 #ffffff #ffffff #808080',
    background: '#fff',
    padding: '8px 10px',
    fontSize: '14px',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
  }
  const sectionStyle = { background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px', display: 'grid', gap: '10px' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const data = Object.fromEntries(fd.entries())
    const updated = projects.map(p => String(p.id) === String(project.id) ? { ...p, ...data } : p)
    await onSave(updated, `Édition mobile projet : ${project.nom || 'Projet'}`)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', maxHeight: '92vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: '#c0c0c0', borderTop: '2px solid #fff', boxShadow: '0 -2px 0 #404040', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div><div style={{ fontSize: '16px', fontWeight: 'bold' }}>⚡ Édition rapide projet</div><div style={{ fontSize: '12px', color: '#333' }}>{project.nom || 'Projet'}</div></div>
          <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Pilotage projet</div>
            <MobileField label="Nom"><input name="nom" defaultValue={project.nom || ''} style={inputStyle} /></MobileField>
            <MobileField label="Statut"><input name="statut" defaultValue={project.statut || ''} style={inputStyle} /></MobileField>
            <MobileField label="Priorité"><input name="priorite" defaultValue={project.priorite || ''} style={inputStyle} /></MobileField>
            <MobileField label="Échéance"><input name="echeance" defaultValue={project.echeance || ''} style={inputStyle} /></MobileField>
          </div>
          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Liens internes</div>
            <MobileField label="Type lié"><input name="linked_type" defaultValue={project.linked_type || ''} style={inputStyle} /></MobileField>
            <MobileField label="ID lié"><input name="linked_id" defaultValue={project.linked_id || ''} style={inputStyle} /></MobileField>
          </div>
          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Notes</div>
            <MobileField label="Notes"><textarea name="notes" defaultValue={project.notes || ''} style={{ ...inputStyle, minHeight: '110px', resize: 'vertical' }} /></MobileField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', paddingBottom: '8px' }}>
            <MobileButton type="button" onClick={onClose}>Annuler</MobileButton>
            <MobileButton type="submit" primary>Enregistrer</MobileButton>
          </div>
        </form>
      </div>
    </div>
  )
}
