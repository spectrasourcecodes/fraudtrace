import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, DollarSign, ArrowUpRight, AlertTriangle,
  Lock, CheckCircle, Clock, RefreshCw,
} from 'lucide-react';
import UserLayout from '../../components/layout/UserLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const UserWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const fetchWallet = async () => {
    try {
      const response = await api.get('/api/wallet/my');
      setWallet(response.data.data);
    } catch (err) {
      console.error('Failed to fetch wallet:', err);
      toast.error(err.response?.data?.message || 'Failed to load wallet');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleProceed = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!withdrawAddress.trim()) {
      toast.error('Please enter a recipient wallet address');
      return;
    }
    // Show warning modal first
    setShowWarning(true);
  };

  const handleConfirmWithdrawal = async () => {
    setShowWarning(false);
    setWithdrawing(true);
    try {
      const amount = parseFloat(withdrawAmount);
      await api.post('/api/wallet/withdraw', { amount, address: withdrawAddress });
      toast.success('Withdrawal successfully');
      setWithdrawAmount('');
      setWithdrawAddress('');
      fetchWallet();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWallet();
  };

  if (loading) {
    return (
      <UserLayout title="My Wallet">
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading wallet..." />
        </div>
      </UserLayout>
    );
  }

  if (!wallet) {
    return (
      <UserLayout title="My Wallet">
        <div className="text-center py-20">
          <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Wallet Found</h2>
          <p className="text-gray-400 mb-4">Please contact support to create your wallet.</p>
        </div>
      </UserLayout>
    );
  }

  const equivalents = wallet.equivalents || { USDT: '0.00', BTC: '0.00000000', ETH: '0.00000000' };

  return (
    <UserLayout title="My Wallet">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">My Wallet</h1>
              <p className="text-gray-400 text-sm mt-1">View balance and manage withdrawals</p>
            </div>
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={handleRefresh} loading={refreshing}>
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Wallet Status Banner */}
        <Card variant={wallet.status === 'active' ? 'glow' : 'default'}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {wallet.status === 'active' ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              )}
              <div>
                <p className="text-white font-semibold">
                  Wallet Status: {wallet.status === 'active' ? 'Active' : 'Inactive'}
                </p>
                <p className="text-xs text-gray-400">
                  {wallet.status === 'active'
                    ? 'Your wallet is active and you can make withdrawals.'
                    : 'Your wallet is currently inactive, please contact support for account reactivation.'}
                    {/* : 'Your wallet is inactive. Please make a one (1x) time deposit of $100 to reactivate your wallet and proceed with the withdrawal process.'} */}
                </p>
              </div>
            </div>
            <Badge color={wallet.status === 'active' ? 'emerald' : 'yellow'} variant="dot" size="sm">
              {wallet.status}
            </Badge>
          </div>
        </Card>

        {/* Main Balance Card */}
        <Card>
          <div className="text-center py-6">
            <Wallet className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
            <p className="text-sm text-gray-400">Available Balance</p>
            <p className="text-4xl font-bold text-white mt-2">
              {wallet.balance.toFixed(2)} {wallet.currency}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Withdrawal Limit: {wallet.withdrawalLimit > 0 ? `${wallet.withdrawalLimit} ${wallet.currency}` : 'No limit'}
            </p>
          </div>
        </Card>

        {/* Equivalent Balances */}
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Equivalent Balances</h3>
          {/* Responsive grid: 1 column on mobile, 3 columns on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/30 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400">USDT</p>
              <p className="text-lg font-bold text-emerald-400 mt-1 break-all">{equivalents.USDT}</p>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400">BTC</p>
              <p className="text-lg font-bold text-orange-400 mt-1 break-all">{equivalents.BTC}</p>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400">ETH</p>
              <p className="text-lg font-bold text-purple-400 mt-1 break-all">{equivalents.ETH}</p>
            </div>
          </div>
        </Card>

        {/* Withdrawal Section */}
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Withdraw Funds</h3>
          <div className="space-y-4">
            <Input
              label="Withdrawal Amount"
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder={`Enter amount in ${wallet.currency}`}
              icon={DollarSign}
              disabled={wallet.status !== 'active'}
            />
            <Input
              label="Recipient Wallet Address"
              type="text"
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
              placeholder="Enter destination wallet address"
              icon={Wallet}
              disabled={wallet.status !== 'active'}
            />
            <Button
              fullWidth
              size="lg"
              icon={ArrowUpRight}
              onClick={handleProceed}
              loading={withdrawing}
              disabled={wallet.status !== 'active' || wallet.balance <= 0}
            >
              Proceed to Withdraw
            </Button>
            {wallet.status !== 'active' && (
              <p className="text-xs text-yellow-400 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Withdrawals are disabled while wallet is inactive.
              </p>
            )}
          </div>
        </Card>

        {/* Last Withdrawal Info */}
        {wallet.lastWithdrawalAt && (
          <Card>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">Last Withdrawal</span>
              </div>
              <div className="text-right">
                <p className="text-white">{wallet.lastWithdrawalAmount} {wallet.currency}</p>
                <p className="text-xs text-gray-500">
                  {new Date(wallet.lastWithdrawalAt).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Warning Modal */}
      <Modal isOpen={showWarning} onClose={() => setShowWarning(false)} title="⚠️ Important Warning" size="sm">
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300">
              You are about to make a withdrawal of{' '}
              <strong className="text-white">{withdrawAmount} {wallet.currency}</strong>{' '}
              to the address:
              <br />
              <span className="text-xs break-all text-gray-400">{withdrawAddress || 'N/A'}</span>
              <br /><br />
              This action will reduce your available balance. Please confirm that you want to proceed.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setShowWarning(false)}>
              Cancel
            </Button>
            <Button variant="primary" fullWidth onClick={handleConfirmWithdrawal} loading={withdrawing}>
              OK, Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </UserLayout>
  );
};

export default UserWallet;