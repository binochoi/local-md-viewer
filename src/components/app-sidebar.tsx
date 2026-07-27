import * as React from 'react'
import { Link, useLocation } from 'wouter'
import { CheckCheckIcon, ChevronRightIcon, FolderIcon, SearchIcon } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import type { DayGroup, DirSection } from '@/hooks/use-plans'
import { useReadState } from '@/hooks/use-read-state'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroupAction,
  SidebarRail,
} from '@/components/ui/sidebar'

function collectSlugs(groups: DayGroup[]): string[] {
  return groups.flatMap((group) => group.files.map((file) => file.slug))
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  groups: DayGroup[]
  dirSections: DirSection[]
  hasMultipleDirs: boolean
  projectName: string
  loading: boolean
  error: string | null
  onOpenSearch: () => void
}

function DateGroupList({ groups, location }: { groups: DayGroup[]; location: string }) {
  const { isRead } = useReadState()
  return (
    <>
      {groups.map((group) => (
        <Collapsible
          key={group.date ?? 'undated'}
          defaultOpen
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className="font-medium">
                {group.label}
                <ChevronRightIcon className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            {group.files.length > 0 && (
              <CollapsibleContent>
                <SidebarMenuSub>
                  {group.files.map((file) => {
                    const read = isRead(file.slug)
                    return (
                    <SidebarMenuSubItem key={file.slug}>
                      <SidebarMenuSubButton
                        className="h-auto min-h-7 py-1"
                        isActive={location === `/${file.slug}`}
                        render={<Link href={`/${file.slug}`} />}
                      >
                        <span className="flex items-start gap-2">
                          <span
                            className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                              read ? 'bg-transparent' : 'bg-primary'
                            }`}
                            aria-label={read ? undefined : 'Unread'}
                          />
                          <span className={`flex flex-col ${read ? 'text-muted-foreground' : ''}`}>
                            <span>{file.title}</span>
                            {file.repositoryName && (
                              <span className="text-xs text-muted-foreground">
                                {file.repositoryName}
                              </span>
                            )}
                          </span>
                        </span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    )
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>
            )}
          </SidebarMenuItem>
        </Collapsible>
      ))}
    </>
  )
}

export function AppSidebar({
  groups,
  dirSections,
  hasMultipleDirs,
  projectName,
  loading,
  error,
  onOpenSearch,
  ...props
}: AppSidebarProps) {
  const [location] = useLocation()
  const { markAllRead } = useReadState()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="p-2">
          <img src="/logo.svg" alt="Logo" className="size-8" />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onOpenSearch}
              className="text-muted-foreground"
            >
              <SearchIcon className="size-4" />
              <span>Search</span>
              <kbd className="ml-auto pointer-events-none text-[10px] font-mono text-muted-foreground/60">
                <span className="text-[11px]">&#8984;</span>K
              </kbd>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {loading ? (
          <SidebarGroup>
            <SidebarMenu>
              {Array.from({ length: 6 }).map((_, i) => (
                <SidebarMenuItem key={i}>
                  <SidebarMenuSkeleton />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ) : error ? (
          <SidebarGroup>
            <p className="px-2 pt-4 text-xs text-destructive">{error}</p>
          </SidebarGroup>
        ) : groups.length === 0 ? (
          <SidebarGroup>
            <p className="px-2 pt-4 text-xs text-muted-foreground">
              No plan files found
            </p>
          </SidebarGroup>
        ) : hasMultipleDirs ? (
          // Multi-directory mode: show each dir as a collapsible section
          dirSections.map((section) => (
            <SidebarGroup key={section.dirLabel}>
              <Collapsible defaultOpen className="group/dir">
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center gap-1.5 pr-7">
                    <FolderIcon className="size-3.5 shrink-0" />
                    <span className="truncate">{section.dirLabel}</span>
                    <ChevronRightIcon className="size-3.5 shrink-0 transition-transform group-data-[state=open]/dir:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <SidebarGroupAction
                  title="이 폴더 전체 읽음 처리"
                  onClick={() => markAllRead(collectSlugs(section.groups))}
                >
                  <CheckCheckIcon />
                  <span className="sr-only">이 폴더 전체 읽음 처리</span>
                </SidebarGroupAction>
                <CollapsibleContent>
                  <SidebarMenu>
                    <DateGroupList groups={section.groups} location={location} />
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          ))
        ) : (
          // Single directory mode: flat date groups
          <SidebarGroup>
            <SidebarGroupLabel className="pr-7">Documents</SidebarGroupLabel>
            <SidebarGroupAction
              title="전체 읽음 처리"
              onClick={() => markAllRead(collectSlugs(groups))}
            >
              <CheckCheckIcon />
              <span className="sr-only">전체 읽음 처리</span>
            </SidebarGroupAction>
            <SidebarMenu>
              <DateGroupList groups={groups} location={location} />
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <ThemeToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
