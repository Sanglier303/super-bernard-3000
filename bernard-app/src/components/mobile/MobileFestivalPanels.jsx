import React from 'react'
import { MobileSummaryCard, MobileButton, MobileField } from './MobilePrimitives'

export function MobileFestivalDetail({ festival, onClose, onQuickEdit }) {
  if (!festival) return null

  const quickFacts = [
    { label: 'Période', value: festival.periode || '—' },
    { label: 'Durée', value: festival.duree || '—' },
    { label: 'Instagram', value: festival.instagram ? 'Oui' : 'Non' },
    { label: 'Photo', value: festival.photo ? 'Oui' : 'Non' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1900, background: '#c0c0c0', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ position: 'sticky', top: 0, background: '#000080', color: '#fff', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold' }}>Fiche festival</div>
        <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
      </div>
      <div style={{ padding: '12px 12px 84px 12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <img src={festival.photo || '/sanglier.png'} alt="" style={{ width: '92px', height: '92px', objectFit: 'cover', border: '2px solid #808080', background: '#ddd', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', lineHeight: 1.15 }}>{festival.nom || 'Festival'}</div>
            <div style={{ marginTop: '6px', fontSize: '13px', color: '#333' }}>{festival.style || '—'}</div>
            <div style={{ marginTop: '4px', fontSize: '13px', color: '#444' }}>{festival.lieu || '—'}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {quickFacts.map(item => <MobileSummaryCard key={item.label} label={item.label} value={item.value} />)}
        </div>
        <div style={{ display: 'grid', gap: '8px', background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px' }}>
          <div><b>Lieu :</b> {festival.lieu || '—'}</div>
          <div><b>Style :</b> {festival.style || '—'}</div>
          <div><b>Période :</b> {festival.periode || '—'}</div>
          <div><b>Durée :</b> {festival.duree || '—'}</div>
          <div><b>Instagram :</b> {festival.instagram || '—'}</div>
        </div>
        {festival.notes && <div style={{ background: '#fff', border: '2px solid', borderColor: '#808080 #fff #fff #808080', padding: '10px', whiteSpace: 'pre-wrap', fontSize: '13px' }}><b>Notes</b><div style={{ marginTop: '6px' }}>{festival.notes}</div></div>}
        {festival.note_perso && <div style={{ background: '#fff7ff', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px', whiteSpace: 'pre-wrap', fontSize: '13px' }}><b>Note perso</b><div style={{ marginTop: '6px' }}>{festival.note_perso}</div></div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <MobileButton onClick={() => festival.instagram ? window.open(festival.instagram, '_blank', 'noopener,noreferrer') : null} disabled={!festival.instagram}>Instagram</MobileButton>
          <MobileButton primary onClick={() => onQuickEdit(festival)}>⚡ Modifier</MobileButton>
          <MobileButton onClick={onClose}>Retour</MobileButton>
        </div>
      </div>
    </div>
  )
}

export function MobileFestivalQuickEditSheet({ festival, festivals, onSave, onClose }) {
  if (!festival) return null

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
    const updated = festivals.map(f => String(f.id) === String(festival.id) ? { ...f, ...data } : f)
    await onSave(updated, `Édition mobile festival : ${festival.nom || 'Festival'}`)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', maxHeight: '92vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: '#c0c0c0', borderTop: '2px solid #fff', boxShadow: '0 -2px 0 #404040', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div><div style={{ fontSize: '16px', fontWeight: 'bold' }}>⚡ Édition rapide festival</div><div style={{ fontSize: '12px', color: '#333' }}>{festival.nom || 'Festival'}</div></div>
          <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Identité festival</div>
            <MobileField label="Nom"><input name="nom" defaultValue={festival.nom || ''} style={inputStyle} /></MobileField>
            <MobileField label="Style"><input name="style" defaultValue={festival.style || ''} style={inputStyle} /></MobileField>
            <MobileField label="Lieu"><input name="lieu" defaultValue={festival.lieu || ''} style={inputStyle} /></MobileField>
            <MobileField label="Période"><input name="periode" defaultValue={festival.periode || ''} style={inputStyle} /></MobileField>
            <MobileField label="Durée"><input name="duree" defaultValue={festival.duree || ''} style={inputStyle} /></MobileField>
          </div>
          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Présence en ligne</div>
            <MobileField label="Instagram"><input name="instagram" defaultValue={festival.instagram || ''} style={inputStyle} /></MobileField>
            <MobileField label="Photo (URL)"><input name="photo" defaultValue={festival.photo || ''} style={inputStyle} /></MobileField>
          </div>
          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Notes</div>
            <MobileField label="Notes"><textarea name="notes" defaultValue={festival.notes || ''} style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} /></MobileField>
            <MobileField label="Note perso"><textarea name="note_perso" defaultValue={festival.note_perso || ''} style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} /></MobileField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingBottom: '8px' }}>
            <MobileButton type="button" onClick={onClose}>Annuler</MobileButton>
            <MobileButton type="submit" primary>Enregistrer</MobileButton>
          </div>
        </form>
      </div>
    </div>
  )
}
