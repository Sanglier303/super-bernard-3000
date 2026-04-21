import React from 'react'
import {
  mobileContentStyle,
  mobileCardStyle,
  MobileButton,
  MobileBottomSheet,
  MobileSectionHeader,
  MobileStatsGrid,
  MobileStandardBottomNav,
} from './MobilePrimitives'
import { MobileFestivalDetail, MobileFestivalQuickEditSheet } from './MobileFestivalPanels'
import { MobileShell } from './MobileShell'

function MobileFestivalCard({ festival, onOpenDetail, onOpenQuickEdit }) {
  const hasInstagram = !!String(festival.instagram || '').trim()
  const hasPhoto = !!String(festival.photo || '').trim()

  return (
    <div key={festival.id} style={{ ...mobileCardStyle, gap: '10px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '10px' }}>
        <img src={festival.photo || '/sanglier.png'} alt="" style={{ width: '68px', height: '68px', objectFit: 'cover', background: '#ddd', border: '2px solid #808080', flexShrink: 0 }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ fontSize: '17px', fontWeight: 'bold', lineHeight: 1.1 }}>{festival.nom || 'Festival'}</div>
            <div style={{ fontSize: '11px', padding: '2px 6px', background: hasInstagram ? '#eef7ee' : '#f3f3f3', border: '1px solid', borderColor: hasInstagram ? '#5b8a3c' : '#808080', flexShrink: 0 }}>
              {hasInstagram ? 'Réseau ok' : 'À sourcer'}
            </div>
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#333' }}>{festival.style || '—'}</div>
          <div style={{ marginTop: '3px', fontSize: '11px', color: '#555' }}>{festival.lieu || '—'}</div>
          <div style={{ marginTop: '3px', fontSize: '11px', color: '#555' }}>{festival.periode || 'Période inconnue'}</div>
          <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', padding: '2px 6px', background: '#efefef', border: '1px solid #808080' }}>{hasInstagram ? 'Instagram' : 'Sans Instagram'}</span>
            <span style={{ fontSize: '11px', padding: '2px 6px', background: '#efefef', border: '1px solid #808080' }}>{hasPhoto ? 'Visuel ok' : 'Sans visuel'}</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '6px' }}>
        <MobileButton onClick={() => onOpenDetail(festival)} style={{ minHeight: '34px', padding: '6px 8px', fontSize: '12px' }}>Voir</MobileButton>
        <MobileButton primary onClick={() => onOpenQuickEdit(festival)} style={{ minHeight: '34px', padding: '6px 8px', fontSize: '12px' }}>Modifier</MobileButton>
      </div>
    </div>
  )
}

