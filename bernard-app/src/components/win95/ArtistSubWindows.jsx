import React, { useState, useMemo } from "react";

function isArtistValidated(artist) {
  const raw = String(artist?.validation_sanglier || '').trim().toLowerCase();
  return ['true', '1', 'yes', 'oui', '🐗', 'valide', 'validé'].includes(raw);
}

function formatValidationDate(date) {
  if (!date) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  }
  return date;
}

// Identical to DatabaseWindow helpers for consistency
function Win95Button({ children, onClick, active, disabled, style, type = "button" }) {
  const winFont = { fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif', fontSize: '11px' };
  const raised = { boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf' };
  const sunken = { boxShadow: 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff, inset 2px 2px #808080, inset -2px -2px #dfdfdf' };

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
        ...style
      }}
    >
      {children}
    </button>
  )
}

const winFont = { fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif', fontSize: '11px' };
const raised = { boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf' };
const sunken = { boxShadow: 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff, inset 2px 2px #808080, inset -2px -2px #dfdfdf' };

export function ArtistDetailView({ artist, onClose, onEdit, playTrack, onToggleValidation }) {
  if (!artist) return null;

  const hasAudio = artist.spotify || artist.soundcloud || artist.youtube || artist.bandcamp;
  const validated = isArtistValidated(artist);
  const validationDate = formatValidationDate(artist.date_validation);

  return (
    <div style={{ padding: '12px', background: '#c0c0c0', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {/* Properties Tab Look */}
          <div style={{ borderBottom: '1px solid #fff', marginBottom: '8px', display: 'flex' }}>
             <div style={{ padding: '4px 8px', ...raised, borderBottom: 'none', background: '#c0c0c0', zIndex: 2, marginBottom: '-1px' }}>
               <span style={winFont}>Général</span>
             </div>
          </div>

          <div style={{ border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '12px', background: '#c0c0c0', marginTop: '-2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <img src={artist.photo_or_logo_link || artist.photo || "/sanglier.png"} style={{ width: 64, height: 64, objectFit: 'cover', ...raised }} />
                <div style={{ flex: 1 }}>
                  <div style={{ ...winFont, fontSize: '16px', fontWeight: 'bold' }}>{artist.nom_artiste || artist.nom}</div>
                  <div style={{ ...winFont, color: '#444' }}>{artist.style || '—'} ({artist.type_performance || '—'})</div>
                  <div style={{ ...winFont, color: '#000080', fontWeight: 'bold' }}>{artist.statut_localite || 'Statut inconnu'}</div>
                  <div style={{ ...winFont, color: validated ? '#0a5f00' : '#666', fontWeight: 'bold', marginTop: '4px' }}>
                    {validated ? `🐗 Validé${validationDate ? ` le ${validationDate}` : ''}` : 'À valider'}
                  </div>
                </div>
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
                   { label: 'Site Officiel', url: artist.site_officiel }
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
        id: Date.now() + Math.random().toString() 
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

            <div style={{ 
              margin: '0 0 8px 0', 
              ...raised, 
              padding: '16px', 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              background: '#c0c0c0',
              minHeight: '320px'
            }}>
               
               {/* Sections */}
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
