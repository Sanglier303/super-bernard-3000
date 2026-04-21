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
import {
  isArtistValidated,
  getArtistLinkCount,
  getPrimaryAudioUrl,
} from './MobileDataUtils'
import { MobileArtistDetail, MobileQuickEditSheet } from './MobileArtistPanels'
import { MobileShell } from './MobileShell'

function MobileArtistCard({ artist, onOpenDetail, onOpenQuickEdit, onToggleValidation }) {
  const validated = isArtistValidated(artist)
  const linkCount = getArtistLinkCount(artist)
  const primaryAudio = getPrimaryAudioUrl(artist)
  const compactButtonStyle = { minHeight: '34px', padding: '6px 8px', fontSize: '12px' }
  const ghostActionStyle = { minHeight: '28px', padding: '4px 6px', fontSize: '11px' }

  return (
    <div style={{ ...mobileCardStyle, gap: '10px' }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <img
          src={artist.photo_or_logo_link || artist.photo || artist.image_url || '/sanglier.png'}
          alt=""
          style={{ width: '64px', height: '64px', objectFit: 'cover', background: '#ddd', border: '2px solid #808080', flexShrink: 0 }}
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: 1.1, minWidth: 0 }}>{artist.nom_artiste || artist.nom}</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: validated ? '#0a5f00' : '#666', flexShrink: 0 }}>{validated ? '🐗' : '○'}</div>
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#333' }}>{artist.style || '—'}</div>
          <div style={{ marginTop: '3px', fontSize: '11px', color: '#555' }}>{artist.zone || '—'} · {artist.type_performance || '—'}</div>
          <div style={{ marginTop: '5px', fontSize: '11px', color: '#444' }}>
            {artist.statut_localite || '—'} · {linkCount} lien{linkCount > 1 ? 's' : ''}{primaryAudio ? ' · audio' : ''}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '6px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <MobileButton onClick={() => onOpenDetail(artist)} style={compactButtonStyle}>Voir</MobileButton>
          <MobileButton primary onClick={() => onOpenQuickEdit(artist)} style={compactButtonStyle}>Modifier</MobileButton>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <MobileButton onClick={() => onToggleValidation(artist)} style={ghostActionStyle}>{validated ? 'Dévalider' : 'Valider'}</MobileButton>
          <MobileButton onClick={() => primaryAudio ? window.open(primaryAudio, '_blank', 'noopener,noreferrer') : null} disabled={!primaryAudio} style={ghostActionStyle}>Audio</MobileButton>
        </div>
      </div>
    </div>
  )
}

