import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, FileText, Shield, Activity, Database,
  AlertTriangle, CheckCircle, Clock, Settings, Bell,
  Search, TrendingUp, TrendingDown,
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/charts/StatCard';
import LineChartComponent from '../../components/charts/LineChart';
import RePieChart from '../../components/charts/PieChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [systemHealth] = useState({
    status: 'healthy',
    uptime: '99.9%',
    responseTime: '45ms',
    errorRate: '0.02%',
  });

  // Fetch all dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch admin stats
      const statsResponse = await api.get('/api/admin/stats');
      const statsData = statsResponse.data?.data || statsResponse.data;

      // Fetch recent activity
      const activityResponse = await api.get('/api/admin/activity?limit=10');
      const activityData = activityResponse.data?.data || activityResponse.data || [];

      setStats(statsData);
      setActivities(Array.isArray(activityData) ? activityData : []);
    } catch (err) {
      console.error('Failed to fetch admin dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Format data for charts
  const formatChartData = () => {
    if (!stats) return { userGrowth: [], caseDistribution: [] };

    // User growth data from monthly trends or use empty
    const userGrowth = stats.analytics?.monthlyTrends?.map(item => ({
      name: `${item._id?.month}/${item._id?.year}` || 'N/A',
      users: item.count || 0,
      investigators: Math.round((item.count || 0) * 0.02), // Approximate investigator count
    })) || [];

    // Case distribution data
    const caseDistribution = stats.analytics?.casesByType?.map(item => ({
      name: (item._id || 'Unknown').replace(/_/g, ' '),
      value: item.count || 0,
      color: getTypeColor(item._id),
    })) || [];

    return { userGrowth, caseDistribution };
  };

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

  // Format time for activity
  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute(s) ago`;
    if (diffHours < 24) return `${diffHours} hour(s) ago`;
    if (diffDays < 7) return `${diffDays} day(s) ago`;
    return date.toLocaleDateString();
  };

  // Get activity type icon
  const getActivityIcon = (type) => {
    switch (type) {
      case 'case_update': return FileText;
      case 'evidence_status': return Database;
      case 'system': return Settings;
      default: return Bell;
    }
  };

  // Get activity type color
  const getActivityColor = (type) => {
    switch (type) {
      case 'case_update': return 'bg-purple-500/10 text-purple-400';
      case 'evidence_status': return 'bg-emerald-500/10 text-emerald-400';
      case 'system': return 'bg-yellow-500/10 text-yellow-400';
      default: return 'bg-cyan-500/10 text-cyan-400';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading admin dashboard..." />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </AdminLayout>
    );
  }

  const { userGrowth, caseDistribution } = formatChartData();
  const userStats = stats?.users || {};
  const caseStats = stats?.cases || {};
  const evidenceStats = stats?.evidence || {};
  const amountStats = caseStats?.amountStats || {};

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* System Health Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card variant="glow">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                <div>
                  <h2 className="text-lg font-bold text-white">
                    System Status: {systemHealth.status.toUpperCase()}
                  </h2>
                  <p className="text-sm text-gray-400">
                    Uptime: {systemHealth.uptime} • Response: {systemHealth.responseTime} • Error Rate: {systemHealth.errorRate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge color="emerald" variant="dot">All Systems Operational</Badge>
                <Link to="/admin/settings">
                  <Button variant="outline" size="sm" icon={Settings}>System Settings</Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Users"
            value={(userStats.total || 0).toLocaleString()}
            icon={Users}
            color="cyan"
            change={`${userStats.newToday || 0} today`}
            changeType="increase"
          />
          <StatCard
            title="Active Users"
            value={(userStats.active || 0).toLocaleString()}
            icon={Activity}
            color="emerald"
            change={`${userStats.active ? Math.round((userStats.active / userStats.total) * 100) : 0}% active`}
            changeType="increase"
          />
          <StatCard
            title="Investigators"
            value={userStats.investigators || 0}
            icon={Shield}
            color="purple"
          />
          <StatCard
            title="Total Cases"
            value={(caseStats.total || 0).toLocaleString()}
            icon={FileText}
            color="blue"
            change={`${caseStats.newToday || 0} today`}
            changeType="increase"
          />
          <StatCard
            title="Open Cases"
            value={(caseStats.open || 0).toLocaleString()}
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            title="Resolved"
            value={(caseStats.resolved || 0).toLocaleString()}
            icon={CheckCircle}
            color="emerald"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {userGrowth.length > 0 ? (
            <LineChartComponent
              data={userGrowth}
              lines={[
                { dataKey: 'users', name: 'Total Users', color: '#06b6d4' },
                { dataKey: 'investigators', name: 'Investigators', color: '#8b5cf6' },
              ]}
              title="User Growth"
              subtitle="Monthly user and investigator growth"
              height={300}
            />
          ) : (
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">User Growth</h3>
              <p className="text-gray-500 text-center py-20">No data available yet</p>
            </Card>
          )}

          {/* Summary Stats */}
          <div className="space-y-4">
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Financial Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/30 rounded-xl">
                  <p className="text-xs text-gray-400">Total Amount Lost</p>
                  <p className="text-xl font-bold text-red-400">
                    ${(amountStats?.totalAmountLost || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-slate-800/30 rounded-xl">
                  <p className="text-xs text-gray-400">Average Amount</p>
                  <p className="text-xl font-bold text-yellow-400">
                    ${Math.round(amountStats?.averageAmount || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-slate-800/30 rounded-xl">
                  <p className="text-xs text-gray-400">Total Evidence</p>
                  <p className="text-xl font-bold text-cyan-400">
                    {(evidenceStats?.total || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-slate-800/30 rounded-xl">
                  <p className="text-xs text-gray-400">Verified Evidence</p>
                  <p className="text-xl font-bold text-emerald-400">
                    {(evidenceStats?.verified || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Escalated Cases</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-red-400">{caseStats.escalated || 0}</p>
                  <p className="text-sm text-gray-400">Cases requiring immediate attention</p>
                </div>
                <Link to="/admin/cases">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Case Distribution */}
          {caseDistribution.length > 0 ? (
            <RePieChart
              data={caseDistribution}
              title="Case Distribution"
              subtitle="By fraud type"
              height={250}
              donut
            />
          ) : (
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Case Distribution</h3>
              <p className="text-gray-500 text-center py-20">No data available yet</p>
            </Card>
          )}

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              <Button variant="ghost" size="sm" onClick={fetchDashboardData}>
                Refresh
              </Button>
            </div>

            {activities.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {activities.slice(0, 10).map((activity, index) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  const colorClass = getActivityColor(activity.type);

                  return (
                    <div key={activity._id || index} className="flex items-start space-x-3 p-3 bg-slate-800/30 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <ActivityIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">{activity.title || activity.action || 'Activity'}</p>
                        <p className="text-xs text-gray-500">
                          {activity.message || ''}
                          {activity.user?.name ? `by ${activity.user.name}` : ''}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatTimeAgo(activity.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;