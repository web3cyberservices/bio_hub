
const express = require('express');
const { exec } = require('child_process');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// Конфигурация CORS для доступа с фронтенда
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Конфигурация БД (обязательно укажите абсолютный путь к вашему sqlite.db)
const dbPath = path.resolve(__dirname, 'sqlite.db');
const db = new Database(dbPath);

// Хранилище активных процессов для возможности их остановки
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

  // Имитация команды для примера (в реальности здесь вызов nuclei, sqlmap и т.д.)
  let command = `sleep 30 && echo "Scan finished for ${target}"`;
  
  if (method === 'nuclei') command = `echo "Nuclei Audit Started for ${target}" && sleep 15 && echo '{"status":"vulnerable","severity":"high"}' > reports/${scan_id}.json`;
  if (method === 'full-recon') command = `echo "Deep Recon Started for ${target}" && sleep 25 && echo 'Found 4 subdomains' > reports/${scan_id}.txt`;
  if (method === 'fuzzing') command = `echo "Fuzzing Started for ${target}" && sleep 20 && echo 'No SQLi detected' > reports/${scan_id}.txt`;

  console.log(`[ENGINE] Starting ${method} for ${target} (ID: ${scan_id})`);

  // Убедимся, что папка отчетов существует
  if (!fs.existsSync('reports')) fs.mkdirSync('reports');

  const child = exec(command, (error, stdout, stderr) => {
    activeProcesses.delete(scan_id);
    
    let status = 'completed';
    let summary = stdout || 'Task finished successfully';

    if (error) {
      console.error(`[ENGINE] Task ${scan_id} failed:`, error);
      status = 'failed';
      summary = stderr || error.message;
    }

    // Обновляем статус напрямую в SQLite
    try {
      const stmt = db.prepare('UPDATE security_scans SET status = ?, resultSummary = ? WHERE id = ?');
      stmt.run(status, summary, scan_id);
      console.log(`[ENGINE] Task ${scan_id} updated to ${status}`);
    } catch (dbErr) {
      console.error(`[ENGINE] DB Update failed for ${scan_id}:`, dbErr);
    }
  });

  activeProcesses.set(scan_id, child);
  res.json({ message: 'Task started', scan_id });
});

/**
 * Эндпоинт остановки сканирования
 */
app.post('/api/stop', (req, res) => {
  const { scan_id } = req.body;
  const child = activeProcesses.get(scan_id);

  if (child) {
    child.kill('SIGTERM');
    activeProcesses.delete(scan_id);
    
    // Обновляем статус в БД
    const stmt = db.prepare('UPDATE security_scans SET status = ?, resultSummary = ? WHERE id = ?');
    stmt.run('failed', 'Stopped by user signal', scan_id);
    
    return res.json({ success: true, message: 'Process terminated' });
  }

  res.status(404).json({ error: 'Process not found or already finished' });
});

/**
 * Раздача статических отчетов
 */
app.use('/reports', express.static(path.join(__dirname, 'reports')));

/**
 * Healthcheck
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', engine: 'v2.4.0-stable', uptime: process.uptime() });
});

const PORT = 4000;
app.listen(PORT, '0-0-0-0', () => {
  console.log(`[ENGINE] Security Core API running on port ${PORT}`);
});
