import axios from 'axios';

const API_BASE_URL = 'http://localhost:1030/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (email, password, name) => {
    const response = await api.post('/auth/register', { email, password, name });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Files API
export const filesAPI = {
  getFiles: async (folderId = '') => {
    const params = folderId ? `?folder_id=${folderId}` : '';
    const response = await api.get(`/files${params}`);
    return response.data;
  },

  uploadFile: async (file, folderId = '') => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folder_id', folderId);
    }

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  downloadFile: async (fileId) => {
    const response = await api.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  deleteFile: async (fileId) => {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
  },

  restoreFile: async (fileId) => {
    const response = await api.post(`/files/${fileId}/restore`);
    return response.data;
  },

  permanentDeleteFile: async (fileId) => {
    const response = await api.delete(`/files/${fileId}/permanent`);
    return response.data;
  },

  toggleStar: async (fileId) => {
    const response = await api.post(`/files/${fileId}/star`);
    return response.data;
  },

  getRecentFiles: async () => {
    const response = await api.get('/files/recent');
    return response.data;
  },

  getRecentFiles: async () => {
    const response = await api.get('/files/recent');
    return response.data;
  },

  getStarredFiles: async () => {
    const response = await api.get('/files/starred');
    return response.data;
  },

  getTrashedFiles: async () => {
    const response = await api.get('/files/trash');
    return response.data;
  },

  searchFiles: async (filters) => {
    // Build query string from filters object
    const params = new URLSearchParams();

    if (filters.query) params.append('q', filters.query);
    if (filters.fileType) params.append('fileType', filters.fileType);
    if (filters.owner) params.append('owner', filters.owner);
    if (filters.folderId) params.append('folderId', filters.folderId);
    if (filters.dateModifiedType) params.append('dateModifiedType', filters.dateModifiedType);
    if (filters.dateModifiedStart) params.append('dateModifiedStart', filters.dateModifiedStart);
    if (filters.dateModifiedEnd) params.append('dateModifiedEnd', filters.dateModifiedEnd);
    if (filters.isStarred) params.append('isStarred', filters.isStarred);
    if (filters.status) params.append('status', filters.status);

    const response = await api.get(`/files/search?${params.toString()}`);
    return response.data;
  },

  moveFile: async (fileId, folderId) => {
    const response = await api.put(`/files/${fileId}/move`, {
      folder_id: folderId || '',
    });
    return response.data;
  },
};

// Folders API
export const foldersAPI = {
  getFolders: async (parentId = '') => {
    const params = parentId ? `?parent_id=${parentId}` : '';
    const response = await api.get(`/folders${params}`);
    return response.data;
  },

  createFolder: async (name, parentFolderId = '') => {
    const response = await api.post('/folders', {
      name,
      parent_folder_id: parentFolderId,
    });
    return response.data;
  },

  getRootFolder: async () => {
    const response = await api.get('/folders/root');
    return response.data;
  },

  getFolderById: async (folderId) => {
    const response = await api.get(`/folders/${folderId}`);
    return response.data;
  },

  moveFolder: async (folderId, parentFolderId) => {
    const response = await api.put(`/folders/${folderId}/move`, {
      parent_folder_id: parentFolderId || '',
    });
    return response.data;
  },

  getStarredFolders: async () => {
    const response = await api.get('/folders/starred');
    return response.data;
  },

  toggleStarFolder: async (folderId) => {
    const response = await api.post(`/folders/${folderId}/star`);
    return response.data;
  },

  deleteFolder: async (folderId) => {
    const response = await api.delete(`/folders/${folderId}`);
    return response.data;
  },

  restoreFolder: async (folderId) => {
    const response = await api.post(`/folders/${folderId}/restore`);
    return response.data;
  },

  getTrashedFolders: async () => {
    const response = await api.get('/folders/trash');
    return response.data;
  },

  permanentDeleteFolder: async (folderId) => {
    const response = await api.delete(`/folders/${folderId}/permanent`);
    return response.data;
  },
};

// Sharing API
export const sharingAPI = {
  // Link sharing
  createShareLink: async (itemType, itemId, permission = 'viewer') => {
    const response = await api.post('/sharing/link', {
      item_type: itemType,
      item_id: itemId,
      permission,
    });
    return response.data;
  },

  getShareLinks: async (itemType, itemId) => {
    const response = await api.get(`/sharing/links?item_type=${itemType}&item_id=${itemId}`);
    return response.data;
  },

  deactivateShareLink: async (linkId) => {
    const response = await api.delete(`/sharing/link/${linkId}`);
    return response.data;
  },

  // User permissions
  getItemPermissions: async (itemType, itemId) => {
    const response = await api.get(`/sharing/permissions?item_type=${itemType}&item_id=${itemId}`);
    return response.data;
  },

  shareWithUser: async (itemType, itemId, userId, role) => {
    const response = await api.post('/sharing/share', {
      item_type: itemType,
      item_id: itemId,
      user_id: userId,
      role,
    });
    return response.data;
  },

  revokePermission: async (itemType, itemId, userId) => {
    const response = await api.post('/sharing/revoke', {
      item_type: itemType,
      item_id: itemId,
      user_id: userId,
    });
    return response.data;
  },

  // User search
  searchUsers: async (query) => {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Shared with me
  getSharedWithMe: async () => {
    const response = await api.get('/sharing/shared-with-me');
    return response.data;
  },
};

// Activity API
export const activityAPI = {
  getUserActivity: async (limit = 50) => {
    const response = await api.get(`/activity?limit=${limit}`);
    return response.data;
  },

  getFileActivity: async (fileId, limit = 20) => {
    const response = await api.get(`/activity/file?file_id=${fileId}&limit=${limit}`);
    return response.data;
  },

  getActivityTimeline: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const response = await api.get(`/activity/timeline?${params.toString()}`);
    return response.data;
  },

  getDashboardActivity: async (limit = 10) => {
    const response = await api.get(`/activity/dashboard?limit=${limit}`);
    return response.data;
  },
};

// Versions API
export const versionsAPI = {
  getFileVersions: async (fileId) => {
    const response = await api.get(`/versions/file/${fileId}`);
    return response.data;
  },

  getFileVersion: async (versionId) => {
    const response = await api.get(`/versions/${versionId}`);
    return response.data;
  },
};

// Comments API
export const commentsAPI = {
  createComment: async (fileId, content) => {
    const response = await api.post('/comments', {
      file_id: fileId,
      content,
    });
    return response.data;
  },

  getFileComments: async (fileId) => {
    const response = await api.get(`/comments?file_id=${fileId}`);
    return response.data;
  },

  updateComment: async (commentId, content) => {
    const response = await api.put(`/comments/${commentId}`, {
      content,
    });
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },
};

// Storage API
export const storageAPI = {
  getAnalytics: async () => {
    const response = await api.get('/storage/analytics');
    return response.data;
  },
};

export default api;
