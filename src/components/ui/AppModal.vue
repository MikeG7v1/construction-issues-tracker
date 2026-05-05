<template>
  <Teleport to="body">
    <Transition name="app-modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-1000 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        role="presentation"
        @click.self="emitClose"
      >
        <section
          class="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-950 shadow-2xl"
          :class="widthClass"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
        >
          <header
            class="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-4"
          >
            <div class="min-w-0">
              <p
                v-if="eyebrow"
                class="text-xs font-bold uppercase tracking-wide text-primary"
              >
                {{ eyebrow }}
              </p>
              <h2 :id="titleId" class="text-base font-bold text-white">{{ title }}</h2>
            </div>
            <v-btn
              icon="mdi-close"
              variant="text"
              density="comfortable"
              color="#94a3b8"
              aria-label="Close modal"
              @click="emitClose"
            />
          </header>

          <div class="min-h-0 overflow-y-auto p-5">
            <slot />
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    eyebrow?: string;
    size?: "sm" | "md" | "lg";
  }>(),
  {
    eyebrow: "",
    size: "md",
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  close: [];
}>();

const titleId = `modal-title-${Math.random().toString(36).slice(2, 10)}`;

const widthClass = computed(() => {
  if (props.size === "sm") return "max-w-md";
  if (props.size === "lg") return "max-w-3xl";

  return "max-w-xl";
});

function emitClose(): void {
  emit("update:modelValue", false);
  emit("close");
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key !== "Escape" || !props.modelValue) return;

  emitClose();
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
.app-modal-enter-active,
.app-modal-leave-active {
  transition: opacity 160ms ease;
}

.app-modal-enter-from,
.app-modal-leave-to {
  opacity: 0;
}
</style>
