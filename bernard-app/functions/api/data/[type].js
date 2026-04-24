import { json, normalizeType, readDataset, writeDataset } from '../../_lib/d1-store.js'

export async function onRequestGet(context) {
  const type = normalizeType(context.params?.type)
  if (!type) return json({ headers: [], data: [] }, { status: 404 })

  try {
    const payload = await readDataset(context, type)
    return json(payload)
  } catch (err) {
    console.error('[pages] readDatasetError:', err)
    return json({ status: 'error', message: err.message }, { status: 500 })
  }
}

export async function onRequestPost(context) {
  const type = normalizeType(context.params?.type)
  if (!type) return json({ status: 'error', message: 'Invalid type' }, { status: 400 })

  try {
    const body = await context.request.json()
    const result = await writeDataset(context, type, body?.data || [], body?.actionLabel || '')
    return json(result)
  } catch (err) {
    console.error('[pages] writeDatasetError:', err)
    return json({ status: 'error', message: err.message }, { status: 500 })
  }
}
