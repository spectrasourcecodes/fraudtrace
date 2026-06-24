import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Edit3, Trash2, Shield, CheckCircle, XCircle,
  Clock, Mail, UserPlus, Download, Ban, Unlock,
  Search, AlertTriangle, Loader,
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import ConfirmDialog from '../../components/feedback/ConfirmDialog';
import SearchInput from '../../components/forms/SearchInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Modal states
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active',
  });

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, [selectedRole, pagination.page, searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(selectedRole !== 'all' && { role: selectedRole }),
        ...(searchQuery && { search: searchQuery }),
      };

      const response = await api.get('/api/users', { params });
      const data = response.data?.data || response.data || [];
      const pagData = response.data?.pagination || {};

      setUsers(Array.isArray(data) ? data : []);
      setPagination(prev => ({
        ...prev,
        total: pagData.total || (Array.isArray(data) ? data.length : 0),
        pages: pagData.pages || 1,
      }));
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Handle add user
  const handleAddUser = async () => {
    if (!userForm.name || !userForm.email || !userForm.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/auth/register', {
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
      });

      toast.success('User created successfully');
      setShowAddUser(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error('Failed to create user:', err);
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit user
  const handleEditUser = async () => {
    if (!editingUser || !userForm.name) {
      toast.error('Name is required');
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/api/users/${editingUser._id}`, {
        name: userForm.name,
        role: userForm.role,
        status: userForm.status,
      });

      toast.success('User updated successfully');
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user:', err);
      toast.error(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!deleteConfirm) return;

    setSubmitting(true);
    try {
      await api.delete(`/api/users/${deleteConfirm._id}`);
      toast.success('User deleted successfully');
      setDeleteConfirm(null);
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle toggle user status
  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    
    try {
      await api.put(`/api/users/${user._id}/status`, { status: newStatus });
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Open edit modal with user data
  const openEditModal = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'user',
      status: user.status || 'active',
    });
  };

  // Reset form
  const resetForm = () => {
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: 'user',
      status: 'active',
    });
  };

  // Get initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const roleFilters = [
    { id: 'all', label: 'All Users', count: pagination.total },
    { id: 'user', label: 'Users' },
    { id: 'investigator', label: 'Investigators' },
    { id: 'admin', label: 'Admins' },
  ];

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      sortable: true,
      cell: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(value)}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{value}</p>
            <p className="text-gray-500 text-xs truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: 'role',
      sortable: true,
      cell: (value) => (
        <Badge color={value === 'admin' ? 'purple' : value === 'investigator' ? 'cyan' : 'gray'} size="xs">
          {value}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (value) => (
        <Badge color={value === 'active' ? 'emerald' : value === 'inactive' ? 'yellow' : 'red'} variant="dot" size="xs">
          {value}
        </Badge>
      ),
    },
    {
      header: 'Joined',
      accessor: 'createdAt',
      sortable: true,
      cell: (value) => <span className="text-gray-400 text-xs">{formatDate(value)}</span>,
    },
    {
      header: 'Last Login',
      accessor: 'lastLogin',
      sortable: true,
      cell: (value) => (
        <span className="text-gray-400 text-xs">
          {value ? formatDate(value) : 'Never'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id',
      cell: (value, row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            icon={Edit3}
            onClick={(e) => { e.stopPropagation(); openEditModal(row); }}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="xs"
            icon={row.status === 'active' ? Ban : Unlock}
            className={row.status === 'active' ? 'text-yellow-400' : 'text-emerald-400'}
            onClick={(e) => { e.stopPropagation(); handleToggleStatus(row); }}
          >
            {row.status === 'active' ? 'Suspend' : 'Activate'}
          </Button>
          <Button
            variant="ghost"
            size="xs"
            icon={Trash2}
            className="text-red-400"
            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(row); }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const statsCount = {
    total: pagination.total,
    investigators: users.filter(u => u.role === 'investigator').length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
  };

  if (loading && users.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading users..." />
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
              <h1 className="text-2xl font-bold text-white">User Management</h1>
              <p className="text-gray-400 text-sm mt-1">
                {statsCount.total} total users • {statsCount.active} active • {statsCount.investigators} investigators
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" icon={Download} onClick={fetchUsers}>
                Refresh
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={UserPlus}
                onClick={() => {
                  resetForm();
                  setShowAddUser(true);
                }}
              >
                Add User
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Users', value: statsCount.total, color: 'cyan' },
            { label: 'Active', value: statsCount.active, color: 'emerald' },
            { label: 'Investigators', value: statsCount.investigators, color: 'purple' },
            { label: 'Suspended', value: statsCount.suspended, color: 'red' },
          ].map((stat) => (
            <Card key={stat.label} className="text-center p-4">
              <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {roleFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => {
                  setSelectedRole(filter.id);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedRole === filter.id
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <SearchInput
            placeholder="Search users by name or email..."
            onSearch={(query) => {
              setSearchQuery(query);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="w-full sm:w-72"
          />
        </div>

        {/* Users Table */}
        <Card>
          <DataTable
            columns={columns}
            data={users}
            searchable={false}
            filterable={false}
            pageSize={pagination.limit}
            onRowClick={(row) => openEditModal(row)}
          />
        </Card>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddUser}
        onClose={() => { setShowAddUser(false); resetForm(); }}
        title="Add New User"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Full Name *"
            value={userForm.name}
            onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter full name"
            icon={Users}
          />
          <Input
            label="Email Address *"
            type="email"
            value={userForm.email}
            onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter email address"
            icon={Mail}
          />
          <Input
            label="Password *"
            type="password"
            value={userForm.password}
            onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
            placeholder="Enter password (min. 6 characters)"
            icon={Lock}
          />
          <div>
            <label className="block text-sm text-gray-400 mb-2">Role</label>
            <select
              value={userForm.role}
              onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500"
            >
              <option value="user">User</option>
              <option value="investigator">Investigator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" fullWidth onClick={() => { setShowAddUser(false); resetForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" fullWidth onClick={handleAddUser} loading={submitting}>
              Add User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => { setEditingUser(null); resetForm(); }}
        title="Edit User"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={userForm.name}
            onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter full name"
            icon={Users}
          />
          <Input
            label="Email Address"
            value={userForm.email}
            disabled
            icon={Mail}
          />
          <div>
            <label className="block text-sm text-gray-400 mb-2">Role</label>
            <select
              value={userForm.role}
              onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500"
            >
              <option value="user">User</option>
              <option value="investigator">Investigator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Status</label>
            <select
              value={userForm.status}
              onChange={(e) => setUserForm(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" fullWidth onClick={() => { setEditingUser(null); resetForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" fullWidth onClick={handleEditUser} loading={submitting}>
              Update User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteUser}
        loading={submitting}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone. All data associated with this user will be permanently removed.`}
        confirmText="Delete User"
        variant="danger"
      />
    </AdminLayout>
  );
};

export default UserManagement;