import { useState, useRef, useEffect } from 'react'
import NotionMultiSelect from './NotionMultiSelect'

function Header({
  search, onSearchChange,
  zoneFilter, onZoneChange,
  sourceFilter, onSourceChange,
  styleFilter, onStyleChange,
  zones, sources, styles,
  onAdd,
  compact, onToggleCompact,
  showFavOnly, onToggleFavOnly,
  booleanMode,
  onOpenDashboard,
  onOpenQuickVerify,
  onOpenHistory,
  historyOpen,
}) {
  return (
    <header className="app-header">
      <div className="header-top">
        <img src="/bernard.png" alt="Bernard le sanglier" className="header-logo" />
        <div>
          <h1 className="header-title">Bernard Artist List</h1>
          <p className="header-subtitle">Base artistes électroniques — Montpellier &amp; secteur</p>
        </div>

        {/* Right-side action buttons */}
        <div className="header-top-actions">
          <button
            className={`btn btn-ghost ${showFavOnly ? 'btn-active' : ''}`}
            onClick={onToggleFavOnly}
            title="Filtrer mes favoris"
          >
            {showFavOnly ? '⭐ Favoris' : '☆ Favoris'}
          </button>
          <button
            className="btn btn-ghost"
            onClick={onOpenDashboard}
            title="Voir les statistiques"
          >
            📊 Stats
          </button>
          <button
            className="btn btn-ghost"
            onClick={onOpenQuickVerify}
            title="Mode vérification rapide"
          >
            ⚡ Vérif.
          </button>
          <button
            className={`btn btn-ghost ${historyOpen ? 'btn-active' : ''}`}
            onClick={onOpenHistory}
            title="Voir l'historique des modifications"
          >
            ⟲ Historique
          </button>
          <button
            className="btn btn-ghost"
            onClick={onToggleCompact}
            title={compact ? 'Passer en mode confortable' : 'Passer en mode compact'}
          >
            {compact ? '◫ Confort.' : '⊞ Compact'}
          </button>
        </div>
      </div>

      <div className="header-controls">
        <div style={{ position: 'relative', flex: 2, minWidth: 200 }}>
          <input
            id="search-input"
            type="text"
            placeholder="🔍 Rechercher… ou : techno AND montpellier / dj NOT set"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: '100%' }}
          />
          {booleanMode && (
            <span className="boolean-badge">BOOLÉEN</span>
          )}
        </div>

        <select id="zone-filter" value={zoneFilter} onChange={(e) => onZoneChange(e.target.value)}>
          <option value="">Toutes les zones</option>
          {zones.map((z) => <option key={z} value={z}>{z}</option>)}
        </select>

        <select id="source-filter" value={sourceFilter} onChange={(e) => onSourceChange(e.target.value)}>
          <option value="">Toutes les sources</option>
          {sources.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Style filter — multi-select */}
        <div style={{ minWidth: 180, maxWidth: 280, position: 'relative' }}>
          <NotionMultiSelect
            value={styleFilter}
            onChange={onStyleChange}
            availableOptions={styles}
          />
        </div>

        <button className="btn btn-primary" onClick={onAdd} id="btn-add-artist">
          <span>＋</span> Ajouter
        </button>
      </div>
    </header>
  )
}

export default Header
