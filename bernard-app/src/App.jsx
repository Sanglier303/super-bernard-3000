import { useState, useCallback, useEffect } from 'react'
import { Desktop } from './components/win95/Desktop'

// --- OS Additional Window Contents ---
function StatsContent({ artists, onClose }) {
  const stats = {
    byStyle: new Map()
  };
  
  artists.forEach(a => {
    if (!a.style) return;
    const cat = a.style.split("/")[0].trim();
    stats.byStyle.set(cat, (stats.byStyle.get(cat) ?? 0) + 1);
  });
  
  const topStyles = [...stats.byStyle.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <div style={{ background: "#c0c0c0", padding: "12px", height: "100%", overflow: "auto", fontSize: "11px", fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif' }}>
      <div className="win95-groupbox" style={{ marginBottom: "10px" }}>
        <span className="win95-groupbox-label">Total base</span>
        <div style={{ fontSize: "28px", fontWeight: "bold", textAlign: "center", color: "#000080" }}>{artists.length}</div>
        <div style={{ textAlign: "center", fontSize: "10px" }}>artistes répertoriés</div>
      </div>
      
      <div className="win95-groupbox" style={{ marginBottom: "10px" }}>
        <span className="win95-groupbox-label">Top catégories</span>
        {topStyles.map(([k, v]) => (
          <div key={k} className="flex items-center gap-2" style={{ marginTop: "3px" }}>
            <span style={{ width: "120px", fontSize: "9px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k}</span>
            <div className="win95-progress" style={{ flex: 1 }}>
              <div className="win95-progress-fill" style={{ width: `${(v / artists.length) * 100}%` }} />
            </div>
            <span style={{ width: "30px", textAlign: "right", fontSize: "10px" }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
         <button className="win95-btn" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

function CategoryContent({ category, artists }) {
  const items = artists.filter(a => a.style && a.style.split("/")[0].trim() === category);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#c0c0c0", fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif' }}>
      <div className="win95-menubar">
        <span className="win95-menu-item" style={{ fontSize: "10px" }}>📁 {category}</span>
        <span className="win95-menu-item" style={{ fontSize: "10px" }}>{items.length} artiste{items.length > 1 ? "s" : ""}</span>
      </div>
      <div className="win95-sunken" style={{ flex: 1, overflow: "auto", background: "white", margin: "4px" }}>
        <table className="win95-table" style={{ fontSize: "10px" }}>
          <thead>
            <tr style={{ position: "sticky", top: 0, background: "#c0c0c0", zIndex: 1 }}>
              <th>Artiste</th><th>Sous-genre</th><th>Zone</th><th>Type</th>
            </tr>
          </thead>
          <tbody>
            {items.map(a => (
              <tr key={a._id || a.id} style={{ cursor: "pointer" }}>
                <td><strong>{a.nom_artiste || a.nom}</strong></td>
                <td style={{ maxWidth: "120px" }}>{a.sous_genre || "—"}</td>
                <td>{a.zone}</td>
                <td>{a.type_performance || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function App() {
  const [artists, setArtists] = useState([])
  const [collectifs, setCollectifs] = useState([])
  const [lieux, setLieux] = useState([])
  const [festivals, setFestivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }, [])

  // ─── Data API ───
  const fetchGeneric = useCallback(async (type, setter) => {
    try {
      const res = await fetch('/api/data/' + type)
      const data = await res.json()
      setter(data.data || [])
      return data.data
    } catch {
      showToast('Erreur de chargement')
      return []
    }
  }, [showToast])

  const loadAll = useCallback(async () => {
    // Note: loading is true by default
    await Promise.all([
      fetchGeneric('artistes', setArtists),
      fetchGeneric('collectifs', setCollectifs),
      fetchGeneric('lieux', setLieux),
      fetchGeneric('festivals', setFestivals)
    ]);
    setLoading(false)
  }, [fetchGeneric])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadAll() }, [loadAll])

  const saveData = async (type, updatedData, actionLabel) => {
    try {
      const clean = updatedData.map(item => {
        const { _id, ...rest } = item;
        void _id; // Mark as used
        return rest;
      })
      const res = await fetch('/api/data/' + type, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headers: [], data: clean, actionLabel }), // backend reconstructs headers if we just pass data
      })
      const data = await res.json()
      if (data.status === 'ok') {
        showToast(`✅ Sauvegardé`)
        await loadAll()
      } else {
        showToast('Erreur serveur.')
      }
    } catch {
      showToast('Erreur réseau.')
    }
  }

  return (
    <>
      <Desktop 
        artists={artists}
        collectifs={collectifs}
        lieux={lieux}
        festivals={festivals}
        onRefresh={loadAll}
        saveData={saveData}
        loading={loading}
        renderStatsContent={({ onClose }) => <StatsContent artists={artists} onClose={onClose} />}
        renderCategoryContent={(categoryId) => <CategoryContent category={categoryId} artists={artists} />}
        renderAboutContent={({ onClose }) => (
          <div style={{ background: "#c0c0c0", padding: "16px", fontSize: "11px", height: "100%", overflow: "auto", fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif' }}>
            <div className="flex items-start gap-3 mb-4">
              <div style={{ fontSize: "48px" }}>🎵</div>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>Super Bernard 3000</div>
                <div style={{ fontSize: "10px", opacity: 0.7 }}>Version 1.0.0 (build 19950801)</div>
                <div style={{ fontSize: "10px", opacity: 0.7 }}>© 1995–2026 Base de Données Musique</div>
              </div>
            </div>
            <div className="win95-sunken" style={{ background: "white", padding: "8px", fontSize: "10px", lineHeight: "1.5", marginBottom: "12px" }}>
              <p>Logiciel d'archivage ultime.</p>
              <br />
              <p>Ce programme documente les DJs, producteurs et artistes live basés dans la région.</p>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button className="win95-btn win95-btn-primary" onClick={onClose}>OK</button>
            </div>
          </div>
        )}
      />

      {/* TOAST SYSTEM ALERTS */}
      {toast && (
        <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999, padding: '2px' }} className="win95-raised">
          <div className="win95-titlebar" style={{ fontSize: '9px', padding: '1px 3px' }}>Alerte système</div>
          <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', background: '#c0c0c0', fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif' }}>
             <span style={{ fontSize: '18px' }}>ℹ️</span>
             {toast}
          </div>
        </div>
      )}
    </>
  )
}
