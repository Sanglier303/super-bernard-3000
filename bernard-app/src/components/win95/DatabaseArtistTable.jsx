import React from "react";
import { formatValidationDate, isArtistValidated, raised, sunken, winFont } from "./ArtistWindowCommon";

export function DatabaseArtistTable({
  columns,
  sortConfig,
  handleSort,
  loading,
  filteredArtists,
  selectedArtist,
  setSelectedArtist,
  compactMode,
  showAvatars,
  openWindow,
  setContextArtist,
  setContextMenuPos,
  playTrack,
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, padding: 2 }}>
      <div style={{ overflowX: 'auto', flex: 1, display: 'flex', flexDirection: 'column', ...sunken, background: '#fff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 2fr) minmax(100px, 1fr) minmax(120px, 1.2fr) minmax(120px, 1.2fr) minmax(110px, 1fr) 64px 100px', ...raised, background: '#c0c0c0', flexShrink: 0 }}>
          {columns.map((column, i) => (
            <div
              key={i}
              onClick={() => handleSort(column.key)}
              title={`Trier par ${column.label}`}
              style={{ ...winFont, fontWeight: 'bold', padding: '3px 6px', borderRight: '1px solid #808080', borderBottom: '1px solid #808080', fontSize: '11px', cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: column.key === 'validation' ? 'center' : 'space-between', gap: '6px' }}
            >
              <span>{column.label}</span>
              <span style={{ color: sortConfig.key === column.key ? '#000080' : '#666', fontSize: '10px', minWidth: '10px', textAlign: 'right' }}>
                {sortConfig.key === column.key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ ...winFont, padding: '20px', textAlign: 'center', color: '#000080' }}>Chargement...</div>
          ) : filteredArtists.length === 0 ? (
            <div style={{ ...winFont, padding: '20px', color: '#808080', textAlign: 'center' }}>Aucun résultat trouvé.</div>
          ) : filteredArtists.map((artist, idx) => {
            const isSelected = selectedArtist?.id === artist.id;
            const validated = isArtistValidated(artist);
            const validationDate = formatValidationDate(artist.date_validation);
            return (
              <div
                key={artist.id}
                onDoubleClick={() => openWindow(`artist_props_${artist.id}`, { artist, artistName: artist.nom_artiste || artist.nom })}
                onClick={() => setSelectedArtist(artist)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedArtist(artist);
                  setContextArtist(artist);
                  setContextMenuPos({ x: e.clientX, y: e.clientY });
                }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(180px, 2fr) minmax(100px, 1fr) minmax(120px, 1.2fr) minmax(120px, 1.2fr) minmax(110px, 1fr) 64px 100px',
                  background: isSelected ? '#000080' : idx % 2 === 0 ? '#ffffff' : '#f4f4f4',
                  color: isSelected ? '#ffffff' : '#000000',
                  cursor: 'default',
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                <div style={{ ...winFont, padding: compactMode ? '0px 6px' : '10px 8px', borderRight: '1px dotted #ccc', display: 'flex', alignItems: 'center', gap: compactMode ? '4px' : '10px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {showAvatars && (
                    <img src={artist.photo_or_logo_link || artist.photo || artist.image_url || "/sanglier.png"} style={{ width: compactMode ? 14 : 48, height: compactMode ? 14 : 48, objectFit: 'cover', flexShrink: 0, background: '#ccc', border: compactMode ? 'none' : '1px solid #808080' }} alt="" />
                  )}
                  {!showAvatars && <span style={{ fontSize: compactMode ? '10px' : '12px' }}>▶</span>}
                  <span style={{ fontSize: compactMode ? '11px' : '13px' }}>{artist.nom_artiste || artist.nom || ''}</span>
                </div>
                <div style={{ ...winFont, padding: compactMode ? '0px 6px' : '10px 8px', borderRight: '1px dotted #ccc', fontSize: compactMode ? '10px' : '12px', color: isSelected ? '#ddd' : '#555', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center' }}>
                  {artist.zone || ''}
                </div>
                <div style={{ ...winFont, padding: compactMode ? '0px 6px' : '10px 8px', borderRight: '1px dotted #ccc', fontSize: compactMode ? '10px' : '12px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center' }}>
                  {artist.style || ''}
                </div>
                <div style={{ ...winFont, padding: compactMode ? '0px 6px' : '10px 8px', borderRight: '1px dotted #ccc', fontSize: compactMode ? '10px' : '12px', color: isSelected ? '#ddd' : '#555', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center' }}>
                  {artist.type_performance || '—'}
                </div>
                <div style={{ ...winFont, padding: compactMode ? '0px 6px' : '10px 8px', borderRight: '1px dotted #ccc', fontSize: compactMode ? '10px' : '11px', color: isSelected ? '#adf' : '#000080', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                  {artist.statut_localite || '—'}
                </div>
                <div title={validated ? `Validé 🐗${validationDate ? ` le ${validationDate}` : ''}` : 'Non validé'} style={{ ...winFont, padding: compactMode ? '0px 6px' : '10px 8px', borderRight: '1px dotted #ccc', fontSize: compactMode ? '12px' : '14px', color: isSelected ? '#fff' : (validated ? '#0a5f00' : '#777'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {validated ? '🐗' : '·'}
                </div>
                <div style={{ padding: compactMode ? '2px 4px' : '10px 8px', display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', overflow: 'hidden' }}>
                  {(artist.spotify || artist.soundcloud || artist.youtube || artist.bandcamp) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); playTrack(artist); }}
                      style={{ ...raised, ...winFont, background: '#c0c0c0', color: '#000080', cursor: 'default', padding: '1px 4px', fontSize: '10px', fontWeight: 'bold' }}
                      title="Lancer dans Radio Bernard"
                    >
                      ▷
                    </button>
                  )}
                  {artist.soundcloud && <a title="SoundCloud" href={artist.soundcloud} target="_blank" onClick={e => e.stopPropagation()} style={{ ...raised, ...winFont, background: '#c0c0c0', color: '#000', textDecoration: 'none', padding: '1px 3px', fontSize: '9px', fontWeight: 'bold' }}>SC</a>}
                  {artist.instagram && <a title="Instagram" href={artist.instagram} target="_blank" onClick={e => e.stopPropagation()} style={{ ...raised, ...winFont, background: '#c0c0c0', color: '#000', textDecoration: 'none', padding: '1px 3px', fontSize: '9px', fontWeight: 'bold' }}>IG</a>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
