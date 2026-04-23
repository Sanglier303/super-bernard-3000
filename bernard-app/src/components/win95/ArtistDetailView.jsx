import React from "react";
import { formatValidationDate, isArtistValidated, raised, sunken, winFont, Win95Button } from "./ArtistWindowCommon";

function getMiniPlayerUrl(artist) {
  if (artist?.soundcloud) {
    const standardUrl = String(artist.soundcloud).replace('m.soundcloud.com', 'soundcloud.com').trim();
    return {
      type: 'soundcloud',
      label: 'SoundCloud',
      height: 120,
      url: `https://w.soundcloud.com/player/?url=${encodeURIComponent(standardUrl)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false&show_artwork=false&show_playcount=false&buying=false&sharing=false&download=false`,
    };
  }

  if (artist?.spotify) {
    const spotifyUrl = String(artist.spotify).trim();
    return {
      type: 'spotify',
      label: 'Spotify',
      height: 80,
      url: spotifyUrl.replace('open.spotify.com/', 'open.spotify.com/embed/'),
    };
  }

  if (artist?.youtube) {
    const youtubeUrl = String(artist.youtube).trim();
    if (youtubeUrl.includes('youtube.com/watch?v=')) {
      const id = youtubeUrl.split('v=')[1]?.split('&')[0];
      if (id) {
        return {
          type: 'youtube',
          label: 'YouTube',
          height: 120,
          url: `https://www.youtube.com/embed/${id}`,
        };
      }
    }
    if (youtubeUrl.includes('youtu.be/')) {
      const id = youtubeUrl.split('youtu.be/')[1]?.split('?')[0];
      if (id) {
        return {
          type: 'youtube',
          label: 'YouTube',
          height: 120,
          url: `https://www.youtube.com/embed/${id}`,
        };
      }
    }
  }

  return null;
}

function InfoChip({ label, value, color = '#000', strong = false }) {
  return (
    <div style={{ ...sunken, background: '#efefef', padding: '4px 6px', minWidth: 0 }}>
      <div style={{ ...winFont, fontSize: '9px', color: '#666' }}>{label}</div>
      <div style={{ ...winFont, color, fontWeight: strong ? 'bold' : 'normal', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value || '—'}
      </div>
    </div>
  );
}

function LinkPill({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        ...winFont,
        ...raised,
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        background: '#c0c0c0',
        color: '#000080',
        textDecoration: 'none',
      }}
    >
      {children}
    </a>
  );
}

