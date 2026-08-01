import { useState, useRef, useCallback } from 'react';
import {
  Shield, Lock, Crown, Zap, Sparkles, Upload,
  FileCheck, X, AlertCircle, Clock, CheckCircle, Copy,
  Wallet, User, Mail, TrendingUp,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useGlobalState } from '../hooks/useGlobalState.tsx';
import { TIER_CONFIG } from '../types';
import type { AccountTier } from '../types';

const BEP20_DEPOSIT_ADDRESS = '0xDb4E86cCa824E8CBeDba466430CFC1f8A6191BCb';
const SUPPORT_EMAIL = 'Assignmentalumni@gmail.com';

interface UploadedFile {
  name: string;
  size: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function OnboardingPaywall() {
  const { isDark } = useTheme();
  const { currentUser, submitDepositProof } = useGlobalState();

  const isPending = currentUser?.activationStatus === 'Activation_Pending';
  const isRejected = currentUser?.activationStatus === null && currentUser?.depositTier === 0;

  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3 | null>(null);
  const [username, setUsername] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const glass = isDark ? 'glass-dark' : 'glass-light';

  const handleCopy = () => {
    navigator.clipboard.writeText(BEP20_DEPOSIT_ADDRESS).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleFile = (f: File) => {
    if (!['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(f.type) &&
        !f.name.endsWith('.jpg') && !f.name.endsWith('.png') && !f.name.endsWith('.pdf')) return;
    setFile({ name: f.name, size: formatSize(f.size) });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedTier) e.tier = 'Please select an account tier.';
    if (!username.trim()) e.username = 'Account username is required.';
    if (!senderEmail.trim() || !/\S+@\S+\.\S+/.test(senderEmail))
      e.senderEmail = 'A valid email address is required.';
    if (!walletAddress.trim()) e.walletAddress = 'Sender wallet address is required.';
    else if (!walletAddress.trim().toLowerCase().startsWith('0x'))
      e.walletAddress = 'BEP-20 addresses must start with 0x.';
    if (!file) e.file = 'Transaction receipt screenshot is required.';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setIsSubmitting(true);
    await submitDepositProof(
      selectedTier!,
      username.trim(),
      senderEmail.trim(),
      walletAddress.trim(),
      file?.name ?? null,
    );
    setIsSubmitting(false);
  };

  const tiers = [
    { id: 1 as const, ...TIER_CONFIG[1], desc: 'Earn $0.70 profit daily by completing 1 assignment.' },
    { id: 2 as const, ...TIER_CONFIG[2], desc: 'Earn $1.70 profit daily by completing 1 assignment.', badge: 'Popular' },
    { id: 3 as const, ...TIER_CONFIG[3], desc: 'Earn up to $3.40 profit daily by completing 2 assignments ($1.70 each).', badge: 'Premium' },
  ];

  // ── Pending state ──────────────────────────────────────────────────────────────
  if (isPending) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-cosmic-midnight' : 'bg-ivory'} flex items-center justify-center p-4`}>
        <div className={`relative ${glass} max-w-md w-full p-8 text-center shadow-2xl`}>
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Deposit Under Review
          </h2>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Status: Pending Admin Review. Please wait while an admin verifies your payment slip.
          </p>
          <div
            className="mt-6 p-4 rounded-xl border-2 flex items-start gap-3"
            style={{ borderColor: '#F59E0B', background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)' }}
          >
            <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#F59E0B' }} />
            <p className="text-xs text-left leading-relaxed" style={{ color: '#F59E0B' }}>
              Processing typically takes 15–60 minutes. You will see your dashboard unlock once the administrator confirms the deposit receipt.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Rejected state (re-show form with rejection banner) ─────────────────────────
  const showRejectedBanner = isRejected && (currentUser?.username !== undefined);

  // ── Main deposit form ─────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${isDark ? 'bg-cosmic-midnight' : 'bg-ivory'} flex items-center justify-center p-4 py-8`}>
      <div className={`relative ${glass} max-w-lg w-full p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto`}>
        {/* Rejection banner */}
        {showRejectedBanner && (
          <div className="mb-5 p-4 rounded-xl border-2 border-red-500/40 bg-red-500/10 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-left leading-relaxed text-red-400 font-medium">
              Deposit Rejected: Invalid/Fake Proof. Please upload a valid payment slip to try again.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-7">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-neon-pink" />
            <Shield className="w-7 h-7 text-neon-pink" />
          </div>
          <h2 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Activate Your Profile
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Welcome to Assignment Alumni! Select a tier and submit your deposit slip to unlock your workspace.
          </p>
        </div>

        {/* Tier selection */}
        <div className="mb-6">
          <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Step 1 — Select Account Tier
          </p>
          <div className="grid gap-3">
            {tiers.map((tier) => {
              const active = selectedTier === tier.id;
              return (
                <button
                  key={tier.id}
                  onClick={() => { setSelectedTier(tier.id); setErrors((e) => ({ ...e, tier: '' })); }}
                  className={`relative w-full p-4 rounded-xl text-left transition-all duration-200 ${
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
                      {tier.id === 3 ? <Crown className={`w-4 h-4 ${active ? 'text-neon-pink' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        : tier.id === 2 ? <Sparkles className={`w-4 h-4 ${active ? 'text-neon-pink' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        : <Zap className={`w-4 h-4 ${active ? 'text-neon-pink' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />}
                      <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{tier.label} (${tier.deposit})</span>
                    </div>
                    <span className={`text-2xl font-bold ${active ? 'text-neon-pink' : isDark ? 'text-white' : 'text-gray-900'}`}>
                      ${tier.deposit}
                    </span>
                  </div>
                  <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{tier.desc}</p>
                </button>
              );
            })}
          </div>
          {errors.tier && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.tier}</p>}
        </div>

        {/* BEP-20 Payment Address */}
        <div className="mb-6">
          <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Step 2 — Send Funds to Deposit Address
          </p>
          <div
            className="rounded-xl p-5 border-2"
            style={{
              borderColor: isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.3)',
              background: isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.05)',
              boxShadow: isDark ? '0 0 20px rgba(139, 92, 246, 0.15)' : 'none',
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-lg flex-shrink-0" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                <Wallet className="w-5 h-5" style={{ color: '#8B5CF6' }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#8B5CF6' }}>
                  BNB Smart Chain (BEP-20 Address ONLY)
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Send only BNB Smart Chain (BEP-20) to this address. Other networks <span className="text-red-400 font-semibold">will result in loss.</span>
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${isDark ? 'bg-black/30' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <code className={`text-sm flex-1 break-all font-mono text-neon-pink`}>
                {BEP20_DEPOSIT_ADDRESS}
              </code>
              <button
                onClick={handleCopy}
                className={`flex-shrink-0 p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                {copied
                  ? <CheckCircle className="w-5 h-5 text-green-400" />
                  : <Copy className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />}
              </button>
            </div>
          </div>
        </div>

        {/* Proof form */}
        <div className="mb-6">
          <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Step 3 — Submit Verification Details
          </p>
          <div className="space-y-4">
            <div>
              <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Account Username <span className="text-neon-pink">*</span>
              </label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Enter your account username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setErrors((err) => ({ ...err, username: '' })); }}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all ${
                    isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-pink/50'
                    : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-neon-pink/50'
                  } ${errors.username ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.username && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.username}</p>}
            </div>

            <div>
              <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Registered Email Address <span className="text-neon-pink">*</span>
              </label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="Enter your registered email address"
                  value={senderEmail}
                  onChange={(e) => { setSenderEmail(e.target.value); setErrors((err) => ({ ...err, senderEmail: '' })); }}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all ${
                    isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-pink/50'
                    : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-neon-pink/50'
                  } ${errors.senderEmail ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.senderEmail && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.senderEmail}</p>}
            </div>

            <div>
              <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Sender Wallet Address (BEP-20) <span className="text-neon-pink">*</span>
              </label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Wallet className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Enter the 0x... wallet address used to send the payment"
                  value={walletAddress}
                  onChange={(e) => { setWalletAddress(e.target.value); setErrors((err) => ({ ...err, walletAddress: '' })); }}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-mono outline-none transition-all ${
                    isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-pink/50'
                    : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-neon-pink/50'
                  } ${errors.walletAddress ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.walletAddress && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.walletAddress}</p>}
            </div>

            <div>
              <label className={`text-xs font-medium mb-1.5 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Transaction Receipt Screenshot <span className="text-neon-pink">*</span>
              </label>
              {!file ? (
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isDragging ? 'border-neon-pink bg-neon-pink/10'
                    : errors.file ? 'border-red-400 bg-red-500/5'
                    : isDark ? 'border-white/20 hover:border-neon-pink/40 hover:bg-white/5' : 'border-gray-300 hover:border-neon-pink/40 hover:bg-gray-50'
                  }`}
                >
                  <Upload className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Upload or drop your transaction receipt image
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                    JPG, PNG, PDF accepted
                  </p>
                </div>
              ) : (
                <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                  <FileCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{file.name}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{file.size}</p>
                  </div>
                  <button onClick={() => setFile(null)} className={`p-1 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { handleFile(f); setErrors((err) => ({ ...err, file: '' })); }
                }}
              />
              {errors.file && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.file}</p>}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full ${isDark ? 'btn-neon-dark' : 'btn-neon-light'} flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting Deposit Proof…
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              Submit Deposit for Verification
            </>
          )}
        </button>

        <p className={`text-center text-xs mt-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          Submissions are reviewed manually. Do not send duplicate proofs.
        </p>

        {/* Support email */}
        <div className={`mt-5 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'} text-center`}>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Need help? Contact our 24/7 support team at{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-neon-pink font-medium hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
