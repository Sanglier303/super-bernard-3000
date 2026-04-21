import React from "react";
import { isArtistValidated, raised, sunken, winFont } from "./ArtistWindowCommon";

export function DatabaseSidebar({
  artists,
  showFilters,
  activeStyle,
  setActiveStyle,
  mainStyles,
  uniqueZones,
  validatedCount,
  validationFilter,
  setValidationFilter,
}) {
  if (!showFilters) return null;

  return (
    <div style={{ width: '200px', borderRight: '2px solid', borderColor: '#808080 #dfdfdf #dfdfdf #808080', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ ...winFont, fontWeight: 'bold', padding: '4px 6px', background: '#000080', color: '#fff', fontSize: '10px' }}>
        INDEX / STYLES
      </div>
      <div style={{ overflowY: 'auto', flex: 1, background: '#fff', ...sunken, margin: '2px' }}>
        <div
          onClick={() => setActiveStyle(null)}
          style={{
            ...winFont, padding: '2px 8px', cursor: 'default', display: 'flex', justifyContent: 'space-between',
            background: !activeStyle ? '#000080' : 'transparent', color: !activeStyle ? '#fff' : '#000',
          }}
        >
          <span>Tous les styles</span>
          <span style={{ color: !activeStyle ? '#adf' : '#666' }}>[{artists.length}]</span>
        </div>
        {mainStyles.map(style => {
          const count = artists.filter(a => {
            const s = (a.style || '').toLowerCase();
            const g = (a.sous_genre || '').toLowerCase();
            const searchRaw = style.toLowerCase();
            return s.includes(searchRaw) || g.includes(searchRaw);
          }).length;

          const isActive = activeStyle === style;
          return (
            <div
              key={style}
              onClick={() => setActiveStyle(style)}
              style={{
                ...winFont, padding: '2px 8px', cursor: 'default', display: 'flex', justifyContent: 'space-between',
                background: isActive ? '#000080' : 'transparent', color: isActive ? '#fff' : '#000',
              }}
            >
              <span>{style}</span>
              <span style={{ color: isActive ? '#adf' : '#666' }}>[{count}]</span>
            </div>
          );
        })}
      </div>

      <div style={{ borderTop: '2px solid', borderColor: '#808080 #dfdfdf #dfdfdf #808080', padding: '6px', background: '#c0c0c0' }}>
        <div style={{ ...sunken, background: '#fff', padding: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', paddingBottom: '6px', borderBottom: '1px solid #ddd' }}>
            <img src="/sanglier.png" style={{ width: 40, height: 40, objectFit: 'cover', flexShrink: 0, ...raised }} alt="logo" />
            <div>
              <div style={{ ...winFont, fontSize: '10px', fontWeight: 'bold', color: '#000080', lineHeight: 1.2 }}>Super Bernard</div>
              <div style={{ ...winFont, fontSize: '10px', fontWeight: 'bold', color: '#000080', lineHeight: 1.2 }}>3000</div>
            </div>
          </div>

          <div style={{ ...winFont, fontSize: '10px' }}>Artistes : <b>{artists.length}</b></div>
          <div style={{ ...winFont, fontSize: '10px' }}>Styles : <b>{mainStyles.length}</b></div>
          <div style={{ ...winFont, fontSize: '10px' }}>Zones : <b>{uniqueZones}</b></div>
          <div style={{ ...winFont, fontSize: '10px' }}>Validés 🐗 : <b>{validatedCount}</b></div>
        </div>
      </div>

      <div style={{ borderTop: '2px solid', borderColor: '#808080 #dfdfdf #dfdfdf #808080', padding: '6px', background: '#c0c0c0' }}>
        <div style={{ ...sunken, background: '#fff', padding: '6px' }}>
          <div style={{ ...winFont, fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}>Validation 🐗</div>
          {[
            { id: 'all', label: 'Tous', count: artists.length },
            { id: 'validated', label: 'Validés', count: validatedCount },
            { id: 'pending', label: 'À valider', count: artists.length - validatedCount },
          ].map(item => (
            <div
              key={item.id}
              onClick={() => setValidationFilter(item.id)}
              style={{
                ...winFont,
                padding: '2px 4px',
                cursor: 'default',
                display: 'flex',
                justifyContent: 'space-between',
                background: validationFilter === item.id ? '#000080' : 'transparent',
                color: validationFilter === item.id ? '#fff' : '#000',
              }}
            >
              <span>{item.label}</span>
              <span style={{ color: validationFilter === item.id ? '#adf' : '#666' }}>[{item.count}]</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
