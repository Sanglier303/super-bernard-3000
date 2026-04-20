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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <MobileButton onClick={onCreateNote}>+ Note</MobileButton>
          <MobileButton onClick={onCreateTodo}>+ Todo</MobileButton>
          <MobileButton onClick={onCreateSticky}>+ Sticky</MobileButton>
        </div>

        <div style={mobileCardStyle}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Notes</div>
          {mobileNotes.length === 0 ? <div style={{ fontSize: '13px', color: '#666' }}>Aucune note trouvée.</div> : mobileNotes.slice(0, 12).map(note => (
            <div key={note.id} style={{ background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px', display: 'grid', gap: '6px' }}>
              <div style={{ fontWeight: 'bold' }}>{note.titre || 'Sans titre'}</div>
              <div style={{ fontSize: '12px', color: '#555', whiteSpace: 'pre-wrap' }}>{(note.contenu || '').slice(0, 180) || '—'}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <MobileButton onClick={() => onEditNote(note)}>Modifier</MobileButton>
                <MobileButton onClick={() => onFilterByNote(note.titre || '')}>Filtrer</MobileButton>
              </div>
            </div>
          ))}
        </div>

        <div style={mobileCardStyle}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Todos</div>
          {mobileTodos.length === 0 ? <div style={{ fontSize: '13px', color: '#666' }}>Aucun todo trouvé.</div> : mobileTodos.slice(0, 12).map(todo => (
            <div key={todo.id} style={{ background: '#efefef', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', padding: '10px', display: 'grid', gap: '6px' }}>
              <div style={{ fontWeight: 'bold', textDecoration: todo.complete === 'true' ? 'line-through' : 'none' }}>{todo.texte || 'Sans texte'}</div>
              <div style={{ fontSize: '12px', color: '#555' }}>{todo.complete === 'true' ? 'Fait' : 'À faire'}{todo.date_creation ? ` · ${todo.date_creation}` : ''}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <MobileButton onClick={() => onToggleTodoComplete(todo)}>{todo.complete === 'true' ? 'Réouvrir' : 'Valider'}</MobileButton>
                <MobileButton onClick={() => onEditTodo(todo)}>Modifier</MobileButton>
              </div>
            </div>
          ))}
        </div>

        <div style={mobileCardStyle}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>Stickies</div>
          {mobileStickies.length === 0 ? <div style={{ fontSize: '13px', color: '#666' }}>Aucun sticky trouvé.</div> : mobileStickies.slice(0, 12).map(sticky => (
            <div key={sticky.id} style={{ background: '#fff8a6', border: '2px solid', borderColor: '#fff7cf #9f8c1a #9f8c1a #fff7cf', padding: '10px', display: 'grid', gap: '6px' }}>
              <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>{sticky.text || '—'}</div>
              <MobileButton onClick={() => onEditSticky(sticky)}>Modifier</MobileButton>
            </div>
          ))}
        </div>
      </div>

      {editingNote && <NoteEditComponent note={editingNote} notes={notes} onSave={saveNotes} onClose={() => onEditNote(null)} />}
      {editingTodo && <TodoEditComponent todo={editingTodo} todos={todos} onSave={saveTodos} onClose={() => onEditTodo(null)} />}
      {editingSticky && <StickyEditComponent sticky={editingSticky} stickies={stickies} onSave={saveStickies} onClose={() => onEditSticky(null)} />}

      {activeToolsPanel === 'stats' && (
        <MobileBottomSheet title="Statistiques outils" onClose={() => onSetActiveToolsPanel('browse')}>
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
        <MobileTabButton active={activeToolsPanel === 'browse'} onClick={() => onSetActiveToolsPanel('browse')}>Liste</MobileTabButton>
        <MobileTabButton active={false} onClick={onCreateNote}>Note</MobileTabButton>
        <MobileTabButton active={false} onClick={onCreateTodo}>Todo</MobileTabButton>
        <MobileTabButton active={activeToolsPanel === 'stats'} onClick={() => onSetActiveToolsPanel(activeToolsPanel === 'stats' ? 'browse' : 'stats')}>Stats</MobileTabButton>
      </div>
    </MobileShell>
  )
}
