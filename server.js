
const express = require('express');
const { exec } = require('child_process');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// Конфигурация CORS (разрешаем запросы от прокси-сервера фронтенда)
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

  // Генерация команды и пути отчета
  const reportFile = `${method}_${scan_id}.json`;
  const reportPath = path.join(resultsPath, reportFile);
  
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
    let summary = stdout || 'Scan finished successfully';

    if (error) {
      console.error(`[ENGINE] Task ${scan_id} failed:`, error);
      status = 'failed';
      summary = stderr || error.message;
    }

    // Обновляем статус в БД напрямую
    if (db) {
      try {
        const stmt = db.prepare('UPDATE security_scans SET status = ?, resultSummary = ?, reportPath = ? WHERE id = ?');
        stmt.run(status, summary, `/reports/${reportFile}`, scan_id);
        console.log(`[ENGINE] Task ${scan_id} updated to ${status}`);
      } catch (dbErr) {
        console.error(`[ENGINE] DB Update failed:`, dbErr.message);
      }
    }
  });

  activeProcesses.set(scan_id, child);
  res.json({ message: 'Task initiated', scan_id, method, report_expected: reportFile });
});

/**
 * Проверка статуса задачи
 */
app.get('/api/status/:id', (req, res) => {
  const { id } = req.params;
  if (db) {
    try {
      const scan = db.prepare('SELECT status, resultSummary, reportPath FROM security_scans WHERE id = ?').get(id);
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
      stmt.run('failed', 'Terminated by operator', scan_id);
    }
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Process not found' });
});

/**
 * Healthcheck
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    engine: 'v2.5.1-stable', 
    uptime: process.uptime(), 
    active_tasks: activeProcesses.size,
    db_connected: !!db 
  });
});

const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[ENGINE] Core API running on port ${PORT}`);
});
