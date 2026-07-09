import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Auth interceptor — attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Core explorer ────────────────────────────────────────────────────────
export const getStrategies = () => api.get('/strategies');
export const getStrategy = (id) => api.get(`/strategies/${id}`);
export const getCapabilities = (strategyId) => api.get(`/capabilities?strategyId=${strategyId}`);
export const getCapability = (id) => api.get(`/capabilities/${id}`);
export const getControls = (params) => api.get('/controls', { params });
export const getControl = (id) => api.get(`/controls/${id}`);
export const getTools = (params) => api.get('/tools', { params });
export const search = (q, type = 'all') => api.get(`/search?q=${q}&type=${type}`);

// ─── Phase 2 — Evidence ───────────────────────────────────────────────────
export const getEvidence = (controlId) => api.get(`/evidence/${controlId}`);
export const uploadEvidence = (controlId, formData) =>
  api.post(`/evidence/${controlId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const downloadEvidence = (controlId, evidenceId) =>
  api.get(`/evidence/${controlId}/${evidenceId}/download`, { responseType: 'blob' });
export const deleteEvidence = (evidenceId) => api.delete(`/evidence/${evidenceId}`);

export const updateControlStatus = (controlId, status) =>
  api.patch(`/controls/${controlId}/status`, { status });

// ─── Phase 3 — Control CRUD & Lifecycle ──────────────────────────────────────
export const suggestControlId = (category) => api.get(`/controls/suggest-id?category=${encodeURIComponent(category)}`);
export const createControl = (data) => api.post('/controls', data);
export const updateControl = (controlId, data) => api.put(`/controls/${controlId}`, data);
export const updateLifecycle = (controlId, action, reason) =>
  api.patch(`/controls/${controlId}/lifecycle`, { action, reason });
export const toggleAtRisk = (controlId, atRisk) =>
  api.patch(`/controls/${controlId}/at-risk`, { atRisk });
export const getLifecycleHistory = (controlId) => api.get(`/controls/${controlId}/history`);

// ── Phase 2/3.1 — Dashboard ─────────────────────────────────────────────────
export const getMyDashboard = () => api.get('/dashboard/me');
export const getUserDashboard = (userId) => api.get(`/dashboard/user/${userId}`);
export const getAllDashboard = () => api.get('/dashboard/all');
export const getDashboardUsers = () => api.get('/dashboard/users');

export const getImplementationProgress = () => api.get('/dashboard/implementation-progress');
export const getImplementationTrend = () => api.get('/dashboard/implementation-trend');
export const getTopRiskAreas = () => api.get('/dashboard/top-risk-areas');
export const getRecentEvidenceDashboard = (params) => api.get('/dashboard/recent-evidence', { params });

export const getControlsSummary = (params) => api.get('/controls/summary', { params });
export const getControlsByCategory = (params) => api.get('/controls/by-category', { params });

export const getUsers = () => api.get('/users');
export const updateUserRole = (userId, role) => api.patch(`/users/${userId}/role`, { role });

// ─── Phase 3 — Invite Auth ───────────────────────────────────────────────
export const validateInviteToken = (token) => api.get(`/invites/${token}`);
export const acceptInvite = (token, password) => api.post(`/invites/${token}/accept`, { password });
export const getInvites = () => api.get('/invites');
export const createInvite = (data) => api.post('/invites', data);
export const resendInvite = (token) => api.post(`/invites/${token}/resend`);
export const revokeInvite = (id) => api.delete(`/invites/${id}`);

// ─── Phase 3 — Tools & Owners ────────────────────────────────────────────────
export const getTool = (id) => api.get(`/tools/${id}`);
export const createTool = (data) => api.post('/tools', data);
export const updateTool = (id, data) => api.put(`/tools/${id}`, data);
export const deleteTool = (id) => api.delete(`/tools/${id}`);
export const setToolEffectiveness = (id, score) => api.patch(`/tools/${id}/effectiveness`, { score });
export const getToolCategories = () => api.get('/tools/categories');

export const getOwners = () => api.get('/owners');
export const getOwner = (id) => api.get(`/owners/${id}`);
export const createOwner = (data) => api.post('/owners', data);
export const updateOwner = (id, data) => api.put(`/owners/${id}`, data);
export const deleteOwner = (id) => api.delete(`/owners/${id}`);

export const getToolMappings = (params) => api.get('/tool-mappings', { params });
export const addToolMapping = (data) => api.post('/tool-mappings', data);
export const removeToolMapping = (id) => api.delete(`/tool-mappings/${id}`);

export default api;
