import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Eye, Edit3, Trash2,
  AlertTriangle, Activity, CheckCircle,
  Download, Users, Search,
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, RiskBadge } from '../../components/common/Badge';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import StatCard from '../../components/charts/StatCard';
import SearchInput from '../../components/forms/SearchInput';
import CaseFilter from '../../components/forms/CaseFilter';
import ConfirmDialog from '../../components/feedback/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { caseService } from '../../services/caseService';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const CaseManagement = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Modal states
  const [selectedCase, setSelectedCase] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [investigators, setInvestigators] = useState([]);
  const [selectedInvestigator, setSelectedInvestigator] = useState('');

  // Fetch cases from API
  useEffect(() => {
    fetchCases();
  }, [filters, pagination.page, searchQuery]);

  // Fetch investigators for assignment
  useEffect(() => {
    fetchInvestigators();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await caseService.getCases({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        sort: '-createdAt',
        ...(searchQuery && { search: searchQuery }),
      });

      const data = response.data?.data || response.data || [];
      const pagData = response.data?.pagination || {};

      setCases(Array.isArray(data) ? data : []);
      setPagination(prev => ({
        ...prev,
        total: pagData.total || (Array.isArray(data) ? data.length : 0),
        pages: pagData.pages || 1,
      }));
    } catch (err) {
      console.error('Failed to fetch cases:', err);
      setError(err.response?.data?.message || 'Failed to load cases');
      toast.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestigators = async () => {
    try {
      const response = await api.get('/api/users/investigators');
      const data = response.data?.data || response.data || [];
      setInvestigators(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch investigators:', err);
    }
  };

  // Handle assign investigator
  const handleAssignInvestigator = async () => {
    if (!selectedCase || !selectedInvestigator) {
      toast.error('Please select an investigator');
      return;
    }

    setSubmitting(true);
    try {
      await caseService.assignInvestigator(selectedCase._id, selectedInvestigator);
      toast.success('Investigator assigned successfully');
      setSelectedCase(null);
      setSelectedInvestigator('');
      fetchCases();
    } catch (err) {
      console.error('Failed to assign investigator:', err);
      toast.error(err.response?.data?.message || 'Failed to assign investigator');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete case
  const handleDeleteCase = async () => {
    if (!deleteConfirm) return;

    setSubmitting(true);
    try {
      await caseService.deleteCase(deleteConfirm._id);
      toast.success('Case deleted successfully');
      setDeleteConfirm(null);
      fetchCases();
    } catch (err) {
      console.error('Failed to delete case:', err);
      toast.error(err.response?.data?.message || 'Failed to delete case');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle update case status
  const handleUpdateStatus = async (caseId, newStatus) => {
    try {
      await caseService.updateStatus(caseId, newStatus);
      toast.success('Case status updated');
      fetchCases();
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format amount
  const formatAmount = (amount, currency = 'USD') => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate stats
  const stats = {
    total: pagination.total || cases.length,
    active: cases.filter(c => ['submitted', 'under_review', 'evidence_verification', 'investigation'].includes(c.status)).length,
    critical: cases.filter(c => c.riskLevel === 'critical').length,
    resolved: cases.filter(c => ['resolved', 'closed'].includes(c.status)).length,
    escalated: cases.filter(c => c.status === 'escalated').length,
  };

  const columns = [
    {
      header: 'Case ID',
      accessor: 'caseId',
      sortable: true,
      cell: (value, row) => (
        <span className="font-mono text-cyan-500 text-xs">
          {value || row._id?.toString().slice(-8)}
        </span>
      ),
    },
    {
      header: 'Title',
      accessor: 'title',
      sortable: true,
      cell: (value) => (
        <span className="text-white text-sm font-medium line-clamp-1 max-w-[200px] block">
          {value}
        </span>
      ),
    },
    {
      header: 'Type',
      accessor: 'fraudType',
      sortable: true,
      cell: (value) => (
        <Badge size="xs" color="orange">
          {value?.replace(/_/g, ' ') || 'N/A'}
        </Badge>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amountLost',
      sortable: true,
      cell: (value, row) => (
        <span className="text-white font-semibold text-sm">
          {formatAmount(value, row.currency)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (value) => <StatusBadge status={value} size="xs" />,
    },
    {
      header: 'Risk',
      accessor: 'riskLevel',
      sortable: true,
      cell: (value) => <RiskBadge level={value} size="xs" />,
    },
    {
      header: 'Investigator',
      accessor: 'assignedInvestigator',
      cell: (value) => (
        <span className="text-gray-400 text-xs">
          {value?.name || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Reported By',
      accessor: 'user',
      cell: (value) => (
        <span className="text-gray-400 text-xs">
          {value?.name || value?.email || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      sortable: true,
      cell: (value) => (
        <span className="text-gray-500 text-xs">{formatDate(value)}</span>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id',
      cell: (value, row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            icon={Eye}
            onClick={(e) => { e.stopPropagation(); setSelectedCase(row); }}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="xs"
            icon={Edit3}
            onClick={(e) => { e.stopPropagation(); setSelectedCase(row); }}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="xs"
            icon={Trash2}
            className="text-red-400"
            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(row); }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (loading && cases.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading cases..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Case Management</h1>
              <p className="text-gray-400 text-sm mt-1">
                {stats.total} total cases • {stats.active} active • {stats.escalated} escalated
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" icon={Download} onClick={fetchCases}>
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard title="Total Cases" value={stats.total} icon={FileText} color="cyan" />
          <StatCard title="Active" value={stats.active} icon={Activity} color="yellow" />
          <StatCard title="Critical" value={stats.critical} icon={AlertTriangle} color="red" />
          <StatCard title="Escalated" value={stats.escalated} icon={AlertTriangle} color="orange" />
          <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} color="emerald" />
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <SearchInput
              placeholder="Search cases by ID or title..."
              onSearch={(query) => {
                setSearchQuery(query);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="flex-1"
            />
            <CaseFilter
              filters={filters}
              onFilterChange={(newFilters) => {
                setFilters(newFilters);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              onReset={() => setFilters({})}
            />
          </div>
        </Card>

        {/* Cases Table */}
        <Card>
          <DataTable
            columns={columns}
            data={cases}
            searchable={false}
            filterable={false}
            pageSize={pagination.limit}
            onRowClick={(row) => setSelectedCase(row)}
          />
        </Card>
      </div>

      {/* Case Detail/Edit Modal */}
      <Modal
        isOpen={!!selectedCase}
        onClose={() => { setSelectedCase(null); setSelectedInvestigator(''); }}
        title={`Case ${selectedCase?.caseId || selectedCase?._id?.toString().slice(-8)}`}
        size="lg"
      >
        {selectedCase && (
          <div className="space-y-5">
            {/* Case Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Title</p>
                <p className="text-white font-medium">{selectedCase.title}</p>
              </div>
              <div>
                <p className="text-gray-500">Type</p>
                <Badge color="orange">{selectedCase.fraudType?.replace(/_/g, ' ') || 'N/A'}</Badge>
              </div>
              <div>
                <p className="text-gray-500">Amount</p>
                <p className="text-white font-semibold">
                  {formatAmount(selectedCase.amountLost, selectedCase.currency)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <StatusBadge status={selectedCase.status} />
              </div>
              <div>
                <p className="text-gray-500">Risk Level</p>
                <RiskBadge level={selectedCase.riskLevel} />
              </div>
              <div>
                <p className="text-gray-500">Priority</p>
                <Badge color={selectedCase.priority === 1 ? 'red' : selectedCase.priority === 2 ? 'yellow' : 'gray'}>
                  P{selectedCase.priority || '3'}
                </Badge>
              </div>
              <div>
                <p className="text-gray-500">Investigator</p>
                <p className="text-white">
                  {selectedCase.assignedInvestigator?.name || 'Unassigned'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Reported By</p>
                <p className="text-white">
                  {selectedCase.user?.name || selectedCase.user?.email || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Date Reported</p>
                <p className="text-white">{formatDate(selectedCase.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500">Country</p>
                <p className="text-white">{selectedCase.country || 'N/A'}</p>
              </div>
            </div>

            {/* Description */}
            {selectedCase.description && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-300 line-clamp-4">{selectedCase.description}</p>
              </div>
            )}

            {/* Status Update */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Update Status</label>
              <div className="flex flex-wrap gap-2">
                {['submitted', 'under_review', 'evidence_verification', 'investigation', 'escalated', 'resolved', 'closed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(selectedCase._id, status)}
                    disabled={selectedCase.status === status}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedCase.status === status
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-slate-800 text-gray-400 hover:text-white border border-slate-700'
                    }`}
                  >
                    {status.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Assign Investigator */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Assign Investigator</label>
              <div className="flex gap-2">
                <select
                  value={selectedInvestigator}
                  onChange={(e) => setSelectedInvestigator(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select investigator...</option>
                  {investigators.map((inv) => (
                    <option key={inv._id} value={inv._id}>
                      {inv.name} ({inv.email})
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleAssignInvestigator}
                  loading={submitting}
                  disabled={!selectedInvestigator}
                  size="sm"
                >
                  Assign
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <Button variant="outline" fullWidth onClick={() => setSelectedCase(null)}>
                Close
              </Button>
              <Button
                variant="danger"
                fullWidth
                icon={Trash2}
                onClick={() => {
                  setDeleteConfirm(selectedCase);
                  setSelectedCase(null);
                }}
              >
                Delete Case
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteCase}
        loading={submitting}
        title="Delete Case"
        message={`Are you sure you want to delete case "${deleteConfirm?.caseId || deleteConfirm?._id}"? This action cannot be undone and all associated evidence will be removed.`}
        confirmText="Delete Case"
        variant="danger"
      />
    </AdminLayout>
  );
};

export default CaseManagement;