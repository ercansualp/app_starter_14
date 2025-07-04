<template>
  <Transition name="fade">
    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm z-10 rounded-xl">
      <div class="text-center text-text-primary">
        <svg class="animate-spin h-8 w-8 text-primary mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-sm font-medium">{{ message }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  isLoading: {
    type: Boolean,
    required: true
  },
  message: {
    type: String,
    default: 'Yükleniyor...'
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
