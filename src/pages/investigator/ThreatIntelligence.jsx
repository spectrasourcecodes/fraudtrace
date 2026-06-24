import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Shield, Target, Globe, Wallet, Mail,
  Phone, AlertTriangle, ExternalLink, Plus,
  Download, Database, RefreshCw,
} from 'lucide-react';
import InvestigatorLayout from '../../components/layout/InvestigatorLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { RiskBadge } from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import StatCard from '../../components/charts/StatCard';
import SearchInput from '../../components/forms/SearchInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const ThreatIntelligence = () => {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modal states
  const [showAddThreat, setShowAddThreat] = useState(false);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Add threat form
  const [threatForm, setThreatForm] = useState({
    type: 'crypto_wallet',
    value: '',
    riskScore: 50,
    tags: '',
    notes: '',
  });

  // Fetch threats
  useEffect(() => {
    fetchThreats();
  }, []);

  const fetchThreats = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchQuery) params.append('search', searchQuery);
      
      const queryString = params.toString();
      const url = `/api/threat-intel${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching threats:', url);
      
      const response = await api.get(url);
      let data = [];
      
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      }
      
      console.log('Threats fetched:', data.length);
      setThreats(data);
    } catch (err) {
      console.error('Failed to fetch threats:', err);
      setError(err.response?.data?.message || 'Failed to load threats');
      toast.error('Failed to load threats');
    } finally {
      setLoading(false);
    }
  };

  // Add threat
  const handleAddThreat = async () => {
    if (!threatForm.value.trim()) {
      toast.error('Please enter a value');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/threat-intel', {
        type: threatForm.type,
        value: threatForm.value.trim(),
        riskScore: parseInt(threatForm.riskScore) || 50,
        tags: threatForm.tags ? threatForm.tags.split(',').map(t => t.trim()) : [],
        notes: threatForm.notes,
      });
      
      toast.success('Threat added successfully');
      setShowAddThreat(false);
      resetThreatForm();
      fetchThreats();
    } catch (err) {
      console.error('Failed to add threat:', err);
      toast.error(err.response?.data?.message || 'Failed to add threat');
    } finally {
      setSubmitting(false);
    }
  };

  const resetThreatForm = () => {
    setThreatForm({
      type: 'crypto_wallet',
      value: '',
      riskScore: 50,
      tags: '',
      notes: '',
    });
  };

  // Calculate stats
  const stats = {
    total: threats.length,
    active: threats.filter(t => t.status === 'active').length,
    monitoring: threats.filter(t => t.status === 'monitoring').length,
    highRisk: threats.filter(t => t.riskScore >= 80).length,
    critical: threats.filter(t => t.riskScore >= 90).length,
  };

  const typeIcons = {
    crypto_wallet: Wallet,
    domain: Globe,
    email: Mail,
    ip_address: Target,
    phone: Phone,
  };

  const typeColors = {
    crypto_wallet: { bg: 'bg-orange-500/10', text: 'text-orange-400', badge: 'orange' },
    domain: { bg: 'bg-blue-500/10', text: 'text-blue-400', badge: 'blue' },
    email: { bg: 'bg-purple-500/10', text: 'text-purple-400', badge: 'purple' },
    ip_address: { bg: 'bg-red-500/10', text: 'text-red-400', badge: 'red' },
    phone: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', badge: 'yellow' },
  };

  const getTypeColor = (type) => typeColors[type] || { bg: 'bg-gray-500/10', text: 'text-gray-400', badge: 'gray' };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const statusFilters = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'monitoring', label: 'Monitoring' },
    { id: 'resolved', label: 'Resolved' },
  ];

  if (loading) {
    return (
      <InvestigatorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading threat intelligence..." />
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
              <h1 className="text-2xl font-bold text-white">Threat Intelligence</h1>
              <p className="text-gray-400 text-sm mt-1">
                {stats.total} tracked entities • {stats.highRisk} high risk • {stats.critical} critical
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchThreats}>
                Refresh
              </Button>
              <Button variant="primary" size="sm" icon={Plus} onClick={() => { resetThreatForm(); setShowAddThreat(true); }}>
                Add Threat
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard title="Total" value={stats.total} icon={Database} color="cyan" />
          <StatCard title="Active" value={stats.active} icon={AlertTriangle} color="red" />
          <StatCard title="Monitoring" value={stats.monitoring} icon={Shield} color="yellow" />
          <StatCard title="High Risk" value={stats.highRisk} icon={AlertTriangle} color="orange" />
          <StatCard title="Critical" value={stats.critical} icon={AlertTriangle} color="red" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {statusFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => { setFilterStatus(filter.id); fetchThreats(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                filterStatus === filter.id
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800 border-slate-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
          <div className="flex-1" />
          <SearchInput
            placeholder="Search threats..."
            onSearch={(query) => { setSearchQuery(query); fetchThreats(); }}
            className="w-full sm:w-64"
          />
        </div>

        {/* Threats Grid */}
        {threats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {threats.map((threat) => {
              const Icon = typeIcons[threat.type] || Target;
              const color = getTypeColor(threat.type);

              return (
                <motion.div
                  key={threat._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -2 }}
                >
                  <Card className="h-full cursor-pointer" onClick={() => setSelectedThreat(threat)}>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.bg}`}>
                        <Icon className={`w-5 h-5 ${color.text}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge color={color.badge} size="xs">
                          {threat.type?.replace(/_/g, ' ') || 'unknown'}
                        </Badge>
                        <RiskBadge
                          level={threat.riskScore >= 80 ? 'critical' : threat.riskScore >= 60 ? 'high' : 'medium'}
                          size="xs"
                        />
                      </div>
                    </div>

                    <p className="text-sm text-white font-mono break-all mb-2">{threat.value}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-3">
                      <div>
                        <span className="text-gray-500">Risk:</span>{' '}
                        <span className="text-red-400 font-bold">{threat.riskScore || 50}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Cases:</span>{' '}
                        <span className="text-white">{threat.relatedCases?.length || threat.occurrences || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">First:</span> {formatDate(threat.firstSeen || threat.createdAt)}
                      </div>
                      <div>
                        <span className="text-gray-500">Last:</span> {formatDate(threat.lastSeen || threat.updatedAt)}
                      </div>
                    </div>

                    {threat.tags && threat.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {threat.tags.slice(0, 4).map((tag) => (
                          <Badge key={tag} color="gray" size="xs">{tag}</Badge>
                        ))}
                        {threat.tags.length > 4 && (
                          <Badge color="gray" size="xs">+{threat.tags.length - 4}</Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
                      <Badge
                        color={threat.status === 'active' ? 'red' : threat.status === 'monitoring' ? 'yellow' : 'emerald'}
                        variant="dot"
                        size="xs"
                      >
                        {threat.status || 'active'}
                      </Badge>
                      <Button variant="ghost" size="xs" icon={ExternalLink}>View</Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Threats Tracked</h3>
            <p className="text-gray-400 mb-4">
              {searchQuery || filterStatus !== 'all'
                ? 'No threats match your filters.'
                : 'Start tracking suspicious entities by adding your first threat.'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Button icon={Plus} onClick={() => { resetThreatForm(); setShowAddThreat(true); }}>
                Add First Threat
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add Threat Modal */}
      <Modal
        isOpen={showAddThreat}
        onClose={() => setShowAddThreat(false)}
        title="Add Threat Entity"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Threat Type</label>
            <select
              value={threatForm.type}
              onChange={(e) => setThreatForm(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="crypto_wallet">Crypto Wallet</option>
              <option value="domain">Domain</option>
              <option value="email">Email</option>
              <option value="ip_address">IP Address</option>
              <option value="phone">Phone Number</option>
            </select>
          </div>
          <Input
            label="Value *"
            value={threatForm.value}
            onChange={(e) => setThreatForm(prev => ({ ...prev, value: e.target.value }))}
            placeholder="Enter threat entity value..."
          />
          <Input
            label="Risk Score (0-100)"
            type="number"
            value={threatForm.riskScore}
            onChange={(e) => setThreatForm(prev => ({ ...prev, riskScore: e.target.value }))}
            placeholder="50"
          />
          <Input
            label="Tags (comma separated)"
            value={threatForm.tags}
            onChange={(e) => setThreatForm(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="phishing, scam, high_volume"
          />
          <div>
            <label className="block text-sm text-gray-400 mb-2">Notes</label>
            <textarea
              value={threatForm.notes}
              onChange={(e) => setThreatForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Additional notes..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" fullWidth onClick={() => setShowAddThreat(false)}>Cancel</Button>
            <Button variant="primary" fullWidth onClick={handleAddThreat} loading={submitting}>Add Threat</Button>
          </div>
        </div>
      </Modal>

      {/* Threat Detail Modal */}
      <Modal
        isOpen={!!selectedThreat}
        onClose={() => setSelectedThreat(null)}
        title="Threat Details"
        size="lg"
      >
        {selectedThreat && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Type</p>
                <Badge color={getTypeColor(selectedThreat.type).badge}>
                  {selectedThreat.type?.replace(/_/g, ' ') || 'unknown'}
                </Badge>
              </div>
              <div>
                <p className="text-gray-500">Risk Score</p>
                <p className="text-red-400 font-bold text-lg">{selectedThreat.riskScore || 50}/100</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Value</p>
                <p className="text-white font-mono break-all">{selectedThreat.value}</p>
              </div>
              <div>
                <p className="text-gray-500">First Seen</p>
                <p className="text-white">{formatDate(selectedThreat.firstSeen || selectedThreat.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500">Last Seen</p>
                <p className="text-white">{formatDate(selectedThreat.lastSeen || selectedThreat.updatedAt)}</p>
              </div>
              <div>
                <p className="text-gray-500">Related Cases</p>
                <p className="text-white">{selectedThreat.relatedCases?.length || selectedThreat.occurrences || 0}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <Badge
                  color={selectedThreat.status === 'active' ? 'red' : selectedThreat.status === 'monitoring' ? 'yellow' : 'emerald'}
                  variant="dot"
                >
                  {selectedThreat.status || 'active'}
                </Badge>
              </div>
              {selectedThreat.tags?.length > 0 && (
                <div className="col-span-2">
                  <p className="text-gray-500">Tags</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {selectedThreat.tags.map((tag) => (
                      <Badge key={tag} size="xs" color="gray">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedThreat.notes && (
                <div className="col-span-2">
                  <p className="text-gray-500">Notes</p>
                  <p className="text-gray-300">{selectedThreat.notes}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" fullWidth icon={ExternalLink}>
                View Related Cases
              </Button>
              <Button variant="primary" fullWidth icon={Target}>
                Track Entity
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </InvestigatorLayout>
  );
};

export default ThreatIntelligence;