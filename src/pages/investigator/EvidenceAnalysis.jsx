import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Download, Eye, CheckCircle, Clock,
  Tag, Package, ExternalLink, XCircle, Search,
  Filter, RefreshCw, Image,
} from 'lucide-react';
import InvestigatorLayout from '../../components/layout/InvestigatorLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import SearchInput from '../../components/forms/SearchInput';
import PieChartComponent from '../../components/charts/PieChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { evidenceService } from '../../services/evidenceService';
import { caseService } from '../../services/caseService';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const EvidenceAnalysis = () => {
  const [evidence, setEvidence] = useState([]);
  const [allCases, setAllCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterVerification, setFilterVerification] = useState('all');
  
  // View state
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch all evidence by getting cases first, then evidence for each case
  const fetchEvidence = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // First get all cases
      const casesResponse = await caseService.getCases({ limit: 200, sort: '-createdAt' });
      
      let casesList = [];
      if (Array.isArray(casesResponse.data)) {
        casesList = casesResponse.data;
      } else if (casesResponse.data?.data && Array.isArray(casesResponse.data.data)) {
        casesList = casesResponse.data.data;
      } else if (casesResponse.data?.cases && Array.isArray(casesResponse.data.cases)) {
        casesList = casesResponse.data.cases;
      }
      
      setAllCases(casesList);
      console.log('Fetched cases for evidence:', casesList.length);

      // Fetch evidence for each case
      const allEvidence = [];
      
      for (const caseItem of casesList) {
        try {
          const evidenceResponse = await evidenceService.getEvidence(caseItem._id);
          let evidenceList = [];
          
          if (Array.isArray(evidenceResponse.data)) {
            evidenceList = evidenceResponse.data;
          } else if (evidenceResponse.data?.data && Array.isArray(evidenceResponse.data.data)) {
            evidenceList = evidenceResponse.data.data;
          }
          
          // Add case info to each evidence item
          const mappedEvidence = evidenceList.map(item => ({
            ...item,
            _caseId: caseItem._id,
            caseTitle: caseItem.title,
            caseIdStr: caseItem.caseId || caseItem._id?.toString().slice(-8),
          }));
          
          allEvidence.push(...mappedEvidence);
        } catch (evErr) {
          // Case might not have evidence, skip
          console.log(`No evidence for case ${caseItem._id}`);
        }
      }
      
      console.log('Total evidence found:', allEvidence.length);
      setEvidence(allEvidence);
      
    } catch (err) {
      console.error('Failed to fetch evidence:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load evidence');
      toast.error('Failed to load evidence');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  // Verify evidence
  const handleVerify = async (evidenceId, status) => {
    try {
      await evidenceService.verifyEvidence(evidenceId, status);
      toast.success(`Evidence ${status}`);
      // Update local state
      setEvidence(prev => prev.map(e => 
        e._id === evidenceId ? { ...e, verificationStatus: status } : e
      ));
    } catch (err) {
      console.error('Failed to verify evidence:', err);
      toast.error(err.response?.data?.message || 'Failed to verify evidence');
    }
  };

  // Add tags
  const handleAddTag = async (evidenceId) => {
    const tag = prompt('Enter tag:');
    if (tag && tag.trim()) {
      try {
        await evidenceService.addTags(evidenceId, [tag.trim()]);
        toast.success('Tag added');
        // Update local state
        setEvidence(prev => prev.map(e => 
          e._id === evidenceId ? { ...e, tags: [...(e.tags || []), tag.trim()] } : e
        ));
      } catch (err) {
        toast.error('Failed to add tag');
      }
    }
  };

  // Handle download
  const handleDownload = (item) => {
    if (item.fileUrl) {
      window.open(item.fileUrl, '_blank');
    } else {
      toast.error('File URL not available');
    }
  };

  const handlePreview = (item) => {
    setSelectedEvidence(item);
    setShowPreview(true);
  };

  // Filter evidence
  const filteredEvidence = evidence.filter(item => {
    const fileName = (item.fileName || '').toLowerCase();
    const caseTitle = (item.caseTitle || '').toLowerCase();
    
    if (selectedCategory !== 'all' && item.fileType !== selectedCategory) return false;
    if (filterVerification === 'verified' && item.verificationStatus !== 'verified') return false;
    if (filterVerification === 'pending' && item.verificationStatus === 'verified') return false;
    if (searchQuery && 
        !fileName.includes(searchQuery.toLowerCase()) &&
        !caseTitle.includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Chart data
  const verifiedCount = evidence.filter(e => e.verificationStatus === 'verified').length;
  const pendingCount = evidence.length - verifiedCount;
  
  const chartData = [
    { name: 'Verified', value: verifiedCount, color: '#10b981' },
    { name: 'Pending', value: pendingCount, color: '#f59e0b' },
  ];

  const typeChartData = [
    { name: 'Documents', value: evidence.filter(e => e.fileType === 'document').length, color: '#06b6d4' },
    { name: 'Images', value: evidence.filter(e => e.fileType === 'image').length, color: '#8b5cf6' },
    { name: 'Other', value: evidence.filter(e => !['document', 'image'].includes(e.fileType)).length, color: '#f59e0b' },
  ];

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const categories = [
    { id: 'all', label: 'All Files' },
    { id: 'image', label: 'Images' },
    { id: 'document', label: 'Documents' },
  ];

  const verificationFilters = [
    { id: 'all', label: 'All' },
    { id: 'verified', label: 'Verified' },
    { id: 'pending', label: 'Pending' },
  ];

  if (loading) {
    return (
      <InvestigatorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading evidence..." />
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
              <h1 className="text-2xl font-bold text-white">Evidence Analysis</h1>
              <p className="text-gray-400 text-sm mt-1">
                {evidence.length} total files • {verifiedCount} verified • {pendingCount} pending
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchEvidence}>
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="text-center p-4">
            <FileText className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-cyan-400">{evidence.length}</p>
            <p className="text-xs text-gray-400">Total Files</p>
          </Card>
          <Card className="text-center p-4">
            <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-emerald-400">{verifiedCount}</p>
            <p className="text-xs text-gray-400">Verified</p>
          </Card>
          <Card className="text-center p-4">
            <Clock className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-yellow-400">{pendingCount}</p>
            <p className="text-xs text-gray-400">Pending</p>
          </Card>
          <Card className="text-center p-4">
            <Package className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-purple-400">
              {allCases.filter(c => evidence.some(e => e._caseId === c._id)).length}
            </p>
            <p className="text-xs text-gray-400">Cases with Evidence</p>
          </Card>
        </div>

        {/* Charts */}
        {evidence.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PieChartComponent data={chartData} title="Verification Status" height={250} />
            <PieChartComponent data={typeChartData} title="File Types" height={250} colors={['#06b6d4', '#8b5cf6', '#f59e0b']} />
          </div>
        )}

        {/* Filters */}
        <Card>
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800 border-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
              <span className="text-gray-600 mx-2">|</span>
              {verificationFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterVerification(filter.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    filterVerification === filter.id
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800 border-slate-700'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <SearchInput
              placeholder="Search by file name or case..."
              onSearch={setSearchQuery}
              className="w-full"
            />
          </div>
        </Card>

        {/* Evidence Grid */}
        {filteredEvidence.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvidence.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -2 }}
              >
                <Card className="p-4 h-full flex flex-col">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      item.fileType === 'image' ? 'bg-purple-500/10 text-purple-400' : 'bg-cyan-500/10 text-cyan-400'
                    }`}>
                      {item.fileType === 'image' ? <Image className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate" title={item.fileName}>
                        {item.fileName || 'Unknown File'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(item.fileSize)} • {formatDate(item.createdAt)}
                      </p>
                      <p className="text-xs text-cyan-500 mt-0.5 truncate">
                        Case: {item.caseTitle || item.caseIdStr || 'N/A'}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {item.verificationStatus === 'verified' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" title="Verified" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-500" title="Pending Verification" />
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.slice(0, 5).map((tag) => (
                        <Badge key={tag} color="gray" size="xs">{tag}</Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1 mt-auto pt-3 border-t border-slate-700/30">
                    <Button variant="ghost" size="xs" icon={Eye} onClick={() => handlePreview(item)}>View</Button>
                    <Button variant="ghost" size="xs" icon={Download} onClick={() => handleDownload(item)}>Download</Button>
                    <Button variant="ghost" size="xs" icon={Tag} onClick={() => handleAddTag(item._id)}>Tag</Button>
                    
                    {item.verificationStatus !== 'verified' ? (
                      <Button
                        variant="ghost" size="xs" icon={CheckCircle}
                        className="text-emerald-400 ml-auto"
                        onClick={() => handleVerify(item._id, 'verified')}
                      >
                        Verify
                      </Button>
                    ) : (
                      <Button
                        variant="ghost" size="xs" icon={XCircle}
                        className="text-red-400 ml-auto"
                        onClick={() => handleVerify(item._id, 'rejected')}
                      >
                        Reject
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="No evidence found"
            description={
              evidence.length === 0 
                ? 'No evidence files have been uploaded yet. Evidence will appear here when users upload files to their cases.'
                : searchQuery || selectedCategory !== 'all' || filterVerification !== 'all'
                ? 'No evidence matches your current filters. Try adjusting them.'
                : 'No evidence files available.'
            }
          />
        )}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => { setShowPreview(false); setSelectedEvidence(null); }}
        title={selectedEvidence?.fileName || 'View File'}
        size="lg"
      >
        {selectedEvidence && (
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-xl min-h-[300px] flex items-center justify-center overflow-hidden">
              {selectedEvidence.fileType === 'image' && selectedEvidence.fileUrl ? (
                <img
                  src={selectedEvidence.fileUrl}
                  alt={selectedEvidence.fileName}
                  className="max-w-full max-h-[400px] object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-12">
                  <FileText className="w-16 h-16 text-gray-600 mb-4" />
                  <p className="text-gray-400">Document Preview</p>
                  <p className="text-gray-500 text-sm mt-2">Download to view contents</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500">File Name</p><p className="text-white font-medium">{selectedEvidence.fileName}</p></div>
              <div><p className="text-gray-500">Size</p><p className="text-white">{formatFileSize(selectedEvidence.fileSize)}</p></div>
              <div><p className="text-gray-500">Type</p><Badge color={selectedEvidence.fileType === 'image' ? 'purple' : 'cyan'} size="xs">{selectedEvidence.fileType || 'unknown'}</Badge></div>
              <div><p className="text-gray-500">Date</p><p className="text-white">{formatDate(selectedEvidence.createdAt)}</p></div>
              <div><p className="text-gray-500">Case</p><p className="text-cyan-400">{selectedEvidence.caseTitle || selectedEvidence.caseIdStr}</p></div>
              <div>
                <p className="text-gray-500">Status</p>
                {selectedEvidence.verificationStatus === 'verified' ? (
                  <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Verified</span>
                ) : (
                  <span className="text-yellow-400 flex items-center gap-1"><Clock className="w-4 h-4" /> Pending</span>
                )}
              </div>
              {selectedEvidence.tags?.length > 0 && (
                <div className="col-span-2">
                  <p className="text-gray-500">Tags</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {selectedEvidence.tags.map((tag) => <Badge key={tag} size="xs" color="gray">{tag}</Badge>)}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
              <Button icon={Download} onClick={() => handleDownload(selectedEvidence)}>Download</Button>
              {selectedEvidence.fileUrl && (
                <Button variant="outline" icon={ExternalLink} onClick={() => window.open(selectedEvidence.fileUrl, '_blank')}>
                  Open
                </Button>
              )}
              {selectedEvidence.verificationStatus !== 'verified' && (
                <Button variant="ghost" icon={CheckCircle} className="text-emerald-400 ml-auto"
                  onClick={() => { handleVerify(selectedEvidence._id, 'verified'); setShowPreview(false); }}>
                  Verify
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </InvestigatorLayout>
  );
};

export default EvidenceAnalysis;