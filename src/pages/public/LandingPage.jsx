import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Shield, FileText, Globe, Users, Wallet, Database,
  Lock, Activity, ArrowRight, CheckCircle, Star,
  AlertTriangle, ChevronRight, Menu, X, ChevronDown,
  Mail, Phone, MapPin, Send, Search, Check,
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

// ============================================
// LANGUAGE DATA
// ============================================
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Español' },
  { code: 'fr', name: 'French', flag: '🇫🇷', native: 'Français' },
  { code: 'de', name: 'German', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', native: 'Português' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', native: 'العربية' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', native: '中文' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', native: 'Русский' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', native: '日本語' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', native: '한국어' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', native: 'Italiano' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱', native: 'Nederlands' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷', native: 'Türkçe' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱', native: 'Polski' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', native: 'Tiếng Việt' },
];

// ============================================
// LANDING PAGE COMPONENT
// ============================================
const LandingPage = () => {
  // Navigation state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // FAQ state
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '', email: '', subject: '', message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Language selector state
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'en';
  });
  const [langSearch, setLangSearch] = useState('');
  const langDropdownRef = useRef(null);

  // Scroll animations
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.9]);

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setShowLangDropdown(false);
        setLangSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0];
  const filteredLanguages = languages.filter(l =>
    l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.native.toLowerCase().includes(langSearch.toLowerCase())
  );

  const handleLanguageChange = (langCode) => {
    setCurrentLang(langCode);
    localStorage.setItem('preferredLanguage', langCode);
    setShowLangDropdown(false);
    setLangSearch('');
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event('change'));
    } else {
      document.cookie = `googtrans=/en/${langCode};path=/`;
      window.location.reload();
    }
  };

  // Contact form handlers
  const handleContactChange = (e) => {
    setContactForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/support/tickets', {
        subject: contactForm.subject || 'General Inquiry',
        message: `Name: ${contactForm.name}\nEmail: ${contactForm.email}\n\n${contactForm.message}`,
        priority: 'normal',
      });
      setSubmitted(true);
      toast.success('Message sent successfully!');
    } catch (err) {
      console.error('Contact form error:', err);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // CONTENT DATA
  // ============================================
  const stats = [
    { icon: FileText, label: 'Total Cases', value: '12,847+', color: 'cyan' },
    { icon: Activity, label: 'Active Investigations', value: '3,294+', color: 'emerald' },
    { icon: Wallet, label: 'Funds Reported Lost', value: '$847M+', color: 'red' },
    { icon: CheckCircle, label: 'Cases Resolved', value: '5,621+', color: 'purple' },
  ];

  const features = [
    { icon: Shield, title: 'Secure Reporting', description: 'Report fraud incidents securely with end-to-end encryption and privacy protection.', color: 'cyan' },
    { icon: Search, title: 'Investigation Tracking', description: 'Track your case progress in real-time with detailed status updates and notifications.', color: 'emerald' },
    { icon: Database, title: 'Evidence Management', description: 'Upload, organize, and manage evidence files securely with advanced categorization.', color: 'purple' },
    { icon: Globe, title: 'Threat Intelligence', description: 'Advanced threat analysis and fraud pattern detection capabilities.', color: 'amber' },
    { icon: Users, title: 'Expert Investigators', description: 'Work with certified fraud investigators and cybersecurity experts worldwide.', color: 'blue' },
    { icon: Lock, title: 'Legal Support', description: 'Facilitate lawful cooperation with law enforcement agencies and regulators.', color: 'red' },
  ];

  const steps = [
    { number: '01', title: 'Report the Fraud', description: 'Submit detailed information about the fraudulent incident through our secure platform with guided assistance.' },
    { number: '02', title: 'Upload Evidence', description: 'Provide screenshots, transaction records, bank statements, and communications as evidence.' },
    { number: '03', title: 'Investigation Begins', description: 'Our certified fraud investigators analyze your case, trace digital footprints, and build a comprehensive file.' },
    { number: '04', title: 'Track Progress', description: 'Monitor your case status in real-time, receive updates, and communicate with your assigned investigator.' },
    { number: '05', title: 'Fund Recovery', description: 'Our cyber security and financial tracing teams track your lost funds and facilitate recovery through legal channels.' },
    { number: '06', title: 'Law Enforcement', description: 'We collaborate with the FBI, INTERPOL, and international agencies to identify and shut down fraudulent operations.' },
    { number: '07', title: 'Legal Action', description: 'For persistent cases, our legal team pushes necessary cases to court, working with prosecutors to bring fraudsters to justice.' },
    { number: '08', title: 'Case Closed', description: 'Every successful case is properly closed with full documentation and resolution confirmation.' },
  ];

  const testimonials = [
    { name: 'Sarah Mitchell', role: 'Investment Scam Victim', content: 'FraudTrace helped me recover $45,000 from a crypto scam. Their investigators were professional and kept me updated throughout.', rating: 5, avatar: 'SM' },
    { name: 'James Rodriguez', role: 'Romance Scam Survivor', content: 'I never thought I would see my money again. The team at FraudTrace worked tirelessly and helped bring the scammers to justice.', rating: 5, avatar: 'JR' },
    { name: 'Emily Chen', role: 'Business Owner', content: 'Our company was targeted by a phishing attack. FraudTrace helped us trace the attackers and secure our systems.', rating: 5, avatar: 'EC' },
  ];

  const faqs = [
    { question: 'How does FraudTrace help recover lost funds?', answer: 'FraudTrace works through legal channels by collecting evidence, analyzing fraud patterns, and cooperating with law enforcement agencies and financial institutions to trace and potentially recover lost funds.' },
    { question: 'Is my personal information secure?', answer: 'Yes, we use enterprise-grade encryption and follow strict data protection protocols. Your personal information and case details are encrypted end-to-end.' },
    { question: 'How long does an investigation take?', answer: 'Investigation timelines vary depending on case complexity. Simple cases may take 2-4 weeks, while complex international fraud cases can take several months.' },
    { question: 'What types of fraud do you handle?', answer: 'We handle investment scams, cryptocurrency fraud, Ponzi schemes, romance scams, fake brokers, phishing attacks, identity theft, and other cyber-enabled financial crimes.' },
    { question: 'Do you guarantee fund recovery?', answer: 'While we cannot guarantee full recovery, our team has a strong track record of successful recoveries through legal channels.' },
    { question: 'How do I get started?', answer: 'Simply create an account, submit your fraud report with as much detail as possible, upload any evidence you have, and our team will review your case within 24-48 hours.' },
  ];

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ============================================ */}
      {/* NAVIGATION */}
      {/* ============================================ */}
      <motion.nav 
        initial={{ y: -100 }} 
        animate={{ y: 0 }} 
        transition={{ type: 'spring', stiffness: 100 }}
        className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <div className="relative">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-500" />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-emerald-500 rounded-full" 
                />
              </div>
              <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                FraudTrace
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              {['Features', 'How It Works', 'Testimonials', 'FAQ', 'Contact'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-xs xl:text-sm text-gray-300 hover:text-white transition-colors relative group">
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-500 transition-all group-hover:w-full" />
                </a>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Language Selector */}
              <div ref={langDropdownRef} className="relative">
                <button
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                  className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg sm:rounded-xl transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-sm sm:text-base">{currentLanguage.flag}</span>
                  <span className="hidden md:inline text-xs">{currentLanguage.native}</span>
                  <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showLangDropdown && (
                  <div className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-full sm:mt-2 w-[calc(100vw-16px)] sm:w-64 max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="p-3 border-b border-slate-800">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input type="text" value={langSearch} onChange={(e) => setLangSearch(e.target.value)}
                          placeholder="Search languages..."
                          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500" />
                      </div>
                    </div>
                    <div className="max-h-56 overflow-y-auto p-2">
                      {filteredLanguages.map((lang) => (
                        <button key={lang.code} onClick={() => handleLanguageChange(lang.code)}
                          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                            currentLang === lang.code ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-400 hover:text-white hover:bg-slate-800'}`}>
                          <span className="text-xl">{lang.flag}</span>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium">{lang.native}</p>
                            <p className="text-xs opacity-70">{lang.name}</p>
                          </div>
                          {currentLang === lang.code && <Check className="w-4 h-4 text-cyan-500" />}
                        </button>
                      ))}
                      {filteredLanguages.length === 0 && <p className="text-center text-sm text-gray-500 py-4">No languages found</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Auth Buttons - Hidden on mobile */}
              <Link to="/login" className="hidden sm:inline-block px-2 lg:px-3 py-1.5 text-xs lg:text-sm font-medium text-gray-300 hover:text-white transition-colors">Sign In</Link>
              <Link to="/register" className="hidden sm:inline-block px-3 lg:px-5 py-2 lg:py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg lg:rounded-xl text-xs lg:text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all">Report Fraud</Link>

              {/* Mobile Menu Button */}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg">
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div initial={false} animate={{ height: isMenuOpen ? 'auto' : 0 }}
          className="lg:hidden overflow-hidden bg-slate-900 border-b border-slate-800">
          <div className="px-4 py-4 space-y-2">
            {['Features', 'How It Works', 'Testimonials', 'FAQ', 'Contact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 text-gray-300 hover:bg-slate-800 rounded-lg text-sm">{item}</a>
            ))}
            <hr className="border-slate-700 my-2" />
            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-gray-300 hover:bg-slate-800 rounded-lg text-sm">Sign In</Link>
            <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-center font-semibold text-sm">Report Fraud</Link>
          </div>
        </motion.div>
      </motion.nav>

      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl" />
        </div>

        <motion.div style={{ opacity, scale }} className="relative max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6 sm:mb-8">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500" />
              <span className="text-xs sm:text-sm text-cyan-400">Secure Fraud Recovery Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 leading-tight px-2">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent block">Report Fraud Securely.</span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent block">Track Investigations.</span>
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent block">Recover Through Legal Channels.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-400 mb-8 sm:mb-10 px-4">
              A professional platform for victims of online fraud, investment scams, and cyber-enabled financial crimes to report incidents and track investigations with certified experts.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
              <Link to="/register" className="w-full sm:w-auto group px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-semibold text-base sm:text-lg hover:shadow-2xl hover:shadow-cyan-500/25 transition-all inline-flex items-center justify-center">
                Report Fraud Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 border border-slate-700 text-gray-300 rounded-2xl font-semibold text-base sm:text-lg hover:bg-slate-800 transition-all text-center">
                Track Existing Case
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-12 sm:mt-20 px-2">
            {stats.map((stat, index) => (
              <motion.div key={index} whileHover={{ y: -5 }}
                className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-6 text-center">
                <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 text-${stat.color}-500 mx-auto mb-2 sm:mb-3`} />
                <div className="text-xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ============================================ */}
      {/* FEATURES SECTION */}
      {/* ============================================ */}
      <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Comprehensive Fraud Recovery Platform</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Everything you need to report, track, and recover from fraud incidents in one secure platform.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }}
                className="group bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8 hover:border-cyan-500/50 transition-all duration-300">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-${feature.color}-500/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 sm:w-7 sm:h-7 text-${feature.color}-500`} />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* HOW IT WORKS */}
      {/* ============================================ */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Our proven 8-step process to report fraud, recover funds, and bring scammers to justice</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {steps.map((step, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: index * 0.1 }} className="relative group">
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 sm:p-6 h-full hover:border-cyan-500/30 transition-all duration-300 group-hover:-translate-y-1">
                  <div className="text-5xl sm:text-6xl font-bold text-slate-700 mb-3 group-hover:text-cyan-500/20 transition-colors">{step.number}</div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && index !== 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-5 h-5 text-cyan-500/50 group-hover:text-cyan-500 transition-colors" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* TESTIMONIALS */}
      {/* ============================================ */}
      <section id="testimonials" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">What Our Users Say</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Real stories from fraud victims who found help through our platform</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: index * 0.1 }} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8">
                <div className="flex items-center space-x-1 mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (<Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-current" />))}
                </div>
                <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">{testimonial.avatar}</div>
                  <div><p className="text-white font-semibold text-xs sm:text-sm">{testimonial.name}</p><p className="text-gray-500 text-xs">{testimonial.role}</p></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FAQ */}
      {/* ============================================ */}
      <section id="faq" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400">Find answers to common questions about our platform</p>
          </motion.div>
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: index * 0.05 }} className="border border-slate-700/50 rounded-xl overflow-hidden">
                <button onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-slate-800/30 transition-colors">
                  <span className="text-white font-semibold text-sm sm:text-base pr-4">{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 transition-transform ${activeFaq === index ? 'rotate-180' : ''}`} />
                </button>
                <motion.div initial={false} animate={{ height: activeFaq === index ? 'auto' : 0, opacity: activeFaq === index ? 1 : 0 }} className="overflow-hidden">
                  <p className="px-4 sm:px-6 pb-4 sm:pb-6 text-sm sm:text-base text-gray-400">{faq.answer}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA */}
      {/* ============================================ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to Report a Fraud Incident?</h2>
          <p className="text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">Take the first step towards recovery. Our team of experts is ready to help you.</p>
          <Link to="/register" className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-semibold text-base sm:text-lg hover:shadow-2xl hover:shadow-cyan-500/25 transition-all">
            Get Started Now <ChevronRight className="w-5 h-5 ml-2" />
          </Link>
        </motion.div>
      </section>

      {/* ============================================ */}
      {/* CONTACT */}
      {/* ============================================ */}
      <section id="contact" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Get in Touch</h2>
              <p className="text-gray-400 mb-6 sm:mb-8">Have questions? Our support team is here to help you 24/7.</p>
              <div className="space-y-4 sm:space-y-6">
                {[
                  { icon: Mail, label: 'Email', value: 'support@fraudtracerecovery.com' },
                  { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567' },
                  { icon: MapPin, label: 'Office', value: '123 Security Blvd, Cyber City' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                      <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-500" />
                    </div>
                    <div><p className="text-xs sm:text-sm text-gray-500">{item.label}</p><p className="text-sm sm:text-base text-white">{item.value}</p></div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-400">Thank you for contacting us. We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {[
                    { label: 'Full Name *', name: 'name', type: 'text', placeholder: 'John Doe' },
                    { label: 'Email Address *', name: 'email', type: 'email', placeholder: 'john@example.com' },
                    { label: 'Subject', name: 'subject', type: 'text', placeholder: 'How can we help?' },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">{field.label}</label>
                      <input type={field.type} name={field.name} value={contactForm[field.name]} onChange={handleContactChange}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 sm:py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-sm" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Message *</label>
                    <textarea name="message" value={contactForm.message} onChange={handleContactChange} rows={4}
                      placeholder="Tell us about your situation..."
                      className="w-full px-4 py-2.5 sm:py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-none text-sm" />
                  </div>
                  <button type="submit" disabled={submitting}
                    className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 text-sm sm:text-base">
                    {submitting ? <span>Sending...</span> : <><Send className="w-4 h-4" /><span>Send Message</span></>}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="bg-slate-900 border-t border-slate-800 py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-8 h-8 text-cyan-500" />
                <span className="text-xl font-bold text-white">FraudTrace</span>
              </div>
              <p className="text-gray-400 text-sm">Professional fraud recovery and cyber investigation platform protecting victims worldwide.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <div className="space-y-2">
                <Link to="/register" className="block text-gray-400 hover:text-white text-sm transition-colors">Report Fraud</Link>
                <Link to="/login" className="block text-gray-400 hover:text-white text-sm transition-colors">Track Case</Link>
                <a href="#features" className="block text-gray-400 hover:text-white text-sm transition-colors">Features</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <div className="space-y-2">
                <a href="#faq" className="block text-gray-400 hover:text-white text-sm transition-colors">FAQ</a>
                <a href="#contact" className="block text-gray-400 hover:text-white text-sm transition-colors">Contact</a>
                <a href="#how-it-works" className="block text-gray-400 hover:text-white text-sm transition-colors">How It Works</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <div className="space-y-2">
                <Link to="/privacy" className="block text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="block text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</Link>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Fraud Trace Recovery. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;