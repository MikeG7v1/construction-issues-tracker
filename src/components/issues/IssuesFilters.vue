<template>
  <v-expand-transition>
    <div v-show="isVisible" class="space-y-4">
      <div>
        <label class="mb-2 block text-xs font-bold text-slate-400">Sort by</label>
        <v-select
          v-model="store.sortBy"
          :items="sortItems"
          :menu-props="selectMenuProps"
          variant="outlined"
          density="compact"
          color="primary"
          base-color="#334155"
          bg-color="#111827"
          flat
          hide-details
          theme="dark"
          class="issue-select"
        />
      </div>

      <div>
        <label class="mb-2 block text-xs font-bold text-slate-400">Filter by Priority</label>
        <v-select
          v-model="store.filterPriority"
          :items="priorityItems"
          :menu-props="selectMenuProps"
          variant="outlined"
          density="compact"
          color="primary"
          base-color="#334155"
          bg-color="#111827"
          flat
          hide-details
          theme="dark"
          class="issue-select"
        />
      </div>
    </div>
  </v-expand-transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useIssueStore } from '@/stores/useIssuesStore'
import {
  ISSUE_PRIORITY_LABELS,
  ISSUE_PRIORITY_VALUES,
  ISSUE_SORT_LABELS,
  ISSUE_SORT_VALUES,
} from '@/components/issues/issuesTypes'

const store = useIssueStore()

defineProps<{
  isVisible: boolean
}>()

const selectMenuProps = {
  contentClass: 'issue-select-menu',
}

type SelectItem<T extends string> = {
  title: string
  value: T
}

function createSelectItems<T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): SelectItem<T>[] {
  return values.map((value) => ({
    value,
    title: labels[value],
  }))
}

const sortItems = computed(() => createSelectItems(ISSUE_SORT_VALUES, ISSUE_SORT_LABELS))
const priorityItems = computed(() =>
  createSelectItems(ISSUE_PRIORITY_VALUES, ISSUE_PRIORITY_LABELS),
)
</script>

<style scoped>
.issue-select :deep(.v-field) {
  border-radius: 8px;
  box-shadow: none;
}

.issue-select :deep(.v-field__input) {
  min-height: 32px;
  padding-bottom: 6px;
  padding-top: 6px;
}

.issue-select :deep(.v-select__selection-text) {
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 600;
}

.issue-select :deep(.v-field__outline) {
  color: #334155;
  opacity: 1;
}

.issue-select :deep(.v-field--focused .v-field__outline) {
  color: #0d9488;
}

.issue-select :deep(.v-icon) {
  color: #94a3b8;
}

:global(.issue-select-menu.v-overlay__content),
:global(.issue-select-menu .v-overlay__content) {
  border-radius: 8px;
}

:global(.issue-select-menu .v-list),
:global(.issue-select-menu.v-overlay__content .v-list) {
  background: #111827;
  border: 1px solid #334155;
  border-radius: 8px;
  box-shadow: 0 18px 40px rgb(0 0 0 / 0.32);
  color: #ffffff;
  padding: 6px;
}

:global(.issue-select-menu .v-list-item) {
  border-radius: 6px;
  color: #cbd5e1;
  min-height: 34px;
}

:global(.issue-select-menu .v-list-item:hover) {
  background: rgb(51 65 85 / 0.75);
  color: #ffffff;
}

:global(.issue-select-menu .v-list-item--active) {
  background: rgb(13 148 136 / 0.2);
  color: #ffffff;
}

:global(.issue-select-menu .v-list-item-title) {
  font-size: 0.875rem;
  font-weight: 600;
}
</style>
