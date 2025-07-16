// API client configuration and utilities for DilSeDaan frontend
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For JWT cookies
});

// Auth token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('authToken', token);
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken');
  }
};

// Initialize auth token from localStorage
const savedToken = localStorage.getItem('authToken');
if (savedToken) {
  setAuthToken(savedToken);
}

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = authToken || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });
          
          const { accessToken } = response.data.data;
          setAuthToken(accessToken);
          
          // Retry original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        setAuthToken(null);
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// User API
export const userApi = {
  // Authentication
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    walletAddress?: string;
  }): Promise<ApiResponse> => 
    apiClient.post('/api/auth/register', userData),

  login: (credentials: { email: string; password: string }): Promise<ApiResponse> =>
    apiClient.post('/api/auth/login', credentials),

  walletLogin: (walletData: {
    walletAddress: string;
    signature: string;
    message: string;
  }): Promise<ApiResponse> =>
    apiClient.post('/api/auth/wallet-login', walletData),

  logout: (): Promise<ApiResponse> =>
    apiClient.get('/api/auth/logout'),

  getProfile: (): Promise<ApiResponse> =>
    apiClient.get('/api/auth/me'),

  updateProfile: (profileData: any): Promise<ApiResponse> =>
    apiClient.put('/api/auth/updatedetails', profileData),

  updatePassword: (passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> =>
    apiClient.put('/api/auth/updatepassword', passwordData),

  refreshToken: (refreshToken: string): Promise<ApiResponse> =>
    apiClient.post('/api/auth/refresh', { refreshToken }),
};

// Campaign API
export const campaignApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
    location?: string;
    isUrgent?: boolean;
  }): Promise<ApiResponse> =>
    apiClient.get('/api/campaigns', { params }),

  getById: (id: string): Promise<ApiResponse> =>
    apiClient.get(`/api/campaigns/${id}`),

  create: (campaignData: any): Promise<ApiResponse> =>
    apiClient.post('/api/campaigns', campaignData),

  update: (id: string, campaignData: any): Promise<ApiResponse> =>
    apiClient.put(`/api/campaigns/${id}`, campaignData),

  delete: (id: string): Promise<ApiResponse> =>
    apiClient.delete(`/api/campaigns/${id}`),

  addUpdate: (id: string, updateData: {
    title: string;
    content: string;
    images?: string[];
  }): Promise<ApiResponse> =>
    apiClient.post(`/api/campaigns/${id}/updates`, updateData),

  submitMilestone: (campaignId: string, milestoneId: string, proofData: {
    proofDocuments: string[];
  }): Promise<ApiResponse> =>
    apiClient.post(`/api/campaigns/${campaignId}/milestones/${milestoneId}/submit`, proofData),

  verifyMilestone: (campaignId: string, milestoneId: string, verificationData: {
    approved: boolean;
    rejectionReason?: string;
  }): Promise<ApiResponse> =>
    apiClient.post(`/api/campaigns/${campaignId}/milestones/${milestoneId}/verify`, verificationData),
};

// Donation API
export const donationApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    campaignId?: string;
    status?: string;
  }): Promise<ApiResponse> =>
    apiClient.get('/api/donations', { params }),

  getById: (id: string): Promise<ApiResponse> =>
    apiClient.get(`/donations/${id}`),

  create: (donationData: {
    campaignId: string;
    amount: number;
    currency?: string;
    message?: string;
    isAnonymous?: boolean;
    transactionHash?: string;
    blockNumber?: number;
    gasUsed?: number;
    gasFee?: number;
  }): Promise<ApiResponse> =>
    apiClient.post('/api/donations', donationData),

  updateStatus: (id: string, statusData: {
    status: string;
    blockNumber?: number;
    gasUsed?: number;
    gasFee?: number;
  }): Promise<ApiResponse> =>
    apiClient.put(`/donations/${id}/status`, statusData),

  getAnalytics: (params?: {
    campaignId?: string;
    timeframe?: string;
  }): Promise<ApiResponse> =>
    apiClient.get('/api/donations/analytics/stats', { params }),

  getTaxReceipt: (id: string): Promise<ApiResponse> =>
    apiClient.get(`/donations/${id}/receipt`),
};

