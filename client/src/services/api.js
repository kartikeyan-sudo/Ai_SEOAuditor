import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout for website auditing
});

export const auditService = {
  // Start a new SEO audit
  createAudit: async (url) => {
    const response = await api.post('/audit', { url });
    return response.data;
  },

  // Get audit report by ID
  getAuditById: async (id) => {
    const response = await api.get(`/audit/${id}`);
    return response.data;
  },

  // Get recent audits list
  getAllAudits: async () => {
    const response = await api.get('/audit');
    return response.data;
  },

  // Delete an audit
  deleteAudit: async (id) => {
    const response = await api.delete(`/audit/${id}`);
    return response.data;
  },

  // Health check
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;
