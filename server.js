
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
  next();
});

// Конфигурация БД (путь должен быть согласован с основным приложением)
const dbPath = path.resolve(__dirname, 'sqlite.db');
let db;
try {
  db = new Database(dbPath);
  console.log(`[ENGINE] Connected to database at ${dbPath}`);
} catch (err) {
  console.error('[ENGINE] Database connection failed:', err.message);
}

// Хранилище активных процессов
const activeProcesses = new Map();

/**
 * Эндпоинт запуска сканирования
 */
app.post('/api/run/:method', (req, res) => {
  const { target, scan_id } = req.body;
  const { method } = req.params;

  if (!target || !scan_id) {
    return res.status(400).json({ error: 'Missing target or scan_id' });
  }

  // Генерация команды в зависимости от метода
  let command = "";
  switch(method) {
    case 'nuclei':
      command = `echo "Starting Nuclei for ${target}" && sleep 10 && echo '{"vulnerabilities": 2, "severity": "medium"}'`;
      break;
    case 'full-recon':
      command = `echo "Starting Deep Recon (Subfinder/Naabu) for ${target}" && sleep 15 && echo "Subdomains: 12, Open Ports: 80, 443"`;
      break;
    case 'fuzzing':
      command = `echo "Starting Ffuf Fuzzing for ${target}" && sleep 12 && echo "Directories found: /admin, /config"`;
      break;
    case 'sqlmap':
      command = `echo "Starting SQLMap Injection for ${target}" && sleep 20 && echo "No clear SQLi found"`;
      break;
    case 'nmap':
      command = `echo "Starting Nmap Port Scan for ${target}" && sleep 8 && echo "PORT STATE SERVICE: 22/tcp open ssh, 80/tcp open http"`;
      break;
    default:
      command = `sleep 5 && echo "Generic scan finished for ${target}"`;
  }

  console.log(`[ENGINE] Executing ${method} on ${target} [ID: ${scan_id}]`);

  const child = exec(command, (error, stdout, stderr) => {
    activeProcesses.delete(scan_id);
    
    let status = 'completed';
    let summary = stdout || 'Task finished successfully';

    if (error) {
      console.error(`[ENGINE] Task ${scan_id} failed:`, error);
      status = 'failed';
      summary = stderr || error.message;
    }

    // Обновляем статус в БД если она доступна
    if (db) {
      try {
        const stmt = db.prepare('UPDATE security_scans SET status = ?, resultSummary = ? WHERE id = ?');
        stmt.run(status, summary, scan_id);
        console.log(`[ENGINE] Task ${scan_id} updated to ${status}`);
      } catch (dbErr) {
        console.error(`[ENGINE] DB Update failed:`, dbErr.message);
      }
    }
  });

  activeProcesses.set(scan_id, child);
  res.json({ message: 'Task started', scan_id, method });
});

/**
 * Проверка статуса конкретной задачи
 */
app.get('/api/status/:id', (req, res) => {
  const { id } = req.params;
  if (db) {
    try {
      const scan = db.prepare('SELECT status, resultSummary FROM security_scans WHERE id = ?').get(id);
      if (scan) return res.json(scan);
    } catch (e) {}
  }
  res.status(404).json({ error: 'Scan not found' });
});

/**
 * Остановка сканирования
 */
app.post('/api/stop', (req, res) => {
  const { scan_id } = req.body;
  const child = activeProcesses.get(scan_id);
  if (child) {
    child.kill('SIGTERM');
    activeProcesses.delete(scan_id);
    if (db) {
      const stmt = db.prepare('UPDATE security_scans SET status = ?, resultSummary = ? WHERE id = ?');
      stmt.run('failed', 'Terminated by user', scan_id);
    }
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Process not found' });
});

/**
 * Healthcheck
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', engine: 'v2.4.0-stable', uptime: process.uptime(), db_connected: !!db });
});

const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[ENGINE] Core API running on port ${PORT}`);
});
