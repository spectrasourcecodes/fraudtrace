import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, AlertTriangle, FileText, Shield, Target,
  Users, Activity, TrendingUp, RefreshCw,
} from 'lucide-react';
import InvestigatorLayout from '../../components/layout/InvestigatorLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, RiskBadge } from '../../components/common/Badge';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';
import CaseFilter from '../../components/forms/CaseFilter';
import SearchInput from '../../components/forms/SearchInput';
import StatCard from '../../components/charts/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { caseService } from '../../services/caseService';
import toast from 'react-hot-toast';

const CaseList = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [viewMode, setViewMode] = useState('table');
  const [selectedCases, setSelectedCases] = useState([]);

  // Fetch cases
  useEffect(() => {
    fetchCases();
  }, [filters, pagination.page, searchQuery]);

  const fetchCases = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await caseService.getCases({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        sort: '-priority -createdAt',
        ...(searchQuery && { search: searchQuery }),
      });

      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      }

      setCases(data);
      setPagination(prev => ({
        ...prev,
        total: response.data?.total || response.data?.pagination?.total || data.length,
        pages: response.data?.pagination?.pages || Math.ceil((response.data?.total || data.length) / prev.limit),
      }));
      
      console.log('Fetched cases:', data.length);
    } catch (err) {
      console.error('Failed to fetch cases:', err);
      setError(err.response?.data?.message || 'Failed to load cases');
      toast.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from actual data
  const stats = useMemo(() => ({
    total: cases.length,
    critical: cases.filter(c => c.riskLevel === 'critical').length,
    high: cases.filter(c => c.riskLevel === 'high').length,
    unassigned: cases.filter(c => !c.assignedInvestigator).length,
    totalLoss: cases.reduce((sum, c) => sum + (c.amountLost || 0), 0),
    active: cases.filter(c => 
      ['submitted', 'under_review', 'evidence_verification', 'investigation'].includes(c.status)
    ).length,
    resolved: cases.filter(c => ['resolved', 'closed'].includes(c.status)).length,
  }), [cases]);

  const formatAmount = (amount, currency = 'USD') => {
    if (!amount && amount !== 0) return '$0';
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
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
        <span className="text-white text-sm font-medium line-clamp-1 max-w-[200px] block">{value}</span>
      ),
    },
    {
      header: 'Type',
      accessor: 'fraudType',
      sortable: true,
      cell: (value) => (
        <Badge color={value === 'crypto_scam' ? 'orange' : value === 'phishing' ? 'blue' : 'purple'} size="xs">
          {value?.replace(/_/g, ' ') || 'N/A'}
        </Badge>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amountLost',
      sortable: true,
      cell: (value, row) => (
        <span className="text-white font-semibold text-sm">{formatAmount(value, row.currency)}</span>
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
      header: 'Priority',
      accessor: 'priority',
      sortable: true,
      cell: (value) => (
        <span className={`inline-flex items-center gap-1 text-xs font-bold ${
          value === 1 ? 'text-red-400' : value === 2 ? 'text-yellow-400' : 'text-gray-400'
        }`}>
          P{value || '3'}
        </span>
      ),
    },
    {
      header: 'Investigator',
      accessor: 'assignedInvestigator',
      cell: (value) => (
        <span className={`text-xs ${!value ? 'text-red-400 italic' : 'text-gray-300'}`}>
          {value?.name || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      sortable: true,
      cell: (value) => <span className="text-gray-500 text-xs">{formatDate(value)}</span>,
    },
    {
      header: 'Action',
      accessor: '_id',
      cell: (value) => (
        <Link to={`/investigator/cases/${value}`} className="text-cyan-500 hover:text-cyan-400 text-xs font-medium">
          Investigate
        </Link>
      ),
    },
  ];

  if (loading && cases.length === 0) {
    return (
      <InvestigatorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading cases..." />
        </div>
      </InvestigatorLayout>
    );
  }

  return (
    <InvestigatorLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Case Investigations</h1>
              <p className="text-gray-400 text-sm mt-1">
                {stats.total} total • {stats.active} active • {stats.unassigned} unassigned
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}>
                {viewMode === 'table' ? 'Grid View' : 'Table View'}
              </Button>
              <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchCases}>Refresh</Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard title="Total Cases" value={stats.total} icon={FileText} color="cyan" />
          <StatCard title="Active" value={stats.active} icon={Activity} color="yellow" />
          <StatCard title="Critical" value={stats.critical} icon={AlertTriangle} color="red" />
          <StatCard title="Unassigned" value={stats.unassigned} icon={Users} color="orange" />
          <StatCard title="Total Loss" value={`$${(stats.totalLoss / 1000000).toFixed(1)}M`} icon={Shield} color="purple" />
        </div>

        {/* Filters Bar */}
        <Card>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <SearchInput
              placeholder="Search cases by ID, title, or investigator..."
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

        {/* Cases Table/Grid */}
        {viewMode === 'table' ? (
          <Card>
            <DataTable
              columns={columns}
              data={cases}
              searchable={false}
              filterable={false}
              pageSize={pagination.limit}
              onRowClick={(row) => window.location.href = `/investigator/cases/${row._id}`}
              emptyState={
                <EmptyState
                  icon={Search}
                  title="No cases found"
                  description="Try adjusting your search or filter criteria"
                />
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cases.map((c) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -2 }}
              >
                <Link to={`/investigator/cases/${c._id}`}>
                  <Card hover className="h-full">
                    <div className="flex items-start justify-between mb-3">
                      <span className="font-mono text-xs text-cyan-500">
                        {c.caseId || c._id?.toString().slice(-8)}
                      </span>
                      <RiskBadge level={c.riskLevel} size="xs" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2">{c.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge size="xs" color="orange">{c.fraudType?.replace(/_/g, ' ') || 'N/A'}</Badge>
                      <StatusBadge status={c.status} size="xs" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white font-semibold">{formatAmount(c.amountLost, c.currency)}</span>
                      <span className="text-gray-500 text-xs">{formatDate(c.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/30">
                      <span className={`text-xs ${!c.assignedInvestigator ? 'text-red-400 italic' : 'text-gray-400'}`}>
                        {c.assignedInvestigator?.name || 'Unassigned'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {c.priority === 1 ? 'P1' : c.priority === 2 ? 'P2' : 'P3'}
                      </span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </InvestigatorLayout>
  );
};

export default CaseList;