import { useState, useEffect, useCallback } from 'react'

const TYPE_ICONS = {
  save: '💾',
  restore: '⟲',
  delete: '🗑',
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return `il y a ${diff}s`
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function UndoHistory({ onRestore, onClose }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState(false)

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/history')
      const data = await res.json()
      setHistory(data.history || [])
    } catch (_) {
      setHistory([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const handleRestore = async () => {
    if (!confirm('Restaurer la dernière sauvegarde ? Les modifications actuelles seront perdues.')) return
    setRestoring(true)
    try {
      const res = await fetch('/api/restore-backup', { method: 'POST' })
      const data = await res.json()
      if (data.status === 'ok') {
        onRestore()
        onClose()
      }
    } catch (_) {
      alert('Erreur lors de la restauration')
    } finally {
      setRestoring(false)
    }
  }

  return (
    <div className="history-drawer" role="complementary">
      <div className="history-drawer-header">
        <h3>⟲ Historique</h3>
        <button className="btn-icon" onClick={onClose} title="Fermer">✕</button>
      </div>

      <div className="history-drawer-content">
        {loading ? (
          <div className="history-empty">Chargement…</div>
        ) : history.length === 0 ? (
          <div className="history-empty">
            <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
            <p>Aucune action enregistrée pour cette session.</p>
            <p style={{ fontSize: 11, marginTop: 4 }}>L'historique se remplit dès que tu modifies des données.</p>
          </div>
        ) : (
          <ul className="history-list">
            {history.map((item, i) => (
              <li key={i} className={`history-item ${i === 0 ? 'history-item-latest' : ''}`}>
                <span className="history-icon">{TYPE_ICONS[item.type] || '•'}</span>
                <div className="history-info">
                  <div className="history-label">{item.label}</div>
                  <div className="history-time">{timeAgo(item.timestamp)}</div>
                </div>
                {i === 0 && <span className="history-badge">Dernier</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="history-drawer-footer">
        <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8 }}>
          Le backup est le fichier <code>artistes_montpellier.backup.csv</code>
        </p>
        <button
          className="btn btn-secondary"
          onClick={handleRestore}
          disabled={restoring}
          style={{ width: '100%' }}
        >
          {restoring ? '⏳ Restauration…' : '⟲ Restaurer le dernier backup'}
        </button>
      </div>
    </div>
  )
}
