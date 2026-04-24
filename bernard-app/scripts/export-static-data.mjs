import { createHash } from 'node:crypto'
import { mkdir, rm, writeFile, readFile, access } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const appDir = path.resolve(__dirname, '..')
const dataDir = path.resolve(appDir, '..')
const outDir = path.resolve(appDir, 'public', 'data')

const CONFIG = {
  artistes: {
    file: 'artistes_montpellier.real-test.csv',
    cols: [
      'id', 'nom_artiste', 'zone', 'commune_precise', 'style', 'sous_genre', 'type_performance',
      'statut_localite', 'source_type', 'preuves', 'date_preuve', 'instagram', 'facebook',
      'soundcloud', 'bandcamp', 'spotify', 'youtube', 'site_officiel', 'source_localite',
      'notes', 'note_perso', 'photo', 'photo_or_logo_link', 'archive', 'derniere_verification',
      'validation_sanglier', 'date_validation',
    ],
  },
  collectifs: { file: 'collectifs_montpellier.csv', cols: ['id', 'nom', 'style', 'date_creation', 'instagram', 'notes', 'note_perso', 'photo', 'archive'] },
  lieux: { file: 'lieux_montpellier.csv', cols: ['id', 'nom', 'capacite', 'adresse', 'type', 'instagram', 'notes', 'note_perso', 'photo', 'archive'] },
  festivals: { file: 'festivals_montpellier.csv', cols: ['id', 'nom', 'periode', 'duree', 'lieu', 'style', 'instagram', 'notes', 'note_perso', 'photo', 'archive'] },
  projets: { file: 'projets_montpellier.csv', cols: ['id', 'nom', 'statut', 'priorite', 'echeance', 'notes', 'linked_type', 'linked_id', 'archive'] },
  notes: { file: 'notes_montpellier.csv', cols: ['id', 'titre', 'contenu', 'date_derniere_modif', 'archive'] },
  todos: { file: 'todos_montpellier.csv', cols: ['id', 'texte', 'complete', 'date_creation', 'archive'] },
  stickies: { file: 'stickies_montpellier.csv', cols: ['id', 'text', 'archive'] },
}

function parseCSV(text) {
  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]

    if (ch === '"') {
      if (inQuotes && next === '"') {
        cell += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      row.push(cell)
      cell = ''
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i++
      if (cell.length > 0 || row.length > 0) {
        row.push(cell)
        rows.push(row)
        row = []
        cell = ''
      }
    } else {
      cell += ch
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }

  return rows
}

async function exists(targetPath) {
  try {
    await access(targetPath, constants.F_OK)
    return true
  } catch {
    return false
  }
}

function makeStableId(type, row, index) {
  if (row.id) return row.id

  const seed = [
    type,
    row.nom_artiste,
    row.nom,
    row.titre,
    row.texte,
    row.text,
    row.date_creation,
    row.date_derniere_modif,
    index,
  ].filter(Boolean).join('|')

  return `${type}-${createHash('sha1').update(seed).digest('hex').slice(0, 12)}`
}

async function exportType(type, config) {
  const sourcePath = path.resolve(dataDir, config.file)
  const targetPath = path.resolve(outDir, `${type}.json`)

  if (!(await exists(sourcePath))) {
    const emptyPayload = { headers: config.cols, data: [] }
    await writeFile(targetPath, JSON.stringify(emptyPayload, null, 2) + '\n', 'utf8')
    return { type, count: 0, missing: true }
  }

  const content = await readFile(sourcePath, 'utf8')
  const rows = parseCSV(content)
  if (rows.length === 0) {
    const emptyPayload = { headers: config.cols, data: [] }
    await writeFile(targetPath, JSON.stringify(emptyPayload, null, 2) + '\n', 'utf8')
    return { type, count: 0, missing: false }
  }

  const fileHeaders = rows[0].map(header => header.trim())
  const finalHeaders = [...new Set([...config.cols, ...fileHeaders])]
  const data = []

  for (let i = 1; i < rows.length; i++) {
    const rawRow = rows[i]
    if (!rawRow.length) continue

    const item = {}
    finalHeaders.forEach(col => {
      const fileIndex = fileHeaders.indexOf(col)
      item[col] = fileIndex !== -1 ? rawRow[fileIndex] || '' : ''
    })
    item.id = makeStableId(type, item, i - 1)
    data.push(item)
  }

  const payload = { headers: finalHeaders, data }
  await writeFile(targetPath, JSON.stringify(payload, null, 2) + '\n', 'utf8')
  return { type, count: data.length, missing: false }
}

async function main() {
  await rm(outDir, { recursive: true, force: true })
  await mkdir(outDir, { recursive: true })

  const manifest = []
  for (const [type, config] of Object.entries(CONFIG)) {
    manifest.push(await exportType(type, config))
  }

  await writeFile(path.resolve(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8')
  console.log(`[static-data] export ok -> ${outDir}`)
  manifest.forEach(entry => {
    const suffix = entry.missing ? ' (source absente)' : ''
    console.log(`- ${entry.type}: ${entry.count}${suffix}`)
  })
}

main().catch(err => {
  console.error('[static-data] export failed:', err)
  process.exitCode = 1
})
