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
import { MobileProjectDetail, MobileProjectQuickEditSheet } from './MobileProjectPanels'
import { MobileShell } from './MobileShell'

function MobileProjectCard({ project, onOpenDetail, onOpenQuickEdit }) {
  return (
    <div style={mobileCardStyle}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '17px', fontWeight: 'bold', lineHeight: 1.1 }}>{project.nom || 'Projet'}</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {project.statut && <span style={{ fontSize: '11px', padding: '2px 6px', background: '#efefef', border: '1px solid #808080' }}>{project.statut}</span>}
          {project.priorite && <span style={{ fontSize: '11px', padding: '2px 6px', background: '#efefef', border: '1px solid #808080' }}>{project.priorite}</span>}
          {project.echeance && <span style={{ fontSize: '11px', padding: '2px 6px', background: '#efefef', border: '1px solid #808080' }}>{project.echeance}</span>}
        </div>
        {project.linked_type && <div style={{ fontSize: '12px', color: '#444' }}>Lié : {project.linked_type}{project.linked_id ? ` #${project.linked_id}` : ''}</div>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <MobileButton onClick={() => onOpenDetail(project)}>Voir</MobileButton>
        <MobileButton primary onClick={() => onOpenQuickEdit(project)}>⚡ Modifier</MobileButton>
      </div>
    </div>
  )
}

export function MobileProjectSection({
  loading,
  onRefresh,
  activeSection,
  sectionTabs,
  onSectionChange,
  projectSearchQuery,
  onProjectSearchChange,
  mobileProjects,
  projectSortConfig,
  onProjectSortConfigChange,
  projectSortOptions,
  projectsActiveCount,
  projectsUrgentCount,
  projectsDoneCount,
  detailProject,
  onOpenProjectDetail,
  onCloseProjectDetail,
  onOpenProjectQuickEdit,
  quickEditProject,
  projects,
  saveProjects,
  onCloseProjectQuickEdit,
  activeProjectPanel,
  onSetActiveProjectPanel,
  projectFilter,
  onProjectFilterChange,
  onToggleProjectPanel,
}) {
  return (
    <MobileShell>
      <MobileSectionHeader
        title="Super Bernard 3000"
        subtitle="Mode mobile projets"
        onRefresh={onRefresh}
        searchValue={projectSearchQuery}
        onSearchChange={onProjectSearchChange}
        searchPlaceholder="Rechercher un projet, statut, priorité..."
        activeSection={activeSection}
        sectionTabs={sectionTabs}
        onSectionChange={onSectionChange}
        summaryText={`${mobileProjects.length} projet(s) visible(s)`}
        sortDirection={projectSortConfig.direction}
        onSortAsc={() => onProjectSortConfigChange(prev => ({ ...prev, direction: 'asc' }))}
        onSortDesc={() => onProjectSortConfigChange(prev => ({ ...prev, direction: 'desc' }))}
        sortKey={projectSortConfig.key}
        onSortKeyChange={(value) => onProjectSortConfigChange(prev => ({ ...prev, key: value }))}
        sortOptions={projectSortOptions}
      />

      <div style={mobileContentStyle}>
        <MobileStatsGrid
          items={[
            { label: 'Actifs', value: projectsActiveCount },
            { label: 'Urgents', value: projectsUrgentCount, accent: '#a40000' },
            { label: 'Faits', value: projectsDoneCount, accent: '#0a5f00' },
          ]}
          columns={3}
        />

        {loading ? (
          <div style={{ ...mobileCardStyle, padding: '16px' }}>Chargement...</div>
        ) : mobileProjects.length === 0 ? (
          <div style={{ ...mobileCardStyle, padding: '16px' }}>Aucun projet trouvé.</div>
        ) : mobileProjects.map(project => (
          <MobileProjectCard
            key={project.id}
            project={project}
            onOpenDetail={onOpenProjectDetail}
            onOpenQuickEdit={onOpenProjectQuickEdit}
          />
        ))}
      </div>

      {detailProject && <MobileProjectDetail project={detailProject} onClose={onCloseProjectDetail} onQuickEdit={onOpenProjectQuickEdit} />}
      {quickEditProject && <MobileProjectQuickEditSheet project={quickEditProject} projects={projects} onSave={saveProjects} onClose={onCloseProjectQuickEdit} />}

      {activeProjectPanel === 'filters' && (
        <MobileBottomSheet title="Filtres projets" onClose={() => onSetActiveProjectPanel('browse')}>
          <div style={{ display: 'grid', gap: '8px' }}>
            <MobileButton primary={projectFilter === 'all'} onClick={() => { onProjectFilterChange('all'); onSetActiveProjectPanel('browse') }}>Tous les projets</MobileButton>
            <MobileButton primary={projectFilter === 'urgent'} onClick={() => { onProjectFilterChange('urgent'); onSetActiveProjectPanel('browse') }}>Priorité haute</MobileButton>
            <MobileButton primary={projectFilter === 'todo'} onClick={() => { onProjectFilterChange('todo'); onSetActiveProjectPanel('browse') }}>À faire</MobileButton>
            <MobileButton primary={projectFilter === 'done'} onClick={() => { onProjectFilterChange('done'); onSetActiveProjectPanel('browse') }}>Faits</MobileButton>
            <MobileButton onClick={() => { onProjectSearchChange(''); onProjectFilterChange('all'); onSetActiveProjectPanel('browse') }}>Réinitialiser</MobileButton>
          </div>
        </MobileBottomSheet>
      )}

      {activeProjectPanel === 'sort' && (
        <MobileBottomSheet title="Tri projets" onClose={() => onSetActiveProjectPanel('browse')}>
          <div style={{ display: 'grid', gap: '8px' }}>
            {projectSortOptions.map(option => (
              <MobileButton key={option.key} primary={projectSortConfig.key === option.key} onClick={() => { onProjectSortConfigChange(prev => ({ ...prev, key: option.key })); onSetActiveProjectPanel('browse') }}>{option.label}{projectSortConfig.key === option.key ? ` ${projectSortConfig.direction === 'asc' ? '▲' : '▼'}` : ''}</MobileButton>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
              <MobileButton primary={projectSortConfig.direction === 'asc'} onClick={() => onProjectSortConfigChange(prev => ({ ...prev, direction: 'asc' }))}>Croissant ▲</MobileButton>
              <MobileButton primary={projectSortConfig.direction === 'desc'} onClick={() => onProjectSortConfigChange(prev => ({ ...prev, direction: 'desc' }))}>Décroissant ▼</MobileButton>
            </div>
          </div>
        </MobileBottomSheet>
      )}

      {activeProjectPanel === 'stats' && (
        <MobileBottomSheet title="Statistiques projets" onClose={() => onSetActiveProjectPanel('browse')}>
          <MobileStatsGrid
            items={[
              { label: 'Actifs', value: projectsActiveCount },
              { label: 'Urgents', value: projectsUrgentCount, accent: '#a40000' },
              { label: 'Faits', value: projectsDoneCount, accent: '#0a5f00' },
              { label: 'Ouverts', value: projectsActiveCount - projectsDoneCount },
            ]}
            columns={2}
          />
        </MobileBottomSheet>
      )}

      <MobileStandardBottomNav
        activePanel={activeProjectPanel}
        onBrowse={() => onSetActiveProjectPanel('browse')}
        onFilters={() => onToggleProjectPanel('filters')}
        onSort={() => onToggleProjectPanel('sort')}
        onStats={() => onToggleProjectPanel('stats')}
      />
    </MobileShell>
  )
}
