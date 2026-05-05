<template>
  <v-app-bar color="surface" flat height="112">
    <div
      class="flex h-full w-full flex-col justify-center gap-5 px-12 py-4 border-b-2 border-gray-400"
    >
      <div class="flex w-full items-center justify-between gap-6">
        <h1 class="text-xl font-bold text-white">{{ title }}</h1>
        <div class="flex items-center gap-4">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            label="Search issues..."
            variant="outlined"
            density="compact"
            hide-details
            flat
            class="w-80"
          ></v-text-field>
          <v-btn
            color="primary"
            variant="elevated"
            size="large"
            rounded="lg"
            :prepend-icon="issueStore.isPickingIssueLocation ? 'mdi-crosshairs-gps' : 'mdi-plus'"
            @click="onReportNewIssue"
          >
            <span class="font-bold">
              {{ issueStore.isPickingIssueLocation ? 'Pick Location' : 'Report New Issue' }}
            </span>
          </v-btn>
        </div>
      </div>
      <div class="flex gap-6">
        <div class="flex items-center gap-2">
          <span class="h-3 w-3 rounded-full bg-yellow-400"></span>
          <span class="text-sm text-white">{{ stats.open }} Open</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="h-3 w-3 rounded-full bg-blue-500"></span>
          <span class="text-sm text-white">{{ stats.inProgress }} In Progress</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="h-3 w-3 rounded-full bg-green-500"></span>
          <span class="text-sm text-white">{{ stats.resolved }} Resolved</span>
        </div>
      </div>
    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useIssueStore } from '@/stores/useIssuesStore'
import { computed } from 'vue'

interface Props {
  title: string
  stats?: {
    open: number
    inProgress: number
    resolved: number
  }
}

withDefaults(defineProps<Props>(), {
  title: 'Construction Issue Tracker',
  stats: () => ({
    open: 1,
    inProgress: 2,
    resolved: 3,
  }),
})

const issueStore = useIssueStore()

const searchQuery = computed({
  get: () => issueStore.searchQuery,
  set: (value: string) => {
    issueStore.searchQuery = value
  },
})

function onReportNewIssue(): void {
  issueStore.startIssueLocationSelection()
}
</script>
