<template>
  <button
    type="button"
    class="group pointer-events-auto absolute z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-white shadow-lg transition duration-200"
    :class="[markerClass, { 'pointer-events-none': isPlacementMode }]"
    :style="{ left: `${issue.x}%`, top: `${issue.y}%` }"
    data-panzoom-ignore
    @click.stop="$emit('select', issue.id)"
    @mouseenter="$emit('hover', issue.id)"
    @mouseleave="$emit('leave')"
    @mousedown.stop
    @touchstart.stop
  >
    <span
      v-if="interaction.shouldPulse"
      class="absolute inset-0 rounded-full border-2 border-white/70 animate-ping"
    ></span>
    <v-icon size="18">{{ markerIcon }}</v-icon>

    <span
      class="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden w-44 -translate-x-1/2 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-left text-xs shadow-xl group-hover:block"
    >
      <span class="block font-bold text-white">{{ issue.title }}</span>
      <span class="mt-1 block text-slate-400">{{ statusLabel }}</span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConstructionIssue } from '@/types'

const props = defineProps<{
  issue: ConstructionIssue
  interaction: {
    isDimmed: boolean
    isHovered: boolean
    isSelected: boolean
    shouldPulse: boolean
  }
  isPlacementMode?: boolean
}>()

defineEmits<{
  select: [id: string]
  hover: [id: string]
  leave: []
}>()

const markerIcon = computed(() => {
  if (props.issue.status === 'resolved') return 'mdi-check'
  if (props.issue.status === 'in_progress') return 'mdi-clock-outline'
  if (props.issue.priority === 'high') return 'mdi-alert-outline'

  return 'mdi-wrench-outline'
})

const statusLabel = computed(() => {
  if (props.issue.status === 'in_progress') return 'In Progress'
  if (props.issue.status === 'resolved') return 'Resolved'

  return 'Open'
})

const markerClass = computed(() => {
  const colorClass =
    props.issue.status === 'resolved'
      ? 'border-green-100 bg-green-500'
      : props.issue.priority === 'high'
        ? 'border-red-100 bg-red-500'
        : props.issue.priority === 'medium'
          ? 'border-blue-100 bg-blue-500'
          : 'border-amber-100 bg-amber-400'

  const stateClass = props.interaction.isSelected
    ? 'scale-110 ring-4 ring-primary/30'
    : props.interaction.isHovered
      ? 'scale-105'
      : ''

  const visibilityClass = props.interaction.isDimmed ? 'opacity-25' : 'opacity-100'

  return [colorClass, stateClass, visibilityClass]
})
</script>
