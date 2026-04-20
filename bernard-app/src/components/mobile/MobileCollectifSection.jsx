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
import { MobileCollectifDetail, MobileCollectifQuickEditSheet } from './MobileCollectifPanels'
import { MobileShell } from './MobileShell'

function MobileCollectifCard({ collectif, onOpenDetail, onOpenQuickEdit }) {
  return (
    <div style={mobileCardStyle}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <img src={collectif.photo || '/sanglier.png'} alt="" style={{ width: '72px', height: '72px', objectFit: 'cover', background: '#ddd', border: '2px solid #808080', flexShrink: 0 }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: '17px', fontWeight: 'bold', lineHeight: 1.1 }}>{collectif.nom || 'Collectif'}</div>
          <div style={{ marginTop: '4px', fontSize: '13px', color: '#333' }}>{collectif.style || '—'}</div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#444' }}>Création : {collectif.date_creation || '—'}</div>
          <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', padding: '2px 6px', background: '#efefef', border: '1px solid #808080' }}>{collectif.instagram ? 'Instagram ok' : 'Sans Instagram'}</span>
            {collectif.photo && <span style={{ fontSize: '11px', padding: '2px 6px', background: '#efefef', border: '1px solid #808080' }}>Photo ok</span>}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <MobileButton onClick={() => onOpenDetail(collectif)}>Voir</MobileButton>
        <MobileButton primary onClick={() => onOpenQuickEdit(collectif)}>⚡ Modifier</MobileButton>
      </div>
    </div>
  )
}

