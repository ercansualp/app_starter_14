<template>
  <div>
    <h2 class="text-3xl font-bold text-text-primary mb-6">{{ $t('project_management') }}</h2>

    <div class="bg-card rounded-lg shadow-sm border border-border-color overflow-hidden p-6 relative">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-semibold text-text-primary">{{ $t('active_projects') }}</h3>
      </div>

      <div v-if="!isLoading && projects.length === 0" class="text-center text-text-secondary py-8">
        {{ $t('no_projects_found') }}
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Yeni Proje Oluşturma Kartı -->
        <NuxtLink
          to="/projects/new"
          class="bg-background border-2 border-dashed border-border-color rounded-lg p-5 flex flex-col justify-center items-center text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors duration-200 min-h-[180px] hover:scale-[1.005] transition-all"
        >
          <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </div>
          <h4 class="text-lg font-semibold text-text-primary">{{ $t('create_new_project') }}</h4>
          <p class="text-sm text-text-secondary mt-1">{{ $t('click_to_add_new_project') }}</p>
        </NuxtLink>

        <!-- Mevcut Proje Kartları -->
        <div
          v-for="project in projects"
          :key="project.id"
          class="bg-card border border-border-color rounded-lg p-5 flex flex-col justify-between hover:border-primary hover:scale-[1.005] transition-all duration-200 hover:shadow-lg relative"
        >
          <LoadingOverlay :is-loading="isUpdatingProjectId === project.id" :message="$t('deleting_project')" />
          <div>
            <div class="flex items-center mb-4">
              <img v-if="project.logo" :src="project.logo" alt="Project Logo" class="w-12 h-12 rounded-full object-cover mr-4 border border-border-color">
              <div v-else class="w-12 h-12 rounded-full bg-input-bg flex items-center justify-center text-text-secondary text-xl font-bold mr-4">
                {{ project.name.charAt(0).toUpperCase() }}
              </div>
              <h4 class="text-lg font-semibold text-text-primary">{{ project.name }}</h4>
            </div>
            <div class="text-sm text-text-secondary space-y-2">
              <p class="flex justify-between">
                <span class="font-medium">{{ $t('default_project') }}:</span>
                <span class="font-semibold" :class="project.isDefaultProject ? 'text-green-500' : 'text-red-500'">
                  {{ project.isDefaultProject ? $t('yes') : $t('no') }}
                </span>
              </p>
              <p class="flex justify-between">
                <span class="font-medium">{{ $t('is_active') }}:</span>
                <span class="font-semibold" :class="project.isActive ? 'text-green-500' : 'text-red-500'">
                  {{ project.isActive ? $t('yes') : $t('no') }}
                </span>
              </p>
              <p class="flex justify-between">
                <span class="font-medium">{{ $t('api_keys_count') }}:</span>
                <span class="font-semibold text-text-primary">{{ project.apiKeys.length }}</span>
              </p>
              <p class="flex justify-between">
                <span class="font-medium">{{ $t('jwt_settings') }}:</span>
                <span class="font-semibold" :class="project.jwtSettings && project.jwtSettings.issuer ? 'text-green-500' : 'text-red-500'">
                  {{ project.jwtSettings && project.jwtSettings.issuer ? $t('jwt_settings_configured') : $t('jwt_settings_not_configured') }}
                </span>
              </p>
              <p class="flex justify-between">
                <span class="font-medium">{{ $t('remaining_credits') }}:</span>
                <span class="font-semibold text-text-primary">{{ project.credits }}</span>
              </p>
            </div>
          </div>
          <div class="mt-5 flex justify-end gap-2">
            <button
              @click="confirmDeleteProject(project)"
              :disabled="isUpdatingProjectId === project.id"
              class="px-3 py-2 rounded-md text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ $t('delete') }}
            </button>
            <NuxtLink :to="`/projects/${project.id}`" class="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition-colors">
              {{ $t('edit') }}
            </NuxtLink>
          </div>
        </div>
      </div>
      <LoadingOverlay :is-loading="isLoading" :message="loadingMessage" />
    </div>

    <!-- Confirmation Modal for Delete -->
    <ConfirmationModal
      :show="showConfirmationModal"
      :title="confirmationConfig.title"
      :message="confirmationConfig.message"
      :confirm-text="confirmationConfig.confirmText"
      :confirm-button-class="confirmationConfig.confirmButtonClass"
      :is-confirming="isProcessing"
      @close="closeConfirmationModal"
      @confirm="handleConfirmation"
    />

    <!-- Notification Toast -->
    <NotificationToast
      :show="notification.show"
      :type="notification.type"
      :message="notification.message"
      @close="hideNotification"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProjects } from '~/composables/useProjects'
import LoadingOverlay from '~/components/LoadingOverlay.vue'
import ConfirmationModal from '~/components/ConfirmationModal.vue'
import NotificationToast from '~/components/NotificationToast.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { projects, isProcessing, notification, showNotification, hideNotification, deleteProject } = useProjects()

const isLoading = ref(true)
const loadingMessage = ref(t('loading_dashboard_data')) // Reusing for now, can be specific

// State for individual project card loading (e.g., when deleting a specific project)
const isUpdatingProjectId = ref(null)

// Confirmation modal state
const showConfirmationModal = ref(false)
const confirmationConfig = ref({
  title: '',
  message: '',
  confirmText: '',
  confirmButtonClass: '',
  onConfirm: () => {},
  projectIdToDelete: null // To store the ID of the project to be deleted
})

onMounted(() => {
  // Simulate data loading for projects
  setTimeout(() => {
    isLoading.value = false
  }, 1500) // Simulate 1.5 seconds loading
})

const confirmDeleteProject = (project) => {
  confirmationConfig.value = {
    title: t('delete_project_confirmation_title'),
    message: t('delete_project_confirmation_message', { projectName: project.name }),
    confirmText: t('delete'),
    confirmButtonClass: 'bg-red-600 hover:bg-red-700',
    onConfirm: async () => {
      isUpdatingProjectId.value = project.id; // Set loading for this specific card
      try {
        await deleteProject(project.id);
      } catch (error) {
        // Error handled by useProjects composable's notification
      } finally {
        isUpdatingProjectId.value = null; // Clear loading
      }
    },
    projectIdToDelete: project.id
  }
  showConfirmationModal.value = true
}

const closeConfirmationModal = () => {
  showConfirmationModal.value = false
  confirmationConfig.value.projectIdToDelete = null
}

const handleConfirmation = () => {
  if (confirmationConfig.value.onConfirm) {
    confirmationConfig.value.onConfirm()
  }
  closeConfirmationModal()
}
</script>
