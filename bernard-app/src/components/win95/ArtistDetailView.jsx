import React, { useEffect, useRef, useState } from "react";
import { formatValidationDate, isArtistValidated, raised, sunken, winFont, Win95Button } from "./ArtistWindowCommon";

const SOUNDCLOUD_WIDGET_SCRIPT = 'https://w.soundcloud.com/player/api.js';

let soundCloudWidgetApiPromise = null;

function ensureSoundCloudWidgetApi() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.SC?.Widget) return Promise.resolve(window.SC.Widget);
  if (soundCloudWidgetApiPromise) return soundCloudWidgetApiPromise;

  soundCloudWidgetApiPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SOUNDCLOUD_WIDGET_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.SC?.Widget || null), { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = SOUNDCLOUD_WIDGET_SCRIPT;
    script.async = true;
    script.onload = () => resolve(window.SC?.Widget || null);
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return soundCloudWidgetApiPromise;
}

function normalizeSoundCloudArtistUrl(url) {
  const raw = String(url || '').trim().replace('m.soundcloud.com', 'soundcloud.com');
  if (!raw) return '';

  try {
    const parsed = new URL(raw);
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length === 1) parsed.pathname = `/${parts[0]}/tracks`;
    return parsed.toString();
  } catch {
    return raw;
  }
}

