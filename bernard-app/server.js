import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// The CSV lives one level up (in the parent directory alongside the old viewer)
const CSV_PATH = resolve(__dirname, '..', 'artistes_montpellier.csv');

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

function readArtists() {
  const text = readFileSync(CSV_PATH, 'utf-8');
  const rows = parseCSV(text);
  if (rows.length === 0) return { headers: [], artists: [] };
  const headers = rows.shift();

  // Auto-migrate: add note_perso if missing
  if (!headers.includes('note_perso')) {
    headers.push('note_perso');
  }

  const artists = rows.map((cols, idx) => {
    const obj = { _id: idx };
    headers.forEach((h, i) => { obj[h] = cols[i] || ''; });
    return obj;
  });
  return { headers, artists };
}

function writeArtists(headers, artists) {
  const headerLine = headers.map(escapeCSVField).join(',');
  const dataLines = artists.map(a =>
    headers.map(h => escapeCSVField(a[h] || '')).join(',')
  );
  const csv = [headerLine, ...dataLines, ''].join('\n');

  // Write to temp file first then atomic replace (safe for cloud sync)
  const tmpPath = CSV_PATH + '.tmp';
  writeFileSync(tmpPath, csv, 'utf-8');
  copyFileSync(tmpPath, CSV_PATH);
  // Remove temp
  try { writeFileSync(tmpPath, '', 'utf-8'); } catch (_) { /* ignore */ }
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

app.get('/api/artists', (_req, res) => {
  try {
    const { headers, artists } = readArtists();
    res.json({ headers, artists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/artists', (req, res) => {
  try {
    const { headers, artists, actionLabel } = req.body;
    if (!headers || !artists) {
      return res.status(400).json({ error: 'Missing headers or artists' });
    }

    // Backup before writing
    const backupPath = CSV_PATH.replace('.csv', '.backup.csv');
    try {
      if (existsSync(CSV_PATH)) copyFileSync(CSV_PATH, backupPath);
    } catch (_) { /* backup failure is non-fatal */ }

    writeArtists(headers, artists);

    // Log action
    logAction('save', actionLabel || `Sauvegarde (${artists.length} artistes)`);

    res.json({ status: 'ok', count: artists.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/history', (_req, res) => {
  res.json({ history: actionHistory });
});

app.post('/api/restore-backup', (_req, res) => {
  try {
    const backupPath = CSV_PATH.replace('.csv', '.backup.csv');
    if (!existsSync(backupPath)) {
      return res.status(404).json({ error: 'Aucun backup disponible' });
    }
    copyFileSync(backupPath, CSV_PATH);
    logAction('restore', 'Restauration depuis backup');
    const { headers, artists } = readArtists();
    res.json({ status: 'ok', headers, artists, count: artists.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
  console.log(`  📄 CSV file: ${CSV_PATH}\n`);
});
