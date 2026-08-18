import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, Plus, RefreshCw, Edit3, Search,
  DollarSign, AlertTriangle, CheckCircle, Lock,
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import SearchInput from '../../components/forms/SearchInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const AdminWallet = () => {
  const [wallets, setWallets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Create form state
  const [createForm, setCreateForm] = useState({
    userId: '',
    currency: 'USD',
    balance: 0,
    withdrawalLimit: 0,
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    currency: '',
    balance: 0,
    status: 'inactive',
    withdrawalLimit: 0,
    adjustment: 0,
  });

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/wallet/admin/all');
      setWallets(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch wallets:', err);
      toast.error('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users?limit=100');
      setUsers(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  useEffect(() => {
    fetchWallets();
    fetchUsers();
  }, []);

  const handleCreateWallet = async () => {
    if (!createForm.userId) {
      toast.error('Please select a user');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/wallet/admin', createForm);
      toast.success('Wallet created successfully');
      setShowCreateModal(false);
      resetCreateForm();
      fetchWallets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create wallet');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateWallet = async () => {
    if (!editingWallet) return;

    setSubmitting(true);
    try {
      await api.put(`/api/wallet/admin/${editingWallet._id}`, editForm);
      toast.success('Wallet updated successfully');
      setEditingWallet(null);
      fetchWallets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update wallet');
    } finally {
      setSubmitting(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({ userId: '', currency: 'USD', balance: 0, withdrawalLimit: 0 });
  };

  const openEditModal = (wallet) => {
    setEditingWallet(wallet);
    setEditForm({
      currency: wallet.currency,
      balance: wallet.balance,
      status: wallet.status,
      withdrawalLimit: wallet.withdrawalLimit,
      adjustment: 0,
    });
  };

  const filteredWallets = wallets.filter(w =>
    w.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading wallets..." />
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
              <h1 className="text-2xl font-bold text-white">Wallet Management</h1>
              <p className="text-gray-400 text-sm mt-1">
                {wallets.length} wallets in system
              </p>
            </div>
            <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
              Create Wallet
            </Button>
          </div>
        </motion.div>

        {/* Search */}
        <SearchInput
          placeholder="Search by user name or email..."
          onSearch={setSearchQuery}
          className="w-full sm:w-72"
        />

        {/* Wallets Grid */}
        {filteredWallets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWallets.map((wallet) => (
              <motion.div key={wallet._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{wallet.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{wallet.user?.email || ''}</p>
                    </div>
                    <Badge color={wallet.status === 'active' ? 'emerald' : 'yellow'} variant="dot" size="xs">
                      {wallet.status}
                    </Badge>
                  </div>

                  <div className="bg-slate-800/30 rounded-xl p-4 mb-3 text-center">
                    <p className="text-xs text-gray-400">Balance</p>
                    <p className="text-2xl font-bold text-white">
                      {wallet.balance.toFixed(2)} {wallet.currency}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Limit: {wallet.withdrawalLimit > 0 ? `${wallet.withdrawalLimit} ${wallet.currency}` : 'No limit'}
                    </p>
                  </div>

                  {/* Equivalents */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-slate-800/20 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-gray-400">USDT</p>
                      <p className="text-xs font-bold text-emerald-400">{wallet.equivalents?.USDT}</p>
                    </div>
                    <div className="bg-slate-800/20 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-gray-400">BTC</p>
                      <p className="text-xs font-bold text-orange-400">{wallet.equivalents?.BTC}</p>
                    </div>
                    <div className="bg-slate-800/20 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-gray-400">ETH</p>
                      <p className="text-xs font-bold text-purple-400">{wallet.equivalents?.ETH}</p>
                    </div>
                  </div>

                  <Button
                    fullWidth
                    variant="outline"
                    size="sm"
                    icon={Edit3}
                    onClick={() => openEditModal(wallet)}
                  >
                    Edit Wallet
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No wallets found</p>
          </Card>
        )}
      </div>

      {/* Create Wallet Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Wallet" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Select User</label>
            <select
              value={createForm.userId}
              onChange={(e) => setCreateForm(prev => ({ ...prev, userId: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
            >
              <option value="">Select a user...</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Currency"
            value={createForm.currency}
            onChange={(e) => setCreateForm(prev => ({ ...prev, currency: e.target.value }))}
            placeholder="USD"
          />

          <Input
            label="Initial Balance"
            type="number"
            value={createForm.balance}
            onChange={(e) => setCreateForm(prev => ({ ...prev, balance: e.target.value }))}
            placeholder="0"
          />

          <Input
            label="Withdrawal Limit"
            type="number"
            value={createForm.withdrawalLimit}
            onChange={(e) => setCreateForm(prev => ({ ...prev, withdrawalLimit: e.target.value }))}
            placeholder="0 (no limit)"
          />

          <div className="flex gap-3 pt-4">
            <Button variant="outline" fullWidth onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button fullWidth onClick={handleCreateWallet} loading={submitting}>Create Wallet</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Wallet Modal */}
      <Modal isOpen={!!editingWallet} onClose={() => setEditingWallet(null)} title="Edit Wallet" size="md">
        {editingWallet && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              User: <span className="text-white">{editingWallet.user?.name}</span>
            </p>

            <Input
              label="Currency"
              value={editForm.currency}
              onChange={(e) => setEditForm(prev => ({ ...prev, currency: e.target.value }))}
            />

            <Input
              label="Balance Adjustment (Add/Deduct)"
              type="number"
              value={editForm.adjustment}
              onChange={(e) => setEditForm(prev => ({ ...prev, adjustment: e.target.value }))}
              placeholder="Enter amount to add or deduct"
            />

            <Input
              label="Withdrawal Limit"
              type="number"
              value={editForm.withdrawalLimit}
              onChange={(e) => setEditForm(prev => ({ ...prev, withdrawalLimit: e.target.value }))}
            />

            <div>
              <label className="block text-sm text-gray-400 mb-2">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" fullWidth onClick={() => setEditingWallet(null)}>Cancel</Button>
              <Button fullWidth onClick={handleUpdateWallet} loading={submitting}>Update Wallet</Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default AdminWallet;