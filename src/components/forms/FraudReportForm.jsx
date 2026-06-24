import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, DollarSign, Calendar,
  FileText, Upload, Wallet, Building,
  Mail, Phone, Link, ChevronRight,
  ChevronLeft, Save, Send, Shield,
  X, CheckCircle, Image,
} from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import toast from 'react-hot-toast';

// File validation helper
const validateEvidenceFile = (file) => {
  const errors = [];
  
  // Allowed MIME types
  const allowedMimeTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream', // Android compatibility
  ];

  // Allowed extensions
  const allowedExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.pdf', '.doc', '.docx',
  ];

  const fileName = file.name.toLowerCase();
  const fileExtension = '.' + fileName.split('.').pop();
  const fileType = file.type;

  // Check by MIME type OR extension (for Android compatibility)
  const isValidMime = allowedMimeTypes.includes(fileType);
  const isValidExtension = allowedExtensions.includes(fileExtension);

  if (!isValidMime && !isValidExtension) {
    errors.push(`"${file.name}" - File type not supported`);
  }

  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    errors.push(`"${file.name}" is too large (${sizeMB}MB). Max 10MB allowed`);
  }

  return errors;
};

const fraudTypes = [
  { value: 'investment_scam', label: 'Investment Scam', icon: '📈' },
  { value: 'crypto_scam', label: 'Crypto Scam', icon: '₿' },
  { value: 'ponzi_scheme', label: 'Ponzi Scheme', icon: '🏦' },
  { value: 'romance_scam', label: 'Romance Scam', icon: '💔' },
  { value: 'fake_broker', label: 'Fake Broker', icon: '📊' },
  { value: 'online_shopping', label: 'Shopping Scam', icon: '🛒' },
  { value: 'phishing', label: 'Phishing', icon: '🎣' },
  { value: 'identity_theft', label: 'Identity Theft', icon: '🆔' },
  { value: 'other', label: 'Other', icon: '❓' },
];

const currencies = ['USD', 'BRL', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'BTC', 'ETH', 'USDT'];

