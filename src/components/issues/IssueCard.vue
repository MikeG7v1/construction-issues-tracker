<template>
  <article
    class="group relative cursor-pointer rounded-lg border p-3 transition duration-200"
    :class="cardClass"
    @click="$emit('select', issue.id)"
    @mouseenter="$emit('hover', issue.id)"
    @mouseleave="$emit('leave')"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <span
          class="inline-flex items-center rounded border px-2 py-1 text-[11px] font-bold leading-none"
          :class="priorityClass"
        >
          {{ priorityLabel }}
        </span>

        <h3 class="mt-3 line-clamp-2 text-sm font-bold leading-snug text-white">
          {{ issue.title }}
        </h3>
      </div>

      <div
        class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
        :style="{ backgroundColor: assigneeColor }"
      >
        {{ issue.assignee }}
      </div>
    </div>

    <div class="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
      <span class="flex min-w-0 items-center gap-1.5">
        <v-icon size="14" color="#64748b">mdi-information-outline</v-icon>
        <span class="truncate">{{ issue.code }}</span>
      </span>

      <span class="flex shrink-0 items-center gap-1.5">
        <v-icon size="14" color="#64748b">mdi-clock-outline</v-icon>
        {{ relativeTime }}
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConstructionIssue, IssueCreator } from '@/types'
import { ISSUE_PRIORITY_LABELS, ISSUE_PRIORITY_CLASSES } from './issuesTypes'

const props = defineProps<{
  issue: ConstructionIssue
  assignee?: IssueCreator
  selected?: boolean
  hovered?: boolean
}>()

defineEmits<{
  select: [id: string]
  hover: [id: string]
  leave: []
}>()

const priorityClass = computed(() => ISSUE_PRIORITY_CLASSES[props.issue.priority])
const priorityLabel = computed(() => ISSUE_PRIORITY_LABELS[props.issue.priority])
const assigneeColor = computed(() => props.assignee?.color ?? '#0D9488')

const cardClass = computed(() => {
  if (props.selected) {
    return 'border-primary bg-slate-800 shadow-[0_0_0_1px_rgba(13,148,136,0.3)]'
  }

  if (props.hovered) {
    return 'border-slate-500 bg-slate-800'
  }

  return 'border-slate-700 bg-slate-900 hover:border-slate-500 hover:bg-slate-800'
})

const relativeTime = computed(() => formatRelativeTime(props.issue.createdAt))

function formatRelativeTime(value: string): string {
  const timestamp = Date.parse(value)
  if (Number.isNaN(timestamp)) return ''

  const diffInSeconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000))
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInDays > 0) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
  if (diffInHours > 0) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
  if (diffInMinutes > 0) return `${diffInMinutes} min ago`

  return 'just now'
}
</script>
