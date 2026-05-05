import { defineStore } from 'pinia'
import { useApi } from '@/composables/useApi'
import defaultBlueprintImageUrl from '@/assets/BluePrint.png'
import type {
  ActivityAction,
  ActivityLogEntry,
  BlueprintImageSource,
  BlueprintPlan,
  ConstructionIssue,
  IssueCreator,
  IssueCoordinates,
  IssueFormMode,
  IssueInput,
  IssuePriority,
  IssuePriorityFilter,
  IssueSortKey,
  IssueStatus,
  IssueUpdateInput,
} from '@/types'

type IssueStats = {
  open: number
  inProgress: number
  resolved: number
}

type MarkerInteraction = {
  isDimmed: boolean
  isHovered: boolean
  isSelected: boolean
  shouldPulse: boolean
}

interface IssuesState {
  currentPlan: BlueprintPlan | null
  searchQuery: string
  selectedIssueId: string | null
  hoveredIssueId: string | null
  issueIdPendingScroll: string | null
  scrollRequestKey: number
  isPickingIssueLocation: boolean
  issueFormMode: IssueFormMode
  editingIssueId: string | null
  draftIssueCoordinates: IssueCoordinates | null
  sortBy: IssueSortKey
  filterPriority: IssuePriorityFilter
  filterStatus: IssueStatus | 'all'
  filterAssigneeId: string | 'all'
  filterCategory: string | 'all'
  assignees: IssueCreator[]
  activityLog: ActivityLogEntry[]
  activeUser: IssueCreator
}

const priorityWeight: Record<IssuePriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
}

const activeUser: IssueCreator = {
  id: 'user-current',
  name: 'Current User',
  initials: 'ME',
  color: '#0D9488',
}

const demoAssignees: IssueCreator[] = [
  { id: 'user-jd', name: 'John Doe', initials: 'JD', color: '#14B8A6' },
  { id: 'user-sm', name: 'Sarah Miller', initials: 'SM', color: '#0EA5E9' },
  { id: 'user-kl', name: 'Kamil Lewandowski', initials: 'KL', color: '#22C55E' },
  { id: 'user-rp', name: 'Rita Patel', initials: 'RP', color: '#8B5CF6' },
  { id: 'user-tc', name: 'Tom Chen', initials: 'TC', color: '#F59E0B' },
]

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function getAssignee(assignees: IssueCreator[], assigneeId: string): IssueCreator {
  return assignees.find((assignee) => assignee.id === assigneeId) ?? activeUser
}

function createIssueSearchText(issue: ConstructionIssue): string {
  return [
    issue.code,
    issue.title,
    issue.description,
    issue.note,
    issue.status,
    issue.priority,
    issue.category,
    issue.assignee,
  ]
    .join(' ')
    .toLowerCase()
}

function sortIssues(issues: ConstructionIssue[], sortBy: IssueSortKey): ConstructionIssue[] {
  return [...issues].sort((firstIssue, secondIssue) => {
    if (sortBy === 'oldest') {
      return Date.parse(firstIssue.createdAt) - Date.parse(secondIssue.createdAt)
    }

    if (sortBy === 'priority_high') {
      return priorityWeight[secondIssue.priority] - priorityWeight[firstIssue.priority]
    }

    if (sortBy === 'priority_low') {
      return priorityWeight[firstIssue.priority] - priorityWeight[secondIssue.priority]
    }

    return Date.parse(secondIssue.createdAt) - Date.parse(firstIssue.createdAt)
  })
}

function getFilteredIssues(state: IssuesState): ConstructionIssue[] {
  const query = state.searchQuery.trim().toLowerCase()
  const issues = state.currentPlan?.issues ?? []

  return sortIssues(
    issues.filter((issue) => {
      const matchesQuery = !query || createIssueSearchText(issue).includes(query)
      const matchesPriority = state.filterPriority === 'all' ||
        issue.priority === state.filterPriority
      const matchesStatus = state.filterStatus === 'all' || issue.status === state.filterStatus
      const matchesAssignee =
        state.filterAssigneeId === 'all' || issue.assigneeId === state.filterAssigneeId
      const matchesCategory =
        state.filterCategory === 'all' || issue.category === state.filterCategory

      return matchesQuery && matchesPriority && matchesStatus && matchesAssignee && matchesCategory
    }),
    state.sortBy,
  )
}

function getNextIssueCode(issues: ConstructionIssue[]): string {
  const issueNumbers = issues
    .map((issue) => Number.parseInt(issue.code.replace(/\D/g, ''), 10))
    .filter(Number.isFinite)
  const nextNumber = issueNumbers.length ? Math.max(...issueNumbers) + 1 : 1

  return `ISS-${String(nextNumber).padStart(3, '0')}`
}

