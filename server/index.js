import express from 'express';
import { spawn, execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, statSync } from 'node:fs';
import { promisify } from 'node:util';

const app = express();
const exec = promisify(execFile);
const jobs = new Map();
app.use(express.json({ limit: '1mb' }));
const send = (res, payload) => res.write(`${JSON.stringify(payload)}\n`);
const validDirectory = path => { try { return Boolean(path) && existsSync(path) && statSync(path).isDirectory(); } catch { return false; } };

app.get('/api/health', async (_req, res) => {
  const status = { ollama: false, codex: false };
  try { const r = await fetch('http://127.0.0.1:11434/api/tags'); status.ollama = r.ok; } catch {}
  try { await exec('codex', ['--version'], { timeout: 2500 }); status.codex = true; } catch {}
  res.json(status);
});

app.post('/api/run', async (req, res) => {
  const { provider, prompt, model, projectPath } = req.body || {};
  if (!prompt?.trim()) return res.status(400).json({ error: 'A task is required.' });
  if (provider === 'Codex' && !validDirectory(projectPath)) return res.status(400).json({ error: 'Choose a valid project folder path for Codex.' });
  const id = randomUUID();
  res.setHeader('Content-Type', 'application/x-ndjson'); res.setHeader('Cache-Control', 'no-cache');
  send(res, { type: 'start', id, provider, at: new Date().toISOString() });
  if (provider === 'Ollama') {
    const controller = new AbortController(); jobs.set(id, controller);
    try {
      const response = await fetch('http://127.0.0.1:11434/api/chat', { method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: model || 'qwen3', stream: true, messages: [{ role: 'user', content: prompt }] }) });
      if (!response.ok) throw new Error(`Ollama returned ${response.status}. Is the model installed?`);
      const reader = response.body.getReader(), decoder = new TextDecoder(); let buffer = '';
      while (true) { const { done, value } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true }); const lines = buffer.split('\n'); buffer = lines.pop() || ''; for (const line of lines) { if (!line.trim()) continue; const data = JSON.parse(line); if (data.message?.content) send(res, { type: 'output', text: data.message.content }); } }
      send(res, { type: 'done' });
    } catch (error) { send(res, { type: 'error', text: error.name === 'AbortError' ? 'Run stopped.' : error.message }); }
    finally { jobs.delete(id); res.end(); }
    return;
  }
  if (provider === 'Codex') {
    const child = spawn('codex', ['exec', '--json', '--cd', projectPath, prompt], { cwd: projectPath, env: process.env }); jobs.set(id, child);
    child.stdout.on('data', chunk => send(res, { type: 'log', text: chunk.toString() })); child.stderr.on('data', chunk => send(res, { type: 'log', text: chunk.toString(), level: 'error' }));
    child.on('error', error => send(res, { type: 'error', text: error.code === 'ENOENT' ? 'Codex CLI is not installed or not in PATH.' : error.message }));
    child.on('close', async code => { try { const { stdout } = await exec('git', ['diff', '--no-color'], { cwd: projectPath, maxBuffer: 2_000_000 }); if (stdout.trim()) send(res, { type: 'files', text: stdout }); } catch {} send(res, code === 0 ? { type: 'done' } : { type: 'error', text: `Codex exited with code ${code}.` }); jobs.delete(id); res.end(); });
    return;
  }
  send(res, { type: 'error', text: `${provider} adapter is not available yet. Use Codex or Ollama.` }); res.end();
});

app.post('/api/stop/:id', (req, res) => { const job = jobs.get(req.params.id); if (!job) return res.status(404).json({ stopped: false }); if ('abort' in job) job.abort(); else job.kill('SIGTERM'); jobs.delete(req.params.id); res.json({ stopped: true }); });
app.listen(4317, '127.0.0.1', () => console.log('AgentDock local API: http://127.0.0.1:4317'));
