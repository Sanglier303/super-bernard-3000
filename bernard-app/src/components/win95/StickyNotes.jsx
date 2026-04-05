import React, { useState, useRef, useEffect } from "react";

const winFont = { fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif', fontSize: '11px' };

export function StickyNote({ note, onUpdate, onDelete, onFocus }) {
  const [isDragging, setIsDragging] = useState(false);
  const dragInfo = useRef({ startX: 0, startY: 0, initialX: note.x, initialY: note.y });

  const handleMouseDown = (e) => {
    if (e.target.tagName.toLowerCase() === 'textarea') {
      onFocus();
      return;
    }
    e.stopPropagation();
    onFocus();
    setIsDragging(true);
    dragInfo.current = { startX: e.clientX, startY: e.clientY, initialX: note.x, initialY: note.y };
  };

  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e) => {
      const dx = e.clientX - dragInfo.current.startX;
      const dy = e.clientY - dragInfo.current.startY;
      onUpdate({ ...note, x: Math.max(0, dragInfo.current.initialX + dx), y: Math.max(0, dragInfo.current.initialY + dy) });
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, note, onUpdate]);

  return (
    <div
      style={{
        position: 'absolute',
        left: note.x,
        top: note.y,
        width: 160,
        height: 160,
        backgroundColor: '#ffffcc',
        boxShadow: '2px 2px 6px rgba(0,0,0,0.3)',
        border: '1px solid #d4d4aa',
        zIndex: note.zIndex || 20,
        display: note.isVisible === false ? 'none' : 'flex',
        flexDirection: 'column',
      }}
      onMouseDown={handleMouseDown}
    >
      <div 
        style={{ 
          height: '16px', 
          backgroundColor: '#ecec9b', 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center',
          cursor: isDragging ? 'grabbing' : 'grab',
          borderBottom: '1px solid #d4d4aa'
        }}
      >
        <button 
          onMouseDown={(e) => { e.stopPropagation(); onDelete(); }} 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            cursor: 'pointer', 
            fontSize: '11px', 
            fontWeight: 'bold',
            padding: '0 6px',
            color: '#666'
          }}
          title="Masquer"
        >
          ×
        </button>
      </div>
      <textarea
        value={note.text}
        onChange={(e) => onUpdate({ ...note, text: e.target.value })}
        placeholder="Écrire une note..."
        onMouseDown={onFocus}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          resize: 'none',
          outline: 'none',
          padding: '8px',
          ...winFont,
          color: '#333',
        }}
      />
    </div>
  );
}

export function StickyNotesManager({ notes, onUpdate, onDelete, onFocus }) {
  return (
    <>
      {notes.filter(n => n.isVisible !== false).map(note => (
        <StickyNote 
          key={note.id} 
          note={note} 
          onUpdate={onUpdate} 
          onDelete={() => onDelete(note.id)} 
          onFocus={() => onFocus(note.id)}
        />
      ))}
    </>
  );
}