function createDemoPlan(): BlueprintPlan {
  const now = new Date().toISOString()

  return {
    id: 'plan-central-plaza-floor-2',
    title: 'Central Plaza - Floor 2',
    imageUrl: defaultBlueprintImageUrl,
    imageSource: 'default',
    createdAt: now,
    updatedAt: now,
    issues: [
      {
        id: 'issue-001',
        code: 'ISS-001',
        title: 'Water leak in northwest corner',
        description: 'Visible water leak near the northwest ceiling line.',
        note: 'Check plumbing above ceiling grid before closing the area.',
        status: 'open',
        priority: 'high',
        category: 'Plumbing',
        x: 27,
        y: 33,
        assigneeId: 'user-jd',
        assignee: 'JD',
        createdAt: hoursAgo(2),
        updatedAt: hoursAgo(2),
      },
      {
        id: 'issue-002',
        code: 'ISS-002',
        title: 'Electrical outlet missing cover',
        description: 'Outlet is exposed and needs a cover plate.',
        note: 'Confirm circuit is isolated before repair.',
        status: 'in_progress',
        priority: 'medium',
        category: 'Electrical',
        x: 63,
        y: 47,
        assigneeId: 'user-sm',
        assignee: 'SM',
        createdAt: hoursAgo(5),
        updatedAt: hoursAgo(1),
      },
      {
        id: 'issue-003',
        code: 'ISS-003',
        title: 'Crack in load-bearing wall',
        description: 'Crack requires structural review before next inspection.',
        note: 'Escalated to structural engineer.',
        status: 'open',
        priority: 'high',
        category: 'Structural',
        x: 42,
        y: 58,
        assigneeId: 'user-kl',
        assignee: 'KL',
        createdAt: hoursAgo(24),
        updatedAt: hoursAgo(4),
      },
      {
        id: 'issue-004',
        code: 'ISS-004',
        title: 'Door frame misaligned',
        description: 'Door frame needs adjustment before final finish.',
        note: 'Low priority unless it blocks installation schedule.',
        status: 'open',
        priority: 'low',
        category: 'Carpentry',
        x: 77,
        y: 31,
        assigneeId: 'user-rp',
        assignee: 'RP',
        createdAt: hoursAgo(3),
        updatedAt: hoursAgo(3),
      },
      {
        id: 'issue-005',
        code: 'ISS-005',
        title: 'HVAC vent blocked by debris',
        description: 'Vent path blocked by construction debris.',
        note: 'Cleanup crew assigned before airflow test.',
        status: 'resolved',
        priority: 'medium',
        category: 'HVAC',
        x: 51,
        y: 69,
        assigneeId: 'user-tc',
        assignee: 'TC',
        createdAt: hoursAgo(6),
        updatedAt: hoursAgo(1),
      },
    ],
  }
}

function createInitialActivityLog(): ActivityLogEntry[] {
  return [
    {
      id: 'activity-001',
      action: 'plan_loaded',
      issueId: null,
      actorId: activeUser.id,
      actorName: activeUser.name,
      message: 'Loaded Central Plaza - Floor 2 demo plan.',
      createdAt: hoursAgo(8),
    },
    {
      id: 'activity-002',
      action: 'issue_created',
      issueId: 'issue-001',
      actorId: 'user-jd',
      actorName: 'John Doe',
      message: 'Created ISS-001: Water leak in northwest corner.',
      createdAt: hoursAgo(2),
    },
    {
      id: 'activity-003',
      action: 'issue_status_changed',
      issueId: 'issue-002',
      actorId: 'user-sm',
      actorName: 'Sarah Miller',
      message: 'Moved ISS-002 to In Progress.',
      createdAt: hoursAgo(1),
    },
  ]
}

