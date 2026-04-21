import React, { useState } from "react";
import { raised, sunken, winFont, Win95Button } from "./ArtistWindowCommon";

export function ArtistEditView({ artist, onSave, onCancel, artists }) {
  const [activeTab, setActiveTab] = useState('general');

  const TABS = [
    { id: 'general', label: 'Général' },
    { id: 'links', label: 'Réseaux' },
    { id: 'quality', label: 'Qualification' },
    { id: 'admin', label: 'Admin' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    let updated;
    let label;
    if (artist && artist.id) {
      updated = artists.map(a => String(a.id) === String(artist.id) ? { ...a, ...data } : a);
      label = `Édition : ${data.nom_artiste}`;
    } else {
      const newArtist = {
        ...data,
        id: Date.now() + Math.random().toString(),
      };
      updated = [...artists, newArtist];
      label = `Création : ${data.nom_artiste}`;
    }
    onSave(updated, label);
  };

  return (
    <div style={{ background: '#c0c0c0', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '8px 8px 0 8px' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #808080', paddingLeft: '4px' }}>
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '3px 10px',
                    cursor: 'default',
                    background: '#c0c0c0',
                    ...winFont,
                    borderLeft: '1px solid #fff',
                    borderTop: '1px solid #fff',
                    borderRight: '1px solid #000',
                    borderBottom: isActive ? '1px solid #c0c0c0' : 'none',
                    boxShadow: isActive ? 'none' : 'inset -1px 0 #808080',
                    marginTop: isActive ? '0' : '2px',
                    zIndex: isActive ? 10 : 1,
                    position: 'relative',
                    marginBottom: '-1px'
                  }}
                >
                  {tab.label}
                </div>
              );
            })}
          </div>

          <div style={{ margin: '0 0 8px 0', ...raised, padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', background: '#c0c0c0', minHeight: '320px' }}>
            <div style={{ display: activeTab === 'general' ? 'block' : 'none' }}>
              <fieldset style={{ border: '1px solid #dfdfdf', padding: '12px', position: 'relative' }}>
                <legend style={{ ...winFont, background: '#c0c0c0', padding: '0 4px' }}>Informations Générales</legend>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', alignItems: 'center' }}>
                  <label style={winFont}>Nom de l'artiste :</label>
                  <input name="nom_artiste" required defaultValue={artist?.nom_artiste || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                  <label style={winFont}>Zone / Ville :</label>
                  <input name="zone" defaultValue={artist?.zone || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                  <label style={winFont}>Commune précise :</label>
                  <input name="commune_precise" defaultValue={artist?.commune_precise || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                  <label style={winFont}>Style musical :</label>
                  <input name="style" defaultValue={artist?.style || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                  <label style={winFont}>Sous-genre :</label>
                  <input name="sous_genre" defaultValue={artist?.sous_genre || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                  <label style={winFont}>Type Performance :</label>
                  <input name="type_performance" defaultValue={artist?.type_performance || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                  <label style={winFont}>URL Photo :</label>
                  <input name="photo" defaultValue={artist?.photo || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                  <label style={winFont}>Photo/Logo (lien) :</label>
                  <input name="photo_or_logo_link" defaultValue={artist?.photo_or_logo_link || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                </div>
              </fieldset>
            </div>

            <div style={{ display: activeTab === 'links' ? 'block' : 'none' }}>
              <fieldset style={{ border: '1px solid #dfdfdf', padding: '12px' }}>
                <legend style={{ ...winFont, background: '#c0c0c0', padding: '0 4px' }}>Réseaux Sociaux & Liens</legend>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', alignItems: 'center' }}>
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
                  <label style={winFont}>Site Officiel :</label>
                  <input name="site_officiel" defaultValue={artist?.site_officiel || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                </div>
              </fieldset>
            </div>

            <div style={{ display: activeTab === 'quality' ? 'block' : 'none' }}>
              <fieldset style={{ border: '1px solid #dfdfdf', padding: '12px' }}>
                <legend style={{ ...winFont, background: '#c0c0c0', padding: '0 4px' }}>Qualification & Preuves</legend>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', alignItems: 'center' }}>
                  <label style={winFont}>Statut localité :</label>
                  <input name="statut_localite" defaultValue={artist?.statut_localite || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                  <label style={winFont}>Source Type :</label>
                  <input name="source_type" defaultValue={artist?.source_type || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                  <label style={winFont}>Source Localité :</label>
                  <input name="source_localite" defaultValue={artist?.source_localite || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                  <label style={winFont}>Preuves :</label>
                  <input name="preuves" defaultValue={artist?.preuves || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                  <label style={winFont}>Date preuve :</label>
                  <input name="date_preuve" defaultValue={artist?.date_preuve || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} placeholder="JJ/MM/AAAA" />
                </div>
              </fieldset>
            </div>

            <div style={{ display: activeTab === 'admin' ? 'block' : 'none' }}>
              <fieldset style={{ border: '1px solid #dfdfdf', padding: '12px' }}>
                <legend style={{ ...winFont, background: '#c0c0c0', padding: '0 4px' }}>Notes & Administration</legend>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', alignItems: 'start' }}>
                  <label style={winFont}>Notes métier :</label>
                  <textarea name="notes" defaultValue={artist?.notes || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none', height: '100px', resize: 'none' }} />
                  <label style={winFont}>Note perso :</label>
                  <input name="note_perso" defaultValue={artist?.note_perso || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                  <label style={winFont}>Dernière vérif. :</label>
                  <input name="derniere_verification" defaultValue={artist?.derniere_verification || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                  <label style={winFont}>Validation 🐗 :</label>
                  <select name="validation_sanglier" defaultValue={artist?.validation_sanglier || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none', background: '#fff' }}>
                    <option value="">Non validé</option>
                    <option value="true">Validé</option>
                  </select>
                  <label style={winFont}>Date validation :</label>
                  <input name="date_validation" defaultValue={artist?.date_validation || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} placeholder="YYYY-MM-DD" />
                  <label style={winFont}>Archive (true/empty):</label>
                  <input name="archive" defaultValue={artist?.archive || ''} style={{ ...sunken, padding: '2px 4px', ...winFont, border: 'none' }} />
                </div>
              </fieldset>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', padding: '0 12px 12px 12px' }}>
          <Win95Button type="submit" style={{ width: '80px', fontWeight: 'bold' }}>Enregistrer</Win95Button>
          <Win95Button type="button" onClick={onCancel} style={{ width: '80px' }}>Annuler</Win95Button>
        </div>
      </form>
    </div>
  );
}
