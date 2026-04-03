import { useState, useEffect, useRef } from 'react'

function ArtistModal({ artist, headers, fieldLabels, onSave, onClose }) {
  const isEdit = !!artist
  const overlayRef = useRef(null)

  // Initialize form data
  const [form, setForm] = useState(() => {
    const initial = {}
    headers.forEach((h) => {
      initial[h] = artist ? artist[h] || '' : ''
    })
    // Default verification date to today for new artists
    if (!artist) {
      initial.derniere_verification = new Date().toISOString().split('T')[0]
    }
    return initial
  })

  // Focus first input on mount
  useEffect(() => {
    const firstInput = document.querySelector('.modal-body input')
    if (firstInput) firstInput.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose()
  }

  // Fields that should be full-width (textareas)
  const wideFields = ['source_localite', 'notes']
  // Notes gets extra rows
  const getRows = (field) => field === 'notes' ? 6 : 2
  // Fields that are URLs
  const urlFields = ['instagram', 'facebook', 'soundcloud', 'bandcamp', 'spotify', 'site_officiel']

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>{isEdit ? `✏️ Éditer — ${artist.nom_artiste}` : '＋ Nouvel artiste'}</h2>
          <button className="btn-icon" onClick={onClose} title="Fermer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {headers.map((h) => {
              const label = fieldLabels[h] || h
              const isWide = wideFields.includes(h)
              const isUrl = urlFields.includes(h)

              return (
                <div key={h} className={`field ${isWide ? 'full-width' : ''}`}>
                  <label htmlFor={`field-${h}`}>{label}</label>
                  {isWide ? (
                    <textarea
                      id={`field-${h}`}
                      value={form[h]}
                      onChange={(e) => handleChange(h, e.target.value)}
                      rows={getRows(h)}
                      placeholder={h === 'notes' ? 'Contexte, remarques, statut du contact…' : ''}
                    />
                  ) : (
                    <input
                      id={`field-${h}`}
                      type={isUrl ? 'url' : h === 'derniere_verification' ? 'date' : 'text'}
                      value={form[h]}
                      onChange={(e) => handleChange(h, e.target.value)}
                      placeholder={isUrl ? 'https://...' : ''}
                    />
                  )}
                </div>
              )
            })}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" id="btn-save-artist">
              {isEdit ? '💾 Enregistrer' : '＋ Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ArtistModal
