import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

// Helper for Winamp aesthetics
const winFont = { fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif', fontSize: '11px' };
const lcdFont = { fontFamily: '"Courier New", Courier, monospace', fontSize: '13px', color: '#00ff00', background: '#000000', padding: '2px 4px', border: '1px solid #333' };
const raised = { boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf' };
const sunken = { boxShadow: 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff, inset 2px 2px #808080, inset -2px -2px #dfdfdf' };
const SOUNDCLOUD_WIDGET_SCRIPT = 'https://w.soundcloud.com/player/api.js';

let soundCloudWidgetApiPromise = null;

function normalizeSoundCloudEmbedUrl(rawUrl) {
  if (!rawUrl) return rawUrl;

  try {
    const parsed = new URL(rawUrl);
    parsed.searchParams.set('visual', 'false');
    parsed.searchParams.set('auto_play', 'true');
    parsed.searchParams.set('hide_related', 'true');
    parsed.searchParams.set('show_comments', 'false');
    parsed.searchParams.set('show_user', 'true');
    parsed.searchParams.set('show_reposts', 'false');
    parsed.searchParams.set('show_teaser', 'false');
    parsed.searchParams.set('show_artwork', 'false');
    parsed.searchParams.set('show_playcount', 'false');
    parsed.searchParams.set('buying', 'false');
    parsed.searchParams.set('sharing', 'false');
    parsed.searchParams.set('download', 'false');
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

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

export function RadioWindow({ currentTrack, onNextTrack, onNextArtist, onClose }) {
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [soundCloudWidgetReady, setSoundCloudWidgetReady] = useState(false);
  const [soundCloudEmbedUrl, setSoundCloudEmbedUrl] = useState(null);
  const embedIframeRef = useRef(null);
  const soundCloudWidgetRef = useRef(null);

  useEffect(() => {
    if (currentTrack) setPlaying(true);
  }, [currentTrack]);

  useEffect(() => {
    let cancelled = false;
    setSoundCloudEmbedUrl(null);

    if (currentTrack?.sourceKey !== 'soundcloud' || !currentTrack?.url) return undefined;

    fetch(`/api/soundcloud/oembed?url=${encodeURIComponent(currentTrack.url)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.status === 'ok' && data?.embedUrl) {
          setSoundCloudEmbedUrl(normalizeSoundCloudEmbedUrl(data.embedUrl));
        }
      })
      .catch(() => {
        if (!cancelled) setSoundCloudEmbedUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [currentTrack?.url, currentTrack?.sourceKey]);

  useEffect(() => {
    let cancelled = false;
    setSoundCloudWidgetReady(false);
    soundCloudWidgetRef.current = null;

    if (currentTrack?.sourceKey !== 'soundcloud' || !embedIframeRef.current || !soundCloudEmbedUrl) return undefined;

    ensureSoundCloudWidgetApi()
      .then((Widget) => {
        if (cancelled || !Widget || !embedIframeRef.current || !window.SC?.Widget?.Events) return;
        const widget = Widget(embedIframeRef.current);
        soundCloudWidgetRef.current = widget;

        widget.bind(window.SC.Widget.Events.READY, () => {
          if (cancelled) return;
          setSoundCloudWidgetReady(true);
          widget.setVolume(Math.round(volume * 100));
        });
      })
      .catch(() => {
        if (!cancelled) setSoundCloudWidgetReady(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentTrack?.sourceKey, soundCloudEmbedUrl, volume]);

  useEffect(() => {
    if (!soundCloudWidgetRef.current || !soundCloudWidgetReady) return;
    soundCloudWidgetRef.current.setVolume(Math.round(volume * 100));
  }, [volume, soundCloudWidgetReady]);

  useEffect(() => {
    setPlayed(0);
    setDuration(0);
  }, [currentTrack?.url]);

  if (!currentTrack) {
    return (
      <div style={{ background: '#c0c0c0', padding: '20px', textAlign: 'center', ...winFont }}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>📻</div>
        <p>Sélectionnez un artiste dans la base<br />et cliquez sur le bouton de lecture.</p>
      </div>
    );
  }

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('spotify.com')) {
      return url.replace('open.spotify.com/', 'open.spotify.com/embed/');
    }
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (url.includes('soundcloud.com')) {
      if (soundCloudEmbedUrl) return soundCloudEmbedUrl;
      const standardUrl = url.replace('m.soundcloud.com', 'soundcloud.com');
      return normalizeSoundCloudEmbedUrl(`https://w.soundcloud.com/player/?url=${encodeURIComponent(standardUrl)}&color=%23ff5500&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`);
    }
    return null;
  };

  const embedUrl = getEmbedUrl(currentTrack.url);
  const isEmbed = !!embedUrl;
  const isSoundCloudProfileTracks = currentTrack.mode === 'profile-tracks';
  const embedHeight = currentTrack.sourceKey === 'soundcloud' ? 220 : 120;

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const date = new Date(seconds * 1000);
    const mm = date.getUTCMinutes();
    const ss = String(date.getUTCSeconds()).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const handleNextTrackClick = () => {
    if (isSoundCloudProfileTracks && soundCloudWidgetRef.current && soundCloudWidgetReady) {
      soundCloudWidgetRef.current.next();
      return;
    }

    onNextTrack();
  };

  return (
    <div style={{ background: '#c0c0c0', height: '100%', display: 'flex', flexDirection: 'column', padding: '4px' }}>
      {/* Visualizer & Info Section (Winamp Look) */}
      <div style={{ background: '#000', border: '2px solid #808080', padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          <div style={{ color: '#00ff00', fontSize: '10px', fontWeight: 'bold' }}>
            WINAMP 3000 - {currentTrack.source}
            {isSoundCloudProfileTracks
              ? ' (PROFIL /TRACKS)'
              : currentTrack.trackCount > 1
                ? ` (${(currentTrack.trackIndex || 0) + 1}/${currentTrack.trackCount})`
                : ''}
          </div>
          <div style={{ ...lcdFont, minWidth: '80px', textAlign: 'right' }}>
            {isEmbed ? 'LIVE EM' : formatTime(duration * played) + ' / ' + formatTime(duration)}
          </div>
        </div>

        {/* LCD Screen area */}
        <div style={{
          height: isEmbed ? `${embedHeight}px` : '40px',
          border: '1px solid #333',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          background: '#050505'
        }}>
          {isEmbed ? (
            <iframe
              ref={embedIframeRef}
              src={embedUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              allowTransparency="true"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              style={{ border: 'none' }}
            />
          ) : (
            <>
              <div style={{
                color: '#00ff00',
                whiteSpace: 'nowrap',
                position: 'absolute',
                animation: `marquee ${Math.max(10, (currentTrack.artist.nom_artiste || '').length * 0.4)}s linear infinite`,
                fontSize: '13px',
                fontWeight: 'bold',
                top: '10px'
              }}>
                {currentTrack.source} : {currentTrack.artist.nom_artiste || currentTrack.artist.nom}
                {isSoundCloudProfileTracks
                  ? ' --- SOUNDCLOUD TRACKS --- '
                  : currentTrack.trackCount > 1
                    ? ` --- MORCEAU ${(currentTrack.trackIndex || 0) + 1}/${currentTrack.trackCount} --- `
                    : ' --- PLAYING IN BACKGROUND ---'}
              </div>

              {/* Spectrum Visualizer */}
              <div style={{ marginTop: 'auto', height: '15px', display: 'flex', alignItems: 'flex-end', gap: '1px', opacity: 0.7 }}>
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      background: '#00ff00',
                      height: playing ? `${Math.random() * 100}%` : '2px',
                      transition: 'height 0.1s'
                    }}
                  />
                ))}
              </div>
            </>
          )}
          <style>{`
            @keyframes marquee {
              0% { left: 100%; }
              100% { left: -150%; }
            }
          `}</style>
        </div>
      </div>

      {/* Controls Section */}
      <div style={{ padding: '8px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setPlaying(!playing)}
            disabled={isEmbed}
            style={{
              ...raised, width: '40px', height: '30px', background: '#c0c0c0',
              fontSize: '16px', cursor: isEmbed ? 'help' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: isEmbed ? 0.5 : 1
            }}
            title={isEmbed ? 'Utilisez les contrôles du widget ci-dessus' : 'Play/Pause'}
          >
            {playing ? '⏸' : '▶'}
          </button>

          <button
            onClick={handleNextTrackClick}
            disabled={isSoundCloudProfileTracks && !soundCloudWidgetReady}
            style={{
              ...raised, width: '58px', height: '30px', background: '#c0c0c0',
              fontSize: '10px', cursor: isSoundCloudProfileTracks && !soundCloudWidgetReady ? 'wait' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
              opacity: isSoundCloudProfileTracks && !soundCloudWidgetReady ? 0.5 : 1
            }}
            title={isSoundCloudProfileTracks
              ? (soundCloudWidgetReady ? 'Morceau suivant dans le widget SoundCloud' : 'Initialisation du widget SoundCloud')
              : 'Morceau suivant pour cet artiste'}
          >
            ♫ SUIV
          </button>

          <button
            onClick={onNextArtist}
            style={{
              ...raised, width: '58px', height: '30px', background: '#c0c0c0',
              fontSize: '10px', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
            }}
            title="Artiste suivant avec audio"
          >
            👤 SUIV
          </button>

          <div style={{ flex: 1, height: '12px', background: '#444', border: '1px solid #fff', position: 'relative' }}>
            <div
              style={{
                position: 'absolute', top: '-4px', left: `${played * 100}%`,
                width: '10px', height: '18px', background: '#c0c0c0', ...raised,
                display: isEmbed ? 'none' : 'block'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ ...winFont, color: '#000', fontSize: '9px', fontWeight: 'bold' }}>VOLUME</span>
          <input
            type="range" min="0" max="1" step="0.1"
            disabled={isEmbed}
            value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{ flex: 1, height: '4px', cursor: isEmbed ? 'not-allowed' : 'default' }}
          />
        </div>

        {isEmbed && (
          <div style={{ ...winFont, fontSize: '9px', color: '#000080', fontStyle: 'italic', textAlign: 'center' }}>
            {isSoundCloudProfileTracks
              ? (soundCloudWidgetReady ? 'Mode Intégré : ♫ SUIV pilote maintenant le widget SoundCloud.' : 'Mode Intégré : initialisation du pilotage SoundCloud...')
              : 'Mode Intégré : Utilisez les contrôles dans l\'écran LCD vert.'}
          </div>
        )}

        <div style={{ ...sunken, background: '#efefef', padding: '4px 6px', fontSize: '9px', color: '#000', lineHeight: '1.3' }}>
          <div><strong>Artiste :</strong> {currentTrack.artist.nom_artiste || currentTrack.artist.nom}</div>
          <div>
            <strong>{isSoundCloudProfileTracks ? 'Mode :' : 'Morceau :'}</strong>{' '}
            {isSoundCloudProfileTracks
              ? 'Profil SoundCloud /tracks'
              : `${(currentTrack.trackIndex || 0) + 1}${currentTrack.trackCount > 1 ? ` / ${currentTrack.trackCount}` : ''}`}
          </div>
        </div>

        <div style={{ ...sunken, background: '#eee', padding: '4px', fontSize: '9px', color: '#666', marginTop: 'auto', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          LOC: {currentTrack.url}
        </div>
      </div>

      {!isEmbed && (
        <ReactPlayer
          url={currentTrack.url}
          playing={playing}
          volume={volume}
          width="0"
          height="0"
          onProgress={(p) => setPlayed(p.played)}
          onDuration={(d) => setDuration(d)}
          onError={(e) => console.log('Player Error:', e)}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'center', padding: '4px' }}>
        <button className="win95-btn" onClick={onClose} style={{ width: '100px', fontWeight: 'bold' }}>QUITTER</button>
      </div>
    </div>
  );
}