export function ArtistDetailView({ artist, onClose, onEdit, playTrack, onToggleValidation }) {
  if (!artist) return null;

  const hasAudio = artist.spotify || artist.soundcloud || artist.youtube || artist.bandcamp;
  const validated = isArtistValidated(artist);
  const validationDate = formatValidationDate(artist.date_validation);
  const miniPlayer = getMiniPlayerUrl(artist);
  const artistName = artist.nom_artiste || artist.nom;
  const statusText = artist.statut_localite || 'Statut inconnu';
  const locationText = [artist.zone, artist.commune_precise ? `(${artist.commune_precise})` : ''].filter(Boolean).join(' ');

  return (
    <div style={{ padding: '12px', background: '#c0c0c0', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        <div style={{ borderBottom: '1px solid #fff', marginBottom: '8px', display: 'flex' }}>
          <div style={{ padding: '4px 8px', ...raised, borderBottom: 'none', background: '#c0c0c0', zIndex: 2, marginBottom: '-1px' }}>
            <span style={winFont}>Général</span>
          </div>
        </div>

        <div style={{ border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '12px', background: '#c0c0c0', marginTop: '-2px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: hasAudio ? '104px minmax(0, 1fr) 248px' : '104px minmax(0, 1fr)', gap: '12px', alignItems: 'start', marginBottom: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <img
                src={artist.photo_or_logo_link || artist.photo || "/sanglier.png"}
                style={{ width: 96, height: 96, objectFit: 'cover', ...raised, background: '#fff' }}
                alt={artistName}
              />
              <div style={{ ...sunken, background: '#efefef', padding: '4px 6px' }}>
                <div style={{ ...winFont, fontSize: '9px', color: '#666' }}>Validation</div>
                <div style={{ ...winFont, color: validated ? '#0a5f00' : '#666', fontWeight: 'bold' }}>
                  {validated ? `🐗 Validé${validationDate ? ` le ${validationDate}` : ''}` : 'À valider'}
                </div>
              </div>
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ ...winFont, fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>{artistName}</div>
              <div style={{ ...winFont, color: '#444', marginBottom: '10px' }}>
                {artist.style || '—'}
                {artist.type_performance ? ` · ${artist.type_performance}` : ''}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px', marginBottom: '10px' }}>
                <InfoChip label="Statut" value={statusText} color="#000080" strong />
                <InfoChip label="Localisation" value={locationText || '—'} />
                <InfoChip label="Sous-genre" value={artist.sous_genre || '—'} />
                <InfoChip label="Source" value={artist.source_type || '—'} />
              </div>

              <div style={{ ...sunken, background: '#fcfcfc', padding: '8px', marginBottom: '10px' }}>
                <div style={{ ...winFont, fontSize: '9px', color: '#666', marginBottom: '3px' }}>Preuves / qualification</div>
                <div style={{ ...winFont, color: '#333', whiteSpace: 'pre-wrap' }}>
                  {artist.preuves || 'Aucune preuve renseignée'}
                  {artist.date_preuve ? ` [Le ${artist.date_preuve}]` : ''}
                  {artist.source_localite ? ` (ref: ${artist.source_localite})` : ''}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {onToggleValidation && (
                  <Win95Button onClick={() => onToggleValidation(artist)} style={{ fontWeight: 'bold' }}>
                    {validated ? '↺ Retirer 🐗' : '🐗 Valider'}
                  </Win95Button>
                )}
                {hasAudio && (
                  <Win95Button onClick={() => playTrack(artist)} style={{ fontWeight: 'bold' }}>▷ Écouter</Win95Button>
                )}
                <Win95Button onClick={onEdit}>Ouvrir...</Win95Button>
              </div>
            </div>

            {hasAudio && (
              <div style={{ ...sunken, background: '#efefef', padding: '8px', minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ ...winFont, fontWeight: 'bold', color: '#000080' }}>
                    ▷ Mini player{miniPlayer?.label ? ` — ${miniPlayer.label}` : ''}
                  </div>
                  <div style={{ ...winFont, fontSize: '9px', color: '#666' }}>desktop</div>
                </div>
                {miniPlayer ? (
                  <iframe
                    src={miniPlayer.url}
                    width="100%"
                    height={miniPlayer.height}
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    style={{ display: 'block', border: 'none', background: '#fff', marginBottom: '6px' }}
                    title={`Mini player ${miniPlayer.label}`}
                  />
                ) : (
                  <div style={{ ...winFont, background: '#fff', ...sunken, padding: '8px', marginBottom: '6px' }}>
                    Lecture intégrée non dispo pour ce lien......
                  </div>
                )}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {artist.soundcloud && <LinkPill href={artist.soundcloud}>SoundCloud</LinkPill>}
                  {artist.bandcamp && <LinkPill href={artist.bandcamp}>Bandcamp</LinkPill>}
                  {artist.spotify && <LinkPill href={artist.spotify}>Spotify</LinkPill>}
                  {artist.youtube && <LinkPill href={artist.youtube}>YouTube</LinkPill>}
                </div>
              </div>
            )}
          </div>

          <div style={{ height: '2px', ...sunken, marginBottom: '12px' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', alignItems: 'start' }}>
            <span style={winFont}>Localisation :</span>
            <span style={winFont}>{locationText || '—'}</span>

            <span style={winFont}>Sous-genre :</span>
            <span style={winFont}>{artist.sous_genre || '—'}</span>

            <span style={winFont}>Qualif / Source :</span>
            <span style={winFont}>{artist.source_type || '—'} {artist.source_localite ? `(ref: ${artist.source_localite})` : ''}</span>

            <span style={winFont}>Preuves :</span>
            <span style={{ ...winFont, fontStyle: 'italic', color: '#555' }}>
              {artist.preuves || 'Aucune preuve renseignée'}
              {artist.date_preuve ? ` [Le ${artist.date_preuve}]` : ''}
            </span>

            <span style={winFont}>Validation Bernard :</span>
            <span style={{ ...winFont, color: validated ? '#0a5f00' : '#666', fontWeight: 'bold' }}>
              {validated ? `🐗 Validé${validationDate ? ` le ${validationDate}` : ''}` : 'Non validé'}
            </span>
          </div>

          <div style={{ height: '2px', ...sunken, margin: '12px 0' }} />

          <div style={{ ...winFont, marginBottom: '4px', fontWeight: 'bold' }}>Liens & Réseaux :</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { label: 'Instagram', url: artist.instagram },
              { label: 'Facebook', url: artist.facebook },
              { label: 'SoundCloud', url: artist.soundcloud },
              { label: 'Bandcamp', url: artist.bandcamp },
              { label: 'Spotify', url: artist.spotify },
              { label: 'YouTube', url: artist.youtube },
              { label: 'Site Officiel', url: artist.site_officiel },
            ].filter(x => x.url).map(x => (
              <a key={x.label} href={x.url} target="_blank" rel="noreferrer" style={{ ...winFont, color: '#000080', textDecoration: 'underline' }}>{x.label}</a>
            ))}
          </div>

          <div style={{ height: '2px', ...sunken, margin: '12px 0' }} />
          <div style={{ ...winFont, fontWeight: 'bold', marginBottom: '4px' }}>Notes :</div>
          <div style={{ ...winFont, whiteSpace: 'pre-wrap', minHeight: '88px', maxHeight: '140px', overflowY: 'auto', background: '#fcfcfc', ...sunken, padding: '6px' }}>
            {artist.notes || '—'}
          </div>
          {artist.note_perso && (
            <div style={{ ...winFont, marginTop: '8px', color: '#800080' }}>
              <b>Note perso :</b> {artist.note_perso}
            </div>
          )}
          <div style={{ ...winFont, marginTop: '8px', fontSize: '9px', textAlign: 'right', color: '#888' }}>
            Dernière vérification : {artist.derniere_verification || '—'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '12px' }}>
        <Win95Button onClick={onClose} style={{ width: '80px' }}>OK</Win95Button>
        <Win95Button onClick={onEdit} style={{ width: '80px' }}>Ouvrir...</Win95Button>
      </div>
    </div>
  );
}
