<template>
  <section class="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-sm font-bold text-white">Activity Log</h2>
      <span class="text-xs text-slate-500">{{ activityItems.length }}</span>
    </div>

    <div v-if="activityItems.length" class="space-y-3">
      <article
        v-for="entry in activityItems"
        :key="entry.id"
        class="border-l border-slate-700 pl-3"
      >
        <p class="text-xs leading-relaxed text-slate-300">{{ entry.message }}</p>
        <div class="mt-1 flex items-center justify-between gap-2 text-[11px] text-slate-500">
          <span class="truncate">{{ entry.actorName }}</span>
          <span class="shrink-0">{{ formatRelativeTime(entry.createdAt) }}</span>
        </div>
      </article>
    </div>

    <p v-else class="text-xs text-slate-500">No activity yet.</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useIssueStore } from '@/stores/useIssuesStore'

const store = useIssueStore()

const activityItems = computed(() => {
  if (store.selectedIssueId) {
    return store.activityForSelectedIssue.slice(0, 5)
  }

  return store.activityLog.slice(0, 5)
})

function formatRelativeTime(value: string): string {
  const timestamp = Date.parse(value)
  if (Number.isNaN(timestamp)) return ''

  const diffInSeconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000))
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInDays > 0) return `${diffInDays}d ago`
  if (diffInHours > 0) return `${diffInHours}h ago`
  if (diffInMinutes > 0) return `${diffInMinutes}m ago`

  return 'now'
}
</script>
