<template>
  <Transition name="slide-fade">
    <div 
      v-if="show" 
      :class="['fixed', 'bottom-6', 'right-6', 'p-4', 'rounded-lg', 'shadow-lg', 'flex', 'items-center', 'gap-3', 'z-[100]', 'max-w-sm', 'w-full', typeClass]"
      role="alert"
    >
      <div class="flex-shrink-0">
        <svg v-if="type === 'success'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-500">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-8.5"></path>
          <polyline points="22 4 12 14 9 11"></polyline>
        </svg>
        <svg v-else-if="type === 'error'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <svg v-else-if="type === 'info'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>
      <div class="flex-grow text-text-primary font-medium text-sm">
        {{ message }}
      </div>
      <button @click="$emit('close')" class="flex-shrink-0 text-text-secondary hover:text-text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info', // 'success', 'error', 'info'
    validator: (value) => ['success', 'error', 'info'].includes(value)
  },
  message: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close'])

const typeClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-100 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200';
    case 'error':
      return 'bg-red-100 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200';
    case 'info':
      return 'bg-blue-100 border border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200';
    default:
      return 'bg-gray-100 border border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-200';
  }
})
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
