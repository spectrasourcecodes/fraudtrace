export const APP_NAME = 'Fraud Trace Recovery';
export const APP_VERSION = '1.0.0';

export const ROLES = {
  USER: 'user',
  INVESTIGATOR: 'investigator',
  ADMIN: 'admin',
};

export const CASE_STATUS = {
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  EVIDENCE_VERIFICATION: 'evidence_verification',
  INVESTIGATION: 'investigation',
  ESCALATED: 'escalated',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

export const CASE_STATUS_LABELS = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  evidence_verification: 'Evidence Check',
  investigation: 'Investigating',
  escalated: 'Escalated',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const CASE_STATUS_COLORS = {
  submitted: 'blue',
  under_review: 'yellow',
  evidence_verification: 'purple',
  investigation: 'cyan',
  escalated: 'red',
  resolved: 'emerald',
  closed: 'gray',
};

export const FRAUD_TYPES = [
  { value: 'investment_scam', label: 'Investment Scam' },
  { value: 'crypto_scam', label: 'Crypto Scam' },
  { value: 'ponzi_scheme', label: 'Ponzi Scheme' },
  { value: 'romance_scam', label: 'Romance Scam' },
  { value: 'fake_broker', label: 'Fake Broker' },
  { value: 'online_shopping', label: 'Online Shopping Scam' },
  { value: 'phishing', label: 'Phishing Attack' },
  { value: 'identity_theft', label: 'Identity Theft' },
  { value: 'other', label: 'Other' },
];

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const RISK_LEVEL_COLORS = {
  low: 'emerald',
  medium: 'yellow',
  high: 'orange',
  critical: 'red',
};

export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY',
  'BTC', 'ETH', 'USDT', 'BNB', 'XRP', 'ADA', 'SOL',
];

export const EVIDENCE_CATEGORIES = [
  { value: 'screenshot', label: 'Screenshot' },
  { value: 'transaction_record', label: 'Transaction Record' },
  { value: 'communication', label: 'Communication' },
  { value: 'identification', label: 'Identification' },
  { value: 'contract', label: 'Contract/Agreement' },
  { value: 'other', label: 'Other' },
];

export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 10,
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
};

export const SUPPORT_LINKS = {
  telegram: 'https://t.me/fraudtracerecovery',
  whatsapp: 'https://wa.me/1234567890',
  email: 'mailto:support@fraudtracerecovery.com',
};

export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'MMM DD, YYYY HH:mm',
  TIME: 'HH:mm',
};