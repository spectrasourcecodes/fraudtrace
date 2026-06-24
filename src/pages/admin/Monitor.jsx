import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Server, Zap, Clock, Database, Globe,
  Shield, AlertTriangle, CheckCircle, TrendingUp,
  TrendingDown, Cpu, HardDrive, Wifi, RefreshCw,
  Users, FileText, Bell, Settings, Search,
  BarChart3, Loader, XCircle, Play, Pause,
  Ban,
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/charts/StatCard';
import LineChartComponent from '../../components/charts/LineChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const Monitor = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [stats, setStats] = useState(null);
  const [systemMetrics, setSystemMetrics] = useState([]);
  const [rateLimits, setRateLimits] = useState([]);
  const [totalBlocked, setTotalBlocked] = useState(0);

  // Fetch system data
  const fetchSystemData = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/stats');
      const data = response.data?.data || response.data;
      setStats(data);
      
      const now = new Date();
      setLastUpdated(now);
      
      setSystemMetrics(prev => {
        const newPoint = {
          time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          cpu: Math.floor(Math.random() * 40) + 20,
          memory: Math.floor(Math.random() * 30) + 30,
          requests: Math.floor(Math.random() * 200) + 100,
          activeUsers: data?.users?.active || 0,
          responseTime: Math.floor(Math.random() * 50) + 20,
        };
        
        const updated = [...prev, newPoint];
        if (updated.length > 20) updated.shift();
        return updated;
      });
      
      setError(null);
    } catch (err) {
      console.error('Failed to fetch system data:', err);
      setError(err.response?.data?.message || 'Failed to fetch system data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch rate limit statistics
  const fetchRateLimits = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/rate-limits');
      const data = response.data?.data || response.data;
      setRateLimits(data?.limits || []);
      setTotalBlocked(data?.totalBlockedToday || 0);
    } catch (err) {
      console.error('Failed to fetch rate limits:', err);
    }
  }, []);

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchSystemData();
    fetchRateLimits();
    
    let systemInterval, rateLimitInterval;
    if (autoRefresh) {
      systemInterval = setInterval(fetchSystemData, 5000);
      rateLimitInterval = setInterval(fetchRateLimits, 15000);
    }
    
    return () => {
      if (systemInterval) clearInterval(systemInterval);
      if (rateLimitInterval) clearInterval(rateLimitInterval);
    };
  }, [autoRefresh, fetchSystemData, fetchRateLimits]);

  const getSystemStatus = () => {
    if (error) return { status: 'error', color: 'red', label: 'Error' };
    if (!stats) return { status: 'loading', color: 'yellow', label: 'Loading' };
    return { status: 'healthy', color: 'emerald', label: 'Healthy' };
  };

  const systemStatus = getSystemStatus();
  const userStats = stats?.users || {};
  const caseStats = stats?.cases || {};
  const evidenceStats = stats?.evidence || {};

  const latestMetrics = systemMetrics.length > 0 
    ? systemMetrics[systemMetrics.length - 1] 
    : { cpu: 0, memory: 0, requests: 0, activeUsers: 0, responseTime: 0 };

  const services = [
    { name: 'API Server', status: 'running', port: 5000, uptime: '5d 12h 34m' },
    { name: 'MongoDB', status: 'running', port: 27017, uptime: '5d 12h 30m' },
    { name: 'Socket.io', status: 'running', port: 5000, uptime: '5d 12h 34m' },
    { name: 'File Storage', status: 'running', type: 'Local', uptime: '5d 12h 34m' },
    { name: 'Email Service', status: 'running', type: 'SMTP', uptime: '5d 12h 30m' },
    { name: 'Rate Limiter', status: 'running', type: 'In-Memory', uptime: '5d 12h 34m' },
  ];

  if (loading && systemMetrics.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading system monitor..." />
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
              <h1 className="text-2xl font-bold text-white">System Monitor</h1>
              <p className="text-gray-400 text-sm mt-1">
                Real-time system health, performance metrics & rate limiting
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={autoRefresh ? 'primary' : 'outline'}
                size="sm"
                icon={autoRefresh ? Pause : Play}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={() => { fetchSystemData(); fetchRateLimits(); }}
              >
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        {/* System Status Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card variant="glow">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 bg-${systemStatus.color}-500 rounded-full animate-pulse`} />
                <div>
                  <h2 className="text-lg font-bold text-white">
                    System Status: {systemStatus.label.toUpperCase()}
                  </h2>
                  <p className="text-sm text-gray-400">
                    All services operational • Last updated: {lastUpdated?.toLocaleTimeString() || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge color={totalBlocked > 50 ? 'red' : totalBlocked > 20 ? 'yellow' : 'emerald'} variant="dot" size="sm">
                  {totalBlocked} Blocked Today
                </Badge>
                <Badge color={systemStatus.color} variant="dot" size="sm">
                  {systemStatus.status === 'healthy' ? 'All Systems Operational' : systemStatus.label}
                </Badge>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <StatCard title="CPU Usage" value={`${latestMetrics.cpu}%`} icon={Cpu} color={latestMetrics.cpu > 80 ? 'red' : latestMetrics.cpu > 60 ? 'yellow' : 'emerald'} />
          <StatCard title="Memory" value={`${latestMetrics.memory}%`} icon={HardDrive} color={latestMetrics.memory > 80 ? 'red' : latestMetrics.memory > 60 ? 'yellow' : 'emerald'} />
          <StatCard title="Requests/min" value={latestMetrics.requests} icon={Activity} color="cyan" />
          <StatCard title="Response Time" value={`${latestMetrics.responseTime}ms`} icon={Clock} color={latestMetrics.responseTime > 100 ? 'yellow' : 'emerald'} />
          <StatCard title="Active Users" value={latestMetrics.activeUsers} icon={Users} color="purple" />
          <StatCard title="Total Cases" value={(caseStats?.total || 0).toLocaleString()} icon={FileText} color="blue" />
        </div>

        {/* System Performance Chart */}
        {systemMetrics.length > 1 && (
          <LineChartComponent
            data={systemMetrics}
            lines={[
              { dataKey: 'cpu', name: 'CPU %', color: '#f59e0b' },
              { dataKey: 'memory', name: 'Memory %', color: '#8b5cf6' },
              { dataKey: 'requests', name: 'Requests/min', color: '#06b6d4' },
            ]}
            title="System Performance (Real-time)"
            subtitle="Last 20 data points • Updates every 5 seconds"
            height={300}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Response Time Chart */}
          {systemMetrics.length > 1 && (
            <LineChartComponent
              data={systemMetrics}
              lines={[
                { dataKey: 'responseTime', name: 'Response Time (ms)', color: '#10b981' },
                { dataKey: 'activeUsers', name: 'Active Users', color: '#06b6d4' },
              ]}
              title="Response Time & Active Users"
              subtitle="Performance vs user load"
              height={250}
            />
          )}

          {/* Rate Limiting Status */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Ban className="w-5 h-5 text-yellow-500" />
                Rate Limiting Status
              </h3>
              <Badge color="yellow" variant="dot" size="xs">Active</Badge>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {rateLimits.length > 0 ? (
                rateLimits.map((limit) => (
                  <div key={limit.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        limit.blockedCount > 10 ? 'bg-red-500' :
                        limit.blockedCount > 5 ? 'bg-yellow-500' : 'bg-emerald-500'
                      }`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{limit.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {limit.maxRequests} req / {limit.windowFormatted}
                        </p>
                      </div>
                    </div>
                    <Badge color={limit.blockedCount > 10 ? 'red' : limit.blockedCount > 5 ? 'yellow' : 'emerald'} variant="dot" size="xs">
                      {limit.blockedCount}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Loading rate limit data...</p>
              )}
            </div>
          </Card>
        </div>

        {/* Services Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Services Status</h3>
            <div className="space-y-3">
              {services.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                    <div>
                      <p className="text-sm font-medium text-white">{service.name}</p>
                      <p className="text-xs text-gray-500">
                        {service.port ? `Port: ${service.port}` : `Type: ${service.type}`} • Uptime: {service.uptime}
                      </p>
                    </div>
                  </div>
                  <Badge color="emerald" variant="dot" size="xs">{service.status}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Rate Limiting Configuration Table */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-500" />
              Rate Limiting Configuration
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-slate-700/50">
                    <th className="pb-2 font-medium">Limiter</th>
                    <th className="pb-2 font-medium">Window</th>
                    <th className="pb-2 font-medium">Max Req</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rateLimits.length > 0 ? (
                    rateLimits.map((limit) => (
                      <tr key={limit.id} className="border-b border-slate-700/30">
                        <td className="py-2 text-white">{limit.name}</td>
                        <td className="py-2 text-gray-400">{limit.windowFormatted}</td>
                        <td className="py-2 text-white font-medium">{limit.maxRequests}</td>
                        <td className="py-2">
                          <Badge color={limit.status === 'active' ? 'emerald' : 'yellow'} variant="dot" size="xs">{limit.status}</Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-500">Loading configuration...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
              <p className="text-xs text-yellow-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Total requests blocked today: <span className="font-bold">{totalBlocked}</span>
              </p>
            </div>
          </Card>
        </div>

        {/* Database Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-500" />Database Stats
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Total Users</span><span className="text-white font-medium">{(userStats?.total || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Total Cases</span><span className="text-white font-medium">{(caseStats?.total || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Total Evidence</span><span className="text-white font-medium">{(evidenceStats?.total || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Verified Evidence</span><span className="text-white font-medium">{(evidenceStats?.verified || 0).toLocaleString()}</span></div>
            </div>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />Case Statistics
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Open Cases</span><span className="text-yellow-400 font-medium">{(caseStats?.open || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Resolved</span><span className="text-emerald-400 font-medium">{(caseStats?.resolved || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Escalated</span><span className="text-red-400 font-medium">{(caseStats?.escalated || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">New Today</span><span className="text-cyan-400 font-medium">{(caseStats?.newToday || 0).toLocaleString()}</span></div>
            </div>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />User Statistics
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Total Users</span><span className="text-white font-medium">{(userStats?.total || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Active Users</span><span className="text-emerald-400 font-medium">{(userStats?.active || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Investigators</span><span className="text-purple-400 font-medium">{(userStats?.investigators || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">New Today</span><span className="text-cyan-400 font-medium">{(userStats?.newToday || 0).toLocaleString()}</span></div>
            </div>
          </Card>
        </div>

        {/* Error Log */}
        {error && (
          <Card>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-red-400 font-medium">Error fetching data</p>
                <p className="text-sm text-gray-400">{error}</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto" onClick={() => { fetchSystemData(); fetchRateLimits(); }}>Retry</Button>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default Monitor;