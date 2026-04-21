import React from "react";
import { sunken, winFont } from "./ArtistWindowCommon";

export function ProjectStatusSidebar({ statuses, activeStatus, setActiveStatus }) {
  return (
    <div style={{ width: '140px', borderRight: '2px solid', borderColor: '#808080 #dfdfdf #dfdfdf #808080', display: 'flex', flexDirection: 'column' }}>
      <div style={{ ...winFont, fontWeight: 'bold', padding: '4px 6px', background: '#000080', color: '#fff', fontSize: '10px' }}>STAGES</div>
      <div style={{ overflowY: 'auto', flex: 1, background: '#fff', ...sunken, margin: '2px' }}>
        <div
          onClick={() => setActiveStatus(null)}
          style={{ ...winFont, padding: '2px 8px', cursor: 'default', background: !activeStatus ? '#000080' : 'transparent', color: !activeStatus ? '#fff' : '#000' }}
        >
          Tous les projets
        </div>
        {statuses.map(s => (
          <div
            key={s}
            onClick={() => setActiveStatus(s)}
            style={{ ...winFont, padding: '2px 8px', cursor: 'default', background: activeStatus === s ? '#000080' : 'transparent', color: activeStatus === s ? '#fff' : '#000' }}
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  )
}
