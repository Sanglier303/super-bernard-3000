export function isArtistValidated(artist) {
  const raw = String(artist?.validation_sanglier || '').trim().toLowerCase()
  return ['true', '1', 'yes', 'oui', '🐗', 'valide', 'validé'].includes(raw)
}

export function formatValidationDate(date) {
  if (!date) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-')
    return `${d}/${m}/${y}`
  }
  return date
}

export function getArtistLinkCount(artist) {
  return [
    'instagram',
    'facebook',
    'soundcloud',
    'bandcamp',
    'spotify',
    'youtube',
    'site_officiel',
  ].filter(key => String(artist?.[key] || '').trim()).length
}

export function getArtistSortValue(artist, key) {
  switch (key) {
    case 'artist':
      return artist?.nom_artiste || artist?.nom || ''
    case 'zone':
      return artist?.zone || ''
    case 'style':
      return artist?.style || ''
    case 'performance':
      return artist?.type_performance || ''
    case 'status':
      return artist?.statut_localite || ''
    case 'validation':
      return isArtistValidated(artist) ? 1 : 0
    case 'links':
      return getArtistLinkCount(artist)
    default:
      return artist?.nom_artiste || artist?.nom || ''
  }
}

export function compareSortValues(a, b, direction) {
  const dir = direction === 'desc' ? -1 : 1
  const aEmpty = a === null || a === undefined || a === ''
  const bEmpty = b === null || b === undefined || b === ''

  if (aEmpty && bEmpty) return 0
  if (aEmpty) return 1
  if (bEmpty) return -1

  if (typeof a === 'number' && typeof b === 'number') {
    return (a - b) * dir
  }

  return String(a).localeCompare(String(b), 'fr', { sensitivity: 'base' }) * dir
}

export function getPrimaryAudioUrl(artist) {
  return artist?.spotify || artist?.soundcloud || artist?.youtube || artist?.bandcamp || ''
}

export function getCollectifSortValue(collectif, key) {
  switch (key) {
    case 'name':
      return collectif?.nom || ''
    case 'style':
      return collectif?.style || ''
    case 'date':
      return collectif?.date_creation || ''
    case 'instagram':
      return String(collectif?.instagram || '').trim() ? 1 : 0
    case 'photo':
      return String(collectif?.photo || '').trim() ? 1 : 0
    default:
      return collectif?.nom || ''
  }
}

export function getLieuSortValue(lieu, key) {
  switch (key) {
    case 'name':
      return lieu?.nom || ''
    case 'type':
      return lieu?.type || ''
    case 'capacity':
      return Number.parseInt(lieu?.capacite || '0', 10) || 0
    case 'instagram':
      return String(lieu?.instagram || '').trim() ? 1 : 0
    case 'photo':
      return String(lieu?.photo || '').trim() ? 1 : 0
    default:
      return lieu?.nom || ''
  }
}

export function getFestivalSortValue(festival, key) {
  switch (key) {
    case 'name':
      return festival?.nom || ''
    case 'style':
      return festival?.style || ''
    case 'period':
      return festival?.periode || ''
    case 'instagram':
      return String(festival?.instagram || '').trim() ? 1 : 0
    case 'photo':
      return String(festival?.photo || '').trim() ? 1 : 0
    default:
      return festival?.nom || ''
  }
}

export function getProjectFlags(project) {
  const priority = String(project?.priorite || '').trim().toLowerCase()
  const status = String(project?.statut || '').trim().toLowerCase()

  const isUrgent = priority.includes('haute') || priority.includes('urgent') || priority.includes('high')
  const isDone = status.includes('fait') || status.includes('done') || status.includes('term') || status.includes('clos')
  const isDoing = !isDone && (status.includes('cours') || status.includes('progress') || status.includes('travail'))
  const isTodo = !isDone && !isDoing

  return {
    isUrgent,
    isDone,
    isDoing,
    isTodo,
  }
}

export function getProjectSortValue(project, key) {
  const flags = getProjectFlags(project)

  switch (key) {
    case 'name':
      return project?.nom || ''
    case 'status':
      return project?.statut || ''
    case 'priority':
      return project?.priorite || ''
    case 'deadline':
      return project?.echeance || ''
    case 'linked':
      return project?.linked_type || ''
    case 'urgency':
      return flags.isUrgent ? 3 : flags.isDoing ? 2 : flags.isTodo ? 1 : 0
    default:
      return project?.nom || ''
  }
}

export function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
