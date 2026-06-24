import { api } from './api';

export const caseService = {
  // Create new case
  createCase: (caseData) => {
    return api.post('/api/cases', caseData);
  },

  // Get all cases with filters
  getCases: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== '' && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    return api.get(`/api/cases?${queryParams.toString()}`);
  },

  // Get single case
  getCase: (id) => {
    return api.get(`/api/cases/${id}`);
  },

  // Update case
  updateCase: (id, updateData) => {
    return api.put(`/api/cases/${id}`, updateData);
  },

  // Delete case
  deleteCase: (id) => {
    return api.delete(`/api/cases/${id}`);
  },

  // Get case statistics
  getCaseStats: () => {
    return api.get('/api/cases/stats');
  },

  // Get user cases
  getUserCases: (userId) => {
    return api.get(`/api/cases/user/${userId}`);
  },

  // Assign investigator
  assignInvestigator: (caseId, investigatorId) => {
    return api.put(`/api/cases/${caseId}/assign`, { investigatorId });
  },

  // Update case status
  updateStatus: (caseId, status, notes = '') => {
    return api.put(`/api/cases/${caseId}/status`, { status, notes });
  },

  // Add case note
  addNote: (caseId, note) => {
    return api.post(`/api/cases/${caseId}/notes`, note);
  },

  // Get case timeline
  getTimeline: (caseId) => {
    return api.get(`/api/cases/${caseId}/timeline`);
  },
};

export default caseService;