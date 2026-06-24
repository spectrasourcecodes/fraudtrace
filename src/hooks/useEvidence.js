import { useState, useCallback } from 'react';
import { evidenceService } from '../services/evidenceService';
import toast from 'react-hot-toast';

export const useEvidence = (caseId) => {
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvidence = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await evidenceService.getEvidence(caseId);
      const data = response.data.data || response.data;
      setEvidence(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch evidence';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  const uploadEvidence = async (files, metadata = {}) => {
    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      Object.keys(metadata).forEach((key) => formData.append(key, metadata[key]));
      const response = await evidenceService.uploadEvidence(caseId, formData);
      const newEvidence = response.data.data || [response.data];
      setEvidence((prev) => [...prev, ...(Array.isArray(newEvidence) ? newEvidence : [newEvidence])]);
      toast.success('Evidence uploaded successfully');
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to upload evidence';
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvidence = async (evidenceId) => {
    try {
      await evidenceService.deleteEvidence(evidenceId);
      setEvidence((prev) => prev.filter((e) => e._id !== evidenceId));
      toast.success('Evidence deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete evidence');
      throw err;
    }
  };

  return {
    evidence,
    loading,
    error,
    fetchEvidence,
    uploadEvidence,
    deleteEvidence,
    refetch: fetchEvidence,
  };
};

export default useEvidence;