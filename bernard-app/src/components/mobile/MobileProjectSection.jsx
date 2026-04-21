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
import { getProjectFlags } from './MobileDataUtils'
import { MobileProjectDetail, MobileProjectQuickEditSheet } from './MobileProjectPanels'
import { MobileShell } from './MobileShell'

function MobileProjectCard({ project, onOpenDetail, onOpenQuickEdit }) {
  const { isUrgent, isDone, isDoing, isTodo } = getProjectFlags(project)

  const badgeStyle = {
    fontSize: '11px',
    padding: '2px 6px',
    border: '1px solid #808080',
    background: '#efefef',
  }

  return (
    <div style={{ ...mobileCardStyle, gap: '10px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ fontSize: '17px', fontWeight: 'bold', lineHeight: 1.1 }}>{project.nom || 'Projet'}</div>
          <div style={{ ...badgeStyle, flexShrink: 0, background: isDone ? '#dff0d8' : isUrgent ? '#f8d7da' : isDoing ? '#fff3cd' : '#efefef', borderColor: isDone ? '#5b8a3c' : isUrgent ? '#a40000' : isDoing ? '#b58900' : '#808080', color: isUrgent ? '#7a0000' : '#333' }}>
            {isDone ? 'Fait' : isUrgent ? 'Urgent' : isDoing ? 'En cours' : isTodo ? 'À faire' : (project.statut || 'À faire')}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {project.priorite && <span style={{ ...badgeStyle, background: isUrgent ? '#f8d7da' : '#efefef', borderColor: isUrgent ? '#a40000' : '#808080' }}>{project.priorite}</span>}
          {project.echeance && <span style={{ ...badgeStyle, background: '#fff' }}>⏱ {project.echeance}</span>}
          {project.linked_type && <span style={{ ...badgeStyle, background: '#eef3ff', borderColor: '#5d78a6' }}>↪ {project.linked_type}{project.linked_id ? ` #${project.linked_id}` : ''}</span>}
        </div>

        {project.notes && (
          <div style={{ fontSize: '12px', color: '#444', lineHeight: 1.3 }}>
            {(project.notes || '').slice(0, 110)}{(project.notes || '').length > 110 ? '…' : ''}
          </div>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        <MobileButton onClick={() => onOpenDetail(project)} style={{ minHeight: '34px', padding: '6px 8px', fontSize: '12px' }}>Voir</MobileButton>
        <MobileButton primary onClick={() => onOpenQuickEdit(project)} style={{ minHeight: '34px', padding: '6px 8px', fontSize: '12px' }}>Modifier</MobileButton>
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
  projectsDoingCount,
  projectsTodoCount,
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
        summaryText={`${mobileProjects.length} visible(s) · ${projectsUrgentCount} urgents · ${projectsDoingCount} en cours · ${projectsTodoCount} à faire`}
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
            { label: 'Urgents', value: projectsUrgentCount, accent: '#a40000' },
            { label: 'En cours', value: projectsDoingCount, accent: '#b58900' },
            { label: 'À faire', value: projectsTodoCount },
          ]}
          columns={3}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px' }}>
          <MobileButton primary={projectFilter === 'urgent'} onClick={() => onProjectFilterChange(projectFilter === 'urgent' ? 'all' : 'urgent')} style={{ minHeight: '32px', padding: '5px 6px', fontSize: '11px' }}>Urgents</MobileButton>
          <MobileButton primary={projectFilter === 'doing'} onClick={() => onProjectFilterChange(projectFilter === 'doing' ? 'all' : 'doing')} style={{ minHeight: '32px', padding: '5px 6px', fontSize: '11px' }}>En cours</MobileButton>
          <MobileButton primary={projectFilter === 'todo'} onClick={() => onProjectFilterChange(projectFilter === 'todo' ? 'all' : 'todo')} style={{ minHeight: '32px', padding: '5px 6px', fontSize: '11px' }}>À faire</MobileButton>
          <MobileButton primary={projectFilter === 'done'} onClick={() => onProjectFilterChange(projectFilter === 'done' ? 'all' : 'done')} style={{ minHeight: '32px', padding: '5px 6px', fontSize: '11px' }}>Faits</MobileButton>
        </div>

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
            <MobileButton primary={projectFilter === 'doing'} onClick={() => { onProjectFilterChange('doing'); onSetActiveProjectPanel('browse') }}>En cours</MobileButton>
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
              { label: 'En cours', value: projectsDoingCount, accent: '#b58900' },
              { label: 'À faire', value: projectsTodoCount },
              { label: 'Faits', value: projectsDoneCount, accent: '#0a5f00' },
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
