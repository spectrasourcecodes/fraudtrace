import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, FileText, AlertTriangle, Clock,
  Shield, Target, Activity, Users, Wallet, Globe,
  Send, Eye, Edit3, CheckCircle, Lock, Flag,
  Plus, Link2, ExternalLink, Download, Image,
} from 'lucide-react';
import InvestigatorLayout from '../../components/layout/InvestigatorLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, RiskBadge } from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { caseService } from '../../services/caseService';
import { evidenceService } from '../../services/evidenceService';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const InvestigationWorkspace = () => {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal states
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  
  // Note states
  const [internalNote, setInternalNote] = useState('');
  const [publicNote, setPublicNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Evidence view/download states
  const [viewingFile, setViewingFile] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // Fetch case data
  useEffect(() => {
    if (id) {
      fetchCaseData();
      fetchEvidence();
    }
  }, [id]);

  const fetchCaseData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await caseService.getCase(id);
      const data = response.data?.data || response.data;
      setCaseData(data);
      console.log('Case data loaded:', data);
    } catch (err) {
      console.error('Failed to fetch case:', err);
      setError(err.response?.data?.message || 'Failed to load case');
      toast.error('Failed to load case details');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvidence = async () => {
    try {
      const response = await evidenceService.getEvidence(id);
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      }
      setEvidence(data);
    } catch (err) {
      console.error('Failed to fetch evidence:', err);
    }
  };

  // Add internal note
  const handleAddInternalNote = async () => {
    if (!internalNote.trim()) return;
    setSubmitting(true);
    try {
      await caseService.addNote(id, { note: internalNote, isInternal: true });
      toast.success('Internal note added');
      setInternalNote('');
      fetchCaseData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  // Add public note
  const handleAddPublicNote = async () => {
    if (!publicNote.trim()) return;
    setSubmitting(true);
    try {
      await caseService.addNote(id, { note: publicNote, isInternal: false });
      toast.success('Note added');
      setPublicNote('');
      fetchCaseData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  // Escalate case
  const handleEscalate = async () => {
    setSubmitting(true);
    try {
      await caseService.updateStatus(id, 'escalated', 'Case escalated to authorities');
      toast.success('Case escalated');
      setShowEscalateModal(false);
      fetchCaseData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to escalate');
    } finally {
      setSubmitting(false);
    }
  };

  // Close case
  const handleCloseCase = async () => {
    setSubmitting(true);
    try {
      await caseService.updateStatus(id, 'resolved', 'Case resolved');
      toast.success('Case closed');
      setShowCloseModal(false);
      fetchCaseData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close case');
    } finally {
      setSubmitting(false);
    }
  };

  // Update status
  const handleStatusChange = async (newStatus) => {
    try {
      await caseService.updateStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus.replace(/_/g, ' ')}`);
      fetchCaseData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  // View evidence
  const handleViewEvidence = (file) => {
    setViewingFile(file);
    setShowViewer(true);
  };

  // Download evidence
  const handleDownloadEvidence = async (file) => {
    setDownloadingId(file._id);
    try {
      if (file.fileUrl) {
        const link = document.createElement('a');
        link.href = file.fileUrl;
        link.download = file.fileName;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const response = await api.get(`/api/evidence/${file._id}/download`, {
          responseType: 'blob',
        });
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      toast.success(`Downloaded: ${file.fileName}`);
    } catch (error) {
      console.error('Download failed:', error);
      if (file.fileUrl) {
        window.open(file.fileUrl, '_blank');
      } else {
        toast.error('Failed to download file');
      }
    } finally {
      setDownloadingId(null);
    }
  };

  // Verify/reject evidence
  const handleVerifyEvidence = async (evidenceId, status) => {
    try {
      await evidenceService.verifyEvidence(evidenceId, status);
      toast.success(`Evidence ${status}`);
      fetchEvidence();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update evidence');
    }
  };

  // Format helpers
  const formatAmount = (amount, currency = 'USD') => {
    if (!amount && amount !== 0) return 'N/A';
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

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <InvestigatorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading case..." />
        </div>
      </InvestigatorLayout>
    );
  }

  if (error || !caseData) {
    return (
      <InvestigatorLayout>
        <div className="text-center py-20">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Case</h2>
          <p className="text-gray-400 mb-6">{error || 'Case not found'}</p>
          <Link to="/investigator/cases">
            <Button icon={ArrowLeft}>Back to Cases</Button>
          </Link>
        </div>
      </InvestigatorLayout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'evidence', label: 'Evidence', icon: FileText, count: evidence.length },
    { id: 'timeline', label: 'Timeline', icon: Clock },
  ];

  return (
    <InvestigatorLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/investigator/cases" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cases</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-white">{caseData.title}</h1>
                <RiskBadge level={caseData.riskLevel} />
                {caseData.priority && (
                  <Badge color={caseData.priority === 1 ? 'red' : caseData.priority === 2 ? 'yellow' : 'gray'} size="sm">
                    P{caseData.priority}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400 flex-wrap">
                <span className="font-mono text-cyan-500">{caseData.caseId || id?.slice(-8)}</span>
                <StatusBadge status={caseData.status} />
                <span>•</span>
                <span>Reported: {formatDate(caseData.createdAt)}</span>
                <span>•</span>
                <span>{caseData.fraudType?.replace(/_/g, ' ') || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" icon={FileText}>Report</Button>
              <Button variant="warning" size="sm" icon={Flag} onClick={() => setShowEscalateModal(true)}>Escalate</Button>
              <Button variant="danger" size="sm" icon={Lock} onClick={() => setShowCloseModal(true)}>Close</Button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-800/30 rounded-xl p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-cyan-500/20 text-cyan-400 shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="bg-slate-700 text-gray-400 px-1.5 py-0.5 rounded-full text-xs">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Case Details */}
                  <Card>
                    <h2 className="text-lg font-semibold text-white mb-4">Case Details</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Amount Lost</p>
                        <p className="text-white font-bold text-xl">{formatAmount(caseData.amountLost, caseData.currency)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Incident Date</p>
                        <p className="text-white">{formatDate(caseData.incidentDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Country</p>
                        <p className="text-white">{caseData.country || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Fraud Type</p>
                        <Badge color="orange">{caseData.fraudType?.replace(/_/g, ' ') || 'N/A'}</Badge>
                      </div>
                    </div>
                    {caseData.description && (
                      <div className="mt-4">
                        <p className="text-gray-500 text-sm mb-1">Description</p>
                        <p className="text-gray-300 leading-relaxed">{caseData.description}</p>
                      </div>
                    )}
                  </Card>

                  {/* Suspect Information */}
                  {caseData.suspectWallet || caseData.suspectEmail || caseData.suspectBankAccount ? (
                    <Card variant="glow">
                      <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Suspect Information
                      </h2>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {caseData.fraudCompanyName && (
                          <div><p className="text-gray-500">Platform</p><p className="text-red-400">{caseData.fraudCompanyName}</p></div>
                        )}
                        {caseData.fraudWebsite && (
                          <div><p className="text-gray-500">Website</p><p className="text-red-400 break-all">{caseData.fraudWebsite}</p></div>
                        )}
                        {caseData.suspectWallet && (
                          <div className="col-span-2">
                            <p className="text-gray-500">Crypto Wallet</p>
                            <code className="text-xs text-red-400 break-all">{caseData.suspectWallet}</code>
                          </div>
                        )}
                        {caseData.suspectEmail && (
                          <div><p className="text-gray-500">Email</p><p className="text-red-400">{caseData.suspectEmail}</p></div>
                        )}
                        {caseData.suspectPhone && (
                          <div><p className="text-gray-500">Phone</p><p className="text-red-400">{caseData.suspectPhone}</p></div>
                        )}
                        {caseData.suspectBankAccount && (
                          <div><p className="text-gray-500">Bank Account</p><p className="text-red-400">{caseData.suspectBankAccount}</p></div>
                        )}
                      </div>
                    </Card>
                  ) : (
                    <Card>
                      <p className="text-gray-500 text-center py-8">No suspect information provided</p>
                    </Card>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <Card>
                    <h2 className="text-lg font-semibold text-white mb-4">Victim Information</h2>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-3">
                        <Users className="w-4 h-4 text-gray-500" />
                        <div><p className="text-gray-500">Name</p><p className="text-white">{caseData.user?.name || 'N/A'}</p></div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <div><p className="text-gray-500">Email</p><p className="text-white text-sm">{caseData.user?.email || 'N/A'}</p></div>
                      </div>
                      {caseData.user?.phone && (
                        <div className="flex items-center space-x-3">
                          <Activity className="w-4 h-4 text-gray-500" />
                          <div><p className="text-gray-500">Phone</p><p className="text-white">{caseData.user.phone}</p></div>
                        </div>
                      )}
                    </div>
                  </Card>

                  <Card>
                    <h2 className="text-lg font-semibold text-white mb-4">Actions</h2>
                    <div className="space-y-2">
                      <Button fullWidth variant="outline" size="sm" icon={Shield} onClick={() => handleStatusChange('escalated')}>Escalate</Button>
                      <Button fullWidth variant="outline" size="sm" icon={Lock} onClick={() => handleStatusChange('resolved')}>Mark Resolved</Button>
                      <Button fullWidth variant="outline" size="sm" icon={Flag} onClick={() => handleStatusChange('investigation')}>Continue Investigation</Button>
                    </div>
                  </Card>

                  <Card>
                    <h2 className="text-lg font-semibold text-white mb-4">Add Note</h2>
                    <textarea value={internalNote} onChange={(e) => setInternalNote(e.target.value)} rows={3}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none mb-2"
                      placeholder="Internal note (only visible to investigators)..." />
                    <Button fullWidth size="sm" icon={Send} onClick={handleAddInternalNote} loading={submitting}>Add Internal Note</Button>
                    <div className="mt-3">
                      <textarea value={publicNote} onChange={(e) => setPublicNote(e.target.value)} rows={3}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none mb-2"
                        placeholder="Public note (visible to victim)..." />
                      <Button fullWidth size="sm" icon={Send} onClick={handleAddPublicNote} loading={submitting}>Add Public Note</Button>
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {/* Evidence Tab */}
          {activeTab === 'evidence' && (
            <motion.div key="evidence" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Evidence Files ({evidence.length})</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {evidence.filter(e => e.verificationStatus === 'verified').length} verified • {evidence.filter(e => e.verificationStatus !== 'verified').length} pending
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" icon={Download}>Download All</Button>
                    <Button variant="primary" size="sm" icon={Plus}>Add Evidence</Button>
                  </div>
                </div>

                {evidence.length > 0 ? (
                  <div className="space-y-3">
                    {evidence.map((file) => (
                      <motion.div key={file._id} whileHover={{ x: 5 }}
                        className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:border-cyan-500/30 transition-all">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            file.fileType === 'image' ? 'bg-purple-500/10 text-purple-400' : 'bg-cyan-500/10 text-cyan-400'
                          }`}>
                            {file.fileType === 'image' ? <Image className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium truncate">{file.fileName}</p>
                              {file.verificationStatus === 'verified' ? (
                                <Badge size="xs" color="emerald" variant="dot">Verified</Badge>
                              ) : file.verificationStatus === 'rejected' ? (
                                <Badge size="xs" color="red" variant="dot">Rejected</Badge>
                              ) : (
                                <Badge size="xs" color="yellow" variant="dot">Pending</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span className="capitalize">{file.fileType || 'document'}</span>
                              <span>•</span>
                              <span>{formatFileSize(file.fileSize)}</span>
                              <span>•</span>
                              <span>{formatDate(file.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                          <Button variant="ghost" size="xs" icon={Eye} onClick={() => handleViewEvidence(file)}>View</Button>
                          <Button variant="ghost" size="xs" icon={Download} loading={downloadingId === file._id} onClick={() => handleDownloadEvidence(file)}>Download</Button>
                          {file.verificationStatus !== 'verified' && (
                            <Button variant="ghost" size="xs" icon={CheckCircle} className="text-emerald-400" onClick={() => handleVerifyEvidence(file._id, 'verified')}>Verify</Button>
                          )}
                          {file.verificationStatus !== 'rejected' && (
                            <Button variant="ghost" size="xs" icon={AlertTriangle} className="text-red-400" onClick={() => handleVerifyEvidence(file._id, 'rejected')}>Reject</Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No evidence files uploaded for this case</p>
                    <p className="text-sm text-gray-500 mt-2">Evidence files uploaded by the victim will appear here</p>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card>
                <h2 className="text-lg font-semibold text-white mb-6">Case Timeline</h2>
                {caseData.statusHistory && caseData.statusHistory.length > 0 ? (
                  <div className="relative">
                    {caseData.statusHistory.map((event, index) => (
                      <div key={index} className="flex items-start space-x-4 pb-8 relative">
                        {index < caseData.statusHistory.length - 1 && (
                          <div className="absolute left-4 top-10 w-0.5 h-full bg-slate-700" />
                        )}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          index === caseData.statusHistory.length - 1 ? 'bg-cyan-500/20 border-2 border-cyan-500' : 'bg-emerald-500/20 border-2 border-emerald-500'
                        }`}>
                          <CheckCircle className={`w-4 h-4 ${index === caseData.statusHistory.length - 1 ? 'text-cyan-500' : 'text-emerald-500'}`} />
                        </div>
                        <div className="flex-1 bg-slate-800/30 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <StatusBadge status={event.status} size="xs" />
                            <span className="text-xs text-gray-500">{event.timestamp ? new Date(event.timestamp).toLocaleString() : 'N/A'}</span>
                          </div>
                          {event.notes && <p className="text-sm text-gray-300">{event.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No timeline events yet</p>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Evidence Preview Modal */}
      <Modal isOpen={showViewer} onClose={() => { setShowViewer(false); setViewingFile(null); }} title={viewingFile?.fileName || 'View Evidence'} size="xl">
        {viewingFile && (
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-xl min-h-[300px] flex items-center justify-center overflow-hidden">
              {viewingFile.fileType === 'image' && viewingFile.fileUrl ? (
                <img src={viewingFile.fileUrl} alt={viewingFile.fileName} className="max-w-full max-h-[500px] object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center p-12">
                  <FileText className="w-20 h-20 text-gray-600 mb-4" />
                  <p className="text-gray-400 text-lg">Document Preview Not Available</p>
                  <p className="text-gray-500 text-sm mt-2">Download the file to view its contents</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500">File Name</p><p className="text-white font-medium">{viewingFile.fileName}</p></div>
              <div><p className="text-gray-500">File Size</p><p className="text-white">{formatFileSize(viewingFile.fileSize)}</p></div>
              <div><p className="text-gray-500">File Type</p><Badge color={viewingFile.fileType === 'image' ? 'purple' : 'cyan'} size="xs">{viewingFile.fileType || 'document'}</Badge></div>
              <div><p className="text-gray-500">Upload Date</p><p className="text-white">{formatDate(viewingFile.createdAt)}</p></div>
              <div>
                <p className="text-gray-500">Status</p>
                {viewingFile.verificationStatus === 'verified' ? (
                  <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Verified</span>
                ) : (
                  <span className="text-yellow-400 flex items-center gap-1"><Clock className="w-4 h-4" /> Pending</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
              <Button icon={Download} onClick={() => { handleDownloadEvidence(viewingFile); setShowViewer(false); }} loading={downloadingId === viewingFile._id}>Download</Button>
              {viewingFile.fileUrl && <Button variant="outline" icon={ExternalLink} onClick={() => window.open(viewingFile.fileUrl, '_blank')}>Open in New Tab</Button>}
              <div className="flex-1" />
              {viewingFile.verificationStatus !== 'verified' && (
                <Button variant="ghost" icon={CheckCircle} className="text-emerald-400" onClick={() => { handleVerifyEvidence(viewingFile._id, 'verified'); setShowViewer(false); }}>Verify</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Escalate Modal */}
      <Modal isOpen={showEscalateModal} onClose={() => setShowEscalateModal(false)} title="Escalate Case" size="md">
        <div className="space-y-4">
          <Alert type="warning" message="This will escalate the case to law enforcement authorities." />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" fullWidth onClick={() => setShowEscalateModal(false)}>Cancel</Button>
            <Button variant="danger" fullWidth onClick={handleEscalate} loading={submitting}>Confirm Escalation</Button>
          </div>
        </div>
      </Modal>

      {/* Close Case Modal */}
      <Modal isOpen={showCloseModal} onClose={() => setShowCloseModal(false)} title="Close Case" size="md">
        <div className="space-y-4">
          <Alert type="info" message="Closing the case will mark it as resolved." />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" fullWidth onClick={() => setShowCloseModal(false)}>Cancel</Button>
            <Button variant="primary" fullWidth onClick={handleCloseCase} loading={submitting}>Close Case</Button>
          </div>
        </div>
      </Modal>
    </InvestigatorLayout>
  );
};

export default InvestigationWorkspace;