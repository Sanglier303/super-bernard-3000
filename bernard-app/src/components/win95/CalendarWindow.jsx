import React, { useState, useMemo } from "react";

function Win95Button({ children, onClick, active, disabled, style, type = "button" }) {
  const winFont = { fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif', fontSize: '11px' };
  const raised = { boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf' };
  const sunken = { boxShadow: 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff, inset 2px 2px #808080, inset -2px -2px #dfdfdf' };

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        ...winFont,
        ...(active ? sunken : raised),
        background: '#c0c0c0',
        border: 'none',
        padding: '2px 6px',
        cursor: 'default',
        whiteSpace: 'nowrap',
        color: disabled ? '#808080' : active ? '#000080' : '#000',
        fontWeight: active ? 'bold' : 'normal',
        ...style
      }}
    >
      {children}
    </button>
  )
}

export function CalendarWindow({ projects = [] }) {
  const [viewDate, setViewDate] = useState(new Date());
  const today = new Date();
  
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const daysShort = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    // Padding for first week
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [currentMonth, currentYear, firstDayOfMonth, daysInMonth]);

  const changeMonth = (delta) => {
    const next = new Date(currentYear, currentMonth + delta, 1);
    setViewDate(next);
  };

  const getProjectsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return projects.filter(p => p.echeance === dateStr);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#c0c0c0', fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif', fontSize: '11px' }}>
      {/* Calendar Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #808080', boxShadow: '0 1px 0 #fff' }}>
        <Win95Button onClick={() => changeMonth(-1)}>{"<<"}</Win95Button>
        <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
          {monthNames[currentMonth]} {currentYear}
        </div>
        <Win95Button onClick={() => changeMonth(1)}>{">>"}</Win95Button>
      </div>

      {/* Days Grid Wrapper */}
      <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column' }}>
        {/* Days labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
          {daysShort.map(d => (
            <div key={d} style={{ textAlign: 'center', color: '#808080', fontWeight: 'bold', fontSize: '10px' }}>{d}</div>
          ))}
        </div>

        {/* Days cells */}
        <div className="win95-sunken" style={{ flex: 1, background: '#fff', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(6, 1fr)', gap: '1px' }}>
          {calendarDays.map((day, idx) => {
            const projectsToday = getProjectsForDay(day);
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
            
            return (
              <div 
                key={idx} 
                style={{ 
                  border: '1px solid #e0e0e0', 
                  padding: '2px', 
                  background: isToday ? '#ffffc0' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                {day && (
                  <>
                    <div style={{ fontSize: '10px', textAlign: 'right', fontWeight: isToday ? 'bold' : 'normal' }}>
                      {day}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px', marginTop: '2px' }}>
                      {projectsToday.map(p => (
                        <div 
                          key={p._id} 
                          title={`${p.nom} (${p.statut || 'N/A'})`}
                          style={{ 
                            fontSize: '8px', 
                            background: p.statut === 'Terminé' ? '#c0ffc0' : '#adf', 
                            border: '1px solid #000080',
                            padding: '1px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: 1
                          }}
                        >
                          {p.nom}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer info */}
      <div className="win95-statusbar" style={{ padding: '2px 6px', fontSize: '10px' }}>
         Événements ce mois : <b>{projects.filter(p => p.echeance?.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)).length}</b>
      </div>
    </div>
  );
}
