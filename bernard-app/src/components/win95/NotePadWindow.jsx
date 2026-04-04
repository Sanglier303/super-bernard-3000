import React, { useState } from "react";

export function NotePadWindow({ notes = [], onSave }) {
  // For simplicity in this v2.3, we'll edit a "General Notes" document or the first one.
  const [content, setContent] = useState(notes[0]?.contenu || "");
  const [titre, setTitre] = useState(notes[0]?.titre || "Notes Sans Titre");

  const handleSave = () => {
    const updatedNotes = [{ 
      _id: notes[0]?._id || Date.now().toString(),
      titre, 
      contenu: content,
      date_derniere_modif: new Date().toLocaleString()
    }];
    onSave(updatedNotes, "Mise à jour Bloc-notes");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#c0c0c0', fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif' }}>
      {/* Menu bar */}
      <div className="win95-menubar">
        <div className="win95-menu-item" style={{ fontSize: '10px' }} onClick={handleSave}>💾 Enregistrer</div>
        <div className="win95-menu-item" style={{ fontSize: '10px' }}>📁 Ouvrir</div>
      </div>

      {/* Editor area */}
      <div style={{ flex: 1, padding: '2px', background: 'white', margin: '2px', display: 'flex', flexDirection: 'column' }} className="win95-sunken">
        <input 
          value={titre}
          onChange={e => setTitre(e.target.value)}
          style={{ border: 'none', borderBottom: '1px solid #ddd', padding: '4px 8px', fontWeight: 'bold', outline: 'none', fontSize: '12px' }}
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          style={{ 
            flex: 1, 
            border: 'none', 
            padding: '8px', 
            resize: 'none', 
            outline: 'none', 
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '13px',
            lineHeight: '1.5'
          }}
          placeholder="Commencez à rédiger vos notes ici..."
        />
      </div>

      {/* Status Bar */}
      <div className="win95-statusbar">
        <div className="win95-statusbar-panel" style={{ flex: 1 }}>Caractères : {content.length}</div>
        <div className="win95-statusbar-panel">LN 1, COL 1</div>
      </div>
    </div>
  );
}
