import React, { useState, useMemo } from "react";

const STYLE_ICONS = {
  techno: "🗂", "hard techno": "📁", house: "📂", electro: "💾", psy: "🌀", dnb: "🥁", default: "📄",
};

function styleIcon(s) {
  for (const k of Object.keys(STYLE_ICONS)) {
    if (s.toLowerCase().includes(k)) return STYLE_ICONS[k];
  }
  return STYLE_ICONS.default;
}

export function StartMenu({ onOpen, onClose, mascotEnabled, onToggleMascot, artists }) {
  const categories = useMemo(() => {
    const map = new Map();
    artists.forEach(a => {
      if (!a.style) return;
      const cat = a.style.split("/")[0].trim();
      map.set(cat, (map.get(cat) ?? 0) + 1);
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [artists]);

  const [activeSub, setActiveSub] = useState(null); // 'cat', 'databases' or 'workspace'

  return (
    <div
      className="win95-window"
      style={{
        position: "fixed", bottom: "30px", left: "2px", zIndex: 100,
        width: "220px",
        userSelect: "none",
        display: "flex",
        flexDirection: "row",
      }}
      onMouseLeave={() => setActiveSub(null)}
    >
      {/* Sidebar with logo */}
      <div style={{
        width: "28px", background: "#000080", flexShrink: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "space-between", paddingBottom: "8px", paddingTop: "4px",
      }}>
        <img src="/sanglier.png" alt="mascot" style={{ width: "22px", height: "22px", objectFit: "cover", border: "1px solid #ffffff44" }} />
        <span style={{ color: "white", fontSize: "9px", writingMode: "vertical-rl", transform: "rotate(180deg)", fontWeight: "bold", letterSpacing: "1px" }}>
          Super Bernard 3000
        </span>
      </div>

      {/* Main items */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Espace de Travail */}
        <div
          className={`win95-menu-item flex items-center justify-between ${activeSub === 'workspace' ? 'active' : ''}`}
          style={{ fontSize: "11px", padding: "4px 8px", fontWeight: "bold", background: activeSub === 'workspace' ? "#000080" : "transparent", color: activeSub === 'workspace' ? "white" : "black" }}
          onMouseEnter={() => setActiveSub('workspace')}
        >
          <span className="flex items-center gap-2">🚀 Espace de Travail</span>
          <span style={{ fontSize: "8px" }}>▶</span>
        </div>

        <div className="win95-separator" style={{ margin: "2px 0" }} />

        {/* Programmes > Catégories */}
        <div
          className={`win95-menu-item flex items-center justify-between ${activeSub === 'databases' ? 'active' : ''}`}
          style={{ fontSize: "11px", padding: "4px 8px", fontWeight: "bold" }}
          onMouseEnter={() => setActiveSub('databases')}
        >
          <span className="flex items-center gap-2">🗄 Bases de données</span>
          <span style={{ fontSize: "8px" }}>▶</span>
        </div>

        <div
          className={`win95-menu-item flex items-center justify-between ${activeSub === 'cat' ? 'active' : ''}`}
          style={{ fontSize: "11px", padding: "4px 8px" }}
          onMouseEnter={() => setActiveSub('cat')}
        >
          <span className="flex items-center gap-2">📁 Catégories musicales</span>
          <span style={{ fontSize: "8px" }}>▶</span>
        </div>

        <div className="win95-separator" style={{ margin: "2px 0" }} />

        <div
          className="win95-menu-item"
          style={{ fontSize: "11px", padding: "4px 8px" }}
          onClick={() => { onOpen("stats"); onClose(); }}
        >
          📊 Statistiques scène
        </div>
        <div
          className="win95-menu-item"
          style={{ fontSize: "11px", padding: "4px 8px" }}
          onClick={() => { onOpen("about"); onClose(); }}
        >
          ℹ À propos
        </div>

        <div className="win95-separator" style={{ margin: "2px 0" }} />

        <div
          className="win95-menu-item"
          style={{ fontSize: "11px", padding: "4px 8px" }}
          onClick={() => { onToggleMascot(); }}
        >
          <span style={{ fontSize: "10px", width: "12px", display: "inline-block" }}>{mascotEnabled ? "✔" : ""}</span>
          🐗 Mascotte Sanglier
        </div>

        <div
          className="win95-menu-item"
          style={{ fontSize: "11px", padding: "4px 8px" }}
          onClick={() => { onOpen("deskSettings"); onClose(); }}
        >
          🎨 Personnaliser le bureau
        </div>

        <div className="win95-separator" style={{ margin: "2px 0" }} />

        <div
          className="win95-menu-item"
          style={{ fontSize: "11px", padding: "4px 8px", color: "#800000" }}
          onClick={onClose}
        >
          ✕ Fermer le menu
        </div>
      </div>

      {/* Submenu: Workspace */}
      {activeSub === 'workspace' && (
        <div
          className="win95-window"
          style={{
            position: "absolute", left: "100%", top: "0",
            width: "180px", zIndex: 110,
          }}
        >
          <div className="win95-titlebar" style={{ fontSize: "10px" }}>🚀 Productivité</div>
          {[
            { id: 'projets', name: 'Mes Projets', icon: '📋' },
            { id: 'calendar', name: 'Calendrier', icon: '📅' },
            { id: 'notepad', name: 'Bloc-notes', icon: '📝' },
          ].map(app => (
            <div
              key={app.id}
              className="win95-menu-item"
              style={{ fontSize: "11px", padding: "4px 8px" }}
              onClick={() => { onOpen(app.id); onClose(); }}
            >
              {app.icon} {app.name}
            </div>
          ))}
        </div>
      )}

      {/* Submenu: Databases */}
      {activeSub === 'databases' && (
        <div
          className="win95-window"
          style={{
            position: "absolute", left: "100%", top: "0",
            width: "200px", zIndex: 110,
          }}
        >
          <div className="win95-titlebar" style={{ fontSize: "10px" }}>🗄 Sélectionner une base</div>
          {[
            { id: 'artistes', name: 'Base Artistes', icon: '🗃' },
            { id: 'collectifs', name: 'Base Collectifs', icon: '👥' },
            { id: 'lieux', name: 'Base Lieux', icon: '🏢' },
            { id: 'festivals', name: 'Base Festivals', icon: '🎪' },
          ].map(db => (
            <div
              key={db.id}
              className="win95-menu-item"
              style={{ fontSize: "11px", padding: "4px 8px" }}
              onClick={() => { onOpen(db.id); onClose(); }}
            >
              {db.icon} {db.name}
            </div>
          ))}
        </div>
      )}

      {/* Submenu: categories */}
      {activeSub === 'cat' && (
        <div
          className="win95-window"
          style={{
            position: "absolute", left: "100%", top: "0",
            width: "240px", maxHeight: "400px", overflowY: "auto", zIndex: 110,
          }}
        >
          <div className="win95-titlebar" style={{ fontSize: "10px" }}>📁 Catégories</div>
          {categories.map(([cat, count]) => (
            <div
              key={cat}
              className="win95-menu-item flex items-center justify-between"
              style={{ fontSize: "10px", padding: "3px 8px" }}
              onClick={() => { onOpen(`cat:${cat}`); onClose(); }}
            >
              <span>{styleIcon(cat)} {cat}</span>
              <span className="win95-badge win95-badge-blue" style={{ fontSize: "8px" }}>{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
