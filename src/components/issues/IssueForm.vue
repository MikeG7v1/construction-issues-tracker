<template>
  <form class="space-y-3" @submit.prevent="onSubmit">
    <v-text-field
      v-model="title"
      label="Title"
      variant="outlined"
      density="compact"
      color="primary"
      bg-color="#111827"
      base-color="#334155"
      hide-details
      theme="dark"
      class="issue-field"
    />

    <v-textarea
      v-model="note"
      label="Note"
      variant="outlined"
      density="compact"
      color="primary"
      bg-color="#111827"
      base-color="#334155"
      hide-details
      rows="3"
      no-resize
      theme="dark"
      class="issue-field"
    />

    <v-select
      v-model="assigneeId"
      :items="assigneeItems"
      :menu-props="menuProps"
      label="Assigned person"
      variant="outlined"
      density="compact"
      color="primary"
      bg-color="#111827"
      base-color="#334155"
      hide-details
      theme="dark"
      class="issue-field"
    />

    <div class="grid grid-cols-2 gap-3">
      <v-select
        v-model="priority"
        :items="priorityItems"
        :menu-props="menuProps"
        label="Priority"
        variant="outlined"
        density="compact"
        color="primary"
        bg-color="#111827"
        base-color="#334155"
        hide-details
        theme="dark"
        class="issue-field"
      />
      <v-select
        v-model="status"
        :items="statusItems"
        :menu-props="menuProps"
        label="Status"
        variant="outlined"
        density="compact"
        color="primary"
        bg-color="#111827"
        base-color="#334155"
        hide-details
        theme="dark"
        class="issue-field"
      />
    </div>

    <v-text-field
      v-model="category"
      label="Category"
      variant="outlined"
      density="compact"
      color="primary"
      bg-color="#111827"
      base-color="#334155"
      hide-details
      theme="dark"
      class="issue-field"
    />

    <div class="flex items-center justify-between pt-1">
      <v-btn
        v-if="store.issueFormMode === 'edit' && store.editingIssueId"
        color="red"
        variant="text"
        class="text-none"
        @click="onDelete"
      >
        Delete
      </v-btn>
      <span v-else></span>

      <div class="flex gap-2">
        <v-btn variant="text" class="text-none" @click="store.closeIssueForm()">
          Cancel
        </v-btn>
        <v-btn color="primary" type="submit" class="text-none font-bold">
          {{ submitLabel }}
        </v-btn>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useIssueStore } from '@/stores/useIssuesStore'
import type { IssuePriority, IssueStatus } from '@/types'

const store = useIssueStore()

const title = ref('')
const note = ref('')
const assigneeId = ref(store.assignees[0]?.id ?? '')
const priority = ref<IssuePriority>('medium')
const status = ref<IssueStatus>('open')
const category = ref('General')

const menuProps = {
  contentClass: 'issue-select-menu',
}

const priorityItems = [
  { title: 'High', value: 'high' },
  { title: 'Medium', value: 'medium' },
  { title: 'Low', value: 'low' },
] satisfies Array<{ title: string; value: IssuePriority }>

const statusItems = [
  { title: 'Open', value: 'open' },
  { title: 'In Progress', value: 'in_progress' },
  { title: 'Resolved', value: 'resolved' },
] satisfies Array<{ title: string; value: IssueStatus }>

const assigneeItems = computed(() =>
  store.assignees.map((assignee) => ({
    title: `${assignee.name} (${assignee.initials})`,
    value: assignee.id,
  })),
)

const submitLabel = computed(() => (store.issueFormMode === 'edit' ? 'Save' : 'Create'))

watch(
  () => [store.issueFormMode, store.editingIssue] as const,
  () => {
    const issue = store.editingIssue

    if (store.issueFormMode === 'edit' && issue) {
      title.value = issue.title
      note.value = issue.note
      assigneeId.value = issue.assigneeId
      priority.value = issue.priority
      status.value = issue.status
      category.value = issue.category
      return
    }

    if (store.issueFormMode === 'add') {
      title.value = ''
      note.value = ''
      assigneeId.value = store.assignees[0]?.id ?? ''
      priority.value = 'medium'
      status.value = 'open'
      category.value = 'General'
    }
  },
  { immediate: true },
)

async function onSubmit(): Promise<void> {
  const trimmedTitle = title.value.trim()
  if (!trimmedTitle) return

  const trimmedNote = note.value.trim()
  const payload = {
    title: trimmedTitle,
    note: trimmedNote,
    description: trimmedNote,
    assigneeId: assigneeId.value,
    priority: priority.value,
    status: status.value,
    category: category.value.trim() || 'General',
  }

  if (store.issueFormMode === 'edit' && store.editingIssueId) {
    await store.updateIssue(store.editingIssueId, payload)
    store.closeIssueForm()
    return
  }

  await store.addIssue(payload)
}

async function onDelete(): Promise<void> {
  if (!store.editingIssueId) return

  await store.deleteIssue(store.editingIssueId)
}
</script>

<style scoped>
.issue-field :deep(.v-field) {
  border-radius: 8px;
}

.issue-field :deep(.v-field__input) {
  font-size: 0.875rem;
}
</style>
