<div align="center">
  <h1>AgentDock</h1>
  <p><strong>The open-source command center for AI coding agents.</strong></p>
  <p>Run Codex, Claude Code, Gemini CLI, and local models from one calm workspace.</p>

  [![CI](https://github.com/TasarikOfficial/AgentDock/actions/workflows/ci.yml/badge.svg)](https://github.com/TasarikOfficial/AgentDock/actions/workflows/ci.yml)
  [![License](https://img.shields.io/badge/license-Apache--2.0-84f1bf.svg)](LICENSE)
  [![Contributions welcome](https://img.shields.io/badge/contributions-welcome-8ab4f8.svg)](CONTRIBUTING.md)
</div>

---

AgentDock is a local-first control plane for the AI tools developers already use. Choose an agent, attach context, run a task, and understand what happened without juggling terminals and dashboards.

> **Alpha preview:** the interface and local demo workflow are working. Real provider process adapters are the next milestone; the UI does not pretend to execute a provider yet.

## Why AgentDock?

- **One dock, every agent** — a consistent workspace instead of four disconnected CLIs.
- **Local-first by design** — demo run history stays in your browser. The roadmap keeps secrets and project context on-device.
- **Provider-neutral** — use the best model for each task without redesigning your workflow.
- **Observable** — runs, latency, token usage, and status are visible rather than hidden.
- **Built to extend** — MCP servers, reusable workflows, and a plugin SDK are on the public roadmap.

## Live alpha

The current release includes a responsive dashboard, agent switching, runnable simulated tasks, persisted history, a command palette (`⌘ K` / `Ctrl K`), usage surfaces, mobile layout, CI, and community templates.

## Quick start

```bash
git clone https://github.com/TasarikOfficial/AgentDock.git
cd AgentDock
npm install
npm run dev
```

Open `http://localhost:3000`.

```bash
npm run lint
npm run build
```

## Architecture direction

```text
React workspace → Local orchestration core → Provider adapters
                                      ├── Codex
                                      ├── Claude Code
                                      ├── Gemini CLI
                                      └── Ollama
```

Provider execution is deliberately separated from the interface. Future adapters will expose a shared streaming event contract while preserving provider-specific capabilities. See [ROADMAP.md](ROADMAP.md).

## Principles

1. Local-first is the default, not a premium feature.
2. Users always know which agent receives which context.
3. No silent telemetry and no secret keys in browser storage.
4. Agent output is inspectable, interruptible, and reproducible.
5. The project earns trust before adding automation.

## Contributing

The project is early enough for thoughtful contributors to shape it. Read [CONTRIBUTING.md](CONTRIBUTING.md), pick a roadmap item, or open an issue describing the developer pain before proposing a large implementation.

## Security

Agent tools can access valuable source code and credentials. Read [SECURITY.md](SECURITY.md) before reporting vulnerabilities. Never paste real credentials into an issue.

## License

Apache 2.0 — use it, extend it, and build on it with clear attribution.

<div align="center"><sub>Built in the open by developers who want AI tools to feel like one coherent system.</sub></div>
