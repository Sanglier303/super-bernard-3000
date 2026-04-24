import { json } from '../../_lib/d1-store.js'

export async function onRequestGet(context) {
  const url = String(new URL(context.request.url).searchParams.get('url') || '').trim()
  if (!url) return json({ status: 'error', message: 'Missing url' }, { status: 400 })

  try {
    const response = await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`, {
      headers: {
        'User-Agent': 'Bernard/1.0 (+https://super-bernard-3000.pages.dev)',
      },
    })

    if (!response.ok) {
      return json({ status: 'error', message: `SoundCloud oEmbed HTTP ${response.status}` }, { status: 502 })
    }

    const data = await response.json()
    const html = String(data?.html || '')
    const match = html.match(/src="([^"]+)"/i)
    const embedUrl = match?.[1] ? match[1].replace(/&amp;/g, '&') : ''

    return json({
      status: 'ok',
      embedUrl,
      html,
      title: data?.title || '',
      authorName: data?.author_name || '',
      authorUrl: data?.author_url || '',
    })
  } catch (err) {
    console.error('[pages] soundcloudOembedError:', err)
    return json({ status: 'error', message: err.message }, { status: 500 })
  }
}