// Blockchain API
export const blockchainApi = {
  getStatus: (): Promise<ApiResponse> =>
    apiClient.get('/api/blockchain/status'),

  getTransaction: (hash: string, network?: string): Promise<ApiResponse> =>
    apiClient.get(`/blockchain/transaction/${hash}`, { params: { network } }),

  getBalance: (address: string, network?: string): Promise<ApiResponse> =>
    apiClient.get(`/blockchain/balance/${address}`, { params: { network } }),

  verifyDonation: (verificationData: {
    transactionHash: string;
    expectedAmount: number;
    campaignId: string;
    network?: string;
  }): Promise<ApiResponse> =>
    apiClient.post('/api/blockchain/verify-donation', verificationData),

  getCampaignData: (id: string, network?: string): Promise<ApiResponse> =>
    apiClient.get(`/blockchain/campaign/${id}`, { params: { network } }),

  getGasPrice: (network?: string): Promise<ApiResponse> =>
    apiClient.get('/api/blockchain/gas-price', { params: { network } }),
};

// IPFS API
export const ipfsApi = {
  uploadFile: (file: File, metadata?: {
    description?: string;
    category?: string;
  }): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata?.description) formData.append('description', metadata.description);
    if (metadata?.category) formData.append('category', metadata.category);

    return apiClient.post('/api/ipfs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadJSON: (data: any, metadata?: any): Promise<ApiResponse> =>
    apiClient.post('/api/ipfs/upload-json', { data, metadata }),

  getFile: (hash: string): Promise<ApiResponse> =>
    apiClient.get(`/ipfs/${hash}`),

  getMetadata: (hash: string): Promise<ApiResponse> =>
    apiClient.get(`/ipfs/${hash}/metadata`),

  pinFile: (hash: string): Promise<ApiResponse> =>
    apiClient.post(`/ipfs/${hash}/pin`),

  uploadMultiple: (files: File[]): Promise<ApiResponse> => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('files', file);
    });

    return apiClient.post('/api/ipfs/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  search: (params: {
    query?: string;
    category?: string;
    uploadedBy?: string;
    limit?: number;
  }): Promise<ApiResponse> =>
    apiClient.get('/api/ipfs/search', { params }),
};

// Audit API
export const auditApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    campaignId?: string;
    auditType?: string;
    status?: string;
  }): Promise<ApiResponse> =>
    apiClient.get('/audits', { params }),

  getById: (id: string): Promise<ApiResponse> =>
    apiClient.get(`/audits/${id}`),

  create: (auditData: {
    campaignId: string;
    auditType: string;
    scheduledDate?: string;
  }): Promise<ApiResponse> =>
    apiClient.post('/audits', auditData),

  update: (id: string, auditData: any): Promise<ApiResponse> =>
    apiClient.put(`/audits/${id}`, auditData),

  start: (id: string): Promise<ApiResponse> =>
    apiClient.post(`/audits/${id}/start`),

  complete: (id: string, completionData: {
    findings: any[];
    overallScore: number;
    report: any;
  }): Promise<ApiResponse> =>
    apiClient.post(`/audits/${id}/complete`, completionData),

  addFinding: (id: string, finding: any): Promise<ApiResponse> =>
    apiClient.post(`/audits/${id}/findings`, finding),

  resolveFinding: (auditId: string, findingId: string): Promise<ApiResponse> =>
    apiClient.put(`/audits/${auditId}/findings/${findingId}/resolve`),

  getStats: (params?: { timeframe?: string }): Promise<ApiResponse> =>
    apiClient.get('/audits/stats/overview', { params }),
};

// Admin API
export const adminApi = {
  getDashboard: (): Promise<ApiResponse> =>
    apiClient.get('/api/admin/dashboard'),

  getUsers: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    kycStatus?: string;
    search?: string;
  }): Promise<ApiResponse> =>
    apiClient.get('/api/admin/users', { params }),

  updateUserStatus: (userId: string, statusData: {
    kycStatus?: string;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
  }): Promise<ApiResponse> =>
    apiClient.put(`/api/admin/users/${userId}/status`, statusData),

  deleteUser: (userId: string): Promise<ApiResponse> =>
    apiClient.delete(`/api/admin/users/${userId}`),

  getStats: (params?: { timeframe?: string }): Promise<ApiResponse> =>
    apiClient.get('/api/admin/stats', { params }),

  updateSettings: (settings: any): Promise<ApiResponse> =>
    apiClient.put('/api/admin/settings', settings),

  getHealth: (): Promise<ApiResponse> =>
    apiClient.get('/api/admin/health'),

  sendNotification: (notificationData: {
    type: string;
    title: string;
    message: string;
    targetUsers?: string;
    priority?: string;
  }): Promise<ApiResponse> =>
    apiClient.post('/api/admin/notifications', notificationData),

  // Campaign management
  getPendingCampaigns: (): Promise<ApiResponse> =>
    apiClient.get('/api/campaigns?status=pending_review'),

  approveCampaign: (campaignId: string): Promise<ApiResponse> =>
    apiClient.put(`/api/campaigns/${campaignId}/status`, { 
      status: 'active', 
      isVerified: true 
    }),

  rejectCampaign: (campaignId: string, reason?: string): Promise<ApiResponse> =>
    apiClient.put(`/api/campaigns/${campaignId}/status`, { 
      status: 'rejected',
      rejectionReason: reason 
    }),
};

