import { useState, useRef, useCallback } from 'react';
import {
  User, Mail, Lock, Crown, Zap, DollarSign, TrendingUp,
  Upload, Camera, AlertCircle, CheckCircle, Clock, XCircle,
  Shield, Sparkles, Phone, X, Wallet, Link2, ArrowRight,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useGlobalState } from '../hooks/useGlobalState.tsx';
import { WithdrawalPanel } from '../components/WithdrawalPanel';
import { DepositOverlay } from '../components/DepositOverlay';
import { Notification } from '../components/Notification';
import { TransactionLedger } from '../components/TransactionLedger';
import type { AccountTier } from '../types';
import { TIER_CONFIG } from '../types';
import { compressImage } from '../utils/imageCompress';

type ModalType = 'profile' | 'deposit' | 'withdrawal' | null;

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
    updateProfile,
  } = useGlobalState();

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Profile modal state
  const [profileFullName, setProfileFullName] = useState(currentUser?.fullName ?? '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email ?? '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone ?? '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
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

  const avatarUrl = avatarPreview ?? currentUser?.avatarUrl ?? null;

  const isProfileComplete =
    !!currentUser?.fullName?.trim() &&
    !!currentUser?.email?.trim() &&
    !!currentUser?.phone?.trim() &&
    !!currentUser?.avatarUrl;

  const notify = (msg: string) => {
    setNotificationMessage(msg);
    setShowNotification(true);
  };

  const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setIsUploadingAvatar(true);
    try {
      const dataUrl = await compressImage(file, 256, 256, 0.7);
      setAvatarPreview(dataUrl);
    } catch {
      setProfileErrors((e) => ({ ...e, avatar: 'Could not process image.' }));
    } finally {
      setIsUploadingAvatar(false);
    }
  }, []);

  const handleSaveProfile = async () => {
    const errs: Record<string, string> = {};
    if (!profileFullName.trim()) errs.fullName = 'Full name is required.';
    if (!profileEmail.trim() || !/\S+@\S+\.\S+/.test(profileEmail)) errs.email = 'Valid email is required.';
    if (!profilePhone.trim()) errs.phone = 'Phone number is required.';
    if (!avatarPreview && !currentUser?.avatarUrl) errs.avatar = 'Profile picture is required.';
    if (Object.keys(errs).length) { setProfileErrors(errs); return; }

    setIsSavingProfile(true);
    try {
      if (avatarPreview && avatarPreview !== currentUser?.avatarUrl) {
        await uploadAvatar(avatarPreview);
      }
      const result = await updateProfile(profileFullName.trim(), profileEmail.trim(), profilePhone.trim());
      if (result.success) {
        notify('Profile updated successfully.');
        setActiveModal(null);
      } else {
        notify(result.error || 'Failed to update profile.');
      }
    } catch {
      notify('Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
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
      notify('Cashout request submitted — pending admin authorization.');
      setActiveModal(null);
    } else {
      notify(result.error || 'Withdrawal request failed.');
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setProfileErrors({});
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-cosmic-midnight' : 'bg-ivory'} pt-24 pb-28 md:pb-12 px-4 overflow-x-hidden`}>
      <div className="max-w-4xl mx-auto relative z-10 mt-6">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Account & Cashout
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your profile, deposit status, withdrawals, and transaction history
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={() => {
              setProfileFullName(currentUser?.fullName ?? '');
              setProfileEmail(currentUser?.email ?? '');
              setProfilePhone(currentUser?.phone ?? '');
              setAvatarPreview(null);
              setProfileErrors({});
              setActiveModal('profile');
            }}
            className={`flex-1 w-full px-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              isDark
                ? 'bg-neon-pink/15 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/25'
                : 'bg-neon-pink/10 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/20'
            }`}
          >
            <User className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Update Your Profile</span>
          </button>

          <button
            onClick={() => setActiveModal('deposit')}
            className={`flex-1 w-full px-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              isDark ? 'btn-neon-dark' : 'btn-neon-light'
            }`}
          >
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Deposit</span>
          </button>

          <button
            onClick={() => setActiveModal('withdrawal')}
            className={`flex-1 w-full px-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              isDark
                ? 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            <DollarSign className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Request Withdrawal</span>
          </button>
        </div>

        {/* Profile completeness warning */}
        {!isProfileComplete && (
          <div className={`rounded-xl p-4 mb-6 border-2 flex items-start gap-3 ${
            isDark ? 'bg-yellow-500/10 border-yellow-500/40' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-yellow-400">Profile Incomplete</p>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                You must set your Name, Email, Phone Number, and Profile Picture in Settings to unlock academic assignments.
              </p>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className={`${glass} p-6 mb-6`}>
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-neon-pink/20' : 'bg-neon-pink/10'}`}>
              <User className="w-6 h-6 text-neon-pink" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile Settings</h3>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Your account information</p>
            </div>
            {isProfileComplete && (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            )}
          </div>

          {/* Avatar display */}
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
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile Picture</p>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {currentUser?.avatarUrl ? 'Picture set' : 'Not set — update profile to add one'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className={`rounded-xl p-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Full Name</p>
              <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {currentUser?.fullName ?? '—'}
              </p>
            </div>
            <div className={`rounded-xl p-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Username</p>
              <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {currentUser?.username ?? '—'}
              </p>
            </div>
            <div className={`rounded-xl p-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Email</p>
              <div className="flex items-center gap-1.5 min-w-0">
                <Mail className="w-3.5 h-3.5 text-neon-pink flex-shrink-0" />
                <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentUser?.email ?? '—'}
                </p>
              </div>
            </div>
            <div className={`rounded-xl p-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Phone</p>
              <div className="flex items-center gap-1.5 min-w-0">
                <Phone className="w-3.5 h-3.5 text-neon-pink flex-shrink-0" />
                <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentUser?.phone ?? '—'}
                </p>
              </div>
            </div>
            <div className={`rounded-xl p-4 sm:col-span-2 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
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
            <div className="min-w-0">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Deposit Status</h3>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Your escrow activation and tier</p>
            </div>
          </div>

          {isProfileActive && accountTier !== 0 ? (
            <div className={`rounded-xl p-4 border-2 ${isDark ? 'bg-green-500/10 border-green-500/40' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                <div className="min-w-0">
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
                <div className="min-w-0">
                  <p className="text-sm font-bold text-yellow-400">Pending Admin Review</p>
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
                <div className="flex-1 min-w-0">
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
                <div className="min-w-0">
                  <p className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>No Active Deposit</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Submit your deposit proof to activate your account and unlock the workspace.
                  </p>
                </div>
              </div>
            </div>
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
              <div className={`p-2 rounded-lg flex-shrink-0 ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            ) : (
              <div className={`p-2 rounded-lg flex-shrink-0 ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                <Lock className="w-5 h-5 text-yellow-400" />
              </div>
            )}
            <div className="min-w-0">
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

        {/* Transaction Ledger */}
        {isProfileActive && (
          <TransactionLedger
            deposits={userDeposits}
            cashouts={cashoutRequests.filter((c) => c.userId === currentUser?.id)}
          />
        )}
      </div>

      {/* ── Profile Modal ── */}
      {activeModal === 'profile' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 backdrop-blur-xl bg-black/65" onClick={closeModal} />
          <div className={`relative ${glass} max-w-md w-full p-6 shadow-2xl max-h-[92vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Update Your Profile</h2>
              <button onClick={closeModal} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Avatar upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover border-2 border-neon-pink/30" />
                  ) : (
                    <div className={`w-24 h-24 rounded-2xl flex items-center justify-center ${isDark ? 'bg-neon-pink/20' : 'bg-neon-pink/10'}`}>
                      <User className="w-10 h-10 text-neon-pink" />
                    </div>
                  )}
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className={`absolute -bottom-1 -right-1 p-2 rounded-full transition-all ${isDark ? 'bg-neon-pink/30 hover:bg-neon-pink/50' : 'bg-neon-pink/20 hover:bg-neon-pink/40'} border-2 ${isDark ? 'border-cosmic-midnight' : 'border-ivory'}`}
                  >
                    <Camera className="w-4 h-4 text-neon-pink" />
                  </button>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                {isUploadingAvatar && <p className="text-xs text-neon-pink">Processing...</p>}
                {profileErrors.avatar && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{profileErrors.avatar}</p>}
              </div>

              {/* Full Name */}
              <div>
                <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Full Name <span className="text-neon-pink">*</span>
                </label>
                <div className="relative">
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    value={profileFullName}
                    onChange={(e) => { setProfileFullName(e.target.value); setProfileErrors((p) => ({ ...p, fullName: '' })); }}
                    placeholder="Enter your full name"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-pink/50' : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-neon-pink/50'} ${profileErrors.fullName ? 'border-red-400' : ''}`}
                  />
                </div>
                {profileErrors.fullName && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{profileErrors.fullName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address <span className="text-neon-pink">*</span>
                </label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => { setProfileEmail(e.target.value); setProfileErrors((p) => ({ ...p, email: '' })); }}
                    placeholder="Enter your email"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-pink/50' : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-neon-pink/50'} ${profileErrors.email ? 'border-red-400' : ''}`}
                  />
                </div>
                {profileErrors.email && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{profileErrors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone Number <span className="text-neon-pink">*</span>
                </label>
                <div className="relative">
                  <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => { setProfilePhone(e.target.value); setProfileErrors((p) => ({ ...p, phone: '' })); }}
                    placeholder="Enter your phone number"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-pink/50' : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-neon-pink/50'} ${profileErrors.phone ? 'border-red-400' : ''}`}
                  />
                </div>
                {profileErrors.phone && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{profileErrors.phone}</p>}
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className={`w-full ${isDark ? 'btn-neon-dark' : 'btn-neon-light'} flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isSavingProfile ? (
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Deposit Modal ── */}
      {activeModal === 'deposit' && (
        <DepositOverlay onSelectTier={() => setActiveModal(null)} />
      )}

      {/* ── Withdrawal Modal ── */}
      {activeModal === 'withdrawal' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 backdrop-blur-xl bg-black/65" onClick={closeModal} />
          <div className={`relative ${glass} max-w-md w-full p-6 shadow-2xl max-h-[92vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Request Withdrawal</h2>
              <button onClick={closeModal} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>

            <WithdrawalPanel
              availableEarnings={availableEarnings}
              currentCycleReferrals={currentCycleReferrals}
              lifetimeWithdrawals={lifetimeWithdrawals}
              onCashout={handleCashout}
              hasPendingCashout={pendingCashoutRequests.some((r) => r.userId === currentUser?.id)}
            />
          </div>
        </div>
      )}

      <Notification
        message={notificationMessage}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}
