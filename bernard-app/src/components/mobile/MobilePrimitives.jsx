import React from 'react'

export const mobilePageStyle = {
  minHeight: '100vh',
  background: '#008080',
  display: 'flex',
  flexDirection: 'column',
  overflowX: 'hidden',
}

export const mobileHeaderStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 20,
  background: '#c0c0c0',
  borderBottom: '2px solid #808080',
  padding: 'calc(10px + env(safe-area-inset-top, 0px)) 10px 10px 10px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}

export const mobileSectionSelectStyle = {
  minHeight: '40px',
  border: '2px solid',
  borderColor: '#808080 #ffffff #ffffff #808080',
  background: '#fff',
  padding: '8px 10px',
  fontSize: '13px',
  fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
  width: '100%',
}

export const mobileContentStyle = {
  flex: 1,
  padding: '12px 12px calc(96px + env(safe-area-inset-bottom, 0px)) 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  overflowX: 'hidden',
}

export const mobileCardStyle = {
  background: '#c0c0c0',
  border: '2px solid',
  borderColor: '#fff #404040 #404040 #fff',
  boxShadow: '1px 1px 0 #808080',
  padding: '10px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
}

export const mobileBottomNavStyle = {
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 25,
  background: '#c0c0c0',
  borderTop: '2px solid #fff',
  padding: '8px 8px calc(8px + env(safe-area-inset-bottom, 0px)) 8px',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(72px, 1fr))',
  gap: '6px',
}

export function MobileSummaryCard({ label, value, accent = '#000080' }) {
  return (
    <div style={{ background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px' }}>
      <div style={{ fontSize: '11px', color: '#555' }}>{label}</div>
      <div style={{ fontSize: '18px', fontWeight: 'bold', color: accent, marginTop: '3px' }}>{value}</div>
    </div>
  )
}

export function MobileButton({ children, onClick, type = 'button', primary = false, danger = false, style, disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        minHeight: '40px',
        border: '2px solid',
        borderColor: '#ffffff #404040 #404040 #ffffff',
        background: danger ? '#a40000' : primary ? '#000080' : '#c0c0c0',
        color: danger || primary ? '#fff' : '#000',
        fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
        fontSize: '13px',
        fontWeight: 'bold',
        padding: '8px 12px',
        borderRadius: 0,
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

export function MobileField({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#222' }}>
      <span style={{ fontWeight: 'bold' }}>{label}</span>
      {children}
    </label>
  )
}

export function MobileBottomSheet({ title, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1800, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '75vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: '#c0c0c0', borderTop: '2px solid #fff', boxShadow: '0 -2px 0 #404040', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#000080' }}>{title}</div>
          <MobileButton onClick={onClose} style={{ minHeight: '34px', padding: '6px 10px' }}>Fermer</MobileButton>
        </div>
        {children}
      </div>
    </div>
  )
}

export function MobileTabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: '44px',
        border: '2px solid',
        borderColor: active ? '#808080 #ffffff #ffffff #808080' : '#ffffff #404040 #404040 #ffffff',
        background: active ? '#d4d0c8' : '#c0c0c0',
        color: '#000',
        fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
        fontSize: '11px',
        fontWeight: 'bold',
        padding: '6px 6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        lineHeight: 1.15,
      }}
    >
      {children}
    </button>
  )
}

export function MobileSectionHeader({
  title,
  subtitle,
  onRefresh,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  activeSection,
  sectionTabs,
  onSectionChange,
  summaryText,
  sortDirection,
  onSortAsc,
  onSortDesc,
  sortKey,
  onSortKeyChange,
  sortOptions,
  children,
}) {
  const searchInputStyle = {
    minHeight: '44px',
    border: '2px solid',
    borderColor: '#808080 #ffffff #ffffff #808080',
    background: '#fff',
    padding: '10px 12px',
    fontSize: '15px',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
  }

  const sortSelectStyle = {
    minHeight: '42px',
    border: '2px solid',
    borderColor: '#808080 #ffffff #ffffff #808080',
    background: '#fff',
    padding: '8px 10px',
    fontSize: '14px',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
    width: '100%',
  }

  return (
    <div style={mobileHeaderStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#000080' }}>{title}</div>
          <div style={{ fontSize: '12px', color: '#333' }}>{subtitle}</div>
        </div>
        <MobileButton onClick={onRefresh} style={{ minHeight: '34px', padding: '6px 10px' }}>↻</MobileButton>
      </div>

      <input value={searchValue} onChange={e => onSearchChange(e.target.value)} placeholder={searchPlaceholder} style={searchInputStyle} />

      <select value={activeSection} onChange={e => onSectionChange(e.target.value)} style={mobileSectionSelectStyle}>
        {sectionTabs.map(tab => <option key={tab.id} value={tab.id}>{tab.label}</option>)}
      </select>

      {typeof summaryText === 'string' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#333' }}>{summaryText}</div>
          <MobileButton onClick={onSortAsc} primary={sortDirection === 'asc'} style={{ minHeight: '34px', padding: '6px 10px' }}>▲</MobileButton>
          <MobileButton onClick={onSortDesc} primary={sortDirection === 'desc'} style={{ minHeight: '34px', padding: '6px 10px' }}>▼</MobileButton>
        </div>
      )}

      {sortOptions && sortKey && onSortKeyChange && (
        <select value={sortKey} onChange={e => onSortKeyChange(e.target.value)} style={sortSelectStyle}>
          {sortOptions.map(option => <option key={option.key} value={option.key}>{option.label}</option>)}
        </select>
      )}

      {children}
    </div>
  )
}

export function MobileStatsGrid({ items, columns = 2, minWidth = 84 }) {
  const targetMinWidth = columns >= 3 ? Math.max(76, minWidth - 8) : minWidth

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${targetMinWidth}px, 1fr))`, gap: '8px' }}>
      {items.map(item => (
        <MobileSummaryCard key={item.label} label={item.label} value={item.value} accent={item.accent || '#000080'} />
      ))}
    </div>
  )
}

export function MobileStandardBottomNav({ activePanel, onBrowse, onFilters, onSort, onStats }) {
  return (
    <div style={mobileBottomNavStyle}>
      <MobileTabButton active={activePanel === 'browse'} onClick={onBrowse}>Liste</MobileTabButton>
      <MobileTabButton active={activePanel === 'filters'} onClick={onFilters}>Filtres</MobileTabButton>
      <MobileTabButton active={activePanel === 'sort'} onClick={onSort}>Tri</MobileTabButton>
      <MobileTabButton active={activePanel === 'stats'} onClick={onStats}>Stats</MobileTabButton>
    </div>
  )
}
