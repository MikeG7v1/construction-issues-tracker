export const ISSUE_PRIORITY_VALUES = ['all', 'low', 'medium', 'high'] as const

export const ISSUE_SORT_VALUES = ['most_recent', 'oldest', 'priority_high', 'priority_low'] as const

export const ISSUE_PRIORITY_LABELS = {
  all: 'All Priorities',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
} satisfies Record<(typeof ISSUE_PRIORITY_VALUES)[number], string>

export const ISSUE_PRIORITY_THEMES = {
  low: 'green',
  medium: 'orange',
  high: 'red',
} satisfies Record<Exclude<(typeof ISSUE_PRIORITY_VALUES)[number], 'all'>, string>

export const ISSUE_SORT_LABELS = {
  most_recent: 'Most Recent',
  oldest: 'Oldest First',
  priority_high: 'Priority High to Low',
  priority_low: 'Priority Low to High',
} satisfies Record<(typeof ISSUE_SORT_VALUES)[number], string>

export const ISSUE_PRIORITY_CLASSES = {
  high: 'bg-red-500/20 text-red-500 border-red-500/50',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  low: 'bg-slate-800 text-slate-300 border-slate-600',
} as const

export const ISSUE_MARKER_CLASSES = {
  high: 'bg-red-500 border-red-100',
  medium: 'bg-blue-500 border-blue-100',
  low: 'bg-amber-400 border-amber-100',
} as const

export type IssuePriorityValue = (typeof ISSUE_PRIORITY_VALUES)[number]
export type IssueSortValue = (typeof ISSUE_SORT_VALUES)[number]
