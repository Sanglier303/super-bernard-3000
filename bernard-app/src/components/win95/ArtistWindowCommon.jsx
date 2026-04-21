import React from "react";

export function isArtistValidated(artist) {
  const raw = String(artist?.validation_sanglier || '').trim().toLowerCase();
  return ['true', '1', 'yes', 'oui', '🐗', 'valide', 'validé'].includes(raw);
}

export function formatValidationDate(date) {
  if (!date) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  }
  return date;
}

export const winFont = { fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif', fontSize: '11px' };
export const raised = { boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf' };
export const sunken = { boxShadow: 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff, inset 2px 2px #808080, inset -2px -2px #dfdfdf' };

export function Win95Button({ children, onClick, active, disabled, style, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...winFont,
        ...(active ? sunken : raised),
        background: '#c0c0c0',
        border: 'none',
        padding: '3px 8px',
        cursor: 'default',
        whiteSpace: 'nowrap',
        color: disabled ? '#808080' : active ? '#000080' : '#000',
        fontWeight: active ? 'bold' : 'normal',
        textShadow: disabled ? '1px 1px 0px #fff' : 'none',
        ...style,
      }}
    >
      {children}
    </button>
  )
}
