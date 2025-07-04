<template>
  <div>
    <h2 class="text-3xl font-bold text-text-primary mb-6">{{ $t('roles_permissions_title') }}</h2>

    <div class="mb-6">
      <nav class="flex space-x-4 border-b border-border-color" aria-label="Tabs">
        <button
          @click="selectedTab = 'roles-permissions'"
					class="text-sm"
          :class="[
            selectedTab === 'roles-permissions'
              ? 'bg-card text-primary border-b-2 border-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-background/50',
            'relative z-10 -mb-px px-6 py-3 font-semibold text-lg rounded-t-lg transition-all duration-300 ease-in-out'
          ]"
        >
          {{ $t('roles_permissions_tab') }}
        </button>
        <button
          @click="selectedTab = 'assign-roles'"
					class="text-sm"
          :class="[
            selectedTab === 'assign-roles'
              ? 'bg-card text-primary border-b-2 border-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-background/50',
            'relative z-10 -mb-px px-6 py-3 font-semibold text-lg rounded-t-lg transition-all duration-300 ease-in-out'
          ]"
        >
          {{ $t('assign_roles_to_users_tab') }}
        </button>
      </nav>
    </div>

    <div v-if="selectedTab === 'roles-permissions'" class="space-y-8">
      <!-- Roles Management Card -->
      <div class="bg-card rounded-lg shadow-md border border-border-color overflow-hidden hover:shadow-lg hover:border-primary transition-all duration-300 transform hover:scale-[1.005] relative">
        <LoadingOverlay :isLoading="isLoadingRoles" :message="$t('loading_roles')" />
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-text-primary">{{ $t('roles') }}</h3>
            <button @click="openCreateRoleModal" class="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors flex items-center gap-2 text-base">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              {{ $t('create_new_role') }}
            </button>
          </div>
          
          <div class="overflow-x-auto" :class="{'min-h-[200px]': isLoadingRoles}">
            <table class="w-full text-left">
              <thead class="border-b border-border-color">
                <tr>
                  <th class="p-4 text-sm font-semibold text-text-secondary uppercase">{{ $t('role_name') }}</th>
                  <th class="p-4 text-sm font-semibold text-text-secondary uppercase">{{ $t('description') }}</th>
                  <th class="p-4 text-sm font-semibold text-text-secondary uppercase">{{ $t('permission_count') }}</th>
                  <th class="p-4 text-sm font-semibold text-text-secondary uppercase">{{ $t('user_count') }}</th>
                  <th class="p-4 text-sm font-semibold text-text-secondary uppercase">{{ $t('status') }}</th>
                  <th class="p-4 text-sm font-semibold text-text-secondary uppercase">{{ $t('actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!isLoadingRoles && paginatedRoles.length === 0">
                  <td colspan="6" class="p-4 text-center text-text-secondary text-base">{{ $t('no_roles_found') }}</td>
                </tr>
                <tr v-else v-for="role in paginatedRoles" :key="role.id" class="border-b border-border-color hover:bg-background/50 transition-colors">
                  <td class="p-4 text-text-primary font-medium text-base">{{ role.name }}</td>
                  <td class="p-4 text-text-secondary text-sm">{{ role.description || '-' }}</td>
                  <td class="p-4 text-text-primary text-base">{{ role.permissions.length }}</td>
                  <td class="p-4 text-text-primary text-base">{{ role.userCount || 0 }}</td>
                  <td class="p-4">
                    <StatusBadge :type="role.isActive ? 'active' : 'inactive'" />
                  </td>
                  <td class="p-4 flex items-center gap-3">
                    <button @click="openEditRoleModal(role)" class="text-yellow-600 dark:text-yellow-400 hover:underline text-sm font-medium">
                      {{ $t('edit') }}
                    </button>
                    <button @click="openRolePermissionsModal(role)" class="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
                      {{ $t('permissions') }}
                    </button>
                    <button v-if="!role.isSystemRole" @click="openDeleteRoleConfirmation(role)" class="text-red-600 dark:text-red-400 hover:underline text-sm font-medium">
                      {{ $t('delete') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Pagination
            v-model:currentPage="rolesCurrentPage"
            :total-pages="rolesTotalPages"
            class="mt-4"
          />
        </div>
      </div>

      <!-- Permissions Management Card -->
      <div class="bg-card rounded-lg shadow-md border border-border-color overflow-hidden hover:shadow-lg hover:border-primary transition-all duration-300 transform hover:scale-[1.005] relative">
        <LoadingOverlay :isLoading="isLoadingPermissions" :message="$t('loading_permissions')" />
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-text-primary">{{ $t('permissions') }}</h3>
            <button @click="openCreatePermissionModal" class="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors flex items-center gap-2 text-base">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              {{ $t('create_new_permission') }}
            </button>
          </div>

          <div class="mb-4 flex gap-4 flex-col sm:flex-row">
            <select v-model="selectedCategory" class="px-4 py-2 border border-border-color rounded-lg bg-input-bg text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-base">
              <option value="">{{ $t('all_categories') }}</option>
              <option v-for="category in permissionCategories" :key="category" :value="category">{{ category }}</option>
            </select>
            <input
              type="text"
              v-model="permissionFilter"
              :placeholder="$t('filter_by_permission_name')"
              class="flex-grow px-4 py-2 border border-border-color rounded-lg bg-input-bg text-text-primary placeholder-text-secondary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-base"
            />
          </div>
          
          <div class="overflow-x-auto" :class="{'min-h-[200px]': isLoadingPermissions}">
            <table class="w-full text-left">
              <thead class="border-b border-border-color">
                <tr>
                  <th class="p-4 text-sm font-semibold text-text-secondary uppercase">{{ $t('permission_name') }}</th>
                  <th class="p-4 text-sm font-semibold text-text-secondary uppercase">{{ $t('category') }}</th>
                  <th class="p-4 text-sm font-semibold text-text-secondary uppercase">{{ $t('description') }}</th>
                  <th class="p-4 text-sm font-semibold text-text-secondary uppercase">{{ $t('role_count') }}</th>
                  <th class="p-4 text-sm font-semibold text-text-secondary uppercase">{{ $t('actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!isLoadingPermissions && filteredPermissions.length === 0">
                  <td colspan="5" class="p-4 text-center text-text-secondary text-base">{{ $t('no_matching_permissions') }}</td>
                </tr>
                <tr v-else v-for="permission in paginatedPermissions" :key="permission.id" class="border-b border-border-color hover:bg-background/50 transition-colors">
                  <td class="p-4 text-text-primary font-medium text-base">{{ permission.name }}</td>
                  <td class="p-4">
                    <span class="px-2 py-1 text-xs font-bold rounded" :class="getCategoryClass(permission.category)">
                      {{ permission.category }}
                    </span>
                  </td>
                  <td class="p-4 text-text-secondary text-sm">{{ permission.description || '-' }}</td>
                  <td class="p-4 text-text-primary text-base">{{ getRoleCountForPermission(permission.id) }}</td>
                  <td class="p-4 flex items-center gap-3">
                    <button @click="openEditPermissionModal(permission)" class="text-yellow-600 dark:text-yellow-400 hover:underline text-sm font-medium">
                      {{ $t('edit') }}
                    </button>
                    <button v-if="!permission.isSystemPermission" @click="openDeletePermissionConfirmation(permission)" class="text-red-600 dark:text-red-400 hover:underline text-sm font-medium">
                      {{ $t('delete') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <Pagination
            v-model:currentPage="permissionsCurrentPage"
            :total-pages="permissionsTotalPages"
            class="mt-4"
          />
        </div>
      </div>
    </div>

    <div v-if="selectedTab === 'assign-roles'" class="space-y-8">
      <!-- Assign Roles to Project Users Card -->
      <div class="bg-card rounded-lg shadow-md border border-border-color overflow-hidden hover:shadow-lg hover:border-primary transition-all duration-300 transform hover:scale-[1.005] relative">
        <LoadingOverlay :isLoading="isLoadingProjectUsers" :message="$t('loading_project_users')" />
        <div class="p-6">
          <h3 class="text-xl font-semibold text-text-primary mb-4">{{ $t('assign_roles_to_project_users') }}</h3>
          
          <div class="mb-4">
            <label for="project-select" class="block text-sm font-medium text-text-secondary mb-1">{{ $t('select_project_colon') }}</label>
            <select 
              id="project-select" 
              v-model="selectedProject" 
              @change="fetchProjectUsers"
              class="px-4 py-2 border border-border-color rounded-lg bg-input-bg text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 w-full text-base"
            >
              <option :value="null">{{ $t('select_project_to_manage_users') }}</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">{{ project.name }}</option>
            </select>
          </div>

          <div v-if="selectedProject" class="space-y-4">
            <div class="mb-4 flex gap-4 flex-col sm:flex-row">
              <input
                type="text"
                v-model="projectUserFilter"
                :placeholder="$t('filter_by_user_name')"
                class="flex-grow px-4 py-2 border border-border-color rounded-lg bg-input-bg text-text-primary placeholder-text-secondary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-base"
              />
              <select v-model="selectedRoleFilter" class="px-4 py-2 border border-border-color rounded-lg bg-input-bg text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-base">
                <option :value="null">{{ $t('all_roles') }}</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
              </select>
            </div>

            <div class="overflow-x-auto" :class="{'min-h-[200px]': isLoadingProjectUsers}">
              <h4 class="text-lg font-semibold text-text-primary mb-3">{{ $t('project_users') }}</h4>
              <table class="w-full text-left">
                <thead class="border-b border-border-color">
                  <tr>
                    <th class="p-4 text-sm font-semibold text-text-secondary uppercase">{{ $t('user_name') }}</th>
                    <th class="p-4 text-sm font-semibold text-text-secondary uppercase">{{ $t('current_roles') }}</th>
                    <th class="p-4 text-sm font-semibold text-text-secondary uppercase">{{ $t('actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!isLoadingProjectUsers && filteredProjectUsers.length === 0">
                    <td colspan="3" class="p-4 text-center text-text-secondary text-base">{{ $t('no_users_found_for_project') }}</td>
                  </tr>
                  <tr v-else v-for="user in paginatedProjectUsers" :key="user.id" class="border-b border-border-color hover:bg-background/50 transition-colors">
                    <td class="p-4 text-text-primary font-medium flex items-center gap-3 text-base">
                      <img 
                        :src="user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=1d4ed8&color=fff&size=40`" 
                        :alt="`${user.firstName} ${user.lastName}`" 
                        class="w-8 h-8 rounded-full object-cover border border-border-color"
                      >
                      <span>{{ user.name }}</span>
                    </td>
                    <td class="p-4 text-text-secondary text-sm">
                      <span v-if="user.roles && user.roles.length > 0">
                        <span v-for="(roleId, index) in user.roles" :key="roleId" class="inline-block bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                          {{ getRoleNameById(roleId) }}
                        </span>
                      </span>
                      <span v-else>-</span>
                    </td>
                    <td class="p-4">
                      <button @click="openAssignRolesModal(user)" class="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
                        {{ $t('assign_role') }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Pagination
              v-model:currentPage="projectUsersCurrentPage"
              :total-pages="projectUsersTotalPages"
              class="mt-4"
            />
          </div>
          <div v-else class="p-4 text-center text-text-secondary text-base">
            {{ $t('select_project_to_manage_users') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Role Modal -->
    <RoleModal
      v-if="showRoleModal"
      :role-to-edit="roleToEdit"
      :available-permissions="permissions"
      :is-loading="isCreatingRole || isUpdatingRole"
      @close="closeRoleModal"
      @create-role="handleRoleCreated"
      @update-role="handleRoleUpdated"
    />

    <!-- Permission Modal -->
    <PermissionModal
      v-if="showPermissionModal"
      :permission-to-edit="permissionToEdit"
      :categories="permissionCategories"
      :is-loading="isCreatingPermission || isUpdatingPermission"
      @close="closePermissionModal"
      @create-permission="handlePermissionCreated"
      @update-permission="handlePermissionUpdated"
    />

    <!-- Role Permissions Modal -->
    <RolePermissionsModal
      v-if="showRolePermissionsModal"
      :role="selectedRoleForPermissions"
      :available-permissions="permissions"
      :is-loading="isUpdatingRolePermissions"
      @close="closeRolePermissionsModal"
      @update-permissions="handleRolePermissionsUpdated"
    />

    <!-- Assign Roles to User Modal -->
    <AssignRolesModal
      v-if="showAssignRolesModal"
      :user="selectedUserForRoles"
      :available-roles="roles"
      :all-permissions="permissions"
      :is-loading="isAssigningRoles"
      @close="closeAssignRolesModal"
      @assign-roles="handleAssignRolesToUser"
    />

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showConfirmationModal"
      :title="confirmationConfig.title"
      :message="confirmationConfig.message"
      :confirm-text="confirmationConfig.confirmText"
      :confirm-button-class="confirmationConfig.confirmButtonClass"
      :is-confirming="isDeletingRole || isDeletingPermission"
      @close="closeConfirmationModal"
      @confirm="handleConfirmation"
    />

    <NotificationToast
      :show="notification.show"
      :type="notification.type"
      :message="notification.message"
      @close="hideNotification"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import StatusBadge from '~/components/StatusBadge.vue'
import RoleModal from '~/components/RoleModal.vue'
import PermissionModal from '~/components/PermissionModal.vue'
import RolePermissionsModal from '~/components/RolePermissionsModal.vue'
import ConfirmationModal from '~/components/ConfirmationModal.vue'
import Pagination from '~/components/Pagination.vue'
import LoadingOverlay from '~/components/LoadingOverlay.vue'
import NotificationToast from '~/components/NotificationToast.vue'
import AssignRolesModal from '~/components/AssignRolesModal.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Tab state
const selectedTab = ref('roles-permissions') // Default to the first tab

// Modal states
const showRoleModal = ref(false)
const showPermissionModal = ref(false)
const showRolePermissionsModal = ref(false)
const showAssignRolesModal = ref(false)
const showConfirmationModal = ref(false)

const roleToEdit = ref(null)
const permissionToEdit = ref(null)
const selectedRoleForPermissions = ref(null)
const selectedUserForRoles = ref(null)

// Filter states for Permissions
const selectedCategory = ref('')
const permissionFilter = ref('')

// Filter states for Project Users
const projectUserFilter = ref('')
const selectedRoleFilter = ref(null)

// Pagination for Roles
const rolesCurrentPage = ref(1)
const rolesPerPage = 5 // Display 5 roles per page

// Pagination for Permissions
const permissionsCurrentPage = ref(1)
const permissionsPerPage = 10

// Pagination for Project Users
const projectUsersCurrentPage = ref(1)
const projectUsersPerPage = 5 // Display 5 users per page

// Loading states
const isLoadingRoles = ref(true)
const isLoadingPermissions = ref(true)
const isCreatingRole = ref(false)
const isUpdatingRole = ref(false)
const isDeletingRole = ref(false)
const isCreatingPermission = ref(false)
const isUpdatingPermission = ref(false)
const isDeletingPermission = ref(false)
const isUpdatingRolePermissions = ref(false)
const isLoadingProjectUsers = ref(false)
const isAssigningRoles = ref(false)

// Confirmation config
const confirmationConfig = ref({
  title: '',
  message: '',
  confirmText: '',
  confirmButtonClass: '',
  onConfirm: () => {}
})

// Notification state
const notification = ref({
  show: false,
  type: '', // 'success', 'error', 'info'
  message: ''
})

const showNotification = (type, message) => {
  notification.value = { show: true, type, message }
  setTimeout(() => {
    hideNotification()
  }, 3000) // 3 saniye sonra bildirimi gizle
}

const hideNotification = () => {
  notification.value = { show: false, type: '', message: '' }
}

// Sample data (moved to be loaded by functions)
const initialPermissions = [
  { id: 'perm1', name: 'users.create', category: 'User Management', description: 'Kullanıcı oluşturma izni', isSystemPermission: true },
  { id: 'perm2', name: 'users.read', category: 'User Management', description: 'Kullanıcı görüntüleme izni', isSystemPermission: true },
  { id: 'perm3', name: 'users.update', category: 'User Management', description: 'Kullanıcı güncelleme izni', isSystemPermission: true },
  { id: 'perm4', name: 'users.delete', category: 'User Management', description: 'Kullanıcı silme izni', isSystemPermission: true },
  { id: 'perm5', name: 'projects.create', category: 'Project Management', description: 'Proje oluşturma izni', isSystemPermission: true },
  { id: 'perm6', name: 'projects.read', category: 'Project Management', description: 'Proje görüntüleme izni', isSystemPermission: true },
  { id: 'perm7', name: 'projects.update', category: 'Project Management', description: 'Proje güncelleme izni', isSystemPermission: true },
  { id: 'perm8', name: 'projects.delete', category: 'Project Management', description: 'Proje silme izni', isSystemPermission: true },
  { id: 'perm9', name: 'scheduler.create', category: 'Scheduler', description: 'Scheduler job oluşturma izni', isSystemPermission: true },
  { id: 'perm10', name: 'scheduler.read', category: 'Scheduler', description: 'Scheduler job görüntüleme izni', isSystemPermission: true },
  { id: 'perm11', name: 'scheduler.update', category: 'Scheduler', description: 'Scheduler job güncelleme izni', isSystemPermission: true },
  { id: 'perm12', name: 'scheduler.delete', category: 'Scheduler', description: 'Scheduler job silme izni', isSystemPermission: true },
  { id: 'perm13', name: 'messages.create', category: 'Message Templates', description: 'Mesaj şablonu oluşturma izni', isSystemPermission: true },
  { id: 'perm14', name: 'messages.read', category: 'Message Templates', description: 'Mesaj şablonu görüntüleme izni', isSystemPermission: true },
  { id: 'perm15', name: 'messages.update', category: 'Message Templates', description: 'Mesaj şablonu güncelleme izni', isSystemPermission: true },
  { id: 'perm16', name: 'messages.delete', category: 'Message Templates', description: 'Mesaj şablonu silme izni', isSystemPermission: true },
  { id: 'perm17', name: 'roles.create', category: 'Role Management', description: 'Rol oluşturma izni', isSystemPermission: true },
  { id: 'perm18', name: 'roles.read', category: 'Role Management', description: 'Rol görüntüleme izni', isSystemPermission: true },
  { id: 'perm19', name: 'roles.update', category: 'Role Management', description: 'Rol güncelleme izni', isSystemPermission: true },
  { id: 'perm20', name: 'roles.delete', category: 'Role Management', description: 'Rol silme izni', isSystemPermission: true }
]

const initialRoles = [
  {
    id: 'role1',
    name: 'Super Admin',
    description: 'Tüm sistem izinlerine sahip süper yönetici rolü',
    isActive: true,
    isSystemRole: true,
    userCount: 1,
    permissions: initialPermissions.map(p => p.id)
  },
  {
    id: 'role2',
    name: 'Admin',
    description: 'Yönetici rolü - çoğu işlemi yapabilir',
    isActive: true,
    isSystemRole: false,
    userCount: 3,
    permissions: ['perm1', 'perm2', 'perm3', 'perm5', 'perm6', 'perm7', 'perm9', 'perm10', 'perm11', 'perm13', 'perm14', 'perm15', 'perm18']
  },
  {
    id: 'role3',
    name: 'Developer',
    description: 'Geliştirici rolü - proje ve scheduler yönetimi',
    isActive: true,
    isSystemRole: false,
    userCount: 5,
    permissions: ['perm2', 'perm6', 'perm7', 'perm9', 'perm10', 'perm11', 'perm13', 'perm14', 'perm15']
  },
  {
    id: 'role4',
    name: 'Viewer',
    description: 'Görüntüleyici rolü - sadece okuma izinleri',
    isActive: true,
    isSystemRole: false,
    userCount: 8,
    permissions: ['perm2', 'perm6', 'perm10', 'perm14', 'perm18']
  },
  {
    id: 'role5',
    name: 'Inactive Role',
    description: 'Pasif durumdaki örnek rol',
    isActive: false,
    isSystemRole: false,
    userCount: 0,
    permissions: []
  },
  { id: 'role6', name: 'Editor', description: 'İçerik düzenleme yetkisi', isActive: true, isSystemRole: false, userCount: 2, permissions: ['perm13', 'perm14', 'perm15'] },
  { id: 'role7', name: 'Moderator', description: 'Forum ve yorum denetimi', isActive: true, isSystemRole: false, userCount: 4, permissions: ['perm2', 'perm3'] },
  { id: 'role8', name: 'Guest', description: 'Misafir kullanıcı rolü', isActive: false, isSystemRole: false, userCount: 10, permissions: ['perm2', 'perm6'] },
  { id: 'role9', name: 'Analyst', description: 'Veri analizi ve raporlama', isActive: true, isSystemRole: false, userCount: 3, permissions: ['perm6', 'perm10'] },
  { id: 'role10', name: 'Support', description: 'Müşteri destek yetkilisi', isActive: true, isSystemRole: false, userCount: 6, permissions: ['perm2', 'perm3', 'perm14'] },
  { id: 'role11', name: 'Tester', description: 'Yazılım test yetkilisi', isActive: true, isSystemRole: false, userCount: 2, permissions: ['perm6', 'perm9'] },
  { id: 'role12', name: 'Marketing', description: 'Pazarlama ekibi', isActive: true, isSystemRole: false, userCount: 3, permissions: ['perm13', 'perm14'] },
  { id: 'role13', name: 'Finance', description: 'Finans departmanı', isActive: true, isSystemRole: false, userCount: 1, permissions: ['perm6'] },
  { id: 'role14', name: 'HR', description: 'İnsan kaynakları departmanı', isActive: true, isSystemRole: false, userCount: 2, permissions: ['perm2'] },
  { id: 'role15', name: 'Intern', description: 'Stajyer rolü', isActive: false, isSystemRole: false, userCount: 5, permissions: [] }
]

const initialProjects = [
  { id: 'proj1', name: 'E-commerce Platform' },
  { id: 'proj2', name: 'CRM System' },
  { id: 'proj3', name: 'Mobile App Backend' },
]

const initialProjectUsers = {
  'proj1': [
    { id: 'user1', name: 'Alice Smith', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', roles: ['role2'] },
    { id: 'user2', name: 'Bob Johnson', firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', roles: ['role3'] },
    { id: 'user3', name: 'Charlie Brown', firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', roles: ['role4'] },
    { id: 'user7', name: 'Diana Prince', firstName: 'Diana', lastName: 'Prince', email: 'diana@example.com', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', roles: ['role2'] },
    { id: 'user8', name: 'Ethan Hunt', firstName: 'Ethan', lastName: 'Hunt', email: 'ethan@example.com', avatar: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', roles: ['role3'] },
    { id: 'user9', name: 'Fiona Glenanne', firstName: 'Fiona', lastName: 'Glenanne', email: 'fiona@example.com', avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', roles: ['role4'] },
    { id: 'user10', name: 'George Costanza', firstName: 'George', lastName: 'Costanza', email: 'george@example.com', avatar: 'https://images.pexels.com/photos/1587004/pexels-photo-1587004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', roles: ['role2'] },
    { id: 'user11', name: 'Hannah Montana', firstName: 'Hannah', lastName: 'Montana', email: 'hannah@example.com', avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', roles: ['role3'] },
    { id: 'user12', name: 'Ivan Drago', firstName: 'Ivan', lastName: 'Drago', email: 'ivan@example.com', avatar: 'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', roles: ['role4'] },
    { id: 'user13', name: 'Jessica Rabbit', firstName: 'Jessica', lastName: 'Rabbit', email: 'jessica@example.com', avatar: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', roles: ['role2'] },
  ],
  'proj2': [
    { id: 'user4', name: 'David Lee', firstName: 'David', lastName: 'Lee', email: 'david@example.com', avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', roles: ['role2', 'role3'] },
    { id: 'user5', name: 'Eve Davis', firstName: 'Eve', lastName: 'Davis', email: 'eve@example.com', avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', roles: ['role4'] },
    { id: 'user14', name: 'Kevin Flynn', firstName: 'Kevin', lastName: 'Flynn', email: 'kevin@example.com', avatar: 'https://images.pexels.com/photos/1462630/pexels-photo-1462630.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', roles: ['role3'] },
    { id: 'user15', name: 'Laura Croft', firstName: 'Laura', lastName: 'Croft', email: 'laura@example.com', avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', roles: ['role2'] },
  ],
  'proj3': [
    { id: 'user6', name: 'Frank White', firstName: 'Frank', lastName: 'White', email: 'frank@example.com', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', roles: ['role3'] },
    { id: 'user16', name: 'Mia Wallace', firstName: 'Mia', lastName: 'Wallace', email: 'mia@example.com', avatar: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', roles: ['role4'] },
    { id: 'user17', name: 'Neo Anderson', firstName: 'Neo', lastName: 'Anderson', email: 'neo@example.com', avatar: 'https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', roles: ['role2'] },
  ],
}

const permissions = ref([])
const roles = ref([])
const projects = ref([])
const projectUsers = ref([])
const selectedProject = ref(null)

// Data fetching functions
const fetchPermissions = async () => {
  isLoadingPermissions.value = true
  await new Promise(resolve => setTimeout(resolve, 700)) // Simulate API call
  permissions.value = initialPermissions
  isLoadingPermissions.value = false
}

const fetchRoles = async () => {
  isLoadingRoles.value = true
  await new Promise(resolve => setTimeout(resolve, 700)) // Simulate API call
  roles.value = initialRoles
  isLoadingRoles.value = false
}

const fetchProjects = async () => {
  // Simulate API call for projects
  await new Promise(resolve => setTimeout(resolve, 500))
  projects.value = initialProjects
}

const fetchProjectUsers = async () => {
  if (!selectedProject.value) {
    projectUsers.value = []
    return
  }
  isLoadingProjectUsers.value = true
  await new Promise(resolve => setTimeout(resolve, 700)) // Simulate API call
  projectUsers.value = initialProjectUsers[selectedProject.value] || []
  projectUsersCurrentPage.value = 1; // Reset pagination when project changes
  isLoadingProjectUsers.value = false
}

// Computed properties for Roles
const rolesTotalPages = computed(() => Math.ceil(roles.value.length / rolesPerPage))

const paginatedRoles = computed(() => {
  const start = (rolesCurrentPage.value - 1) * rolesPerPage
  const end = start + rolesPerPage
  return roles.value.slice(start, end)
})

// Computed properties for Permissions
const permissionCategories = computed(() => {
  const categories = [...new Set(permissions.value.map(p => p.category))]
  return categories.sort()
})

const filteredPermissions = computed(() => {
  let filtered = permissions.value

  if (selectedCategory.value) {
    filtered = filtered.filter(p => p.category === selectedCategory.value)
  }

  if (permissionFilter.value) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(permissionFilter.value.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(permissionFilter.value.toLowerCase()))
    )
  }

  return filtered
})

const permissionsTotalPages = computed(() => Math.ceil(filteredPermissions.value.length / permissionsPerPage))

const paginatedPermissions = computed(() => {
  const start = (permissionsCurrentPage.value - 1) * permissionsPerPage
  const end = start + permissionsPerPage
  return filteredPermissions.value.slice(start, end)
})

// Computed properties for Project Users
const filteredProjectUsers = computed(() => {
  let filtered = projectUsers.value

  if (projectUserFilter.value) {
    const filterQuery = projectUserFilter.value.toLowerCase();
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(filterQuery) ||
      user.email.toLowerCase().includes(filterQuery)
    );
  }

  if (selectedRoleFilter.value) {
    filtered = filtered.filter(user => user.roles.includes(selectedRoleFilter.value));
  }

  return filtered;
});

const projectUsersTotalPages = computed(() => Math.ceil(filteredProjectUsers.value.length / projectUsersPerPage));

const paginatedProjectUsers = computed(() => {
  const start = (projectUsersCurrentPage.value - 1) * projectUsersPerPage;
  const end = start + projectUsersPerPage;
  return filteredProjectUsers.value.slice(start, end);
});

// Methods
const getCategoryClass = (category) => {
  const colors = {
    'User Management': 'bg-blue-500/20 text-blue-400',
    'Project Management': 'bg-green-500/20 text-green-400',
    'Scheduler': 'bg-purple-500/20 text-purple-400',
    'Message Templates': 'bg-yellow-500/20 text-yellow-400',
    'Role Management': 'bg-red-500/20 text-red-400'
  }
  return colors[category] || 'bg-gray-500/20 text-gray-400'
}

const getRoleCountForPermission = (permissionId) => {
  return roles.value.filter(role => role.permissions.includes(permissionId)).length
}

const getRoleNameById = (roleId) => {
  const role = roles.value.find(r => r.id === roleId)
  return role ? role.name : 'Unknown Role'
}

// Role Modal Methods
const openCreateRoleModal = () => {
  roleToEdit.value = null
  showRoleModal.value = true
}

const openEditRoleModal = (role) => {
  roleToEdit.value = role
  showRoleModal.value = true
}

const closeRoleModal = () => {
  showRoleModal.value = false
  roleToEdit.value = null
}

const handleRoleCreated = async (newRoleData) => {
  isCreatingRole.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    const newRole = {
      ...newRoleData,
      id: uuidv4(),
      userCount: 0,
      isSystemRole: false
    }
    roles.value.unshift(newRole)
    showNotification('success', t('role_created_success', { roleName: newRole.name }));
    closeRoleModal()
    rolesCurrentPage.value = 1; // Reset roles pagination to first page
  } catch (error) {
    console.error('Rol oluşturma hatası:', error);
    showNotification('error', t('role_create_error_notification'));
  } finally {
    isCreatingRole.value = false
  }
}

const handleRoleUpdated = async (updatedRoleData) => {
  isUpdatingRole.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    const index = roles.value.findIndex(r => r.id === updatedRoleData.id)
    if (index !== -1) {
      roles.value[index] = { ...roles.value[index], ...updatedRoleData }
      showNotification('success', t('role_updated_success', { roleName: updatedRoleData.name }));
    } else {
      showNotification('error', t('role_not_found_update'));
    }
    closeRoleModal()
  } catch (error) {
    console.error('Rol güncelleme hatası:', error);
    showNotification('error', t('role_update_error_notification'));
  } finally {
    isUpdatingRole.value = false
  }
}

// Permission Modal Methods
const openCreatePermissionModal = () => {
  permissionToEdit.value = null
  showPermissionModal.value = true
}

const openEditPermissionModal = (permission) => {
  permissionToEdit.value = permission
  showPermissionModal.value = true
}

const closePermissionModal = () => {
  showPermissionModal.value = false
  permissionToEdit.value = null
}

const handlePermissionCreated = async (newPermissionData) => {
  isCreatingPermission.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    const newPermission = {
      ...newPermissionData,
      id: uuidv4(),
      isSystemPermission: false
    }
    permissions.value.unshift(newPermission)
    showNotification('success', t('permission_created_success', { permissionName: newPermission.name }));
    closePermissionModal()
    permissionsCurrentPage.value = 1; // Reset permissions pagination to first page
  } catch (error) {
    console.error('İzin oluşturma hatası:', error);
    showNotification('error', t('permission_create_error_notification'));
  } finally {
    isCreatingPermission.value = false
  }
}

const handlePermissionUpdated = async (updatedPermissionData) => {
  isUpdatingPermission.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    const index = permissions.value.findIndex(p => p.id === updatedPermissionData.id)
    if (index !== -1) {
      permissions.value[index] = { ...permissions.value[index], ...updatedPermissionData }
      showNotification('success', t('permission_updated_success', { permissionName: updatedPermissionData.name }));
    } else {
      showNotification('error', t('permission_not_found_update'));
    }
    closePermissionModal()
  } catch (error) {
    console.error('İzin güncelleme hatası:', error);
    showNotification('error', t('permission_update_error_notification'));
  } finally {
    isUpdatingPermission.value = false
  }
}

// Role Permissions Modal Methods
const openRolePermissionsModal = (role) => {
  selectedRoleForPermissions.value = role
  showRolePermissionsModal.value = true
}

const closeRolePermissionsModal = () => {
  showRolePermissionsModal.value = false
  selectedRoleForPermissions.value = null
}

const handleRolePermissionsUpdated = async (roleId, newPermissions) => {
  isUpdatingRolePermissions.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    const roleIndex = roles.value.findIndex(r => r.id === roleId)
    if (roleIndex !== -1) {
      roles.value[roleIndex].permissions = newPermissions
      showNotification('success', t('role_permissions_updated_success', { roleName: roles.value[roleIndex].name }));
    } else {
      showNotification('error', t('role_not_found_or_permissions_update_error'));
    }
    closeRolePermissionsModal()
  } catch (error) {
    console.error('Rol izinleri güncelleme hatası:', error);
    showNotification('error', t('role_permissions_update_error_notification'));
  } finally {
    isUpdatingRolePermissions.value = false
  }
}

// Assign Roles to User Modal Methods
const openAssignRolesModal = (user) => {
  selectedUserForRoles.value = user
  showAssignRolesModal.value = true
}

const closeAssignRolesModal = () => {
  showAssignRolesModal.value = false
  selectedUserForRoles.value = null
}

const handleAssignRolesToUser = async (userId, newRoleIds) => {
  isAssigningRoles.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    const userIndex = projectUsers.value.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      projectUsers.value[userIndex].roles = newRoleIds
      showNotification('success', t('user_roles_updated_success', { userName: projectUsers.value[userIndex].name }));
    } else {
      showNotification('error', t('user_roles_update_error'));
    }
    closeAssignRolesModal()
  } catch (error) {
    console.error('Kullanıcıya rol atama hatası:', error);
    showNotification('error', t('user_roles_update_error'));
  } finally {
    isAssigningRoles.value = false
  }
}

// Delete confirmation methods
const openDeleteRoleConfirmation = (role) => {
  confirmationConfig.value = {
    title: t('delete_role_title'),
    message: t('delete_role_message', { roleName: role.name }),
    confirmText: t('delete'),
    confirmButtonClass: 'bg-red-600 hover:bg-red-700',
    onConfirm: () => deleteRole(role.id, role.name)
  }
  showConfirmationModal.value = true
}

const openDeletePermissionConfirmation = (permission) => {
  confirmationConfig.value = {
    title: t('delete_permission_title'),
    message: t('delete_permission_message', { permissionName: permission.name }),
    confirmText: t('delete'),
    confirmButtonClass: 'bg-red-600 hover:bg-red-700',
    onConfirm: () => deletePermission(permission.id, permission.name)
  }
  showConfirmationModal.value = true
}

const deleteRole = async (roleId, roleName) => {
  isDeletingRole.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    const initialLength = roles.value.length;
    roles.value = roles.value.filter(r => r.id !== roleId)
    if (roles.value.length < initialLength) {
      showNotification('success', t('role_deleted_success', { roleName: roleName }));
    } else {
      showNotification('error', t('role_not_found_or_delete_error'));
    }
  } catch (error) {
    console.error('Rol silme hatası:', error);
    showNotification('error', t('role_delete_error_notification'));
  } finally {
    isDeletingRole.value = false
  }
}

const deletePermission = async (permissionId, permissionName) => {
  isDeletingPermission.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    const initialLength = permissions.value.length;
    permissions.value = permissions.value.filter(p => p.id !== permissionId)
    // Remove permission from all roles
    roles.value.forEach(role => {
      role.permissions = role.permissions.filter(p => p !== permissionId)
    })
    if (permissions.value.length < initialLength) {
      showNotification('success', t('permission_deleted_success', { permissionName: permissionName }));
    } else {
      showNotification('error', t('permission_not_found_or_delete_error'));
    }
  } catch (error) {
    console.error('İzin silme hatası:', error);
    showNotification('error', t('permission_delete_error_notification'));
  } finally {
    isDeletingPermission.value = false
  }
}

const closeConfirmationModal = () => {
  showConfirmationModal.value = false
  isDeletingRole.value = false // Reset loading states if modal is closed
  isDeletingPermission.value = false // Reset loading states if modal is closed
}

const handleConfirmation = () => {
  if (confirmationConfig.value.onConfirm) {
    confirmationConfig.value.onConfirm()
  }
  // Loading state is handled by the specific deleteRole/deletePermission functions
  // closeConfirmationModal() is called by the finally block of deleteRole/deletePermission
}

onMounted(() => {
  fetchRoles()
  fetchPermissions()
  fetchProjects()
})
</script>
