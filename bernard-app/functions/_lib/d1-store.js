const ALLOWED_TYPES = new Set([
  'artistes',
  'collectifs',
  'lieux',
  'festivals',
  'projets',
  'notes',
  'todos',
  'stickies',
])

const TYPE_ALIASES = {
  'todo-list': 'todos',
}

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
}

export function normalizeType(rawType) {
  const mapped = TYPE_ALIASES[String(rawType || '').trim()] || String(rawType || '').trim()
  return ALLOWED_TYPES.has(mapped) ? mapped : null
}

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...JSON_HEADERS,
      ...(init.headers || {}),
    },
  })
}

export function getDb(context) {
  const db = context.env?.BERNARD_DB
  if (!db) {
    throw new Error('D1 binding BERNARD_DB manquante')
  }
  return db
}

export async function readDataset(context, type) {
  const db = getDb(context)
  const dataset = normalizeType(type)

  if (!dataset) {
    return { headers: [], data: [] }
  }

  const result = await db
    .prepare('SELECT item_id, payload, sort_index FROM dataset_records WHERE dataset = ? ORDER BY sort_index ASC, item_id ASC')
    .bind(dataset)
    .run()

  const rows = Array.isArray(result?.results) ? result.results : []
  const data = rows.map((row, index) => {
    let payload = {}

    try {
      payload = JSON.parse(String(row.payload || '{}'))
    } catch {
      payload = {}
    }

    if (!payload.id) payload.id = String(row.item_id || '')

    return {
      ...payload,
      _id: index,
    }
  })

  return { headers: [], data }
}

export async function writeDataset(context, type, items = [], actionLabel = '') {
  const db = getDb(context)
  const dataset = normalizeType(type)

  if (!dataset) {
    throw new Error('Invalid type')
  }

  const now = new Date().toISOString()
  const statements = [
    db.prepare('DELETE FROM dataset_records WHERE dataset = ?').bind(dataset),
  ]

  const cleanItems = Array.isArray(items) ? items : []

  cleanItems.forEach((item, index) => {
    const { _id, ...rest } = item || {}
    void _id

    const itemId = String(rest.id || globalThis.crypto.randomUUID())
    const payload = JSON.stringify({ ...rest, id: itemId })

    statements.push(
      db.prepare('INSERT INTO dataset_records (dataset, item_id, sort_index, payload, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(dataset, itemId, index, payload, now, now)
    )
  })

  statements.push(
    db.prepare('INSERT INTO action_logs (dataset, label, created_at) VALUES (?, ?, ?)')
      .bind(dataset, String(actionLabel || `Mise à jour ${dataset}`), now)
  )

  await db.batch(statements)
  return { status: 'ok' }
}
