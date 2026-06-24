import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Shield, ArrowLeft, Lock, Eye, Database, Globe, ExternalLink,
  Bell, UserCheck, Cookie, Mail, FileText, Trash2, Edit3,
  Download, AlertTriangle, Server, Smartphone, Share2, Phone,
  MessageCircle, Send,
} from 'lucide-react';
import { api } from '../../services/api';

const PrivacyPolicy = () => {
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

  // Build contact section dynamically from API data
  const getContactContent = () => {
    if (!supportLinks) {
      return `For privacy-related inquiries or to exercise your rights, please contact us through our platform's support system. We aim to respond to all privacy inquiries within 48 hours.`;
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
    
    channels.push('• Platform: Use the support feature in your dashboard');

    return `For privacy-related inquiries or to exercise your rights, contact our Data Protection Officer:

${channels.join('\n')}
      
We aim to respond to all privacy inquiries within 48 hours.`;
  };

  const sections = [
    {
      id: 'introduction',
      icon: Shield,
      title: '1. Introduction',
      content: `Fraud Trace Recovery ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our fraud recovery and cyber investigation platform ("Platform").

      By using the Platform, you consent to the data practices described in this policy. If you do not agree with this policy, please do not use our Platform.

      This policy applies to all users of the Platform, including victims reporting fraud, investigators, and administrators.`
    },
    {
      id: 'information-collected',
      icon: Database,
      title: '2. Information We Collect',
      content: `We collect several types of information to provide and improve our services:

      A. Personal Information You Provide:
      • Full name and contact information
      • Email address and phone number
      • Country of residence and preferred language
      • Account credentials (encrypted)
      • Profile information and preferences

      B. Case-Related Information:
      • Fraud incident details and descriptions
      • Financial loss amounts and currency information
      • Suspect information (wallets, accounts, contacts)
      • Transaction IDs and related financial data
      • Communication records with fraudsters

      C. Evidence and Documentation:
      • Uploaded files (images, documents, screenshots)
      • Communication logs and chat records
      • Bank statements and transaction records
      • Legal documents and contracts

      D. Technical Information Automatically Collected:
      • IP address and browser information
      • Device type and operating system
      • Platform usage patterns and interactions
      • Login timestamps and session data
      • Referring URLs and exit pages`
    },
    {
      id: 'usage',
      icon: Eye,
      title: '3. How We Use Your Information',
      content: `We use the collected information for the following purposes:

      A. Platform Operation:
      • Process and manage fraud reports
      • Track investigation progress
      • Facilitate communication with investigators
      • Provide case updates and notifications
      • Maintain and improve platform functionality

      B. Investigation Support:
      • Analyze fraud patterns and trends
      • Identify connected fraud networks
      • Support lawful investigations
      • Generate investigation reports
      • Share relevant information with authorized investigators

      C. Communication:
      • Send case status updates
      • Provide investigation progress reports
      • Respond to support inquiries
      • Send security alerts and notifications
      • Deliver platform updates and announcements

      D. Security and Compliance:
      • Detect and prevent fraudulent activity
      • Verify user identity and credentials
      • Comply with legal obligations
      • Enforce our Terms of Service
      • Protect user safety and platform integrity

      E. Improvement and Analytics:
      • Analyze platform usage patterns
      • Improve user experience
      • Develop new features
      • Conduct research and analysis
      • Generate aggregate statistical data`
    },
    {
      id: 'sharing',
      icon: Share2,
      title: '4. Information Sharing and Disclosure',
      content: `We share your information only in the following circumstances:

      A. With Law Enforcement and Authorities:
      • When required by law, subpoena, or court order
      • To report illegal activities to appropriate authorities
      • To cooperate with criminal investigations
      • To protect against fraud and security threats
      • To comply with regulatory requirements

      B. With Financial Institutions:
      • To trace and potentially recover lost funds
      • To report fraudulent accounts and transactions
      • To facilitate lawful fund recovery processes
      • When authorized by you for investigation purposes

      C. With Service Providers:
      • Cloud hosting and storage providers
      • Email and communication services
      • Analytics and monitoring services
      • Security and fraud prevention services
      • Customer support platforms

      D. With Your Consent:
      • When you explicitly authorize sharing
      • For services you request
      • As described at the point of collection

      We NEVER sell your personal information to third parties for marketing purposes.`
    },
    {
      id: 'cookies',
      icon: Cookie,
      title: '5. Cookies and Tracking Technologies',
      content: `We use cookies and similar tracking technologies to:

      • Maintain your session and authentication state
      • Remember your preferences and settings
      • Analyze platform usage and performance
      • Enhance security and prevent fraud
      • Improve user experience

      Types of cookies we use:
      
      • Essential Cookies: Required for platform functionality
      • Security Cookies: Used for authentication and fraud prevention
      • Preference Cookies: Remember your settings and preferences
      • Analytics Cookies: Help us understand platform usage
      
      You can control cookies through your browser settings. Disabling certain cookies may affect platform functionality.`
    },
    {
      id: 'data-security',
      icon: Lock,
      title: '6. Data Security',
      content: `We implement comprehensive security measures to protect your information:

      A. Technical Security:
      • End-to-end encryption for sensitive data
      • SSL/TLS encryption for all data transmission
      • Secure server infrastructure with firewalls
      • Regular security audits and penetration testing
      • Multi-factor authentication options
      • Automated threat detection and prevention

      B. Organizational Security:
      • Strict access controls and authentication
      • Role-based access to sensitive information
      • Regular security training for staff
      • Incident response procedures
      • Data breach notification protocols
      • Background checks for personnel

      C. Data Storage:
      • Encrypted database storage
      • Secure cloud infrastructure
      • Regular data backups
      • Disaster recovery procedures
      • Data retention policies

      While we strive to protect your information, no security measure is 100% effective. We cannot guarantee absolute security.`
    },
    {
      id: 'data-retention',
      icon: Server,
      title: '7. Data Retention',
      content: `We retain your information for as long as necessary:

      • Active Accounts: Information is retained while your account is active
      • Case Records: Retained for the duration of investigation plus legal requirements
      • Evidence Files: Retained as needed for investigation and legal purposes
      • Communication Records: Retained for quality assurance and dispute resolution
      • Technical Logs: Retained for security monitoring and analysis

      After the retention period:
      • Personal information is anonymized or deleted
      • Case data may be archived for research purposes
      • Aggregate data may be retained indefinitely
      
      You may request deletion of your data by contacting us, subject to legal requirements.`
    },
    {
      id: 'user-rights',
      icon: UserCheck,
      title: '8. Your Rights and Choices',
      content: `Depending on your jurisdiction, you may have the following rights:

      • Right to Access: Request a copy of your personal data
      • Right to Rectification: Correct inaccurate information
      • Right to Erasure: Request deletion of your data
      • Right to Restrict Processing: Limit how we use your data
      • Right to Data Portability: Receive your data in a portable format
      • Right to Object: Object to certain processing activities
      • Right to Withdraw Consent: Withdraw previously given consent

      To exercise these rights, contact us through the channels listed in the Contact section below.
      We will respond within 30 days as required by law.
      
      We may need to verify your identity before processing requests.`
    },
    {
      id: 'children',
      icon: AlertTriangle,
      title: '9. Children\'s Privacy',
      content: `The Platform is not intended for use by children under the age of 18.

      • We do not knowingly collect information from children under 18
      • If we discover that a child under 18 has provided personal information, we will delete it immediately
      • Parents or guardians who believe their child has provided information should contact us immediately
      
      We comply with the Children's Online Privacy Protection Act (COPPA) and similar international regulations.`
    },
    {
      id: 'international',
      icon: Globe,
      title: '10. International Data Transfers',
      content: `Your information may be transferred to and processed in countries other than your own:

      • Our servers are located in multiple jurisdictions
      • Data may be processed by staff operating outside your country
      • We ensure appropriate safeguards for international transfers
      • We comply with applicable data protection laws
      • Standard contractual clauses are used where required

      By using the Platform, you consent to such transfers.`
    },
    {
      id: 'third-party',
      icon: ExternalLink,
      title: '11. Third-Party Services',
      content: `The Platform may contain links to third-party websites and services:

      • We are not responsible for third-party privacy practices
      • Third-party services have their own privacy policies
      • We encourage reviewing third-party policies before use
      • We may use third-party services for:
        - Cloud storage and hosting
        - Email delivery
        - Analytics and monitoring
        - Payment processing
        - Customer support

      Your interactions with third-party services are governed by their respective policies.`
    },
    {
      id: 'breaches',
      icon: Bell,
      title: '12. Data Breach Notification',
      content: `In the event of a data breach:

      • We will notify affected users within 72 hours of discovery
      • Notifications will be sent via email and platform notification
      • We will provide details of the breach and steps taken
      • Law enforcement will be notified if required by law
      • Remedial actions will be taken to prevent future incidents
      
      Users will be advised on steps to protect their information following a breach.`
    },
    {
      id: 'changes',
      icon: FileText,
      title: '13. Changes to This Policy',
      content: `We may update this Privacy Policy periodically:

      • Changes will be posted on this page with an updated date
      • Material changes will be notified via email or platform notification
      • Continued use after changes constitutes acceptance
      • We recommend reviewing this policy regularly
      
      Previous versions of this policy are available upon request.`
    },
    {
      id: 'contact',
      icon: Mail,
      title: '14. Contact Us',
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/10 rounded-2xl mb-6">
            <Lock className="w-8 h-8 text-purple-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Your privacy is critically important to us. Learn how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-gray-500 mt-2">Last Updated: {lastUpdated}</p>
        </motion.div>

        {/* Key Principles */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Lock, title: 'Encryption', desc: 'All data is encrypted end-to-end' },
            { icon: Eye, title: 'Transparency', desc: 'Clear policies on data usage' },
            { icon: UserCheck, title: 'Control', desc: 'You control your information' },
          ].map((principle, index) => (
            <div key={index} className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-6 text-center">
              <principle.icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">{principle.title}</h3>
              <p className="text-sm text-gray-400">{principle.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Quick Navigation */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`}
                className="flex items-center space-x-2 text-sm text-gray-400 hover:text-purple-400 transition-colors py-1">
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
              transition={{ delay: 0.15 + index * 0.05 }}
              className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-6 md:p-8">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                  <section.icon className="w-5 h-5 text-purple-500" />
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

        {/* Rights Summary */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="mt-12 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">Your Data Rights at a Glance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Download, title: 'Access', desc: 'Request a copy of your data' },
              { icon: Edit3, title: 'Correct', desc: 'Fix inaccurate information' },
              { icon: Trash2, title: 'Delete', desc: 'Request data deletion' },
              { icon: Share2, title: 'Portability', desc: 'Get data in portable format' },
            ].map((right, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-slate-800/30 rounded-xl">
                <right.icon className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">{right.title}</p>
                  <p className="text-sm text-gray-400">{right.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
          className="mt-8 text-center">
          <p className="text-gray-400 mb-4">Have questions about our privacy practices?</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/terms" className="px-6 py-3 border border-slate-700 text-gray-300 rounded-xl font-semibold hover:bg-slate-800 transition-colors">
              Terms of Service
            </Link>
            <a href="#contact" className="px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors">
              Contact Privacy Team
            </a>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Fraud Trace Recovery. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <Link to="/terms" className="text-gray-500 hover:text-gray-400 transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link to="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <a href="#contact" className="text-gray-500 hover:text-gray-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;