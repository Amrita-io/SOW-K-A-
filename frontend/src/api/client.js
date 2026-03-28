import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000, // 2 min for analysis
});

export const analyzeCouple = async (data) => {
  const response = await api.post('/api/analyze', data);
  return response.data;
};

export const uploadCAMS = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/upload/cams', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const downloadReport = async () => {
  const response = await api.get('/api/report/pdf', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'CoupleWealth_Report.pdf');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const healthCheck = async () => {
  const response = await api.get('/api/health');
  return response.data;
};

export default api;
