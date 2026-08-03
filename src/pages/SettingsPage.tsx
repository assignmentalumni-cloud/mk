import { useState, useRef, useCallback } from 'react';
import {
  User, Mail, Phone, Lock, ChevronDown, Upload, CheckCircle,
  AlertCircle, X, FileText, Image as ImageIcon, Eye, Trash2,
  Shield, Wallet, DollarSign, Users, ArrowRight, Copy, AlertTriangle,
  Link2, Crown, Zap, Sparkles, Clock,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useGlobalState } from '../hooks/useGlobalState.tsx';
import { WithdrawalPanel } from '../components/WithdrawalPanel';
import type { AccountTier } from '../types';

const BEP20_DEPOSIT_ADDRESS = '0xDb4E86cCa824E8CBeDba466430CFC1f8A6191BCb';
const MIN_WITHDRAWAL = 10;

type Section = 'profile' | 'deposit' | 'withdrawal' | null;

export function SettingsPage() {
  const { isDark } = useTheme();
  const {
    currentUser,
    updateProfile,
    updatePassword,
    uploadAvatar,
    uploadProofOfWork,
    removeProofOfWork,
    submitDepositProof,
    requestCashout,
    pendingCashoutRequests,
  } = useGlobalState();

  const [openSection, setOpenSection] = useState<Section>('profile');

  // ── Profile form state ──────────────────────────────────────────────────────
  const [fullName, setFullName] = useState(currentUser?.fullName ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // ── Avatar upload state ─────────────────────────────────────────────────────
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  // ── Proof of work upload state ──────────────────────────────────────────────
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);
  const proofRef = useRef<HTMLInputElement>(null);

  // ── Deposit form state ───────────────────────────────────────────────────────
  const [selectedTier, setSelectedTier] = useState<1 | 2 | null>(null);
  const [depUsername, setDepUsername] = useState(currentUser?.username ?? '');
  const [depEmail, setDepEmail] = useState(currentUser?.email ?? '');
  const [depWallet, setDepWallet] = useState('');
  const [depFile, setDepFile] = useState<File | null>(null);
  const [depErrors, setDepErrors] = useState<Record<string, string>>({});
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);
  const [copied, setCopied] = useState(false);
  const depFileRef = useRef<HTMLInputElement>(null);

  // ── Withdrawal form state ────────────────────────────────────────────────────
  const [wAmount, setWAmount] = useState('');
  const [wBeneficiary, setWBeneficiary] = useState('');
  const [wEmail, setWEmail] = useState(currentUser?.email ?? '');
  const [wWallet, setWWallet] = useState('');
  const [wErrors, setWErrors] = useState<Record<string, string>>({});

  const glass = isDark ? 'glass-dark' : 'glass-light';

  // ── Profile completeness check ──────────────────────────────────────────────
  const isProfileComplete = !!(
    currentUser?.fullName?.trim() &&
    currentUser?.email?.trim() &&
    currentUser?.phone?.trim() &&
    currentUser?.avatarUrl
  );

  const toggleSection = (s: Section) => {
    if (s === 'deposit' || s === 'withdrawal') {
      if (!isProfileComplete) return;
    }
    setOpenSection(openSection === s ? null : s);
  };

  // ── Avatar handlers ─────────────────────────────────────────────────────────
  const handleAvatarFile = (f: File) => {
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(f.type) &&
        !f.name.endsWith('.jpg') && !f.name.endsWith('.png') && !f.name.endsWith('.jpeg')) return;
    setAvatarFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  // ── Proof of work handlers ───────────────────────────────────────────────────
  const handleProofFiles = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((f) =>
      ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(f.type) ||
      f.name.endsWith('.jpg') || f.name.endsWith('.png') || f.name.endsWith('.jpeg') || f.name.endsWith('.pdf')
    );
    setProofFiles((prev) => [...prev, ...valid]);
    setProofError(null);
  };

  const removeProofFile = (idx: number) => {
    setProofFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUploadProofs = async () => {
    if (proofFiles.length === 0) return;
    setIsUploadingProof(true);
    const result = await uploadProofOfWork(proofFiles);
    setIsUploadingProof(false);
    if (result.success) {
      setProofFiles([]);
    } else {
      setProofError(result.error || 'Upload failed.');
    }
  };

  // ── Profile save handler ────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required.';
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Enter a valid email.';
    if (!phone.trim()) errs.phone = 'Mobile number is required.';
    if (Object.keys(errs).length) { setProfileErrors(errs); return; }

    setIsSavingProfile(true);

    if (avatarFile && avatarPreview) {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(avatarFile);
      });
      await uploadAvatar(dataUrl);
    }

    const result = await updateProfile(fullName.trim(), email.trim(), phone.trim());

    if (newPassword) {
      await updatePassword(newPassword);
      setNewPassword('');
    }

    setIsSavingProfile(false);
    if (result.success) {
      setProfileSaved(true);
      setAvatarFile(null);
      setAvatarPreview(null);
      setTimeout(() => setProfileSaved(false), 3000);
    } else {
      setProfileErrors({ general: result.error || 'Failed to save profile.' });
    }
  };

  // ── Deposit handlers ─────────────────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(BEP20_DEPOSIT_ADDRESS).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDepositSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!selectedTier) errs.tier = 'Please select an account tier.';
    if (!depUsername.trim()) errs.username = 'Username is required.';
    if (!depEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(depEmail.trim())) errs.email = 'Valid email required.';
    if (!depWallet.trim()) errs.wallet = 'Wallet address required.';
    else if (!depWallet.trim().toLowerCase().startsWith('0x')) errs.wallet = 'BEP-20 addresses start with 0x.';
    if (!depFile) errs.file = 'Receipt screenshot required.';
    if (Object.keys(errs).length) { setDepErrors(errs); return; }

    setIsSubmittingDeposit(true);
    await submitDepositProof(
      selectedTier!,
      depUsername.trim(),
      depEmail.trim(),
      depWallet.trim(),
      depFile?.name ?? null,
    );
    setIsSubmittingDeposit(false);
  };

  // ── Withdrawal handlers ──────────────────────────────────────────────────────
  const availableEarnings = currentUser?.availableEarnings ?? 0;
  const currentCycleReferrals = currentUser?.currentCycleReferrals ?? 0;
  const lifetimeWithdrawals = currentUser?.lifetimeWithdrawals ?? 0;
  const hasPendingCashout = pendingCashoutRequests.some((c) => c.userId === currentUser?.id);
  const isFirstWithdrawal = lifetimeWithdrawals === 0;
  const requiredReferrals = 1; // Per spec: 1 active referral needed
  const referralLocked = currentCycleReferrals < requiredReferrals;
  const balanceLocked = availableEarnings < MIN_WITHDRAWAL;
  const wLocked = referralLocked || balanceLocked;

  const handleWithdraw = () => {
    if (wLocked || hasPendingCashout) return;
    const errs: Record<string, string> = {};
    const parsed = parseFloat(wAmount);
    if (!wAmount || isNaN(parsed) || parsed <= 0) errs.amount = 'Enter a valid amount.';
    else if (parsed < MIN_WITHDRAWAL) errs.amount = `Minimum is $${MIN_WITHDRAWAL}.00.`;
    else if (parsed > availableEarnings) errs.amount = `Exceeds $${availableEarnings.toFixed(2)} balance.`;
    if (!wBeneficiary.trim()) errs.beneficiary = 'Beneficiary username required.';
    if (!wEmail.trim()) errs.email = 'Email required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(wEmail.trim())) errs.email = 'Valid email required.';
    if (!wWallet.trim()) errs.wallet = 'Wallet address required.';
    else if (!wWallet.trim().toLowerCase().startsWith('0x')) errs.wallet = 'BEP-20 addresses start with 0x.';
    if (Object.keys(errs).length) { setWErrors(errs); return; }

    requestCashout(parsed, wBeneficiary.trim(), wEmail.trim(), wWallet.trim());
    setWAmount(''); setWBeneficiary(''); setWWallet(''); setWErrors({});
  };

  // ── Input class helper ───────────────────────────────────────────────────────
  const inputClass = (errKey?: string, disabled?: boolean) =>
    `w-full px-4 py-3 rounded-xl text-sm outline-none transition-all ${
      disabled
        ? isDark ? 'bg-white/3 border border-white/5 text-gray-600 cursor-not-allowed'
          : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
        : isDark
        ? `bg-white/5 border ${errKey && wErrors[errKey] ? 'border-red-400' : 'border-white/10'} text-white placeholder-gray-600 focus:border-neon-pink/50`
        : `bg-white border ${errKey && wErrors[errKey] ? 'border-red-400' : 'border-gray-200'} text-gray-900 placeholder-gray-400 focus:border-neon-pink/50`
    }`;

  const pInputClass = (errKey?: string) =>
    `w-full px-4 py-3 rounded-xl text-sm outline-none transition-all ${
      isDark
        ? `bg-white/5 border ${errKey && profileErrors[errKey] ? 'border-red-400' : 'border-white/10'} text-white placeholder-gray-600 focus:border-neon-pink/50`
        : `bg-white border ${errKey && profileErrors[errKey] ? 'border-red-400' : 'border-gray-200'} text-gray-900 placeholder-gray-400 focus:border-neon-pink/50`
    }`;

  const dInputClass = (errKey?: string) =>
    `w-full px-4 py-3 rounded-xl text-sm outline-none transition-all ${
      isDark
        ? `bg-white/5 border ${errKey && depErrors[errKey] ? 'border-red-400' : 'border-white/10'} text-white placeholder-gray-600 focus:border-neon-pink/50`
        : `bg-white border ${errKey && depErrors[errKey] ? 'border-red-400' : 'border-gray-200'} text-gray-900 placeholder-gray-400 focus:border-neon-pink/50`
    }`;

  const tiers = [
    { id: 1 as const, deposit: 15, label: 'Tier I Escrow', desc: 'Earn $0.70 profit daily, 1 assignment.' },
    { id: 2 as const, deposit: 35, label: 'Tier II Escrow', desc: 'Earn $1.70 profit daily, 1 assignment.', badge: 'Popular' },
    { id: 3 as const, deposit: 70, label: 'Tier III Escrow', desc: 'Earn up to $3.40 daily, 2 assignments.', badge: 'Premium' },
  ];

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className={`${glass} p-5`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-neon-pink/20' : 'bg-neon-pink/10'}`}>
            <User className="w-5 h-5 text-neon-pink" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Account Settings</h2>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Manage your profile, deposits, and withdrawals
            </p>
          </div>
          {isProfileComplete ? (
            <span className={`ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-700'}`}>
              <CheckCircle className="w-3.5 h-3.5" /> Profile Complete
            </span>
          ) : (
            <span className={`ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-50 text-yellow-700'}`}>
              <AlertCircle className="w-3.5 h-3.5" /> Profile Incomplete
            </span>
          )}
        </div>
      </div>

      {/* ── SECTION 1: Update Profile ─────────────────────────────────────────── */}
      <div className={`${glass} overflow-hidden`}>
        <button
          onClick={() => toggleSection('profile')}
          className={`w-full flex items-center gap-3 p-5 text-left transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
            <User className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Update Profile</h3>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Name, photo, mobile, email, password & proof of work
            </p>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${openSection === 'profile' ? 'rotate-180' : ''} ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        </button>

        {openSection === 'profile' && (
          <div className={`px-5 pb-5 border-t ${isDark ? 'border-white/10' : 'border-gray-200'} pt-5 space-y-5`}>
            {profileSaved && (
              <div className={`flex items-center gap-2 p-3 rounded-xl ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <p className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>Profile saved successfully! Deposit & Withdrawal are now unlocked.</p>
              </div>
            )}
            {profileErrors.general && (
              <div className={`flex items-center gap-2 p-3 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-sm font-medium text-red-400">{profileErrors.general}</p>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Full Name</label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setProfileErrors((p) => ({ ...p, fullName: '' })); }}
                  placeholder="Enter your full name"
                  className={`${pInputClass('fullName')} pl-10`}
                />
              </div>
              {profileErrors.fullName && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{profileErrors.fullName}</p>}
            </div>

            {/* Profile Picture */}
            <div>
              <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Profile Picture</label>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 border-2 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className={`w-6 h-6 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  )}
                </div>
                <button
                  onClick={() => avatarRef.current?.click()}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'}`}
                >
                  <Upload className="w-4 h-4" />
                  {avatarPreview || avatarUrl ? 'Change Photo' : 'Upload Photo'}
                </button>
                {(avatarPreview || avatarUrl) && (
                  <button
                    onClick={() => { setAvatarFile(null); setAvatarPreview(null); setAvatarUrl(''); }}
                    className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-gray-500' : 'hover:bg-gray-100 text-gray-400'}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <input
                ref={avatarRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarFile(f); }}
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Mobile Number</label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setProfileErrors((p) => ({ ...p, phone: '' })); }}
                  placeholder="+1 234 567 8900"
                  className={`${pInputClass('phone')} pl-10`}
                />
              </div>
              {profileErrors.phone && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{profileErrors.phone}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Email Address</label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setProfileErrors((p) => ({ ...p, email: '' })); }}
                  placeholder="you@example.com"
                  className={`${pInputClass('email')} pl-10`}
                />
              </div>
              {profileErrors.email && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{profileErrors.email}</p>}
            </div>

            {/* Password Update */}
            <div>
              <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Account Password Update <span className={`${isDark ? 'text-gray-600' : 'text-gray-400'}`}>(leave blank to keep current)</span>
              </label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className={`${pInputClass()} pl-10`}
                />
              </div>
            </div>

            {/* Proof of Work / Verification Upload */}
            <div>
              <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Proof of Work / Verification Upload
              </label>
              <p className={`text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Upload photos or PDF files of your work/assignment proofs. Admin will review them.
              </p>

              {/* Already uploaded proofs */}
              {currentUser.proofOfWorkUrls && currentUser.proofOfWorkUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  {currentUser.proofOfWorkUrls.map((url, idx) => {
                    const isPdf = url.toLowerCase().endsWith('.pdf');
                    return (
                      <div key={idx} className={`relative group rounded-xl overflow-hidden border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                        {isPdf ? (
                          <a href={url} target="_blank" rel="noopener noreferrer" className={`flex flex-col items-center justify-center p-4 h-24 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                            <FileText className="w-8 h-8 text-red-400 mb-1" />
                            <span className={`text-xs truncate w-full text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>View PDF</span>
                          </a>
                        ) : (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="block h-24">
                            <img src={url} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover" />
                          </a>
                        )}
                        <button
                          onClick={() => removeProofOfWork(url)}
                          className="absolute top-1 right-1 p-1 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Files to upload */}
              {proofFiles.length > 0 && (
                <div className="space-y-2 mb-3">
                  {proofFiles.map((f, idx) => (
                    <div key={idx} className={`flex items-center gap-2 p-2.5 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                      {f.type.startsWith('image/') ? <ImageIcon className="w-4 h-4 text-blue-400 flex-shrink-0" /> : <FileText className="w-4 h-4 text-red-400 flex-shrink-0" />}
                      <span className={`text-xs flex-1 truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{f.name}</span>
                      <button onClick={() => removeProofFile(idx)} className={`p-1 rounded ${isDark ? 'hover:bg-white/10 text-gray-500' : 'hover:bg-gray-200 text-gray-400'}`}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleUploadProofs}
                    disabled={isUploadingProof}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isDark ? 'bg-neon-pink/20 hover:bg-neon-pink/30 text-neon-pink border border-neon-pink/20' : 'bg-neon-pink/10 hover:bg-neon-pink/20 text-neon-pink border border-neon-pink/20'} disabled:opacity-50`}
                  >
                    {isUploadingProof ? <Clock className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload {proofFiles.length} file{proofFiles.length !== 1 ? 's' : ''}
                  </button>
                </div>
              )}

              {proofError && <p className="text-xs text-red-400 mb-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{proofError}</p>}

              {/* Drop zone */}
              <div
                onClick={() => proofRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  isDark ? 'border-white/20 hover:border-neon-pink/40 hover:bg-white/5' : 'border-gray-300 hover:border-neon-pink/40 hover:bg-gray-50'
                }`}
              >
                <Upload className={`w-7 h-7 mx-auto mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Click to upload proof files
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  JPG, PNG, PDF accepted — multiple files allowed
                </p>
              </div>
              <input
                ref={proofRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                multiple
                className="hidden"
                onChange={(e) => handleProofFiles(e.target.files)}
              />
            </div>

            {/* Save button */}
            <button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${isDark ? 'btn-neon-dark' : 'btn-neon-light'} disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {isSavingProfile ? (
                <><Clock className="w-4 h-4 animate-spin" /> Saving…</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Save Profile</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── SECTION 2: Deposit ────────────────────────────────────────────────── */}
      <div className={`${glass} overflow-hidden`}>
        <button
          onClick={() => toggleSection('deposit')}
          className={`w-full flex items-center gap-3 p-5 text-left transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} ${!isProfileComplete ? 'cursor-not-allowed' : ''}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isProfileComplete ? (isDark ? 'bg-green-500/20' : 'bg-green-50') : (isDark ? 'bg-gray-500/10' : 'bg-gray-100')}`}>
            {isProfileComplete ? <Wallet className="w-5 h-5 text-green-400" /> : <Lock className="w-5 h-5 text-gray-500" />}
          </div>
          <div className="flex-1">
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Deposit</h3>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {isProfileComplete ? 'Submit deposit slip & payment proof' : 'Complete profile to unlock'}
            </p>
          </div>
          {!isProfileComplete && (
            <span className="text-xs">🔒</span>
          )}
          {isProfileComplete && (
            <ChevronDown className={`w-5 h-5 transition-transform ${openSection === 'deposit' ? 'rotate-180' : ''} ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          )}
        </button>

        {!isProfileComplete && (
          <div className={`px-5 pb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            <p className="text-xs flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              Complete and update your profile first to unlock Deposit & Withdrawal
            </p>
          </div>
        )}

        {openSection === 'deposit' && isProfileComplete && (
          <div className={`px-5 pb-5 border-t ${isDark ? 'border-white/10' : 'border-gray-200'} pt-5 space-y-5`}>
            {/* Pending state */}
            {currentUser.activationStatus === 'Activation_Pending' ? (
              <div className="text-center py-6">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                  <Clock className="w-7 h-7 text-yellow-400" />
                </div>
                <h4 className={`text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Deposit Under Review</h4>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your deposit proof is under manual review. You'll be notified once verified.
                </p>
              </div>
            ) : (
              <>
                {/* Tier selection */}
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Step 1 — Select Account Tier
                  </p>
                  <div className="grid gap-3">
                    {tiers.map((tier) => {
                      const active = selectedTier === tier.id;
                      return (
                        <button
                          key={tier.id}
                          onClick={() => { setSelectedTier(tier.id); setDepErrors((e) => ({ ...e, tier: '' })); }}
                          className={`relative w-full p-4 rounded-xl text-left transition-all ${
                            active
                              ? isDark ? 'bg-neon-pink/20 border-2 border-neon-pink' : 'bg-neon-pink/10 border-2 border-neon-pink'
                              : isDark ? 'bg-white/5 border-2 border-white/10 hover:border-white/20' : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {tier.badge && (
                            <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-bold bg-neon-pink text-white">
                              {tier.badge}
                            </span>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {tier.id === 2 ? <Crown className={`w-4 h-4 ${active ? 'text-neon-pink' : isDark ? 'text-gray-400' : 'text-gray-500'}`} /> : <Zap className={`w-4 h-4 ${active ? 'text-neon-pink' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />}
                              <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{tier.label}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Sparkles className={`w-4 h-4 ${active ? 'text-neon-pink' : isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                              <span className={`text-2xl font-bold ${active ? 'text-neon-pink' : isDark ? 'text-white' : 'text-gray-900'}`}>${tier.deposit}</span>
                            </div>
                          </div>
                          <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{tier.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                  {depErrors.tier && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{depErrors.tier}</p>}
                </div>

                {/* BEP-20 Address */}
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Step 2 — Send Funds to Deposit Address
                  </p>
                  <div
                    className="rounded-xl p-5 border-2"
                    style={{
                      borderColor: isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.3)',
                      background: isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.05)',
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 rounded-lg flex-shrink-0" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                        <Wallet className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: '#8B5CF6' }}>
                          BNB Smart Chain (BEP-20 Only)
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Send only BEP-20. Other networks <span className="text-red-400 font-semibold">will result in loss.</span>
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${isDark ? 'bg-black/30' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                      <code className="text-sm flex-1 break-all font-mono text-neon-pink">
                        {BEP20_DEPOSIT_ADDRESS}
                      </code>
                      <button onClick={handleCopy} className={`flex-shrink-0 p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                        {copied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Verification form */}
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Step 3 — Submit Verification Details
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Account Username</label>
                      <input type="text" value={depUsername} onChange={(e) => { setDepUsername(e.target.value); setDepErrors((p) => ({ ...p, username: '' })); }} placeholder="Your username" className={`${dInputClass('username')}`} />
                      {depErrors.username && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{depErrors.username}</p>}
                    </div>
                    <div>
                      <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Registered Email</label>
                      <input type="email" value={depEmail} onChange={(e) => { setDepEmail(e.target.value); setDepErrors((p) => ({ ...p, email: '' })); }} placeholder="Your email" className={dInputClass('email')} />
                      {depErrors.email && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{depErrors.email}</p>}
                    </div>
                    <div>
                      <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Sender Wallet Address (BEP-20)</label>
                      <input type="text" value={depWallet} onChange={(e) => { setDepWallet(e.target.value); setDepErrors((p) => ({ ...p, wallet: '' })); }} placeholder="0x..." className={`${dInputClass('wallet')} font-mono`} />
                      {depErrors.wallet && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{depErrors.wallet}</p>}
                    </div>
                    <div>
                      <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Transaction Receipt Screenshot</label>
                      {!depFile ? (
                        <div
                          onClick={() => depFileRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                            depErrors.file ? 'border-red-400 bg-red-500/5'
                            : isDark ? 'border-white/20 hover:border-neon-pink/40 hover:bg-white/5' : 'border-gray-300 hover:border-neon-pink/40 hover:bg-gray-50'
                          }`}
                        >
                          <Upload className={`w-7 h-7 mx-auto mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Upload receipt screenshot</p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>JPG, PNG, PDF accepted</p>
                        </div>
                      ) : (
                        <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                          <FileText className="w-5 h-5 text-green-400 flex-shrink-0" />
                          <span className={`text-sm flex-1 truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{depFile.name}</span>
                          <button onClick={() => setDepFile(null)} className={`p-1 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      )}
                      <input ref={depFileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setDepFile(f); setDepErrors((p) => ({ ...p, file: '' })); } }} />
                      {depErrors.file && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{depErrors.file}</p>}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDepositSubmit}
                  disabled={isSubmittingDeposit}
                  className={`w-full ${isDark ? 'btn-neon-dark' : 'btn-neon-light'} flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {isSubmittingDeposit ? <Clock className="w-4 h-4 animate-spin" /> : <Shield className="w-5 h-5" />}
                  Submit Deposit for Verification
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── SECTION 3: Withdrawal ──────────────────────────────────────────────── */}
      <div className={`${glass} overflow-hidden`}>
        <button
          onClick={() => toggleSection('withdrawal')}
          className={`w-full flex items-center gap-3 p-5 text-left transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} ${!isProfileComplete ? 'cursor-not-allowed' : ''}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isProfileComplete ? (isDark ? 'bg-neon-pink/20' : 'bg-neon-pink/10') : (isDark ? 'bg-gray-500/10' : 'bg-gray-100')}`}>
            {isProfileComplete ? <DollarSign className="w-5 h-5 text-neon-pink" /> : <Lock className="w-5 h-5 text-gray-500" />}
          </div>
          <div className="flex-1">
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Withdrawal</h3>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {isProfileComplete ? 'Request a payout to your BEP-20 wallet' : 'Complete profile to unlock'}
            </p>
          </div>
          {!isProfileComplete && (
            <span className="text-xs">🔒</span>
          )}
          {isProfileComplete && (
            <ChevronDown className={`w-5 h-5 transition-transform ${openSection === 'withdrawal' ? 'rotate-180' : ''} ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          )}
        </button>

        {!isProfileComplete && (
          <div className={`px-5 pb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            <p className="text-xs flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              Complete and update your profile first to unlock Deposit & Withdrawal
            </p>
          </div>
        )}

        {openSection === 'withdrawal' && isProfileComplete && (
          <div className={`px-5 pb-5 border-t ${isDark ? 'border-white/10' : 'border-gray-200'} pt-5 space-y-4`}>
            {/* Available balance */}
            <div className={`rounded-xl p-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Available Balance</span>
                <span className="text-2xl font-bold text-neon-pink tabular-nums">${availableEarnings.toFixed(2)}</span>
              </div>
            </div>

            {/* Referral Tracker */}
            <div className={`rounded-xl p-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Active Referral Requirement</span>
                </div>
                <span className={`text-sm font-bold tabular-nums ${currentCycleReferrals >= requiredReferrals ? 'text-green-400' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentCycleReferrals} / {requiredReferrals}
                </span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${currentCycleReferrals >= requiredReferrals ? 'bg-green-400' : 'bg-neon-pink'}`}
                  style={{ width: `${Math.min(100, (currentCycleReferrals / requiredReferrals) * 100)}%` }}
                />
              </div>
            </div>

            {/* Status Banner */}
            {referralLocked && (
              <div className="flex items-center gap-3 rounded-xl p-4 border-2"
                style={{ background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)', borderColor: '#F59E0B' }}>
                <div className="p-2 rounded-lg flex-shrink-0" style={{ background: 'rgba(245,158,11,0.15)' }}>
                  <Lock className="w-5 h-5" style={{ color: '#F59E0B' }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#F59E0B' }}>
                    Withdrawal Locked: 1 active referral required
                  </p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    You need 1 active referral who has deposited for this withdrawal.
                  </p>
                </div>
              </div>
            )}
            {!referralLocked && balanceLocked && (
              <div className={`flex items-center gap-3 p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <Lock className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Minimum balance of ${MIN_WITHDRAWAL}.00 required to withdraw.
                </p>
              </div>
            )}

            {/* Pending cashout notice */}
            {hasPendingCashout && !wLocked && (
              <div className={`flex items-center gap-3 p-4 rounded-xl ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                <Clock className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <p className={`text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Payout Request Processing</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Your withdrawal is being processed by the admin.</p>
                </div>
              </div>
            )}

            {/* Withdrawal Form */}
            {!hasPendingCashout && (
              <div className="space-y-3">
                <div className={`pb-2 mb-1 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Withdrawal Request Form</p>
                </div>

                {/* Amount */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Withdrawal Amount ($)</label>
                    {!wLocked && (
                      <button onClick={() => { setWAmount(availableEarnings.toFixed(2)); setWErrors((p) => ({ ...p, amount: '' })); }} className="text-xs text-neon-pink hover:underline font-medium">
                        Use Max
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                    <input type="number" min={MIN_WITHDRAWAL} step="0.01" value={wAmount} onChange={(e) => { setWAmount(e.target.value); setWErrors((p) => ({ ...p, amount: '' })); }} placeholder={`${MIN_WITHDRAWAL}.00 minimum`} disabled={wLocked} className={`${inputClass('amount', wLocked)} pl-8`} />
                  </div>
                  {wErrors.amount && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{wErrors.amount}</p>}
                </div>

                {/* Beneficiary */}
                <div>
                  <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Beneficiary Username</label>
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}><User className="w-4 h-4" /></span>
                    <input type="text" value={wBeneficiary} onChange={(e) => { setWBeneficiary(e.target.value); setWErrors((p) => ({ ...p, beneficiary: '' })); }} placeholder="Your account username" disabled={wLocked} className={`${inputClass('beneficiary', wLocked)} pl-10`} />
                  </div>
                  {wErrors.beneficiary && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{wErrors.beneficiary}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Registered Email</label>
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}><Mail className="w-4 h-4" /></span>
                    <input type="email" value={wEmail} onChange={(e) => { setWEmail(e.target.value); setWErrors((p) => ({ ...p, email: '' })); }} placeholder="Your registered email" disabled={wLocked} className={`${inputClass('email', wLocked)} pl-10`} />
                  </div>
                  {wErrors.email && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{wErrors.email}</p>}
                </div>

                {/* Wallet Address */}
                <div>
                  <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Receiving Wallet Address <span className="text-neon-pink">(Strictly BEP-20 BSC Chain)</span> *
                  </label>
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}><Wallet className="w-4 h-4" /></span>
                    <input type="text" value={wWallet} onChange={(e) => { setWWallet(e.target.value); setWErrors((p) => ({ ...p, wallet: '' })); }} placeholder="0x... Binance Smart Chain address" disabled={wLocked} className={`${inputClass('wallet', wLocked)} pl-10 font-mono`} />
                  </div>
                  {wErrors.wallet && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{wErrors.wallet}</p>}
                </div>

                {/* BEP-20 Warning */}
                <div className="rounded-xl p-4 border-2"
                  style={{
                    background: isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.06)',
                    borderColor: '#8B5CF6',
                  }}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg flex-shrink-0" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                      <Link2 className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: '#8B5CF6' }}>
                        NETWORK ASSIGNED: BNB Smart Chain (BEP-20)
                      </p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Submissions using alternative chains will lead to <span className="font-semibold text-red-400">irreversible loss of funds</span>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleWithdraw}
                  disabled={wLocked}
                  className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all mt-1 ${
                    !wLocked
                      ? isDark ? 'btn-neon-dark' : 'btn-neon-light'
                      : isDark ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  }`}
                >
                  {wLocked ? (
                    <><Lock className="w-4 h-4" />{referralLocked ? 'Locked — 1 referral required' : `Minimum $${MIN_WITHDRAWAL} balance required`}</>
                  ) : (
                    <><CheckCircle className="w-4 h-4" />Request Cashout<ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
