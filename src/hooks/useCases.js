import { useState, useEffect, useCallback } from 'react';
import { caseService } from '../services/caseService';
import toast from 'react-hot-toast';

export const useCases = (initialFilters = {}) => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await caseService.getCases({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });
      const responseData = response.data.data || response.data;
      setCases(Array.isArray(responseData) ? responseData : []);
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: response.data.total || (Array.isArray(responseData) ? responseData.length : 0),
        pages: Math.ceil((response.data.total || (Array.isArray(responseData) ? responseData.length : 0)) / pagination.limit),
      });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch cases';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const createCase = async (caseData) => {
    try {
      const response = await caseService.createCase(caseData);
      setCases((prev) => [response.data.data || response.data, ...prev]);
      toast.success('Case created successfully');
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create case';
      toast.error(message);
      throw err;
    }
  };

  const updateCase = async (id, updateData) => {
    try {
      const response = await caseService.updateCase(id, updateData);
      setCases((prev) =>
        prev.map((c) => (c._id === id ? (response.data.data || response.data) : c))
      );
      toast.success('Case updated successfully');
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update case';
      toast.error(message);
      throw err;
    }
  };

  const getCase = async (id) => {
    try {
      const response = await caseService.getCase(id);
      return response.data.data || response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch case';
      toast.error(message);
      throw err;
    }
  };

  const setPage = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return {
    cases,
    loading,
    error,
    filters,
    pagination,
    setPage,
    updateFilters,
    createCase,
    updateCase,
    getCase,
    refetch: fetchCases,
  };
};

export default useCases;