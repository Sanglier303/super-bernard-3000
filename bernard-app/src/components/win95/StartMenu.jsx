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

  const [catOpen, setCatOpen] = useState(false);

  return (
    <div
      className="win95-window"
      style={{
        position: "fixed", bottom: "30px", left: "2px", zIndex: 100,
        width: catOpen ? "480px" : "220px",
        userSelect: "none",
        display: "flex",
        flexDirection: "row",
      }}
      onMouseLeave={() => setCatOpen(false)}
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
        {/* Top separator */}
        <div className="win95-separator" style={{ margin: "0" }} />

        {/* Programmes > Catégories */}
        <div
          className="win95-menu-item flex items-center justify-between"
          style={{ fontSize: "11px", padding: "3px 8px", fontWeight: "bold" }}
          onMouseEnter={() => setCatOpen(true)}
        >
          <span>📁 Catégories artistiques</span>
          <span style={{ fontSize: "8px" }}>▶</span>
        </div>

        <div className="win95-separator" style={{ margin: "0" }} />

        <div
          className="win95-menu-item"
          style={{ fontSize: "11px", padding: "3px 8px" }}
          onClick={() => { onOpen("search"); onClose(); }}
        >
          🗃 Base de données artistes
        </div>
        <div
          className="win95-menu-item"
          style={{ fontSize: "11px", padding: "3px 8px" }}
          onClick={() => { onOpen("stats"); onClose(); }}
        >
          📊 Statistiques scène
        </div>
        <div
          className="win95-menu-item"
          style={{ fontSize: "11px", padding: "3px 8px" }}
          onClick={() => { onOpen("about"); onClose(); }}
        >
          ℹ À propos
        </div>

        <div className="win95-separator" style={{ margin: "0" }} />

        <div
          className="win95-menu-item flex items-center gap-2"
          style={{ fontSize: "11px", padding: "3px 8px" }}
          onClick={() => { onToggleMascot(); }}
        >
          <span style={{ fontSize: "10px", width: "12px", display: "inline-block" }}>{mascotEnabled ? "✔" : ""}</span>
          🐗 Mascotte Sanglier
        </div>

        <div className="win95-separator" style={{ margin: "0" }} />

        <div
          className="win95-menu-item"
          style={{ fontSize: "11px", padding: "3px 8px", color: "#800000" }}
          onClick={onClose}
        >
          ✕ Fermer le menu
        </div>
      </div>

      {/* Submenu: categories */}
      {catOpen && (
        <div
          className="win95-window"
          style={{
            position: "absolute", left: "100%", bottom: "0",
            width: "240px", maxHeight: "400px", overflowY: "auto", zIndex: 110,
          }}
        >
          <div className="win95-titlebar" style={{ fontSize: "10px" }}>
            📁 Catégories
          </div>
          {categories.map(([cat, count]) => (
            <div
              key={cat}
              className="win95-menu-item flex items-center justify-between"
              style={{ fontSize: "10px", padding: "2px 8px" }}
              onClick={() => {
                onOpen(`cat:${cat}`);
                onClose();
              }}
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