const FraudReportForm = ({ onSubmit, loading = false }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    fraudType: '',
    fraudCompanyName: '',
    fraudWebsite: '',
    amountLost: '',
    currency: 'USD',
    incidentDate: '',
    country: '',
    description: '',
    suspectWallet: '',
    suspectBankAccount: '',
    suspectEmail: '',
    suspectPhone: '',
    transactionIds: '',
  });
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Open file browser
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Handle file selection from device
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length === 0) return;

    const validFiles = [];
    const allErrors = [];

    selectedFiles.forEach((file) => {
      // Validate file
      const fileErrors = validateEvidenceFile(file);
      
      if (fileErrors.length === 0) {
        // Check duplicates
        const isDuplicate = files.some(f => f.name === file.name && f.size === file.size);
        if (isDuplicate) {
          allErrors.push(`"${file.name}" already added`);
        } else {
          validFiles.push(file);
        }
      } else {
        allErrors.push(...fileErrors);
      }

      // Check max files
      if (files.length + validFiles.length > 10) {
        allErrors.push('Maximum 10 files allowed');
      }
    });

    // Show errors
    if (allErrors.length > 0) {
      allErrors.forEach(err => toast.error(err));
    }

    // Add valid files
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles].slice(0, 10));
      toast.success(`${validFiles.length} file(s) added`);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove a file
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'document';
    return 'file';
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!formData.title.trim()) newErrors.title = 'Case title is required';
      else if (formData.title.length < 3) newErrors.title = 'Title must be at least 3 characters';
      
      if (!formData.fraudType) newErrors.fraudType = 'Please select fraud type';
      
      if (!formData.amountLost || parseFloat(formData.amountLost) <= 0) 
        newErrors.amountLost = 'Valid amount is required';
      
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      else if (formData.description.length < 10) 
        newErrors.description = 'Description must be at least 10 characters';
    }

    if (stepNumber === 2) {
      if (formData.suspectEmail && !/^\S+@\S+\.\S+$/.test(formData.suspectEmail)) {
        newErrors.suspectEmail = 'Invalid email format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(step)) {
      onSubmit?.({
        ...formData,
        evidence: files,
      });
    }
  };

  const stepTitles = ['Case Details', 'Suspect Info & Evidence', 'Review & Submit'];
  const totalSteps = 3;

  return (
    <form onSubmit={handleSubmit}>
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {stepTitles.map((title, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                step >= index + 1 ? 'border-cyan-500 bg-cyan-500 text-white' : 'border-slate-700 text-gray-500'
              }`}>
                {step > index + 1 ? '✓' : index + 1}
              </div>
              <span className={`ml-2 text-sm font-medium hidden sm:block ${
                step >= index + 1 ? 'text-white' : 'text-gray-500'
              }`}>
                {title}
              </span>
              {index < totalSteps - 1 && (
                <div className="w-8 sm:w-16 h-1 mx-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: step > index + 1 ? '100%' : '0%' }}
                    className="h-full bg-cyan-500"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Case Details */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <Input label="Case Title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Bitcoin Investment Scam by XYZ Platform" error={errors.title} icon={AlertTriangle} />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Fraud Type</label>
              {errors.fraudType && <p className="text-sm text-red-400 mb-2">{errors.fraudType}</p>}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {fraudTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, fraudType: type.value })}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      formData.fraudType === type.value
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-700 hover:border-slate-500 bg-slate-800/30'
                    }`}
                  >
                    <span className="text-xl">{type.icon}</span>
                    <p className="text-xs font-medium text-white mt-1">{type.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Amount Lost" type="number" name="amountLost" value={formData.amountLost} onChange={handleChange} placeholder="0.00" error={errors.amountLost} icon={DollarSign} />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                <select name="currency" value={formData.currency} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500">
                  {currencies.map(cur => <option key={cur} value={cur}>{cur}</option>)}
                </select>
              </div>
              <Input label="Incident Date" type="date" name="incidentDate" value={formData.incidentDate} onChange={handleChange} error={errors.incidentDate} icon={Calendar} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={6} placeholder="Describe what happened in detail..." className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 ${errors.description ? 'border-red-500' : 'border-slate-700'}`} />
              {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
              <p className="mt-1 text-xs text-gray-500">{formData.description.length}/5000</p>
            </div>
          </motion.div>
        )}

        {/* Step 2: Suspect Info & Evidence */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Fraud Company/Platform" name="fraudCompanyName" value={formData.fraudCompanyName} onChange={handleChange} placeholder="e.g., BitTrade Platform" icon={Building} />
              <Input label="Fraud Website URL" name="fraudWebsite" value={formData.fraudWebsite} onChange={handleChange} placeholder="https://scam-site.com" icon={Link} />
            </div>

            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
              <h4 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Suspect Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Crypto Wallet Address" name="suspectWallet" value={formData.suspectWallet} onChange={handleChange} placeholder="0x... or bc1..." icon={Wallet} />
                <Input label="Bank Account" name="suspectBankAccount" value={formData.suspectBankAccount} onChange={handleChange} placeholder="Account number or IBAN" icon={Building} />
                <Input label="Suspect Email" type="email" name="suspectEmail" value={formData.suspectEmail} onChange={handleChange} placeholder="suspect@example.com" error={errors.suspectEmail} icon={Mail} />
                <Input label="Suspect Phone" name="suspectPhone" value={formData.suspectPhone} onChange={handleChange} placeholder="+1234567890" icon={Phone} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Transaction IDs</label>
              <textarea name="transactionIds" value={formData.transactionIds} onChange={handleChange} rows={3} placeholder="Enter transaction IDs (one per line)..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 font-mono text-sm" />
            </div>

            {/* FILE UPLOAD SECTION */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Upload Evidence Files
              </label>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Browse Button */}
              <div
                onClick={handleBrowseClick}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/30 rounded-2xl p-8 text-center cursor-pointer transition-all"
              >
                <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                <p className="text-white font-medium">
                  Click to <span className="text-cyan-500 underline">browse</span> files
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Select files from your device
                </p>
                <p className="text-xs text-gray-600 mt-3">
                  Supported: JPG, PNG, GIF, WebP, PDF, DOC, DOCX • Max 10MB each
                </p>
              </div>

              {/* Selected Files List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">{files.length} file(s) selected</p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleBrowseClick(); }}
                      className="text-xs text-cyan-500 hover:text-cyan-400"
                    >
                      + Add more
                    </button>
                  </div>
                  {files.map((file, index) => {
                    const fileType = getFileIcon(file.name);
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                        <div className="flex items-center gap-3 min-w-0">
                          {fileType === 'image' ? (
                            <Image className="w-5 h-5 text-purple-400 flex-shrink-0" />
                          ) : (
                            <FileText className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm text-white truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                          className="p-1 hover:bg-slate-700 rounded-lg flex-shrink-0 ml-2"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <Card variant="dark">
              <h3 className="text-lg font-semibold text-white mb-4">Case Summary</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-gray-500">Title</p><p className="text-white font-medium">{formData.title}</p></div>
                <div><p className="text-gray-500">Fraud Type</p><p className="text-white capitalize">{formData.fraudType?.replace(/_/g, ' ')}</p></div>
                <div><p className="text-gray-500">Amount Lost</p><p className="text-white font-semibold text-lg">{formData.amountLost} {formData.currency}</p></div>
                <div><p className="text-gray-500">Date</p><p className="text-white">{formData.incidentDate || 'N/A'}</p></div>
                <div className="col-span-2"><p className="text-gray-500">Description</p><p className="text-gray-300 mt-1 line-clamp-3">{formData.description}</p></div>
                <div className="col-span-2">
                  <p className="text-gray-500">Evidence Files</p>
                  {files.length > 0 ? (
                    <ul className="mt-1 space-y-1">
                      {files.map((file, i) => (
                        <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          {file.name} ({formatFileSize(file.size)})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 mt-1">No files attached</p>
                  )}
                </div>
              </div>
            </Card>

            <div className="flex items-start gap-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
              <Shield className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">By submitting, you confirm all information is accurate. False reporting may result in legal consequences.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
        <div>
          {step > 1 && (
            <Button type="button" variant="ghost" onClick={handleBack} icon={ChevronLeft}>Back</Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" icon={Save}>Save Draft</Button>
          {step < totalSteps ? (
            <Button type="button" onClick={handleNext} icon={ChevronRight} iconPosition="right">Next</Button>
          ) : (
            <Button type="submit" loading={loading} icon={Send}>Submit Report</Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default FraudReportForm;