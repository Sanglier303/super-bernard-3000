import React, { useState } from "react";

const winFont = { fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif', fontSize: '11px' };
const sunken = { boxShadow: 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff, inset 2px 2px #808080, inset -2px -2px #dfdfdf' };

export function TodoWindow({ todos, saveTodos, loading }) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const newTodo = {
      id: Date.now().toString(),
      texte: inputValue.trim(),
      complete: "false",
      archive: "false",
      date: new Date().toLocaleDateString("fr-FR")
    };
    saveTodos([...(todos || []), newTodo], `Ajout tâche: ${newTodo.texte}`);
    setInputValue("");
  };

  const toggleTodo = (id) => {
    const updated = todos.map(t => 
      t.id === id ? { ...t, complete: t.complete === "true" ? "false" : "true" } : t
    );
    saveTodos(updated, `Changement état tâche`);
  };

  const archiveTodo = (id) => {
    const updated = todos.map(t => 
      t.id === id ? { ...t, archive: "true" } : t
    );
    saveTodos(updated, `Archivage tâche`);
  };

  const activeTodos = (todos || []).filter(t => t.archive !== "true");

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#c0c0c0', padding: '6px' }}>
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        <input 
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Nouvelle tâche..."
          style={{ ...sunken, flex: 1, padding: '2px 4px', ...winFont, border: 'none', background: '#fff', outline: 'none' }}
        />
        <button type="submit" style={{ ...sunken, background: '#c0c0c0', ...winFont, padding: '2px 8px', border: '1px solid #808080' }}>Ajouter</button>
      </form>

      <div style={{ flex: 1, overflowY: 'auto', ...sunken, background: '#fff', padding: '2px' }}>
        {loading ? (
          <div style={{ padding: '10px', ...winFont }}>Chargement...</div>
        ) : activeTodos.length === 0 ? (
          <div style={{ padding: '10px', color: '#808080', ...winFont }}>Aucune tâche en cours.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activeTodos.map((t, idx) => (
              <div key={t.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px', borderBottom: '1px solid #f0f0f0' }}>
                <input 
                  type="checkbox" 
                  checked={t.complete === "true"} 
                  onChange={() => toggleTodo(t.id)} 
                />
                <span style={{ 
                  flex: 1, 
                  ...winFont, 
                  textDecoration: t.complete === "true" ? 'line-through' : 'none',
                  color: t.complete === "true" ? '#808080' : '#000'
                }}>
                  {t.texte}
                </span>
                <button 
                  onClick={() => archiveTodo(t.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', color: '#808080' }}
                  title="Archiver"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '6px', fontSize: '10px', opacity: 0.8, textAlign: 'right' }}>
        {activeTodos.filter(t => t.complete === "true").length} / {activeTodos.length} terminé(s)
      </div>
    </div>
  );
}
