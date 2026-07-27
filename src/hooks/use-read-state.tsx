import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchReadState, updateReadState } from '@/lib/api'

interface ReadStateContextValue {
  isRead: (slug: string) => boolean
  markRead: (slug: string) => void
  markUnread: (slug: string) => void
  markAllRead: (slugs: string[]) => void
}

const ReadStateContext = createContext<ReadStateContextValue | null>(null)

export function ReadStateProvider({ children }: { children: ReactNode }) {
  const [read, setRead] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchReadState()
      .then((slugs) => setRead(new Set(slugs)))
      .catch(() => {
        // If the server is unreachable, fall back to an empty set.
      })
  }, [])

  // Optimistically apply a local change, then reconcile with the server's
  // authoritative response (the server is the source of truth).
  const applyChange = useCallback(
    (slugs: string[], nextRead: boolean) => {
      setRead((prev) => {
        const next = new Set(prev)
        for (const slug of slugs) {
          if (nextRead) next.add(slug)
          else next.delete(slug)
        }
        return next
      })
      updateReadState(slugs, nextRead)
        .then((serverSlugs) => setRead(new Set(serverSlugs)))
        .catch(() => {
          // Keep the optimistic state if the request fails.
        })
    },
    []
  )

  const markRead = useCallback(
    (slug: string) => applyChange([slug], true),
    [applyChange]
  )
  const markUnread = useCallback(
    (slug: string) => applyChange([slug], false),
    [applyChange]
  )
  const markAllRead = useCallback(
    (slugs: string[]) => {
      if (slugs.length > 0) applyChange(slugs, true)
    },
    [applyChange]
  )

  const value = useMemo<ReadStateContextValue>(
    () => ({
      isRead: (slug: string) => read.has(slug),
      markRead,
      markUnread,
      markAllRead,
    }),
    [read, markRead, markUnread, markAllRead]
  )

  return (
    <ReadStateContext.Provider value={value}>
      {children}
    </ReadStateContext.Provider>
  )
}

export function useReadState(): ReadStateContextValue {
  const ctx = useContext(ReadStateContext)
  if (!ctx) {
    throw new Error('useReadState must be used within a ReadStateProvider')
  }
  return ctx
}
