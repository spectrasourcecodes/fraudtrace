import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Image, File, X, CheckCircle,
  AlertCircle, Loader, Trash2, Plus,
} from 'lucide-react';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const EvidenceUploader = ({
  onUpload,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return Image;
    if (type?.includes('pdf')) return FileText;
    if (type?.includes('word') || type?.includes('document')) return FileText;
    return File;
  };

  const validateFile = (file) => {
    const errors = [];

    if (files.length >= maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
      return errors;
    }

    if (file.size > maxSize) {
      errors.push(`File "${file.name}" is too large. Maximum size is ${formatFileSize(maxSize)}`);
    }

    if (!acceptedTypes.includes(file.type)) {
      errors.push(`File type "${file.type}" is not supported`);
    }

    // Check for duplicate file names
    const isDuplicate = files.some(f => f.file.name === file.name && f.file.size === file.size);
    if (isDuplicate) {
      errors.push(`File "${file.name}" is already added`);
    }

    return errors;
  };

  const addFiles = useCallback((newFiles) => {
    const fileArray = Array.from(newFiles);
    const validFiles = [];
    const allErrors = [];

    fileArray.forEach((file) => {
      const fileErrors = validateFile(file);
      if (fileErrors.length === 0) {
        validFiles.push({
          file,
          id: Math.random().toString(36).substr(2, 9),
          status: 'pending',
          progress: 0,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        });
      } else {
        allErrors.push(...fileErrors);
      }
    });

    if (allErrors.length > 0) {
      allErrors.forEach(error => toast.error(error));
    }

    if (validFiles.length > 0) {
      setFiles((prev) => {
        const updated = [...prev, ...validFiles].slice(0, maxFiles);
        return updated;
      });
      toast.success(`${validFiles.length} file(s) added`);
    }
  }, [files.length, maxFiles]);

  // Handle drop events
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  // Handle browse/click - THIS IS THE KEY FIX
  const handleBrowseClick = (e) => {
    // Don't trigger if clicking on buttons or file items
    if (e.target.closest('button') || e.target.closest('[data-file-item]')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    // Trigger the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };

  const removeFile = (id) => {
    setFiles((prev) => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please add files to upload');
      return;
    }

    setUploading(true);

    try {
      // Update all files to uploading status
      setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' })));

      // Simulate upload progress
      for (let i = 0; i < files.length; i++) {
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, progress: 50 } : f
        ));

        await new Promise(resolve => setTimeout(resolve, 500));

        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'uploaded', progress: 100 } : f
        ));
      }

      const uploadedFiles = files.map(f => f.file);
      
      if (onUpload) {
        onUpload(uploadedFiles);
      }

      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload failed:', error);
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' ? { ...f, status: 'error', error: 'Upload failed' } : f
      ));
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const clearAll = () => {
    files.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setFiles([]);
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input - MUST be outside the drop zone */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
        accept={acceptedTypes.join(',')}
      />

      {/* Drop Zone - Now clickable */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleBrowseClick}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center
          transition-all duration-200 cursor-pointer
          ${dragActive
            ? 'border-cyan-500 bg-cyan-500/5 scale-[1.02]'
            : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/20'
          }
        `}
      >
        <motion.div
          animate={{ scale: dragActive ? 1.05 : 1 }}
          className="space-y-4"
        >
          <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
            <Upload className="w-10 h-10 text-gray-600" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-white">
              Drag & drop files here, or <span className="text-cyan-500 underline">browse</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Maximum {maxFiles} files, up to {formatFileSize(maxSize)} each
            </p>
          </div>

          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <Image className="w-4 h-4" />
              <span>Images (JPG, PNG, GIF)</span>
            </span>
            <span className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>Documents (PDF, DOC)</span>
            </span>
          </div>
        </motion.div>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Selected Files ({files.length}/{maxFiles})
              </h3>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Clear All
              </button>
            </div>

            {files.map((fileObj) => {
              const FileIcon = getFileIcon(fileObj.file.type);
              
              return (
                <motion.div
                  key={fileObj.id}
                  data-file-item
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl group"
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {/* File Preview/Icon */}
                    <div className="relative flex-shrink-0">
                      {fileObj.preview ? (
                        <img
                          src={fileObj.preview}
                          alt={fileObj.file.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                          <FileIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Status Indicators */}
                      {fileObj.status === 'uploaded' && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                      
                      {fileObj.status === 'error' && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {fileObj.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(fileObj.file.size)}
                      </p>
                      
                      {/* Progress Bar */}
                      {fileObj.status === 'uploading' && (
                        <div className="mt-2 w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: `${fileObj.progress}%` }}
                            className="h-full bg-cyan-500 rounded-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  {fileObj.status === 'pending' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(fileObj.id);
                      }}
                      className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                  
                  {fileObj.status === 'uploaded' && (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  )}
                  
                  {fileObj.status === 'uploading' && (
                    <Loader className="w-5 h-5 text-cyan-500 animate-spin" />
                  )}
                </motion.div>
              );
            })}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={(e) => {
                  e.stopPropagation();
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
                disabled={uploading || files.length >= maxFiles}
              >
                Add More Files
              </Button>
              <Button
                type="button"
                onClick={handleUpload}
                loading={uploading}
                disabled={files.length === 0 || files.every(f => f.status === 'uploaded')}
                icon={Upload}
              >
                {uploading ? 'Uploading...' : `Upload ${files.length} File(s)`}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EvidenceUploader;