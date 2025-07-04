<template>
  <div>
    <h2 class="text-3xl font-bold text-text-primary mb-6">{{ $t('scheduler_job_management') }}</h2>

    <!-- Tab Navigation -->
    <div class="mb-6">
      <nav class="flex space-x-4 border-b border-border-color" aria-label="Tabs">
        <button
          @click="selectedTab = 'jobs'"
					class="text-sm"
          :class="[
            selectedTab === 'jobs'
              ? 'bg-card text-primary border-b-2 border-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-background/50',
            'relative z-10 -mb-px px-6 py-3 font-semibold text-lg rounded-t-lg transition-all duration-300 ease-in-out'
          ]"
        >
          {{ $t('jobs') }}
        </button>
        <button
          @click="selectedTab = 'job-instances'"
					class="text-sm"
          :class="[
            selectedTab === 'job-instances'
              ? 'bg-card text-primary border-b-2 border-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-background/50',
            'relative z-10 -mb-px px-6 py-3 font-semibold text-lg rounded-t-lg transition-all duration-300 ease-in-out'
          ]"
        >
          {{ $t('job_instances') }}
        </button>
        <button
          @click="selectedTab = 'job-logs'"
					class="text-sm"
          :class="[
            selectedTab === 'job-logs'
              ? 'bg-card text-primary border-b-2 border-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-background/50',
            'relative z-10 -mb-px px-6 py-3 font-semibold text-lg rounded-t-lg transition-all duration-300 ease-in-out'
          ]"
        >
          {{ $t('job_logs') }}
        </button>
      </nav>
    </div>

    <div class="space-y-8">
      <!-- Jobs Tab Content -->
      <div v-if="selectedTab === 'jobs'">
        <!-- Jobs List Card -->
        <div class="relative bg-card rounded-lg shadow-md border border-border-color overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:border-primary hover:scale-[1.005] mb-8">
          <LoadingOverlay :isLoading="jobsLoading" :message="$t('loading_job_data')" />
          <div class="p-6">
            <div class="flex justify-between items-center" :class="{'mb-4': isJobsOpen}">
              <div class="flex items-center gap-3">
                <h3 class="text-xl font-semibold text-text-primary">{{ $t('jobs') }}</h3>
                <button @click="isJobsOpen = !isJobsOpen" class="text-text-secondary hover:text-text-primary p-1 rounded-full hover:bg-primary/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-300" :class="{'rotate-180': !isJobsOpen}"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
              </div>
              <button @click="openCreateModal" :disabled="isProcessing" class="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                {{ $t('create_new_job') }}
              </button>
            </div>
            <div v-if="isJobsOpen" class="overflow-x-auto mt-4" :class="{'min-h-[200px]': jobsLoading}">
              <div class="mb-4 flex gap-4">
                <select
                  v-model="selectedProject"
                  class="px-4 py-2 border border-border-color rounded-lg bg-input-bg text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                >
                  <option v-for="proj in allProjects" :key="proj.id" :value="proj">
                    {{ proj.name }} ({{ getJobCountForProject(proj.id) }})
                  </option>
                </select>
                <input
                  type="text"
                  v-model="jobsFilterUrl"
                  :placeholder="$t('filter_by_url')"
                  class="flex-grow px-4 py-2 border border-border-color rounded-lg bg-input-bg text-text-primary placeholder-text-secondary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                />
                <select
                  v-model="jobsFilterStatus"
                  class="px-4 py-2 border border-border-color rounded-lg bg-input-bg text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                >
                  <option value="">{{ $t('all_statuses') }}</option>
                  <option value="active">{{ $t('active') }} ({{ activeJobsCount }})</option>
                  <option value="inactive">{{ $t('passive') }} ({{ inactiveJobsCount }})</option>
                </select>
              </div>
              <table class="w-full text-left">
                <thead class="border-b border-border-color">
                  <tr>
                    <th class="p-4 text-sm font-semibold text-text-secondary uppercase">{{ $t('url') }}</th>
                    <th class="p-4 text-sm font-semibold text-text-secondary uppercase">{{ $t('method') }}</th>
                    <th class="p-4 text-sm font-semibold text-text-secondary uppercase">{{ $t('status') }}</th>
                    <th class="p-4 text-sm font-semibold text-text-secondary uppercase">{{ $t('job_instances') }}</th>
                    <th class="p-4 text-sm font-semibold text-text-secondary uppercase">{{ $t('actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!jobsLoading && filteredJobs.length === 0">
                    <td colspan="5" class="p-4 text-center text-text-secondary">{{ $t('no_jobs_found') }}</td>
                  </tr>
                  <tr 
                    v-else
                    v-for="job in paginatedJobs" 
                    :key="job.id" 
                    class="border-b border-border-color transition-colors hover:bg-hover-light dark:hover:bg-hover-dark relative"
                    :class="{'bg-selected-row-bg': selectedJob && job.id === selectedJob.id}"
                  >
                    <LoadingOverlay :isLoading="isDeletingJobId === job.id || (isProcessing && confirmationConfig.onConfirm === deleteJob && confirmationConfig.targetId === job.id)" :message="$t('deleting')" />
                    <td class="p-4 text-text-primary font-mono text-sm">{{ job.url }}</td>
                    <td class="p-4">
                      <span class="px-2 py-1 text-xs font-bold rounded" :class="getMethodClass(job.method)">
                        {{ job.method }}
                      </span>
                    </td>
                    <td class="p-4">
                      <StatusBadge :type="job.enable ? 'active' : 'inactive'" />
                    </td>
                    <td class="p-4">
                      <div class="mb-1">
                        <StatusBadge type="active" :label="`${job.jobInstances.filter(i => i.enable).length} ${$t('active')}`" />
                      </div>
                      <div>
                        <StatusBadge type="inactive" :label="`${job.jobInstances.filter(i => !i.enable).length} ${$t('passive')}`" />
                      </div>
                    </td>
                    <td class="p-4 flex items-center gap-4">
                      <button @click="openEditModal(job)" :disabled="isProcessing" class="text-yellow-600 dark:text-yellow-400 hover:underline text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ $t('edit') }}
                      </button>
                      <button 
                        v-if="job.jobInstances.some(instance => instance.enable)" 
                        @click.stop="promptStopAllInstances(job)" 
                        :disabled="isProcessing"
                        class="text-red-600 dark:text-red-400 hover:underline text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {{ $t('stop_all_instances') }}
                      </button>
                      <button 
                        v-else-if="job.jobInstances.length > 0 && job.jobInstances.every(instance => !instance.enable)" 
                        @click.stop="promptStartAllInstances(job)" 
                        :disabled="isProcessing"
                        class="text-green-600 dark:text-green-400 hover:underline text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {{ $t('start_all_instances') }}
                      </button>
                      <button @click.stop="promptDeleteJob(job)" :disabled="isProcessing" class="text-red-600 dark:text-red-400 hover:underline text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ $t('delete') }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <Pagination
                v-model:currentPage="jobsCurrentPage"
                :total-pages="jobsTotalPages"
                class="mt-4"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Job Instances Tab Content -->
      <div v-if="selectedTab === 'job-instances'">
        <!-- Job Instances Card -->
        <div class="relative bg-card rounded-lg shadow-md border border-border-color overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:border-primary hover:scale-[1.005]">
          <LoadingOverlay :isLoading="instancesLoading" :message="$t('loading_job_instance_data')" />
          <div class="p-6">
            <div class="flex items-center gap-3" :class="{'mb-4': isInstancesOpen}">
              <h3 class="text-xl font-semibold text-text-primary">{{ $t('job_instances') }}</h3>
              <button @click="isInstancesOpen = !isInstancesOpen" class="text-text-secondary hover:text-text-primary p-1 rounded-full hover:bg-primary/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-300" :class="{'rotate-180': !isInstancesOpen}"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
            </div>
            <div v-if="isInstancesOpen" class="overflow-x-auto mt-4" :class="{'min-h-[200px]': instancesLoading}">
              <div class="mb-4 flex gap-4 items-center">
                <label for="project-select-instances" class="text-text-primary font-medium">{{ $t('select_project_colon') }}</label>
                <select
                  id="project-select-instances"
                  v-model="selectedProjectForInstances"
                  class="px-4 py-2 border border-border-color rounded-lg bg-input-bg text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 flex-grow"
                >
                  <option :value="null">{{ $t('all_projects') }}</option>
                  <option v-for="proj in allProjects" :key="proj.id" :value="proj">
                    {{ proj.name }} ({{ getJobCountForProject(proj.id) }})
                  </option>
                </select>
              </div>
              <div class="mb-4 flex gap-4 items-center" v-if="selectedProjectForInstances">
                <label for="job-select-instances" class="text-text-primary font-medium">{{ $t('select_job_colon') }}</label>
                <select
                  id="job-select-instances"
                  v-model="selectedJobForInstances"
                  class="px-4 py-2 border border-border-color rounded-lg bg-input-bg text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 flex-grow"
                >
                  <option :value="null">{{ $t('all_jobs') }}</option>
                  <option v-for="job in jobsInSelectedProjectForInstances" :key="job.id" :value="job">
                    {{ job.url }} ({{ job.method }}) ({{ getInstanceCountForJob(job.id) }})
                  </option>
                </select>
              </div>
              <div v-if="selectedJobForInstances">
                <div class="mb-4 flex gap-4">
                  <input
                    type="text"
                    v-model="instancesFilterKey"
                    :placeholder="$t('filter_by_job_key')"
                    class="flex-grow px-4 py-2 border border-border-color rounded-lg bg-input-bg text-text-primary placeholder-text-secondary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  />
                  <select
                    v-model="instancesFilterStatus"
                    class="px-4 py-2 border border-border-color rounded-lg bg-input-bg text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  >
                    <option value="">{{ $t('all_statuses') }}</option>
                    <option value="active">{{ $t('active') }} ({{ activeInstancesCount }})</option>
                    <option value="inactive">{{ $t('passive') }} ({{ inactiveInstancesCount }})</option>
                  </select>
                </div>
                <div v-if="selectedJobForInstances.jobInstances.length > 0">
                  <table class="w-full text-left">
                    <thead class="border-b border-border-color sticky top-0 bg-card">
                      <tr>
                        <th class="p-3 w-12"></th>
                        <th class="p-3 text-sm font-semibold text-text-secondary uppercase">{{ $t('job_key') }}</th>
                        <th class="p-3 text-sm font-semibold text-text-secondary uppercase">{{ $t('cron_expression') }}</th>
                        <th class="p-3 text-sm font-semibold text-text-secondary uppercase">{{ $t('status') }}</th>
                        <th class="p-3 text-sm font-semibold text-text-secondary uppercase">{{ $t('actions') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <template v-for="instance in paginatedInstances" :key="instance.id">
                        <tr 
                          @click="toggleInstanceDetails(instance)" 
                          class="border-b border-border-color cursor-pointer transition-colors hover:bg-hover-light dark:hover:bg-hover-dark relative"
                          :class="{'bg-selected-row-bg': selectedInstance && instance.id === selectedInstance.id}"
                        >
                          <LoadingOverlay :isLoading="isDeletingInstanceId === instance.id || (isProcessing && confirmationConfig.onConfirm === deleteInstance && confirmationConfig.targetId === instance.id)" :message="$t('deleting')" />
                          <td class="p-3 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-200 text-gray-500" :class="{'rotate-90': expandedInstanceId === instance.id}"><polyline points="9 18 15 12 9 6"></polyline></svg>
                          </td>
                          <td class="p-3 text-text-primary font-mono text-sm">{{ instance.jobKey }}</td>
                          <td class="p-3 text-text-primary font-mono text-sm">{{ instance.cronExpression }}</td>
                          <td class="p-3">
                            <StatusBadge :type="instance.enable ? 'active' : 'inactive'" />
                          </td>
                          <td class="p-3 flex items-center gap-3">
                            <button @click.stop="openEditInstanceModal(instance)" :disabled="isProcessing" class="text-yellow-600 dark:text-yellow-400 hover:underline text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                              {{ $t('edit') }}
                            </button>
                            <button v-if="instance.enable" @click.stop="promptStopInstance(instance)" :disabled="isProcessing" class="text-red-600 dark:text-red-400 hover:underline text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                              {{ $t('stop') }}
                            </button>
                            <button v-else @click.stop="promptStartInstance(instance)" :disabled="isProcessing" class="text-green-600 dark:text-green-400 hover:underline text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                              {{ $t('start') }}
                            </button>
                            <button @click.stop="promptDeleteInstance(instance)" :disabled="isProcessing" class="text-red-600 dark:text-red-400 hover:underline text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                              {{ $t('delete') }}
                            </button>
                          </td>
                        </tr>
                        <tr v-if="expandedInstanceId === instance.id" class="bg-background">
                          <td colspan="5" class="p-0">
                            <JobInstanceDetails :instance="instance" />
                          </td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                  <Pagination
                    v-model:currentPage="instancesCurrentPage"
                    :total-pages="instancesTotalPages"
                    class="mt-4"
                  />
                </div>
                <div v-else class="p-4 text-center text-text-secondary italic">
                  {{ $t('no_instances_for_job') }}
                </div>
              </div>
              <div v-else class="p-4 text-center text-text-secondary italic">
                {{ $t('select_job_to_view_instances') }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Job Logs Tab Content -->
      <div v-if="selectedTab === 'job-logs'">
        <!-- Job Logs Card -->
        <div class="relative bg-card rounded-lg shadow-md border border-border-color overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:border-primary hover:scale-[1.005]">
          <LoadingOverlay :isLoading="logsLoading" :message="$t('loading_job_log_data')" />
          <div class="p-6">
            <div class="flex items-center gap-3" :class="{'mb-4': isLogsOpen}">
              <h3 class="text-xl font-semibold text-text-primary">{{ $t('job_logs') }}</h3>
              <button @click="isLogsOpen = !isLogsOpen" class="text-text-secondary hover:text-text-primary p-1 rounded-full hover:bg-primary/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-300" :class="{'rotate-180': !isLogsOpen}"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
            </div>
            <div v-if="isLogsOpen" class="overflow-x-auto max-h-96 mt-4" :class="{'min-h-[200px]': logsLoading}">
              <div class="mb-4 flex gap-4 items-center">
                <label for="project-select-logs" class="text-text-primary font-medium">{{ $t('select_project_colon') }}</label>
                <select
                  id="project-select-logs"
                  v-model="selectedProjectForLogs"
                  class="px-4 py-2 border border-border-color rounded-lg bg-input-bg text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 flex-grow"
                >
                  <option :value="null">{{ $t('all_projects') }}</option>
                  <option v-for="proj in allProjects" :key="proj.id" :value="proj">
                    {{ proj.name }} ({{ getJobCountForProject(proj.id) }})
                  </option>
                </select>
              </div>
              <div class="mb-4 flex gap-4 items-center" v-if="selectedProjectForLogs">
                <label for="job-select-logs" class="text-text-primary font-medium">{{ $t('select_job_colon') }}</label>
                <select
                  id="job-select-logs"
                  v-model="selectedJobForLogs"
                  class="px-4 py-2 border border-border-color rounded-lg bg-input-bg text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 flex-grow"
                >
                  <option :value="null">{{ $t('all_jobs') }}</option>
                  <option v-for="job in jobsInSelectedProjectForLogs" :key="job.id" :value="job">
                    {{ job.url }} ({{ job.method }}) ({{ getLogCountForJob(job.id) }})
                  </option>
                </select>
              </div>
              <div v-if="selectedJobForLogs">
                <div class="mb-4 flex gap-4">
                  <input
                    type="text"
                    v-model="logsFilterJobKey"
                    :placeholder="$t('filter_by_job_key')"
                    class="flex-grow px-4 py-2 border border-border-color rounded-lg bg-input-bg text-text-primary placeholder-text-secondary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  />
                  <select
                    v-model="logsFilterStatus"
                    class="px-4 py-2 border border-border-color rounded-lg bg-input-bg text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  >
                    <option value="">{{ $t('all_statuses') }}</option>
                    <option value="success">{{ $t('success') }} ({{ successLogsCount }})</option>
                    <option value="failure">{{ $t('failure') }} ({{ failureLogsCount }})</option>
                  </select>
                </div>
                <div v-if="selectedJobForLogs.jobLogs.length > 0">
                  <table class="w-full text-left">
                    <thead class="border-b border-border-color sticky top-0 bg-card">
                      <tr>
                        <th class="p-3 text-sm font-semibold text-text-secondary uppercase">{{ $t('job_key') }}</th>
                        <th class="p-3 text-sm font-semibold text-text-secondary uppercase">{{ $t('start_date') }}</th>
                        <th class="p-3 text-sm font-semibold text-text-secondary uppercase">{{ $t('end_date') }}</th>
                        <th class="p-3 text-sm font-semibold text-text-secondary uppercase">{{ $t('status') }}</th>
                        <th class="p-3 text-sm font-semibold text-text-secondary uppercase">{{ $t('message') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="log in paginatedLogs" :key="log.id" class="border-b border-border-color transition-colors hover:bg-hover-light dark:hover:bg-hover-dark">
                        <td class="p-3 text-text-primary font-mono text-sm">{{ log.jobKey }}</td>
                        <td class="p-3 text-text-primary text-sm">{{ new Date(log.startDate).toLocaleString() }}</td>
                        <td class="p-3 text-text-primary text-sm">{{ new Date(log.endDate).toLocaleString() }}</td>
                        <td class="p-3">
                          <StatusBadge :type="log.success ? 'success' : 'failure'" />
                        </td>
                        <td class="p-3 text-text-secondary text-xs font-mono truncate max-w-xs" :title="log.failureMessage">{{ log.failureMessage || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
                  <Pagination
                    v-model:currentPage="logsCurrentPage"
                    :total-pages="logsTotalPages"
                    class="mt-4"
                  />
                </div>
                <div v-else class="p-4 text-center text-text-secondary italic">
                  {{ $t('no_logs_for_job') }}
                </div>
              </div>
              <div v-else class="p-4 text-center text-text-secondary italic">
                {{ $t('select_job_to_view_logs') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Job Modal -->
    <CreateJobModal 
      v-if="showJobModal" 
      :job-to-edit="jobToEdit"
      @close="closeJobModal"
      @create-job="handleJobCreated"
      @update-job="handleJobUpdated"
      :is-processing="isProcessing"
    />

    <!-- Edit Instance Modal -->
    <EditInstanceModal
      v-if="showEditInstanceModal"
      :instance-to-edit="instanceToEdit"
      @close="closeEditInstanceModal"
      @update-instance="handleInstanceUpdated"
      :is-processing="isProcessing"
    />

    <!-- Confirmation Modal -->
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

    <NotificationToast
      :show="notification.show"
      :type="notification.type"
      :message="notification.message"
      @close="hideNotification"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import StatusBadge from '~/components/StatusBadge.vue'
import CreateJobModal from '~/components/CreateJobModal.vue'
import EditInstanceModal from '~/components/EditInstanceModal.vue'
import JobInstanceDetails from '~/components/JobInstanceDetails.vue'
import ConfirmationModal from '~/components/ConfirmationModal.vue'
import Pagination from '~/components/Pagination.vue'
import LoadingOverlay from '~/components/LoadingOverlay.vue'
import NotificationToast from '~/components/NotificationToast.vue'
import { useProjects } from '~/composables/useProjects'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { projects: allProjects } = useProjects()

const showJobModal = ref(false)
const jobToEdit = ref(null)
const showEditInstanceModal = ref(false)
const instanceToEdit = ref(null)

const isJobsOpen = ref(true)
const isInstancesOpen = ref(true)
const isLogsOpen = ref(true)

const expandedInstanceId = ref(null)
const selectedInstance = ref(null)

const showConfirmationModal = ref(false)
const confirmationConfig = ref({
  title: '',
  message: '',
  confirmText: '',
  confirmButtonClass: '',
  onConfirm: () => {},
  targetId: null // To track which item is being confirmed for delete/start/stop
})

// Global processing state for all CRUD operations
const isProcessing = ref(false)
const isDeletingJobId = ref(null) // Specific job row loading for delete
const isDeletingInstanceId = ref(null) // Specific instance row loading for delete

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

// Loading states for each section
const jobsLoading = ref(false) // Initial state for jobs
const instancesLoading = ref(false) // Initial state for instances
const logsLoading = ref(false) // Initial state for logs

// Loading messages - now directly using i18n in template
const jobsMessage = ref('')
const instancesMessage = ref('')
const logsMessage = ref('')

// Tab selection state
const selectedTab = ref('jobs')

// Proje seçimi state'i
const selectedProject = ref(allProjects.value[0] || null)

// Project and Job selection for instances and logs tabs
const selectedProjectForInstances = ref(null)
const selectedJobForInstances = ref(null)

const selectedProjectForLogs = ref(null)
const selectedJobForLogs = ref(null)

// Filter states
const jobsFilterUrl = ref('')
const jobsFilterStatus = ref('')

const instancesFilterKey = ref('')
const instancesFilterStatus = ref('')

const logsFilterJobKey = ref('')
const logsFilterStatus = ref('')

// Pagination states
const jobsCurrentPage = ref(1)
const jobsPerPage = 3
const instancesCurrentPage = ref(1)
const instancesPerPage = 5
const logsCurrentPage = ref(1)
const logsPerPage = 5 

// Dummy Job verileri, şimdi projectId içeriyor
const allJobsData = ref([
  {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    projectId: 'proj1', // Ana Proje
    method: 'POST',
    url: 'https://api.example.com/v1/webhooks/orders',
    enable: true,
    jobInstances: [
      { id: 'i1', jobId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', cronExpression: '0 0 * * *', jobKey: 'daily-order-sync', enable: true, headers: {'X-API-Version': '2', 'Content-Type': 'application/json'}, queryParams: {'source': 'cron'}, requestBody: {'type': 'full_sync', 'since_id': '12345'} },
      { id: 'i2', jobId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', cronExpression: '0 12 * * *', jobKey: 'daily-order-sync-noon', enable: false, headers: {}, queryParams: {}, requestBody: {} },
      { id: 'i5', jobId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', cronExpression: '0 1 * * *', jobKey: 'hourly-sync', enable: true, headers: {}, queryParams: {}, requestBody: {} },
      { id: 'i6', jobId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', cronExpression: '0 2 * * *', jobKey: 'hourly-sync-2', enable: true, headers: {}, queryParams: {}, requestBody: {} },
      { id: 'i7', jobId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', cronExpression: '0 3 * * *', jobKey: 'hourly-sync-3', enable: false, headers: {}, queryParams: {}, requestBody: {} },
      { id: 'i8', jobId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', cronExpression: '0 4 * * *', jobKey: 'hourly-sync-4', enable: true, headers: {}, queryParams: {}, requestBody: {} },
    ],
    jobLogs: [
      { id: 'l1', jobId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', jobKey: 'daily-order-sync', startDate: '2023-10-27T00:00:00Z', endDate: '2023-10-27T00:01:15Z', success: true, failureMessage: null },
      { id: 'l2', jobId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', jobKey: 'daily-order-sync', startDate: '2023-10-26T00:00:00Z', endDate: '2023-10-26T00:01:20Z', success: true, failureMessage: null },
      { id: 'l3', jobId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', jobKey: 'daily-order-sync', startDate: '2023-10-25T00:00:00Z', endDate: '2023-10-25T00:00:05Z', success: false, failureMessage: 'API endpoint returned 503 Service Unavailable' },
      { id: 'l6', jobId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', jobKey: 'daily-order-sync', startDate: '2023-10-24T00:00:00Z', endDate: '2023-10-24T00:01:10Z', success: true, failureMessage: null },
      { id: 'l7', jobId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', jobKey: 'daily-order-sync', startDate: '2023-10-23T00:00:00Z', endDate: '2023-10-23T00:01:05Z', success: true, failureMessage: null },
      { id: 'l8', jobId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', jobKey: 'daily-order-sync', startDate: '2023-10-22T00:00:00Z', endDate: '2023-10-22T00:00:55Z', success: false, failureMessage: 'Network timeout' },
    ]
  },
  {
    id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
    projectId: 'proj1', // Ana Proje
    method: 'GET',
    url: 'https://api.example.com/v1/health-check',
    enable: true,
    jobInstances: [
      { id: 'i3', jobId: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1', cronExpression: '*/5 * * * *', jobKey: 'health-check-ping', enable: true, headers: {}, queryParams: { 'source': 'scheduler', 'verbose': 'true' }, requestBody: {} },
      { id: 'i9', jobId: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1', cronExpression: '*/10 * * * *', jobKey: 'health-check-ping-2', enable: true, headers: {}, queryParams: {}, requestBody: {} },
    ],
    jobLogs: [
       { id: 'l4', jobId: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1', jobKey: 'health-check-ping', startDate: '2023-10-27T10:05:00Z', endDate: '2023-10-27T10:05:01Z', success: true, failureMessage: null },
       { id: 'l5', jobId: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1', jobKey: 'health-check-ping', startDate: '2023-10-27T10:00:00Z', endDate: '2023-10-27T10:00:01Z', success: true, failureMessage: null },
       { id: 'l9', jobId: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1', jobKey: 'health-check-ping', startDate: '2023-10-27T09:55:00Z', endDate: '2023-10-27T09:55:01Z', success: true, failureMessage: null },
    ]
  },
  {
    id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef12',
    projectId: 'proj2', // Test Projesi
    method: 'PUT',
    url: 'https://api.example.com/v1/inventory/reconcile',
    enable: false,
    jobInstances: [
       { id: 'i4', jobId: 'c3d4e5f6-a7b8-9012-3456-7890abcdef12', cronExpression: '0 3 * * 1', jobKey: 'weekly-inventory-reconciliation', enable: false, headers: {}, queryParams: {}, requestBody: {} },
    ],
    jobLogs: []
  },
  {
    id: 'd4e5f6a7-b8c9-0123-4567-890abcdef123',
    projectId: 'proj1', // Ana Proje
    method: 'DELETE',
    url: 'https://api.example.com/v1/old-data/cleanup',
    enable: true,
    jobInstances: [
      { id: 'i10', jobId: 'd4e5f6a7-b8c9-0123-4567-890abcdef123', cronExpression: '0 0 1 * *', jobKey: 'monthly-cleanup', enable: true, headers: {}, queryParams: {}, requestBody: {} },
    ],
    jobLogs: [
      { id: 'l10', jobId: 'd4e5f6a7-b8c9-0123-4567-890abcdef123', jobKey: 'monthly-cleanup', startDate: '2023-10-01T00:00:00Z', endDate: '2023-10-01T00:02:30Z', success: true, failureMessage: null },
    ]
  },
  {
    id: 'e5f6a7b8-c9d0-1234-5678-90abcdef1234',
    projectId: 'proj2', // Test Projesi
    method: 'PATCH',
    url: 'https://api.example.com/v1/user-profiles/update',
    enable: false,
    jobInstances: [
      { id: 'i11', jobId: 'e5f6a7b8-c9d0-1234-5678-90abcdef1234', cronExpression: '0 0 * * 0', jobKey: 'weekly-profile-update', enable: false, headers: {}, queryParams: {}, requestBody: {} },
    ],
    jobLogs: []
  }
])

const selectedJob = ref(null) // Başlangıçta hiçbir job seçili değil

// Filtered Jobs
const filteredJobs = computed(() => {
  if (!selectedProject.value) return [];
  let filtered = allJobsData.value.filter(job => job.projectId === selectedProject.value.id);

  if (jobsFilterUrl.value) {
    filtered = filtered.filter(job =>
      job.url.toLowerCase().includes(jobsFilterUrl.value.toLowerCase())
    );
  }
  if (jobsFilterStatus.value) {
    const status = jobsFilterStatus.value === 'active';
    filtered = filtered.filter(job => job.enable === status);
  }
  return filtered;
});

// Computed properties for Jobs pagination
const jobsTotalPages = computed(() => Math.ceil(filteredJobs.value.length / jobsPerPage))
const paginatedJobs = computed(() => {
  const start = (jobsCurrentPage.value - 1) * jobsPerPage
  const end = start + jobsPerPage
  return filteredJobs.value.slice(start, end)
})

// Counts for Jobs filter
const activeJobsCount = computed(() => {
  if (!selectedProject.value) return 0;
  return allJobsData.value.filter(job => job.projectId === selectedProject.value.id && job.enable).length;
});

const inactiveJobsCount = computed(() => {
  if (!selectedProject.value) return 0;
  return allJobsData.value.filter(job => job.projectId === selectedProject.value.id && !job.enable).length;
});

// Computed property for jobs filtered by selected project for instances tab
const jobsInSelectedProjectForInstances = computed(() => {
  if (!selectedProjectForInstances.value) return []; // If no project selected, show no jobs
  return allJobsData.value.filter(job => job.projectId === selectedProjectForInstances.value.id);
});

// Filtered Instances
const filteredInstances = computed(() => {
  if (!selectedJobForInstances.value) return [];
  let filtered = selectedJobForInstances.value.jobInstances;
  if (instancesFilterKey.value) {
    filtered = filtered.filter(instance =>
      instance.jobKey.toLowerCase().includes(instancesFilterKey.value.toLowerCase())
    );
  }
  if (instancesFilterStatus.value) {
    const status = instancesFilterStatus.value === 'active';
    filtered = filtered.filter(instance => instance.enable === status);
  }
  return filtered;
});

// Computed properties for Job Instances pagination
const instancesTotalPages = computed(() => 
  selectedJobForInstances.value ? Math.ceil(filteredInstances.value.length / instancesPerPage) : 0
)
const paginatedInstances = computed(() => {
  if (!selectedJobForInstances.value) return []
  const start = (instancesCurrentPage.value - 1) * instancesPerPage
  const end = start + instancesPerPage
  return filteredInstances.value.slice(start, end)
})

// Counts for Job Instances filter
const activeInstancesCount = computed(() => {
  if (!selectedJobForInstances.value) return 0;
  return selectedJobForInstances.value.jobInstances.filter(i => i.enable).length;
});

const inactiveInstancesCount = computed(() => {
  if (!selectedJobForInstances.value) return 0;
  return selectedJobForInstances.value.jobInstances.filter(i => !i.enable).length;
});

// Computed property for jobs filtered by selected project for logs tab
const jobsInSelectedProjectForLogs = computed(() => {
  if (!selectedProjectForLogs.value) return []; // If no project selected, show no jobs
  return allJobsData.value.filter(job => job.projectId === selectedProjectForLogs.value.id);
});

// Filtered Logs
const filteredLogs = computed(() => {
  if (!selectedJobForLogs.value) return [];
  let filtered = selectedJobForLogs.value.jobLogs;
  if (logsFilterJobKey.value) { // Job Key'e göre filtreleme
    filtered = filtered.filter(log =>
      log.jobKey && log.jobKey.toLowerCase().includes(logsFilterJobKey.value.toLowerCase())
    );
  }
  if (logsFilterStatus.value) {
    const status = logsFilterStatus.value === 'success';
    filtered = filtered.filter(log => log.success === status);
  }
  return filtered;
});

// Computed properties for Job Logs pagination
const logsTotalPages = computed(() => 
  selectedJobForLogs.value ? Math.ceil(filteredLogs.value.length / logsPerPage) : 0
)
const paginatedLogs = computed(() => {
  if (!selectedJobForLogs.value) return []
  const start = (logsCurrentPage.value - 1) * logsPerPage
  const end = start + logsPerPage
  return filteredLogs.value.slice(start, end)
})

// Counts for Job Logs filter
const successLogsCount = computed(() => {
  if (!selectedJobForLogs.value) return 0;
  return selectedJobForLogs.value.jobLogs.filter(log => log.success).length;
});

const failureLogsCount = computed(() => {
  if (!selectedJobForLogs.value) return 0;
  return selectedJobForLogs.value.jobLogs.filter(log => !log.success).length;
});

// Helper functions for counts in dropdowns
const getJobCountForProject = (projectId) => {
  return allJobsData.value.filter(job => job.projectId === projectId).length;
};

const getInstanceCountForJob = (jobId) => {
  const job = allJobsData.value.find(j => j.id === jobId);
  return job ? job.jobInstances.length : 0;
};

const getLogCountForJob = (jobId) => {
  const job = allJobsData.value.find(j => j.id === jobId);
  return job ? job.jobLogs.length : 0;
};


const selectJob = (job) => {
  selectedJob.value = job
  // When a job is selected in the 'Jobs' tab, also set it for instances and logs tabs
  selectedJobForInstances.value = job
  selectedJobForLogs.value = job
  isInstancesOpen.value = true
  isLogsOpen.value = true
  expandedInstanceId.value = null
  selectedInstance.value = null; // Job değiştiğinde seçili instance'ı sıfırla
  // Reset pagination and filters for instances and logs when a new job is selected
  instancesCurrentPage.value = 1
  logsCurrentPage.value = 1
  instancesFilterKey.value = ''
  instancesFilterStatus.value = ''
  logsFilterJobKey.value = '' // Job Key filtresini sıfırla
  logsFilterStatus.value = ''
}

const toggleInstanceDetails = (instance) => { // Parametre olarak instance objesini al
  if (expandedInstanceId.value === instance.id) {
    expandedInstanceId.value = null
    selectedInstance.value = null // Kapatıldığında seçimi kaldır
  } else {
    expandedInstanceId.value = instance.id
    selectedInstance.value = instance // Seçili instance'ı ayarla
  }
}

const getMethodClass = (method) => {
  switch (method.toUpperCase()) {
    case 'GET': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
    case 'POST': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
    case 'PUT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
    case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
    case 'PATCH': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
    default: return 'bg-gray-100 text-gray-100 dark:bg-gray-700/50 dark:text-gray-300'
  }
}

const openCreateModal = () => {
  jobToEdit.value = null
  showJobModal.value = true
}

const openEditModal = (job) => {
  jobToEdit.value = job
  showJobModal.value = true
}

const closeJobModal = () => {
  showJobModal.value = false
  jobToEdit.value = null
}

const handleJobCreated = async (newJobData) => {
  isProcessing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    const newJobId = uuidv4();
    const newJob = {
      ...newJobData,
      id: newJobId,
      projectId: selectedProject.value ? selectedProject.value.id : null, // Assign to selected project
      jobInstances: newJobData.jobInstances.map(instance => ({
        ...instance,
        id: uuidv4(),
        jobId: newJobId,
      })),
      jobLogs: [],
    };
    allJobsData.value.unshift(newJob); // Add to allJobsData
    showNotification('success', t('job_created_success'));
    closeJobModal();
    // Reset jobs pagination to first page to see the new job
    jobsCurrentPage.value = 1;
  } catch (error) {
    console.error('Job oluşturma hatası:', error);
    showNotification('error', t('job_created_error'));
  } finally {
    isProcessing.value = false;
  }
};

const handleJobUpdated = async (updatedJobData) => {
  isProcessing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    const jobIndex = allJobsData.value.findIndex(j => j.id === updatedJobData.id) // Find in allJobsData
    if (jobIndex !== -1) {
      const existingLogs = allJobsData.value[jobIndex].jobLogs;
      allJobsData.value[jobIndex] = { ...updatedJobData, jobLogs: existingLogs };
      
      if (selectedJob.value && selectedJob.value.id === updatedJobData.id) {
        selectedJob.value = allJobsData.value[jobIndex];
      }
      // Also update the selected job in other tabs if it's the same job
      if (selectedJobForInstances.value && selectedJobForInstances.value.id === updatedJobData.id) {
        selectedJobForInstances.value = allJobsData.value[jobIndex];
      }
      if (selectedJobForLogs.value && selectedJobForLogs.value.id === updatedJobData.id) {
        selectedJobForLogs.value = allJobsData.value[jobIndex];
      }
      showNotification('success', t('job_updated_success'));
    } else {
      showNotification('error', t('job_not_found_update'));
    }
    closeJobModal();
  } catch (error) {
    console.error('Job güncelleme hatası:', error);
    showNotification('error', t('job_updated_error'));
  } finally {
    isProcessing.value = false;
  }
};

const openEditInstanceModal = (instance) => {
  instanceToEdit.value = instance
  showEditInstanceModal.value = true
}

const closeEditInstanceModal = () => {
  showEditInstanceModal.value = false
  instanceToEdit.value = null
}

const handleInstanceUpdated = async (updatedInstance) => {
  isProcessing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    // Use selectedJobForInstances to find the parent job
    if (!selectedJobForInstances.value) return;
    const job = allJobsData.value.find(j => j.id === selectedJobForInstances.value.id); // Find in allJobsData
    if (job) {
      const instanceIndex = job.jobInstances.findIndex(i => i.id === updatedInstance.id);
      if (instanceIndex !== -1) {
        job.jobInstances[instanceIndex] = { ...job.jobInstances[instanceIndex], ...updatedInstance };
        showNotification('success', t('job_instance_updated_success'));
      } else {
        showNotification('error', t('job_instance_not_found_update'));
      }
    }
    closeEditInstanceModal();
  } catch (error) {
    console.error('Job Instance güncelleme hatası:', error);
    showNotification('error', t('job_instance_updated_error'));
  } finally {
    isProcessing.value = false;
  }
};

const toggleInstanceStatus = async (instance, newStatus) => {
  isProcessing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 700)) // Simulate API call
    // Use selectedJobForInstances to find the parent job
    if (!selectedJobForInstances.value) return;
    const job = allJobsData.value.find(j => j.id === selectedJobForInstances.value.id); // Find in allJobsData
    if (job) {
      const instanceToUpdate = job.jobInstances.find(i => i.id === instance.id);
      if (instanceToUpdate) {
        instanceToUpdate.enable = newStatus;
        showNotification('success', newStatus ? t('job_instance_started_success') : t('job_instance_stopped_success'));
      } else {
        showNotification('error', t('job_instance_not_found'));
      }
    }
  } catch (error) {
    console.error('Job Instance durum güncelleme hatası:', error);
    showNotification('error', newStatus ? t('job_instance_start_error') : t('job_instance_stop_error'));
  } finally {
    isProcessing.value = false;
  }
};

const promptStartInstance = (instance) => {
  confirmationConfig.value = {
    title: t('confirm_start_instance_title'),
    message: t('confirm_start_instance_message', { jobKey: instance.jobKey }),
    confirmText: t('start'),
    confirmButtonClass: 'bg-green-600 hover:bg-green-700',
    onConfirm: () => toggleInstanceStatus(instance, true),
    targetId: instance.id
  };
  showConfirmationModal.value = true;
};

const promptStopInstance = (instance) => {
  confirmationConfig.value = {
    title: t('confirm_stop_instance_title'),
    message: t('confirm_stop_instance_message', { jobKey: instance.jobKey }),
    confirmText: t('stop'),
    confirmButtonClass: 'bg-red-600 hover:bg-red-700',
    onConfirm: () => toggleInstanceStatus(instance, false),
    targetId: instance.id
  };
  showConfirmationModal.value = true;
};

const promptStopAllInstances = (job) => {
  confirmationConfig.value = {
    title: t('confirm_stop_all_instances_title'),
    message: t('confirm_stop_all_instances_message', { url: job.url }),
    confirmText: t('stop_all'),
    confirmButtonClass: 'bg-red-600 hover:bg-red-700',
    onConfirm: () => stopAllInstances(job),
    targetId: job.id
  };
  showConfirmationModal.value = true;
};

const stopAllInstances = async (job) => {
  isProcessing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
    const targetJob = allJobsData.value.find(j => j.id === job.id); // Find in allJobsData
    if (targetJob) {
      targetJob.jobInstances.forEach(instance => {
        instance.enable = false;
      });
      showNotification('success', t('job_instance_stopped_success', { url: job.url }));
    } else {
      showNotification('error', t('job_not_found'));
    }
  } catch (error) {
    console.error('Tüm instance\'ları durdurma hatası:', error);
    showNotification('error', t('job_instance_stop_error'));
  } finally {
    isProcessing.value = false;
  }
};

const promptStartAllInstances = (job) => {
  confirmationConfig.value = {
    title: t('confirm_start_all_instances_title'),
    message: t('confirm_start_all_instances_message', { url: job.url }),
    confirmText: t('start_all'),
    confirmButtonClass: 'bg-green-600 hover:bg-green-700',
    onConfirm: () => startAllInstances(job),
    targetId: job.id
  };
  showConfirmationModal.value = true;
};

const startAllInstances = async (job) => {
  isProcessing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
    const targetJob = allJobsData.value.find(j => j.id === job.id);
    if (targetJob) {
      targetJob.jobInstances.forEach(instance => {
        instance.enable = true;
      });
      showNotification('success', t('job_instance_started_success', { url: job.url }));
    } else {
      showNotification('error', t('job_not_found'));
    }
  } catch (error) {
    console.error('Tüm instance\'ları başlatma hatası:', error);
    showNotification('error', t('job_instance_start_error'));
  } finally {
    isProcessing.value = false;
  }
};

const promptDeleteJob = (job) => {
  confirmationConfig.value = {
    title: t('confirm_delete_job_title'),
    message: t('confirm_delete_job_message', { url: job.url }),
    confirmText: t('delete'),
    confirmButtonClass: 'bg-red-600 hover:bg-red-700',
    onConfirm: () => deleteJob(job.id),
    targetId: job.id
  };
  showConfirmationModal.value = true;
};

const deleteJob = async (jobId) => {
  isProcessing.value = true
  isDeletingJobId.value = jobId // Set loading for specific row
  try {
    await new Promise(resolve => setTimeout(resolve, 700)) // Simulate API call
    const initialLength = allJobsData.value.length;
    allJobsData.value = allJobsData.value.filter(j => j.id !== jobId); // Delete from allJobsData
    if (allJobsData.value.length < initialLength) {
      showNotification('success', t('job_deleted_success'));
    } else {
      showNotification('error', t('job_not_found_delete'));
    }

    if (selectedJob.value && selectedJob.value.id === jobId) {
      selectedJob.value = null; // Clear selection if deleted job was selected
    }
    // Also clear selected jobs in other tabs if the deleted job was selected
    if (selectedJobForInstances.value && selectedJobForInstances.value.id === jobId) {
      selectedJobForInstances.value = null;
    }
    if (selectedJobForLogs.value && selectedJobForLogs.value.id === jobId) {
      selectedJobForLogs.value = null;
    }
  } catch (error) {
    console.error('Job silme hatası:', error);
    showNotification('error', t('job_deleted_error'));
  } finally {
    isProcessing.value = false;
    isDeletingJobId.value = null;
  }
};

const promptDeleteInstance = (instance) => {
  confirmationConfig.value = {
    title: t('confirm_delete_instance_title'),
    message: t('confirm_delete_instance_message', { jobKey: instance.jobKey }),
    confirmText: t('delete'),
    confirmButtonClass: 'bg-red-600 hover:bg-red-700',
    onConfirm: () => deleteInstance(instance.jobId, instance.id),
    targetId: instance.id
  };
  showConfirmationModal.value = true;
};

const deleteInstance = async (jobId, instanceId) => {
  isProcessing.value = true
  isDeletingInstanceId.value = instanceId // Set loading for specific row
  try {
    await new Promise(resolve => setTimeout(resolve, 700)) // Simulate API call
    const job = allJobsData.value.find(j => j.id === jobId); // Find in allJobsData
    if (job) {
      const initialLength = job.jobInstances.length;
      job.jobInstances = job.jobInstances.filter(i => i.id !== instanceId);
      if (job.jobInstances.length < initialLength) {
        showNotification('success', t('job_instance_deleted_success'));
      } else {
        showNotification('error', t('job_instance_not_found_delete'));
      }

      if (selectedInstance.value && selectedInstance.value.id === instanceId) {
        selectedInstance.value = null; // Clear selection if deleted instance was selected
        expandedInstanceId.value = null; // Close details
      }
    } else {
      showNotification('error', t('related_job_not_found'));
    }
  } catch (error) {
    console.error('Job Instance silme hatası:', error);
    showNotification('error', t('job_instance_deleted_error'));
  } finally {
    isProcessing.value = false;
    isDeletingInstanceId.value = null;
  }
};

const closeConfirmationModal = () => {
  showConfirmationModal.value = false;
  confirmationConfig.value.targetId = null; // Clear targetId
};

const handleConfirmation = () => {
  if (confirmationConfig.value.onConfirm) {
    confirmationConfig.value.onConfirm();
  }
  closeConfirmationModal();
};

// Simulate initial data loading for Jobs tab
onMounted(() => {
  jobsLoading.value = true;
  setTimeout(() => {
    jobsLoading.value = false;
  }, 1500);
});

// Watchers to reset pagination when filters change
watch([jobsFilterUrl, jobsFilterStatus], () => {
  jobsCurrentPage.value = 1;
});

watch([instancesFilterKey, instancesFilterStatus], () => {
  instancesCurrentPage.value = 1;
});

watch([logsFilterJobKey, logsFilterStatus], () => {
  logsCurrentPage.value = 1;
});

// Watcher for selectedProject to trigger loading for Jobs tab
watch(selectedProject, (newProject, oldProject) => {
  if (newProject && newProject.id !== (oldProject ? oldProject.id : null)) {
    jobsLoading.value = true;
    setTimeout(() => {
      jobsLoading.value = false;
    }, 1000); // Simulate loading for project change
    selectedJob.value = null; // Proje değiştiğinde seçili job'ı sıfırla
    selectedJobForInstances.value = null; // Reset job selection for instances tab
    selectedJobForLogs.value = null; // Reset job selection for logs tab
    jobsCurrentPage.value = 1;
    jobsFilterUrl.value = '';
    jobsFilterStatus.value = '';
    instancesCurrentPage.value = 1;
    instancesFilterKey.value = '';
    instancesFilterStatus.value = '';
    logsCurrentPage.value = 1;
    logsFilterJobKey.value = '';
    logsFilterStatus.value = '';
  }
});

// Watchers for project selection in instances and logs tabs to reset job selection and filters
watch(selectedProjectForInstances, () => {
  selectedJobForInstances.value = null; // Proje değiştiğinde job seçimini sıfırla
  instancesCurrentPage.value = 1;
  instancesFilterKey.value = '';
  instancesFilterStatus.value = '';
});

watch(selectedProjectForLogs, () => {
  selectedJobForLogs.value = null; // Proje değiştiğinde job seçimini sıfırla
  logsCurrentPage.value = 1;
  logsFilterJobKey.value = '';
  logsFilterStatus.value = '';
});

// Watchers for job selection in instances and logs tabs to trigger loading
watch(selectedJobForInstances, (newJob, oldJob) => {
  if (newJob) { // Only show loading if a job is selected (not null)
    instancesLoading.value = true;
    setTimeout(() => {
      instancesLoading.value = false;
    }, 1000); // Simulate loading for instance data
  }
  instancesCurrentPage.value = 1;
  instancesFilterKey.value = '';
  instancesFilterStatus.value = '';
});

watch(selectedJobForLogs, (newJob, oldJob) => {
  if (newJob) { // Only show loading if a job is selected (not null)
    logsLoading.value = true;
    setTimeout(() => {
      logsLoading.value = false;
    }, 1000); // Simulate loading for log data
  }
  logsCurrentPage.value = 1;
  logsFilterJobKey.value = '';
  logsFilterStatus.value = '';
});
</script>
