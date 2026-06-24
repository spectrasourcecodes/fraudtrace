import { api } from './api';

export const evidenceService = {
  // Upload evidence
  uploadEvidence: (caseId, formData) => {
    return api.post(`/api/evidence/${caseId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Get evidence for a case
  getEvidence: (caseId) => {
    return api.get(`/api/evidence/case/${caseId}`);
  },

  // Get single evidence
  getEvidenceItem: (evidenceId) => {
    return api.get(`/api/evidence/${evidenceId}`);
  },

  // Update evidence metadata
  updateEvidence: (evidenceId, metadata) => {
    return api.put(`/api/evidence/${evidenceId}`, metadata);
  },

  // Delete evidence
  deleteEvidence: (evidenceId) => {
    return api.delete(`/api/evidence/${evidenceId}`);
  },

  // Download evidence
  downloadEvidence: (evidenceId) => {
    return api.get(`/api/evidence/${evidenceId}/download`, {
      responseType: 'blob',
    });
  },

  // Verify evidence
  verifyEvidence: (evidenceId, status) => {
    return api.put(`/api/evidence/${evidenceId}/verify`, { status });
  },

  // Get evidence by category
  getEvidenceByCategory: (caseId, category) => {
    return api.get(`/api/evidence/case/${caseId}/category/${category}`);
  },

  // Search evidence
  searchEvidence: (query) => {
    return api.get(`/api/evidence/search?q=${query}`);
  },

  // Add evidence tags
  addTags: (evidenceId, tags) => {
    return api.put(`/api/evidence/${evidenceId}/tags`, { tags });
  },
};

export default evidenceService;