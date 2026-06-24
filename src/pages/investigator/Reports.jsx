import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Download, CheckCircle, Shield,
  Activity, RefreshCw,
} from 'lucide-react';
import InvestigatorLayout from '../../components/layout/InvestigatorLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/charts/StatCard';
import BarChartComponent from '../../components/charts/BarChart';
import LineChartComponent from '../../components/charts/LineChart';
import PieChartComponent from '../../components/charts/PieChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { caseService } from '../../services/caseService';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

// Helper function - MUST be defined before useMemo
const getTypeColor = (type) => {
  const colors = {
    crypto_scam: '#f59e0b', investment_scam: '#06b6d4', phishing: '#8b5cf6',
    romance_scam: '#ec4899', ponzi_scheme: '#ef4444', fake_broker: '#10b981',
    online_shopping: '#3b82f6', identity_theft: '#6366f1', other: '#6b7280',
  };
  return colors[type] || '#6b7280';
};

const Reports = () => {
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allCases, setAllCases] = useState([]);
  const [evidenceTotal, setEvidenceTotal] = useState(0);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);

    try {
      const casesResponse = await caseService.getCases({ limit: 500, sort: '-createdAt' });
      let casesList = [];
      if (Array.isArray(casesResponse.data)) {
        casesList = casesResponse.data;
      } else if (casesResponse.data?.data && Array.isArray(casesResponse.data.data)) {
        casesList = casesResponse.data.data;
      }
      setAllCases(casesList);

      try {
        const evidenceResponse = await api.get('/api/evidence/stats');
        setEvidenceTotal(evidenceResponse.data?.data?.totalFiles || 0);
      } catch (evErr) {
        console.warn('Evidence stats failed:', evErr.message);
      }
    } catch (err) {
      console.error('Failed to fetch report data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const active = allCases.filter(c => 
      ['submitted', 'under_review', 'evidence_verification', 'investigation'].includes(c.status)
    ).length;
    const resolved = allCases.filter(c => ['resolved', 'closed'].includes(c.status)).length;
    const total = allCases.length;

    return {
      total,
      active,
      resolved,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      resolvedThisMonth: allCases.filter(c => 
        c.status === 'resolved' && new Date(c.updatedAt || c.createdAt) >= thisMonth
      ).length,
      evidenceTotal,
    };
  }, [allCases, evidenceTotal]);

  // Performance data
  const performanceData = useMemo(() => {
    const weeklyMap = {};
    allCases.forEach(c => {
      const date = new Date(c.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const key = weekStart.toISOString().split('T')[0];
      if (!weeklyMap[key]) weeklyMap[key] = { name: key.slice(5), cases: 0, resolved: 0 };
      weeklyMap[key].cases++;
      if (c.status === 'resolved') weeklyMap[key].resolved++;
    });
    return Object.entries(weeklyMap).sort(([a], [b]) => a.localeCompare(b)).slice(-8)
      .map(([key, value]) => ({ name: new Date(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), ...value }));
  }, [allCases]);

  // Resolution data
  const resolutionData = useMemo(() => [
    { name: 'Active', value: stats.active, color: '#06b6d4' },
    { name: 'Resolved', value: stats.resolved, color: '#10b981' },
    { name: 'Escalated', value: allCases.filter(c => c.status === 'escalated').length, color: '#f59e0b' },
    { name: 'New', value: allCases.filter(c => c.status === 'submitted').length, color: '#ef4444' },
  ], [allCases, stats]);

  // Fraud trend data
  const fraudTrendData = useMemo(() => {
    const monthlyMap = {};
    allCases.forEach(c => {
      const date = new Date(c.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[key]) monthlyMap[key] = { name: key, crypto: 0, investment: 0, phishing: 0, romance: 0, other: 0 };
      const type = c.fraudType || 'other';
      if (type === 'crypto_scam') monthlyMap[key].crypto++;
      else if (type === 'investment_scam') monthlyMap[key].investment++;
      else if (type === 'phishing') monthlyMap[key].phishing++;
      else if (type === 'romance_scam') monthlyMap[key].romance++;
      else monthlyMap[key].other++;
    });
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return Object.entries(monthlyMap).sort(([a], [b]) => a.localeCompare(b)).slice(-6)
      .map(([key, value]) => {
        const [year, month] = key.split('-');
        return { name: `${monthNames[parseInt(month) - 1]} ${year.slice(2)}`, ...value };
      });
  }, [allCases]);

  // Cases by type
  const casesByTypeData = useMemo(() => {
    const typeMap = {};
    allCases.forEach(c => {
      const type = c.fraudType || 'other';
      typeMap[type] = (typeMap[type] || 0) + 1;
    });
    return Object.entries(typeMap).map(([key, value]) => ({
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
      color: getTypeColor(key),
    }));
  }, [allCases]);

  if (loading) {
    return (
      <InvestigatorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading reports..." />
        </div>
      </InvestigatorLayout>
    );
  }

  return (
    <InvestigatorLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
              <p className="text-gray-400 text-sm mt-1">Investigation performance and fraud trend analysis</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-800/30 rounded-lg p-1">
                {['week', 'month', 'quarter', 'year'].map((range) => (
                  <button key={range} onClick={() => setDateRange(range)}
                    className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${dateRange === range ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}>
                    {range}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchReportData}>Refresh</Button>
            </div>
          </div>
        </motion.div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard title="Total Cases" value={stats.total} icon={FileText} color="cyan" />
          <StatCard title="Active" value={stats.active} icon={Activity} color="yellow" />
          <StatCard title="Resolution Rate" value={`${stats.resolutionRate}%`} icon={CheckCircle} color="emerald" />
          <StatCard title="Resolved (Month)" value={stats.resolvedThisMonth} icon={CheckCircle} color="emerald" />
          <StatCard title="Evidence" value={stats.evidenceTotal} icon={FileText} color="purple" />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {performanceData.length > 0 ? (
            <LineChartComponent data={performanceData}
              lines={[
                { dataKey: 'cases', name: 'New Cases', color: '#06b6d4' },
                { dataKey: 'resolved', name: 'Resolved', color: '#10b981' },
              ]}
              title="Weekly Performance" subtitle="Cases and resolutions over time" height={300}
            />
          ) : (
            <Card><h3 className="text-lg font-semibold text-white mb-4">Weekly Performance</h3><p className="text-gray-500 text-center py-20">No data available</p></Card>
          )}
          {resolutionData.length > 0 ? (
            <PieChartComponent data={resolutionData} title="Case Status Distribution" subtitle="Current status of all cases" height={300} donut />
          ) : (
            <Card><h3 className="text-lg font-semibold text-white mb-4">Status Distribution</h3><p className="text-gray-500 text-center py-20">No data available</p></Card>
          )}
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {fraudTrendData.length > 0 ? (
            <BarChartComponent data={fraudTrendData}
              bars={[
                { dataKey: 'crypto', name: 'Crypto', color: '#f59e0b' },
                { dataKey: 'investment', name: 'Investment', color: '#06b6d4' },
                { dataKey: 'phishing', name: 'Phishing', color: '#8b5cf6' },
              ]}
              title="Fraud Type Trends" subtitle="Monthly breakdown by category" height={300} stacked
            />
          ) : (
            <Card><h3 className="text-lg font-semibold text-white mb-4">Fraud Trends</h3><p className="text-gray-500 text-center py-20">No data available</p></Card>
          )}
          {casesByTypeData.length > 0 ? (
            <PieChartComponent data={casesByTypeData} title="Cases by Fraud Type" subtitle="Distribution across categories" height={300} donut />
          ) : (
            <Card><h3 className="text-lg font-semibold text-white mb-4">Case Types</h3><p className="text-gray-500 text-center py-20">No data available</p></Card>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Cases', value: stats.total, icon: FileText, color: 'cyan' },
            { label: 'Active', value: stats.active, icon: Activity, color: 'yellow' },
            { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'emerald' },
            { label: 'Evidence Files', value: stats.evidenceTotal, icon: Shield, color: 'purple' },
          ].map((item) => (
            <Card key={item.label} className="text-center p-4">
              <item.icon className={`w-5 h-5 text-${item.color}-400 mx-auto mb-2`} />
              <p className={`text-xl font-bold text-${item.color}-400`}>{item.value}</p>
              <p className="text-xs text-gray-400">{item.label}</p>
            </Card>
          ))}
        </div>
      </div>
    </InvestigatorLayout>
  );
};

export default Reports;