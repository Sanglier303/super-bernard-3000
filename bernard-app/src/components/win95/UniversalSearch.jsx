import React, { useState, useMemo, useEffect, useRef } from "react";

const winFont = { fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif', fontSize: '11px' };
const raised = { boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf' };
const sunken = { boxShadow: 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff, inset 2px 2px #808080, inset -2px -2px #dfdfdf' };

export function UniversalSearch({ artists, collectifs, lieux, festivals, projects, notes, onClose, onOpenWindow }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    if (!query || query.trim().length < 2) return [];

    const q = query.toLowerCase();
    const res = [];

    // Search Artists
    (artists || []).forEach(a => {
      if ((a.nom_artiste || "").toLowerCase().includes(q) || (a.style || "").toLowerCase().includes(q)) {
        res.push({ type: "Artiste", label: a.nom_artiste, icon: "🗃", winId: "artistes" });
      }
    });

    // Search Collectifs
    (collectifs || []).forEach(c => {
      if ((c.nom || "").toLowerCase().includes(q) || (c.nom_collectif || "").toLowerCase().includes(q)) {
        res.push({ type: "Collectif", label: c.nom || c.nom_collectif, icon: "👥", winId: "collectifs" });
      }
    });

    // Search Lieux
    (lieux || []).forEach(l => {
      if ((l.nom || "").toLowerCase().includes(q) || (l.nom_structure || "").toLowerCase().includes(q)) {
        res.push({ type: "Lieu", label: l.nom || l.nom_structure, icon: "🏢", winId: "lieux" });
      }
    });

    // Search Festivals
    (festivals || []).forEach(f => {
      if ((f.nom || "").toLowerCase().includes(q) || (f.nom_festival || "").toLowerCase().includes(q)) {
        res.push({ type: "Festival", label: f.nom || f.nom_festival, icon: "🎪", winId: "festivals" });
      }
    });

    // Search Projects
    (projects || []).forEach(p => {
      if ((p.nom || "").toLowerCase().includes(q) || (p.notes || "").toLowerCase().includes(q)) {
        res.push({ type: "Projet", label: p.nom, icon: "📋", winId: "projets" });
      }
    });

    // Search Notes
    (notes || []).forEach(n => {
      if ((n.titre || "").toLowerCase().includes(q) || (n.contenu || "").toLowerCase().includes(q)) {
        res.push({ type: "Note", label: n.titre, icon: "📝", winId: "notepad" });
      }
    });

    return res.slice(0, 50); // limit to 50 results
  }, [query, artists, collectifs, lieux, festivals, projects, notes]);

  const handleResultClick = (res) => {
    onOpenWindow(res.winId);
    onClose();
  };

  return (
    <div
      className="win95-window"
      style={{
        position: 'absolute',
        bottom: '36px',
        left: '80px', // Just next to Start button, adjust depending on Taskbar layout
        width: '320px',
        maxHeight: '400px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        ...raised,
        background: '#c0c0c0',
        padding: '2px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ background: '#000080', color: 'white', padding: '4px', fontWeight: 'bold', ...winFont, display: 'flex', justifyContent: 'space-between' }}>
        <span>Recherche Universelle</span>
        <button onClick={onClose} style={{ ...raised, background: '#c0c0c0', color: 'black', border: 'none', padding: '0 4px', fontSize: '10px', cursor: 'pointer' }}>×</button>
      </div>
      
      <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tapez pour rechercher..."
          style={{ ...sunken, ...winFont, padding: '4px', width: '100%', outline: 'none' }}
        />
        
        <div style={{ flex: 1, overflowY: 'auto', ...sunken, background: '#fff', minHeight: '200px' }}>
          {query.trim().length < 2 ? (
            <div style={{ padding: '8px', color: '#808080', ...winFont, textAlign: 'center', marginTop: '20px' }}>
              Tapez au moins 2 caractères<br/>pour lancer la recherche.
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '8px', color: '#808080', ...winFont, textAlign: 'center', marginTop: '20px' }}>
              Aucun résultat trouvé.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {results.map((r, i) => (
                <li
                  key={i}
                  onClick={() => handleResultClick(r)}
                  style={{
                    padding: '4px 8px',
                    cursor: 'pointer',
                    ...winFont,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#000080'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'black'; }}
                >
                  <span style={{ fontSize: '14px' }}>{r.icon}</span>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold' }}>{r.label}</span>
                    <span style={{ fontSize: '9px', opacity: 0.8 }}>{r.type}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
