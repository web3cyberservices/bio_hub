
const express = require('express');
const { exec } = require('child_process');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// Конфигурация CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});

// Путь к БД и статике отчетов
const dbPath = path.resolve(__dirname, 'sqlite.db');
const resultsPath = '/opt/cyber-engines/scanners/results';

if (!fs.existsSync(resultsPath)) {
  fs.mkdirSync(resultsPath, { recursive: true });
}

// Статика для отчетов
app.use('/reports', express.static(resultsPath));

let db;
try {
  db = new Database(dbPath);
  console.log(`[ENGINE] Connected to database at ${dbPath}`);
  
  // Приводим схему к соответствию с Drizzle (snake_case для колонок)
  db.exec(`
    CREATE TABLE IF NOT EXISTS security_scans (
      id TEXT PRIMARY KEY,
      status TEXT,
      result_summary TEXT,
      report_path TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
} catch (err) {
  console.error('[ENGINE] Database connection failed:', err.message);
}

const activeProcesses = new Map();

/**
 * Эндпоинт запуска сканирования.
 */
app.post('/api/run/:method', (req, res) => {
  const { target } = req.body;
  const { method } = req.params;

  if (!target) {
    return res.status(400).json({ error: 'Missing target' });
  }

  const scan_id = String(Date.now());
  const reportFile = `${method}_${scan_id}.json`;
  const reportPath = path.join(resultsPath, reportFile);
  
  if (db) {
    try {
      const insert = db.prepare('INSERT OR REPLACE INTO security_scans (id, status) VALUES (?, ?)');
      insert.run(scan_id, 'in_progress');
    } catch (e) {
      console.error('[ENGINE] Failed to init scan in local DB:', e.message);
    }
  }

  let command = "";
  switch(method) {
    case 'nuclei':
      command = `nuclei -u ${target} -o ${reportPath} -j`;
      break;
    case 'full-recon':
      command = `subfinder -d ${target} | naabu -silent | httpx -json -o ${reportPath}`;
      break;
    case 'fuzzing':
      command = `ffuf -u ${target}/FUZZ -w /opt/dicts/common.txt -o ${reportPath} -of json`;
      break;
    case 'sqlmap':
      command = `sqlmap -u "${target}" --batch --random-agent --output-dir=${resultsPath}`;
      break;
    case 'nmap':
      command = `nmap -sV -sC -oX ${reportPath}.xml ${target}`;
      break;
    default:
      command = `echo "Scan started for ${target}" > ${reportPath}`;
  }

  console.log(`[ENGINE] Executing ${method} on ${target} [ID: ${scan_id}]`);

  const child = exec(command, (error, stdout, stderr) => {
    activeProcesses.delete(scan_id);
    
    let status = 'completed';
    let summary = stdout || stderr || 'Scan finished successfully';

    if (error) {
      console.error(`[ENGINE] Task ${scan_id} failed:`, error);
      status = 'failed';
      summary = stderr || error.message;
    }

    if (db) {
      try {
        const stmt = db.prepare('UPDATE security_scans SET status = ?, result_summary = ?, report_path = ? WHERE id = ?');
        stmt.run(status, summary, `/reports/${reportFile}`, scan_id);
      } catch (dbErr) {
        console.error(`[ENGINE] DB Update failed:`, dbErr.message);
      }
    }
  });

  activeProcesses.set(scan_id, child);
  res.json({ id: Number(scan_id), status: 'Scan started' });
});

app.get('/api/status/:id', (req, res) => {
  const { id } = req.params;
  if (db) {
    try {
      const scan = db.prepare('SELECT status, result_summary as resultSummary, report_path as reportPath FROM security_scans WHERE id = ?').get(String(id));
      if (scan) return res.json(scan);
    } catch (e) {
      return res.status(500).json({ error: 'DB Error' });
    }
  }
  res.status(404).json({ error: 'Scan not found' });
});

app.post('/api/stop', (req, res) => {
  const { scan_id } = req.body;
  const child = activeProcesses.get(String(scan_id));
  if (child) {
    child.kill('SIGTERM');
    activeProcesses.delete(String(scan_id));
    if (db) {
      const stmt = db.prepare('UPDATE security_scans SET status = ?, result_summary = ? WHERE id = ?');
      stmt.run('failed', 'Terminated by operator', String(scan_id));
    }
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Process not found' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), db_connected: !!db });
});

const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[ENGINE] Core API running on port ${PORT}`);
});
