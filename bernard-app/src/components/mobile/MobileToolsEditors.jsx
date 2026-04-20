import React from 'react'
import { MobileButton, MobileField } from './MobilePrimitives'
import { makeId } from './MobileDataUtils'

export function MobileNoteEditSheet({ note, notes, onSave, onClose }) {
  const inputStyle = {
    minHeight: '42px',
    border: '2px solid',
    borderColor: '#808080 #ffffff #ffffff #808080',
    background: '#fff',
    padding: '8px 10px',
    fontSize: '14px',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const data = Object.fromEntries(fd.entries())
    const now = new Date().toISOString().slice(0, 10)
    let updated

    if (note?.id) {
      updated = notes.map(n => String(n.id) === String(note.id) ? { ...n, ...data, date_derniere_modif: now } : n)
    } else {
      updated = [...notes, { id: makeId(), archive: '', ...data, date_derniere_modif: now }]
    }

    await onSave(updated, `${note?.id ? 'Édition' : 'Ajout'} note mobile : ${data.titre || 'Sans titre'}`)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', maxHeight: '92vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: '#c0c0c0', borderTop: '2px solid #fff', boxShadow: '0 -2px 0 #404040', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div><div style={{ fontSize: '16px', fontWeight: 'bold' }}>📝 Note mobile</div><div style={{ fontSize: '12px', color: '#333' }}>{note?.titre || 'Nouvelle note'}</div></div>
          <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <MobileField label="Titre"><input name="titre" defaultValue={note?.titre || ''} style={inputStyle} /></MobileField>
          <MobileField label="Contenu"><textarea name="contenu" defaultValue={note?.contenu || ''} style={{ ...inputStyle, minHeight: '180px', resize: 'vertical' }} /></MobileField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingBottom: '8px' }}>
            <MobileButton type="button" onClick={onClose}>Annuler</MobileButton>
            <MobileButton type="submit" primary>Enregistrer</MobileButton>
          </div>
        </form>
      </div>
    </div>
  )
}

export function MobileTodoEditSheet({ todo, todos, onSave, onClose }) {
  const inputStyle = {
    minHeight: '42px',
    border: '2px solid',
    borderColor: '#808080 #ffffff #ffffff #808080',
    background: '#fff',
    padding: '8px 10px',
    fontSize: '14px',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const data = Object.fromEntries(fd.entries())
    let updated

    if (todo?.id) {
      updated = todos.map(t => String(t.id) === String(todo.id) ? { ...t, ...data } : t)
    } else {
      updated = [...todos, { id: makeId(), archive: '', complete: '', date_creation: new Date().toISOString().slice(0, 10), ...data }]
    }

    await onSave(updated, `${todo?.id ? 'Édition' : 'Ajout'} todo mobile : ${data.texte || 'Sans texte'}`)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', maxHeight: '92vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: '#c0c0c0', borderTop: '2px solid #fff', boxShadow: '0 -2px 0 #404040', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div><div style={{ fontSize: '16px', fontWeight: 'bold' }}>✅ Todo mobile</div><div style={{ fontSize: '12px', color: '#333' }}>{todo?.texte || 'Nouveau todo'}</div></div>
          <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <MobileField label="Texte"><textarea name="texte" defaultValue={todo?.texte || ''} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} /></MobileField>
          <MobileField label="Statut">
            <select name="complete" defaultValue={todo?.complete || ''} style={inputStyle}>
              <option value="">À faire</option>
              <option value="true">Fait</option>
            </select>
          </MobileField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingBottom: '8px' }}>
            <MobileButton type="button" onClick={onClose}>Annuler</MobileButton>
            <MobileButton type="submit" primary>Enregistrer</MobileButton>
          </div>
        </form>
      </div>
    </div>
  )
}

export function MobileStickyEditSheet({ sticky, stickies, onSave, onClose }) {
  const inputStyle = {
    minHeight: '42px',
    border: '2px solid',
    borderColor: '#808080 #ffffff #ffffff #808080',
    background: '#fff8a6',
    padding: '8px 10px',
    fontSize: '14px',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const data = Object.fromEntries(fd.entries())
    let updated

    if (sticky?.id) {
      updated = stickies.map(s => String(s.id) === String(sticky.id) ? { ...s, ...data } : s)
    } else {
      updated = [...stickies, { id: makeId(), archive: '', ...data }]
    }

    await onSave(updated, `${sticky?.id ? 'Édition' : 'Ajout'} sticky mobile`)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', maxHeight: '92vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: '#c0c0c0', borderTop: '2px solid #fff', boxShadow: '0 -2px 0 #404040', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div><div style={{ fontSize: '16px', fontWeight: 'bold' }}>📌 Sticky mobile</div><div style={{ fontSize: '12px', color: '#333' }}>{sticky?.text ? 'Modifier sticky' : 'Nouveau sticky'}</div></div>
          <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <MobileField label="Texte"><textarea name="text" defaultValue={sticky?.text || ''} style={{ ...inputStyle, minHeight: '180px', resize: 'vertical' }} /></MobileField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingBottom: '8px' }}>
            <MobileButton type="button" onClick={onClose}>Annuler</MobileButton>
            <MobileButton type="submit" primary>Enregistrer</MobileButton>
          </div>
        </form>
      </div>
    </div>
  )
}
