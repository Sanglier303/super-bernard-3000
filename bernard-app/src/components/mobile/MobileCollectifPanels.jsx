import React from 'react'
import { MobileSummaryCard, MobileButton, MobileField } from './MobilePrimitives'

export function MobileCollectifDetail({ collectif, onClose, onQuickEdit }) {
  if (!collectif) return null

  const quickFacts = [
    { label: 'Style', value: collectif.style || '—' },
    { label: 'Création', value: collectif.date_creation || '—' },
    { label: 'Instagram', value: collectif.instagram ? 'Oui' : 'Non' },
    { label: 'Photo', value: collectif.photo ? 'Oui' : 'Non' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1900, background: '#c0c0c0', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ position: 'sticky', top: 0, background: '#000080', color: '#fff', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold' }}>Fiche collectif</div>
        <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
      </div>

      <div style={{ padding: '12px 12px 84px 12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
          <MobileButton onClick={() => collectif.instagram ? window.open(collectif.instagram, '_blank', 'noopener,noreferrer') : null} disabled={!collectif.instagram}>Instagram</MobileButton>
          <MobileButton primary onClick={() => onQuickEdit(collectif)}>⚡ Modifier</MobileButton>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <img src={collectif.photo || '/sanglier.png'} alt="" style={{ width: '92px', height: '92px', objectFit: 'cover', border: '2px solid #808080', background: '#ddd', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', lineHeight: 1.15 }}>{collectif.nom || 'Collectif'}</div>
            <div style={{ marginTop: '6px', fontSize: '13px', color: '#333' }}>{collectif.style || '—'}</div>
            <div style={{ marginTop: '4px', fontSize: '13px', color: '#444' }}>Création : {collectif.date_creation || '—'}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
          {quickFacts.map(item => <MobileSummaryCard key={item.label} label={item.label} value={item.value} />)}
        </div>

        <div style={{ display: 'grid', gap: '8px', background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px' }}>
          <div><b>Style :</b> {collectif.style || '—'}</div>
          <div><b>Date de création :</b> {collectif.date_creation || '—'}</div>
          <div><b>Instagram :</b> {collectif.instagram || '—'}</div>
        </div>

        <div style={{ background: '#eef3ff', border: '2px solid', borderColor: '#fff #5d78a6 #5d78a6 #fff', padding: '10px', fontSize: '13px' }}>
          <b>Repère réseau</b>
          <div style={{ marginTop: '4px' }}>{collectif.instagram ? 'Le collectif a déjà une présence Instagram exploitable.' : 'Le collectif n a pas encore de présence Instagram visible dans la base.'}</div>
        </div>

        {collectif.notes && (
          <div style={{ background: '#fff', border: '2px solid', borderColor: '#808080 #fff #fff #808080', padding: '10px', whiteSpace: 'pre-wrap', fontSize: '13px' }}>
            <b>Notes</b>
            <div style={{ marginTop: '6px' }}>{collectif.notes}</div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', paddingBottom: '12px' }}>
          <MobileButton onClick={onClose}>Retour</MobileButton>
        </div>
      </div>
    </div>
  )
}

export function MobileCollectifQuickEditSheet({ collectif, collectifs, onSave, onClose }) {
  if (!collectif) return null

  const inputStyle = {
    minHeight: '42px',
    border: '2px solid',
    borderColor: '#808080 #ffffff #ffffff #808080',
    background: '#fff',
    padding: '8px 10px',
    fontSize: '14px',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
  }

  const sectionStyle = {
    background: '#efefef',
    border: '2px solid',
    borderColor: '#fff #808080 #808080 #fff',
    padding: '10px',
    display: 'grid',
    gap: '10px',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const data = Object.fromEntries(fd.entries())
    const updated = collectifs.map(c =>
      String(c.id) === String(collectif.id)
        ? { ...c, ...data }
        : c
    )
    await onSave(updated, `Édition mobile collectif : ${collectif.nom || 'Collectif'}`)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', maxHeight: '92vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: '#c0c0c0', borderTop: '2px solid #fff', boxShadow: '0 -2px 0 #404040', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>⚡ Édition rapide collectif</div>
            <div style={{ fontSize: '12px', color: '#333' }}>{collectif.nom || 'Collectif'}</div>
          </div>
          <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Identité collectif</div>
            <MobileField label="Nom"><input name="nom" defaultValue={collectif.nom || ''} style={inputStyle} /></MobileField>
            <MobileField label="Style"><input name="style" defaultValue={collectif.style || ''} style={inputStyle} /></MobileField>
            <MobileField label="Date de création"><input name="date_creation" defaultValue={collectif.date_creation || ''} style={inputStyle} /></MobileField>
          </div>

          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Présence en ligne</div>
            <MobileField label="Instagram"><input name="instagram" defaultValue={collectif.instagram || ''} style={inputStyle} /></MobileField>
            <MobileField label="Photo (URL)"><input name="photo" defaultValue={collectif.photo || ''} style={inputStyle} /></MobileField>
          </div>

          <div style={sectionStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Notes</div>
            <MobileField label="Notes"><textarea name="notes" defaultValue={collectif.notes || ''} style={{ ...inputStyle, minHeight: '110px', resize: 'vertical' }} /></MobileField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginTop: '4px', paddingBottom: '8px' }}>
            <MobileButton type="button" onClick={onClose}>Annuler</MobileButton>
            <MobileButton type="submit" primary>Enregistrer</MobileButton>
          </div>
        </form>
      </div>
    </div>
  )
}
