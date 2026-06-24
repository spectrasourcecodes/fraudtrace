import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, CheckCheck, Trash2, Clock, Filter,
  FileText, Shield, AlertTriangle, MessageSquare,
  Search, RefreshCw, Mail, Users, ChevronRight,
} from 'lucide-react';
import InvestigatorLayout from '../../components/layout/InvestigatorLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import SearchInput from '../../components/forms/SearchInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const InvestigatorNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('limit', '50');
      
      if (filter === 'unread') params.append('read', 'false');
      else if (filter === 'read') params.append('read', 'true');
      
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const queryString = params.toString();
      const url = `/api/notifications${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching notifications:', url);
      
      const response = await api.get(url);
      const data = response.data?.data || response.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err.response?.data?.message || 'Failed to load notifications');
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [filter, typeFilter, searchQuery]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      toast.success('Marked as read');
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const deleteAllRead = async () => {
    try {
      const readIds = notifications.filter(n => n.read).map(n => n._id);
      if (readIds.length === 0) {
        toast.error('No read notifications to clear');
        return;
      }
      for (const id of readIds) {
        await api.delete(`/api/notifications/${id}`);
      }
      setNotifications(prev => prev.filter(n => !n.read));
      toast.success(`${readIds.length} notification(s) cleared`);
    } catch (err) {
      toast.error('Failed to clear notifications');
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      case_update: FileText,
      evidence_status: Shield,
      investigator_message: MessageSquare,
      system: Bell,
      alert: AlertTriangle,
    };
    return icons[type] || Bell;
  };

  const getTypeColor = (type) => {
    const colors = {
      case_update: 'text-purple-400 bg-purple-500/10',
      evidence_status: 'text-emerald-400 bg-emerald-500/10',
      investigator_message: 'text-blue-400 bg-blue-500/10',
      system: 'text-cyan-400 bg-cyan-500/10',
      alert: 'text-red-400 bg-red-500/10',
    };
    return colors[type] || 'text-gray-400 bg-gray-500/10';
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const totalCount = notifications.length;

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'read', label: 'Read' },
  ];

  const typeOptions = [
    { id: 'all', label: 'All Types' },
    { id: 'system', label: 'System' },
    { id: 'case_update', label: 'Case Updates' },
    { id: 'evidence_status', label: 'Evidence' },
    { id: 'alert', label: 'Alerts' },
  ];

  if (loading) {
    return (
      <InvestigatorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading notifications..." />
        </div>
      </InvestigatorLayout>
    );
  }

  return (
    <InvestigatorLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              <p className="text-gray-400 text-sm mt-1">
                {totalCount} total • {unreadCount} unread
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" icon={CheckCheck} onClick={markAllAsRead}>
                  Mark All Read
                </Button>
              )}
              {totalCount - unreadCount > 0 && (
                <Button variant="ghost" size="sm" icon={Trash2} onClick={deleteAllRead} className="text-gray-400">
                  Clear Read
                </Button>
              )}
              <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchNotifications}>
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Read/Unread Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setFilter(option.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  filter === option.id
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800 border-slate-700'
                }`}
              >
                {option.label}
                {option.id === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-cyan-500/30 rounded-full text-xs">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {typeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setTypeFilter(option.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  typeFilter === option.id
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                    : 'text-gray-500 hover:text-white hover:bg-slate-800 border-slate-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Active Filters */}
          {(filter !== 'all' || typeFilter !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Active filters:</span>
              {filter !== 'all' && <Badge size="xs" color="cyan">{filter}</Badge>}
              {typeFilter !== 'all' && <Badge size="xs" color="purple">{typeFilter.replace(/_/g, ' ')}</Badge>}
              {searchQuery && <Badge size="xs" color="gray">Search: {searchQuery}</Badge>}
              <button
                onClick={() => { setFilter('all'); setTypeFilter('all'); setSearchQuery(''); }}
                className="text-cyan-500 hover:text-cyan-400 ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Search */}
          <SearchInput
            placeholder="Search notifications..."
            onSearch={(query) => setSearchQuery(query)}
            className="w-full"
          />
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const TypeIcon = getTypeIcon(notif.type);
              const typeColor = getTypeColor(notif.type);

              return (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => !notif.read && markAsRead(notif._id)}
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer group ${
                    notif.read
                      ? 'bg-slate-800/20 border-slate-700/30'
                      : 'bg-slate-800/50 border-cyan-500/20 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Type Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColor}`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-white">{notif.title}</p>
                            {!notif.read && (
                              <span className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0 animate-pulse" />
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mt-1">{notif.message}</p>
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge size="xs" color={
                          notif.type === 'alert' ? 'red' :
                          notif.type === 'case_update' ? 'purple' :
                          notif.type === 'evidence_status' ? 'emerald' : 'cyan'
                        }>
                          {notif.type?.replace(/_/g, ' ') || 'system'}
                        </Badge>
                        {notif.priority && notif.priority !== 'normal' && (
                          <Badge size="xs" color={notif.priority === 'urgent' ? 'red' : 'orange'}>
                            {notif.priority}
                          </Badge>
                        )}
                        {notif.relatedCase && (
                          <span className="text-xs text-cyan-500 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {notif.relatedCase?.caseId || 'Case'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id); }}
                      className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-400" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description={
              filter !== 'all' || typeFilter !== 'all' || searchQuery
                ? 'No notifications match your current filters.'
                : "You're all caught up! New notifications will appear here."
            }
          />
        )}
      </div>
    </InvestigatorLayout>
  );
};

export default InvestigatorNotifications;