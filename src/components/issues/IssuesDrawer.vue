<template>
  <v-navigation-drawer
    location="right"
    width="320"
    color="surface"
    class="border-l border-slate-800"
  >
    <aside class="flex h-full flex-col gap-4 p-4">
      <div class="flex items-center justify-between">
        <h1 class="text-lg font-semibold text-white">Active Issues</h1>
        <v-btn
          icon="mdi-tune"
          variant="text"
          density="comfortable"
          :color="filtersButtonColor"
          @click="showFilters = !showFilters"
        />
      </div>

      <IssuesFilters :is-visible="showFilters" />

      <div
        v-if="store.selectedIssue"
        class="rounded-lg border border-slate-800 bg-slate-950/40 p-3"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-bold text-slate-500">{{ store.selectedIssue.code }}</p>
            <h2 class="mt-1 line-clamp-2 text-sm font-bold text-white">
              {{ store.selectedIssue.title }}
            </h2>
          </div>
          <v-btn
            icon="mdi-pencil"
            variant="text"
            density="compact"
            color="primary"
            @click="store.openIssueFormForEdit(store.selectedIssue.id)"
          />
        </div>
        <p class="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-400">
          {{ store.selectedIssue.note }}
        </p>
      </div>

      <v-btn
        prepend-icon="mdi-history"
        variant="outlined"
        color="primary"
        class="text-none"
        @click="isActivityLogOpen = true"
      >
        Activity Log
      </v-btn>

      <div ref="issuesListRef" class="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        <div
          v-for="issue in store.filteredIssues"
          :key="issue.id"
          :ref="(element) => setIssueRef(issue.id, element)"
        >
          <IssueCard
            :issue="issue"
            :assignee="getAssignee(issue.assigneeId)"
            :selected="store.selectedIssueId === issue.id"
            :hovered="store.hoveredIssueId === issue.id"
            @select="onSelectIssue"
            @hover="store.setHoveredIssue"
            @leave="store.setHoveredIssue(null)"
          />
        </div>

        <div
          v-if="!store.filteredIssues.length"
          class="rounded-lg border border-dashed border-slate-700 p-5 text-center text-sm text-slate-500"
        >
          No issues match current filters.
        </div>
      </div>
    </aside>
  </v-navigation-drawer>

  <AppModal
    v-model="isIssueFormModalOpen"
    :title="issueFormTitle"
    :eyebrow="issueFormEyebrow"
    size="md"
    @close="store.closeIssueForm()"
  >
    <IssueForm />
  </AppModal>

  <AppModal
    v-model="isActivityLogOpen"
    title="Activity Log"
    :eyebrow="activityLogEyebrow"
    size="lg"
  >
    <ActivityLog />
  </AppModal>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { useIssueStore } from '@/stores/useIssuesStore'
import AppModal from '@/components/ui/AppModal.vue'
import ActivityLog from './ActivityLog.vue'
import IssueCard from './IssueCard.vue'
import IssueForm from './IssueForm.vue'
import IssuesFilters from './IssuesFilters.vue'

const store = useIssueStore()
const showFilters = ref(true)
const isActivityLogOpen = ref(false)
const issuesListRef = ref<HTMLElement | null>(null)
const issueRefs = new Map<string, HTMLElement>()

const filtersButtonColor = computed(() => (showFilters.value ? 'primary' : 'white'))
const isIssueFormModalOpen = computed({
  get: () => store.issueFormMode !== 'closed',
  set: (isOpen: boolean) => {
    if (!isOpen) store.closeIssueForm()
  },
})
const issueFormTitle = computed(() =>
  store.issueFormMode === 'edit' ? 'Edit Issue' : 'Report New Issue',
)
const issueFormEyebrow = computed(() => {
  if (store.issueFormMode === 'edit') return store.editingIssue?.code ?? ''
  if (store.draftIssueCoordinates) return 'Location selected'

  return ''
})
const activityLogEyebrow = computed(() => store.selectedIssue?.code ?? 'All issues')

function getAssignee(assigneeId: string) {
  return store.assignees.find((assignee) => assignee.id === assigneeId)
}

function setIssueRef(issueId: string, element: Element | ComponentPublicInstance | null): void {
  if (element instanceof HTMLElement) {
    issueRefs.set(issueId, element)
    return
  }

  issueRefs.delete(issueId)
}

function onSelectIssue(issueId: string): void {
  store.selectIssue(issueId)
}

watch(
  () => store.scrollRequestKey,
  async () => {
    await nextTick()

    if (!store.issueIdPendingScroll) return

    issueRefs.get(store.issueIdPendingScroll)?.scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    })
    store.clearIssueScrollRequest()
  },
)
</script>
