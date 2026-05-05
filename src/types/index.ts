export type IssueStatus = 'open' | 'in_progress' | 'resolved'
export type IssuePriority = 'low' | 'medium' | 'high'
export type IssuePriorityFilter = IssuePriority | 'all'
export type IssueSortKey = 'most_recent' | 'oldest' | 'priority_high' | 'priority_low'
export type IssueFormMode = 'closed' | 'add' | 'edit'
export type BlueprintImageSource = 'default' | 'url' | 'upload'
export type ActivityAction =
  | 'plan_loaded'
  | 'image_changed'
  | 'issue_created'
  | 'issue_updated'
  | 'issue_deleted'
  | 'issue_status_changed'
  | 'issue_priority_changed'
  | 'issue_assigned'
  | 'marker_moved'
  | 'issue_selected'

export interface IssueCoordinates {
  x: number
  y: number
}

export interface IssueCreator {
  id: string
  name: string
  initials: string
  color: string
}

export interface ConstructionIssue {
  id: string
  code: string
  title: string
  description: string
  note: string
  status: IssueStatus
  priority: IssuePriority
  category: string
  x: number
  y: number
  assigneeId: string
  assignee: string
  createdAt: string
  updatedAt: string
}

export interface IssueFilters {
  status: IssueStatus | 'all'
  priority: IssuePriorityFilter
  assigneeId: string | 'all'
  category: string | 'all'
}

export interface IssueInput {
  title: string
  note: string
  assigneeId: string
  status?: IssueStatus
  priority?: IssuePriority
  category?: string
  coordinates?: IssueCoordinates
}

export type IssueUpdateInput = Partial<
  Pick<
    ConstructionIssue,
    | 'title'
    | 'description'
    | 'note'
    | 'status'
    | 'priority'
    | 'category'
    | 'x'
    | 'y'
    | 'assigneeId'
    | 'assignee'
  >
>

export interface ActivityLogEntry {
  id: string
  action: ActivityAction
  issueId: string | null
  actorId: string
  actorName: string
  message: string
  createdAt: string
}

export interface BlueprintPlan {
  id: string
  title: string
  imageUrl: string
  imageSource: BlueprintImageSource
  issues: ConstructionIssue[]
  createdAt: string
  updatedAt: string
}
