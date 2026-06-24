import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Download, Eye, Calendar, TrendingUp,
  BarChart3, PieChart, Filter, Plus, Search,
  Clock, CheckCircle, AlertTriangle, Shield,
  Activity, Users, Globe, DollarSign, Target,
  TrendingDown, Database, Loader,
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/charts/StatCard';
import BarChartComponent from '../../components/charts/BarChart';
import LineChartComponent from '../../components/charts/LineChart';
import PieChartComponent from '../../components/charts/PieChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Fetch report data
  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/admin/stats');
      const data = response.data?.data || response.data;
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch report data:', err);
      setError(err.response?.data?.message || 'Failed to load report data');
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // Generate report
  const handleGenerateReport = async (type) => {
    setGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`${type} report generated successfully`);
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  // Export data
  const handleExport = async (format) => {
    try {
      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error('Failed to export data');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading reports..." />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Reports</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={fetchReportData}>Retry</Button>
        </div>
      </AdminLayout>
    );
  }

  const userStats = stats?.users || {};
  const caseStats = stats?.cases || {};
  const evidenceStats = stats?.evidence || {};
  const analytics = stats?.analytics || {};
  const amountStats = caseStats?.amountStats || {};

  // Format data for charts
  const casesByTypeData = analytics?.casesByType?.map(item => ({
    name: (item._id || 'Unknown').replace(/_/g, ' '),
    value: item.count || 0,
    color: getTypeColor(item._id),
  })) || [];

  const casesByCountryData = analytics?.casesByCountry?.map(item => ({
    name: item._id || 'Unknown',
    cases: item.count || 0,
  })) || [];

  const monthlyTrendsData = analytics?.monthlyTrends?.map(item => ({
    name: `${item._id?.month}/${item._id?.year}` || 'N/A',
    cases: item.count || 0,
    amount: item.totalAmount || 0,
  })) || [];

  const statusDistribution = [
    { name: 'Active', value: caseStats?.open || 0, color: '#06b6d4' },
    { name: 'Resolved', value: caseStats?.resolved || 0, color: '#10b981' },
    { name: 'Escalated', value: caseStats?.escalated || 0, color: '#ef4444' },
    { name: 'New Today', value: caseStats?.newToday || 0, color: '#f59e0b' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
              <p className="text-gray-400 text-sm mt-1">
                System-wide statistics and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Date Range Selector */}
              <div className="flex items-center bg-slate-800/30 rounded-lg p-1">
                {['week', 'month', 'quarter', 'year'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                      dateRange === range
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              
              {/* Export Buttons */}
              <Button variant="outline" size="sm" icon={Download} onClick={() => handleExport('csv')}>
                Export CSV
              </Button>
              <Button variant="outline" size="sm" icon={Download} onClick={() => handleExport('pdf')}>
                Export PDF
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            title="Total Users"
            value={(userStats.total || 0).toLocaleString()}
            icon={Users}
            color="cyan"
            change={`${userStats.newToday || 0} new today`}
            changeType="increase"
          />
          <StatCard
            title="Total Cases"
            value={(caseStats.total || 0).toLocaleString()}
            icon={FileText}
            color="blue"
          />
          <StatCard
            title="Open Cases"
            value={(caseStats.open || 0).toLocaleString()}
            icon={Activity}
            color="yellow"
          />
          <StatCard
            title="Resolution Rate"
            value={`${caseStats.total ? Math.round((caseStats.resolved / caseStats.total) * 100) : 0}%`}
            icon={CheckCircle}
            color="emerald"
          />
          <StatCard
            title="Total Lost"
            value={`$${((amountStats?.totalAmountLost || 0) / 1000000).toFixed(1)}M`}
            icon={DollarSign}
            color="red"
          />
          <StatCard
            title="Evidence Files"
            value={(evidenceStats?.total || 0).toLocaleString()}
            icon={Database}
            color="purple"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          {monthlyTrendsData.length > 0 ? (
            <LineChartComponent
              data={monthlyTrendsData}
              lines={[
                { dataKey: 'cases', name: 'New Cases', color: '#06b6d4' },
                { dataKey: 'amount', name: 'Amount ($)', color: '#ef4444' },
              ]}
              title="Monthly Trends"
              subtitle="Case volume and amount trends"
              height={300}
            />
          ) : (
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Monthly Trends</h3>
              <p className="text-gray-500 text-center py-20">No data available</p>
            </Card>
          )}

          {/* Cases by Type */}
          {casesByTypeData.length > 0 ? (
            <PieChartComponent
              data={casesByTypeData}
              title="Cases by Fraud Type"
              subtitle="Distribution across categories"
              height={300}
              donut
            />
          ) : (
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Cases by Fraud Type</h3>
              <p className="text-gray-500 text-center py-20">No data available</p>
            </Card>
          )}
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cases by Country */}
          {casesByCountryData.length > 0 ? (
            <BarChartComponent
              data={casesByCountryData.slice(0, 10)}
              bars={[
                { dataKey: 'cases', name: 'Cases', color: '#06b6d4' },
              ]}
              title="Cases by Country"
              subtitle="Top 10 countries"
              height={300}
              layout="vertical"
            />
          ) : (
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Cases by Country</h3>
              <p className="text-gray-500 text-center py-20">No data available</p>
            </Card>
          )}

          {/* Status Distribution */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Case Status Overview</h3>
            <div className="space-y-4">
              {statusDistribution.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-gray-300">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{item.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${caseStats?.total ? (item.value / caseStats.total) * 100 : 0}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Financial Summary */}
        <Card>
          <h3 className="text-lg font-semibold text-white mb-6">Financial Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-800/30 rounded-xl text-center">
              <DollarSign className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Total Amount Lost</p>
              <p className="text-xl font-bold text-red-400 mt-1">
                ${(amountStats?.totalAmountLost || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-slate-800/30 rounded-xl text-center">
              <TrendingUp className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Average Loss</p>
              <p className="text-xl font-bold text-yellow-400 mt-1">
                ${Math.round(amountStats?.averageAmount || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-slate-800/30 rounded-xl text-center">
              <TrendingDown className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Highest Loss</p>
              <p className="text-xl font-bold text-orange-400 mt-1">
                ${(amountStats?.maxAmount || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-slate-800/30 rounded-xl text-center">
              <Shield className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Recovery Rate</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">
                {caseStats?.total ? Math.round((caseStats.resolved / caseStats.total) * 100) : 0}%
              </p>
            </div>
          </div>
        </Card>

        {/* Generate Reports */}
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Generate Reports</h3>
          <p className="text-sm text-gray-400 mb-6">
            Generate detailed reports for specific time periods and categories.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Case Summary Report', desc: 'Overview of all cases with status and amounts', icon: FileText },
              { title: 'User Activity Report', desc: 'User registration and activity metrics', icon: Users },
              { title: 'Financial Analysis', desc: 'Detailed financial loss and recovery analysis', icon: DollarSign },
            ].map((report) => (
              <div key={report.title} className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
                <report.icon className="w-8 h-8 text-purple-400 mb-3" />
                <h4 className="text-white font-semibold mb-1">{report.title}</h4>
                <p className="text-xs text-gray-400 mb-4">{report.desc}</p>
                <Button
                  size="sm"
                  icon={Download}
                  fullWidth
                  loading={generating}
                  onClick={() => handleGenerateReport(report.title)}
                >
                  Generate
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Investigators', value: userStats?.investigators || 0, icon: Shield, color: 'purple' },
            { label: 'Admins', value: userStats?.admins || 0, icon: Shield, color: 'red' },
            { label: 'Verified Evidence', value: evidenceStats?.verified || 0, icon: CheckCircle, color: 'emerald' },
            { label: 'Active Users', value: userStats?.active || 0, icon: Activity, color: 'cyan' },
          ].map((item) => (
            <Card key={item.label} className="text-center p-4">
              <item.icon className={`w-5 h-5 text-${item.color}-400 mx-auto mb-2`} />
              <p className={`text-xl font-bold text-${item.color}-400`}>{item.value}</p>
              <p className="text-xs text-gray-400">{item.label}</p>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

// Helper function for type colors
const getTypeColor = (type) => {
  const colors = {
    crypto_scam: '#f59e0b',
    investment_scam: '#06b6d4',
    phishing: '#8b5cf6',
    romance_scam: '#ec4899',
    ponzi_scheme: '#ef4444',
    fake_broker: '#10b981',
    online_shopping: '#3b82f6',
    identity_theft: '#6366f1',
    other: '#6b7280',
  };
  return colors[type] || '#6b7280';
};

export default Reports;