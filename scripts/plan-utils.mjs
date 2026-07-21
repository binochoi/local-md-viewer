import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import matter from 'gray-matter'

export const DATE_PREFIX_RE = /^(\d{4}-\d{2}-\d{2})-(.+)$/

// Auto-detects a plans directory when none was explicitly configured:
// project-local .claude/plans, then docs/plans, then ~/.claude/plans.
export function resolveDefaultPlansDir(cwd) {
  const candidates = [
    join(cwd, '.claude', 'plans'),
    join(cwd, 'docs', 'plans'),
    join(homedir(), '.claude', 'plans'),
  ]

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }

  return null
}

export function slugToTitle(slug) {
  const match = slug.match(DATE_PREFIX_RE)
  const withoutDate = match ? match[2] : slug
  return withoutDate
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// Reads a plan file and splits off its optional YAML frontmatter.
// Falls back to { data: {}, content: <raw file> } if parsing fails.
export async function readPlanFrontmatter(filepath) {
  const raw = await readFile(filepath, 'utf-8')
  try {
    const { data, content } = matter(raw)
    return { data: data ?? {}, content }
  } catch {
    return { data: {}, content: raw }
  }
}
