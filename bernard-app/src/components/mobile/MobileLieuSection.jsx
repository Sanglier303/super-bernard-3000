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
import { MobileLieuDetail, MobileLieuQuickEditSheet } from './MobileLieuPanels'
import { MobileShell } from './MobileShell'

function MobileLieuCard({ lieu, onOpenDetail, onOpenQuickEdit }) {
  return (
    <div style={mobileCardStyle}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <img src={lieu.photo || '/sanglier.png'} alt="" style={{ width: '72px', height: '72px', objectFit: 'cover', background: '#ddd', border: '2px solid #808080', flexShrink: 0 }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: '17px', fontWeight: 'bold', lineHeight: 1.1 }}>{lieu.nom || 'Lieu'}</div>
          <div style={{ marginTop: '4px', fontSize: '13px', color: '#333' }}>{lieu.type || '—'}</div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#444' }}>{lieu.adresse || '—'}</div>
          <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {lieu.capacite && <span style={{ fontSize: '11px', padding: '2px 6px', background: '#efefef', border: '1px solid #808080' }}>{lieu.capacite}</span>}
            <span style={{ fontSize: '11px', padding: '2px 6px', background: '#efefef', border: '1px solid #808080' }}>{lieu.instagram ? 'Instagram ok' : 'Sans Instagram'}</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <MobileButton onClick={() => onOpenDetail(lieu)}>Voir</MobileButton>
        <MobileButton primary onClick={() => onOpenQuickEdit(lieu)}>⚡ Modifier</MobileButton>
      </div>
    </div>
  )
}

