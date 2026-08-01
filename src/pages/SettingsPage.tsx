import { useState } from 'react';
import { User, Mail, Lock, Crown, Zap, DollarSign, TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useGlobalState } from '../hooks/useGlobalState.tsx';
import { WithdrawalPanel } from '../components/WithdrawalPanel';
import { DepositOverlay } from '../components/DepositOverlay';
import { Notification } from '../components/Notification';
import { TransactionLedger } from '../components/TransactionLedger';

export function SettingsPage() {
  const { isDark } = useTheme();
  const {
    currentUser,
    isProfileActive,
    pendingCashoutRequests,
    pendingDeposits,
    cashoutRequests,
    requestCashout,
  } = useGlobalState();

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const glass = isDark ? 'glass-dark' : 'glass-light';

  const availableEarnings = currentUser?.availableEarnings ?? 0;
  const currentCycleReferrals = currentUser?.currentCycleReferrals ?? 0;
  const accountTier = currentUser?.depositTier ?? 0;
  const lifetimeWithdrawals = currentUser?.lifetimeWithdrawals ?? 0;
  const requiredReferrals = lifetimeWithdrawals === 0 ? 2 : 1;
  const referralsMet = currentCycleReferrals >= requiredReferrals;

  const showDepositOverlay =
    !isProfileActive || currentUser?.activationStatus === 'Activation_Pending';

  const handleCashout = async (
    amount: number,
    beneficiaryName: string,
    userEmail: string,
    walletAddress: string,
  ) => {
    const result = await requestCashout(amount, beneficiaryName, userEmail, walletAddress);
    if (result.success) {
      setNotificationMessage('Cashout request submitted — pending admin authorization.');
      setShowNotification(true);
    } else {
      setNotificationMessage(result.error || 'Withdrawal request failed.');
      setShowNotification(true);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-cosmic-midnight' : 'bg-ivory'} pt-24 pb-28 md:pb-12 px-4`}>
      <div className="max-w-4xl mx-auto relative z-10 mt-6">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Account & Cashout
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your profile, withdrawals, and transaction history
          </p>
        </div>

        <div className={`relative ${showDepositOverlay ? 'filter blur-md pointer-events-none select-none' : ''}`}>
          {/* Profile Card */}
          <div className={`${glass} p-6 mb-6`}>
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-neon-pink/20' : 'bg-neon-pink/10'}`}>
                <User className="w-6 h-6 text-neon-pink" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile Settings</h3>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Your account information</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className={`rounded-xl p-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Full Name</p>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentUser?.fullName ?? '—'}
                </p>
              </div>
              <div className={`rounded-xl p-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Username</p>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentUser?.username ?? '—'}
                </p>
              </div>
              <div className={`rounded-xl p-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Email</p>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-neon-pink flex-shrink-0" />
                  <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {currentUser?.email ?? '—'}
                  </p>
                </div>
              </div>
              <div className={`rounded-xl p-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Account Tier</p>
                <div className="flex items-center gap-2">
                  {isProfileActive ? (
                    accountTier === 2 ? (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-pink/20 text-neon-pink text-xs font-medium">
                        <Crown className="w-3 h-3" />Tier II
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                        <Zap className="w-3 h-3" />Tier I
                      </div>
                    )
                  ) : (
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-200 text-gray-500'} text-xs font-medium`}>
                      <Lock className="w-3 h-3" />Not Activated
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Balance + Lifetime stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <DollarSign className="w-4 h-4 text-neon-pink mx-auto mb-1" />
                <p className="text-lg font-bold text-neon-pink tabular-nums">${availableEarnings.toFixed(2)}</p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Balance</p>
              </div>
              <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-green-400 tabular-nums">{lifetimeWithdrawals}</p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Lifetime Cashouts</p>
              </div>
              <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <User className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                <p className={`text-lg font-bold tabular-nums ${
                  referralsMet ? 'text-green-400' : isDark ? 'text-yellow-400' : 'text-yellow-600'
                }`}>
                  {currentCycleReferrals}/{requiredReferrals}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Referrals</p>
              </div>
            </div>
          </div>

          {/* Withdrawal Status Banner */}
          <div className={`rounded-2xl p-5 mb-6 border-2 ${
            referralsMet
              ? isDark ? 'bg-green-500/10 border-green-500/40' : 'bg-green-50 border-green-200'
              : isDark ? 'bg-yellow-500/10 border-yellow-500/40' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center gap-3">
              {referralsMet ? (
                <div className={`p-2 rounded-lg ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                  <span className="text-green-400 font-bold text-sm">✓</span>
                </div>
              ) : (
                <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                  <Lock className="w-5 h-5 text-yellow-400" />
                </div>
              )}
              <div>
                <p className={`text-sm font-bold ${
                  referralsMet ? 'text-green-400' : isDark ? 'text-yellow-400' : 'text-yellow-600'
                }`}>
                  {referralsMet
                    ? `Verified: ${currentCycleReferrals}/${requiredReferrals} — Withdrawal Unlocked`
                    : `Locked: ${currentCycleReferrals}/${requiredReferrals} Referrals`}
                </p>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {lifetimeWithdrawals === 0
                    ? 'First cashout requires 2 active referrals. Subsequent cashouts require 1.'
                    : 'This cashout requires 1 active referral.'}
                </p>
              </div>
            </div>
          </div>

          {/* Withdrawal Panel */}
          {isProfileActive && (
            <WithdrawalPanel
              availableEarnings={availableEarnings}
              currentCycleReferrals={currentCycleReferrals}
              lifetimeWithdrawals={lifetimeWithdrawals}
              onCashout={handleCashout}
              hasPendingCashout={pendingCashoutRequests.some((r) => r.userId === currentUser?.id)}
            />
          )}

          {/* Transaction Ledger */}
          {isProfileActive && (
            <TransactionLedger
              deposits={pendingDeposits.filter((d) => d.userId === currentUser?.id)}
              cashouts={cashoutRequests.filter((c) => c.userId === currentUser?.id)}
            />
          )}
        </div>
      </div>

      {showDepositOverlay && <DepositOverlay onSelectTier={() => {}} />}

      <Notification
        message={notificationMessage}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}
