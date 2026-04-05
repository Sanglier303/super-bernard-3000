import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

const DATA_DIR = resolve(__dirname, '..');

const CONFIG = {
  artistes: { file: 'artistes_montpellier.csv', cols: ['nom_artiste', 'zone', 'style', 'sous_genre', 'type_performance', 'soundcloud', 'instagram', 'note_perso', 'photo', 'archive'] },
  collectifs: { file: 'collectifs_montpellier.csv', cols: ['nom', 'style', 'date_creation', 'instagram', 'notes', 'note_perso', 'photo', 'archive'] },
  lieux: { file: 'lieux_montpellier.csv', cols: ['nom', 'capacite', 'adresse', 'type', 'instagram', 'notes', 'note_perso', 'photo', 'archive'] },
  festivals: { file: 'festivals_montpellier.csv', cols: ['nom', 'periode', 'duree', 'lieu', 'style', 'instagram', 'notes', 'note_perso', 'photo', 'archive'] },
  projets: { file: 'projets_montpellier.csv', cols: ['nom', 'statut', 'priorite', 'echeance', 'notes', 'linked_type', 'linked_id', 'archive'] },
  notes: { file: 'notes_montpellier.csv', cols: ['titre', 'contenu', 'date_derniere_modif', 'archive'] },
  todos: { file: 'todos_montpellier.csv', cols: ['texte', 'complete', 'date_creation', 'archive'] },
  stickies: { file: 'stickies_montpellier.csv', cols: ['id', 'text', 'archive'] }
};

app.use(cors());
app.use(express.json({ limit: '50mb' }));

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
    } else { cell += ch; }
  }
  if (cell.length > 0 || row.length > 0) { row.push(cell); rows.push(row); }
  return rows;
}

function escapeCSVField(field) {
  if (!field) return '""';
  const f = String(field);
  if (f.includes(',') || f.includes('"') || f.includes('\n') || f.includes('\r')) {
    return '"' + f.replace(/"/g, '""') + '"';
  }
  return '"' + f + '"';
}

function readData(type) {
  const config = CONFIG[type];
  if (!config) return { headers: [], data: [] };
  const filePath = resolve(DATA_DIR, config.file);
  
  if (!existsSync(filePath)) {
    return { headers: config.cols, data: [] };
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const rows = parseCSV(content);
    if (rows.length === 0) return { headers: config.cols, data: [] };
    
    const fileHeaders = rows[0].map(h => h.trim());
    const jsonData = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 0) continue;
      const obj = { _id: i - 1 };
      config.cols.forEach(col => {
        const fileIdx = fileHeaders.indexOf(col);
        obj[col] = fileIdx !== -1 ? row[fileIdx] || '' : '';
      });
      jsonData.push(obj);
    }
    return { headers: config.cols, data: jsonData };
  } catch (err) {
    console.error(`[server] readError ${type}:`, err);
    return { headers: config.cols, data: [] };
  }
}

function writeData(type, headers, data) {
  const config = CONFIG[type];
  if (!config) return;
  const filePath = resolve(DATA_DIR, config.file);
  const headerLine = headers.map(escapeCSVField).join(',');
  const lines = [headerLine];
  data.forEach(row => {
    const line = headers.map(h => escapeCSVField(row[h] || '')).join(',');
    lines.push(line);
  });
  writeFileSync(filePath, lines.join('\n'), 'utf-8');
}

function logAction(type, label) {
  const logFile = resolve(DATA_DIR, 'actions_log.csv');
  const timestamp = new Date().toISOString();
  const line = `${escapeCSVField(timestamp)},${escapeCSVField(type)},${escapeCSVField(label)}\n`;
  if (!existsSync(logFile)) writeFileSync(logFile, '"timestamp","type","label"\n', 'utf-8');
  writeFileSync(logFile, line, { flag: 'a' });
}

app.get('/api/data/:type', (req, res) => {
  let type = req.params.type;
  if (type === 'todo-list') type = 'todos';
  if (!CONFIG[type]) return res.json({ headers: [], data: [] });
  res.json(readData(type));
});

app.post('/api/data/:type', (req, res) => {
  let type = req.params.type;
  if (type === 'todo-list') type = 'todos';
  if (!CONFIG[type]) return res.status(400).json({ status: 'error', message: 'Invalid type' });
  const { data, actionLabel } = req.body;
  writeData(type, CONFIG[type].cols, data);
  logAction('update_' + type, actionLabel || `Mise à jour ${type}`);
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server v3.1 running on http://localhost:${PORT}`);
});
