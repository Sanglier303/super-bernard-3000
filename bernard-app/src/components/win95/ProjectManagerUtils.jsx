export const PROJECT_STATUSES = ["À faire", "En cours", "En attente", "Terminé"];

export function getEntityName(type, id, artists, collectifs, lieux, festivals) {
  if (!type || !id) return '';
  if (type === 'Artiste') return artists?.find(a => String(a.id) === String(id))?.nom_artiste || 'Inconnu';
  if (type === 'Collectif') return collectifs?.find(c => String(c.id) === String(id))?.nom_collectif || 'Inconnu';
  if (type === 'Lieu') return lieux?.find(l => String(l.id) === String(id))?.nom_structure || 'Inconnu';
  if (type === 'Festival') return festivals?.find(f => String(f.id) === String(id))?.nom_festival || 'Inconnu';
  return type;
}