export const useIssueStore = defineStore('issues', {
  state: (): IssuesState => ({
    currentPlan: createDemoPlan(),
    searchQuery: '',
    selectedIssueId: null,
    hoveredIssueId: null,
    issueIdPendingScroll: null,
    scrollRequestKey: 0,
    isPickingIssueLocation: false,
    issueFormMode: 'closed',
    editingIssueId: null,
    draftIssueCoordinates: null,
    sortBy: 'most_recent',
    filterPriority: 'all',
    filterStatus: 'all',
    filterAssigneeId: 'all',
    filterCategory: 'all',
    assignees: demoAssignees,
    activityLog: createInitialActivityLog(),
    activeUser,
  }),
  getters: {
    issues: (state): ConstructionIssue[] => state.currentPlan?.issues ?? [],
    filteredIssues: (state): ConstructionIssue[] => getFilteredIssues(state),
    selectedIssue: (state): ConstructionIssue | null =>
      state.currentPlan?.issues.find((issue) => issue.id === state.selectedIssueId) ?? null,
    editingIssue: (state): ConstructionIssue | null =>
      state.currentPlan?.issues.find((issue) => issue.id === state.editingIssueId) ?? null,
    issueStats: (state): IssueStats => {
      const stats: IssueStats = { open: 0, inProgress: 0, resolved: 0 }

      for (const issue of state.currentPlan?.issues ?? []) {
        if (issue.status === 'open') stats.open += 1
        if (issue.status === 'in_progress') stats.inProgress += 1
        if (issue.status === 'resolved') stats.resolved += 1
      }

      return stats
    },
    categories: (state): string[] => {
      const categories = new Set((state.currentPlan?.issues ?? []).map((issue) => issue.category))

      return [...categories].sort((firstCategory, secondCategory) =>
        firstCategory.localeCompare(secondCategory),
      )
    },
    activityForSelectedIssue: (state): ActivityLogEntry[] => {
      if (!state.selectedIssueId) return []

      return state.activityLog.filter((entry) => entry.issueId === state.selectedIssueId)
    },
    markerInteraction:
      (state) =>
      (issueId: string): MarkerInteraction => {
        const visibleIssueIds = new Set(getFilteredIssues(state).map((issue) => issue.id))
        const isHovered = state.hoveredIssueId === issueId
        const isSelected = state.selectedIssueId === issueId

        return {
          isDimmed: !visibleIssueIds.has(issueId),
          isHovered,
          isSelected,
          shouldPulse: isHovered || isSelected,
        }
      },
  },
  actions: {
    setCurrentPlan(plan: BlueprintPlan): void {
      this.currentPlan = plan
      this.selectedIssueId = null
      this.hoveredIssueId = null
      this.issueIdPendingScroll = null
      this.addActivity('plan_loaded', null, `Loaded ${plan.title}.`)
    },
    setPlanImageUrl(imageUrl: string, imageSource: BlueprintImageSource = 'url'): void {
      if (!this.currentPlan) return

      const now = new Date().toISOString()
      this.currentPlan.imageUrl = imageUrl
      this.currentPlan.imageSource = imageSource
      this.currentPlan.updatedAt = now
      this.addActivity('image_changed', null, 'Changed blueprint image.')
    },
    setSearchQuery(searchQuery: string): void {
      this.searchQuery = searchQuery
    },
    setSortBy(sortBy: IssueSortKey): void {
      this.sortBy = sortBy
    },
    setPriorityFilter(priority: IssuePriorityFilter): void {
      this.filterPriority = priority
    },
    resetFilters(): void {
      this.searchQuery = ''
      this.sortBy = 'most_recent'
      this.filterPriority = 'all'
      this.filterStatus = 'all'
      this.filterAssigneeId = 'all'
      this.filterCategory = 'all'
    },
    selectIssue(issueId: string | null, scrollIntoView = false): void {
      if (issueId && !this.currentPlan?.issues.some((issue) => issue.id === issueId)) return

      this.selectedIssueId = issueId

      if (issueId && scrollIntoView) {
        this.requestIssueScroll(issueId)
      }
    },
    focusIssueFromMarker(issueId: string): void {
      this.selectIssue(issueId, true)
      const issue = this.currentPlan?.issues.find((item) => item.id === issueId)
      this.addActivity('issue_selected', issueId, `Selected ${issue?.code ?? 'issue'}.`)
    },
    setHoveredIssue(issueId: string | null): void {
      if (issueId && !this.currentPlan?.issues.some((issue) => issue.id === issueId)) return

      this.hoveredIssueId = issueId
    },
    requestIssueScroll(issueId: string): void {
      this.issueIdPendingScroll = issueId
      this.scrollRequestKey += 1
    },
    clearIssueScrollRequest(): void {
      this.issueIdPendingScroll = null
    },
    startIssueLocationSelection(): void {
      this.closeIssueForm()
      this.selectedIssueId = null
      this.isPickingIssueLocation = true
    },
    cancelIssueLocationSelection(): void {
      this.isPickingIssueLocation = false
      this.draftIssueCoordinates = null
    },
    openIssueFormForNew(coordinates: IssueCoordinates | null = null): void {
      this.issueFormMode = 'add'
      this.isPickingIssueLocation = false
      this.editingIssueId = null
      this.draftIssueCoordinates = coordinates
    },
    openIssueFormForEdit(issueId: string): void {
      if (!this.currentPlan?.issues.some((issue) => issue.id === issueId)) return

      this.issueFormMode = 'edit'
      this.isPickingIssueLocation = false
      this.editingIssueId = issueId
      this.selectedIssueId = issueId
      this.draftIssueCoordinates = null
    },
    closeIssueForm(): void {
      this.issueFormMode = 'closed'
      this.isPickingIssueLocation = false
      this.editingIssueId = null
      this.draftIssueCoordinates = null
    },
    toggleIssueForm(isOpen: boolean): void {
      if (isOpen) {
        this.openIssueFormForNew(this.draftIssueCoordinates)
        return
      }

      this.closeIssueForm()
    },
    async addIssue(input: IssueInput): Promise<string | null> {
      if (!this.currentPlan) return null

      const now = new Date().toISOString()
      const assignee = getAssignee(this.assignees, input.assigneeId)
      const coordinates = input.coordinates ?? this.draftIssueCoordinates ?? { x: 50, y: 50 }
      const issue: ConstructionIssue = {
        id: createId('issue'),
        code: getNextIssueCode(this.currentPlan.issues),
        title: input.title,
        description: input.note,
        note: input.note,
        status: input.status ?? 'open',
        priority: input.priority ?? 'medium',
        category: input.category ?? 'General',
        x: coordinates.x,
        y: coordinates.y,
        assigneeId: assignee.id,
        assignee: assignee.initials,
        createdAt: now,
        updatedAt: now,
      }

      await useApi().createIssue(issue)

      this.currentPlan.issues.push(issue)
      this.currentPlan.updatedAt = now
      this.selectedIssueId = issue.id
      this.closeIssueForm()
      this.requestIssueScroll(issue.id)
      this.addActivity('issue_created', issue.id, `Created ${issue.code}: ${issue.title}.`)

      return issue.id
    },
    async updateIssue(issueId: string, patch: IssueUpdateInput): Promise<boolean> {
      const issue = this.currentPlan?.issues.find((item) => item.id === issueId)
      if (!issue || !this.currentPlan) return false

      await useApi().updateIssue(issueId, patch)

      const previousStatus = issue.status
      const previousPriority = issue.priority
      const previousAssigneeId = issue.assigneeId
      const now = new Date().toISOString()

      Object.assign(issue, patch, { updatedAt: now })

      if (patch.assigneeId && patch.assigneeId !== previousAssigneeId) {
        issue.assignee = getAssignee(this.assignees, patch.assigneeId).initials
      }

      this.currentPlan.updatedAt = now

      if (patch.status && patch.status !== previousStatus) {
        this.addActivity('issue_status_changed', issue.id, `Changed ${issue.code} status.`)
      } else if (patch.priority && patch.priority !== previousPriority) {
        this.addActivity('issue_priority_changed', issue.id, `Changed ${issue.code} priority.`)
      } else if (patch.assigneeId && patch.assigneeId !== previousAssigneeId) {
        this.addActivity('issue_assigned', issue.id, `Reassigned ${issue.code}.`)
      } else {
        this.addActivity('issue_updated', issue.id, `Updated ${issue.code}.`)
      }

      return true
    },
    async deleteIssue(issueId: string): Promise<boolean> {
      if (!this.currentPlan) return false

      const issueIndex = this.currentPlan.issues.findIndex((issue) => issue.id === issueId)
      const issue = this.currentPlan.issues[issueIndex]
      if (issueIndex === -1 || !issue) return false

      await useApi().deleteIssue(issueId)

      this.currentPlan.issues.splice(issueIndex, 1)
      this.currentPlan.updatedAt = new Date().toISOString()

      if (this.selectedIssueId === issueId) this.selectedIssueId = null
      if (this.hoveredIssueId === issueId) this.hoveredIssueId = null
      if (this.editingIssueId === issueId) this.closeIssueForm()

      this.addActivity('issue_deleted', issueId, `Deleted ${issue.code}: ${issue.title}.`)

      return true
    },
    moveIssueMarker(issueId: string, coordinates: IssueCoordinates): boolean {
      const issue = this.currentPlan?.issues.find((item) => item.id === issueId)
      if (!issue || !this.currentPlan) return false

      const now = new Date().toISOString()
      issue.x = coordinates.x
      issue.y = coordinates.y
      issue.updatedAt = now
      this.currentPlan.updatedAt = now
      this.addActivity('marker_moved', issueId, `Moved ${issue.code} marker on blueprint.`)

      return true
    },
    addActivity(action: ActivityAction, issueId: string | null, message: string): void {
      this.activityLog.unshift({
        id: createId('activity'),
        action,
        issueId,
        actorId: this.activeUser.id,
        actorName: this.activeUser.name,
        message,
        createdAt: new Date().toISOString(),
      })
    },
  },
})
