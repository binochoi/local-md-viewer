export interface FileEntry {
  slug: string
  filename: string
  date: string | null
  title: string
  modifiedAt: string
  dirLabel?: string
  repositoryName?: string
}

export interface FileContent {
  slug: string
  filename: string
  date: string | null
  content: string
  title?: string
  repositoryName?: string
  worktreeName?: string
}

export interface FilesResponse {
  files: FileEntry[]
  projectName: string
}

export async function fetchFiles(): Promise<FilesResponse> {
  const res = await fetch('/api/files')
  if (!res.ok) throw new Error('Failed to fetch files')
  const data = await res.json()
  return { files: data.files, projectName: data.projectName ?? 'Plans' }
}

export async function fetchFileContent(slug: string): Promise<FileContent> {
  const res = await fetch(`/api/files/${encodeURIComponent(slug)}`)
  if (!res.ok) throw new Error('Failed to fetch file content')
  return res.json()
}

export async function fetchReadState(): Promise<string[]> {
  const res = await fetch('/api/read-state')
  if (!res.ok) throw new Error('Failed to fetch read state')
  const data = await res.json()
  return Array.isArray(data.read) ? data.read : []
}

export async function updateReadState(
  slugs: string[],
  read: boolean
): Promise<string[]> {
  const res = await fetch('/api/read-state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slugs, read }),
  })
  if (!res.ok) throw new Error('Failed to update read state')
  const data = await res.json()
  return Array.isArray(data.read) ? data.read : []
}
