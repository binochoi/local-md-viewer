import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { readdirSync, statSync, existsSync } from 'fs'
import { DATE_PREFIX_RE, slugToTitle, readPlanFrontmatter, resolveDefaultPlansDir } from './scripts/plan-utils.mjs'

function resolvePlansDir(): string {
  const explicit = process.env.PLANS_DIR

  if (explicit) {
    const resolved = path.resolve(explicit)
    // If it's a project root, look for .claude/plans inside it
    const nested = path.join(resolved, '.claude', 'plans')
    if (existsSync(nested)) return nested
    return resolved
  }

  return resolveDefaultPlansDir(process.cwd()) ?? path.resolve('.claude/plans')
}

function plansApiPlugin() {
  const dir = resolvePlansDir()

  return {
    name: 'plans-api',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = new URL(req.url ?? '/', 'http://localhost')

        if (url.pathname === '/api/files' && req.method === 'GET') {
          if (!existsSync(dir)) {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ files: [], projectName: path.basename(process.cwd()) }))
            return
          }
          const entries = readdirSync(dir).filter((f: string) => f.endsWith('.md'))
          Promise.all(
            entries.map(async (filename: string) => {
              const slug = filename.replace(/\.md$/, '')
              const dateMatch = slug.match(DATE_PREFIX_RE)
              const fileStat = statSync(path.join(dir, filename))
              const { data } = await readPlanFrontmatter(path.join(dir, filename))
              return {
                slug,
                filename,
                date: dateMatch ? dateMatch[1] : null,
                title: data.title ?? slugToTitle(slug),
                modifiedAt: fileStat.mtime.toISOString(),
                ...(data.repositoryName ? { repositoryName: data.repositoryName } : {}),
              }
            })
          ).then((files) => {
            files.sort((a, b) => {
              const dateA = a.date ?? '0000-00-00'
              const dateB = b.date ?? '0000-00-00'
              if (dateA !== dateB) return dateB.localeCompare(dateA)
              return b.modifiedAt.localeCompare(a.modifiedAt)
            })

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ files, projectName: path.basename(path.resolve(dir, '../..')) }))
          })
          return
        }

        const fileMatch = url.pathname.match(/^\/api\/files\/(.+)$/)
        if (fileMatch && req.method === 'GET') {
          const slug = decodeURIComponent(fileMatch[1])
          const filepath = path.join(dir, `${slug}.md`)

          if (!existsSync(filepath)) {
            res.writeHead(404, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'File not found' }))
            return
          }

          readPlanFrontmatter(filepath).then(({ data, content }) => {
            const dateMatch = slug.match(DATE_PREFIX_RE)
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({
              slug,
              filename: `${slug}.md`,
              date: dateMatch ? dateMatch[1] : null,
              content,
              ...(data.title ? { title: data.title } : {}),
              ...(data.repositoryName ? { repositoryName: data.repositoryName } : {}),
              ...(data.worktreeName ? { worktreeName: data.worktreeName } : {}),
            }))
          })
          return
        }

        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), plansApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist/client',
  },
})
