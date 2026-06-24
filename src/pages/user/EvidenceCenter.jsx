import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Image, Search, Download,
  Eye, Trash2, CheckCircle, Clock, Package, Plus,
  X, ExternalLink, FileImage, Loader,
} from 'lucide-react';
import UserLayout from '../../components/layout/UserLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import EvidenceUploader from '../../components/forms/EvidenceUploader';
import SearchInput from '../../components/forms/SearchInput';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/feedback/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { evidenceService } from '../../services/evidenceService';
import { caseService } from '../../services/caseService';
import toast from 'react-hot-toast';

const EvidenceCenter = () => {
  const [showUploader, setShowUploader] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Data state
  const [evidence, setEvidence] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Upload state
  const [uploading, setUploading] = useState(false);
  const [selectedCaseForUpload, setSelectedCaseForUpload] = useState('');
  
  // View state
  const [viewingFile, setViewingFile] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  
  // Delete state
  const [deletingFile, setDeletingFile] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Download state
  const [downloadingId, setDownloadingId] = useState(null);

  // Fetch evidence data
  const fetchEvidence = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First get all user's cases
      const casesResponse = await caseService.getCases({ limit: 100 });
      const casesData = casesResponse.data?.data || casesResponse.data || [];
      const casesList = Array.isArray(casesData) ? casesData : [];
      setCases(casesList);

      // Then get evidence for each case
      const allEvidence = [];
      
      for (const caseItem of casesList) {
        try {
          const evidenceResponse = await evidenceService.getEvidence(caseItem._id);
          const evidenceData = evidenceResponse.data?.data || evidenceResponse.data || [];
          const evidenceList = Array.isArray(evidenceData) ? evidenceData : [];
          
          // Map evidence to include case info
          const mappedEvidence = evidenceList.map(item => ({
            ...item,
            id: item._id,
            name: item.fileName,
            type: item.fileType || getFileTypeFromMime(item.mimeType),
            size: formatFileSize(item.fileSize),
            caseId: caseItem.caseId || caseItem._id,
            caseTitle: caseItem.title,
            date: new Date(item.createdAt).toLocaleDateString(),
            verified: item.verificationStatus === 'verified',
            url: item.fileUrl,
            description: item.description || '',
          }));
          
          allEvidence.push(...mappedEvidence);
        } catch (err) {
          console.error(`Failed to fetch evidence for case ${caseItem._id}:`, err);
        }
      }
      
      setEvidence(allEvidence);
    } catch (err) {
      console.error('Failed to fetch evidence:', err);
      setError(err.response?.data?.message || 'Failed to load evidence');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  // Helper functions
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileTypeFromMime = (mimeType) => {
    if (!mimeType) return 'document';
    if (mimeType.startsWith('image/')) return 'image';
    return 'document';
  };

  const getFileIcon = (type) => {
    return type === 'image' ? FileImage : FileText;
  };

  const getFileTypeColor = (type) => {
    return type === 'image' 
      ? 'bg-purple-500/10 text-purple-400' 
      : 'bg-cyan-500/10 text-cyan-400';
  };

  const categories = [
    { id: 'all', label: 'All Files', icon: Package, count: evidence.length },
    { id: 'image', label: 'Images', icon: Image, count: evidence.filter(e => e.type === 'image').length },
    { id: 'document', label: 'Documents', icon: FileText, count: evidence.filter(e => e.type === 'document').length },
  ];

  const filteredEvidence = evidence.filter(e => {
    if (selectedCategory !== 'all' && e.type !== selectedCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return e.name?.toLowerCase().includes(query) || 
             e.caseTitle?.toLowerCase().includes(query);
    }
    return true;
  });

  // Handle View
  const handleView = (file) => {
    setViewingFile(file);
    setShowViewer(true);
  };

  // Handle Download
  const handleDownload = async (file) => {
    setDownloadingId(file.id);
    
    try {
      if (file.url) {
        // If it's an external URL or server URL
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Fallback - try to fetch and download
        const response = await evidenceService.downloadEvidence(file.id);
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      toast.success(`Downloaded: ${file.name}`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download file');
    } finally {
      setDownloadingId(null);
    }
  };

  // Handle Delete
  const handleDeleteClick = (file) => {
    setDeletingFile(file);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFile) return;
    
    setDeleting(true);
    
    try {
      await evidenceService.deleteEvidence(deletingFile.id);
      
      // Remove from state
      setEvidence(prev => prev.filter(e => e.id !== deletingFile.id));
      
      toast.success(`Deleted: ${deletingFile.name}`);
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error(error.response?.data?.message || 'Failed to delete file');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeletingFile(null);
    }
  };

  // Handle Upload
  const handleUploadComplete = async (uploadedFiles) => {
    if (!selectedCaseForUpload) {
      toast.error('Please select a case for the evidence');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      uploadedFiles.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('description', `Evidence for case`);
      formData.append('category', 'other');

      await evidenceService.uploadEvidence(selectedCaseForUpload, formData);
      
      toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
      setShowUploader(false);
      setSelectedCaseForUpload('');
      
      // Refresh evidence list
      fetchEvidence();
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.message || 'Failed to upload evidence');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <UserLayout title="Evidence Center">
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading evidence..." />
        </div>
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout title="Evidence Center">
        <div className="text-center py-20">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Evidence</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={fetchEvidence}>Retry</Button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Evidence Center">
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-white">Evidence Center</h1>
            <p className="text-gray-400 mt-1">
              {evidence.length} files • {evidence.filter(e => !e.verified).length} pending verification
            </p>
          </div>
          <Button icon={Upload} onClick={() => setShowUploader(true)}>
            Upload Evidence
          </Button>
        </motion.div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                selectedCategory === cat.id 
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                  : 'bg-slate-800/30 border-slate-700/30 text-gray-400 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <cat.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{cat.label}</span>
              </div>
              <Badge color={selectedCategory === cat.id ? 'cyan' : 'gray'} size="xs">
                {cat.count}
              </Badge>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <SearchInput 
              placeholder="Search evidence by name or case..." 
              onSearch={setSearchQuery} 
            />
          </div>
        </div>

        {/* Evidence Grid */}
        {filteredEvidence.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredEvidence.map((file) => {
                const FileIcon = getFileIcon(file.type);
                const typeColor = getFileTypeColor(file.type);
                
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    whileHover={{ y: -2 }}
                    layout
                  >
                    <Card className="p-4 h-full flex flex-col">
                      <div className="flex items-start space-x-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColor}`}>
                          <FileIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{file.size} • {file.date}</p>
                          <p className="text-xs text-cyan-500 mt-0.5 truncate">
                            Case: {file.caseTitle}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {file.verified ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500" title="Verified" />
                          ) : (
                            <Clock className="w-5 h-5 text-yellow-500" title="Pending Verification" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-auto pt-3 border-t border-slate-700/30">
                        <Button variant="ghost" size="xs" icon={Eye} onClick={() => handleView(file)}>View</Button>
                        <Button variant="ghost" size="xs" icon={Download} loading={downloadingId === file.id} onClick={() => handleDownload(file)}>Download</Button>
                        <Button variant="ghost" size="xs" icon={Trash2} className="text-red-400 hover:text-red-300 ml-auto" onClick={() => handleDeleteClick(file)}>Delete</Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="No evidence files found"
            description={searchQuery ? 'No files match your search criteria.' : 'Start by uploading evidence for your cases.'}
            actionLabel="Upload Evidence"
            actionIcon={Upload}
            onAction={() => setShowUploader(true)}
          />
        )}
      </div>

      {/* View File Modal */}
      <Modal 
        isOpen={showViewer} 
        onClose={() => { setShowViewer(false); setViewingFile(null); }}
        title={viewingFile?.name || 'View File'}
        size="xl"
      >
        {viewingFile && (
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-xl min-h-[300px] flex items-center justify-center overflow-hidden">
              {viewingFile.type === 'image' && viewingFile.url ? (
                <img 
                  src={viewingFile.url} 
                  alt={viewingFile.name}
                  className="max-w-full max-h-[400px] object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-12">
                  <FileText className="w-24 h-24 text-gray-600 mb-4" />
                  <p className="text-gray-400">Document Preview</p>
                  <p className="text-gray-500 text-sm mt-2">Download the file to view its contents</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500">File Name</p><p className="text-white">{viewingFile.name}</p></div>
              <div><p className="text-gray-500">Size</p><p className="text-white">{viewingFile.size}</p></div>
              <div><p className="text-gray-500">Type</p><Badge color={viewingFile.type === 'image' ? 'purple' : 'cyan'} size="xs">{viewingFile.type}</Badge></div>
              <div><p className="text-gray-500">Date</p><p className="text-white">{viewingFile.date}</p></div>
              <div><p className="text-gray-500">Case</p><p className="text-cyan-400">{viewingFile.caseTitle}</p></div>
              <div><p className="text-gray-500">Status</p>{viewingFile.verified ? <span className="text-emerald-400">✓ Verified</span> : <span className="text-yellow-400">⏳ Pending</span>}</div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
              <Button icon={Download} onClick={() => handleDownload(viewingFile)}>Download</Button>
              <Button variant="ghost" icon={Trash2} className="text-red-400 ml-auto" onClick={() => { setShowViewer(false); setTimeout(() => handleDeleteClick(viewingFile), 200); }}>Delete</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Upload Modal */}
      <Modal isOpen={showUploader} onClose={() => setShowUploader(false)} title="Upload Evidence" size="lg">
        <div className="space-y-4">
          {/* Case Selection */}
          {cases.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Case
              </label>
              <select
                value={selectedCaseForUpload}
                onChange={(e) => setSelectedCaseForUpload(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
              >
                <option value="">Select a case...</option>
                {cases.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.caseId || c._id} - {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* File Uploader */}
          {selectedCaseForUpload ? (
            <EvidenceUploader onUpload={handleUploadComplete} />
          ) : (
            <p className="text-center text-gray-500 py-8">Please select a case first to upload evidence</p>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeletingFile(null); }}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Evidence"
        message={`Are you sure you want to delete "${deletingFile?.name}"? This action cannot be undone.`}
        confirmText="Delete File"
        cancelText="Cancel"
        variant="danger"
      />
    </UserLayout>
  );
};

export default EvidenceCenter;