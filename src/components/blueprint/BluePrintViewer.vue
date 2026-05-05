<template>
  <v-main>
    <div
      ref="viewportRef"
      class="relative h-[calc(100vh-var(--v-layout-top)-var(--v-layout-bottom))]q min-h-0 w-full overflow-hidden bg-slate-100"
    >
      <div
        ref="sceneRef"
        :style="sceneStyle"
        class="absolute left-0 top-0 overflow-hidden bg-white shadow-2xl"
        :class="sceneCursorClass"
        @click="handleMapClick"
      >
        <img
          :src="blueprintImageUrl"
          alt="Blueprint"
          class="block h-full w-full select-none pointer-events-none"
          draggable="false"
          @load="onImageLoad"
        />
        <div class="pointer-events-none absolute inset-0">
          <IssueMarker
            v-for="issue in store.issues"
            :key="issue.id"
            :issue="issue"
            :interaction="store.markerInteraction(issue.id)"
            :is-placement-mode="store.isPickingIssueLocation"
            @select="store.focusIssueFromMarker"
            @hover="store.setHoveredIssue"
            @leave="store.setHoveredIssue(null)"
          />
        </div>
      </div>

      <div
        v-if="store.isPickingIssueLocation"
        class="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-primary/40 bg-slate-950 px-4 py-3 text-sm text-white shadow-xl"
        data-panzoom-ignore
        @click.stop
      >
        <v-icon color="primary" size="20">mdi-crosshairs-gps</v-icon>
        <span class="font-medium">Click a spot on the plan to place the new issue.</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          density="compact"
          color="#94a3b8"
          aria-label="Cancel location selection"
          @click="store.cancelIssueLocationSelection()"
        />
      </div>

      <div
        class="absolute bottom-4 right-4 flex gap-2"
        data-panzoom-ignore
        @click.stop
        @mousedown.stop
        @touchstart.stop
        @wheel.stop
      >
        <v-btn icon="mdi-plus" size="small" @click="zoomIn" />
        <v-btn icon="mdi-minus" size="small" @click="zoomOut" />
        <v-btn icon="mdi-restore" size="small" @click="resetView" />
      </div>
    </div>
  </v-main>
</template>

<script setup lang="ts">
import { useIssueStore } from '@/stores/useIssuesStore'
import panzoom, { type PanZoom } from 'panzoom'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import IssueMarker from './IssueMarker.vue'

const store = useIssueStore()
const viewportRef = ref<HTMLElement | null>(null)
const sceneRef = ref<HTMLElement | null>(null)
const naturalSize = ref({ width: 0, height: 0 })
let panzoomInstance: PanZoom | null = null
let resizeObserver: ResizeObserver | null = null
let removeResizeFallback: (() => void) | null = null
let lastPanEndedAt = 0

const defaultBlueprintUrl =
  'https://openplanned.org/openplanned-content/uploads/2016/01/Embassy-floor-plan.png'

const blueprintImageUrl = computed(() => store.currentPlan?.imageUrl ?? defaultBlueprintUrl)

const sceneStyle = computed(() => ({
  height: naturalSize.value.height ? `${naturalSize.value.height}px` : 'auto',
  width: naturalSize.value.width ? `${naturalSize.value.width}px` : 'auto',
}))

const sceneCursorClass = computed(() =>
  store.isPickingIssueLocation ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing',
)

function createPanzoom(): void {
  if (!sceneRef.value) return

  panzoomInstance?.dispose()
  panzoomInstance = panzoom(sceneRef.value, {
    bounds: true,
    boundsPadding: 0.6,
    maxZoom: 6,
    minZoom: 0.01,
    zoomDoubleClickSpeed: 1,
    beforeMouseDown: onBeforeMouseDown,
  })
  panzoomInstance.on('panend', () => {
    lastPanEndedAt = performance.now()
  })
}

function fitSceneToViewport(): void {
  if (!viewportRef.value || !panzoomInstance) return
  if (!naturalSize.value.width || !naturalSize.value.height) return

  const viewportWidth = viewportRef.value.clientWidth
  const viewportHeight = viewportRef.value.clientHeight
  if (!viewportWidth || !viewportHeight) return

  const fitScale = Math.min(
    viewportWidth / naturalSize.value.width,
    viewportHeight / naturalSize.value.height,
  )
  const centeredX = (viewportWidth - naturalSize.value.width * fitScale) / 2
  const centeredY = (viewportHeight - naturalSize.value.height * fitScale) / 2

  panzoomInstance.setMinZoom(fitScale)
  panzoomInstance.setMaxZoom(Math.max(fitScale * 8, 4))
  panzoomInstance.zoomAbs(0, 0, fitScale)
  panzoomInstance.moveTo(centeredX, centeredY)
}

function scheduleFitSceneToViewport(): void {
  window.requestAnimationFrame(fitSceneToViewport)
}

onMounted(() => {
  if (typeof ResizeObserver === 'undefined') {
    window.addEventListener('resize', scheduleFitSceneToViewport)
    removeResizeFallback = () => window.removeEventListener('resize', scheduleFitSceneToViewport)
    return
  }

  resizeObserver = new ResizeObserver(scheduleFitSceneToViewport)
  if (viewportRef.value) {
    resizeObserver.observe(viewportRef.value)
  }
})

onBeforeUnmount(() => {
  panzoomInstance?.dispose()
  resizeObserver?.disconnect()
  removeResizeFallback?.()
})

const onImageLoad = async (event: Event) => {
  const image = event.target as HTMLImageElement
  naturalSize.value = {
    width: image.naturalWidth,
    height: image.naturalHeight,
  }

  await nextTick()
  createPanzoom()
  fitSceneToViewport()
}

const handleMapClick = (event: MouseEvent) => {
  if (!sceneRef.value || !store.currentPlan) return
  if (!store.isPickingIssueLocation) return
  if (performance.now() - lastPanEndedAt < 200) return

  const rect = sceneRef.value.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100

  store.openIssueFormForNew({ x, y })
}

const zoomIn = () => {
  const rect = viewportRef.value?.getBoundingClientRect()
  if (!rect) return

  panzoomInstance?.smoothZoom(rect.width / 2, rect.height / 2, 1.2)
}

const zoomOut = () => {
  const rect = viewportRef.value?.getBoundingClientRect()
  if (!rect) return

  panzoomInstance?.smoothZoom(rect.width / 2, rect.height / 2, 0.8)
}

const onBeforeMouseDown = (event: MouseEvent) => {
  return (
    store.isPickingIssueLocation ||
    (event.target as HTMLElement | null)?.closest('[data-panzoom-ignore]') !== null
  )
}

const resetView = () => {
  fitSceneToViewport()
}
</script>
