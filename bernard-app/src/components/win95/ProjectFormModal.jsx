import React, { useMemo, useState } from "react";
import { raised, sunken, winFont, Win95Button } from "./ArtistWindowCommon";
import { getProjectLinkedId, PROJECT_STATUSES } from "./ProjectManagerUtils";

function TitleBar({ title, onClose }) {
  return (
    <div className="win95-titlebar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000080', color: 'white', padding: '2px 4px', fontWeight: 'bold', fontSize: '11px' }}>
      <div className="flex items-center gap-1 overflow-hidden">
        <span>{title}</span>
      </div>
      <div className="flex items-center gap-0.5">
        <button
          onClick={onClose}
          style={{
            ...raised,
            background: '#c0c0c0', color: '#000', border: 'none', width: '16px', height: '14px',
            fontSize: '9px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0
          }}
        >
          ×
        </button>
      </div>
    </div>
  )
}

export function ProjectFormModal({ project, onSave, onCancel, artists, collectifs, lieux, festivals }) {
  const [type, setType] = useState(project?.linked_type || '');
  const [linkedId, setLinkedId] = useState(getProjectLinkedId(project));

  const entities = useMemo(() => {
    if (type === 'Artiste') return artists || [];
    if (type === 'Collectif') return collectifs || [];
    if (type === 'Lieu') return lieux || [];
    if (type === 'Festival') return festivals || [];
    return [];
  }, [type, artists, collectifs, lieux, festivals]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    data.linked_type = type;
    data.linked_id = linkedId;
    onSave(data);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, background: 'rgba(0,0,0,0.1)' }}>
      <div style={{ background: '#c0c0c0', ...raised, width: '440px', position: 'relative' }}>
        <TitleBar title={project ? "Propriétés du Projet" : "Nouveau Projet (Workspace)"} onClose={onCancel} />
        <form onSubmit={handleSubmit} style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '8px', alignItems: 'center' }}>
            <label style={winFont}>Nom :</label>
            <input name="nom" required defaultValue={project?.nom || ''} style={{ ...sunken, padding: '2px', ...winFont, border: 'none' }} />

            <label style={winFont}>Statut :</label>
            <select name="statut" defaultValue={project?.statut || 'À faire'} style={{ ...sunken, ...winFont, border: 'none' }}>
              {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <label style={winFont}>Priorité :</label>
            <select name="priorite" defaultValue={project?.priorite || 'Normale'} style={{ ...sunken, ...winFont, border: 'none' }}>
              <option value="!!! Haute">!!! Haute</option>
              <option value="Normale">Normale</option>
              <option value="Faible">Faible</option>
            </select>

            <label style={winFont}>Échéance :</label>
            <input name="echeance" type="date" defaultValue={project?.echeance || ''} style={{ ...sunken, ...winFont, border: 'none', padding: '2px' }} />

            <div style={{ gridColumn: '1 / span 2', borderTop: '1px solid #808080', borderBottom: '1px solid #fff', margin: '4px 0' }} />

            <label style={winFont}>Lié à (Type) :</label>
            <select value={type} onChange={e => { setType(e.target.value); setLinkedId(''); }} style={{ ...sunken, ...winFont, border: 'none' }}>
              <option value="">Aucun</option>
              <option value="Artiste">Artiste</option>
              <option value="Collectif">Collectif</option>
              <option value="Lieu">Lieu</option>
              <option value="Festival">Festival</option>
            </select>

            <label style={winFont}>Entité :</label>
            <select value={linkedId} onChange={e => setLinkedId(e.target.value)} disabled={!type} style={{ ...sunken, ...winFont, border: 'none', background: type ? '#fff' : '#dfdfdf' }}>
              <option value="">-- Sélectionner --</option>
              {entities.map(ent => (
                <option key={ent.id} value={ent.id}>
                  {ent.nom_artiste || ent.nom_collectif || ent.nom_structure || ent.nom_festival || 'Inconnu'}
                </option>
              ))}
            </select>

            <div style={{ gridColumn: '1 / span 2', borderTop: '1px solid #808080', borderBottom: '1px solid #fff', margin: '4px 0' }} />

            <label style={winFont}>Notes :</label>
            <textarea name="notes" defaultValue={project?.notes || ''} style={{ ...sunken, height: '60px', ...winFont, border: 'none', padding: '2px', resize: 'none' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #808080' }}>
            <Win95Button type="submit" style={{ width: '80px', fontWeight: 'bold' }}>Enregistrer</Win95Button>
            <Win95Button onClick={onCancel} style={{ width: '80px' }}>Annuler</Win95Button>
          </div>
        </form>
      </div>
    </div>
  )
}