function getHiddenWidgetUrl(artist) {
  if (!artist?.soundcloud) return '';
  const standardUrl = normalizeSoundCloudArtistUrl(artist.soundcloud);
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(standardUrl)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&show_artwork=false&show_playcount=false&buying=false&sharing=false&download=false`;
}

export function ArtistDetailView({ artist, onClose, onEdit, playTrack, onToggleValidation }) {
  const [widgetReady, setWidgetReady] = useState(false);
  const [widgetStatus, setWidgetStatus] = useState('');
  const hiddenIframeRef = useRef(null);
  const widgetRef = useRef(null);

  if (!artist) return null;

  const hasAudio = artist.spotify || artist.soundcloud || artist.youtube || artist.bandcamp;
  const hasSoundCloud = !!artist.soundcloud;
  const validated = isArtistValidated(artist);
  const validationDate = formatValidationDate(artist.date_validation);
  const hiddenWidgetUrl = getHiddenWidgetUrl(artist);

  useEffect(() => {
    let cancelled = false;
    setWidgetReady(false);
    widgetRef.current = null;

    if (!hasSoundCloud || !hiddenIframeRef.current || !hiddenWidgetUrl) {
      setWidgetStatus('');
      return undefined;
    }

    setWidgetStatus('Initialisation SoundCloud...');

    ensureSoundCloudWidgetApi()
      .then((Widget) => {
        if (cancelled || !Widget || !hiddenIframeRef.current || !window.SC?.Widget?.Events) return;
        const widget = Widget(hiddenIframeRef.current);
        widgetRef.current = widget;

        widget.bind(window.SC.Widget.Events.READY, () => {
          if (cancelled) return;
          setWidgetReady(true);
          setWidgetStatus('Prêt');
        });
      })
      .catch(() => {
        if (!cancelled) {
          setWidgetReady(false);
          setWidgetStatus('Widget non disponible');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [artist?.id, hasSoundCloud, hiddenWidgetUrl]);

  const handleWidgetPlay = () => {
    if (hasSoundCloud && widgetRef.current && widgetReady) {
      widgetRef.current.play();
      setWidgetStatus('Lecture');
      return;
    }
    playTrack(artist);
  };

  const handleWidgetPause = () => {
    if (hasSoundCloud && widgetRef.current && widgetReady) {
      widgetRef.current.pause();
      setWidgetStatus('Pause');
    }
  };

  const handleWidgetNext = () => {
    if (hasSoundCloud && widgetRef.current && widgetReady) {
      widgetRef.current.next();
      setWidgetStatus('Suivant');
      return;
    }
    playTrack(artist);
  };

  return (
    <div style={{ padding: '12px', background: '#c0c0c0', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        <div style={{ borderBottom: '1px solid #fff', marginBottom: '8px', display: 'flex' }}>
          <div style={{ padding: '4px 8px', ...raised, borderBottom: 'none', background: '#c0c0c0', zIndex: 2, marginBottom: '-1px' }}>
            <span style={winFont}>Général</span>
          </div>
        </div>

        <div style={{ border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '12px', background: '#c0c0c0', marginTop: '-2px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
            <img src={artist.photo_or_logo_link || artist.photo || "/sanglier.png"} style={{ width: 64, height: 64, objectFit: 'cover', ...raised, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...winFont, fontSize: '16px', fontWeight: 'bold' }}>{artist.nom_artiste || artist.nom}</div>
              <div style={{ ...winFont, color: '#444' }}>{artist.style || '—'} ({artist.type_performance || '—'})</div>
              <div style={{ ...winFont, color: '#000080', fontWeight: 'bold' }}>{artist.statut_localite || 'Statut inconnu'}</div>
              <div style={{ ...winFont, color: validated ? '#0a5f00' : '#666', fontWeight: 'bold', marginTop: '4px' }}>
                {validated ? `🐗 Validé${validationDate ? ` le ${validationDate}` : ''}` : 'À valider'}
              </div>
            </div>
            {hasAudio && (
              <div style={{ width: 220, minWidth: 220, ...sunken, background: '#efefef', padding: '6px' }}>
                <div style={{ ...winFont, fontWeight: 'bold', color: '#000080', marginBottom: '6px' }}>
                  ▷ Commandes audio{hasSoundCloud ? ' — SoundCloud caché' : ''}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <Win95Button onClick={handleWidgetPlay} style={{ fontWeight: 'bold' }}>▶ Play</Win95Button>
                  <Win95Button onClick={handleWidgetPause} disabled={!hasSoundCloud || !widgetReady}>⏸ Pause</Win95Button>
                  <Win95Button onClick={handleWidgetNext} disabled={!hasSoundCloud || !widgetReady}>⏭ Suivant</Win95Button>
                </div>
                <div style={{ ...winFont, background: '#fff', ...sunken, padding: '6px', marginBottom: '6px', color: '#333' }}>
                  {hasSoundCloud
                    ? (widgetStatus || 'Widget caché en attente...')
                    : 'Pas de SoundCloud ici...... bouton lecture classique seulement.'}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {artist.soundcloud && <a href={artist.soundcloud} target="_blank" rel="noreferrer" style={{ ...winFont, color: '#000080', alignSelf: 'center' }}>SC</a>}
                  {artist.bandcamp && <a href={artist.bandcamp} target="_blank" rel="noreferrer" style={{ ...winFont, color: '#000080', alignSelf: 'center' }}>BC</a>}
                  {artist.spotify && <a href={artist.spotify} target="_blank" rel="noreferrer" style={{ ...winFont, color: '#000080', alignSelf: 'center' }}>SP</a>}
                  {artist.youtube && <a href={artist.youtube} target="_blank" rel="noreferrer" style={{ ...winFont, color: '#000080', alignSelf: 'center' }}>YT</a>}
                </div>
              </div>
            )}
          </div>

          <div style={{ height: '2px', ...sunken, marginBottom: '12px' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', alignItems: 'start' }}>
            <span style={winFont}>Localisation :</span>
            <span style={winFont}>{artist.zone || '—'}{artist.commune_precise ? ` (${artist.commune_precise})` : ''}</span>

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
          <div style={{ ...winFont, fontWeight: 'bold' }}>Notes :</div>
          <div style={{ ...winFont, whiteSpace: 'pre-wrap', maxHeight: '100px', overflowY: 'auto', background: '#fcfcfc', ...sunken, padding: '4px' }}>
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

      {hasSoundCloud && hiddenWidgetUrl && (
        <iframe
          ref={hiddenIframeRef}
          src={hiddenWidgetUrl}
          width="1"
          height="1"
          frameBorder="0"
          allow="autoplay"
          style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, pointerEvents: 'none' }}
          title={`Hidden SoundCloud widget ${artist.nom_artiste || artist.nom}`}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '12px' }}>
        {onToggleValidation && (
          <Win95Button onClick={() => onToggleValidation(artist)} style={{ fontWeight: 'bold' }}>
            {validated ? '↺ Retirer 🐗' : '🐗 Valider'}
          </Win95Button>
        )}
        {hasAudio && (
          <Win95Button onClick={() => playTrack(artist)} style={{ fontWeight: 'bold' }}>▷ Écouter</Win95Button>
        )}
        <Win95Button onClick={onClose} style={{ width: '80px' }}>OK</Win95Button>
        <Win95Button onClick={onEdit} style={{ width: '80px' }}>Ouvrir...</Win95Button>
      </div>
    </div>
  );
}
