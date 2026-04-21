import React, { useState } from 'react';
import { winFont, Win95Button } from './ArtistWindowCommon';

const SECTIONS = [
  { id: 'welcome', label: 'Bienvenue', icon: '🏠' },
  { id: 'windows', label: 'Système & Fenêtres', icon: '🖱️' },
  { id: 'databases', label: 'Bases de Données', icon: '🗃️' },
  { id: 'kanban', label: 'Workspace & Kanban', icon: '🏗️' },
  { id: 'productivity', label: 'Agenda & Todo', icon: '📅' },
  { id: 'stickies', label: 'Notes & Post-its', icon: '📌' },
  { id: 'search', label: 'Recherche Universelle', icon: '🔍' },
  { id: 'trash', label: 'Corbeille & Archives', icon: '🗑️' },
  { id: 'stats', label: 'Statistiques Géo', icon: '📊' },
  { id: 'settings', label: 'Personnalisation', icon: '🎨' },
  { id: 'bernard', label: 'Bernard (Mascotte)', icon: '🐗' },
  { id: 'poweruser', label: 'Commandes Pro v4', icon: '🚀' }
];

export function ManualWindow({ onClose }) {
  const [activeTab, setActiveTab] = useState('welcome');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#c0c0c0', ...winFont, border: '1px solid #808080' }}>
      <div className="win95-menubar" style={{ background: '#c0c0c0', borderBottom: '1px solid #808080', padding: '2px 4px', display: 'flex', gap: '8px' }}>
        <span className="win95-menu-item" style={{ fontSize: '10px' }}>📁 Fichier</span>
        <span className="win95-menu-item" style={{ fontSize: '10px' }}>🔍 Rechercher</span>
        <span className="win95-menu-item" style={{ fontSize: '10px' }}>❓ Aide</span>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar Navigation */}
        <div className="win95-sunken" style={{ width: '200px', margin: '4px', padding: '4px', background: '#c0c0c0', overflowY: 'auto', border: '1px solid #808080' }}>
          <div style={{ ...winFont, fontWeight: 'bold', fontSize: '10px', padding: '2px 6px', color: '#808080', borderBottom: '1px solid #808080', marginBottom: '4px' }}>SOMMAIRE :</div>
          {SECTIONS.map(s => (
            <div 
              key={s.id}
              onClick={() => setActiveTab(s.id)}
              className={activeTab === s.id ? "" : "win95-menu-item"}
              style={{
                padding: '6px 10px',
                cursor: 'pointer',
                background: activeTab === s.id ? '#000080' : 'transparent',
                color: activeTab === s.id ? '#ffffff' : '#000000',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '1px'
              }}
            >
              <span style={{ fontSize: '16px' }}>{s.icon}</span> {s.label}
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="win95-sunken" style={{ flex: 1, margin: '4px', marginLeft: '0', padding: '0', background: '#ffffff', overflowY: 'auto', color: '#000000' }}>
          <div style={{ padding: '24px' }}>
          
          {activeTab === 'welcome' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '3px solid #000080', marginBottom: '20px', paddingBottom: '10px' }}>
                <span style={{ fontSize: '48px' }}>🐗</span>
                <div>
                   <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#000080' }}>LA SAINTE BIBLE</h1>
                   <div style={{ fontSize: '12px', color: '#808080' }}>Super Bernard OS — Guide de Référence Exhaustif</div>
                </div>
              </div>
              <p>Bienvenue dans le manuel absolu de votre station de travail de données artistiques.</p>
              <p style={{ marginTop: '16px' }}>Super Bernard OS est un écosystème complet conçu par <strong>Sanglier 303</strong> pour centraliser toute l'intelligence musicale de la région.</p>
              
              <div style={{ background: '#ffffc0', border: '1px solid #e0e080', padding: '12px', marginTop: '24px', fontSize: '11px' }}>
                <strong>Note importante :</strong> Ce manuel couvre l'intégralité des modules (Artistes, Festivals, Lieux, Projets) et les fonctions avancées de la v4.
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <img src="/sanglier.png" alt="Bernard" style={{ width: '160px', opacity: 0.2 }} />
              </div>
            </div>
          )}

          {activeTab === 'windows' && (
            <div>
              <h1 style={{ color: '#000080', fontSize: '18px', borderBottom: '1px solid #c0c0c0', marginBottom: '16px' }}>Système & Fenêtrage</h1>
              <h3 style={{ color: '#000080', fontSize: '14px', marginBottom: '8px' }}>Gestion des Fenêtres</h3>
              <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
                <li><strong>Z-Index (Focus)</strong> : Cliquez sur une fenêtre pour la ramener au premier plan. La fenêtre active est toujours surélevée.</li>
                <li><strong>Maximiser/Restaurer</strong> : Double-cliquez sur la barre de titre bleue ou utilisez le bouton [□] pour basculer en mode plein écran.</li>
                <li><strong>Redimensionnement</strong> : Étirez le coin inférieur droit de n'importe quelle fenêtre pour ajuster ses dimensions.</li>
                <li><strong>Barre des Tâches</strong> : Cliquez sur les boutons pour réduire ou restaurer vos applications actives.</li>
              </ul>
            </div>
          )}

          {activeTab === 'databases' && (
            <div>
              <h1 style={{ color: '#000080', fontSize: '18px', borderBottom: '1px solid #c0c0c0', marginBottom: '16px' }}>Les Banques de Données</h1>
              <p>Le système gère quatre bases distinctes mais interconnectées :</p>
              <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                <li><strong>Artistes</strong> : DJs, producteurs, live-acts.</li>
                <li><strong>Festivals</strong> : Événements majeurs régionaux.</li>
                <li><strong>Lieux</strong> : Clubs, bars, salles de concert.</li>
                <li><strong>Collectifs</strong> : Organisations et crews.</li>
              </ul>
              
              <h3 style={{ color: '#000080', fontSize: '14px', marginTop: '16px', marginBottom: '8px' }}>Recherche & Filtres</h3>
              <ul style={{ paddingLeft: '20px' }}>
                <li><strong>Barre latérale Styles</strong> : Filtrez instantanément par genre musical (Techno, House...).</li>
                <li><strong>Recherche textuelle</strong> : Filtre les noms, zones et descriptions en temps réel.</li>
                <li><strong>Mode Compact</strong> : Option dans le menu "Affichage" pour densifier l'information.</li>
                <li><strong>Export CSV</strong> : Menu "Fichier &gt; Exporter" pour récupérer vos données sur tableur.</li>
              </ul>
            </div>
          )}

          {activeTab === 'kanban' && (
            <div>
              <h1 style={{ color: '#000080', fontSize: '18px', borderBottom: '1px solid #c0c0c0', marginBottom: '16px' }}>Workspace & Kanban</h1>
              <p>Le module <strong>Mes Projets</strong> permet le suivi opérationnel de vos événements.</p>
              
              <h3 style={{ color: '#000080', fontSize: '14px', marginTop: '16px', marginBottom: '8px' }}>Tableau de Bord</h3>
              <p>Basculez entre la vue "Tableau" et "Kanban" via la barre d'outils :</p>
              <ul style={{ paddingLeft: '20px' }}>
                <li><strong>Glisser-Déposer</strong> : Déplacez les projets entre les colonnes (À faire, En cours, En attente, Terminé).</li>
                <li><strong>Priorités</strong> : Marquez l'importance (Haute, Normale, Faible).</li>
                <li><strong>Liens Mobiles</strong> : Reliez un projet à un artiste ou un lieu de votre base de données.</li>
              </ul>
            </div>
          )}

          {activeTab === 'productivity' && (
            <div>
              <h1 style={{ color: '#000080', fontSize: '18px', borderBottom: '1px solid #c0c0c0', marginBottom: '16px' }}>Agenda & Todo</h1>
              <h3 style={{ color: '#000080', fontSize: '14px', marginBottom: '8px' }}>Calendrier Global</h3>
              <p>Affiche vos projets sur une vue mensuelle. Cliquez sur les jours pour voir le détail des échéances.</p>
              
              <h3 style={{ color: '#000080', fontSize: '14px', marginTop: '16px', marginBottom: '8px' }}>Ma Todo</h3>
              <p>Liste de tâches ultra-rapide avec cases à cocher. Idéal pour les rappels immédiats.</p>

              <h3 style={{ color: '#000080', fontSize: '14px', marginTop: '16px', marginBottom: '8px' }}>Bloc-notes</h3>
              <p>Pour la rédaction de comptes-rendus ou la prise de notes brutes lors de vos recherches.</p>
            </div>
          )}

          {activeTab === 'stickies' && (
            <div>
              <h1 style={{ color: '#000080', fontSize: '18px', borderBottom: '1px solid #c0c0c0', marginBottom: '16px' }}>Notes & Post-its</h1>
              <p>Les Post-its sont des notes flottantes qui persistent sur votre bureau.</p>
              <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                <li>Créez-en autant que nécessaire via l'icône "Nouveau Post-it".</li>
                <li>Utilisez le <strong>Gestionnaire Post-it</strong> pour masquer momentanément des groupes de notes ou supprimer les notes obsolètes.</li>
              </ul>
            </div>
          )}

          {activeTab === 'search' && (
            <div>
              <h1 style={{ color: '#000080', fontSize: '18px', borderBottom: '1px solid #c0c0c0', marginBottom: '16px' }}>Recherche Universelle</h1>
              <p>Située dans la barre des tâches (bouton 🔍), elle scanne simultanément :</p>
              <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                 <li>Toutes les bases de données (Artistes, Festivaux...).</li>
                 <li>Le gestionnaire de projets.</li>
                 <li>Vos notes et bloc-notes.</li>
              </ul>
              <p style={{ marginTop: '10px' }}>C'est l'outil privilégié pour retrouver un contact ou une information en moins de 2 secondes.</p>
            </div>
          )}

          {activeTab === 'trash' && (
            <div>
              <h1 style={{ color: '#000080', fontSize: '18px', borderBottom: '1px solid #c0c0c0', marginBottom: '16px' }}>Corbeille & Archives</h1>
              <p>Rien n'est jamais perdu par inadvertance.</p>
              <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                 <li><strong>Archive</strong> : Supprimer un élément l'envoie vers la corbeille.</li>
                 <li><strong>Restauration</strong> : Ouvrez la corbeille, sélectionnez votre élément et cliquez sur "Restaurer".</li>
                 <li><strong>Purge</strong> : "Vider la corbeille" supprime définitivement les éléments sélectionnés du serveur.</li>
              </ul>
            </div>
          )}

          {activeTab === 'stats' && (
            <div>
              <h1 style={{ color: '#000080', fontSize: '18px', borderBottom: '1px solid #c0c0c0', marginBottom: '16px' }}>Statistiques Géo-Musicales</h1>
              <p>Ce module analyse vos bases pour vous offrir :</p>
              <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                 <li>La répartition précise par styles musicaux.</li>
                 <li>Le nombre d'artistes par zones géographiques.</li>
                 <li>Un état des lieux de votre archivage global.</li>
              </ul>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h1 style={{ color: '#000080', fontSize: '18px', borderBottom: '1px solid #c0c0c0', marginBottom: '16px' }}>Personnalisation</h1>
              <p>Via <strong>Démarrer &gt; Paramètres &gt; Affichage</strong> :</p>
              <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                 <li><strong>Fonds d'écran</strong> : Collection de visuels Sanglier 303 et classiques Win95.</li>
                 <li><strong>Rotation Automatique</strong> : Cyclez vos fonds d'écran toutes les X minutes.</li>
                 <li><strong>Affichage Icônes</strong> : Masquez ou affichez les accès bureau.</li>
              </ul>
            </div>
          )}

          {activeTab === 'bernard' && (
            <div>
              <h1 style={{ color: '#000080', fontSize: '18px', borderBottom: '1px solid #c0c0c0', marginBottom: '16px' }}>Mascotte Bernard</h1>
              <p>Bernard le sanglier est votre guide interactif.</p>
              <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                 <li><strong>Bavardages</strong> : Bernard vous donne des astuces et confirme vos actions.</li>
                 <li><strong>Réglages</strong> : Ajustez sa fréquence d'apparition (Zen à Pipelette) dans les paramètres d'affichage.</li>
                 <li><strong>Interaction</strong> : Cliquez sur lui pour déclencher un message immédiat.</li>
              </ul>
            </div>
          )}

          {activeTab === 'poweruser' && (
            <div>
              <h1 style={{ color: '#000080', fontSize: '18px', borderBottom: '1px solid #c0c0c0', marginBottom: '16px' }}>🚀 Commandes Pro</h1>
              <p>Optimisez votre utilisation quotidienne :</p>
              <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                 <li><strong>Show Desktop (🗗)</strong> : Réduisez TOUT instantanément via le bouton gris en bas à droite de l'écran.</li>
                 <li><strong>Clic Droit Bureau</strong> : Accès rapide aux fonctions "Fermer tout" et "Réduire tout".</li>
                 <li><strong>Double-clic</strong> : Maximisez les fenêtres pour un confort de lecture optimal.</li>
              </ul>
            </div>
          )}

          </div>
        </div>
      </div>

      {/* Footer / Credits */}
      <div style={{ padding: '8px', borderTop: '2px solid', borderColor: '#ffffff #808080 #808080 #ffffff', background: '#c0c0c0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', color: '#444' }}>Sommaire : {SECTIONS.find(s=>s.id===activeTab)?.label}</span>
        <Win95Button onClick={onClose} style={{ width: '100px', fontWeight: 'bold' }}>Fermer</Win95Button>
      </div>
    </div>
  );
}
