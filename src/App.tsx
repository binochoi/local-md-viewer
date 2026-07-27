import { useState, useCallback, useEffect } from 'react'
import { Route, Switch } from 'wouter'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { CommandMenu } from '@/components/command-menu'
import { EmptyState } from '@/components/empty-state'
import { PlanPage } from '@/pages/plan-page'
import { usePlans } from '@/hooks/use-plans'
import { ReadStateProvider } from '@/hooks/use-read-state'

function EmptyStateWithReset({ onMount }: { onMount: () => void }) {
  useEffect(() => {
    onMount()
  }, [onMount])
  return <EmptyState />
}

export default function App() {
  const { files, groups, dirSections, hasMultipleDirs, projectName, loading, error } = usePlans()
  const [searchOpen, setSearchOpen] = useState(false)
  const [meta, setMeta] = useState<{ worktreeName?: string; repositoryName?: string } | null>(null)

  const openSearch = useCallback(() => setSearchOpen(true), [])
  const handleMetaLoaded = useCallback(
    (m: { worktreeName?: string; repositoryName?: string }) => setMeta(m),
    []
  )
  const clearMeta = useCallback(() => setMeta(null), [])

  return (
    <TooltipProvider>
      <ReadStateProvider>
      <SidebarProvider>
        <AppSidebar
          groups={groups}
          dirSections={dirSections}
          hasMultipleDirs={hasMultipleDirs}
          projectName={projectName}
          loading={loading}
          error={error}
          onOpenSearch={openSearch}
        />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background">
            <div className="flex items-center gap-2 px-3">
              <SidebarTrigger />
            </div>
            {meta?.worktreeName && (
              <div className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 flex-col items-center">
                <span className="max-w-[50vw] truncate text-sm font-medium leading-tight">
                  {meta.worktreeName}
                </span>
                {meta.repositoryName && (
                  <span className="max-w-[50vw] truncate text-xs leading-tight text-muted-foreground">
                    {meta.repositoryName}
                  </span>
                )}
              </div>
            )}
          </header>
          <div className="flex-1">
            <Switch>
              <Route path="/:slug">
                {(params) => (
                  <PlanPage
                    key={params.slug}
                    slug={params.slug}
                    onMetaLoaded={handleMetaLoaded}
                  />
                )}
              </Route>
              <Route>
                <EmptyStateWithReset onMount={clearMeta} />
              </Route>
            </Switch>
          </div>
        </SidebarInset>
        <CommandMenu
          files={files}
          open={searchOpen}
          onOpenChange={setSearchOpen}
        />
      </SidebarProvider>
      </ReadStateProvider>
    </TooltipProvider>
  )
}
