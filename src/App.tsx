import { useState, useCallback } from 'react'
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

export default function App() {
  const { files, groups, dirSections, hasMultipleDirs, projectName, loading, error } = usePlans()
  const [searchOpen, setSearchOpen] = useState(false)

  const openSearch = useCallback(() => setSearchOpen(true), [])

  return (
    <TooltipProvider>
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
          </header>
          <div className="flex-1">
            <Switch>
              <Route path="/:slug">
                {(params) => <PlanPage slug={params.slug} />}
              </Route>
              <Route>
                <EmptyState />
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
    </TooltipProvider>
  )
}
