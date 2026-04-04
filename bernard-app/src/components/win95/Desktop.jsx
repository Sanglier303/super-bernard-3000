import React, { useState, useRef, useCallback, useEffect } from "react";
import { DraggableResizableWindow } from "./DraggableWindow";
import { StartMenu } from "./StartMenu";
import { Mascot } from "./Mascot";
import { DatabaseWindow } from "./DatabaseWindow";
import { CollectifsWindow } from "./CollectifsWindow";
import { LieuxWindow } from "./LieuxWindow";
import { FestivalsWindow } from "./FestivalsWindow";

const DESKTOP_ICONS = [
  { id: "artistes", label: "Base Artistes", icon: "🗃" },
  { id: "collectifs", label: "Base Collectifs", icon: "👥" },
  { id: "lieux", label: "Base Lieux", icon: "🏢" },
  { id: "festivals", label: "Base Festivals", icon: "🎪" },
  { id: "stats", label: "Statistiques", icon: "📊" },
  { id: "about", label: "À propos", icon: "ℹ" },
];

function Clock() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })), 10000);
    return () => clearInterval(t);
  }, []);
  return <div className="win95-clock">{time}</div>;
}

export function Desktop({ 
  artists, collectifs, lieux, festivals, onRefresh, saveData, loading,
  renderStatsContent, 
  renderAboutContent,
  renderCategoryContent
}) {
  const desktopRef = useRef(null);
  
  const [windows, setWindows] = useState(() => {
    const m = new Map();
    m.set("artistes", { id: "artistes", x: 100, y: 30, w: 700, h: 460, maximized: false, minimized: false });
    return m;
  });
  
  const [zOrders, setZOrders] = useState(["artistes"]);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [mascotEnabled, setMascotEnabled] = useState(() => {
    try { return localStorage.getItem("super_bernard_mascot") !== "off"; } catch { return true; }
  });

  const toggleMascot = useCallback(() => {
    setMascotEnabled(v => {
      const next = !v;
      try { localStorage.setItem("super_bernard_mascot", next ? "on" : "off"); } catch {}
      return next;
    });
  }, []);

  const activeWin = zOrders[zOrders.length - 1] ?? null;

  const focusWin = useCallback((id) => {
    setZOrders(z => [...z.filter(x => x !== id), id]);
    setWindows(m => {
      const w = m.get(id);
      if (w?.minimized) {
        const nm = new Map(m);
        nm.set(id, { ...w, minimized: false });
        return nm;
      }
      return m;
    });
  }, []);

  const openWindow = useCallback((id) => {
    setWindows(m => {
      if (m.has(id)) {
        const nm = new Map(m);
        const w = nm.get(id);
        nm.set(id, { ...w, minimized: false });
        focusWin(id);
        return nm;
      }
      const desk = desktopRef.current;
      const dw = desk?.clientWidth ?? 800;
      const dh = desk?.clientHeight ?? 600;
      const offset = m.size * 24;
      let w = 500, h = 360;
      
      if (["artistes", "collectifs", "lieux", "festivals"].includes(id)) { w = 700; h = 460; }
      if (id === "stats") { w = 340; h = 480; }
      if (id === "about") { w = 360; h = 280; }
      
      const nm = new Map(m);
      nm.set(id, {
        id, x: Math.min(80 + offset, dw - w - 20), y: Math.min(30 + offset, dh - h - 60),
        w, h, maximized: false, minimized: false,
      });
      return nm;
    });
    focusWin(id);
    setZOrders(z => z.includes(id) ? [...z.filter(x => x !== id), id] : [...z, id]);
  }, [focusWin]);

  const closeWindow = useCallback((id) => {
    setWindows(m => { const nm = new Map(m); nm.delete(id); return nm; });
    setZOrders(z => z.filter(x => x !== id));
  }, []);

  const minimizeWindow = useCallback((id) => {
    setWindows(m => {
      const w = m.get(id);
      if (!w) return m;
      const nm = new Map(m);
      nm.set(id, { ...w, minimized: true });
      return nm;
    });
    setZOrders(z => z.filter(x => x !== id));
  }, []);

  const updateWindow = useCallback((id, patch) => {
    setWindows(m => {
      const w = m.get(id);
      if (!w) return m;
      const nm = new Map(m);
      nm.set(id, { ...w, ...patch });
      return nm;
    });
  }, []);

  function winTitle(id) {
    if (id === "artistes") return "Base de données artistes";
    if (id === "collectifs") return "Base de données collectifs";
    if (id === "lieux") return "Base de données lieux";
    if (id === "festivals") return "Base de données festivals";
    if (id === "stats") return "Statistiques — Super Bernard 3000";
    if (id === "about") return "À propos de Super Bernard 3000";
    if (id.startsWith("cat:")) return `📁 Catégorie : ${id.slice(4)}`;
    return id;
  }

  function winIcon(id) {
    if (id === "artistes") return "🗃";
    if (id === "collectifs") return "👥";
    if (id === "lieux") return "🏢";
    if (id === "festivals") return "🎪";
    if (id === "stats") return "📊";
    if (id === "about") return "ℹ";
    if (id.startsWith("cat:")) return "📄";
    return "📄";
  }

  return (
    <div
      className="flex flex-col"
      style={{ height: "100vh", background: "#008080", overflow: "hidden", position: "relative" }}
      onClick={() => { setStartMenuOpen(false); setSelectedIcon(null); }}
    >
      {/* Desktop area */}
      <div ref={desktopRef} className="flex-1 relative overflow-hidden">
        {/* Desktop icons */}
        <div className="absolute flex flex-col gap-3" style={{ top: 12, left: 8 }}>
          {DESKTOP_ICONS.map(ic => (
            <div
              key={ic.id}
              className={`win95-icon ${selectedIcon === ic.id ? "selected" : ""}`}
              onClick={e => { e.stopPropagation(); setSelectedIcon(ic.id); setStartMenuOpen(false); }}
              onDoubleClick={() => openWindow(ic.id)}
            >
              <div style={{ fontSize: "32px" }}>{ic.icon}</div>
              <div className="win95-icon-label" style={{ color: "white", textShadow: "1px 1px 2px black" }}>
                {ic.label}
              </div>
            </div>
          ))}
        </div>

        {/* Windows */}
        {[...windows.values()].filter(w => !w.minimized).map(win => (
          <DraggableResizableWindow
            key={win.id}
            win={win}
            isActive={activeWin === win.id}
            desktopRef={desktopRef}
            onFocus={() => focusWin(win.id)}
            onUpdate={patch => updateWindow(win.id, patch)}
            onClose={() => closeWindow(win.id)}
            onMinimize={() => minimizeWindow(win.id)}
            title={winTitle(win.id)}
            icon={winIcon(win.id)}
          >
            {win.id === "artistes" && <DatabaseWindow artists={artists} loading={loading} saveArtists={(data, action) => saveData('artistes', data, action)} onRefresh={onRefresh} />}
            {win.id === "collectifs" && <CollectifsWindow collectifs={collectifs} loading={loading} saveCollectifs={(data, action) => saveData('collectifs', data, action)} onRefresh={onRefresh} />}
            {win.id === "lieux" && <LieuxWindow lieux={lieux} loading={loading} saveLieux={(data, action) => saveData('lieux', data, action)} onRefresh={onRefresh} />}
            {win.id === "festivals" && <FestivalsWindow festivals={festivals} loading={loading} saveFestivals={(data, action) => saveData('festivals', data, action)} onRefresh={onRefresh} />}
            {win.id === "stats" && renderStatsContent({ onClose: () => closeWindow("stats") })}
            {win.id === "about" && renderAboutContent({ onClose: () => closeWindow("about") })}
            {win.id.startsWith("cat:") && renderCategoryContent(win.id.slice(4))}
          </DraggableResizableWindow>
        ))}
      </div>

      {/* Start menu */}
      {startMenuOpen && (
        <StartMenu
          onOpen={openWindow}
          onClose={() => setStartMenuOpen(false)}
          mascotEnabled={mascotEnabled}
          onToggleMascot={toggleMascot}
          artists={artists}
        />
      )}

      {/* Taskbar */}
      <div className="win95-taskbar" onClick={e => e.stopPropagation()}>
        <button
          className={`win95-start-btn ${startMenuOpen ? "active" : ""}`}
          style={startMenuOpen ? { borderColor: "#808080 #ffffff #ffffff #808080" } : {}}
          onClick={() => setStartMenuOpen(v => !v)}
        >
          <span>⊞</span> Démarrer
        </button>
        <div style={{ width: "1px", height: "18px", borderLeft: "1px solid #808080", borderRight: "1px solid white", margin: "0 2px" }} />

        {/* Taskbar buttons */}
        {[...windows.entries()].map(([id, w]) => (
          <button
            key={id}
            className={`win95-taskbar-btn ${activeWin === id && !w.minimized ? "active" : ""}`}
            title={winTitle(id)}
            onClick={() => {
              if (w.minimized || activeWin !== id) {
                openWindow(id);
              } else {
                minimizeWindow(id);
              }
            }}
          >
            {winIcon(id)} {winTitle(id).slice(0, 18)}{winTitle(id).length > 18 ? "…" : ""}
          </button>
        ))}

        <Clock />
      </div>

      <Mascot enabled={mascotEnabled} onDisable={toggleMascot} />
    </div>
  );
}
