import React, { useState } from "react";
import { WALLPAPERS } from "../../constants/wallpapers";

export function DesktopSettings({ 
  icons, 
  visibleIcons, 
  onToggle, 
  currentBackground, 
  onBackgroundChange, 
  rotation,
  onRotationChange,
  mascotEnabled,
  onMascotToggle,
  mascotFrequency,
  onMascotFrequencyChange,
  onClose 
}) {
  const [activeTab, setActiveTab] = useState("bg"); // 'bg' or 'icons'

  return (
    <div style={{ background: "#c0c0c0", height: "100%", display: "flex", flexDirection: "column", fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif' }}>
      {/* Tabs */}
      <div style={{ display: "flex", padding: "6px 6px 0 6px", gap: "2px" }}>
        <div 
          className={`win95-tab ${activeTab === 'bg' ? 'active' : ''}`}
          onClick={() => setActiveTab('bg')}
        >
          Arrière-plan
        </div>
        <div 
          className={`win95-tab ${activeTab === 'icons' ? 'active' : ''}`}
          onClick={() => setActiveTab('icons')}
        >
          Icônes
        </div>
      </div>

      {/* Tab Content Container */}
      <div className="win95-tab-content flex-1 flex flex-col p-4" style={{ marginTop: "-2px" }}>
        
        {activeTab === 'bg' && (
          <div className="flex flex-col h-full gap-4">
            {/* Monitor Preview */}
            <div className="flex justify-center">
              <div style={{
                width: "140px",
                height: "110px",
                background: "#333",
                padding: "8px",
                borderRadius: "4px",
                boxShadow: "inset 2px 2px 5px black, 2px 2px 0 #fff"
              }}>
                <div style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#008080",
                  backgroundImage: currentBackground.type === 'image' ? `url(${currentBackground.value})` : 'none',
                  backgroundSize: currentBackground.stretch ? 'cover' : 'auto',
                  backgroundRepeat: currentBackground.stretch ? 'no-repeat' : 'repeat',
                  backgroundPosition: 'center',
                  border: "2px solid #000"
                }} />
              </div>
            </div>

            <div className="win95-groupbox flex-1 flex flex-col">
              <span className="win95-groupbox-label">Modèle</span>
              <div className="win95-sunken flex-1 overflow-y-auto" style={{ background: "white", minHeight: "80px" }}>
                {WALLPAPERS.map(wp => (
                  <div 
                    key={wp.name}
                    className="px-2 py-1 cursor-pointer"
                    style={{ 
                      fontSize: "11px", 
                      background: currentBackground.value === wp.value ? "#000080" : "transparent",
                      color: currentBackground.value === wp.value ? "white" : "black"
                    }}
                    onClick={() => onBackgroundChange(wp)}
                  >
                    {wp.name}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: "11px" }}>
                  <input 
                    type="checkbox" 
                    checked={rotation.enabled}
                    onChange={(e) => onRotationChange({ enabled: e.target.checked })}
                  />
                  Rotation automatique
                </label>
                
                <div className="flex items-center gap-2" style={{ fontSize: "11px", opacity: rotation.enabled ? 1 : 0.5 }}>
                  <label>Fréquence :</label>
                  <select 
                    disabled={!rotation.enabled}
                    value={rotation.interval}
                    onChange={(e) => onRotationChange({ interval: parseInt(e.target.value) })}
                    className="win95-sunken"
                    style={{ fontSize: "10px", padding: "1px" }}
                  >
                    <option value={60000}>1 minute</option>
                    <option value={300000}>5 minutes</option>
                    <option value={900000}>15 minutes</option>
                    <option value={3600000}>1 heure</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'icons' && (
          <div className="flex flex-col h-full gap-4">
            <div className="win95-groupbox flex-1 flex flex-col">
              <span className="win95-groupbox-label">Éléments du bureau</span>
              <div className="win95-sunken flex-1 p-2" style={{ background: "white", overflowY: "auto" }}>
                {icons.map(ic => (
                  <label key={ic.id} className="flex items-center gap-2 mb-1 cursor-pointer" style={{ fontSize: "11px" }}>
                    <input 
                      type="checkbox" 
                      checked={visibleIcons.includes(ic.id)}
                      onChange={() => onToggle(ic.id)}
                    />
                    {ic.icon} {ic.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="win95-groupbox flex-none">
              <span className="win95-groupbox-label">Mascotte (Super Bernard)</span>
              <div className="flex flex-col gap-2 p-1">
                <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: "11px" }}>
                  <input 
                    type="checkbox" 
                    checked={mascotEnabled}
                    onChange={onMascotToggle}
                  />
                  Afficher la mascotte
                </label>
                
                <div className="flex items-center gap-2" style={{ fontSize: "11px", opacity: mascotEnabled ? 1 : 0.5 }}>
                  <label>Bavardage :</label>
                  <select 
                    disabled={!mascotEnabled}
                    value={mascotFrequency}
                    onChange={(e) => onMascotFrequencyChange(parseInt(e.target.value))}
                    className="win95-sunken"
                    style={{ fontSize: "10px", padding: "1px" }}
                  >
                    <option value={3600000}>Zen (1h)</option>
                    <option value={600000}>Rare (10m)</option>
                    <option value={120000}>Normal (2m)</option>
                    <option value={30000}>Pipelette (30s)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer Buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", padding: "12px" }}>
        <button className="win95-btn win95-btn-primary" style={{ width: "80px" }} onClick={onClose}>OK</button>
        <button className="win95-btn" style={{ width: "80px" }} onClick={onClose}>Annuler</button>
        <button className="win95-btn" style={{ width: "80px" }} onClick={onClose}>Appliquer</button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .win95-tab {
          padding: 4px 12px;
          background: #c0c0c0;
          border: 1px solid #fff;
          border-bottom: none;
          border-radius: 4px 4px 0 0;
          font-size: 11px;
          cursor: pointer;
          position: relative;
          z-index: 1;
        }
        .win95-tab.active {
          padding-top: 6px;
          margin-top: -2px;
          z-index: 3;
          font-weight: bold;
        }
        .win95-tab:not(.active) {
          border-color: #fff #808080 #808080 #fff;
          transform: translateY(2px);
          z-index: 1;
        }
        .win95-tab-content {
          border: 1px solid #fff;
          border-color: #fff #808080 #808080 #fff;
          box-shadow: 1px 1px 0 #000;
          background: #c0c0c0;
          z-index: 2;
        }
      ` }} />
    </div>
  );
}
