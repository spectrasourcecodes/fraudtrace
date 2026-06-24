import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, FileText, AlertTriangle, Clock, MessageSquare,
  Download, Shield, Users,
  Globe, Send, CheckCircle,
} from 'lucide-react';
import UserLayout from '../../components/layout/UserLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, RiskBadge } from '../../components/common/Badge';
import { caseService } from '../../services/caseService';
import { evidenceService } from '../../services/evidenceService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const CaseDetails = () => {
  const { id } = useParams();
    const { user } = useAuth();
  const [caseData, setCaseData] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchCaseData();
    fetchEvidence();
  }, [id]);

  const fetchCaseData = async () => {
    try {
      const response = await caseService.getCase(id);
      setCaseData(response.data.data || response.data);
    } catch (err) {
      console.error('Failed to fetch case:', err);
      setError(err.response?.data?.message || 'Failed to load case details');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvidence = async () => {
    try {
      const response = await evidenceService.getEvidence(id);
      const data = response.data.data || response.data;
      setEvidence(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch evidence:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      await caseService.addNote(id, { note: newMessage, isInternal: false });
      setNewMessage('');
      // Refresh case data to show new note
      fetchCaseData();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (loading) {
    return (
      <UserLayout title="Case Details">
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading case details..." />
        </div>
      </UserLayout>
    );
  }

  if (error || !caseData) {
    return (
      <UserLayout title="Case Details">
        <div className="text-center py-20">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Case</h2>
          <p className="text-gray-400 mb-6">{error || 'Case not found'}</p>
          <Link to="/cases">
            <Button icon={ArrowLeft}>Back to Cases</Button>
          </Link>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title={`Case ${caseData.caseId || id}`}>
      <div className="space-y-6">
        {/* Back Button */}
        <Link to="/cases" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Cases</span>
        </Link>

        {/* Case Header */}
        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-white">{caseData.title}</h1>
                <RiskBadge level={caseData.riskLevel} />
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span className="font-mono text-cyan-500">{caseData.caseId}</span>
                <StatusBadge status={caseData.status} />
                <span>•</span>
                <span>Reported: {new Date(caseData.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Details */}
            <Card>
              <h2 className="text-lg font-semibold text-white mb-4">Case Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Amount Lost</p>
                  <p className="text-white font-semibold text-lg">
                    {caseData.amountLost?.toLocaleString() || '0'} {caseData.currency || 'USD'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Incident Date</p>
                  <p className="text-white">
                    {caseData.incidentDate ? new Date(caseData.incidentDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Country</p>
                  <p className="text-white">{user.country || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Fraud Type</p>
                  <Badge color="orange">{caseData.fraudType?.replace(/_/g, ' ') || 'N/A'}</Badge>
                </div>
              </div>
              {caseData.description && (
                <div className="mt-4">
                  <p className="text-gray-500 text-sm mb-1">Description</p>
                  <p className="text-gray-300">{caseData.description}</p>
                </div>
              )}
            </Card>

            {/* Evidence */}
            <Card>
              <h2 className="text-lg font-semibold text-white mb-4">
                Evidence Files ({evidence.length})
              </h2>
              {evidence.length > 0 ? (
                <div className="space-y-2">
                  {evidence.map((file) => (
                    <div key={file._id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center space-x-3 min-w-0">
                        <FileText className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">{file.fileName}</p>
                          <p className="text-xs text-gray-500">
                            {file.fileType} • {new Date(file.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="xs" icon={Download}>Download</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No evidence uploaded yet</p>
              )}
              <Link to="/evidence" className="block text-center text-sm text-cyan-500 hover:text-cyan-400 mt-4">
                Manage Evidence
              </Link>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Investigator Info */}
            <Card>
              <h2 className="text-lg font-semibold text-white mb-4">Assigned Investigator</h2>
              {caseData.assignedInvestigator ? (
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-cyan-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {caseData.assignedInvestigator?.name || 'Investigator'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {caseData.assignedInvestigator?.email || ''}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No investigator assigned yet</p>
              )}
            </Card>

            {/* Status History */}
            <Card>
              <h2 className="text-lg font-semibold text-white mb-4">Case Timeline</h2>
              {caseData.statusHistory && caseData.statusHistory.length > 0 ? (
                <div className="space-y-3">
                  {caseData.statusHistory.slice(0, 5).map((event, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <StatusBadge status={event.status} size="xs" />
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No status updates yet</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default CaseDetails;