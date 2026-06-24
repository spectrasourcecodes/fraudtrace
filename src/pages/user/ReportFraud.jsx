import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserLayout from '../../components/layout/UserLayout';
import Card from '../../components/common/Card';
import FraudReportForm from '../../components/forms/FraudReportForm';
import toast from 'react-hot-toast';
import { caseService } from '../../services/caseService';
import { evidenceService } from '../../services/evidenceService';

const ReportFraud = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setLoading(true);
    
    try {
      console.log('Submitting fraud report...');
      
      // Separate evidence files from case data
      const { evidence: files, ...caseData } = formData;
      
      // Ensure amountLost is a number
      const submitData = {
        ...caseData,
        amountLost: parseFloat(caseData.amountLost) || 0,
        // Convert transactionIds from string to array if needed
        transactionIds: caseData.transactionIds 
          ? caseData.transactionIds.split('\n').filter(id => id.trim()) 
          : [],
      };

      console.log('Case data to submit:', submitData);
      
      // 1. Create the case first
      const caseResponse = await caseService.createCase(submitData);
      const newCase = caseResponse.data.data || caseResponse.data;
      const caseId = newCase._id || newCase.id;
      
      console.log('Case created:', caseId);
      toast.success('Case report submitted successfully!');
      
      // 2. Upload evidence files if any
      if (files && files.length > 0) {
        console.log(`Uploading ${files.length} evidence files...`);
        
        try {
          const evidenceFormData = new FormData();
          
          files.forEach((file, index) => {
            evidenceFormData.append('files', file);
          });
          
          evidenceFormData.append('description', `Evidence for case ${caseId}`);
          evidenceFormData.append('category', 'other');
          
          await evidenceService.uploadEvidence(caseId, evidenceFormData);
          toast.success('Evidence files uploaded successfully');
        } catch (uploadError) {
          console.error('Evidence upload failed:', uploadError);
          toast.error('Case created but evidence upload failed. You can upload later.');
        }
      }
      
      // Navigate to the case
      navigate(`/cases/${caseId}`);
      
    } catch (error) {
      console.error('Failed to submit fraud report:', error);
      
      // Show specific error messages from the server
      if (error.response?.data?.errors) {
        // Validation errors
        const errorMessages = error.response.data.errors
          .map(err => err.message || err.msg)
          .join('\n');
        toast.error(errorMessages);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to submit report. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout title="Report Fraud">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-2xl mb-4">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Report Fraud Incident</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Provide detailed information about the fraudulent activity. Your report will be reviewed by our team of expert investigators.
          </p>
        </motion.div>

        <Card variant="glow" className="border-cyan-500/30">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-cyan-400">Important Information</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-400">
                <li>• Provide as much detail as possible to help our investigation</li>
                <li>• All information is encrypted and handled with strict confidentiality</li>
                <li>• You can upload evidence files (images, PDFs, documents)</li>
                <li>• False reporting may result in legal consequences</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card>
          <FraudReportForm onSubmit={handleSubmit} loading={loading} />
        </Card>
      </div>
    </UserLayout>
  );
};

export default ReportFraud;