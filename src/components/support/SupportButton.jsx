import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, X, Send, ExternalLink, Mail, Phone,
  HelpCircle, FileText, AlertTriangle, Shield,
  ChevronRight, Clock, CheckCircle, ArrowUp, Loader,
} from 'lucide-react';
import Button from '../common/Button';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const SupportButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('main');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  
  // Support links from API
  const [supportLinks, setSupportLinks] = useState(null);
  const [loadingLinks, setLoadingLinks] = useState(false);
  
  // Report issue form
  const [issueForm, setIssueForm] = useState({
    type: 'Technical Issue',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch support links from API
  useEffect(() => {
    fetchSupportLinks();
  }, []);

  const fetchSupportLinks = async () => {
    setLoadingLinks(true);
    try {
      const response = await api.get('/api/support/links');
      const data = response.data?.data || response.data;
      setSupportLinks(data);
    } catch (error) {
      console.error('Failed to fetch support links:', error);
      // Use default links as fallback
      setSupportLinks({
        whatsapp: 'https://wa.me/1234567890',
        telegram: 'https://t.me/fraudtracerecovery',
        email: 'mailto:support@fraudtracerecovery.com',
        phone: 'tel:+1234567890',
      });
    } finally {
      setLoadingLinks(false);
    }
  };

  // Build support channels from API data
  const supportChannels = {
    telegram: {
      label: 'Telegram Support',
      description: 'Fast response via Telegram',
      url: supportLinks?.telegram || 'https://t.me/fraudtracerecovery',
      icon: Send,
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    whatsapp: {
      label: 'WhatsApp Support',
      description: 'Chat with us on WhatsApp',
      url: supportLinks?.whatsapp || 'https://wa.me/1234567890',
      icon: MessageCircle,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    email: {
      label: 'Email Support',
      description: 'Send us an email',
      url: supportLinks?.email || 'mailto:support@fraudtracerecovery.com',
      icon: Mail,
      color: 'bg-purple-500',
      textColor: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    phone: {
      label: 'Phone Support',
      description: 'Call our support line',
      url: supportLinks?.phone || 'tel:+1234567890',
      icon: Phone,
      color: 'bg-orange-500',
      textColor: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
  };

  const faqItems = [
    {
      question: 'How do I report a fraud incident?',
      answer: 'Click on "Report Fraud" in your dashboard and follow the guided process to submit your case with all relevant details and evidence.',
    },
    {
      question: 'How long does an investigation take?',
      answer: 'Investigation timelines vary based on case complexity. Simple cases may take 2-4 weeks, while complex cases can take several months.',
    },
    {
      question: 'Is my information secure?',
      answer: 'Yes, we use end-to-end encryption and follow strict security protocols to protect your personal and case information.',
    },
    {
      question: 'Can I track my case progress?',
      answer: 'Yes, you can monitor your case status in real-time through your dashboard. You will also receive notifications for any updates.',
    },
  ];

  // Show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenChat = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSubmitIssue = async () => {
    if (!issueForm.description.trim()) {
      toast.error('Please describe your issue');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/support/tickets', {
        subject: issueForm.type,
        message: issueForm.description,
        priority: 'normal',
      });
      toast.success('Issue reported successfully');
      setIssueForm({ type: 'Technical Issue', description: '' });
      setActiveSection('main');
    } catch (error) {
      console.error('Failed to submit issue:', error);
      toast.error('Failed to submit issue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-6 w-10 h-10 bg-slate-800 border border-slate-700 rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-slate-700 transition-colors"
          >
            <ArrowUp className="w-5 h-5 text-gray-400" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Support Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setActiveSection('main');
          if (!isOpen) fetchSupportLinks(); // Refresh links when opening
        }}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-50 transition-all duration-300 ${
          isOpen
            ? 'bg-slate-800 rotate-90'
            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-400" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-white" />
            {unreadMessages > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
              >
                {unreadMessages}
              </motion.span>
            )}
          </div>
        )}
      </motion.button>

      {/* Support Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6" />
                  <h3 className="text-lg font-bold">Help & Support</h3>
                </div>
                {activeSection !== 'main' && (
                  <button
                    onClick={() => setActiveSection('main')}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                )}
              </div>
              <p className="text-sm text-white/80">How can we help you today?</p>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {activeSection === 'main' && (
                <motion.div
                  key="main"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-4 space-y-3 max-h-[400px] overflow-y-auto"
                >
                  {/* Loading State */}
                  {loadingLinks ? (
                    <div className="flex justify-center py-8">
                      <Loader className="w-6 h-6 text-cyan-500 animate-spin" />
                    </div>
                  ) : (
                    <>
                      {/* Support Channels - Now using API data */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
                          Contact Support
                        </p>
                        {Object.entries(supportChannels).map(([key, link]) => (
                          <motion.button
                            key={key}
                            whileHover={{ x: 5 }}
                            onClick={() => handleOpenChat(link.url)}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 ${link.color} rounded-xl flex items-center justify-center`}>
                                <link.icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-semibold text-gray-900">{link.label}</p>
                                <p className="text-xs text-gray-500">{link.description}</p>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          </motion.button>
                        ))}
                      </div>

                      {/* Quick Links */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
                          Quick Links
                        </p>
                        
                        <button
                          onClick={() => setActiveSection('faq')}
                          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <HelpCircle className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-700">Frequently Asked Questions</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>

                        <button
                          onClick={() => setActiveSection('report')}
                          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <AlertTriangle className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-700">Report an Issue</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </>
                  )}

                  {/* Availability */}
                  <div className="flex items-center space-x-2 p-3 bg-emerald-50 rounded-xl">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-xs text-emerald-700">Support team available 24/7</p>
                  </div>
                </motion.div>
              )}

              {/* FAQ Section */}
              {activeSection === 'faq' && (
                <motion.div
                  key="faq"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-4 space-y-3 max-h-[400px] overflow-y-auto"
                >
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Frequently Asked Questions</h4>
                  {faqItems.map((item, index) => (
                    <motion.details
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group border border-gray-200 rounded-xl overflow-hidden"
                    >
                      <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors list-none">
                        <span className="text-sm text-gray-700 pr-4">{item.question}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 group-open:rotate-90 transition-transform" />
                      </summary>
                      <p className="px-3 pb-3 text-sm text-gray-500">{item.answer}</p>
                    </motion.details>
                  ))}
                </motion.div>
              )}

              {/* Report Issue Section */}
              {activeSection === 'report' && (
                <motion.div
                  key="report"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-4 space-y-4 max-h-[400px] overflow-y-auto"
                >
                  <h4 className="text-sm font-semibold text-gray-900">Report an Issue</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Issue Type</label>
                      <select
                        value={issueForm.type}
                        onChange={(e) => setIssueForm(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      >
                        <option>Technical Issue</option>
                        <option>Account Problem</option>
                        <option>Case Related</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={issueForm.description}
                        onChange={(e) => setIssueForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                        placeholder="Describe your issue..."
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveSection('main')}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSubmitIssue}
                        loading={submitting}
                        className="flex-1"
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Avg. response: 5 min</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-emerald-600 font-medium">Online</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SupportButton;