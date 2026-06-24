import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Search, Mail, Phone, Shield, Activity,
  FileText, CheckCircle, Clock, AlertTriangle,
  Eye, MessageSquare, RefreshCw,
} from 'lucide-react';
import InvestigatorLayout from '../../components/layout/InvestigatorLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SearchInput from '../../components/forms/SearchInput';
import StatCard from '../../components/charts/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const Teams = () => {
  const [investigators, setInvestigators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvestigator, setSelectedInvestigator] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [investigatorStats, setInvestigatorStats] = useState({});

  useEffect(() => {
    fetchInvestigators();
  }, []);

  const fetchInvestigators = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/users/investigators');
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      }
      
      console.log('Investigators fetched:', data.length);
      setInvestigators(data);
      await fetchInvestigatorStats(data);
    } catch (err) {
      console.error('Failed to fetch investigators:', err);
      setError(err.response?.data?.message || 'Failed to load investigators');
      toast.error('Failed to load investigators');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestigatorStats = async (investigatorsList) => {
    const statsMap = {};
    
    for (const inv of investigatorsList) {
      try {
        const casesResponse = await api.get('/api/cases', {
          params: { assignedInvestigator: inv._id, limit: 100 }
        });
        
        let casesData = [];
        if (Array.isArray(casesResponse.data)) {
          casesData = casesResponse.data;
        } else if (casesResponse.data?.data && Array.isArray(casesResponse.data.data)) {
          casesData = casesResponse.data.data;
        }

        statsMap[inv._id] = {
          totalCases: casesData.length,
          activeCases: casesData.filter(c => 
            ['submitted', 'under_review', 'evidence_verification', 'investigation'].includes(c.status)
          ).length,
          resolvedCases: casesData.filter(c => ['resolved', 'closed'].includes(c.status)).length,
          highRiskCases: casesData.filter(c => c.riskLevel === 'critical' || c.riskLevel === 'high').length,
          recentCases: casesData.slice(0, 3),
        };
      } catch (err) {
        console.warn(`Failed to fetch stats for ${inv.name}:`, err.message);
        statsMap[inv._id] = {
          totalCases: 0, activeCases: 0, resolvedCases: 0, highRiskCases: 0, recentCases: [],
        };
      }
    }
    
    setInvestigatorStats(statsMap);
  };

  const filteredInvestigators = investigators.filter(inv => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return inv.name?.toLowerCase().includes(query) || inv.email?.toLowerCase().includes(query);
  });

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleViewDetails = (investigator) => {
    setSelectedInvestigator(investigator);
    setShowDetailModal(true);
  };

  const teamStats = {
    total: investigators.length,
    active: investigators.filter(inv => inv.status === 'active').length,
    totalCases: Object.values(investigatorStats).reduce((sum, s) => sum + (s.totalCases || 0), 0),
    totalResolved: Object.values(investigatorStats).reduce((sum, s) => sum + (s.resolvedCases || 0), 0),
    totalActive: Object.values(investigatorStats).reduce((sum, s) => sum + (s.activeCases || 0), 0),
  };

  if (loading) {
    return (
      <InvestigatorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading team..." />
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
              <h1 className="text-2xl font-bold text-white">Investigation Team</h1>
              <p className="text-gray-400 text-sm mt-1">
                {teamStats.total} investigators • {teamStats.totalCases} total cases assigned
              </p>
            </div>
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchInvestigators}>Refresh</Button>
          </div>
        </motion.div>

        {/* Team Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard title="Investigators" value={teamStats.total} icon={Users} color="cyan" />
          <StatCard title="Active" value={teamStats.active} icon={Activity} color="emerald" />
          <StatCard title="Total Cases" value={teamStats.totalCases} icon={FileText} color="blue" />
          <StatCard title="Active Cases" value={teamStats.totalActive} icon={Clock} color="yellow" />
          <StatCard title="Resolved" value={teamStats.totalResolved} icon={CheckCircle} color="emerald" />
        </div>

        {/* Search */}
        <SearchInput placeholder="Search investigators by name or email..." onSearch={setSearchQuery} className="w-full" />

        {/* Investigators Grid */}
        {filteredInvestigators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInvestigators.map((investigator) => {
              const stats = investigatorStats[investigator._id] || {};
              const initials = getInitials(investigator.name);

              return (
                <motion.div key={investigator._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -2 }}>
                  <Card className="h-full">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                        investigator.status === 'active' ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-gradient-to-br from-gray-500 to-gray-700'
                      }`}>
                        <span className="text-white font-bold text-xl">{initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-semibold truncate">{investigator.name}</h3>
                          <Badge color={investigator.status === 'active' ? 'emerald' : 'yellow'} variant="dot" size="xs">{investigator.status}</Badge>
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-1">{investigator.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold text-cyan-400">{stats.totalCases || 0}</p>
                        <p className="text-xs text-gray-400">Total</p>
                      </div>
                      <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold text-emerald-400">{stats.resolvedCases || 0}</p>
                        <p className="text-xs text-gray-400">Resolved</p>
                      </div>
                      <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold text-yellow-400">{stats.activeCases || 0}</p>
                        <p className="text-xs text-gray-400">Active</p>
                      </div>
                      <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold text-red-400">{stats.highRiskCases || 0}</p>
                        <p className="text-xs text-gray-400">High Risk</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-700/30">
                      <Button variant="ghost" size="xs" icon={Eye} onClick={() => handleViewDetails(investigator)}>Details</Button>
                      <Button variant="ghost" size="xs" icon={MessageSquare}>Message</Button>
                      <div className="flex-1" />
                      <Badge size="xs" color="cyan">{stats.totalCases || 0} cases</Badge>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Investigators Found</h3>
              <p className="text-gray-400">{searchQuery ? 'No investigators match your search.' : 'No investigators in the system yet.'}</p>
            </div>
          </Card>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedInvestigator(null); }} title="Investigator Details" size="lg">
        {selectedInvestigator && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">{getInitials(selectedInvestigator.name)}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedInvestigator.name}</h3>
                <p className="text-gray-400">{selectedInvestigator.email}</p>
                <Badge color={selectedInvestigator.status === 'active' ? 'emerald' : 'yellow'} variant="dot" size="xs">{selectedInvestigator.status}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-xl">
                <Mail className="w-5 h-5 text-cyan-400" />
                <div><p className="text-xs text-gray-400">Email</p><p className="text-sm text-white">{selectedInvestigator.email}</p></div>
              </div>
              {selectedInvestigator.phone && (
                <div className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-xl">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <div><p className="text-xs text-gray-400">Phone</p><p className="text-sm text-white">{selectedInvestigator.phone}</p></div>
                </div>
              )}
              {selectedInvestigator.country && (
                <div className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-xl">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <div><p className="text-xs text-gray-400">Country</p><p className="text-sm text-white">{selectedInvestigator.country}</p></div>
                </div>
              )}
              <div className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-xl">
                <Clock className="w-5 h-5 text-yellow-400" />
                <div><p className="text-xs text-gray-400">Joined</p><p className="text-sm text-white">{selectedInvestigator.createdAt ? new Date(selectedInvestigator.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p></div>
              </div>
            </div>

            {investigatorStats[selectedInvestigator._id] && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Case Statistics</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total Cases', value: investigatorStats[selectedInvestigator._id].totalCases || 0, color: 'cyan' },
                    { label: 'Active', value: investigatorStats[selectedInvestigator._id].activeCases || 0, color: 'yellow' },
                    { label: 'Resolved', value: investigatorStats[selectedInvestigator._id].resolvedCases || 0, color: 'emerald' },
                    { label: 'High Risk', value: investigatorStats[selectedInvestigator._id].highRiskCases || 0, color: 'red' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-slate-800/30 rounded-xl p-3 text-center">
                      <p className={`text-xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                      <p className="text-xs text-gray-400">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <Button variant="outline" fullWidth icon={MessageSquare}>Send Message</Button>
              <Button variant="primary" fullWidth icon={FileText}>View Cases</Button>
            </div>
          </div>
        )}
      </Modal>
    </InvestigatorLayout>
  );
};

export default Teams;