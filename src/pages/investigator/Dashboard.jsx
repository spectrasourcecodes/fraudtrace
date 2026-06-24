import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity, AlertTriangle, FileText, Database,
  Shield, Target, Zap, Clock, CheckCircle,
} from 'lucide-react';
import InvestigatorLayout from '../../components/layout/InvestigatorLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, RiskBadge } from '../../components/common/Badge';
import StatCard from '../../components/charts/StatCard';
import LineChartComponent from '../../components/charts/LineChart';
import PieChartComponent from '../../components/charts/PieChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { caseService } from '../../services/caseService';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const InvestigatorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [allCases, setAllCases] = useState([]);
  const [recentCases, setRecentCases] = useState([]);
  const [casesByType, setCasesByType] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [evidenceTotal, setEvidenceTotal] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all cases (with high limit)
      const casesResponse = await caseService.getCases({
        limit: 100,
        sort: '-createdAt',
      });
      
      let casesList = [];
      // Handle different response structures
      if (Array.isArray(casesResponse.data)) {
        casesList = casesResponse.data;
      } else if (casesResponse.data?.data && Array.isArray(casesResponse.data.data)) {
        casesList = casesResponse.data.data;
      } else if (casesResponse.data?.cases && Array.isArray(casesResponse.data.cases)) {
        casesList = casesResponse.data.cases;
      }
      
      console.log('Fetched cases:', casesList.length, 'cases');
      setAllCases(casesList);

      // Try to get stats from API
      let statsData = null;
      try {
        const statsResponse = await caseService.getCaseStats();
        statsData = statsResponse.data?.data || statsResponse.data;
        console.log('Stats data:', statsData);
      } catch (statsErr) {
        console.warn('Stats endpoint failed, calculating from cases:', statsErr.message);
      }

      // Try to get evidence stats
      try {
        const evidenceResponse = await api.get('/api/evidence/stats');
        const evidenceData = evidenceResponse.data?.data || evidenceResponse.data;
        setEvidenceTotal(evidenceData?.totalFiles || 0);
      } catch (evErr) {
        console.warn('Evidence stats failed:', evErr.message);
        setEvidenceTotal(0);
      }

      // Calculate stats from actual case data
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const calculatedStats = {
        openCases: casesList.filter(c => 
          ['submitted', 'under_review', 'evidence_verification', 'investigation'].includes(c.status)
        ).length,
        highRiskCases: casesList.filter(c => 
          c.riskLevel === 'critical' || c.riskLevel === 'high'
        ).length,
        newToday: casesList.filter(c => new Date(c.createdAt) >= today).length,
        resolvedThisMonth: casesList.filter(c => 
          c.status === 'resolved' && new Date(c.updatedAt || c.createdAt) >= thisMonth
        ).length,
        totalCases: casesList.length,
        unassigned: casesList.filter(c => !c.assignedInvestigator).length,
        escalated: casesList.filter(c => c.status === 'escalated').length,
      };

      setStats(calculatedStats);
      setRecentCases(casesList.slice(0, 10));

      // Build cases by type data
      const typeMap = {};
      casesList.forEach(c => {
        const type = c.fraudType || 'other';
        typeMap[type] = (typeMap[type] || 0) + 1;
      });
      
      const typeData = Object.entries(typeMap).map(([key, value]) => ({
        name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value,
        color: getTypeColor(key),
      }));
      setCasesByType(typeData);

      // Build monthly trends
      const monthMap = {};
      casesList.forEach(c => {
        const date = new Date(c.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthMap[key]) {
          monthMap[key] = { cases: 0, resolved: 0 };
        }
        monthMap[key].cases++;
        if (c.status === 'resolved') monthMap[key].resolved++;
      });

      const trends = Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([key, value]) => {
          const [year, month] = key.split('-');
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return {
            name: `${monthNames[parseInt(month) - 1]} ${year.slice(2)}`,
            cases: value.cases,
            resolved: value.resolved,
          };
        });
      setMonthlyTrends(trends);

      console.log('Calculated stats:', calculatedStats);
      console.log('Type data:', typeData);
      console.log('Monthly trends:', trends);

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
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

  const formatAmount = (amount, currency = 'USD') => {
    if (!amount && amount !== 0) return 'N/A';
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return `${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  if (loading) {
    return (
      <InvestigatorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading command center..." />
        </div>
      </InvestigatorLayout>
    );
  }

  return (
    <InvestigatorLayout>
      <div className="space-y-6">
        {/* Welcome Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card variant="glow">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Investigator Command Center</h1>
                <p className="text-cyan-400 text-sm mt-1">
                  {stats?.totalCases || 0} Total Cases • {stats?.openCases || 0} Active
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-500">SYSTEM ACTIVE</span>
                </span>
                <Button variant="outline" size="sm" onClick={fetchDashboardData}>Refresh</Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard title="Total Cases" value={stats?.totalCases || 0} icon={Target} color="blue" />
          <StatCard title="Open Cases" value={stats?.openCases || 0} icon={Activity} color="cyan" />
          <StatCard title="High Risk" value={stats?.highRiskCases || 0} icon={AlertTriangle} color="red" />
          <StatCard title="New Today" value={stats?.newToday || 0} icon={FileText} color="emerald" />
          <StatCard title="Resolved" value={stats?.resolvedThisMonth || 0} icon={CheckCircle} color="emerald" />
          <StatCard title="Evidence" value={evidenceTotal} icon={Database} color="purple" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {monthlyTrends.length > 0 ? (
            <LineChartComponent
              data={monthlyTrends}
              lines={[
                { dataKey: 'cases', name: 'New Cases', color: '#06b6d4' },
                { dataKey: 'resolved', name: 'Resolved', color: '#10b981' },
              ]}
              xAxisKey="name"
              title="Monthly Case Trends"
              subtitle="New cases vs resolved per month"
              height={300}
            />
          ) : (
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Monthly Trends</h3>
              <p className="text-gray-500 text-center py-20">No cases data yet</p>
            </Card>
          )}

          {casesByType.length > 0 ? (
            <PieChartComponent
              data={casesByType}
              title="Cases by Fraud Type"
              subtitle="Distribution by category"
              height={300}
              donut
            />
          ) : (
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Cases by Type</h3>
              <p className="text-gray-500 text-center py-20">No cases data yet</p>
            </Card>
          )}
        </div>

        {/* Recent Cases */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Recent Cases</h2>
              <p className="text-sm text-gray-400 mt-1">Latest cases requiring attention</p>
            </div>
            <Link to="/investigator/cases">
              <Button variant="ghost" size="sm">View All Cases</Button>
            </Link>
          </div>

          {recentCases.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase border-b border-slate-700/50">
                    <th className="pb-3 font-medium">Case ID</th>
                    <th className="pb-3 font-medium">Title</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Risk</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCases.slice(0, 8).map((c) => (
                    <motion.tr
                      key={c._id}
                      whileHover={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
                      className="border-b border-slate-700/30"
                    >
                      <td className="py-3 text-sm font-mono text-cyan-500">
                        {c.caseId || c._id?.toString().slice(-8)}
                      </td>
                      <td className="py-3 text-sm text-white max-w-[200px] truncate">{c.title}</td>
                      <td className="py-3">
                        <Badge size="xs" color="orange">{c.fraudType?.replace(/_/g, ' ') || 'N/A'}</Badge>
                      </td>
                      <td className="py-3 text-sm text-white font-semibold">
                        {formatAmount(c.amountLost, c.currency)}
                        {` `} {formatAmount(c.currency)}
                      </td>
                      <td className="py-3"><StatusBadge status={c.status} size="xs" /></td>
                      <td className="py-3"><RiskBadge level={c.riskLevel} size="xs" /></td>
                      <td className="py-3 text-sm text-gray-400">{formatDate(c.createdAt)}</td>
                      <td className="py-3">
                        <Link to={`/investigator/cases/${c._id}`}>
                          <Button variant="ghost" size="xs">Investigate</Button>
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No cases in the system yet</p>
            </div>
          )}
        </Card>

        {/* Quick Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'High Priority', count: stats?.highRiskCases || 0, color: 'red', icon: AlertTriangle },
            { label: 'Unassigned', count: stats?.unassigned || 0, color: 'yellow', icon: Shield },
            { label: 'Escalated', count: stats?.escalated || 0, color: 'orange', icon: Zap },
            { label: 'Evidence Files', count: evidenceTotal, color: 'purple', icon: Database },
          ].map((item) => (
            <Card key={item.label} className="text-center p-4">
              <item.icon className={`w-5 h-5 text-${item.color}-400 mx-auto mb-2`} />
              <p className={`text-xl font-bold text-${item.color}-400`}>{item.count}</p>
              <p className="text-xs text-gray-400">{item.label}</p>
            </Card>
          ))}
        </div>
      </div>
    </InvestigatorLayout>
  );
};

export default InvestigatorDashboard;