export function MobileCollectifSection({
  loading,
  onRefresh,
  activeSection,
  sectionTabs,
  onSectionChange,
  collectifSearchQuery,
  onCollectifSearchChange,
  mobileCollectifs,
  collectifSortConfig,
  onCollectifSortConfigChange,
  collectifSortOptions,
  collectifsActiveCount,
  collectifsInstagramCount,
  collectifsPhotoCount,
  detailCollectif,
  onOpenCollectifDetail,
  onCloseCollectifDetail,
  onOpenCollectifQuickEdit,
  quickEditCollectif,
  collectifs,
  saveCollectifs,
  onCloseCollectifQuickEdit,
  activeCollectifPanel,
  onSetActiveCollectifPanel,
  collectifFilter,
  onCollectifFilterChange,
  onToggleCollectifPanel,
}) {
  return (
    <MobileShell>
      <MobileSectionHeader
        title="Super Bernard 3000"
        subtitle="Mode mobile collectifs"
        onRefresh={onRefresh}
        searchValue={collectifSearchQuery}
        onSearchChange={onCollectifSearchChange}
        searchPlaceholder="Rechercher un collectif, style..."
        activeSection={activeSection}
        sectionTabs={sectionTabs}
        onSectionChange={onSectionChange}
        summaryText={`${mobileCollectifs.length} collectif(s) visible(s)`}
        sortDirection={collectifSortConfig.direction}
        onSortAsc={() => onCollectifSortConfigChange(prev => ({ ...prev, direction: 'asc' }))}
        onSortDesc={() => onCollectifSortConfigChange(prev => ({ ...prev, direction: 'desc' }))}
        sortKey={collectifSortConfig.key}
        onSortKeyChange={(value) => onCollectifSortConfigChange(prev => ({ ...prev, key: value }))}
        sortOptions={collectifSortOptions}
      />

      <div style={mobileContentStyle}>
        <MobileStatsGrid
          items={[
            { label: 'Actifs', value: collectifsActiveCount },
            { label: 'Instagram', value: collectifsInstagramCount },
            { label: 'Photo', value: collectifsPhotoCount },
          ]}
          columns={3}
        />

        {loading ? (
          <div style={{ ...mobileCardStyle, padding: '16px' }}>Chargement...</div>
        ) : mobileCollectifs.length === 0 ? (
          <div style={{ ...mobileCardStyle, padding: '16px' }}>Aucun collectif trouvé.</div>
        ) : mobileCollectifs.map(collectif => (
          <MobileCollectifCard
            key={collectif.id}
            collectif={collectif}
            onOpenDetail={onOpenCollectifDetail}
            onOpenQuickEdit={onOpenCollectifQuickEdit}
          />
        ))}
      </div>

      {detailCollectif && <MobileCollectifDetail collectif={detailCollectif} onClose={onCloseCollectifDetail} onQuickEdit={onOpenCollectifQuickEdit} />}
      {quickEditCollectif && <MobileCollectifQuickEditSheet collectif={quickEditCollectif} collectifs={collectifs} onSave={saveCollectifs} onClose={onCloseCollectifQuickEdit} />}

      {activeCollectifPanel === 'filters' && (
        <MobileBottomSheet title="Filtres collectifs" onClose={() => onSetActiveCollectifPanel('browse')}>
          <div style={{ display: 'grid', gap: '8px' }}>
            <MobileButton primary={collectifFilter === 'all'} onClick={() => { onCollectifFilterChange('all'); onSetActiveCollectifPanel('browse') }}>Tous les collectifs</MobileButton>
            <MobileButton primary={collectifFilter === 'instagram'} onClick={() => { onCollectifFilterChange('instagram'); onSetActiveCollectifPanel('browse') }}>Avec Instagram</MobileButton>
            <MobileButton primary={collectifFilter === 'noinstagram'} onClick={() => { onCollectifFilterChange('noinstagram'); onSetActiveCollectifPanel('browse') }}>Sans Instagram</MobileButton>
            <MobileButton onClick={() => { onCollectifSearchChange(''); onCollectifFilterChange('all'); onSetActiveCollectifPanel('browse') }}>Réinitialiser</MobileButton>
          </div>
        </MobileBottomSheet>
      )}

      {activeCollectifPanel === 'sort' && (
        <MobileBottomSheet title="Tri collectifs" onClose={() => onSetActiveCollectifPanel('browse')}>
          <div style={{ display: 'grid', gap: '8px' }}>
            {collectifSortOptions.map(option => (
              <MobileButton key={option.key} primary={collectifSortConfig.key === option.key} onClick={() => { onCollectifSortConfigChange(prev => ({ ...prev, key: option.key })); onSetActiveCollectifPanel('browse') }}>{option.label}{collectifSortConfig.key === option.key ? ` ${collectifSortConfig.direction === 'asc' ? '▲' : '▼'}` : ''}</MobileButton>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
              <MobileButton primary={collectifSortConfig.direction === 'asc'} onClick={() => onCollectifSortConfigChange(prev => ({ ...prev, direction: 'asc' }))}>Croissant ▲</MobileButton>
              <MobileButton primary={collectifSortConfig.direction === 'desc'} onClick={() => onCollectifSortConfigChange(prev => ({ ...prev, direction: 'desc' }))}>Décroissant ▼</MobileButton>
            </div>
          </div>
        </MobileBottomSheet>
      )}

      {activeCollectifPanel === 'stats' && (
        <MobileBottomSheet title="Statistiques collectifs" onClose={() => onSetActiveCollectifPanel('browse')}>
          <MobileStatsGrid
            items={[
              { label: 'Actifs', value: collectifsActiveCount },
              { label: 'Avec Instagram', value: collectifsInstagramCount },
              { label: 'Avec photo', value: collectifsPhotoCount },
              { label: 'Sans Instagram', value: collectifsActiveCount - collectifsInstagramCount },
            ]}
            columns={2}
          />
        </MobileBottomSheet>
      )}

      <MobileStandardBottomNav
        activePanel={activeCollectifPanel}
        onBrowse={() => onSetActiveCollectifPanel('browse')}
        onFilters={() => onToggleCollectifPanel('filters')}
        onSort={() => onToggleCollectifPanel('sort')}
        onStats={() => onToggleCollectifPanel('stats')}
      />
    </MobileShell>
  )
}
