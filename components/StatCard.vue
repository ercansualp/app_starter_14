<template>
  <div class="bg-card p-6 rounded-xl flex items-center gap-6 border border-border-color transition-all duration-300 ease-in-out hover:shadow-lg hover:border-primary hover:scale-[1.005]">
    <div class="p-4 bg-primary/20 rounded-lg">
      <component :is="icon" class="w-8 h-8 text-primary" />
    </div>
    <div>
      <p class="text-text-secondary text-sm font-medium">{{ title }}</p>
      <p class="text-3xl font-bold text-text-primary text-xl">{{ value }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: Object,
  title: String,
  value: String,
})
</script>
