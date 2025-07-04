<template>
  <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" @click.self="$emit('close')">
    <div class="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-border-color relative">
      <LoadingOverlay :isLoading="isLoading" :message="$t('updating_permissions')" />
      <div class="p-6 border-b border-border-color flex justify-between items-center">
        <h3 class="text-2xl font-semibold text-text-primary flex items-center gap-3">
          <img 
            :src="user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=1d4ed8&color=fff&size=40`" 
            :alt="`${user.firstName} ${user.lastName}`" 
            class="w-10 h-10 rounded-full object-cover border border-border-color"
          >
          {{ user.name }}
        </h3>
        <button @click="$emit('close')" class="text-text-secondary hover:text-text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="flex-grow overflow-y-auto p-6">
        <p class="text-text-secondary mb-4 text-base">{{ $t('manage_single_role_description') }}</p>
        
        <div class="mb-4">
          <input
            type="text"
            v-model="searchQuery"
            :placeholder="$t('search_roles')"
            class="w-full px-4 py-2 border border-border-color rounded-md bg-input-background text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary text-base"
          />
        </div>

        <div class="space-y-4 max-h-64 overflow-y-auto border border-border-color rounded-md p-4">
          <label v-for="role in filteredRoles" :key="role.id" class="flex flex-col p-3 border border-border-color rounded-md hover:bg-background/50 transition-colors cursor-pointer">
            <div class="flex items-center">
              <input 
                type="radio" 
                :value="role.id" 
                v-model="selectedRoleId" 
                name="userRole"
                class="h-4 w-4 text-primary rounded-full border-border-color focus:ring-primary mt-0.5 flex-shrink-0"
              >
              <div class="ml-3">
                <span class="text-sm font-medium text-text-primary">{{ role.name }}</span>
                <p v-if="role.description" class="text-xs text-text-secondary mt-1">{{ role.description }}</p>
              </div>
            </div>
            <div v-if="role.permissions && role.permissions.length > 0" class="mt-3 ml-7 flex flex-wrap gap-1">
              <span v-for="permId in role.permissions" :key="permId" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                {{ getPermissionNameById(permId) }}
              </span>
            </div>
            <div v-else class="mt-3 ml-7 text-xs text-text-secondary italic">
              {{ $t('no_permissions_assigned') }}
            </div>
          </label>
          <label class="flex items-center p-3 border border-border-color rounded-md hover:bg-background/50 transition-colors cursor-pointer">
            <input 
              type="radio" 
              :value="null" 
              v-model="selectedRoleId" 
              name="userRole"
              class="h-4 w-4 text-primary rounded-full border-border-color focus:ring-primary mt-0.5 flex-shrink-0"
            >
            <div class="ml-3">
              <span class="text-sm font-medium text-text-primary">{{ $t('no_role') }}</span>
              <p class="text-xs text-text-secondary mt-1">{{ $t('remove_all_roles_description') }}</p>
            </div>
          </label>
          <p v-if="filteredRoles.length === 0 && searchQuery" class="text-center text-text-secondary py-4 text-base">
            {{ $t('no_matching_roles_found') }}
          </p>
        </div>
      </div>
      <div class="p-6 bg-card border-t border-border-color flex justify-end gap-4 sticky bottom-0">
        <button type="button" @click="$emit('close')" class="px-4 py-2 rounded-md font-semibold text-text-primary bg-card border border-border-color hover:bg-background transition-colors text-base">
          {{ $t('cancel') }}
        </button>
        <button type="submit" :disabled="isLoading" @click="saveRoles" class="px-4 py-2 rounded-md text-white bg-primary hover:brightness-90 transition-all font-semibold flex items-center gap-2 text-base">
          <svg v-if="isLoading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ $t('save_changes') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, computed } from 'vue'
import LoadingOverlay from '~/components/LoadingOverlay.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  availableRoles: {
    type: Array,
    required: true
  },
  allPermissions: { // New prop to pass all available permissions
    type: Array,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'assign-roles'])

const selectedRoleId = ref(null)
const searchQuery = ref('') // New state for search query

watchEffect(() => {
  if (props.user && props.user.roles && props.user.roles.length > 0) {
    selectedRoleId.value = props.user.roles[0]
  } else {
    selectedRoleId.value = null
  }
})

// Computed property to filter roles based on search query
const filteredRoles = computed(() => {
  if (!searchQuery.value) {
    return props.availableRoles
  }
  const query = searchQuery.value.toLowerCase()
  return props.availableRoles.filter(role => 
    role.name.toLowerCase().includes(query) || 
    (role.description && role.description.toLowerCase().includes(query))
  )
})

// Helper to get permission name by ID
const getPermissionNameById = (permissionId) => {
  const permission = props.allPermissions.find(p => p.id === permissionId)
  return permission ? permission.name : 'Unknown Permission'
}

const saveRoles = () => {
  emit('assign-roles', props.user.id, selectedRoleId.value ? [selectedRoleId.value] : [])
}
</script>
