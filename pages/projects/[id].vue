<template>
  <div>
    <div class="mb-6">
      <NuxtLink to="/projects" class="text-primary hover:underline inline-flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        {{ $t('back_to_projects') }}
      </NuxtLink>
      <h2 v-if="formData" class="text-3xl font-bold text-text-primary mt-2">{{ $t('edit_project') }}: {{ formData.name }}</h2>
    </div>
    
    <div v-if="!formData" class="text-center text-text-secondary py-8 bg-card rounded-lg">
      {{ $t('project_loading_or_not_found') }}
    </div>

    <form v-else @submit.prevent="handleFormSubmit" class="bg-card rounded-lg shadow-sm border border-border-color">
      <div class="p-6 space-y-6">
        <div>
          <label for="name" class="block text-sm font-medium text-text-secondary mb-1">{{ $t('project_name') }} <span class="text-red-500">*</span></label>
          <input v-model="formData.name" type="text" id="name" :placeholder="$t('project_name')" required class="w-full bg-input-bg border border-border-color rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary">
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-text-secondary mb-2">{{ $t('logo_source') }}</label>
          <div class="flex space-x-4">
            <label class="inline-flex items-center">
              <input type="radio" v-model="logoSourceType" value="url" class="form-radio text-primary">
              <span class="ml-2 text-text-primary">{{ $t('url') }}</span>
            </label>
            <label class="inline-flex items-center">
              <input type="radio" v-model="logoSourceType" value="upload" class="form-radio text-primary">
              <span class="ml-2 text-text-primary">{{ $t('upload_file') }}</span>
            </label>
          </div>
        </div>

        <div v-if="logoSourceType === 'url'">
          <label for="logoUrl" class="block text-sm font-medium text-text-secondary mb-1">{{ $t('logo_url') }}</label>
          <input v-model="formData.logo" type="url" id="logoUrl" :placeholder="$t('logo_url_placeholder')" class="w-full bg-input-bg border border-border-color rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary">
          <p class="mt-1 text-xs text-text-secondary">{{ $t('logo_url_hint') }}</p>
        </div>

        <div v-else-if="logoSourceType === 'upload'">
          <label for="logoUpload" class="block text-sm font-medium text-text-secondary mb-1">{{ $t('upload_logo') }}</label>
          <input type="file" id="logoUpload" @change="handleFileUpload" accept="image/*" class="w-full bg-input-bg border border-border-color rounded-md px-3 py-2 text-text-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-500">
          <p class="mt-1 text-xs text-text-secondary">{{ $t('upload_logo_hint') }}</p>
          <div v-if="formData.logo" class="mt-4 flex items-center space-x-3">
            <img :src="formData.logo" alt="Logo Preview" class="w-20 h-20 object-cover rounded-full border border-border-color">
            <button type="button" @click="clearLogo" class="text-red-400 hover:text-red-500 text-sm">{{ $t('remove_logo') }}</button>
          </div>
        </div>

        <div class="flex items-center">
          <input v-model="formData.isDefaultProject" type="checkbox" id="isDefaultProject" class="h-4 w-4 text-primary rounded border-border-color focus:ring-primary">
          <label for="isDefaultProject" class="ml-2 block text-sm text-text-secondary">{{ $t('default_project') }}</label>
        </div>
        <div class="flex items-center">
          <input v-model="formData.isActive" type="checkbox" id="isActive" class="h-4 w-4 text-primary rounded border-border-color focus:ring-primary">
          <label for="isActive" class="ml-2 block text-sm text-text-secondary">{{ $t('is_active') }}</label>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ApiKeyEditor v-model="formData.apiKeys" @request-delete="confirmDeleteApiKey" />
          <details class="bg-background rounded-md border border-border-color">
            <summary class="px-4 py-2 cursor-pointer text-sm font-medium text-text-secondary hover:bg-primary/5 rounded-t-md">
              {{ $t('jwt_settings') }}
            </summary>
            <div class="p-4 border-t border-border-color space-y-4">
              <div>
                <label for="jwtIssuer" class="block text-sm font-medium text-text-secondary mb-1">{{ $t('issuer') }}</label>
                <input v-model="formData.jwtSettings.issuer" type="text" id="jwtIssuer" :placeholder="$t('issuer')" class="w-full bg-input-bg border border-border-color rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary">
              </div>
              <div>
                <label for="jwtSecret" class="block text-sm font-medium text-text-secondary mb-1">{{ $t('secret') }}</label>
                <input v-model="formData.jwtSettings.secret" type="text" id="jwtSecret" :placeholder="$t('secret')" class="w-full bg-input-bg border border-border-color rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary">
              </div>
              <div>
                <label for="jwtLifetimeMinutes" class="block text-sm font-medium text-text-secondary mb-1">{{ $t('lifetime_minutes') }}</label>
                <input v-model.number="formData.jwtSettings.lifetimeMinutes" type="number" id="jwtLifetimeMinutes" :placeholder="$t('lifetime_minutes')" class="w-full bg-input-bg border border-border-color rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary">
              </div>
              <div>
                <label for="jwtRefreshTokenExpiryDays" class="block text-sm font-medium text-text-secondary mb-1">{{ $t('refresh_token_expiry_days') }}</label>
                <input v-model.number="formData.jwtSettings.refreshTokenExpiryDays" type="number" id="jwtRefreshTokenExpiryDays" :placeholder="$t('refresh_token_expiry_days')" class="w-full bg-input-bg border border-border-color rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary">
              </div>
              <div>
                <label for="jwtAudience" class="block text-sm font-medium text-text-secondary mb-1">{{ $t('audience') }}</label>
                <input v-model="formData.jwtSettings.audience" type="text" id="jwtAudience" :placeholder="$t('audience')" class="w-full bg-input-bg border border-border-color rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary">
              </div>
            </div>
          </details>
        </div>
        <UserManagement v-model:users="formData.users" v-model:invitations="formData.invitations" />
      </div>
      <div class="p-6 bg-card border-t border-border-color flex justify-end gap-4 sticky bottom-0">
        <NuxtLink to="/projects" class="px-4 py-2 rounded-md text-text-primary bg-background border border-border-color hover:bg-border-color transition-colors flex items-center justify-center">
          {{ $t('cancel') }}
        </NuxtLink>
        <button type="submit" class="px-4 py-2 rounded-md text-white bg-primary hover:bg-blue-500 transition-colors font-semibold">
          {{ $t('save_changes') }}
        </button>
      </div>
    </form>

    <ClientOnly>
      <ConfirmationModal
        :show="showSaveConfirmation"
        :title="$t('save_changes_project_title')"
        :message="$t('save_changes_project_message')"
        :confirm-text="$t('save')"
        confirm-button-class="bg-primary hover:bg-blue-500"
        @close="showSaveConfirmation = false"
        @confirm="submitForm"
      />
      <ConfirmationModal
        :show="showApiKeyDeleteConfirmation"
        :title="$t('delete_api_key_title')"
        :message="$t('delete_api_key_message', { apiKeyName: apiKeyToDelete?.apiKeyName })"
        :confirm-text="$t('delete')"
        confirm-button-class="bg-red-600 hover:bg-red-700"
        @close="showApiKeyDeleteConfirmation = false"
        @confirm="deleteApiKey"
      />
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjects } from '~/composables/useProjects'
import ApiKeyEditor from '~/components/ApiKeyEditor.vue'
import UserManagement from '~/components/UserManagement.vue'
import ConfirmationModal from '~/components/ConfirmationModal.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()
const { getProjectById, updateProject } = useProjects()