export function MobileFestivalSection({
  loading,
  onRefresh,
  activeSection,
  sectionTabs,
  onSectionChange,
  festivalSearchQuery,
  onFestivalSearchChange,
  mobileFestivals,
  festivalSortConfig,
  onFestivalSortConfigChange,
  festivalSortOptions,
  festivalsActiveCount,
  festivalsInstagramCount,
  festivalsPhotoCount,
  detailFestival,
  onOpenFestivalDetail,
  onCloseFestivalDetail,
  onOpenFestivalQuickEdit,
  quickEditFestival,
  festivals,
  saveFestivals,
  onCloseFestivalQuickEdit,
  activeFestivalPanel,
  onSetActiveFestivalPanel,
  festivalFilter,
  onFestivalFilterChange,
  onToggleFestivalPanel,
}) {
  return (
    <MobileShell>
      <MobileSectionHeader
        title="Super Bernard 3000"
        subtitle="Mode mobile festivals"
        onRefresh={onRefresh}
        searchValue={festivalSearchQuery}
        onSearchChange={onFestivalSearchChange}
        searchPlaceholder="Rechercher un festival, style, lieu..."
        activeSection={activeSection}
        sectionTabs={sectionTabs}
        onSectionChange={onSectionChange}
        summaryText={`${mobileFestivals.length} visible(s) · ${festivalsInstagramCount} avec réseau · ${festivalsPhotoCount} avec visuel`}
        sortDirection={festivalSortConfig.direction}
        onSortAsc={() => onFestivalSortConfigChange(prev => ({ ...prev, direction: 'asc' }))}
        onSortDesc={() => onFestivalSortConfigChange(prev => ({ ...prev, direction: 'desc' }))}
        sortKey={festivalSortConfig.key}
        onSortKeyChange={(value) => onFestivalSortConfigChange(prev => ({ ...prev, key: value }))}
        sortOptions={festivalSortOptions}
      />

      <div style={mobileContentStyle}>
        <MobileStatsGrid
          items={[
            { label: 'Repérés', value: festivalsActiveCount },
            { label: 'Réseau', value: festivalsInstagramCount, accent: '#0a5f00' },
            { label: 'Visuel', value: festivalsPhotoCount },
          ]}
          columns={3}
        />

        {loading ? (
          <div style={{ ...mobileCardStyle, padding: '16px' }}>Chargement...</div>
        ) : mobileFestivals.length === 0 ? (
          <div style={{ ...mobileCardStyle, padding: '16px' }}>Aucun festival trouvé.</div>
        ) : mobileFestivals.map(festival => (
          <MobileFestivalCard
            key={festival.id}
            festival={festival}
            onOpenDetail={onOpenFestivalDetail}
            onOpenQuickEdit={onOpenFestivalQuickEdit}
          />
        ))}
      </div>

      {detailFestival && <MobileFestivalDetail festival={detailFestival} onClose={onCloseFestivalDetail} onQuickEdit={onOpenFestivalQuickEdit} />}
      {quickEditFestival && <MobileFestivalQuickEditSheet festival={quickEditFestival} festivals={festivals} onSave={saveFestivals} onClose={onCloseFestivalQuickEdit} />}

      {activeFestivalPanel === 'filters' && (
        <MobileBottomSheet title="Filtres festivals" onClose={() => onSetActiveFestivalPanel('browse')}>
          <div style={{ display: 'grid', gap: '8px' }}>
            <MobileButton primary={festivalFilter === 'all'} onClick={() => { onFestivalFilterChange('all'); onSetActiveFestivalPanel('browse') }}>Tous les festivals</MobileButton>
            <MobileButton primary={festivalFilter === 'instagram'} onClick={() => { onFestivalFilterChange('instagram'); onSetActiveFestivalPanel('browse') }}>Avec Instagram</MobileButton>
            <MobileButton primary={festivalFilter === 'noinstagram'} onClick={() => { onFestivalFilterChange('noinstagram'); onSetActiveFestivalPanel('browse') }}>Sans Instagram</MobileButton>
            <MobileButton onClick={() => { onFestivalSearchChange(''); onFestivalFilterChange('all'); onSetActiveFestivalPanel('browse') }}>Réinitialiser</MobileButton>
          </div>
        </MobileBottomSheet>
      )}

      {activeFestivalPanel === 'sort' && (
        <MobileBottomSheet title="Tri festivals" onClose={() => onSetActiveFestivalPanel('browse')}>
          <div style={{ display: 'grid', gap: '8px' }}>
            {festivalSortOptions.map(option => (
              <MobileButton key={option.key} primary={festivalSortConfig.key === option.key} onClick={() => { onFestivalSortConfigChange(prev => ({ ...prev, key: option.key })); onSetActiveFestivalPanel('browse') }}>{option.label}{festivalSortConfig.key === option.key ? ` ${festivalSortConfig.direction === 'asc' ? '▲' : '▼'}` : ''}</MobileButton>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginTop: '4px' }}>
              <MobileButton primary={festivalSortConfig.direction === 'asc'} onClick={() => onFestivalSortConfigChange(prev => ({ ...prev, direction: 'asc' }))}>Croissant ▲</MobileButton>
              <MobileButton primary={festivalSortConfig.direction === 'desc'} onClick={() => onFestivalSortConfigChange(prev => ({ ...prev, direction: 'desc' }))}>Décroissant ▼</MobileButton>
            </div>
          </div>
        </MobileBottomSheet>
      )}

      {activeFestivalPanel === 'stats' && (
        <MobileBottomSheet title="Statistiques festivals" onClose={() => onSetActiveFestivalPanel('browse')}>
          <MobileStatsGrid
            items={[
              { label: 'Actifs', value: festivalsActiveCount },
              { label: 'Avec Instagram', value: festivalsInstagramCount },
              { label: 'Avec photo', value: festivalsPhotoCount },
              { label: 'Sans Instagram', value: festivalsActiveCount - festivalsInstagramCount },
            ]}
            columns={2}
          />
        </MobileBottomSheet>
      )}

      <MobileStandardBottomNav
        activePanel={activeFestivalPanel}
        onBrowse={() => onSetActiveFestivalPanel('browse')}
        onFilters={() => onToggleFestivalPanel('filters')}
        onSort={() => onToggleFestivalPanel('sort')}
        onStats={() => onToggleFestivalPanel('stats')}
      />
    </MobileShell>
  )
}