export function MobileArtistSection({
  artists,
  filteredArtists,
  loading,
  onRefresh,
  activeSection,
  sectionTabs,
  onSectionChange,
  searchQuery,
  onSearchChange,
  validationFilter,
  onValidationFilterChange,
  sortConfig,
  onSortConfigChange,
  validatedCount,
  activeCount,
  withPhotoCount,
  withLinksCount,
  withAudioCount,
  activePanel,
  onSetActivePanel,
  onTogglePanel,
  detailArtist,
  onOpenArtistDetail,
  onCloseArtistDetail,
  quickEditArtist,
  onOpenArtistQuickEdit,
  onCloseArtistQuickEdit,
  onToggleValidation,
  saveArtists,
}) {
  const selectStyle = {
    minHeight: '42px',
    border: '2px solid',
    borderColor: '#808080 #ffffff #ffffff #808080',
    background: '#fff',
    padding: '8px 10px',
    fontSize: '14px',
    fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif',
    width: '100%',
  }

  const sortOptions = [
    { key: 'artist', label: 'Artiste' },
    { key: 'zone', label: 'Zone' },
    { key: 'style', label: 'Style' },
    { key: 'performance', label: 'Performance' },
    { key: 'status', label: 'Statut' },
    { key: 'validation', label: 'Validation 🐗' },
    { key: 'links', label: 'Liens' },
  ]

  return (
    <MobileShell>
      <MobileSectionHeader
        title="Super Bernard 3000"
        subtitle="Mode mobile artistes"
        onRefresh={onRefresh}
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Rechercher un artiste, style, zone..."
        activeSection={activeSection}
        sectionTabs={sectionTabs}
        onSectionChange={onSectionChange}
        summaryText={`${filteredArtists.length} visibles · ${validatedCount}/${activeCount} validés 🐗`}
        sortDirection={sortConfig.direction}
        onSortAsc={() => onSortConfigChange(prev => ({ ...prev, direction: 'asc' }))}
        onSortDesc={() => onSortConfigChange(prev => ({ ...prev, direction: 'desc' }))}
        sortKey={sortConfig.key}
        onSortKeyChange={(value) => onSortConfigChange(prev => ({ ...prev, key: value }))}
        sortOptions={sortOptions}
      >
        <select value={validationFilter} onChange={e => onValidationFilterChange(e.target.value)} style={selectStyle}>
          <option value="all">Tous</option>
          <option value="validated">Validés 🐗</option>
          <option value="pending">À valider</option>
        </select>
      </MobileSectionHeader>

      <div style={mobileContentStyle}>
        <MobileStatsGrid
          items={[
            { label: 'Actifs', value: activeCount },
            { label: 'Validés 🐗', value: validatedCount, accent: '#0a5f00' },
            { label: 'Avec liens', value: withLinksCount },
          ]}
          columns={3}
        />

        {loading ? (
          <div style={{ ...mobileCardStyle, padding: '16px' }}>Chargement...</div>
        ) : filteredArtists.length === 0 ? (
          <div style={{ ...mobileCardStyle, padding: '16px' }}>Aucun artiste trouvé.</div>
        ) : filteredArtists.map(artist => (
          <MobileArtistCard
            key={artist.id}
            artist={artist}
            onOpenDetail={onOpenArtistDetail}
            onOpenQuickEdit={onOpenArtistQuickEdit}
            onToggleValidation={onToggleValidation}
          />
        ))}
      </div>

      {detailArtist && (
        <MobileArtistDetail
          artist={detailArtist}
          onClose={onCloseArtistDetail}
          onQuickEdit={(artist) => {
            onOpenArtistQuickEdit(artist)
          }}
          onToggleValidation={onToggleValidation}
        />
      )}

      {quickEditArtist && (
        <MobileQuickEditSheet
          artist={quickEditArtist}
          artists={artists}
          onSave={saveArtists}
          onClose={onCloseArtistQuickEdit}
        />
      )}

      {activePanel === 'filters' && (
        <MobileBottomSheet title="Filtres mobile" onClose={() => onSetActivePanel('browse')}>
          <div style={{ display: 'grid', gap: '8px' }}>
            <MobileButton primary={validationFilter === 'all'} onClick={() => { onValidationFilterChange('all'); onSetActivePanel('browse') }}>Tous les artistes</MobileButton>
            <MobileButton primary={validationFilter === 'validated'} onClick={() => { onValidationFilterChange('validated'); onSetActivePanel('browse') }}>Seulement validés 🐗</MobileButton>
            <MobileButton primary={validationFilter === 'pending'} onClick={() => { onValidationFilterChange('pending'); onSetActivePanel('browse') }}>Seulement à valider</MobileButton>
            <MobileButton onClick={() => { onSearchChange(''); onValidationFilterChange('all'); onSetActivePanel('browse') }}>Réinitialiser les filtres</MobileButton>
          </div>
        </MobileBottomSheet>
      )}

      {activePanel === 'sort' && (
        <MobileBottomSheet title="Tri mobile" onClose={() => onSetActivePanel('browse')}>
          <div style={{ display: 'grid', gap: '8px' }}>
            {sortOptions.map(option => (
              <MobileButton
                key={option.key}
                primary={sortConfig.key === option.key}
                onClick={() => {
                  onSortConfigChange(prev => ({ ...prev, key: option.key }))
                  onSetActivePanel('browse')
                }}
              >
                {option.label}{sortConfig.key === option.key ? ` ${sortConfig.direction === 'asc' ? '▲' : '▼'}` : ''}
              </MobileButton>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
              <MobileButton primary={sortConfig.direction === 'asc'} onClick={() => onSortConfigChange(prev => ({ ...prev, direction: 'asc' }))}>Croissant ▲</MobileButton>
              <MobileButton primary={sortConfig.direction === 'desc'} onClick={() => onSortConfigChange(prev => ({ ...prev, direction: 'desc' }))}>Décroissant ▼</MobileButton>
            </div>
          </div>
        </MobileBottomSheet>
      )}

      {activePanel === 'stats' && (
        <MobileBottomSheet title="Statistiques mobile" onClose={() => onSetActivePanel('browse')}>
          <MobileStatsGrid
            items={[
              { label: 'Actifs', value: activeCount },
              { label: 'Validés 🐗', value: validatedCount, accent: '#0a5f00' },
              { label: 'Avec photo', value: withPhotoCount },
              { label: 'Avec liens', value: withLinksCount },
              { label: 'Avec audio', value: withAudioCount },
              { label: 'À valider', value: activeCount - validatedCount },
            ]}
            columns={2}
          />
        </MobileBottomSheet>
      )}

      <MobileStandardBottomNav
        activePanel={activePanel}
        onBrowse={() => onSetActivePanel('browse')}
        onFilters={() => onTogglePanel('filters')}
        onSort={() => onTogglePanel('sort')}
        onStats={() => onTogglePanel('stats')}
      />
    </MobileShell>
  )
}
