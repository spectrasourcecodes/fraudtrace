import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import Button from '../common/Button';

const CaseFilter = ({ filters, onFilterChange, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0 });

  const [localFilters, setLocalFilters] = useState(filters || {});

  // Sync local filters with props
  useEffect(() => {
    setLocalFilters(filters || {});
  }, [filters]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        !event.target.closest('.case-filter-dropdown')
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Calculate dropdown position when opened
  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 320;
      const dropdownHeight = 450; // approximate max height

      // Calculate left: align right edge with button right edge, but keep within viewport
      let left = rect.right - dropdownWidth;
      if (left < 10) left = 10;
      if (left + dropdownWidth > window.innerWidth - 10) {
        left = window.innerWidth - dropdownWidth - 10;
      }

      // Calculate top: below button, but flip above if too close to bottom
      let top = rect.bottom + 8;
      if (top + dropdownHeight > window.innerHeight - 10) {
        top = rect.top - dropdownHeight - 8;
        if (top < 10) top = 10;
      }

      setDropdownStyle({ top, left });
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen((prev) => !prev);
  };

  // Recompute position on resize
  useEffect(() => {
    if (isOpen) {
      const handleResize = () => updatePosition();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isOpen]);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'evidence_verification', label: 'Evidence Check' },
    { value: 'investigation', label: 'Investigating' },
    { value: 'escalated', label: 'Escalated' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  const fraudTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'investment_scam', label: 'Investment Scam' },
    { value: 'crypto_scam', label: 'Crypto Scam' },
    { value: 'ponzi_scheme', label: 'Ponzi Scheme' },
    { value: 'romance_scam', label: 'Romance Scam' },
    { value: 'fake_broker', label: 'Fake Broker' },
    { value: 'online_shopping', label: 'Shopping Scam' },
    { value: 'phishing', label: 'Phishing' },
    { value: 'identity_theft', label: 'Identity Theft' },
    { value: 'other', label: 'Other' },
  ];

  const riskOptions = [
    { value: '', label: 'All Risks' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const handleChange = (key, value) => {
    const updated = { ...localFilters, [key]: value };
    if (!value) delete updated[key];
    setLocalFilters(updated);
    onFilterChange?.(updated);
  };

  const handleReset = () => {
    setLocalFilters({});
    onReset?.();
    setIsOpen(false);
  };

  const activeFilterCount = Object.values(localFilters).filter(Boolean).length;

  // The dropdown rendered via portal
  const dropdown = isOpen ? (
    <div
      className="case-filter-dropdown fixed z-[9999] w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 overflow-y-auto"
      style={{
        top: `${dropdownStyle.top}px`,
        left: `${dropdownStyle.left}px`,
        maxHeight: 'calc(100vh - 20px)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-white">Filters</h3>
          {activeFilterCount > 0 && (
            <button
              onClick={handleReset}
              className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors"
            >
              Reset All
            </button>
          )}
        </div>

        <div className="space-y-5">
          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Status
            </label>
            <select
              value={localFilters.status || ''}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Fraud Type */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Fraud Type
            </label>
            <select
              value={localFilters.fraudType || ''}
              onChange={(e) => handleChange('fraudType', e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            >
              {fraudTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Risk Level */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Risk Level
            </label>
            <select
              value={localFilters.riskLevel || ''}
              onChange={(e) => handleChange('riskLevel', e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            >
              {riskOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">From</label>
                <input
                  type="date"
                  value={localFilters.dateFrom || ''}
                  onChange={(e) => handleChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">To</label>
                <input
                  type="date"
                  value={localFilters.dateTo || ''}
                  onChange={(e) => handleChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Amount Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Min ($)</label>
                <input
                  type="number"
                  value={localFilters.amountMin || ''}
                  onChange={(e) => handleChange('amountMin', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Max ($)</label>
                <input
                  type="number"
                  value={localFilters.amountMax || ''}
                  onChange={(e) => handleChange('amountMax', e.target.value)}
                  placeholder="Any"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800">
          <Button fullWidth size="sm" onClick={() => setIsOpen(false)}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="relative">
      <div ref={buttonRef}>
        <Button
          variant="outline"
          size="sm"
          icon={Filter}
          onClick={handleToggle}
          type="button"
        >
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-cyan-500 text-white rounded-full text-xs">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Render dropdown in portal to avoid clipping */}
      {isOpen && createPortal(dropdown, document.body)}
    </div>
  );
};

export default CaseFilter;