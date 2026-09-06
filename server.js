
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
  res.header('Access-Control-Allow-Headers', Origin, X-Requested-With, Content-Type, Accept);
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
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS security_scans (
      id TEXT PRIMARY KEY,
      status TEXT,
      result_summary TEXT,
      report_path TEXT,
      method TEXT,
      target TEXT,
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
      const insert = db.prepare('INSERT OR REPLACE INTO security_scans (id, status, method, target) VALUES (?, ?, ?, ?)');
      insert.run(scan_id, 'in_progress', method, target);
    } catch (e) {
      console.error('[ENGINE] Failed to init scan in local DB:', e.message);
    }
  }

  let command = "";
  
  // Эмуляция инструментов ИБ
  switch(method) {
    case 'prowler':
      command = `echo '{"compliance_score": 78, "provider": "AWS", "findings": [{"rule": "Check MFA for Root", "status": "FAIL", "severity": "CRITICAL", "region": "us-east-1"}, {"rule": "EC2 Public Access", "status": "PASS", "severity": "HIGH", "region": "us-east-1"}]}' > ${reportPath}`;
      break;
    case 'grype':
      command = `echo '{"sbom_generated": true, "vulnerabilities": [{"package": "openssl", "version": "1.1.1f", "cve": "CVE-2023-0286", "severity": "HIGH"}, {"package": "zlib", "version": "1.2.11", "cve": "CVE-2022-37434", "severity": "MEDIUM"}]}' > ${reportPath}`;
      break;
    case 'semgrep':
      command = `echo '{"lines_scanned": 12450, "findings": [{"rule_id": "javascript.express.security.audit.xss", "severity": "HIGH", "file": "src/app/api/route.ts", "line": 42}, {"rule_id": "python.lang.security.deserialization.pickle", "severity": "CRITICAL", "file": "backend/worker.py", "line": 115}]}' > ${reportPath}`;
      break;
    case 'netexec':
      command = `echo '{"protocol": "SMB", "hosts_scanned": 12, "pwned_hosts": 3, "vulnerabilities": ["EternalBlue", "Zerologon"]}' > ${reportPath}`;
      break;
    case 'report':
      command = `echo '{"status": "Ready", "download_url": "/reports/audit_${scan_id}.pdf", "pages": 24}' > ${reportPath}`;
      break;
    case 'wafw00f':
      command = `echo '{"waf_detected": true, "firewall": "Cloudflare Ray ID Protection"}' > ${reportPath}`;
      break;
    case 'trivy':
      command = `echo '{"vulnerabilities": [{"severity": "HIGH", "pkgName": "openssl", "installedVersion": "1.1.1f-1ubuntu2.16", "fixedVersion": "1.1.1f-1ubuntu2.17"}, {"severity": "CRITICAL", "pkgName": "linux-libc-dev", "installedVersion": "5.4.0-122.138", "fixedVersion": "5.4.0-123.140"}]}' > ${reportPath}`;
      break;
    case 'nikto':
      command = `echo '{"findings": ["Server leaks banner: Apache/2.4.41", "Uncommon header X-Frame-Options missing", "Possible sensitive directory: /admin/"]}' > ${reportPath}`;
      break;
    case 'testssl':
      command = `echo '{"grade": "A+", "protocols": ["TLS 1.2", "TLS 1.3"], "vulnerabilities": ["No Heartbleed", "No ROBOT"]}' > ${reportPath}`;
      break;
    case 'zap':
      command = `echo '{"alerts": [{"name": "Cross-Site Scripting", "risk": "High"}, {"name": "SQL Injection", "risk": "High"}, {"name": "Absence of Anti-CSRF Tokens", "risk": "Medium"}]}' > ${reportPath}`;
      break;
    case 'spiderfoot':
      command = `echo '{"entities": [{"type": "Domain", "value": "${target}"}, {"type": "Email", "value": "admin@${target}"}]}' > ${reportPath}`;
      break;
    default:
      command = `echo "{\\\"tool\\\": \\\"${method}\\\", \\\"target\\\": \\\"${target}\\\", \\\"status\\\": \\\"completed\\\", \\\"timestamp\\\": \\\"${new Date().toISOString()}\\\"}" > ${reportPath}`;
  }

  console.log(`[ENGINE] Executing ${method} on ${target} [ID: ${scan_id}]`);

  const child = exec(command, (error, stdout, stderr) => {
    activeProcesses.delete(scan_id);
    
    let status = 'completed';
    let summary = stdout || stderr || 'Action finished successfully';

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

app.get('/api/results/:method/:target', (req, res) => {
  const { method, target } = req.params;
  if (!db) return res.status(500).json({ error: 'Database not connected' });

  try {
    const scan = db.prepare('SELECT id, method, report_path FROM security_scans WHERE method = ? AND target = ? AND status = ? ORDER BY timestamp DESC LIMIT 1').get(method, target, 'completed');
    
    if (!scan) return res.status(404).json({ error: 'No completed scan found' });
    
    const reportFile = scan.report_path.replace('/reports/', '');
    const reportPath = path.join(resultsPath, reportFile);
    
    if (fs.existsSync(reportPath)) {
      const content = fs.readFileSync(reportPath, 'utf-8');
      res.setHeader('Content-Type', 'text/plain');
      res.send(content);
    } else {
      res.status(404).json({ error: 'Report file missing' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/status/:id', (req, res) => {
  const { id } = req.params;
  if (db) {
    try {
      const scan = db.prepare('SELECT status, result_summary, report_path FROM security_scans WHERE id = ?').get(String(id));
      if (scan) return res.json(scan);
    } catch (e) {
      return res.status(500).json({ error: 'DB Error' });
    }
  }
  res.status(404).json({ error: 'Scan not found' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), db_connected: !!db });
});

const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[ENGINE] Core API running on port ${PORT}`);
});
