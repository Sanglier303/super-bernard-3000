import React from "react";
import { sunken, winFont, Win95Button } from "./ArtistWindowCommon";

export function ArtistQuickEditView({ artist, artists, onSave, onCancel }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    const updated = artists.map(a =>
      String(a.id) === String(artist.id)
        ? { ...a, ...data }
        : a
    );

    onSave(updated, `Édition rapide : ${artist?.nom_artiste || artist?.nom || 'Artiste'}`);
  };

  if (!artist) return null;

  return (
    <div style={{ background: '#c0c0c0', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
          <fieldset style={{ border: '1px solid #dfdfdf', padding: '12px', marginBottom: '12px' }}>
            <legend style={{ ...winFont, background: '#c0c0c0', padding: '0 4px' }}>Photo & Visuel</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px', alignItems: 'center' }}>
              <label style={winFont}>URL Photo :</label>
              <input name="photo" defaultValue={artist?.photo || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
              <label style={winFont}>Photo/Logo (lien) :</label>
              <input name="photo_or_logo_link" defaultValue={artist?.photo_or_logo_link || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
            </div>
          </fieldset>

          <fieldset style={{ border: '1px solid #dfdfdf', padding: '12px' }}>
            <legend style={{ ...winFont, background: '#c0c0c0', padding: '0 4px' }}>Liens rapides</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px', alignItems: 'center' }}>
              <label style={winFont}>Instagram :</label>
              <input name="instagram" defaultValue={artist?.instagram || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
              <label style={winFont}>Facebook :</label>
              <input name="facebook" defaultValue={artist?.facebook || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
              <label style={winFont}>SoundCloud :</label>
              <input name="soundcloud" defaultValue={artist?.soundcloud || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
              <label style={winFont}>Bandcamp :</label>
              <input name="bandcamp" defaultValue={artist?.bandcamp || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
              <label style={winFont}>Spotify :</label>
              <input name="spotify" defaultValue={artist?.spotify || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
              <label style={winFont}>YouTube :</label>
              <input name="youtube" defaultValue={artist?.youtube || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
              <label style={winFont}>Site officiel :</label>
              <input name="site_officiel" defaultValue={artist?.site_officiel || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
            </div>
          </fieldset>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px 12px 12px' }}>
          <div style={{ ...winFont, color: '#444' }}>
            {artist?.nom_artiste || artist?.nom}
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <Win95Button type="submit" style={{ width: '95px', fontWeight: 'bold' }}>Enregistrer</Win95Button>
            <Win95Button type="button" onClick={onCancel} style={{ width: '80px' }}>Annuler</Win95Button>
          </div>
        </div>
      </form>
    </div>
  );
}
