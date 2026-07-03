import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

export const getStrategies = () => api.get('/strategies');
export const getStrategy = (id) => api.get(`/strategies/${id}`);
export const getCapabilities = (strategyId) => api.get(`/capabilities?strategyId=${strategyId}`);
export const getCapability = (id) => api.get(`/capabilities/${id}`);
export const getControls = (params) => api.get('/controls', { params });
export const getControl = (id) => api.get(`/controls/${id}`);
export const getTools = (params) => api.get('/tools', { params });
export const search = (q, type = 'all') => api.get(`/search?q=${q}&type=${type}`);

// Auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Phase 2 Features
export const getEvidence = (controlId) => api.get(`/evidence/${controlId}`);
export const uploadEvidence = (controlId, formData) => api.post(`/evidence/${controlId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const downloadEvidence = (controlId, evidenceId) => api.get(`/evidence/${controlId}/${evidenceId}/download`, { responseType: 'blob' });
export const deleteEvidence = (evidenceId) => api.delete(`/evidence/${evidenceId}`);

export const updateControlStatus = (controlId, status) => api.patch(`/controls/${controlId}/status`, { status });

export const getMyDashboard = () => api.get('/dashboard/me');
export const getUserDashboard = (userId) => api.get(`/dashboard/user/${userId}`);
export const getAllDashboard = () => api.get('/dashboard/all');
export const getDashboardUsers = () => api.get('/dashboard/users');
export const updateUserRole = (userId, role) => api.put(`/users/${userId}/role`, { role });

// Auth OTP Features
export const verifyOtp = (email, otp) => api.post('/auth/verify-otp', { email, otp });
export const resendOtp = (email) => api.post('/auth/resend-otp', { email });

export default api;
