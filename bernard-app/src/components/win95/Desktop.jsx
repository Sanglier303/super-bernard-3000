import React, { useState, useRef, useCallback, useEffect } from "react";
import { DraggableResizableWindow } from "./DraggableWindow";
import { StartMenu } from "./StartMenu";
import { Mascot } from "./Mascot";
import { DatabaseWindow } from "./DatabaseWindow";
import { CollectifsWindow } from "./CollectifsWindow";
import { LieuxWindow } from "./LieuxWindow";
import { FestivalsWindow } from "./FestivalsWindow";
import { DesktopSettings } from "./DesktopSettings";
import { WALLPAPERS } from "../../constants/wallpapers";

const GRID_X = 80;
const GRID_Y = 90;

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
    try { return localStorage.getItem("super_bernard_mascot") !== "off"; } catch { /* ignore storage error */ return true; }
  });
  const [mascotFrequency, setMascotFrequency] = useState(() => {
    try { return parseInt(localStorage.getItem("super_bernard_mascot_freq") ?? "600000"); } catch { /* ignore */ return 600000; }
  });

  // Icon Visibility State
  const [visibleIcons, setVisibleIcons] = useState(() => {
    try {
      const saved = localStorage.getItem("super_bernard_visible_icons");
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return DESKTOP_ICONS.map(ic => ic.id); // all visible by default
  });

  // Background State
  const [background, setBackground] = useState(() => {
    try {
      const saved = localStorage.getItem("super_bernard_desktop_bg");
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return { type: 'color', value: '#008080' }; // Default Teal
  });

  // Rotation State
  const [rotation, setRotation] = useState(() => {
    try {
      const saved = localStorage.getItem("super_bernard_desktop_rotation");
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return { enabled: false, interval: 60000 }; // 1 min by default
  });

  // Context Menu State
  const [contextMenu, setContextMenu] = useState(null); // { x, y }

  // Icon Dragging State
  const [iconPositions, setIconPositions] = useState(() => {
    try {
      const saved = localStorage.getItem("super_bernard_desktop_icons");
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    
    // Default initial positions (stacked vertically on the left) aligned to GRID
    const pos = {};
    DESKTOP_ICONS.forEach((ic, i) => {
      pos[ic.id] = { x: 0, y: i * GRID_Y };
    });
    return pos;
  });

  const [dragging, setDragging] = useState(null); // { id, startX, startY, iconX, iconY }

  const toggleMascot = useCallback(() => {
    setMascotEnabled(v => {
      const next = !v;
      try { localStorage.setItem("super_bernard_mascot", next ? "on" : "off"); } catch { /* ignore storage error */ }
      return next;
    });
  }, []);

  const updateMascotFrequency = useCallback((freq) => {
    setMascotFrequency(freq);
    try { localStorage.setItem("super_bernard_mascot_freq", freq.toString()); } catch { /* ignore */ }
  }, []);

  const toggleIconVisibility = useCallback((id) => {
    setVisibleIcons(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try { localStorage.setItem("super_bernard_visible_icons", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const changeBackground = useCallback((bg) => {
    setBackground(bg);
    try { localStorage.setItem("super_bernard_desktop_bg", JSON.stringify(bg)); } catch { /* ignore */ }
  }, []);

  const updateRotation = useCallback((patch) => {
    setRotation(prev => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem("super_bernard_desktop_rotation", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // Wallpaper Rotation Effect
  useEffect(() => {
    if (!rotation.enabled) return;
    
    const interval = setInterval(() => {
      const currentIndex = WALLPAPERS.findIndex(w => w.value === background.value);
      const nextIndex = (currentIndex + 1) % WALLPAPERS.length;
      changeBackground(WALLPAPERS[nextIndex]);
    }, rotation.interval);
    
    return () => clearInterval(interval);
  }, [rotation, background.value, changeBackground]);

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
      if (id === "deskSettings") { w = 360; h = 480; }
      
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

  const handleIconMouseDown = (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedIcon(id);
    setStartMenuOpen(false);
    setContextMenu(null);
    
    const pos = iconPositions[id];
    setDragging({
      id,
      startX: e.clientX,
      startY: e.clientY,
      iconX: pos.x,
      iconY: pos.y
    });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragging.startX;
    const dy = e.clientY - dragging.startY;
    
    setDragging(prev => ({
      ...prev,
      iconX: dragging.iconX + dx,
      iconY: dragging.iconY + dy,
      startX: e.clientX,
      startY: e.clientY
    }));
  };

  const handleMouseUp = () => {
    if (!dragging) return;
    
    // Strict snap to grid based on icon dimensions
    const finalX = Math.max(0, Math.round(dragging.iconX / GRID_X) * GRID_X);
    const finalY = Math.max(0, Math.round(dragging.iconY / GRID_Y) * GRID_Y);
    
    const newPositions = {
      ...iconPositions,
      [dragging.id]: { x: finalX, y: finalY }
    };
    
    setIconPositions(newPositions);
    localStorage.setItem("super_bernard_desktop_icons", JSON.stringify(newPositions));
    setDragging(null);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
    setStartMenuOpen(false);
    setSelectedIcon(null);
  };

  function winTitle(id) {
    if (id === "artistes") return "Base de données artistes";
    if (id === "collectifs") return "Base de données collectifs";
    if (id === "lieux") return "Base de données lieux";
    if (id === "festivals") return "Base de données festivals";
    if (id === "stats") return "Statistiques — Super Bernard 3000";
    if (id === "about") return "À propos de Super Bernard 3000";
    if (id === "deskSettings") return "Propriétés du Bureau";
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
    if (id === "deskSettings") return "🎨";
    if (id.startsWith("cat:")) return "📄";
    return "📄";
  }

  const getDesktopBackgroundStyle = () => {
    if (background.type === 'color') return { background: background.value };
    return {
      backgroundImage: `url(${background.value})`,
      backgroundSize: background.stretch ? 'cover' : 'auto',
      backgroundRepeat: background.stretch ? 'no-repeat' : 'repeat',
      backgroundPosition: 'center',
      backgroundColor: '#008080'
    };
  };

  return (
    <div
      className="flex flex-col"
      style={{ 
        height: "100vh", 
        overflow: "hidden", 
        position: "relative",
        ...getDesktopBackgroundStyle()
      }}
      onClick={() => { setStartMenuOpen(false); setSelectedIcon(null); setContextMenu(null); }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      {/* Desktop area */}
      <div ref={desktopRef} className="flex-1 relative overflow-hidden">
        {/* Desktop icons */}
        {DESKTOP_ICONS.filter(ic => visibleIcons.includes(ic.id)).map(ic => {
          const pos = dragging?.id === ic.id ? { x: dragging.iconX, y: dragging.iconY } : iconPositions[ic.id];
          return (
            <div
              key={ic.id}
              className={`win95-icon ${selectedIcon === ic.id ? "selected" : ""}`}
              style={{
                position: "absolute",
                left: pos?.x ?? 0,
                top: pos?.y ?? 0,
                zIndex: dragging?.id === ic.id ? 1000 : 1,
                cursor: "default"
              }}
              onMouseDown={e => handleIconMouseDown(e, ic.id)}
              onDoubleClick={() => openWindow(ic.id)}
              onContextMenu={e => e.stopPropagation()} // Prevent desktop context menu on icons
            >
              <div style={{ fontSize: "32px", pointerEvents: "none" }}>{ic.icon}</div>
              <div className="win95-icon-label" style={{ color: "white", textShadow: "1px 1px 2px black", pointerEvents: "none" }}>
                {ic.label}
              </div>
            </div>
          );
        })}

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
            {win.id === "deskSettings" && (
              <DesktopSettings 
                icons={DESKTOP_ICONS} 
                visibleIcons={visibleIcons} 
                onToggle={toggleIconVisibility} 
                currentBackground={background}
                onBackgroundChange={changeBackground}
                rotation={rotation}
                onRotationChange={updateRotation}
                mascotEnabled={mascotEnabled}
                onMascotToggle={toggleMascot}
                mascotFrequency={mascotFrequency}
                onMascotFrequencyChange={updateMascotFrequency}
                onClose={() => closeWindow('deskSettings')} 
              />
            )}
            {win.id === "stats" && renderStatsContent({ onClose: () => closeWindow("stats") })}
            {win.id === "about" && renderAboutContent({ onClose: () => closeWindow("about") })}
            {win.id.startsWith("cat:") && renderCategoryContent(win.id.slice(4))}
          </DraggableResizableWindow>
        ))}

        {/* Context Menu */}
        {contextMenu && (
          <div
            className="win95-window"
            style={{
              position: "fixed",
              left: contextMenu.x,
              top: contextMenu.y,
              zIndex: 10000,
              width: "160px",
              padding: "2px",
              boxShadow: "2px 2px 5px rgba(0,0,0,0.4)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="win95-menu-item" style={{ fontSize: "11px", padding: "4px 10px", opacity: 0.5 }}>Actualiser</div>
            <div className="win95-separator" style={{ margin: "2px 0" }} />
            <div className="win95-menu-item" style={{ fontSize: "11px", padding: "4px 10px", opacity: 0.5 }}>Nouveau</div>
            <div className="win95-separator" style={{ margin: "2px 0" }} />
            <div
              className="win95-menu-item"
              style={{ fontSize: "11px", padding: "4px 10px", fontWeight: "bold" }}
              onClick={() => { openWindow("deskSettings"); setContextMenu(null); }}
            >
              Propriétés
            </div>
          </div>
        )}
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

      <Mascot enabled={mascotEnabled} frequency={mascotFrequency} onDisable={toggleMascot} />
    </div>
  );
}
