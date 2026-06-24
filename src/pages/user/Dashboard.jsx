import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, AlertTriangle, Activity, Clock, TrendingUp,
  Shield, CheckCircle, ArrowRight, Plus,
  Bell, Package, MessageSquare, ChevronRight,
} from 'lucide-react';
import UserLayout from '../../components/layout/UserLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, RiskBadge } from '../../components/common/Badge';
import StatCard from '../../components/charts/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import { caseService } from '../../services/caseService';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentCases, setRecentCases] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
  setLoading(true);
  setError(null);

  try {
    // Use my-stats for user-specific stats
    const [casesResponse, statsResponse, notifResponse] = await Promise.all([
      caseService.getCases({ limit: 5, sort: '-createdAt' }),
      api.get('/api/cases/my-stats'), // Use user-specific stats endpoint
      api.get('/api/notifications?limit=5'),
    ]);

    const casesData = casesResponse.data.data || casesResponse.data || [];
    const statsData = statsResponse.data.data || statsResponse.data || {};
    const notifData = notifResponse.data.data || notifResponse.data || [];

    setStats({
      activeCases: statsData.active || 0,
      pendingReview: statsData.pending || 0,
      inProgress: statsData.inProgress || 0,
      resolved: statsData.resolved || 0,
      totalCases: statsData.total || 0,
      totalAmountLost: statsData.totalAmountLost || 0,
    });

    setRecentCases(Array.isArray(casesData) ? casesData.slice(0, 5) : []);
    setNotifications(Array.isArray(notifData) ? notifData.slice(0, 5) : []);
  } catch (err) {
    console.error('Failed to fetch dashboard data:', err);
    setError(err.response?.data?.message || 'Failed to load dashboard data');
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <UserLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout title="Dashboard">
        <div className="text-center py-20">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card variant="glow" className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Welcome back, {user?.name?.split(' ')[0] || 'User'}
                </h1>
                <p className="text-gray-400 mt-1">Here's what's happening with your cases today.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/report-fraud">
                  <Button icon={Plus} size="lg">Report New Fraud</Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Active Cases" 
            value={stats?.activeCases || 0} 
            icon={Activity} 
            color="cyan" 
          />
          <StatCard 
            title="Pending Review" 
            value={stats?.pendingReview || 0} 
            icon={Clock} 
            color="yellow" 
          />
          <StatCard 
            title="In Progress" 
            value={stats?.inProgress || 0} 
            icon={TrendingUp} 
            color="purple" 
          />
          <StatCard 
            title="Resolved" 
            value={stats?.resolved || 0} 
            icon={CheckCircle} 
            color="emerald" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Cases */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">Recent Cases</h2>
                  <p className="text-sm text-gray-400">Your latest fraud reports</p>
                </div>
                <Link to="/cases">
                  <Button variant="ghost" size="sm" icon={ArrowRight}>View All</Button>
                </Link>
              </div>

              {recentCases.length > 0 ? (
                <div className="space-y-3">
                  {recentCases.map((caseItem) => (
                    <motion.div
                      key={caseItem._id || caseItem.id}
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:border-cyan-500/30 transition-all"
                    >
                      <div className="flex items-center space-x-4 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          caseItem.riskLevel === 'high' || caseItem.riskLevel === 'critical' 
                            ? 'bg-red-500/10 text-red-400' 
                            : caseItem.riskLevel === 'medium' 
                            ? 'bg-yellow-500/10 text-yellow-400' 
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{caseItem.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 font-mono">{caseItem.caseId || caseItem._id}</span>
                            <StatusBadge status={caseItem.status} size="xs" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-semibold text-white">
                            {caseItem.amountLost?.toLocaleString() || '0'} 
                            {` `}
                            {caseItem.currency || '$'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(caseItem.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Link to={`/cases/${caseItem._id || caseItem.id}`}>
                          <Button variant="ghost" size="xs">View</Button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No cases reported yet</p>
                  <Link to="/report-fraud" className="text-cyan-500 hover:text-cyan-400 text-sm mt-2 inline-block">
                    Report your first fraud case
                  </Link>
                </div>
              )}
            </Card>
          </div>

          {/* Notifications & Quick Links */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Notifications</h2>
                {notifications.filter(n => !n.read).length > 0 && (
                  <Badge color="cyan" size="xs">
                    {notifications.filter(n => !n.read).length} new
                  </Badge>
                )}
              </div>
              
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notif) => (
                    <div 
                      key={notif._id} 
                      className={`p-3 rounded-lg ${notif.read ? 'bg-transparent' : 'bg-cyan-500/5 border border-cyan-500/10'}`}
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium text-white">{notif.title}</p>
                        {!notif.read && <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0 mt-1.5" />}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No notifications</p>
              )}
              
              <Link to="/notifications" className="block text-center text-sm text-cyan-500 hover:text-cyan-400 mt-3">
                View All Notifications
              </Link>
            </Card>

            {/* Quick Actions */}
            <Card>
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { icon: AlertTriangle, label: 'Report New Fraud', path: '/report-fraud', color: 'text-red-400' },
                  { icon: Package, label: 'Upload Evidence', path: '/evidence', color: 'text-cyan-400' },
                  { icon: FileText, label: 'View My Cases', path: '/cases', color: 'text-purple-400' },
                  { icon: MessageSquare, label: 'Contact Support', path: '/support', color: 'text-emerald-400' },
                ].map((action) => (
                  <Link key={action.label} to={action.path}>
                    <motion.div whileHover={{ x: 5 }} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <action.icon className={`w-5 h-5 ${action.color}`} />
                        <span className="text-sm text-gray-300">{action.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </motion.div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default Dashboard;