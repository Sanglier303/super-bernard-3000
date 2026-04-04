import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, copyFileSync, existsSync, unlinkSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// The CSV lives one level up (in the parent directory alongside the old viewer)
const DATA_DIR = resolve(__dirname, '..');

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// ─── CSV helpers ───────────────────────────────────────────────

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') { cell += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      row.push(cell); cell = '';
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i++;
      if (cell.length > 0 || row.length > 0) { row.push(cell); rows.push(row); row = []; cell = ''; }
    } else {
      cell += ch;
    }
  }
  if (cell.length > 0 || row.length > 0) { row.push(cell); rows.push(row); }
  return rows;
}

function escapeCSVField(field) {
  if (!field) return '""';
  if (field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r')) {
    return '"' + field.replace(/"/g, '""') + '"';
  }
  return '"' + field + '"';
}

const CONFIG = {
  artistes: { file: 'artistes_montpellier.csv', cols: ['nom_artiste', 'zone', 'style', 'sous_genre', 'type_performance', 'soundcloud', 'instagram', 'note_perso', 'photo'] },
  collectifs: { file: 'collectifs_montpellier.csv', cols: ['nom', 'style', 'date_creation', 'instagram', 'notes', 'note_perso', 'photo'] },
  lieux: { file: 'lieux_montpellier.csv', cols: ['nom', 'capacite', 'adresse', 'type', 'instagram', 'notes', 'note_perso', 'photo'] },
  festivals: { file: 'festivals_montpellier.csv', cols: ['nom', 'periode', 'duree', 'lieu', 'style', 'instagram', 'notes', 'note_perso', 'photo'] },
  projets: { file: 'projets_montpellier.csv', cols: ['nom', 'statut', 'priorite', 'echeance', 'notes'] },
  notes: { file: 'notes_montpellier.csv', cols: ['titre', 'contenu', 'date_derniere_modif'] }
};

function getCsvPath(type) {
  if (!CONFIG[type]) throw new Error('Invalid type: ' + type);
  return resolve(DATA_DIR, CONFIG[type].file);
}

function readData(type) {
  if (!CONFIG[type]) throw new Error('Invalid type: ' + type);
  const p = getCsvPath(type);
  
  if (!existsSync(p)) {
    // initialize empty
    return { headers: CONFIG[type].cols, data: [] };
  }
  
  const text = readFileSync(p, 'utf-8');
  const rows = parseCSV(text);
  if (rows.length === 0) return { headers: CONFIG[type].cols, data: [] };
  const headers = rows.shift();

  // Auto-migrate standard columns
  CONFIG[type].cols.forEach(c => {
    if (!headers.includes(c)) headers.push(c);
  });

  const data = rows.map((cols, idx) => {
    const obj = { _id: idx };
    headers.forEach((h, i) => { obj[h] = cols[i] || ''; });
    return obj;
  });
  return { headers, data };
}

function writeData(type, headers, data) {
  if (!CONFIG[type]) throw new Error('Invalid type: ' + type);
  const headerLine = headers.map(escapeCSVField).join(',');
  const dataLines = data.map(a =>
    headers.map(h => escapeCSVField(a[h] || '')).join(',')
  );
  const csv = [headerLine, ...dataLines, ''].join('\n');

  const p = getCsvPath(type);
  const tmpPath = p + '.tmp';
  writeFileSync(tmpPath, csv, 'utf-8');
  copyFileSync(tmpPath, p);
  try { if (existsSync(tmpPath)) unlinkSync(tmpPath); } catch { /* ignore cleanup errors */ }
}

// ─── Global history log (in-memory, max 20 entries) ───────────
const actionHistory = [];

function logAction(type, label) {
  actionHistory.unshift({
    type,
    label,
    timestamp: new Date().toISOString(),
  });
  if (actionHistory.length > 20) actionHistory.pop();
}

// ─── API routes ────────────────────────────────────────────────



app.get('/api/data/:type', (req, res) => {
  try {
    const { headers, data } = readData(req.params.type);
    res.json({ headers, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/data/:type', (req, res) => {
  try {
    const { data, actionLabel } = req.body;
    // Always use the canonical column list from CONFIG to avoid header drift
    const headers = CONFIG[req.params.type]?.cols || [];
    writeData(req.params.type, headers, data);
    logAction('update_' + req.params.type, actionLabel || `Mise à jour de ${req.params.type}`);
    res.json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/history', (req, res) => {
  res.json({ history: actionHistory });
});


// ─── Serve the React build (production) or just run alongside Vite dev ─

const distPath = resolve(__dirname, 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(resolve(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n  🐗 Bernard API server running at http://localhost:${PORT}`);
  console.log(`  📁 Dossier données : ${DATA_DIR}\n`);
});
