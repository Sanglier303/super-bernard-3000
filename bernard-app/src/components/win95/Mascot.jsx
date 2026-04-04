import { useState, useEffect, useCallback, useRef } from "react";

const MESSAGES = [
  "Bonjour ! Je suis Super Bernard 3000. Double-cliquez sur un artiste pour ouvrir sa fiche complète.",
  "Saviez-vous que vous pouvez redimensionner les fenêtres en tirant sur leurs bords ?",
  "Astuce : le menu Démarrer vous permet d'accéder directement à toutes les catégories de styles.",
  "Super Bernard 3000 v1.0 — Système d'archivage ultime.",
  "Vous semblez explorer la scène électronique locale. Puis-je vous aider ?",
  "Astuce : double-clic sur la barre de titre pour maximiser une fenêtre en plein écran.",
  "La base de données liste des artistes SoundCloud et Instagram.",
  "La scène techno est bien représentée. Essayez la catégorie « Techno » dans le menu.",
  "Erreur 404 : sommeil introuvable. Comme la plupart des artistes de cette base.",
  "Voulez-vous vérifier les statistiques système ?"
];

export function Mascot({ enabled, frequency = 600000, onDisable }) {
  const [visible, setVisible] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [animState, setAnimState] = useState("idle");
  const [showKey, setShowKey] = useState(0);
  const [bubbleKey, setBubbleKey] = useState(0);
  const isFirstRef = useRef(true);
  const attentionTimerRef = useRef(null);

  const handleShow = useCallback(() => {
    setMsgIndex(i => (i + 1) % MESSAGES.length);
    setDismissed(false);
    setAnimState(isFirstRef.current ? "enter" : "attention");
    isFirstRef.current = false;
    setShowKey(k => k + 1);
    setVisible(true);

    const delay = animState === "enter" ? 450 : 200;
    setTimeout(() => {
      setBubbleVisible(true);
      setBubbleKey(k => k + 1);
    }, delay);

    if (attentionTimerRef.current) clearTimeout(attentionTimerRef.current);
    attentionTimerRef.current = setTimeout(() => setAnimState("idle"), 800);
  }, [animState]);

  useEffect(() => {
    if (!enabled) {
      isFirstRef.current = true;
      return;
    }
    // Start after 2 minutes (120,000ms) or first prop frequency
    const first = setTimeout(() => handleShow(), 120000);
    const interval = setInterval(() => handleShow(), frequency);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [enabled, frequency, handleShow]);

  const handleDismiss = () => {
    setDismissed(true);
    setBubbleVisible(false);
  };

  const handleClick = () => {
    setMsgIndex(i => (i + 1) % MESSAGES.length);
    setAnimState("attention");
    setShowKey(k => k + 1);
    setDismissed(false);
    setBubbleVisible(true);
    setBubbleKey(k => k + 1);
    if (attentionTimerRef.current) clearTimeout(attentionTimerRef.current);
    attentionTimerRef.current = setTimeout(() => setAnimState("idle"), 800);
  };

  if (!enabled || !visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "38px",
        right: "12px",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "6px",
        pointerEvents: "none",
      }}
    >
      {/* Speech bubble */}
      {!dismissed && bubbleVisible && (
        <div
          key={bubbleKey}
          className="win95-window mascot-bubble-in"
          style={{
            maxWidth: "240px",
            pointerEvents: "all",
            cursor: "default",
            position: "relative",
          }}
        >
          <div className="win95-titlebar" style={{ fontSize: "9px" }}>
            <span>🐗 Super Bernard 3000</span>
            <div className="flex gap-0.5">
              <button className="win95-title-btn" title="Fermer" onClick={handleDismiss}>✕</button>
            </div>
          </div>
          <div style={{ background: "#ffffc0", padding: "8px 10px", fontSize: "10px", lineHeight: "1.45" }}>
            {MESSAGES[msgIndex]}
          </div>
          <div style={{ background: "#c0c0c0", padding: "4px 6px", display: "flex", justifyContent: "space-between", gap: "4px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "4px" }}>
              <button className="win95-btn win95-btn-small" onClick={handleDismiss}>OK</button>
              <button
                className="win95-btn win95-btn-small"
                onClick={() => {
                  setMsgIndex(i => (i + 1) % MESSAGES.length);
                  setBubbleKey(k => k + 1);
                }}
              >
                Suite...
              </button>
            </div>
            <button
              className="win95-btn win95-btn-small"
              style={{ fontSize: "9px", color: "#800000" }}
              onClick={() => { handleDismiss(); onDisable?.(); }}
            >
              Me laisser tranquille
            </button>
          </div>
          {/* Arrow pointing down toward mascot */}
          <div style={{
            position: "absolute", bottom: "-8px", right: "68px",
            width: 0, height: 0,
            borderLeft: "8px solid transparent", borderRight: "8px solid transparent",
            borderTop: "8px solid #808080",
          }} />
          <div style={{
            position: "absolute", bottom: "-6px", right: "69px",
            width: 0, height: 0,
            borderLeft: "7px solid transparent", borderRight: "7px solid transparent",
            borderTop: "7px solid #c0c0c0",
          }} />
        </div>
      )}

      {/* Mascot image with animation */}
      <div
        style={{ pointerEvents: "all", cursor: "pointer" }}
        title="Cliquez sur le Sanglier pour une astuce"
        onClick={handleClick}
      >
        <div
          key={showKey}
          className={
            animState === "enter"
              ? "mascot-enter"
              : animState === "attention"
              ? "mascot-attention"
              : "mascot-idle"
          }
        >
          <img
            src="/sanglier.png"
            alt="Mascotte Bernard"
            style={{
              width: "80px",
              height: "80px",
              objectFit: "cover",
              display: "block",
              border: "3px solid",
              borderColor: "#ffffff #404040 #404040 #ffffff",
              background: "#c0c0c0",
              imageRendering: "auto",
            }}
          />
        </div>
      </div>
    </div>
  );
}
