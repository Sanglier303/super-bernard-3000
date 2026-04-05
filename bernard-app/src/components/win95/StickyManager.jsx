import React from "react";

const winFont = { fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif', fontSize: '11px' };
const sunken = { boxShadow: 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff, inset 2px 2px #808080, inset -2px -2px #dfdfdf' };
const raised = { boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf' };

export function StickyManager({ notes, onToggle, onDelete, onFocus }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#c0c0c0', padding: '4px' }}>
      <div style={{ flex: 1, overflowY: 'auto', ...sunken, background: '#fff' }}>
        <table className="win95-table" style={{ width: '100%', borderCollapse: 'collapse', ...winFont }}>
          <thead>
            <tr style={{ background: '#c0c0c0', position: 'sticky', top: 0 }}>
              <th style={{ textAlign: 'left', padding: '4px', borderRight: '1px solid #808080', borderBottom: '1px solid #808080' }}>Aperçu</th>
              <th style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #808080', borderBottom: '1px solid #808080', width: '60px' }}>Visibilité</th>
              <th style={{ textAlign: 'center', padding: '4px', borderBottom: '1px solid #808080', width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(!notes || notes.length === 0) ? (
              <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#808080' }}>Aucun post-it créé.</td></tr>
            ) : notes.map(n => (
              <tr key={n.id} style={{ borderBottom: '1px solid #dfdfdf' }}>
                <td style={{ padding: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                  {n.text || <i style={{color: '#808080'}}>(Note vide)</i>}
                </td>
                <td style={{ padding: '4px', textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={n.isVisible !== false} 
                    onChange={() => onToggle(n.id)}
                  />
                </td>
                <td style={{ padding: '4px', textAlign: 'center', display: 'flex', gap: '4px', justifyContent: 'center' }}>
                  <button 
                    onClick={() => { onToggle(n.id, true); onFocus(n.id); }}
                    style={{ ...raised, padding: '1px 6px', ...winFont, background: '#c0c0c0' }}
                  >
                    Aller à
                  </button>
                  <button 
                    onClick={() => onDelete(n.id)}
                    style={{ ...raised, padding: '1px 6px', ...winFont, background: '#c0c0c0', color: '#800000' }}
                  >
                    Suppr.
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'flex-end', fontSize: '10px', opacity: 0.8 }}>
        {notes.length} post-it(s) au total
      </div>
    </div>
  );
}
