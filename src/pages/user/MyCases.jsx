import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Filter, Plus, FileText, AlertTriangle,
  ArrowUpDown, Eye,
} from 'lucide-react';
import UserLayout from '../../components/layout/UserLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, RiskBadge } from '../../components/common/Badge';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';
import CaseFilter from '../../components/forms/CaseFilter';
import SearchInput from '../../components/forms/SearchInput';
import { caseService } from '../../services/caseService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyCases = () => {
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

  const fetchCases = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await caseService.getCases({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        sort: '-createdAt',
      });

      const data = response.data.data || response.data;
      setCases(Array.isArray(data) ? data : []);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || (Array.isArray(data) ? data.length : 0),
        pages: Math.ceil((response.data.total || (Array.isArray(data) ? data.length : 0)) / prev.limit),
      }));
    } catch (err) {
      console.error('Failed to fetch cases:', err);
      setError(err.response?.data?.message || 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [filters, pagination.page, pagination.limit]);

  const columns = [
    {
      header: 'Case ID',
      accessor: 'caseId',
      sortable: true,
      cell: (value, row) => (
        <span className="font-mono text-cyan-500 text-sm">{value || row._id?.slice(-8)}</span>
      ),
    },
    {
      header: 'Title',
      accessor: 'title',
      sortable: true,
      cell: (value) => <span className="text-white text-sm font-medium line-clamp-1 max-w-[200px]">{value}</span>,
    },
    {
      header: 'Type',
      accessor: 'fraudType',
      sortable: true,
      cell: (value) => (
        <Badge color="orange" size="xs">
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
          {value?.toLocaleString() || '0'} <span className="text-gray-500 text-xs">{row.currency || 'USD'}</span>
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
      header: 'Date',
      accessor: 'createdAt',
      sortable: true,
      cell: (value) => (
        <span className="text-gray-400 text-sm">
          {value ? new Date(value).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: '_id',
      cell: (value) => (
        <Link to={`/cases/${value}`} className="text-cyan-500 hover:text-cyan-400 text-sm font-medium">
          View
        </Link>
      ),
    },
  ];

  const filteredCases = useMemo(() => {
    if (!searchQuery) return cases;
    return cases.filter(c => 
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseId?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cases, searchQuery]);

  const caseStats = {
    total: cases.length,
    active: cases.filter(c => ['submitted', 'under_review', 'evidence_verification', 'investigation'].includes(c.status)).length,
    resolved: cases.filter(c => ['resolved', 'closed'].includes(c.status)).length,
    totalLost: cases.reduce((sum, c) => sum + (c.amountLost || 0), 0),
  };

  if (loading && cases.length === 0) {
    return (
      <UserLayout title="My Cases">
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading cases..." />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="My Cases">
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">My Cases</h1>
            <p className="text-gray-400 mt-1">Manage and track all your fraud reports</p>
          </div>
          <Link to="/report-fraud">
            <Button icon={Plus}>Report New Fraud</Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Cases', value: caseStats.total, color: 'cyan' },
            { label: 'Active', value: caseStats.active, color: 'yellow' },
            { label: 'Resolved', value: caseStats.resolved, color: 'emerald' },
            { label: 'Total Lost', value: `${caseStats.totalLost.toLocaleString()}`, color: 'red' },
          ].map((stat) => (
            <Card key={stat.label} className="text-center p-4">
              <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Filters Bar */}
        <Card>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <SearchInput
              placeholder="Search by case ID or title..."
              onSearch={setSearchQuery}
              className="flex-1"
            />
            <CaseFilter
              filters={filters}
              onFilterChange={setFilters}
              onReset={() => setFilters({})}
            />
          </div>
        </Card>

        {/* Cases Table */}
        <Card>
          <DataTable
            columns={columns}
            data={filteredCases}
            searchable={false}
            filterable={false}
            pageSize={pagination.limit}
            onRowClick={(row) => window.location.href = `/cases/${row._id}`}
            emptyState={
              <EmptyState
                icon={FileText}
                title="No cases found"
                description={searchQuery ? 'No cases match your search criteria.' : 'You haven\'t reported any fraud cases yet.'}
                actionLabel="Report Your First Case"
                actionIcon={Plus}
                onAction={() => window.location.href = '/report-fraud'}
              />
            }
          />
        </Card>
      </div>
    </UserLayout>
  );
};

export default MyCases;