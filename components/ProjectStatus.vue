<template>
  <div class="bg-card p-6 rounded-xl h-full border border-border-color transition-all duration-300 ease-in-out hover:shadow-lg hover:border-primary hover:scale-[1.005]">
    <h3 class="text-xl font-semibold text-text-primary mb-4">Proje Durumları</h3>
    <div class="space-y-4">
      <div v-if="projects.length === 0" class="text-center py-8 text-text-secondary">
        <p>Henüz proje oluşturulmamış.</p>
      </div>
      <div v-for="project in projects" :key="project.id" class="flex items-center justify-between hover:bg-background/50 p-2 -m-2 rounded-lg transition-colors">
        <div class="flex items-center gap-3">
          <img :src="project.logo" class="w-10 h-10 rounded-lg object-cover" />
          <div>
            <p class="font-medium text-text-primary">{{ project.name }}</p>
            <p class="text-sm text-text-secondary">{{ project.isDefaultProject ? 'Varsayılan' : 'Ek Proje' }}</p>
          </div>
        </div>
        <span 
          :class="[
            'px-2.5 py-1 text-xs font-semibold rounded-full',
            project.isActive 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          ]"
        >
          {{ project.isActive ? 'Aktif' : 'Pasif' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useProjects } from '~/composables/useProjects'

const { projects } = useProjects()
</script>
