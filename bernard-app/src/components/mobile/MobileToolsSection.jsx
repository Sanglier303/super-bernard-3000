import React from 'react'
import {
  mobileContentStyle,
  mobileCardStyle,
  mobileBottomNavStyle,
  MobileButton,
  MobileBottomSheet,
  MobileTabButton,
  MobileSectionHeader,
  MobileStatsGrid,
} from './MobilePrimitives'
import { MobileShell } from './MobileShell'

export function MobileToolsSection({
  onRefresh,
  activeSection,
  sectionTabs,
  onSectionChange,
  toolsSearchQuery,
  onToolsSearchChange,
  notesActiveCount,
  todosActiveCount,
  stickiesActiveCount,
  todosDoneCount,
  mobileNotes,
  mobileTodos,
  mobileStickies,
  onCreateNote,
  onCreateTodo,
  onCreateSticky,
  onEditNote,
  onEditTodo,
  onEditSticky,
  onFilterByNote,
  onToggleTodoComplete,
  editingNote,
  editingTodo,
  editingSticky,
  notes,
  todos,
  stickies,
  saveNotes,
  saveTodos,
  saveStickies,
  activeToolsPanel,
  onSetActiveToolsPanel,
  NoteEditComponent,
  TodoEditComponent,
  StickyEditComponent,
}) {
  const activeList = activeToolsPanel === 'todos'
    ? 'todos'
    : activeToolsPanel === 'stickies'
      ? 'stickies'
      : 'notes'
  const [todoFilter, setTodoFilter] = React.useState('open')

  const visibleTodos = React.useMemo(() => {
    const sorted = [...mobileTodos].sort((a, b) => {
      const aDone = a.complete === 'true'
      const bDone = b.complete === 'true'
      if (aDone !== bDone) return aDone ? 1 : -1
      return String(a.date_creation || '').localeCompare(String(b.date_creation || ''))
    })

    if (todoFilter === 'done') return sorted.filter(todo => todo.complete === 'true')
    if (todoFilter === 'all') return sorted
    return sorted.filter(todo => todo.complete !== 'true')
  }, [mobileTodos, todoFilter])

  return (
    <MobileShell>
      <MobileSectionHeader
        title="Super Bernard 3000"
        subtitle="Mode mobile outils"
        onRefresh={onRefresh}
        searchValue={toolsSearchQuery}
        onSearchChange={onToolsSearchChange}
        searchPlaceholder="Rechercher une note, un todo, un sticky..."
        activeSection={activeSection}
        sectionTabs={sectionTabs}
        onSectionChange={onSectionChange}
      />

      <div style={mobileContentStyle}>
        <MobileStatsGrid
          items={[
            { label: 'Notes', value: notesActiveCount },
            { label: 'Todos', value: todosActiveCount },
            { label: 'Stickies', value: stickiesActiveCount },
          ]}
          columns={3}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))', gap: '8px' }}>
          <MobileButton primary={activeList === 'notes'} onClick={() => onSetActiveToolsPanel('notes')}>Notes</MobileButton>
          <MobileButton primary={activeList === 'todos'} onClick={() => onSetActiveToolsPanel('todos')}>Todos</MobileButton>
          <MobileButton primary={activeList === 'stickies'} onClick={() => onSetActiveToolsPanel('stickies')}>Stickies</MobileButton>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))', gap: '8px' }}>
          <MobileButton onClick={onCreateNote}>+ Note</MobileButton>
          <MobileButton onClick={onCreateTodo}>+ Todo</MobileButton>
          <MobileButton onClick={onCreateSticky}>+ Sticky</MobileButton>
        </div>

        {activeList === 'notes' && (
          <div style={mobileCardStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Notes</div>
            {mobileNotes.length === 0 ? <div style={{ fontSize: '13px', color: '#666' }}>Aucune note trouvée.</div> : mobileNotes.slice(0, 12).map(note => (
              <div key={note.id} style={{ background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px', display: 'grid', gap: '6px' }}>
                <div style={{ fontWeight: 'bold' }}>{note.titre || 'Sans titre'}</div>
                <div style={{ fontSize: '12px', color: '#555', whiteSpace: 'pre-wrap' }}>{(note.contenu || '').slice(0, 180) || '—'}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                  <MobileButton onClick={() => onEditNote(note)}>Modifier</MobileButton>
                  <MobileButton onClick={() => onFilterByNote(note.titre || '')}>Filtrer</MobileButton>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeList === 'todos' && (
          <div style={mobileCardStyle}>
            <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Todos</div>
                <div style={{ fontSize: '12px', color: '#555' }}>{visibleTodos.length} visible(s)</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(88px, 1fr))', gap: '6px' }}>
                <MobileButton primary={todoFilter === 'open'} onClick={() => setTodoFilter('open')} style={{ minHeight: '30px', padding: '5px 6px', fontSize: '11px' }}>À faire</MobileButton>
                <MobileButton primary={todoFilter === 'done'} onClick={() => setTodoFilter('done')} style={{ minHeight: '30px', padding: '5px 6px', fontSize: '11px' }}>Faits</MobileButton>
                <MobileButton primary={todoFilter === 'all'} onClick={() => setTodoFilter('all')} style={{ minHeight: '30px', padding: '5px 6px', fontSize: '11px' }}>Tous</MobileButton>
              </div>
            </div>
            {visibleTodos.length === 0 ? <div style={{ fontSize: '13px', color: '#666' }}>Aucun todo trouvé.</div> : visibleTodos.slice(0, 12).map(todo => (
              <div key={todo.id} style={{ background: todo.complete === 'true' ? '#eef5ee' : '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px', display: 'grid', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ fontWeight: 'bold', textDecoration: todo.complete === 'true' ? 'line-through' : 'none', lineHeight: 1.25 }}>{todo.texte || 'Sans texte'}</div>
                  <div style={{ fontSize: '11px', padding: '2px 6px', background: todo.complete === 'true' ? '#dff0d8' : '#fff3cd', border: '1px solid', borderColor: todo.complete === 'true' ? '#5b8a3c' : '#b58900', flexShrink: 0 }}>
                    {todo.complete === 'true' ? 'Fait' : 'À faire'}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#555' }}>{todo.date_creation ? `Créé le ${todo.date_creation}` : 'Sans date'}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '6px' }}>
                  <MobileButton onClick={() => onToggleTodoComplete(todo)} style={{ minHeight: '32px', padding: '5px 6px', fontSize: '11px' }}>{todo.complete === 'true' ? 'Réouvrir' : 'Valider'}</MobileButton>
                  <MobileButton onClick={() => onEditTodo(todo)} style={{ minHeight: '32px', padding: '5px 6px', fontSize: '11px' }}>Modifier</MobileButton>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeList === 'stickies' && (
          <div style={mobileCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Stickies</div>
              <div style={{ fontSize: '12px', color: '#555' }}>{mobileStickies.length} visible(s)</div>
            </div>
            {mobileStickies.length === 0 ? <div style={{ fontSize: '13px', color: '#666' }}>Aucun sticky trouvé.</div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                {mobileStickies.slice(0, 12).map(sticky => (
                  <div key={sticky.id} style={{ background: '#fff8a6', border: '2px solid', borderColor: '#fff7cf #9f8c1a #9f8c1a #fff7cf', padding: '8px', display: 'grid', gap: '6px', alignContent: 'start', minHeight: '110px' }}>
                    <div style={{ fontSize: '12px', lineHeight: 1.3, whiteSpace: 'pre-wrap' }}>{(sticky.text || '—').slice(0, 160)}{(sticky.text || '').length > 160 ? '…' : ''}</div>
                    <MobileButton onClick={() => onEditSticky(sticky)} style={{ minHeight: '30px', padding: '5px 6px', fontSize: '11px' }}>Modifier</MobileButton>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {editingNote && <NoteEditComponent note={editingNote} notes={notes} onSave={saveNotes} onClose={() => onEditNote(null)} />}
      {editingTodo && <TodoEditComponent todo={editingTodo} todos={todos} onSave={saveTodos} onClose={() => onEditTodo(null)} />}
      {editingSticky && <StickyEditComponent sticky={editingSticky} stickies={stickies} onSave={saveStickies} onClose={() => onEditSticky(null)} />}

      {activeToolsPanel === 'stats' && (
        <MobileBottomSheet title="Statistiques outils" onClose={() => onSetActiveToolsPanel(activeList)}>
          <MobileStatsGrid
            items={[
              { label: 'Notes', value: notesActiveCount },
              { label: 'Todos', value: todosActiveCount },
              { label: 'Todos faits', value: todosDoneCount, accent: '#0a5f00' },
              { label: 'Stickies', value: stickiesActiveCount },
            ]}
            columns={2}
          />
        </MobileBottomSheet>
      )}

      <div style={mobileBottomNavStyle}>
        <MobileTabButton active={activeList === 'notes'} onClick={() => onSetActiveToolsPanel('notes')}>Notes</MobileTabButton>
        <MobileTabButton active={activeList === 'todos'} onClick={() => onSetActiveToolsPanel('todos')}>Todos</MobileTabButton>
        <MobileTabButton active={activeList === 'stickies'} onClick={() => onSetActiveToolsPanel('stickies')}>Stickies</MobileTabButton>
        <MobileTabButton active={activeToolsPanel === 'stats'} onClick={() => onSetActiveToolsPanel(activeToolsPanel === 'stats' ? 'notes' : 'stats')}>Stats</MobileTabButton>
      </div>
    </MobileShell>
  )
}
