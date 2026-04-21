import { isArtistValidated } from "./ArtistWindowCommon";

export function getArtistLinkCount(artist) {
  return [
    'instagram',
    'facebook',
    'soundcloud',
    'bandcamp',
    'spotify',
    'youtube',
    'site_officiel'
  ].filter(key => String(artist?.[key] || '').trim()).length;
}

export function getArtistSortValue(artist, key) {
  switch (key) {
    case 'artist':
      return artist?.nom_artiste || artist?.nom || '';
    case 'zone':
      return artist?.zone || '';
    case 'style':
      return artist?.style || '';
    case 'performance':
      return artist?.type_performance || '';
    case 'status':
      return artist?.statut_localite || '';
    case 'validation':
      return isArtistValidated(artist) ? 1 : 0;
    case 'links':
      return getArtistLinkCount(artist);
    default:
      return '';
  }
}

export function compareSortValues(a, b, direction) {
  const dir = direction === 'desc' ? -1 : 1;
  const aEmpty = a === null || a === undefined || a === '';
  const bEmpty = b === null || b === undefined || b === '';

  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1;
  if (bEmpty) return -1;

  if (typeof a === 'number' && typeof b === 'number') {
    return (a - b) * dir;
  }

  return String(a).localeCompare(String(b), 'fr', { sensitivity: 'base' }) * dir;
}

export function getMainStyles(artists) {
  const allStylesRaw = artists.flatMap(a => (a.style || '').split(' / ').concat((a.style || '').split(', ')).map(x => x.trim()).filter(Boolean));
  const stylesSet = new Set();
  allStylesRaw.forEach(s => {
    const norm = s.toLowerCase();
    if (norm.includes('hard techno')) stylesSet.add('Hard Techno');
    else if (norm.includes('techno')) stylesSet.add('Techno');
    else if (norm.includes('house')) stylesSet.add('House');
    else if (norm.includes('electro')) stylesSet.add('Electro');
    else if (norm.includes('darkwave') || norm.includes('ebm') || norm.includes('synthpop')) stylesSet.add('Darkwave/EBM');
    else if (norm.includes('dnb') || norm.includes('drum and bass') || norm.includes('jungle')) stylesSet.add('DnB');
    else if (norm.includes('tekno')) stylesSet.add('Tekno');
    else if (norm.includes('idm')) stylesSet.add('IDM');
    else if (norm.includes('chill') || norm.includes('ambient')) stylesSet.add('Chill/Ambient');
    else if (norm.includes('psy')) stylesSet.add('Psy');
  });
  return Array.from(stylesSet).sort();
}
