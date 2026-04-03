import React, { useRef, useCallback } from "react";

export function DraggableResizableWindow({
  win,
  isActive,
  desktopRef,
  onFocus,
  onUpdate,
  onClose,
  onMinimize,
  title,
  icon,
  children
}) {
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  const MIN_W = 280;
  const MIN_H = 180;

  /* ── drag ── */
  const onTitleMouseDown = useCallback((e) => {
    if (win.maximized) return;
    if (e.target.closest("button")) return;
    e.preventDefault();
    onFocus();
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: win.x, origY: win.y };

    const onMove = (ev) => {
      if (!dragRef.current || !desktopRef.current) return;
      const desk = desktopRef.current.getBoundingClientRect();
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      onUpdate({
        x: Math.max(0, Math.min(desk.width - win.w, dragRef.current.origX + dx)),
        y: Math.max(0, Math.min(desk.height - 30, dragRef.current.origY + dy)),
      });
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [win, onFocus, onUpdate, desktopRef]);

  /* ── resize ── */
  const onResizeMouseDown = useCallback((e, edge) => {
    if (win.maximized) return;
    e.preventDefault();
    e.stopPropagation();
    onFocus();
    resizeRef.current = { edge, startX: e.clientX, startY: e.clientY, origX: win.x, origY: win.y, origW: win.w, origH: win.h };

    const onMove = (ev) => {
      if (!resizeRef.current) return;
      const { edge: ed, startX, startY, origX, origY, origW, origH } = resizeRef.current;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const patch = {};

      if (ed.includes("e")) patch.w = Math.max(MIN_W, origW + dx);
      if (ed.includes("s")) patch.h = Math.max(MIN_H, origH + dy);
      if (ed.includes("w")) {
        const newW = Math.max(MIN_W, origW - dx);
        patch.w = newW;
        patch.x = origX + origW - newW;
      }
      if (ed.includes("n")) {
        const newH = Math.max(MIN_H, origH - dy);
        patch.h = newH;
        patch.y = origY + origH - newH;
      }
      onUpdate(patch);
    };
    const onUp = () => {
      resizeRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [win, onFocus, onUpdate]);

  /* ── maximize toggle ── */
  const toggleMax = (e) => {
    e.stopPropagation();
    if (!win.maximized) {
      onUpdate({ maximized: true, restore: { x: win.x, y: win.y, w: win.w, h: win.h } });
    } else {
      onUpdate({ maximized: false, ...(win.restore ?? {}) });
    }
  };

  const style = win.maximized
    ? { position: "absolute", left: 0, top: 0, right: 0, bottom: 0, width: "100%", height: "100%" }
    : { position: "absolute", left: win.x, top: win.y, width: win.w, height: win.h };

  const HANDLE_SIZE = 6;
  const edges = [
    { id: "n",  cursor: "n-resize",  top: 0, left: HANDLE_SIZE, right: HANDLE_SIZE, height: HANDLE_SIZE },
    { id: "s",  cursor: "s-resize",  bottom: 0, left: HANDLE_SIZE, right: HANDLE_SIZE, height: HANDLE_SIZE },
    { id: "w",  cursor: "w-resize",  top: HANDLE_SIZE, bottom: HANDLE_SIZE, left: 0, width: HANDLE_SIZE },
    { id: "e",  cursor: "e-resize",  top: HANDLE_SIZE, bottom: HANDLE_SIZE, right: 0, width: HANDLE_SIZE },
    { id: "nw", cursor: "nw-resize", top: 0, left: 0, width: HANDLE_SIZE, height: HANDLE_SIZE },
    { id: "ne", cursor: "ne-resize", top: 0, right: 0, width: HANDLE_SIZE, height: HANDLE_SIZE },
    { id: "sw", cursor: "sw-resize", bottom: 0, left: 0, width: HANDLE_SIZE, height: HANDLE_SIZE },
    { id: "se", cursor: "se-resize", bottom: 0, right: 0, width: HANDLE_SIZE, height: HANDLE_SIZE },
  ];

  return (
    <div
      style={{ ...style, zIndex: isActive ? 20 : 10, display: "flex", flexDirection: "column" }}
      className="win95-window"
      onMouseDown={onFocus}
    >
      {/* Resize handles */}
      {!win.maximized && edges.map(edge => (
        <div
          key={edge.id}
          style={{
            position: "absolute",
            cursor: edge.cursor,
            zIndex: 30,
            top: edge.top,
            bottom: edge.bottom,
            left: edge.left,
            right: edge.right,
            width: edge.width,
            height: edge.height,
          }}
          onMouseDown={e => onResizeMouseDown(e, edge.id)}
        />
      ))}

      {/* Title bar */}
      <div
        className={`win95-titlebar ${!isActive ? "win95-titlebar-inactive" : ""}`}
        style={{ cursor: win.maximized ? "default" : "move", flexShrink: 0, userSelect: "none" }}
        onMouseDown={onTitleMouseDown}
        onDoubleClick={toggleMax}
      >
        <div className="flex items-center gap-1 overflow-hidden">
          <span>{icon}</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
        </div>
        <div className="flex items-center" style={{ flexShrink: 0, gap: '2px' }}>
          <button className="win95-title-btn" title="Réduire" onClick={e => { e.stopPropagation(); onMinimize(); }}>_</button>
          <button className="win95-title-btn" title={win.maximized ? "Restaurer" : "Agrandir"} onClick={toggleMax}>
            {win.maximized ? "❐" : "□"}
          </button>
          <button className="win95-title-btn" title="Fermer" onClick={e => { e.stopPropagation(); onClose(); }}>✕</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}
