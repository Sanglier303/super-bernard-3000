function StatsBar({ total, shown, favCount, incompleteCount }) {
  return (
    <div className="stats-bar">
      <div className="stat-pill">
        🐗 Total : <strong>{total}</strong>
      </div>
      <div className="stat-pill">
        📋 Affichés : <strong>{shown}</strong>
      </div>
      {favCount > 0 && (
        <div className="stat-pill stat-pill-gold">
          ⭐ Favoris : <strong>{favCount}</strong>
        </div>
      )}
      {incompleteCount > 0 && (
        <div className="stat-pill stat-pill-warn">
          ⚠️ Incomplets : <strong>{incompleteCount}</strong>
        </div>
      )}
      <div className="stat-pill">
        📄 <code style={{ color: 'var(--rose-light)', marginLeft: 4 }}>artistes_montpellier.csv</code>
      </div>
    </div>
  )
}

export default StatsBar
