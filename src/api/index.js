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