// Payment API
export const paymentApi = {
  createUPIPayment: (paymentData: {
    campaignId: string;
    amount: number;
    upiId: string;
  }): Promise<ApiResponse> =>
    apiClient.post('/api/payments/upi/create', paymentData),

  verifyUPIPayment: (verificationData: {
    merchantTransactionId: string;
    utrNumber: string;
  }): Promise<ApiResponse> =>
    apiClient.post('/api/payments/upi/verify', verificationData),

  createCardOrder: (orderData: {
    campaignId: string;
    amount: number;
  }): Promise<ApiResponse> =>
    apiClient.post('/api/payments/card/create-order', orderData),

  verifyCardPayment: (verificationData: {
    orderId: string;
    paymentId: string;
    signature: string;
    campaignId: string;
    amount: number;
  }): Promise<ApiResponse> =>
    apiClient.post('/api/payments/card/verify', verificationData),

  getFeePreview: (params: {
    amount: number;
    paymentMethod?: string;
    campaignType?: string;
  }): Promise<ApiResponse> =>
    apiClient.get('/api/payments/fees/preview', { params }),

  getPaymentMethods: (params?: {
    campaignId?: string;
  }): Promise<ApiResponse> =>
    apiClient.get('/api/payments/methods', { params }),

  getRazorpayConfig: (): Promise<ApiResponse> =>
    apiClient.get('/api/payments/config/razorpay'),

  getPaymentHistory: (params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> =>
    apiClient.get('/api/payments/history', { params }),
};

// Two-Factor Authentication API
export const twoFactorApi = {
  setup: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/api/auth/2fa/setup');
    return response.data;
  },

  enable: async (token: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/api/auth/2fa/enable', { token });
    return response.data;
  },

  verify: async (token: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/api/auth/2fa/verify', { token });
    return response.data;
  },

  disable: async (token: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/api/auth/2fa/disable', { token });
    return response.data;
  },

  getStatus: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/api/auth/2fa/status');
    return response.data;
  },

  regenerateBackupCodes: async (token: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/api/auth/2fa/regenerate-backup-codes', { token });
    return response.data;
  },
};

// Analytics API
export const analyticsApi = {
  getOverview: async (timeframe: string = '30d'): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/api/analytics/overview?timeframe=${timeframe}`);
    return response.data;
  },

  getCampaigns: async (timeframe: string = '30d'): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/api/analytics/campaigns?timeframe=${timeframe}`);
    return response.data;
  },

  getDonations: async (timeframe: string = '30d'): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/api/analytics/donations?timeframe=${timeframe}`);
    return response.data;
  },

  getUsers: async (timeframe: string = '30d'): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/api/analytics/users?timeframe=${timeframe}`);
    return response.data;
  },

  getRealTimeMetrics: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/api/analytics/real-time');
    return response.data;
  },

  exportData: async (type: string, format: string, timeframe: string = '30d'): Promise<Blob> => {
    const response = await apiClient.get(`/api/analytics/export?type=${type}&format=${format}&timeframe=${timeframe}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  getCampaignAnalytics: async (campaignId: string, timeframe: string = '30d'): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/api/analytics/campaigns/${campaignId}?timeframe=${timeframe}`);
    return response.data;
  },

  getDonorAnalytics: async (donorId: string, timeframe: string = '30d'): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/api/analytics/users/${donorId}/donations?timeframe=${timeframe}`);
    return response.data;
  },
};

// Export all APIs
export const api = {
  user: userApi,
  campaign: campaignApi,
  donation: donationApi,
  blockchain: blockchainApi,
  ipfs: ipfsApi,
  audit: auditApi,
  admin: adminApi,
  payment: paymentApi,
  twoFactor: twoFactorApi,
  analytics: analyticsApi,
};

export default api;
