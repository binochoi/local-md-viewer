<p>
  <img src="public/logo.svg" width="200" alt="Local MD Viewer" />
</p>

# Local MD Viewer

A beautiful, local-first markdown viewer for browsing plan documents and design docs. Point it at any directory of `.md` files and get a clean reading experience with sidebar navigation, table of contents, full-text search, and syntax highlighting.

Built with React, Tailwind CSS v4, and shadcn/ui.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/examples/dark.png" width="100%" />
  <source media="(prefers-color-scheme: light)" srcset="public/examples/light.png" width="100%" />
  <img src="public/examples/light.png" alt="Local MD Viewer screenshot" width="100%" />
</picture>

## Features

- **Sidebar navigation** with date-grouped file listing and collapsible day sections
- **Multi-directory support** — view plans from multiple repos/directories at once
- **Table of contents** auto-generated from headings, with active-section tracking as you scroll
- **Command palette** (`Cmd+K`) for quick file search
- **Syntax highlighting** for code blocks
- **GFM support** — tables, task lists, strikethrough, and more
- **Light / Dark / System theme** toggle
- **Claude Code hook** — auto-opens viewer when Claude exits plan mode
- **Slash commands** for Claude Code integration
- **Remote/devcontainer support** via environment variables
- **Zero config** — just point it at a directory and go

## Quick start

```bash
npm i -g local-md-viewer
```

Then run it from any project directory:

```bash
local-md-viewer
```

This starts a local server, opens your browser, and serves all `.md` files. It auto-detects `.claude/plans` or `docs/plans` in the current directory.

### Options

| Flag              | Default      | Description                                  |
| ----------------- | ------------ | -------------------------------------------- |
| `--dir <path>`    | auto-detect  | Directory containing `.md` files (repeatable) |
| `--port <number>` | `3200`       | Port to serve on                             |
| `--no-open`       | —            | Don't auto-open the browser                  |

### Multi-directory support

View plans from multiple projects at once:

```bash
# Repeat the --dir flag
local-md-viewer --dir ./proj1/.claude/plans --dir ./proj2/.claude/plans

# Or use comma-separated paths
local-md-viewer --dir ./proj1/.claude/plans,./proj2/.claude/plans
```

The sidebar groups files by directory with collapsible sections, so you can easily browse plans from different projects.

### Environment variables

| Variable     | Description                                              |
| ------------ | --------------------------------------------------------- |
| `APP_PORT`   | Override port (takes priority over `--port`)               |
| `APP_REMOTE` | Set to `1` for remote/devcontainer mode (skip auto-open)   |

Remote mode is useful when running inside SSH sessions, devcontainers, or Codespaces:

```bash
APP_REMOTE=1 local-md-viewer
# → Remote mode: open http://localhost:3200 in your browser
```

## Claude Code integration

### ExitPlanMode hook (auto-open viewer)

Automatically open the plan viewer whenever Claude exits plan mode:

```bash
# Print setup instructions
local-md-viewer-hook --setup
```

Add to your `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PermissionRequest": [
      {
        "matcher": "ExitPlanMode",
        "hooks": [
          {
            "type": "command",
            "command": "local-md-viewer-hook"
          }
        ]
      }
    ]
  }
}
```

### Slash commands

Copy the `.claude/commands/` directory from this repo into your project to get these commands in Claude Code:

| Command                        | Description                    |
| ------------------------------ | ------------------------------ |
| `/project:plans-open`          | Open the plan viewer           |
| `/project:plans-new [title]`   | Create a new plan file         |
| `/project:plans-list`          | List all plans in the project  |

## File naming convention

Files are sorted by date prefix when present:

```
2026-03-18-api-redesign.md      →  Mar 18, 2026  ·  Api Redesign
2026-03-15-auth-flow.md         →  Mar 15, 2026  ·  Auth Flow
meeting-notes.md                →  (undated)     ·  Meeting Notes
```

## Development

```bash
# Install dependencies
npm install

# Start the dev server (UI hot-reload on :5173, API on :3200)
npm run dev          # Vite dev server
npm run dev:server   # API server (in a separate terminal)

# Build for production
npm run build

# Preview the production build
npm run preview -- --dir ./my-docs
```

## Tech stack

- [React 19](https://react.dev) + [Vite 6](https://vite.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) components
- [react-markdown](https://github.com/remarkjs/react-markdown) with GFM and highlight.js
- [wouter](https://github.com/molefrog/wouter) for routing
- [cmdk](https://cmdk.paco.me) for the command palette

## Credits

This project is a fork of [claude-plan-visualizer](https://github.com/felipeorlando/claude-plan-visualizer) by Felipe Orlando.

## License

MIT
