import express from 'express';
import cors from 'cors';
import { readFile, writeFile, access } from 'fs/promises';
import { constants } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

const DATA_DIR = resolve(__dirname, '..');

const CONFIG = {
  artistes: { 
    file: 'artistes_montpellier.real-test.csv', 
    cols: [
      'id', 'nom_artiste', 'zone', 'commune_precise', 'style', 'sous_genre', 'type_performance', 
      'statut_localite', 'source_type', 'preuves', 'date_preuve', 'instagram', 'facebook', 
      'soundcloud', 'bandcamp', 'spotify', 'youtube', 'site_officiel', 'source_localite', 
      'notes', 'note_perso', 'photo', 'photo_or_logo_link', 'archive', 'derniere_verification'
    ] 
  },
  collectifs: { file: 'collectifs_montpellier.csv', cols: ['id', 'nom', 'style', 'date_creation', 'instagram', 'notes', 'note_perso', 'photo', 'archive'] },
  lieux: { file: 'lieux_montpellier.csv', cols: ['id', 'nom', 'capacite', 'adresse', 'type', 'instagram', 'notes', 'note_perso', 'photo', 'archive'] },
  festivals: { file: 'festivals_montpellier.csv', cols: ['id', 'nom', 'periode', 'duree', 'lieu', 'style', 'instagram', 'notes', 'note_perso', 'photo', 'archive'] },
  projets: { file: 'projets_montpellier.csv', cols: ['id', 'nom', 'statut', 'priorite', 'echeance', 'notes', 'linked_type', 'linked_id', 'archive'] },
  notes: { file: 'notes_montpellier.csv', cols: ['id', 'titre', 'contenu', 'date_derniere_modif', 'archive'] },
  todos: { file: 'todos_montpellier.csv', cols: ['id', 'texte', 'complete', 'date_creation', 'archive'] },
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
  if (!field && field !== 0) return '""';
  const f = String(field);
  if (f.includes(',') || f.includes('"') || f.includes('\n') || f.includes('\r')) {
    return '"' + f.replace(/"/g, '""') + '"';
  }
  return '"' + f + '"';
}

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function readData(type) {
  const config = CONFIG[type];
  if (!config) return { headers: [], data: [] };
  const filePath = resolve(DATA_DIR, config.file);
  
  if (!(await exists(filePath))) {
    return { headers: config.cols, data: [] };
  }

  try {
    const content = await readFile(filePath, 'utf-8');
    const rows = parseCSV(content);
    if (rows.length === 0) return { headers: config.cols, data: [] };
    
    const fileHeaders = rows[0].map(h => h.trim());
    const jsonData = [];
    
    const finalHeaders = [...new Set([...config.cols, ...fileHeaders])];

    let hasMissingIds = false;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 0) continue;
      const obj = { _id: i - 1 };
      finalHeaders.forEach(col => {
        const fileIdx = fileHeaders.indexOf(col);
        obj[col] = fileIdx !== -1 ? row[fileIdx] || '' : '';
      });
      
      // Auto-generate stable ID if missing
      if (!obj.id) {
        obj.id = crypto.randomUUID();
        hasMissingIds = true;
      }
      
      jsonData.push(obj);
    }

    // If we auto-generated IDs, we should probably save them back, 
    // but to avoid side-effects during a GET, we'll wait for the next POST 
    // or just let them be volatile until saved. 
    // Actually, for stability, we SHOULD save them if they are missing.
    if (hasMissingIds) {
      console.log(`[server] Migrating IDs for ${type}...`);
      await writeData(type, finalHeaders, jsonData);
    }

    return { headers: finalHeaders, data: jsonData };
  } catch (err) {
    console.error(`[server] readError ${type}:`, err);
    return { headers: config.cols, data: [] };
  }
}

async function writeData(type, headers, data) {
  const config = CONFIG[type];
  if (!config) return;
  const filePath = resolve(DATA_DIR, config.file);
  
  const finalHeaders = [...new Set([...config.cols, ...headers])];
  
  const headerLine = finalHeaders.map(escapeCSVField).join(',');
  const lines = [headerLine];
  data.forEach(row => {
    // Ensure every row has an ID on save
    if (!row.id) row.id = crypto.randomUUID();
    const line = finalHeaders.map(h => escapeCSVField(row[h] || '')).join(',');
    lines.push(line);
  });
  await writeFile(filePath, lines.join('\n'), 'utf-8');
}

async function logAction(type, label) {
  const logFile = resolve(DATA_DIR, 'actions_log.csv');
  const timestamp = new Date().toISOString();
  const line = `${escapeCSVField(timestamp)},${escapeCSVField(type)},${escapeCSVField(label)}\n`;
  if (!(await exists(logFile))) {
    await writeFile(logFile, '"timestamp","type","label"\n', 'utf-8');
  }
  // For append, we still use synchronous for simplicity in this specific log or we can use a lock
  // But let's use writeFile with flag 'a' (async)
  await writeFile(logFile, line, { flag: 'a' });
}

app.get('/api/data/:type', async (req, res) => {
  let type = req.params.type;
  if (type === 'todo-list') type = 'todos';
  if (!CONFIG[type]) return res.json({ headers: [], data: [] });
  res.json(await readData(type));
});

app.post('/api/data/:type', async (req, res) => {
  let type = req.params.type;
  if (type === 'todo-list') type = 'todos';
  if (!CONFIG[type]) return res.status(400).json({ status: 'error', message: 'Invalid type' });
  const { data, actionLabel } = req.body;
  try {
    await writeData(type, CONFIG[type].cols, data);
    await logAction('update_' + type, actionLabel || `Mise à jour ${type}`);
    res.json({ status: 'ok' });
  } catch (err) {
    console.error(`[server] writeError ${type}:`, err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server v5.1 running on http://localhost:${PORT}`);
});

