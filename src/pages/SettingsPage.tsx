import { useState, useRef } from 'react';
import { User, Mail, Lock, Crown, Zap, DollarSign, TrendingUp, Upload, Camera, AlertCircle, CheckCircle, Clock, XCircle, Shield, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useGlobalState } from '../hooks/useGlobalState.tsx';
import { WithdrawalPanel } from '../components/WithdrawalPanel';
import { DepositOverlay } from '../components/DepositOverlay';
import { Notification } from '../components/Notification';
import { TransactionLedger } from '../components/TransactionLedger';
import type { AccountTier } from '../types';
import { TIER_CONFIG } from '../types';

export function SettingsPage() {
  const { isDark } = useTheme();
  const {
    currentUser,
    isProfileActive,
    pendingCashoutRequests,
    pendingDeposits,
    cashoutRequests,
    requestCashout,
    uploadAvatar,
  } = useGlobalState();

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showDepositOverlay, setShowDepositOverlay] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const glass = isDark ? 'glass-dark' : 'glass-light';

  const availableEarnings = currentUser?.availableEarnings ?? 0;
  const currentCycleReferrals = currentUser?.currentCycleReferrals ?? 0;
  const accountTier = currentUser?.depositTier ?? 0;
  const lifetimeWithdrawals = currentUser?.lifetimeWithdrawals ?? 0;
  const requiredReferrals = lifetimeWithdrawals === 0 ? 3 : 2;
  const referralsMet = currentCycleReferrals >= requiredReferrals;

  const userDeposits = pendingDeposits.filter((d) => d.userId === currentUser?.id);
  const latestDeposit = userDeposits.length > 0 ? userDeposits[userDeposits.length - 1] : null;
  const depositStatus = latestDeposit?.status ?? null;
  const activationStatus = currentUser?.activationStatus ?? null;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setIsUploadingAvatar(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        setAvatarPreview(dataUrl);
        await uploadAvatar(dataUrl);
        setNotificationMessage('Profile picture updated.');
        setShowNotification(true);
        setIsUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploadingAvatar(false);
      setNotificationMessage('Could not update profile picture.');
      setShowNotification(true);
    }
  };

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

  const avatarUrl = avatarPreview ?? currentUser?.avatarUrl ?? null;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-cosmic-midnight' : 'bg-ivory'} pt-24 pb-28 md:pb-12 px-4`}>
      <div className="max-w-4xl mx-auto relative z-10 mt-6">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Account & Cashout
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your profile, deposit status, withdrawals, and transaction history
          </p>
        </div>

        {/* Profile Card with Avatar */}
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

          {/* Avatar upload */}
          <div className={`rounded-xl p-5 mb-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover border-2 border-neon-pink/30" />
                ) : (
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${isDark ? 'bg-neon-pink/20' : 'bg-neon-pink/10'}`}>
                    <User className="w-8 h-8 text-neon-pink" />
                  </div>
                )}
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className={`absolute -bottom-1 -right-1 p-2 rounded-full transition-all ${isDark ? 'bg-neon-pink/30 hover:bg-neon-pink/50' : 'bg-neon-pink/20 hover:bg-neon-pink/40'} border-2 ${isDark ? 'border-cosmic-midnight' : 'border-ivory'}`}
                >
                  <Camera className="w-3.5 h-3.5 text-neon-pink" />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile Picture</p>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Click the camera icon to upload or change your avatar
                </p>
                {isUploadingAvatar && (
                  <p className="text-xs text-neon-pink mt-1">Uploading...</p>
                )}
              </div>
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
                  accountTier === 3 ? (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-pink/20 text-neon-pink text-xs font-medium">
                      <Crown className="w-3 h-3" />Tier III (${TIER_CONFIG[3].deposit})
                    </div>
                  ) : accountTier === 2 ? (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
                      <Sparkles className="w-3 h-3" />Tier II (${TIER_CONFIG[2].deposit})
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                      <Zap className="w-3 h-3" />Tier I (${TIER_CONFIG[1].deposit})
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

        {/* Deposit Status Card */}
        <div className={`${glass} p-6 mb-6`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-neon-pink/20' : 'bg-neon-pink/10'}`}>
              <Shield className="w-5 h-5 text-neon-pink" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Deposit Status</h3>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Your escrow activation and tier</p>
            </div>
          </div>

          {/* Status display */}
          {isProfileActive && accountTier !== 0 ? (
            <div className={`rounded-xl p-4 border-2 ${isDark ? 'bg-green-500/10 border-green-500/40' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-green-400">
                    Approved: {accountTier === 3 ? 'Tier III Active' : accountTier === 2 ? 'Tier II Active' : 'Tier I Active'}
                  </p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your escrow deposit has been verified. Your workspace is unlocked.
                  </p>
                </div>
              </div>
            </div>
          ) : activationStatus === 'Activation_Pending' ? (
            <div className={`rounded-xl p-4 border-2 ${isDark ? 'bg-yellow-500/10 border-yellow-500/40' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-yellow-400">Pending Verification</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your deposit proof is under review by the administrator. This typically takes 15–60 minutes.
                  </p>
                </div>
              </div>
            </div>
          ) : depositStatus === 'Declined' ? (
            <div className={`rounded-xl p-4 border-2 ${isDark ? 'bg-red-500/10 border-red-500/40' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-400">Deposit Rejected: Invalid/Fake Proof</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your deposit proof was rejected. Please submit a valid transaction receipt to activate your account.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className={`rounded-xl p-4 border-2 ${isDark ? 'bg-gray-500/10 border-gray-500/30' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-gray-400 flex-shrink-0" />
                <div>
                  <p className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>No Active Deposit</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Submit your deposit proof to activate your account and unlock the workspace.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Deposit / Upgrade button */}
          {!isProfileActive && activationStatus !== 'Activation_Pending' && (
            <button
              onClick={() => setShowDepositOverlay(true)}
              className={`w-full mt-4 ${isDark ? 'btn-neon-dark' : 'btn-neon-light'} flex items-center justify-center gap-2`}
            >
              <Upload className="w-4 h-4" />
              Submit $35 Deposit / Activate Account
            </button>
          )}

          {/* Upgrade button for Tier I users */}
          {isProfileActive && accountTier === 1 && (
            <button
              onClick={() => setShowDepositOverlay(true)}
              className={`w-full mt-4 ${isDark ? 'btn-neon-dark' : 'btn-neon-light'} flex items-center justify-center gap-2`}
            >
              <Crown className="w-4 h-4" />
              Upgrade to Tier II ($70)
            </button>
          )}

          {activationStatus === 'Activation_Pending' && (
            <p className={`text-center text-xs mt-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              You can submit a new deposit once your current one is reviewed.
            </p>
          )}
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
                  ? 'First cashout requires 3 active referrals. Subsequent cashouts require 2.'
                  : 'This cashout requires 2 active referrals.'}
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
            deposits={userDeposits}
            cashouts={cashoutRequests.filter((c) => c.userId === currentUser?.id)}
          />
        )}

        {showDepositOverlay && (
          <DepositOverlay
            onSelectTier={(_tier: 1 | 2 | 3) => {
              setShowDepositOverlay(false);
            }}
          />
        )}
      </div>

      <Notification
        message={notificationMessage}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}