const projectId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
const formData = ref(null)
const logoSourceType = ref('url')

watchEffect(() => {
  const project = getProjectById(projectId);
  if (project) {
    // State'in doğrudan değiştirilmesini önlemek için derin bir kopya oluşturuluyor.
    formData.value = JSON.parse(JSON.stringify(project));
    if (project.logo && project.logo.startsWith('data:')) {
      logoSourceType.value = 'upload';
    } else {
      logoSourceType.value = 'url';
    }
  } else {
    // Proje bulunamazsa ana sayfaya yönlendir.
    // router.replace('/projects');
  }
});

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      formData.value.logo = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const clearLogo = () => {
  formData.value.logo = '';
  const fileInput = document.getElementById('logoUpload');
  if (fileInput) {
    fileInput.value = '';
  }
};

// --- Form Submission Logic ---
const showSaveConfirmation = ref(false)

const handleFormSubmit = () => {
  if (!formData.value.name) {
    alert(t('project_name_required'));
    return;
  }
  showSaveConfirmation.value = true;
}

const submitForm = () => {
  const projectToUpdate = JSON.parse(JSON.stringify(formData.value));

  projectToUpdate.apiKeys = projectToUpdate.apiKeys.map(key => {
    // isNew, geçici bir bayraktır ve kaydedilmemelidir.
    const { isNew, ...rest } = key;
    return rest;
  });

  updateProject(projectToUpdate);
  showSaveConfirmation.value = false;
  router.push('/projects');
}

// --- API Key Deletion Logic ---
const showApiKeyDeleteConfirmation = ref(false)
const apiKeyToDelete = ref(null)

const confirmDeleteApiKey = ({ apiKeyId, apiKeyName }) => {
  apiKeyToDelete.value = { apiKeyId, apiKeyName };
  showApiKeyDeleteConfirmation.value = true;
}

const deleteApiKey = () => {
  if (apiKeyToDelete.value) {
    const { apiKeyId } = apiKeyToDelete.value;
    formData.value.apiKeys = formData.value.apiKeys.filter(key => key.id !== apiKeyId);
    showApiKeyDeleteConfirmation.value = false;
    apiKeyToDelete.value = null;
  }
}
</script>
