import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, CheckCheck, Trash2, Clock,
  FileText, Shield, AlertTriangle, MessageSquare,
} from 'lucide-react';
import UserLayout from '../../components/layout/UserLayout';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [allNotifications, setAllNotifications] = useState([]); // Store ALL notifications
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all'); // all, system, case_update, evidence_status, alert

  // Fetch ALL notifications without filters
  const fetchAllNotifications = useCallback(async () => {
    setLoading(true);
    try {
      // Always fetch all notifications without filters to maintain accurate counts
      const response = await api.get('/api/notifications', {
        params: { limit: 100 } // Fetch up to 100 notifications
      });
      const data = response.data?.data || response.data || [];
      setAllNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchAllNotifications();
  }, [fetchAllNotifications]);

  // Filter notifications client-side
  const filteredNotifications = allNotifications.filter(notif => {
    // Filter by read/unread
    if (filter === 'unread' && notif.read) return false;
    if (filter === 'read' && !notif.read) return false;
    
    // Filter by type
    if (typeFilter !== 'all' && notif.type !== typeFilter) return false;
    
    return true;
  });

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      // Update local state immediately
      setAllNotifications(prev => prev.map(n => 
        n._id === id ? { ...n, read: true } : n
      ));
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      // Update local state immediately
      setAllNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      // Update local state immediately
      setAllNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const deleteAllRead = async () => {
    const readIds = allNotifications.filter(n => n.read).map(n => n._id);
    if (readIds.length === 0) {
      toast.error('No read notifications to clear');
      return;
    }
    
    try {
      for (const id of readIds) {
        await api.delete(`/api/notifications/${id}`);
      }
      // Update local state immediately
      setAllNotifications(prev => prev.filter(n => !n.read));
      toast.success(`${readIds.length} read notification(s) cleared`);
    } catch (err) {
      toast.error('Failed to clear notifications');
    }
  };

  // Get notification icon based on type
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

  // Get notification color based on type
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

  // Format time
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

  // Calculate counts from the full dataset
  const totalCount = allNotifications.length;
  const unreadCount = allNotifications.filter(n => !n.read).length;
  const readCount = totalCount - unreadCount;

  const filterOptions = [
    { id: 'all', label: 'All', count: totalCount },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'read', label: 'Read', count: readCount },
  ];

  const typeOptions = [
    { id: 'all', label: 'All Types' },
    { id: 'system', label: 'System' },
    { id: 'case_update', label: 'Case Updates' },
    { id: 'evidence_status', label: 'Evidence' },
    { id: 'alert', label: 'Alerts' },
  ];

  if (loading && allNotifications.length === 0) {
    return (
      <UserLayout title="Notifications">
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading notifications..." />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Notifications">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              <p className="text-gray-400 mt-1">
                {totalCount} total • {unreadCount} unread
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" icon={CheckCheck} onClick={markAllAsRead}>
                  Mark All Read
                </Button>
              )}
              {readCount > 0 && (
                <Button variant="ghost" size="sm" icon={Trash2} onClick={deleteAllRead} className="text-gray-400">
                  Clear Read ({readCount})
                </Button>
              )}
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
                {option.count > 0 && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                    filter === option.id ? 'bg-cyan-500/30' : 'bg-slate-700'
                  }`}>
                    {option.count}
                  </span>
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
          {(filter !== 'all' || typeFilter !== 'all') && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Showing {filteredNotifications.length} of {totalCount}</span>
              <button
                onClick={() => { setFilter('all'); setTypeFilter('all'); }}
                className="text-cyan-500 hover:text-cyan-400 ml-2"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
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
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColor}`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>

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
                        <span className="text-xs text-gray-500 flex-shrink-0">{formatTimeAgo(notif.createdAt)}</span>
                      </div>

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
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id); }}
                      className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                      title="Delete notification"
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
              filter !== 'all' || typeFilter !== 'all'
                ? 'No notifications match your current filters. Try adjusting them.'
                : "You're all caught up! New notifications will appear here."
            }
          />
        )}
      </div>
    </UserLayout>
  );
};

export default Notifications;