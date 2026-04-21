import React from 'react'
import { MobileSummaryCard, MobileButton, MobileField } from './MobilePrimitives'

export function MobileLieuDetail({ lieu, onClose, onQuickEdit }) {
  if (!lieu) return null

  const quickFacts = [
    { label: 'Type', value: lieu.type || '—' },
    { label: 'Capacité', value: lieu.capacite || '—' },
    { label: 'Instagram', value: lieu.instagram ? 'Oui' : 'Non' },
    { label: 'Photo', value: lieu.photo ? 'Oui' : 'Non' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1900, background: '#c0c0c0', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ position: 'sticky', top: 0, background: '#000080', color: '#fff', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold' }}>Fiche lieu</div>
        <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
      </div>

      <div style={{ padding: '12px 12px 84px 12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
          <MobileButton onClick={() => lieu.instagram ? window.open(lieu.instagram, '_blank', 'noopener,noreferrer') : null} disabled={!lieu.instagram}>Instagram</MobileButton>
          <MobileButton primary onClick={() => onQuickEdit(lieu)}>⚡ Modifier</MobileButton>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <img src={lieu.photo || '/sanglier.png'} alt="" style={{ width: '92px', height: '92px', objectFit: 'cover', border: '2px solid #808080', background: '#ddd', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', lineHeight: 1.15 }}>{lieu.nom || 'Lieu'}</div>
            <div style={{ marginTop: '6px', fontSize: '13px', color: '#333' }}>{lieu.type || '—'}</div>
            <div style={{ marginTop: '4px', fontSize: '13px', color: '#444' }}>{lieu.adresse || '—'}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
          {quickFacts.map(item => <MobileSummaryCard key={item.label} label={item.label} value={item.value} />)}
        </div>

        <div style={{ display: 'grid', gap: '8px', background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px' }}>
          <div><b>Adresse :</b> {lieu.adresse || '—'}</div>
          <div><b>Type :</b> {lieu.type || '—'}</div>
          <div><b>Capacité :</b> {lieu.capacite || '—'}</div>
          <div><b>Instagram :</b> {lieu.instagram || '—'}</div>
        </div>

        <div style={{ background: '#eef3ff', border: '2px solid', borderColor: '#fff #5d78a6 #5d78a6 #fff', padding: '10px', fontSize: '13px' }}>
          <b>Repère exploitation</b>
          <div style={{ marginTop: '4px' }}>{lieu.capacite ? `Capacité renseignée : ${lieu.capacite}.` : 'Capacité encore absente.'} {lieu.instagram ? 'Le lieu a un point de contact Instagram.' : 'Pas de point de contact Instagram visible.'}</div>
        </div>

        {lieu.notes && <div style={{ background: '#fff', border: '2px solid', borderColor: '#808080 #fff #fff #808080', padding: '10px', whiteSpace: 'pre-wrap', fontSize: '13px' }}><b>Notes</b><div style={{ marginTop: '6px' }}>{lieu.notes}</div></div>}
        {lieu.note_perso && <div style={{ background: '#fff7ff', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px', whiteSpace: 'pre-wrap', fontSize: '13px' }}><b>Note perso</b><div style={{ marginTop: '6px' }}>{lieu.note_perso}</div></div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
          <MobileButton onClick={onClose}>Retour</MobileButton>
        </div>
      </div>
    </div>
  )
}

export function MobileLieuQuickEditSheet({ lieu, lieux, onSave, onClose }) {
  if (!lieu) return null

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
    const updated = lieux.map(l => String(l.id) === String(lieu.id) ? { ...l, ...data } : l)
    await onSave(updated, `Édition mobile lieu : ${lieu.nom || 'Lieu'}`)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', maxHeight: '92vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: '#c0c0c0', borderTop: '2px solid #fff', boxShadow: '0 -2px 0 #404040', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div><div style={{ fontSize: '16px', fontWeight: 'bold' }}>⚡ Édition rapide lieu</div><div style={{ fontSize: '12px', color: '#333' }}>{lieu.nom || 'Lieu'}</div></div>
          <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Identité lieu</div>
            <MobileField label="Nom"><input name="nom" defaultValue={lieu.nom || ''} style={inputStyle} /></MobileField>
            <MobileField label="Type"><input name="type" defaultValue={lieu.type || ''} style={inputStyle} /></MobileField>
            <MobileField label="Capacité"><input name="capacite" defaultValue={lieu.capacite || ''} style={inputStyle} /></MobileField>
            <MobileField label="Adresse"><input name="adresse" defaultValue={lieu.adresse || ''} style={inputStyle} /></MobileField>
          </div>
          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Présence en ligne</div>
            <MobileField label="Instagram"><input name="instagram" defaultValue={lieu.instagram || ''} style={inputStyle} /></MobileField>
            <MobileField label="Photo (URL)"><input name="photo" defaultValue={lieu.photo || ''} style={inputStyle} /></MobileField>
          </div>
          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Notes</div>
            <MobileField label="Notes"><textarea name="notes" defaultValue={lieu.notes || ''} style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} /></MobileField>
            <MobileField label="Note perso"><textarea name="note_perso" defaultValue={lieu.note_perso || ''} style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} /></MobileField>
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