export function MobileLieuSection({
  loading,
  onRefresh,
  activeSection,
  sectionTabs,
  onSectionChange,
  lieuSearchQuery,
  onLieuSearchChange,
  mobileLieux,
  lieuSortConfig,
  onLieuSortConfigChange,
  lieuSortOptions,
  lieuxActiveCount,
  lieuxInstagramCount,
  lieuxPhotoCount,
  detailLieu,
  onOpenLieuDetail,
  onCloseLieuDetail,
  onOpenLieuQuickEdit,
  quickEditLieu,
  lieux,
  saveLieux,
  onCloseLieuQuickEdit,
  activeLieuPanel,
  onSetActiveLieuPanel,
  lieuFilter,
  onLieuFilterChange,
  onToggleLieuPanel,
}) {
  return (
    <MobileShell>
      <MobileSectionHeader
        title="Super Bernard 3000"
        subtitle="Mode mobile lieux"
        onRefresh={onRefresh}
        searchValue={lieuSearchQuery}
        onSearchChange={onLieuSearchChange}
        searchPlaceholder="Rechercher un lieu, type, adresse..."
        activeSection={activeSection}
        sectionTabs={sectionTabs}
        onSectionChange={onSectionChange}
        summaryText={`${mobileLieux.length} lieu(x) visible(s)`}
        sortDirection={lieuSortConfig.direction}
        onSortAsc={() => onLieuSortConfigChange(prev => ({ ...prev, direction: 'asc' }))}
        onSortDesc={() => onLieuSortConfigChange(prev => ({ ...prev, direction: 'desc' }))}
        sortKey={lieuSortConfig.key}
        onSortKeyChange={(value) => onLieuSortConfigChange(prev => ({ ...prev, key: value }))}
        sortOptions={lieuSortOptions}
      />

      <div style={mobileContentStyle}>
        <MobileStatsGrid
          items={[
            { label: 'Actifs', value: lieuxActiveCount },
            { label: 'Instagram', value: lieuxInstagramCount },
            { label: 'Photo', value: lieuxPhotoCount },
          ]}
          columns={3}
        />

        {loading ? (
          <div style={{ ...mobileCardStyle, padding: '16px' }}>Chargement...</div>
        ) : mobileLieux.length === 0 ? (
          <div style={{ ...mobileCardStyle, padding: '16px' }}>Aucun lieu trouvé.</div>
        ) : mobileLieux.map(lieu => (
          <MobileLieuCard
            key={lieu.id}
            lieu={lieu}
            onOpenDetail={onOpenLieuDetail}
            onOpenQuickEdit={onOpenLieuQuickEdit}
          />
        ))}
      </div>

      {detailLieu && <MobileLieuDetail lieu={detailLieu} onClose={onCloseLieuDetail} onQuickEdit={onOpenLieuQuickEdit} />}
      {quickEditLieu && <MobileLieuQuickEditSheet lieu={quickEditLieu} lieux={lieux} onSave={saveLieux} onClose={onCloseLieuQuickEdit} />}

      {activeLieuPanel === 'filters' && (
        <MobileBottomSheet title="Filtres lieux" onClose={() => onSetActiveLieuPanel('browse')}>
          <div style={{ display: 'grid', gap: '8px' }}>
            <MobileButton primary={lieuFilter === 'all'} onClick={() => { onLieuFilterChange('all'); onSetActiveLieuPanel('browse') }}>Tous les lieux</MobileButton>
            <MobileButton primary={lieuFilter === 'instagram'} onClick={() => { onLieuFilterChange('instagram'); onSetActiveLieuPanel('browse') }}>Avec Instagram</MobileButton>
            <MobileButton primary={lieuFilter === 'noinstagram'} onClick={() => { onLieuFilterChange('noinstagram'); onSetActiveLieuPanel('browse') }}>Sans Instagram</MobileButton>
            <MobileButton onClick={() => { onLieuSearchChange(''); onLieuFilterChange('all'); onSetActiveLieuPanel('browse') }}>Réinitialiser</MobileButton>
          </div>
        </MobileBottomSheet>
      )}

      {activeLieuPanel === 'sort' && (
        <MobileBottomSheet title="Tri lieux" onClose={() => onSetActiveLieuPanel('browse')}>
          <div style={{ display: 'grid', gap: '8px' }}>
            {lieuSortOptions.map(option => (
              <MobileButton key={option.key} primary={lieuSortConfig.key === option.key} onClick={() => { onLieuSortConfigChange(prev => ({ ...prev, key: option.key })); onSetActiveLieuPanel('browse') }}>{option.label}{lieuSortConfig.key === option.key ? ` ${lieuSortConfig.direction === 'asc' ? '▲' : '▼'}` : ''}</MobileButton>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
              <MobileButton primary={lieuSortConfig.direction === 'asc'} onClick={() => onLieuSortConfigChange(prev => ({ ...prev, direction: 'asc' }))}>Croissant ▲</MobileButton>
              <MobileButton primary={lieuSortConfig.direction === 'desc'} onClick={() => onLieuSortConfigChange(prev => ({ ...prev, direction: 'desc' }))}>Décroissant ▼</MobileButton>
            </div>
          </div>
        </MobileBottomSheet>
      )}

      {activeLieuPanel === 'stats' && (
        <MobileBottomSheet title="Statistiques lieux" onClose={() => onSetActiveLieuPanel('browse')}>
          <MobileStatsGrid
            items={[
              { label: 'Actifs', value: lieuxActiveCount },
              { label: 'Avec Instagram', value: lieuxInstagramCount },
              { label: 'Avec photo', value: lieuxPhotoCount },
              { label: 'Sans Instagram', value: lieuxActiveCount - lieuxInstagramCount },
            ]}
            columns={2}
          />
        </MobileBottomSheet>
      )}

      <MobileStandardBottomNav
        activePanel={activeLieuPanel}
        onBrowse={() => onSetActiveLieuPanel('browse')}
        onFilters={() => onToggleLieuPanel('filters')}
        onSort={() => onToggleLieuPanel('sort')}
        onStats={() => onToggleLieuPanel('stats')}
      />
    </MobileShell>
  )
}
