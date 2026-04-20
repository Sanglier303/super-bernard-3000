import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  isArtistValidated,
  getArtistLinkCount,
  getArtistSortValue,
  compareSortValues,
  getPrimaryAudioUrl,
  getCollectifSortValue,
  getLieuSortValue,
  getFestivalSortValue,
  getProjectSortValue,
} from './MobileDataUtils'
import { MobileArtistSection } from './MobileArtistSection'
import { MobileCollectifSection } from './MobileCollectifSection'
import { MobileFestivalSection } from './MobileFestivalSection'
import { MobileLieuSection } from './MobileLieuSection'
import { MobileProjectSection } from './MobileProjectSection'
import { MobileToolsSection } from './MobileToolsSection'
import { MobileNoteEditSheet, MobileTodoEditSheet, MobileStickyEditSheet } from './MobileToolsEditors'

export function MobileArtistApp({ artists, loading, saveArtists, saveCollectifs, saveLieux, saveFestivals, saveProjects, saveNotes, saveTodos, saveStickies, onRefresh, collectifs = [], lieux = [], festivals = [], projects = [], notes = [], todos = [], stickies = [] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [validationFilter, setValidationFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState({ key: 'artist', direction: 'asc' })
  const [detailArtist, setDetailArtist] = useState(null)
  const [quickEditArtist, setQuickEditArtist] = useState(null)
  const [activePanel, setActivePanel] = useState('browse')
  const [activeSection, setActiveSection] = useState('artists')
  const [collectifSearchQuery, setCollectifSearchQuery] = useState('')
  const [detailCollectif, setDetailCollectif] = useState(null)
  const [quickEditCollectif, setQuickEditCollectif] = useState(null)
  const [collectifFilter, setCollectifFilter] = useState('all')
  const [collectifSortConfig, setCollectifSortConfig] = useState({ key: 'name', direction: 'asc' })
  const [activeCollectifPanel, setActiveCollectifPanel] = useState('browse')
  const [lieuSearchQuery, setLieuSearchQuery] = useState('')
  const [detailLieu, setDetailLieu] = useState(null)
  const [quickEditLieu, setQuickEditLieu] = useState(null)
  const [lieuFilter, setLieuFilter] = useState('all')
  const [lieuSortConfig, setLieuSortConfig] = useState({ key: 'name', direction: 'asc' })
  const [activeLieuPanel, setActiveLieuPanel] = useState('browse')
  const [festivalSearchQuery, setFestivalSearchQuery] = useState('')
  const [detailFestival, setDetailFestival] = useState(null)
  const [quickEditFestival, setQuickEditFestival] = useState(null)
  const [festivalFilter, setFestivalFilter] = useState('all')
  const [festivalSortConfig, setFestivalSortConfig] = useState({ key: 'name', direction: 'asc' })
  const [activeFestivalPanel, setActiveFestivalPanel] = useState('browse')
  const [projectSearchQuery, setProjectSearchQuery] = useState('')
  const [detailProject, setDetailProject] = useState(null)
  const [quickEditProject, setQuickEditProject] = useState(null)
  const [projectFilter, setProjectFilter] = useState('all')
  const [projectSortConfig, setProjectSortConfig] = useState({ key: 'name', direction: 'asc' })
  const [activeProjectPanel, setActiveProjectPanel] = useState('browse')
  const [toolsSearchQuery, setToolsSearchQuery] = useState('')
  const [activeToolsPanel, setActiveToolsPanel] = useState('browse')
  const [editingNote, setEditingNote] = useState(null)
  const [editingTodo, setEditingTodo] = useState(null)
  const [editingSticky, setEditingSticky] = useState(null)
  const scrollRestoreRef = useRef(null)

  const filteredArtists = useMemo(() => {
    const q = searchQuery.toLowerCase()
    const filtered = artists.filter(artist => {
      if (artist.archive === 'true') return false
      const name = (artist.nom_artiste || artist.nom || '').toLowerCase()
      const style = (artist.style || '').toLowerCase()
      const genre = (artist.sous_genre || '').toLowerCase()
      const zone = (artist.zone || '').toLowerCase()
      const status = (artist.statut_localite || '').toLowerCase()
      const matchSearch = !q || name.includes(q) || style.includes(q) || genre.includes(q) || zone.includes(q) || status.includes(q)
      const matchValidation = validationFilter === 'all'
        || (validationFilter === 'validated' && isArtistValidated(artist))
        || (validationFilter === 'pending' && !isArtistValidated(artist))
      return matchSearch && matchValidation
    })

    return [...filtered].sort((a, b) => {
      const primary = compareSortValues(
        getArtistSortValue(a, sortConfig.key),
        getArtistSortValue(b, sortConfig.key),
        sortConfig.direction
      )
      if (primary !== 0) return primary
      return compareSortValues(a.nom_artiste || a.nom || '', b.nom_artiste || b.nom || '', 'asc')
    })
  }, [artists, searchQuery, validationFilter, sortConfig])

  const validatedCount = artists.filter(artist => artist.archive !== 'true' && isArtistValidated(artist)).length
  const activeCount = artists.filter(artist => artist.archive !== 'true').length
  const withPhotoCount = artists.filter(artist => artist.archive !== 'true' && String(artist.photo_or_logo_link || artist.photo || artist.image_url || '').trim()).length
  const withLinksCount = artists.filter(artist => artist.archive !== 'true' && getArtistLinkCount(artist) > 0).length
  const withAudioCount = artists.filter(artist => artist.archive !== 'true' && !!getPrimaryAudioUrl(artist)).length

  const handleToggleValidation = async (artist) => {
    const validated = isArtistValidated(artist)
    const today = new Date().toISOString().slice(0, 10)
    const scrollingElement = document.scrollingElement || document.documentElement || document.body
    const currentScrollTop = typeof window !== 'undefined' ? (window.scrollY || scrollingElement?.scrollTop || 0) : 0
    scrollRestoreRef.current = currentScrollTop

    const updated = artists.map(a =>
      String(a.id) === String(artist.id)
        ? {
            ...a,
            validation_sanglier: validated ? '' : 'true',
            date_validation: validated ? '' : today,
          }
        : a
    )
    await saveArtists(updated, `${validated ? 'Retrait validation sanglier' : 'Validation sanglier'} : ${artist.nom_artiste || artist.nom}`)
    if (detailArtist && String(detailArtist.id) === String(artist.id)) {
      setDetailArtist({
        ...artist,
        validation_sanglier: validated ? '' : 'true',
        date_validation: validated ? '' : today,
      })
    }

    const restore = () => {
      const target = scrollRestoreRef.current
      if (typeof target !== 'number') return
      const element = document.scrollingElement || document.documentElement || document.body
      window.scrollTo(0, target)
      if (element) element.scrollTop = target
    }

    requestAnimationFrame(() => {
      restore()
      requestAnimationFrame(restore)
    })
  }

  const togglePanel = (panel) => {
    setActivePanel(prev => prev === panel ? 'browse' : panel)
  }

  const openArtistDetail = (artist) => {
    setActivePanel('browse')
    setQuickEditArtist(null)
    setDetailArtist(artist)
  }

  const openArtistQuickEdit = (artist) => {
    setActivePanel('browse')
    setDetailArtist(null)
    setQuickEditArtist(artist)
  }

  const closeArtistDetail = () => setDetailArtist(null)
  const closeArtistQuickEdit = () => setQuickEditArtist(null)

  const sectionTabs = [
    { id: 'artists', label: 'Artistes' },
    { id: 'collectifs', label: 'Collectifs' },
    { id: 'lieux', label: 'Lieux' },
    { id: 'festivals', label: 'Festivals' },
    { id: 'projects', label: 'Projets' },
    { id: 'tools', label: 'Outils' },
  ]

  useEffect(() => {
    setDetailArtist(null)
    setQuickEditArtist(null)
    setActivePanel('browse')
    setDetailCollectif(null)
    setQuickEditCollectif(null)
    setActiveCollectifPanel('browse')
    setDetailLieu(null)
    setQuickEditLieu(null)
    setActiveLieuPanel('browse')
    setDetailFestival(null)
    setQuickEditFestival(null)
    setActiveFestivalPanel('browse')
    setDetailProject(null)
    setQuickEditProject(null)
    setActiveProjectPanel('browse')
    setActiveToolsPanel('browse')
    setEditingNote(null)
    setEditingTodo(null)
    setEditingSticky(null)
  }, [activeSection])

  const hasOverlayOpen = !!(
    detailArtist || quickEditArtist || activePanel !== 'browse'
    || detailCollectif || quickEditCollectif || activeCollectifPanel !== 'browse'
    || detailLieu || quickEditLieu || activeLieuPanel !== 'browse'
    || detailFestival || quickEditFestival || activeFestivalPanel !== 'browse'
    || detailProject || quickEditProject || activeProjectPanel !== 'browse'
    || editingNote || editingTodo || editingSticky || activeToolsPanel !== 'browse'
  )

  useEffect(() => {
    if (typeof document === 'undefined') return undefined

    const previousOverflow = document.body.style.overflow
    const previousTouchAction = document.body.style.touchAction

    if (hasOverlayOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    }

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.touchAction = previousTouchAction
    }
  }, [hasOverlayOpen])

  const mobileCollectifs = useMemo(() => {
    const q = collectifSearchQuery.toLowerCase()
    return collectifs
      .filter(collectif => collectif.archive !== 'true')
      .filter(collectif => {
        const name = (collectif.nom || '').toLowerCase()
        const style = (collectif.style || '').toLowerCase()
        const matchSearch = !q || name.includes(q) || style.includes(q)
        const hasInstagram = !!String(collectif.instagram || '').trim()
        const matchFilter = collectifFilter === 'all'
          || (collectifFilter === 'instagram' && hasInstagram)
          || (collectifFilter === 'noinstagram' && !hasInstagram)
        return matchSearch && matchFilter
      })
      .sort((a, b) => {
        const primary = compareSortValues(
          getCollectifSortValue(a, collectifSortConfig.key),
          getCollectifSortValue(b, collectifSortConfig.key),
          collectifSortConfig.direction
        )
        if (primary !== 0) return primary
        return compareSortValues(a.nom || '', b.nom || '', 'asc')
      })
  }, [collectifs, collectifSearchQuery, collectifFilter, collectifSortConfig])

  const mobileLieux = useMemo(() => {
    const q = lieuSearchQuery.toLowerCase()
    return lieux
      .filter(lieu => lieu.archive !== 'true')
      .filter(lieu => {
        const name = (lieu.nom || '').toLowerCase()
        const type = (lieu.type || '').toLowerCase()
        const address = (lieu.adresse || '').toLowerCase()
        const matchSearch = !q || name.includes(q) || type.includes(q) || address.includes(q)
        const hasInstagram = !!String(lieu.instagram || '').trim()
        const matchFilter = lieuFilter === 'all'
          || (lieuFilter === 'instagram' && hasInstagram)
          || (lieuFilter === 'noinstagram' && !hasInstagram)
        return matchSearch && matchFilter
      })
      .sort((a, b) => {
        const primary = compareSortValues(
          getLieuSortValue(a, lieuSortConfig.key),
          getLieuSortValue(b, lieuSortConfig.key),
          lieuSortConfig.direction
        )
        if (primary !== 0) return primary
        return compareSortValues(a.nom || '', b.nom || '', 'asc')
      })
  }, [lieux, lieuSearchQuery, lieuFilter, lieuSortConfig])

  const mobileFestivals = useMemo(() => {
    const q = festivalSearchQuery.toLowerCase()
    return festivals
      .filter(festival => festival.archive !== 'true')
      .filter(festival => {
        const name = (festival.nom || '').toLowerCase()
        const style = (festival.style || '').toLowerCase()
        const place = (festival.lieu || '').toLowerCase()
        const matchSearch = !q || name.includes(q) || style.includes(q) || place.includes(q)
        const hasInstagram = !!String(festival.instagram || '').trim()
        const matchFilter = festivalFilter === 'all'
          || (festivalFilter === 'instagram' && hasInstagram)
          || (festivalFilter === 'noinstagram' && !hasInstagram)
        return matchSearch && matchFilter
      })
      .sort((a, b) => {
        const primary = compareSortValues(
          getFestivalSortValue(a, festivalSortConfig.key),
          getFestivalSortValue(b, festivalSortConfig.key),
          festivalSortConfig.direction
        )
        if (primary !== 0) return primary
        return compareSortValues(a.nom || '', b.nom || '', 'asc')
      })
  }, [festivals, festivalSearchQuery, festivalFilter, festivalSortConfig])

  const mobileProjects = useMemo(() => {
    const q = projectSearchQuery.toLowerCase()
    return projects
      .filter(project => project.archive !== 'true')
      .filter(project => {
        const name = (project.nom || '').toLowerCase()
        const status = (project.statut || '').toLowerCase()
        const priority = (project.priorite || '').toLowerCase()
        const matchSearch = !q || name.includes(q) || status.includes(q) || priority.includes(q)
        const matchFilter = projectFilter === 'all'
          || (projectFilter === 'urgent' && (project.priorite || '').toLowerCase().includes('haut'))
          || (projectFilter === 'todo' && (project.statut || '').toLowerCase().includes('todo'))
          || (projectFilter === 'done' && (project.statut || '').toLowerCase().includes('fait'))
        return matchSearch && matchFilter
      })
      .sort((a, b) => {
        const primary = compareSortValues(
          getProjectSortValue(a, projectSortConfig.key),
          getProjectSortValue(b, projectSortConfig.key),
          projectSortConfig.direction
        )
        if (primary !== 0) return primary
        return compareSortValues(a.nom || '', b.nom || '', 'asc')
      })
  }, [projects, projectSearchQuery, projectFilter, projectSortConfig])

  const toolsQuery = toolsSearchQuery.toLowerCase()
  const mobileNotes = useMemo(
    () => notes.filter(note => note.archive !== 'true').filter(note => !toolsQuery || (note.titre || '').toLowerCase().includes(toolsQuery) || (note.contenu || '').toLowerCase().includes(toolsQuery)),
    [notes, toolsQuery]
  )
  const mobileTodos = useMemo(
    () => todos.filter(todo => todo.archive !== 'true').filter(todo => !toolsQuery || (todo.texte || '').toLowerCase().includes(toolsQuery)),
    [todos, toolsQuery]
  )
  const mobileStickies = useMemo(
    () => stickies.filter(sticky => sticky.archive !== 'true').filter(sticky => !toolsQuery || (sticky.text || '').toLowerCase().includes(toolsQuery)),
    [stickies, toolsQuery]
  )

  const collectifsActiveCount = collectifs.filter(collectif => collectif.archive !== 'true').length
  const collectifsInstagramCount = collectifs.filter(collectif => collectif.archive !== 'true' && String(collectif.instagram || '').trim()).length
  const collectifsPhotoCount = collectifs.filter(collectif => collectif.archive !== 'true' && String(collectif.photo || '').trim()).length
  const lieuxActiveCount = lieux.filter(lieu => lieu.archive !== 'true').length
  const lieuxInstagramCount = lieux.filter(lieu => lieu.archive !== 'true' && String(lieu.instagram || '').trim()).length
  const lieuxPhotoCount = lieux.filter(lieu => lieu.archive !== 'true' && String(lieu.photo || '').trim()).length
  const festivalsActiveCount = festivals.filter(festival => festival.archive !== 'true').length
  const festivalsInstagramCount = festivals.filter(festival => festival.archive !== 'true' && String(festival.instagram || '').trim()).length
  const festivalsPhotoCount = festivals.filter(festival => festival.archive !== 'true' && String(festival.photo || '').trim()).length
  const projectsActiveCount = projects.filter(project => project.archive !== 'true').length
  const projectsUrgentCount = projects.filter(project => project.archive !== 'true' && (project.priorite || '').toLowerCase().includes('haut')).length
  const projectsDoneCount = projects.filter(project => project.archive !== 'true' && (project.statut || '').toLowerCase().includes('fait')).length
  const notesActiveCount = notes.filter(note => note.archive !== 'true').length
  const todosActiveCount = todos.filter(todo => todo.archive !== 'true').length
  const todosDoneCount = todos.filter(todo => todo.archive !== 'true' && todo.complete === 'true').length
  const stickiesActiveCount = stickies.filter(sticky => sticky.archive !== 'true').length

  const collectifSortOptions = [
    { key: 'name', label: 'Nom' },
    { key: 'style', label: 'Style' },
    { key: 'date', label: 'Date création' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'photo', label: 'Photo' },
  ]
  const lieuSortOptions = [
    { key: 'name', label: 'Nom' },
    { key: 'type', label: 'Type' },
    { key: 'capacity', label: 'Capacité' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'photo', label: 'Photo' },
  ]
  const festivalSortOptions = [
    { key: 'name', label: 'Nom' },
    { key: 'style', label: 'Style' },
    { key: 'period', label: 'Période' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'photo', label: 'Photo' },
  ]
  const projectSortOptions = [
    { key: 'name', label: 'Nom' },
    { key: 'status', label: 'Statut' },
    { key: 'priority', label: 'Priorité' },
    { key: 'deadline', label: 'Échéance' },
    { key: 'linked', label: 'Lien' },
  ]

  const toggleTodoComplete = async (todo) => {
    const updated = todos.map(t => String(t.id) === String(todo.id) ? { ...t, complete: t.complete === 'true' ? '' : 'true' } : t)
    await saveTodos(updated, `${todo.complete === 'true' ? 'Réouverture' : 'Validation'} todo mobile : ${todo.texte || 'Todo'}`)
  }

  const openCollectifDetail = (collectif) => {
    setActiveCollectifPanel('browse')
    setQuickEditCollectif(null)
    setDetailCollectif(collectif)
  }

  const openCollectifQuickEdit = (collectif) => {
    setActiveCollectifPanel('browse')
    setDetailCollectif(null)
    setQuickEditCollectif(collectif)
  }

  const toggleCollectifPanel = (panel) => {
    setActiveCollectifPanel(prev => prev === panel ? 'browse' : panel)
  }

  const openLieuDetail = (lieu) => {
    setActiveLieuPanel('browse')
    setQuickEditLieu(null)
    setDetailLieu(lieu)
  }

  const openLieuQuickEdit = (lieu) => {
    setActiveLieuPanel('browse')
    setDetailLieu(null)
    setQuickEditLieu(lieu)
  }

  const toggleLieuPanel = (panel) => {
    setActiveLieuPanel(prev => prev === panel ? 'browse' : panel)
  }

  const openFestivalDetail = (festival) => {
    setActiveFestivalPanel('browse')
    setQuickEditFestival(null)
    setDetailFestival(festival)
  }

  const openFestivalQuickEdit = (festival) => {
    setActiveFestivalPanel('browse')
    setDetailFestival(null)
    setQuickEditFestival(festival)
  }

  const toggleFestivalPanel = (panel) => {
    setActiveFestivalPanel(prev => prev === panel ? 'browse' : panel)
  }

  const openProjectDetail = (project) => {
    setActiveProjectPanel('browse')
    setQuickEditProject(null)
    setDetailProject(project)
  }

  const openProjectQuickEdit = (project) => {
    setActiveProjectPanel('browse')
    setDetailProject(null)
    setQuickEditProject(project)
  }

  const toggleProjectPanel = (panel) => {
    setActiveProjectPanel(prev => prev === panel ? 'browse' : panel)
  }

  if (activeSection === 'collectifs') {
    return (
      <MobileCollectifSection
        loading={loading}
        onRefresh={onRefresh}
        activeSection={activeSection}
        sectionTabs={sectionTabs}
        onSectionChange={setActiveSection}
        collectifSearchQuery={collectifSearchQuery}
        onCollectifSearchChange={setCollectifSearchQuery}
        mobileCollectifs={mobileCollectifs}
        collectifSortConfig={collectifSortConfig}
        onCollectifSortConfigChange={setCollectifSortConfig}
        collectifSortOptions={collectifSortOptions}
        collectifsActiveCount={collectifsActiveCount}
        collectifsInstagramCount={collectifsInstagramCount}
        collectifsPhotoCount={collectifsPhotoCount}
        detailCollectif={detailCollectif}
        onOpenCollectifDetail={openCollectifDetail}
        onCloseCollectifDetail={() => setDetailCollectif(null)}
        onOpenCollectifQuickEdit={openCollectifQuickEdit}
        quickEditCollectif={quickEditCollectif}
        collectifs={collectifs}
        saveCollectifs={saveCollectifs}
        onCloseCollectifQuickEdit={() => setQuickEditCollectif(null)}
        activeCollectifPanel={activeCollectifPanel}
        onSetActiveCollectifPanel={setActiveCollectifPanel}
        collectifFilter={collectifFilter}
        onCollectifFilterChange={setCollectifFilter}
        onToggleCollectifPanel={toggleCollectifPanel}
      />
    )
  }

  if (activeSection === 'lieux') {
    return (
      <MobileLieuSection
        loading={loading}
        onRefresh={onRefresh}
        activeSection={activeSection}
        sectionTabs={sectionTabs}
        onSectionChange={setActiveSection}
        lieuSearchQuery={lieuSearchQuery}
        onLieuSearchChange={setLieuSearchQuery}
        mobileLieux={mobileLieux}
        lieuSortConfig={lieuSortConfig}
        onLieuSortConfigChange={setLieuSortConfig}
        lieuSortOptions={lieuSortOptions}
        lieuxActiveCount={lieuxActiveCount}
        lieuxInstagramCount={lieuxInstagramCount}
        lieuxPhotoCount={lieuxPhotoCount}
        detailLieu={detailLieu}
        onOpenLieuDetail={openLieuDetail}
        onCloseLieuDetail={() => setDetailLieu(null)}
        onOpenLieuQuickEdit={openLieuQuickEdit}
        quickEditLieu={quickEditLieu}
        lieux={lieux}
        saveLieux={saveLieux}
        onCloseLieuQuickEdit={() => setQuickEditLieu(null)}
        activeLieuPanel={activeLieuPanel}
        onSetActiveLieuPanel={setActiveLieuPanel}
        lieuFilter={lieuFilter}
        onLieuFilterChange={setLieuFilter}
        onToggleLieuPanel={toggleLieuPanel}
      />
    )
  }

  if (activeSection === 'festivals') {
    return (
      <MobileFestivalSection
        loading={loading}
        onRefresh={onRefresh}
        activeSection={activeSection}
        sectionTabs={sectionTabs}
        onSectionChange={setActiveSection}
        festivalSearchQuery={festivalSearchQuery}
        onFestivalSearchChange={setFestivalSearchQuery}
        mobileFestivals={mobileFestivals}
        festivalSortConfig={festivalSortConfig}
        onFestivalSortConfigChange={setFestivalSortConfig}
        festivalSortOptions={festivalSortOptions}
        festivalsActiveCount={festivalsActiveCount}
        festivalsInstagramCount={festivalsInstagramCount}
        festivalsPhotoCount={festivalsPhotoCount}
        detailFestival={detailFestival}
        onOpenFestivalDetail={openFestivalDetail}
        onCloseFestivalDetail={() => setDetailFestival(null)}
        onOpenFestivalQuickEdit={openFestivalQuickEdit}
        quickEditFestival={quickEditFestival}
        festivals={festivals}
        saveFestivals={saveFestivals}
        onCloseFestivalQuickEdit={() => setQuickEditFestival(null)}
        activeFestivalPanel={activeFestivalPanel}
        onSetActiveFestivalPanel={setActiveFestivalPanel}
        festivalFilter={festivalFilter}
        onFestivalFilterChange={setFestivalFilter}
        onToggleFestivalPanel={toggleFestivalPanel}
      />
    )
  }

  if (activeSection === 'projects') {
    return (
      <MobileProjectSection
        loading={loading}
        onRefresh={onRefresh}
        activeSection={activeSection}
        sectionTabs={sectionTabs}
        onSectionChange={setActiveSection}
        projectSearchQuery={projectSearchQuery}
        onProjectSearchChange={setProjectSearchQuery}
        mobileProjects={mobileProjects}
        projectSortConfig={projectSortConfig}
        onProjectSortConfigChange={setProjectSortConfig}
        projectSortOptions={projectSortOptions}
        projectsActiveCount={projectsActiveCount}
        projectsUrgentCount={projectsUrgentCount}
        projectsDoneCount={projectsDoneCount}
        detailProject={detailProject}
        onOpenProjectDetail={openProjectDetail}
        onCloseProjectDetail={() => setDetailProject(null)}
        onOpenProjectQuickEdit={openProjectQuickEdit}
        quickEditProject={quickEditProject}
        projects={projects}
        saveProjects={saveProjects}
        onCloseProjectQuickEdit={() => setQuickEditProject(null)}
        activeProjectPanel={activeProjectPanel}
        onSetActiveProjectPanel={setActiveProjectPanel}
        projectFilter={projectFilter}
        onProjectFilterChange={setProjectFilter}
        onToggleProjectPanel={toggleProjectPanel}
      />
    )
  }

  if (activeSection === 'tools') {
    return (
      <MobileToolsSection
        onRefresh={onRefresh}
        activeSection={activeSection}
        sectionTabs={sectionTabs}
        onSectionChange={setActiveSection}
        toolsSearchQuery={toolsSearchQuery}
        onToolsSearchChange={setToolsSearchQuery}
        notesActiveCount={notesActiveCount}
        todosActiveCount={todosActiveCount}
        stickiesActiveCount={stickiesActiveCount}
        todosDoneCount={todosDoneCount}
        mobileNotes={mobileNotes}
        mobileTodos={mobileTodos}
        mobileStickies={mobileStickies}
        onCreateNote={() => setEditingNote({})}
        onCreateTodo={() => setEditingTodo({})}
        onCreateSticky={() => setEditingSticky({})}
        onEditNote={setEditingNote}
        onEditTodo={setEditingTodo}
        onEditSticky={setEditingSticky}
        onFilterByNote={setToolsSearchQuery}
        onToggleTodoComplete={toggleTodoComplete}
        editingNote={editingNote}
        editingTodo={editingTodo}
        editingSticky={editingSticky}
        notes={notes}
        todos={todos}
        stickies={stickies}
        saveNotes={saveNotes}
        saveTodos={saveTodos}
        saveStickies={saveStickies}
        activeToolsPanel={activeToolsPanel}
        onSetActiveToolsPanel={setActiveToolsPanel}
        NoteEditComponent={MobileNoteEditSheet}
        TodoEditComponent={MobileTodoEditSheet}
        StickyEditComponent={MobileStickyEditSheet}
      />
    )
  }

  return (
    <MobileArtistSection
      artists={artists}
      filteredArtists={filteredArtists}
      loading={loading}
      onRefresh={onRefresh}
      activeSection={activeSection}
      sectionTabs={sectionTabs}
      onSectionChange={setActiveSection}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      validationFilter={validationFilter}
      onValidationFilterChange={setValidationFilter}
      sortConfig={sortConfig}
      onSortConfigChange={setSortConfig}
      validatedCount={validatedCount}
      activeCount={activeCount}
      withPhotoCount={withPhotoCount}
      withLinksCount={withLinksCount}
      withAudioCount={withAudioCount}
      activePanel={activePanel}
      onSetActivePanel={setActivePanel}
      onTogglePanel={togglePanel}
      detailArtist={detailArtist}
      onOpenArtistDetail={openArtistDetail}
      onCloseArtistDetail={closeArtistDetail}
      quickEditArtist={quickEditArtist}
      onOpenArtistQuickEdit={openArtistQuickEdit}
      onCloseArtistQuickEdit={closeArtistQuickEdit}
      onToggleValidation={handleToggleValidation}
      saveArtists={saveArtists}
    />
  )
}
