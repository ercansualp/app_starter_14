<template>
  <aside class="w-64 bg-sidebar text-white flex flex-col p-4 shadow-lg h-full">
    <!-- Project Selector -->
    <div class="mb-8 mt-2">
      <div class="relative">
        <button 
          @click="toggleProjectSelector" 
          class="w-full flex items-center justify-between p-3 rounded-lg transition-colors duration-200 border border-border-color"
          :class="[
            'bg-project-active-bg text-primary border-primary/30',
            'hover:bg-project-hover-bg'
          ]"
        >
          <div class="flex items-center min-w-0 flex-1">
            <img 
              v-if="currentProject?.logo" 
              :src="currentProject.logo" 
              :alt="currentProject.name" 
              class="w-8 h-8 rounded-full object-cover mr-3 border border-border-color"
            >
            <div 
              v-else 
              class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm mr-3"
            >
              {{ currentProject?.name?.charAt(0)?.toUpperCase() || 'P' }}
            </div>
            <div class="min-w-0 flex-1 text-left">
              <p class="text-text-primary font-semibold text-sm truncate">{{ currentProject?.name || $t('select_project') }}</p>
              <p class="text-text-secondary text-xs">{{ currentProject ? $t('active_project') : $t('no_project') }}</p>
            </div>
          </div>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            class="text-text-secondary transition-transform duration-200 flex-shrink-0"
            :class="{'rotate-180': showProjectSelector}"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <!-- Project Dropdown -->
        <Transition name="dropdown">
          <div 
            v-if="showProjectSelector" 
            ref="projectDropdownRef"
            class="absolute top-full left-0 right-0 mt-2 bg-card border border-border-color rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto"
          >
            <!-- Projects List -->
            <div class="p-2">
              <div 
                v-for="project in availableProjects" 
                :key="project.id"
                @click="selectProject(project)"
                class="flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200"
                :class="{
                  'bg-project-active-bg text-primary': currentProject?.id === project.id,
                  'hover:bg-project-active-bg hover:text-primary': currentProject?.id === project.id,
                  'hover:bg-project-hover-bg': currentProject?.id !== project.id
                }"
              >
                <img 
                  v-if="project.logo" 
                  :src="project.logo" 
                  :alt="project.name" 
                  class="w-8 h-8 rounded-full object-cover mr-3 border border-border-color"
                >
                <div 
                  v-else 
                  class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-sm mr-3"
                >
                  {{ project.name.charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-text-primary font-medium text-sm truncate">{{ project.name }}</p>
                    <span 
                      v-if="project.isDefaultProject" 
                      class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 flex-shrink-0"
                    >
                      {{ $t('default') }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 mt-1">
                    <span 
                      :class="project.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'"
                      class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                    >
                      {{ project.isActive ? $t('active') : $t('passive') }}
                    </span>
                    <span class="text-text-secondary text-xs">{{ project.apiKeys?.length || 0 }} API</span>
                  </div>
                </div>
                <svg 
                  v-if="currentProject?.id === project.id"
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2" 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  class="text-primary flex-shrink-0"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>

            <!-- Divider -->
            <div class="border-t border-border-color mx-2"></div>

            <!-- Actions -->
            <div class="p-2">
              <NuxtLink 
                to="/projects/new" 
                @click="closeProjectSelector"
                class="flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-project-hover-bg text-text-primary"
              >
                <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
                <span class="font-medium text-sm">{{ $t('create_new_project') }}</span>
              </NuxtLink>
              
              <NuxtLink 
                to="/projects" 
                @click="closeProjectSelector"
                class="flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-project-hover-bg text-text-primary"
              >
                <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
                    <path d="M12 2v6h.01L12 8.01A3 3 0 1 0 15 5H12V2zm3 14H12v-3h3a3 3 0 1 0-3-3v3h3zm-3 4v-3h3a3 3 0 1 0-3-3v3h3z"></path>
                  </svg>
                </div>
                <span class="font-medium text-sm">{{ $t('manage_all_projects') }}</span>
              </NuxtLink>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1">
      <ul>
        <li class="mb-2">
          <NuxtLink 
            to="/" 
            @click="handleNavClick"
            class="flex items-center p-3 rounded-lg text-text-secondary hover:bg-nav-hover-bg hover:text-text-primary transition-colors duration-200" 
            active-class="bg-nav-active-bg text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            {{ $t('dashboard') }}
          </NuxtLink>
        </li>
        <li class="mb-2">
          <NuxtLink 
            to="/scheduler" 
            @click="handleNavClick"
            class="flex items-center p-3 rounded-lg text-text-secondary hover:bg-nav-hover-bg hover:text-text-primary transition-colors duration-200" 
            active-class="bg-nav-active-bg text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="M6 2v6h.01L6 8.01A3 3 0 1 0 9 5H6V2zm3 14H6v-3h3a3 3 0 1 0-3-3v3h3zm-3 4v-3h3a3 3 0 1 0-3-3v3h3z"></path><path d="M12 2v6h.01L12 8.01A3 3 0 1 0 15 5H12V2zm3 14H12v-3h3a3 3 0 1 0-3-3v3h3zm-3 4v-3h3a3 3 0 1 0-3-3v3h3z"></path><path d="M18 2v6h.01L18 8.01A3 3 0 1 0 21 5H18V2zm3 14h-3v-3h3a3 3 0 1 0-3-3v3h3zm-3 4v-3h3a3 3 0 1 0-3-3v3h3z"></path></svg>
            {{ $t('scheduler') }}
          </NuxtLink>
        </li>
        <li class="mb-2">
          <NuxtLink 
            to="/message-templates" 
            @click="handleNavClick"
            class="flex items-center p-3 rounded-lg text-text-secondary hover:bg-nav-hover-bg hover:text-text-primary transition-colors duration-200" 
            active-class="bg-nav-active-bg text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            {{ $t('message_templates') }}
          </NuxtLink>
        </li>
        <li class="mb-2">
          <NuxtLink 
            to="/projects" 
            @click="handleNavClick"
            class="flex items-center p-3 rounded-lg text-text-secondary hover:bg-nav-hover-bg hover:text-text-primary transition-colors duration-200" 
            active-class="bg-nav-active-bg text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            {{ $t('project_management') }}
          </NuxtLink>
        </li>
        <li class="mb-2">
          <NuxtLink 
            to="/payment-methods" 
            @click="handleNavClick"
            class="flex items-center p-3 rounded-lg text-text-secondary hover:bg-nav-hover-bg hover:text-text-primary transition-colors duration-200" 
            active-class="bg-nav-active-bg text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            {{ $t('payment_methods') }}
          </NuxtLink>
        </li>
        <li class="mb-2">
          <NuxtLink 
            to="/roles-permissions" 
            @click="handleNavClick"
            class="flex items-center p-3 rounded-lg text-text-secondary hover:bg-nav-hover-bg hover:text-text-primary transition-colors duration-200" 
            active-class="bg-nav-active-bg text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            {{ $t('roles_permissions') }}
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- Theme and Language Switcher for small screens -->
    <div class="mt-auto border-t border-border-color lg:hidden flex items-center justify-evenly block sm:hidden">
      <div>
        <ThemeSwitcher openDirection="up" />
      </div>
      <div class="relative">
        <button 
          @click="toggleLanguageDropdown" 
          class="text-text-secondary hover:text-text-primary w-full flex items-center justify-between p-3 rounded-lg hover:bg-nav-hover-bg transition-colors duration-200"
        >
          <div class="flex items-center">
            <span :class="currentLocaleIso" class="mr-3"></span>
            <span class="font-medium text-sm">{{ currentLocaleName }}</span>
          </div>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            class="text-text-secondary transition-transform duration-200 flex-shrink-0"
            :class="{'rotate-180': showLanguageDropdown}"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        
        <Transition name="dropdown">
          <div 
            v-if="showLanguageDropdown" 
            ref="languageDropdownRef"
            class="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border-color rounded-lg shadow-xl z-50 max-h-40 overflow-y-auto"
          >
            <ul class="py-1">
              <li v-for="lang in availableLocales" :key="lang.code">
                <button 
                  @click="selectLanguage(lang.code)" 
                  class="flex items-center gap-2 w-full text-text-secondary text-left px-4 py-2 text-sm hover:bg-background rounded-md"
                  :class="{ '!text-primary font-semibold': locale === lang.code }"
                >
									<span :class="`fi fi-${lang.iso}`"></span>
                  {{ lang.name }}
                </button>
              </li>
            </ul>
          </div>
        </Transition>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useProjects } from '~/composables/useProjects'
import { useSidebar } from '~/composables/useSidebar'
import ThemeSwitcher from '~/components/ThemeSwitcher.vue' // Import ThemeSwitcher
import { useI18n } from 'vue-i18n' // Import useI18n

const { locales, setLocale, locale } = useI18n() // Destructure locale and setLocale
const { projects } = useProjects()
const { toggleSidebar } = useSidebar()

const showProjectSelector = ref(false)
const projectDropdownRef = ref(null) // Changed to ref(null) for proper template ref binding
const currentProject = ref(null)

const showLanguageDropdown = ref(false) // Add for language dropdown in sidebar
const languageDropdownRef = ref(null) // Add for language dropdown in sidebar

const availableProjects = computed(() => {
  return projects.value.filter(project => project.isActive)
})

// Language switcher logic (duplicated from Header for sidebar)
const availableLocales = [
  { code: 'tr', name: 'Türkçe', iso: 'tr' },
  { code: 'en', name: 'English', iso: 'us' }
]

const currentLocaleName = computed(() => {
  const current = availableLocales.find(l => l.code === locale.value)
  return current ? current.name : $t('language')
})

const currentLocaleIso = computed(() => {
  const current = availableLocales.find(l => l.code === locale.value)
  return current ? "fi fi-" + current.iso : 'fi fi-us'
})

const toggleLanguageDropdown = () => {
  showLanguageDropdown.value = !showLanguageDropdown.value
}

const selectLanguage = (code) => {
  setLocale(code)
  showLanguageDropdown.value = false
  // Mobil cihazlarda dil değiştirildiğinde sidebar'ı kapat
  if (process.client && window.innerWidth < 1024) {
    toggleSidebar()
  }
}

const toggleProjectSelector = () => {
  showProjectSelector.value = !showProjectSelector.value
}

const closeProjectSelector = () => {
  showProjectSelector.value = false
}

const selectProject = (project) => {
  currentProject.value = project
  
  if (process.client) {
    localStorage.setItem('selectedProjectId', project.id)
  }
  
  closeProjectSelector()
}

const loadCurrentProject = () => {
  if (process.client) {
    const savedProjectId = localStorage.getItem('selectedProjectId')
    if (savedProjectId) {
      const project = projects.value.find(p => p.id === savedProjectId)
      if (project) {
        currentProject.value = project
      } else {
        const defaultProject = projects.value.find(p => p.isDefaultProject)
        if (defaultProject) {
          currentProject.value = defaultProject
          localStorage.setItem('selectedProjectId', defaultProject.id)
        }
      }
    } else {
      const defaultProject = projects.value.find(p => p.isDefaultProject)
      if (defaultProject) {
        currentProject.value = defaultProject
        localStorage.setItem('selectedProjectId', defaultProject.id)
      }
    }
  }
}

// Mobil cihazlarda navigasyon linkine tıklandığında sidebar'ı kapat
const handleNavClick = () => {
  if (process.client && window.innerWidth < 1024) {
    toggleSidebar()
  }
}

const handleClickOutside = (event) => {
  if (showProjectSelector.value && projectDropdownRef.value && !projectDropdownRef.value.contains(event.target) && !event.target.closest('button')) {
    closeProjectSelector()
  }
  // Dil seçici için dış tıklama algılama
  if (showLanguageDropdown.value && languageDropdownRef.value && !languageDropdownRef.value.contains(event.target) && !event.target.closest('.flex.items-center.justify-between.p-3.rounded-lg.text-text-secondary')) {
    showLanguageDropdown.value = false
  }
}

onMounted(() => {
  loadCurrentProject()
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
