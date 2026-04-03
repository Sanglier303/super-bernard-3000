import { useState, useRef, useEffect } from 'react'

const PLATFORM_INFO = {
  instagram: { label: 'Instagram', color: '#E1306C', icon: '📷' },
  facebook:  { label: 'Facebook',  color: '#1877F2', icon: '📘' },
  soundcloud:{ label: 'SoundCloud',color: '#FF5500', icon: '🎵' },
  bandcamp:  { label: 'Bandcamp',  color: '#1DA0C3', icon: '🎸' },
  spotify:   { label: 'Spotify',   color: '#1DB954', icon: '🎧' },
  site_officiel: { label: 'Site',  color: '#8b8fa8', icon: '🌐' },
}

function extractHandle(url, platform) {
  if (!url) return null
  try {
    const u = new URL(url.startsWith('http') ? url : 'https://' + url)
    const parts = u.pathname.split('/').filter(Boolean)
    if (parts.length > 0) return '@' + parts[parts.length - 1]
  } catch (_) { /* noop */ }
  return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]
}

function getFaviconUrl(url) {
  try {
    const u = new URL(url.startsWith('http') ? url : 'https://' + url)
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=16`
  } catch (_) {
    return null
  }
}

export default function LinkPreview({ url, label, platform }) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const timerRef = useRef(null)

  if (!url) return <span className="empty-cell">—</span>

  const info = PLATFORM_INFO[platform] || PLATFORM_INFO['site_officiel']
  const handle = extractHandle(url, platform)
  const favicon = getFaviconUrl(url)

  const show = (e) => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) {
      setPos({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
      })
    }
    timerRef.current = setTimeout(() => setVisible(true), 250)
  }

  const hide = () => {
    clearTimeout(timerRef.current)
    setVisible(false)
  }

  return (
    <>
      <a
        ref={triggerRef}
        className="link link-preview-trigger"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={show}
        onMouseLeave={hide}
        style={{ borderColor: info.color + '55' }}
      >
        <span style={{ fontSize: 11 }}>{info.icon}</span> {label}
      </a>

      {visible && (
        <div
          className="link-preview-popover"
          style={{ top: pos.top, left: pos.left }}
          onMouseEnter={() => clearTimeout(timerRef.current)}
          onMouseLeave={hide}
        >
          <div className="link-preview-header" style={{ borderLeftColor: info.color }}>
            {favicon && (
              <img
                src={favicon}
                alt=""
                className="link-preview-favicon"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <div>
              <div className="link-preview-platform" style={{ color: info.color }}>
                {info.label}
              </div>
              {handle && (
                <div className="link-preview-handle">{handle}</div>
              )}
            </div>
          </div>
          <div className="link-preview-url">{url.replace(/^https?:\/\/(www\.)?/, '')}</div>
        </div>
      )}
    </>
  )
}
