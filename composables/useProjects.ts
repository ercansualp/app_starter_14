import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'

// Bu composable, proje verilerini uygulama genelinde yönetmek için bir "state management" görevi görür.
// Gerçek bir uygulamada bu veriler API'den gelir ve güncellenir.

const getInitialProjects = () => [
  {
    id: 'proj1',
    name: 'Ana Proje',
    isDefaultProject: true,
    ownerId: 'user123',
    isActive: true,
    logo: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    apiKeys: [
      { id: uuidv4(), name: 'Default API Key', value: 'some_secret_value_123', expireDate: '2025-12-31', isActive: true },
      { id: uuidv4(), name: 'Test Key', value: 'another_secret_value_456', expireDate: '2024-06-30', isActive: false }
    ],
    users: [
        { id: 'user-1', firstName: 'Ahmet', lastName: 'Yılmaz', email: 'ahmet.yilmaz@example.com', role: 'Owner' }
    ],
    invitations: [
        { id: uuidv4(), email: 'davetli@example.com', roleName: 'Developer', status: 'Pending', expireDate: '2024-12-31' }
    ],
    jwtSettings: {
      issuer: 'https://yourdomain.com',
      secret: 'supersecretjwtkeythatisverylongandsecure',
      lifetimeMinutes: 60,
      refreshTokenExpiryDays: 7,
      audience: 'your_app_audience'
    },
    credits: 1500 // Yeni eklenen kredi bilgisi
  },
  {
    id: 'proj2',
    name: 'Test Projesi',
    isDefaultProject: false,
    ownerId: 'user123',
    isActive: false,
    logo: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    apiKeys: [],
    users: [],
    invitations: [],
    jwtSettings: {
      issuer: '',
      secret: '',
      lifetimeMinutes: 0,
      refreshTokenExpiryDays: 0,
      audience: ''
    },
    credits: 50 // Yeni eklenen kredi bilgisi
  }
];

const projects = ref(getInitialProjects());

// Global loading and notification states for project operations
const isProcessing = ref(false);
const notification = ref({
  show: false,
  type: '', // 'success', 'error', 'info'
  message: ''
});

const showNotification = (type, message) => {
  notification.value = { show: true, type, message };
  setTimeout(() => {
    hideNotification();
  }, 3000); // Hide after 3 seconds
};

const hideNotification = () => {
  notification.value = { show: false, type: '', message: '' };
};

export const useProjects = () => {

  const getProjectById = (id) => {
    return projects.value.find(p => p.id === id);
  }

  const addProject = async (projectData) => {
    isProcessing.value = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      const newProject = {
        ...projectData,
        id: uuidv4(),
        ownerId: 'current_user_id', // Placeholder
        apiKeys: [],
        users: [],
        invitations: [],
        jwtSettings: projectData.jwtSettings || { issuer: '', secret: '', lifetimeMinutes: 0, refreshTokenExpiryDays: 0, audience: '' },
        credits: projectData.credits || 0
      };
      projects.value.unshift(newProject);
      showNotification('success', 'Proje başarıyla oluşturuldu!');
      return newProject.id; // Return new project ID for redirection
    } catch (error) {
      console.error('Proje ekleme hatası:', error);
      showNotification('error', 'Proje eklenirken bir hata oluştu.');
      throw error;
    } finally {
      isProcessing.value = false;
    }
  }

  const updateProject = async (updatedProjectData) => {
    isProcessing.value = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      const index = projects.value.findIndex(p => p.id === updatedProjectData.id);
      if (index !== -1) {
        projects.value[index] = { ...projects.value[index], ...updatedProjectData };
        showNotification('success', 'Proje başarıyla güncellendi!');
      } else {
        showNotification('error', 'Proje bulunamadı.');
      }
    } catch (error) {
      console.error('Proje güncelleme hatası:', error);
      showNotification('error', 'Proje güncellenirken bir hata oluştu.');
      throw error;
    } finally {
      isProcessing.value = false;
    }
  }
  
  const deleteApiKeyFromProject = async (projectId, apiKeyId) => {
    isProcessing.value = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API call
      const project = getProjectById(projectId);
      if (project) {
        project.apiKeys = project.apiKeys.filter(key => key.id !== apiKeyId);
        showNotification('success', 'API Anahtarı başarıyla silindi!');
      } else {
        showNotification('error', 'Proje bulunamadı.');
      }
    } catch (error) {
      console.error('API anahtarı silme hatası:', error);
      showNotification('error', 'API anahtarı silinirken bir hata oluştu.');
      throw error;
    } finally {
      isProcessing.value = false;
    }
  }

  const deleteProject = async (projectId) => {
    isProcessing.value = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      const initialLength = projects.value.length;
      projects.value = projects.value.filter(p => p.id !== projectId);
      if (projects.value.length < initialLength) {
        showNotification('success', 'Proje başarıyla silindi!');
      } else {
        showNotification('error', 'Proje bulunamadı veya silinemedi.');
      }
    } catch (error) {
      console.error('Proje silme hatası:', error);
      showNotification('error', 'Proje silinirken bir hata oluştu.');
      throw error;
    } finally {
      isProcessing.value = false;
    }
  }

  return {
    projects,
    isProcessing, // Expose global processing state
    notification, // Expose global notification state
    showNotification, // Expose method to trigger notifications
    hideNotification, // Expose method to hide notifications
    getProjectById,
    addProject,
    updateProject,
    deleteApiKeyFromProject,
    deleteProject // Expose delete project function
  }
}
