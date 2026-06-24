import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Shield, ArrowLeft, FileText, Scale, Lock, AlertTriangle,
  Mail, Phone, MapPin, MessageCircle, Send, Globe,
} from 'lucide-react';
import { api } from '../../services/api';

const TermsOfService = () => {
  const lastUpdated = 'January 1, 2024';
  const [supportLinks, setSupportLinks] = useState(null);
  const [loadingLinks, setLoadingLinks] = useState(true);

  // Fetch support links from API
  useEffect(() => {
    const fetchSupportLinks = async () => {
      setLoadingLinks(true);
      try {
        const response = await api.get('/api/support/links');
        const data = response.data?.data || response.data;
        setSupportLinks(data);
      } catch (error) {
        console.error('Failed to fetch support links:', error);
        // Fallback defaults
        setSupportLinks({
          telegram: 'https://t.me/fraudtracerecovery',
          whatsapp: 'https://wa.me/1234567890',
          email: 'mailto:support@fraudtracerecovery.com',
          phone: 'tel:+1234567890',
        });
      } finally {
        setLoadingLinks(false);
      }
    };

    fetchSupportLinks();
  }, []);

  // Build contact section content dynamically
  const getContactContent = () => {
    if (!supportLinks) {
      return `For questions, concerns, or notices regarding these Terms, please contact us through our platform's support system. We aim to respond to all inquiries within 2 business days.`;
    }

    const channels = [];
    
    if (supportLinks.email) {
      const emailAddr = supportLinks.email.replace('mailto:', '');
      channels.push(`• Email: ${emailAddr}`);
    }
    if (supportLinks.phone) {
      const phoneNum = supportLinks.phone.replace('tel:', '');
      channels.push(`• Phone: ${phoneNum}`);
    }
    if (supportLinks.telegram) {
      channels.push(`• Telegram: ${supportLinks.telegram}`);
    }
    if (supportLinks.whatsapp) {
      channels.push(`• WhatsApp: ${supportLinks.whatsapp}`);
    }
    
    channels.push('• Support: Through the platform\'s support system');

    return `For questions, concerns, or notices regarding these Terms, please contact us:

${channels.join('\n')}
      
We aim to respond to all inquiries within 2 business days.`;
  };

  const sections = [
    {
      id: 'acceptance',
      icon: FileText,
      title: '1. Acceptance of Terms',
      content: `By accessing or using the Fraud Trace Recovery platform ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not access or use the Platform. These Terms constitute a legally binding agreement between you ("User," "you," or "your") and Fraud Trace Recovery ("Company," "we," "us," or "our").`
    },
    {
      id: 'services',
      icon: Shield,
      title: '2. Description of Services',
      content: `Fraud Trace Recovery provides a professional platform for victims of online fraud to report incidents, track investigations, and access resources for recovery through legal channels. Our comprehensive services include:
      
      • Fraud incident reporting and documentation with guided assistance
      • Evidence collection, organization, and secure management tools
      • Real-time case tracking and status monitoring dashboard
      • Professional investigation support by certified fraud examiners
      • Secure communication facilitation with assigned investigators
      • Threat intelligence gathering and fraud pattern analysis
      • Educational resources and fraud prevention awareness materials
      • Cyber forensic analysis and digital evidence extraction
      • Asset tracing and financial flow analysis
      
      AUTHORIZED CYBER OPERATIONS (WITH LEGAL AUTHORITY):
      
      • Digital forensic investigation of fraudster systems and networks with written authorization from the FBI, INTERPOL, or relevant law enforcement agencies
      • Court-authorized extraction of fraud-related information from suspect systems to support legal proceedings
      • Lawful fund recovery operations conducted under official law enforcement supervision and judicial oversight
      • Coordinated takedown operations with international cyber crime units to dismantle fraudulent platforms
      • Evidence preservation and chain-of-custody management for criminal prosecution
      
      LEGAL COMPLIANCE:
      
      We strictly operate within legal boundaries and NEVER perform:
      • Unauthorized hacking or system access without proper legal authorization
      • Independent fund seizure without court orders or law enforcement directives
      • Any cyber activity that violates local, national, or international laws
      • Operations without explicit written consent from relevant authorities
      
      All authorized cyber operations are conducted by licensed professionals under the direct supervision of law enforcement agencies with full legal documentation and judicial oversight.`
    },
    {
      id: 'eligibility',
      icon: Scale,
      title: '3. User Eligibility',
      content: `To use the Platform, you must:
      
      • Be at least 18 years of age (or the legal age of majority in your jurisdiction)
      • Have the legal capacity to enter into binding agreements
      • Provide accurate, current, and complete registration information
      • Maintain the security and confidentiality of your account credentials
      • Not be located in a country subject to U.S. embargo or designated as a terrorist-supporting country
      • Not be listed on any U.S. Government list of prohibited or restricted parties
      
      We reserve the right to refuse service, terminate accounts, or remove content at our sole discretion.`
    },
    {
      id: 'account',
      icon: Lock,
      title: '4. Account Responsibilities',
      content: `You are responsible for:
      
      • Maintaining the confidentiality of your account and password
      • All activities that occur under your account
      • Notifying us immediately of any unauthorized access or use
      • Ensuring that you exit from your account at the end of each session
      • Providing accurate and truthful information in all submissions
      
      We cannot and will not be liable for any loss or damage arising from your failure to comply with these obligations. You may be held liable for losses incurred by us or other users due to unauthorized use of your account.`
    },
    {
      id: 'reporting',
      icon: AlertTriangle,
      title: '5. Fraud Reporting Guidelines',
      content: `When submitting fraud reports, you agree to:
      
      • Provide truthful and accurate information to the best of your knowledge
      • Only report incidents where you are the direct victim or legally authorized representative
      • Not file false, misleading, or frivolous reports
      • Understand that false reporting may result in legal consequences
      • Provide supporting evidence and documentation when available
      • Cooperate with investigators and respond to requests for additional information
      
      We reserve the right to verify the authenticity of reports and may require additional verification before proceeding with investigations.`
    },
    {
      id: 'privacy',
      icon: Lock,
      title: '6. Privacy and Data Protection',
      content: `Your privacy is important to us. Our collection, use, and disclosure of personal information is governed by our Privacy Policy. By using the Platform, you consent to:

      • The collection and use of your information as described in our Privacy Policy
      • The transfer of your information to our servers and databases
      • The processing of your information for investigation purposes
      • Sharing relevant information with law enforcement when required by law
      • Communication with you regarding your cases and platform updates
      
      We implement industry-standard security measures to protect your data. For complete details, please review our Privacy Policy.`
    },
    {
      id: 'intellectual-property',
      icon: FileText,
      title: '7. Intellectual Property Rights',
      content: `All content, features, and functionality of the Platform, including but not limited to:

      • Text, graphics, logos, and images
      • Software, code, and algorithms
      • Database structures and data organization
      • User interface designs and layouts
      • Documentation and training materials
      
      Are owned by Fraud Trace Recovery and protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without our express written permission.
      
      You retain ownership of content you submit, but grant us a license to use it for investigation and platform operation purposes.`
    },
    {
      id: 'limitation',
      icon: Scale,
      title: '8. Limitation of Liability',
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW:

      • We are not liable for any indirect, incidental, special, consequential, or punitive damages
      • Our total liability for any claims is limited to the amount paid by you for our services
      • We do not guarantee the recovery of lost funds or assets
      • We are not responsible for the actions or inactions of third parties, including fraudsters
      • We do not warrant that the Platform will be uninterrupted, secure, or error-free
      
      The Platform is provided "AS IS" without warranties of any kind, either express or implied.`
    },
    {
      id: 'indemnification',
      icon: Shield,
      title: '9. Indemnification',
      content: `You agree to indemnify, defend, and hold harmless Fraud Trace Recovery, its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, and expenses arising from:

      • Your use of the Platform
      • Your violation of these Terms
      • Your violation of any third-party rights
      • Any content you submit to the Platform
      • Your conduct in connection with the Platform
      
      This indemnification obligation will survive the termination of your account and these Terms.`
    },
    {
      id: 'termination',
      icon: AlertTriangle,
      title: '10. Termination',
      content: `We reserve the right to terminate or suspend your account and access to the Platform at any time, with or without cause, including if:

      • You violate these Terms
      • You engage in fraudulent or illegal activity
      • You submit false or misleading information
      • We determine that your continued use may harm the Platform or other users
      • We are required to do so by law enforcement or regulatory authorities
      
      Upon termination, your right to use the Platform will immediately cease. Certain provisions of these Terms will survive termination.`
    },
    {
      id: 'disputes',
      icon: Scale,
      title: '11. Dispute Resolution',
      content: `Any dispute arising from these Terms or your use of the Platform shall be resolved through:

      1. Informal Resolution: First, contact us to attempt to resolve the dispute informally
      2. Mediation: If informal resolution fails, the dispute shall be submitted to mediation
      3. Arbitration: If mediation is unsuccessful, binding arbitration shall be conducted
      
      You agree to waive your right to participate in class action lawsuits. All claims must be brought individually.
      
      These Terms are governed by the laws of the jurisdiction where the Company is registered, without regard to conflict of law principles.`
    },
    {
      id: 'modifications',
      icon: FileText,
      title: '12. Modifications to Terms',
      content: `We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to the Platform. We will make reasonable efforts to notify users of material changes via email or platform notification.

      Your continued use of the Platform after changes are posted constitutes your acceptance of the modified Terms. If you do not agree to the changes, you must stop using the Platform.
      
      We recommend reviewing these Terms periodically for updates.`
    },
    {
      id: 'contact',
      icon: Shield,
      title: '13. Contact Information',
      content: getContactContent(),
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-cyan-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                FraudTrace
              </span>
            </Link>
            <Link to="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/10 rounded-2xl mb-6">
            <Scale className="w-8 h-8 text-cyan-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Please read these terms carefully before using the Fraud Trace Recovery platform.
          </p>
          <p className="text-sm text-gray-500 mt-2">Last Updated: {lastUpdated}</p>
        </motion.div>

        {/* Quick Navigation */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`}
                className="flex items-center space-x-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors py-1">
                <section.icon className="w-4 h-4 flex-shrink-0" />
                <span>{section.title}</span>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.section key={section.id} id={section.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-6 md:p-8">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                  <section.icon className="w-5 h-5 text-cyan-500" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-white mb-4">{section.title}</h2>
                  <div className="text-gray-400 leading-relaxed space-y-2 whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              </div>
            </motion.section>
          ))}
        </div>

        {/* Agreement Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="mt-12 text-center bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-8">
          <h3 className="text-lg font-semibold text-white mb-2">Agreement</h3>
          <p className="text-gray-400 mb-6">
            By using the Fraud Trace Recovery platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600 transition-colors">
              Create Account
            </Link>
            <Link to="/privacy" className="px-6 py-3 border border-slate-700 text-gray-300 rounded-xl font-semibold hover:bg-slate-800 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Fraud Trace Recovery. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <Link to="/terms" className="text-cyan-400 hover:text-cyan-300 transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link to="/privacy" className="text-gray-500 hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <a href="#contact" className="text-gray-500 hover:text-gray-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsOfService;