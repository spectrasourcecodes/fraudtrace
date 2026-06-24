import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle, Mail, Phone, Send, ExternalLink,
  HelpCircle, FileText, AlertTriangle, Shield,
  ChevronRight, Clock, CheckCircle, MessageSquare,
  LifeBuoy, BookOpen, Video, Headphones, Search,
  ArrowRight, Loader,
} from 'lucide-react';
import UserLayout from '../../components/layout/UserLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

const Support = () => {
  const [activeTab, setActiveTab] = useState('contact');
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    message: '',
    priority: 'normal',
    caseId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Support links from API
  const [supportLinks, setSupportLinks] = useState(null);
  const [loadingLinks, setLoadingLinks] = useState(true);
  
  // Tickets
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

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
      });
    } finally {
      setLoadingLinks(false);
    }
  };

  // Fetch user's tickets
  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const response = await api.get('/api/support/tickets');
      setTickets(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tickets') {
      fetchTickets();
    }
  }, [activeTab]);

  // Build support channels from API data
  const supportChannels = [
    {
      id: 'telegram',
      icon: Send,
      label: 'Telegram Support',
      description: 'Fast response via Telegram',
      action: 'Open Telegram',
      url: supportLinks?.telegram || 'https://t.me/fraudtracerecovery',
      color: 'bg-blue-500',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      available: true,
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      label: 'WhatsApp Support',
      description: 'Chat with us on WhatsApp',
      action: 'Open WhatsApp',
      url: supportLinks?.whatsapp || 'https://wa.me/1234567890',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      available: true,
    },
    {
      id: 'email',
      icon: Mail,
      label: 'Email Support',
      description: 'Send us an email',
      action: 'Send Email',
      url: supportLinks?.email || 'mailto:support@fraudtracerecovery.com',
      color: 'bg-purple-500',
      textColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      available: true,
    },
    {
      id: 'phone',
      icon: Phone,
      label: 'Phone Support',
      description: 'Call our support line',
      action: 'Call Now',
      url: supportLinks?.phone || 'null',
      color: 'bg-orange-500',
      textColor: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      available: !!supportLinks?.phone,
    },
  ];

  const faqItems = [
    {
      question: 'How do I report a fraud incident?',
      answer: 'Click on "Report Fraud" in your dashboard or navigation menu. Fill out the detailed form with information about the incident, including the fraud type, amount lost, suspect details, and any evidence you have.',
    },
    {
      question: 'How long does an investigation take?',
      answer: 'Investigation timelines vary depending on case complexity. Simple cases may be resolved in 2-4 weeks, while complex international fraud cases can take several months.',
    },
    {
      question: 'What types of evidence should I submit?',
      answer: 'Submit any relevant documentation: screenshots of communications, transaction receipts, bank statements, contract agreements, email correspondence, wallet addresses, and other records.',
    },
    {
      question: 'Is my personal information secure?',
      answer: 'Yes, we use enterprise-grade encryption and follow strict data protection protocols. All personal information and case details are encrypted end-to-end.',
    },
    {
      question: 'Can I track my case progress?',
      answer: 'Yes, monitor your case status in real-time through your dashboard. You will receive email and in-app notifications for updates.',
    },
    {
      question: 'What happens after I submit a report?',
      answer: 'Your case is reviewed within 24-48 hours. An investigator may be assigned, and you can communicate with them through the platform.',
    },
    {
      question: 'Do you guarantee fund recovery?',
      answer: 'While we cannot guarantee full recovery, we have a strong track record of successful recoveries through legal channels.',
    },
    {
      question: 'How do I contact my assigned investigator?',
      answer: 'Message your investigator directly through the case details page. Go to "My Cases", select your case, and use the messaging section.',
    },
  ];

  const guides = [
    { icon: BookOpen, title: 'Getting Started Guide', desc: 'Learn the basics of using FraudTrace', category: 'beginner' },
    { icon: FileText, title: 'How to Report Fraud', desc: 'Step-by-step guide to submitting reports', category: 'reporting' },
    { icon: Video, title: 'Evidence Upload Tutorial', desc: 'Learn how to upload and manage evidence', category: 'evidence' },
    { icon: Shield, title: 'Security Best Practices', desc: 'Protect yourself from future fraud', category: 'security' },
    { icon: AlertTriangle, title: 'Understanding Fraud Types', desc: 'Learn about different fraud categories', category: 'education' },
    { icon: MessageSquare, title: 'Communicating with Investigators', desc: 'Best practices for case communication', category: 'communication' },
  ];

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    
    if (!ticketForm.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    if (!ticketForm.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSubmitting(true);
    
    try {
      await api.post('/api/support/tickets', ticketForm);
      setTicketSubmitted(true);
      toast.success('Support ticket submitted successfully!');
    } catch (error) {
      console.error('Failed to submit ticket:', error);
      toast.error(error.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChannelClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const tabs = [
    { id: 'contact', label: 'Contact Us', icon: Headphones },
    { id: 'ticket', label: 'Submit Ticket', icon: MessageSquare },
    { id: 'tickets', label: 'My Tickets', icon: FileText },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'guides', label: 'Guides', icon: BookOpen },
  ];

  return (
    <UserLayout title="Support">
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card variant="glow" className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10">
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LifeBuoy className="w-8 h-8 text-cyan-500" />
              </div>
              <h1 className="text-2xl font-bold text-white">Help & Support</h1>
              <p className="text-gray-400 mt-2 max-w-md mx-auto">
                We're here to help. Choose a support option below or browse our resources.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-800/30 rounded-xl p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-400 shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {loadingLinks ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="md" text="Loading support channels..." />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supportChannels.map((channel) => (
                  <motion.div
                    key={channel.id}
                    whileHover={{ y: -2 }}
                    className={`${channel.bgColor} border border-white/5 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg`}
                    onClick={() => handleChannelClick(channel.url)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${channel.color} rounded-xl flex items-center justify-center`}>
                          <channel.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{channel.label}</h3>
                          <p className="text-sm text-gray-400 mt-1">{channel.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {channel.available && (
                          <span className="flex items-center gap-1 text-xs text-emerald-400">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            Online
                          </span>
                        )}
                        <ExternalLink className={`w-4 h-4 ${channel.textColor}`} />
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={channel.textColor}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChannelClick(channel.url);
                        }}
                      >
                        {channel.action}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-cyan-500" />
                  <div>
                    <p className="text-white font-medium">24/7 Support Available</p>
                    <p className="text-sm text-gray-400">Average response time: 5 minutes</p>
                  </div>
                </div>
                <Badge color="emerald" variant="dot">Online</Badge>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Submit Ticket Tab */}
        {activeTab === 'ticket' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {ticketSubmitted ? (
              <Card className="text-center py-12">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Ticket Submitted!</h2>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  Your support ticket has been submitted successfully. Our team will review it and respond within 24 hours.
                </p>
                <div className="flex justify-center gap-3">
                  <Button onClick={() => { setTicketSubmitted(false); setTicketForm({ subject: '', message: '', priority: 'normal', caseId: '' }); }}>
                    Submit Another Ticket
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('tickets')}>
                    View My Tickets
                  </Button>
                </div>
              </Card>
            ) : (
              <Card>
                <h2 className="text-lg font-semibold text-white mb-6">Submit a Support Ticket</h2>
                <form onSubmit={handleSubmitTicket} className="space-y-5">
                  <Input
                    label="Subject"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief summary of your issue"
                    icon={FileText}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    >
                      <option value="low">Low - General Question</option>
                      <option value="normal">Normal - Need Help</option>
                      <option value="high">High - Urgent Issue</option>
                      <option value="urgent">Urgent - Critical Problem</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Related Case (Optional)</label>
                    <input
                      type="text"
                      value={ticketForm.caseId}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, caseId: e.target.value }))}
                      placeholder="Enter case ID if applicable"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                    <textarea
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={6}
                      placeholder="Describe your issue in detail..."
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-none"
                    />
                  </div>

                  <Button type="submit" loading={submitting} fullWidth icon={Send}>
                    Submit Ticket
                  </Button>
                </form>
              </Card>
            )}
          </motion.div>
        )}

        {/* My Tickets Tab */}
        {activeTab === 'tickets' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {loadingTickets ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="md" text="Loading tickets..." />
              </div>
            ) : tickets.length > 0 ? (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <Card key={ticket._id}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-semibold">{ticket.subject}</h3>
                        <p className="text-sm text-gray-400 mt-1">{ticket.message?.substring(0, 100)}...</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge size="xs" color={ticket.priority === 'urgent' ? 'red' : ticket.priority === 'high' ? 'orange' : 'gray'}>
                            {ticket.priority}
                          </Badge>
                          <Badge size="xs" color={ticket.status === 'open' ? 'yellow' : ticket.status === 'resolved' ? 'emerald' : 'gray'}>
                            {ticket.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">No Tickets</h3>
                <p className="text-gray-400 text-sm mb-4">You haven't submitted any support tickets yet.</p>
                <Button onClick={() => setActiveTab('ticket')}>Submit a Ticket</Button>
              </Card>
            )}
          </motion.div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FAQs..."
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
              />
            </div>

            {faqItems
              .filter(item => 
                !searchQuery || 
                item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.answer.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((faq, index) => (
                <motion.details
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-slate-800/30 border border-slate-700/30 rounded-xl overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-800/50 transition-colors list-none">
                    <span className="text-white font-medium pr-4">{faq.question}</span>
                    <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-5 pb-5">
                    <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                  </div>
                </motion.details>
              ))}
          </motion.div>
        )}

        {/* Guides Tab */}
        {activeTab === 'guides' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guides.map((guide, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <Card className="cursor-pointer h-full">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <guide.icon className="w-6 h-6 text-cyan-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-white font-semibold">{guide.title}</h3>
                          <Badge size="xs" color="gray">{guide.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-400">{guide.desc}</p>
                        <Button variant="ghost" size="xs" className="mt-3 text-cyan-500">
                          Read Guide
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bottom Help */}
        <Card className="text-center">
          <p className="text-gray-400">
            Can't find what you're looking for?{' '}
            <button
              onClick={() => setActiveTab('ticket')}
              className="text-cyan-500 hover:text-cyan-400 font-medium"
            >
              Submit a support ticket
            </button>
            {' '}and we'll get back to you within 24 hours.
          </p>
        </Card>
      </div>
    </UserLayout>
  );
};

export default Support;