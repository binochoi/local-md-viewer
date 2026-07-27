// Server-side read/unread state, persisted in an embedded SQLite database.
//
// The database lives in a cross-platform user config directory
// (~/.config/local-md-viewer/read-state.db by default, honoring
// $XDG_CONFIG_HOME) so the same state is shared across every project the
// viewer is pointed at, on macOS, Linux and Windows/WSL alike.
//
// Documents are keyed by their absolute file path rather than slug, so files
// with the same name in different directories never clobber each other.

import { DatabaseSync } from 'node:sqlite'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'

let db = null

function configDir() {
  const base = process.env.XDG_CONFIG_HOME || join(homedir(), '.config')
  return join(base, 'local-md-viewer')
}

function getDb() {
  if (db) return db
  const dir = configDir()
  mkdirSync(dir, { recursive: true })
  db = new DatabaseSync(join(dir, 'read-state.db'))
  db.exec(`
    CREATE TABLE IF NOT EXISTS read_state (
      path TEXT PRIMARY KEY,
      read_at TEXT NOT NULL
    )
  `)
  return db
}

export function getReadPaths() {
  const rows = getDb().prepare('SELECT path FROM read_state').all()
  return new Set(rows.map((r) => r.path))
}

export function markPathsRead(paths) {
  if (paths.length === 0) return
  const stmt = getDb().prepare(
    'INSERT OR REPLACE INTO read_state (path, read_at) VALUES (?, ?)'
  )
  const now = new Date().toISOString()
  for (const p of paths) stmt.run(p, now)
}

export function markPathsUnread(paths) {
  if (paths.length === 0) return
  const stmt = getDb().prepare('DELETE FROM read_state WHERE path = ?')
  for (const p of paths) stmt.run(p)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
      if (data.length > 1_000_000) reject(new Error('Request body too large'))
    })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(payload))
}

// Maps the currently-served files (each { slug, path }) to the list of slugs
// that are marked read in the database.
function readSlugsFor(files) {
  const readPaths = getReadPaths()
  return files.filter((f) => readPaths.has(f.path)).map((f) => f.slug)
}

// Handles the read-state HTTP endpoints for both the dev and production
// servers. `listFiles` returns a Promise<Array<{ slug, path }>> of the files
// the server currently exposes. Returns true if the request was handled.
export async function handleReadStateRequest(req, res, url, { listFiles }) {
  if (url.pathname !== '/api/read-state') return false

  if (req.method === 'GET') {
    const files = await listFiles()
    sendJson(res, 200, { read: readSlugsFor(files) })
    return true
  }

  if (req.method === 'POST') {
    let body
    try {
      body = JSON.parse((await readBody(req)) || '{}')
    } catch {
      sendJson(res, 400, { error: 'Invalid JSON body' })
      return true
    }
    const slugs = Array.isArray(body.slugs) ? body.slugs : []
    const read = body.read !== false // default to marking read
    const files = await listFiles()
    const pathBySlug = new Map(files.map((f) => [f.slug, f.path]))
    const paths = slugs.map((s) => pathBySlug.get(s)).filter(Boolean)
    if (read) markPathsRead(paths)
    else markPathsUnread(paths)
    sendJson(res, 200, { read: readSlugsFor(files) })
    return true
  }

  return false
}
