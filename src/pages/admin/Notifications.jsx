import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Search, Send, Trash2, CheckCheck,
  Clock, Users, FileText, Shield, AlertTriangle,
  Plus, RefreshCw, MessageSquare, Database,
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import SearchInput from '../../components/forms/SearchInput';
import ConfirmDialog from '../../components/feedback/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');

  // Send modal
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendForm, setSendForm] = useState({
    title: '',
    message: '',
    type: 'system',
    priority: 'normal',
    targetRole: 'all',
    targetUser: '',
  });
  const [sending, setSending] = useState(false);

  // Delete states
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch all notifications
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/admin/activity');
      const data = response.data?.data || response.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err.response?.data?.message || 'Failed to load notifications');
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Client-side filtering
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (filterRead === 'unread' && notif.read) return false;
      if (filterRead === 'read' && !notif.read) return false;
      if (filterType !== 'all' && notif.type !== filterType) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const title = (notif.title || '').toLowerCase();
        const message = (notif.message || '').toLowerCase();
        if (!title.includes(query) && !message.includes(query)) return false;
      }
      return true;
    });
  }, [notifications, filterRead, filterType, searchQuery]);

  // Send notification
  const handleSendNotification = async () => {
    if (!sendForm.title.trim() || !sendForm.message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    if (sendForm.targetRole === 'specific' && !sendForm.targetUser.trim()) {
      toast.error('Please specify a user ID or email');
      return;
    }

    setSending(true);
    try {
      const payload = {
        title: sendForm.title,
        message: sendForm.message,
        type: sendForm.type,
        priority: sendForm.priority,
      };

      if (sendForm.targetRole === 'specific') {
        payload.userId = sendForm.targetUser;
        await api.post('/api/notifications', payload);
        toast.success('Notification sent to user');
      } else {
        payload.targetRole = sendForm.targetRole;
        await api.post('/api/admin/send-bulk-notification', payload);
        const roleLabel =
          sendForm.targetRole === 'all' ? 'all users' :
          sendForm.targetRole === 'user' ? 'all users' :
          sendForm.targetRole === 'investigator' ? 'all investigators' : 'all admins';
        toast.success(`Notification sent to ${roleLabel}`);
      }

      setShowSendModal(false);
      resetSendForm();
      fetchNotifications();
    } catch (err) {
      console.error('Failed to send notification:', err);
      toast.error(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  // Delete handlers
  const handleDeleteNotification = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await api.delete(`/api/notifications/${deleteConfirm._id}`);
      toast.success('Notification deleted');
      setDeleteConfirm(null);
      fetchNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete notification');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error('No notifications selected');
      return;
    }
    setDeleting(true);
    try {
      for (const id of selectedIds) {
        await api.delete(`/api/notifications/${id}`);
      }
      toast.success(`${selectedIds.length} notification(s) deleted`);
      setSelectedIds([]);
      setSelectAll(false);
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to delete some notifications');
    } finally {
      setDeleting(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map(n => n._id));
    }
    setSelectAll(!selectAll);
  };

  const resetSendForm = () => {
    setSendForm({
      title: '', message: '', type: 'system', priority: 'normal',
      targetRole: 'all', targetUser: '',
    });
  };

  // Helpers
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

  const getTypeIcon = (type) => {
    const icons = {
      case_update: FileText,
      evidence_status: Database,
      investigator_message: MessageSquare,
      system: Bell,
      alert: AlertTriangle,
    };
    return icons[type] || Bell;
  };

  const getTypeColor = (type) => {
    const colors = {
      case_update: 'bg-purple-500/10 text-purple-400',
      evidence_status: 'bg-emerald-500/10 text-emerald-400',
      investigator_message: 'bg-blue-500/10 text-blue-400',
      system: 'bg-cyan-500/10 text-cyan-400',
      alert: 'bg-red-500/10 text-red-400',
    };
    return colors[type] || 'bg-gray-500/10 text-gray-400';
  };

  const typeFilters = [
    { id: 'all', label: 'All Types' },
    { id: 'system', label: 'System' },
    { id: 'case_update', label: 'Case Updates' },
    { id: 'evidence_status', label: 'Evidence' },
    { id: 'alert', label: 'Alerts' },
  ];

  const readFilters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'read', label: 'Read' },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading && notifications.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading notifications..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              <p className="text-gray-400 text-sm mt-1">
                {notifications.length} total • {unreadCount} unread
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <Button variant="danger" size="sm" icon={Trash2} onClick={handleDeleteSelected} loading={deleting}>
                  Delete ({selectedIds.length})
                </Button>
              )}
              <Button variant="outline" size="sm" icon={CheckCheck} onClick={handleMarkAllRead}>
                Mark All Read
              </Button>
              <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchNotifications}>
                Refresh
              </Button>
              <Button variant="primary" size="sm" icon={Plus} onClick={() => { resetSendForm(); setShowSendModal(true); }}>
                Send
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            {readFilters.map((option) => (
              <button
                key={option.id}
                onClick={() => setFilterRead(option.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  filterRead === option.id
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800 border-slate-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {typeFilters.map((option) => (
              <button
                key={option.id}
                onClick={() => setFilterType(option.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  filterType === option.id
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                    : 'text-gray-500 hover:text-white hover:bg-slate-800 border-slate-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {(filterRead !== 'all' || filterType !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Active filters:</span>
              {filterRead !== 'all' && <Badge size="xs" color="cyan">{filterRead}</Badge>}
              {filterType !== 'all' && <Badge size="xs" color="purple">{filterType.replace(/_/g, ' ')}</Badge>}
              {searchQuery && <Badge size="xs" color="gray">Search: {searchQuery}</Badge>}
              <button
                onClick={() => { setFilterRead('all'); setFilterType('all'); setSearchQuery(''); }}
                className="text-cyan-500 hover:text-cyan-400 ml-2"
              >
                Clear all
              </button>
            </div>
          )}
          <SearchInput
            placeholder="Search notifications..."
            onSearch={(query) => setSearchQuery(query)}
            className="w-full sm:w-72"
          />
        </div>

        {/* Notifications List */}
        <Card>
          {filteredNotifications.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-700/50">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-400">Select All ({filteredNotifications.length})</span>
              </div>
              <AnimatePresence>
                {filteredNotifications.map((notif) => {
                  const TypeIcon = getTypeIcon(notif.type);
                  const typeColor = getTypeColor(notif.type);
                  return (
                    <motion.div
                      key={notif._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`flex items-start gap-3 p-4 rounded-xl transition-colors ${
                        !notif.read ? 'bg-cyan-500/5 border border-cyan-500/10' : 'bg-slate-800/20'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(notif._id)}
                        onChange={() => handleSelect(notif._id)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500 mt-1"
                      />
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColor}`}>
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-white">{notif.title}</h3>
                              {!notif.read && <span className="w-2 h-2 bg-cyan-500 rounded-full" />}
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{notif.message}</p>
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0">{formatTimeAgo(notif.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge size="xs" color={notif.type === 'alert' ? 'red' : notif.type === 'case_update' ? 'purple' : 'cyan'}>
                            {notif.type?.replace(/_/g, ' ') || 'system'}
                          </Badge>
                          {notif.user && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {notif.user?.name || notif.user?.email || 'System'}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setDeleteConfirm(notif)}
                        className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Notifications</h3>
              <p className="text-gray-400">
                {searchQuery || filterType !== 'all' || filterRead !== 'all'
                  ? 'No notifications match your filters.'
                  : 'There are no notifications in the system yet.'}
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Send Notification Modal */}
      <Modal
        isOpen={showSendModal}
        onClose={() => { setShowSendModal(false); resetSendForm(); }}
        title="Send Notification"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Title *"
              value={sendForm.title}
              onChange={(e) => setSendForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Notification title"
              icon={Bell}
            />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <select
                value={sendForm.type}
                onChange={(e) => setSendForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
              >
                <option value="system">System</option>
                <option value="case_update">Case Update</option>
                <option value="evidence_status">Evidence Status</option>
                <option value="alert">Alert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
              <select
                value={sendForm.priority}
                onChange={(e) => setSendForm(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
              <select
                value={sendForm.targetRole}
                onChange={(e) => setSendForm(prev => ({ ...prev, targetRole: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
              >
                <option value="all">All Users</option>
                <option value="user">Users Only</option>
                <option value="investigator">Investigators Only</option>
                <option value="admin">Admins Only</option>
                <option value="specific">Specific User</option>
              </select>
            </div>
          </div>

          {sendForm.targetRole === 'specific' && (
            <Input
              label="User ID or Email"
              value={sendForm.targetUser}
              onChange={(e) => setSendForm(prev => ({ ...prev, targetUser: e.target.value }))}
              placeholder="Enter user ID or email"
              icon={Users}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Message *</label>
            <textarea
              value={sendForm.message}
              onChange={(e) => setSendForm(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              placeholder="Enter notification message..."
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <Button variant="outline" fullWidth onClick={() => { setShowSendModal(false); resetSendForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" fullWidth onClick={handleSendNotification} loading={sending} icon={Send}>
              Send Notification
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteNotification}
        loading={deleting}
        title="Delete Notification"
        message="Are you sure you want to delete this notification?"
        confirmText="Delete"
        variant="danger"
      />
    </AdminLayout>
  );
};

export default AdminNotifications;