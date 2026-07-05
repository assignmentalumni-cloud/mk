import { useState } from 'react';
import {
  DollarSign, Lock, Users, CheckCircle,
  AlertTriangle, ArrowRight, Clock, Mail,
  User, Wallet, Link2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const MIN_WITHDRAWAL = 10;

interface WithdrawalPanelProps {
  availableEarnings: number;
  currentCycleReferrals: number;
  lifetimeWithdrawals: number;
  onCashout: (amount: number, beneficiaryName: string, userEmail: string, walletAddress: string) => void;
  hasPendingCashout: boolean;
}

export function WithdrawalPanel({
  availableEarnings,
  currentCycleReferrals,
  lifetimeWithdrawals,
  onCashout,
  hasPendingCashout,
}: WithdrawalPanelProps) {
  const { isDark } = useTheme();

  const [inputAmount, setInputAmount] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic referral requirements based on withdrawal history
  const isFirstWithdrawal = lifetimeWithdrawals === 0;
  const requiredReferrals = isFirstWithdrawal ? 2 : 1;
  const referralsNeeded = Math.max(0, requiredReferrals - currentCycleReferrals);
  const referralLocked = currentCycleReferrals < requiredReferrals;
  const balanceLocked = availableEarnings < MIN_WITHDRAWAL;
  const isLocked = referralLocked || balanceLocked;

  const glass = isDark ? 'glass-dark' : 'glass-light';

  const clearErrors = (key: string) => setErrors((e) => ({ ...e, [key]: '' }));

  const handleWithdraw = () => {
    if (isLocked || hasPendingCashout) return;
    const errs: Record<string, string> = {};
    const parsed = parseFloat(inputAmount);
    if (!inputAmount || isNaN(parsed) || parsed <= 0) errs.amount = 'Enter a valid amount.';
    else if (parsed < MIN_WITHDRAWAL) errs.amount = `Minimum withdrawal is $${MIN_WITHDRAWAL}.00.`;
    else if (parsed > availableEarnings) errs.amount = `Exceeds balance of $${availableEarnings.toFixed(2)}.`;
    if (!beneficiaryName.trim()) errs.beneficiaryName = 'Beneficiary username is required.';
    if (!userEmail.trim()) errs.userEmail = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim())) errs.userEmail = 'Enter a valid email address.';
    if (!walletAddress.trim()) errs.walletAddress = 'Wallet address is required.';
    else if (!walletAddress.trim().toLowerCase().startsWith('0x')) errs.walletAddress = 'BEP-20 addresses must start with 0x';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    onCashout(parsed, beneficiaryName.trim(), userEmail.trim(), walletAddress.trim());
    setInputAmount('');
    setBeneficiaryName('');
    setUserEmail('');
    setWalletAddress('');
    setErrors({});
  };

  const inputClass = (key: string) =>
    `w-full px-4 py-3 rounded-xl text-sm outline-none transition-all ${
      isLocked
        ? isDark ? 'bg-white/3 border border-white/5 text-gray-600 cursor-not-allowed'
          : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
        : isDark
        ? `bg-white/5 border ${errors[key] ? 'border-red-400' : 'border-white/10'} text-white placeholder-gray-600 focus:border-neon-pink/50`
        : `bg-white border ${errors[key] ? 'border-red-400' : 'border-gray-200'} text-gray-900 placeholder-gray-400 focus:border-neon-pink/50`
    }`;

  return (
    <div className={`${glass} p-6 mb-6`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-neon-pink/20' : 'bg-neon-pink/10'}`}>
          <DollarSign className="w-5 h-5 text-neon-pink" />
        </div>
        <div>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Cashout Terminal</h3>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Earnings withdrawal portal</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-bold text-neon-pink tabular-nums">${availableEarnings.toFixed(2)}</p>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Available Balance</p>
        </div>
      </div>

      {/* Referral progress */}
      <div className={`rounded-xl p-4 mb-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {isFirstWithdrawal ? 'First Withdrawal' : 'Withdrawal'} Referral Requirement
            </span>
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
        <p className={`text-xs mt-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {isFirstWithdrawal
            ? currentCycleReferrals >= 2
              ? 'First withdrawal requirement fulfilled'
              : `${referralsNeeded} more active referral${referralsNeeded !== 1 ? 's' : ''} needed for first withdrawal`
            : currentCycleReferrals >= 1
            ? 'Withdrawal requirement fulfilled'
            : '1 active referral needed for withdrawal'}
        </p>
      </div>

      {/* Lock badges */}
      {referralLocked && (
        <div className="flex items-center gap-3 rounded-xl p-4 mb-4 border-2"
          style={{ background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)', borderColor: '#F59E0B', boxShadow: isDark ? '0 0 16px rgba(245,158,11,0.2)' : 'none' }}>
          <div className="p-2 rounded-lg flex-shrink-0" style={{ background: 'rgba(245,158,11,0.15)' }}>
            <Lock className="w-5 h-5" style={{ color: '#F59E0B' }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: '#F59E0B' }}>
              {isFirstWithdrawal ? 'First Withdrawal Locked' : 'Withdrawal Locked'}: {referralsNeeded} active referral{referralsNeeded !== 1 ? 's' : ''} required
            </p>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {isFirstWithdrawal
                ? 'You need 2 active referrals who have deposited for your first withdrawal.'
                : 'You need 1 active referral who has deposited for this withdrawal.'}
            </p>
          </div>
        </div>
      )}
      {!referralLocked && balanceLocked && (
        <div className={`flex items-center gap-3 p-4 rounded-xl mb-4 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <Lock className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Minimum balance of ${MIN_WITHDRAWAL}.00 required to withdraw.
          </p>
        </div>
      )}

      {/* Pending cashout notice */}
      {hasPendingCashout && !isLocked && (
        <div className={`flex items-center gap-3 p-4 rounded-xl mb-4 ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
          <Clock className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div>
            <p className={`text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Payout Request Processing</p>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Your withdrawal is being processed by the admin.</p>
          </div>
        </div>
      )}

      {/* Withdrawal form — only shown when unlocked and no pending request */}
      {!hasPendingCashout && (
        <div className="space-y-3">
          <div className={`pb-3 mb-1 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Withdrawal Request Form
            </p>
          </div>

          {/* FIELD 1: Withdrawal Amount */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Withdrawal Amount ($)</label>
              {!isLocked && (
                <button onClick={() => { setInputAmount(availableEarnings.toFixed(2)); clearErrors('amount'); }} className="text-xs text-neon-pink hover:underline font-medium">
                  Use Max
                </button>
              )}
            </div>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
              <input
                type="number" min={MIN_WITHDRAWAL} step="0.01"
                value={inputAmount}
                onChange={(e) => { setInputAmount(e.target.value); clearErrors('amount'); }}
                placeholder={`${MIN_WITHDRAWAL}.00 minimum`}
                disabled={isLocked}
                className={`${inputClass('amount')} pl-8`}
              />
            </div>
            {errors.amount && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.amount}</p>}
          </div>

          {/* FIELD 2: Beneficiary User Name */}
          <div>
            <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Beneficiary User Name
            </label>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Enter your authenticated account username"
                value={beneficiaryName}
                onChange={(e) => { setBeneficiaryName(e.target.value); clearErrors('beneficiaryName'); }}
                disabled={isLocked}
                className={`${inputClass('beneficiaryName')} pl-10`}
              />
            </div>
            {errors.beneficiaryName && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.beneficiaryName}</p>}
          </div>

          {/* FIELD 3: User Email Address */}
          <div>
            <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              User Email Address
            </label>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                placeholder="Enter your registered profile email"
                value={userEmail}
                onChange={(e) => { setUserEmail(e.target.value); clearErrors('userEmail'); }}
                disabled={isLocked}
                className={`${inputClass('userEmail')} pl-10`}
              />
            </div>
            {errors.userEmail && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.userEmail}</p>}
          </div>

          {/* FIELD 4: Crypto Wallet Address (BEP-20 ONLY) */}
          <div>
            <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Receiving Wallet Address <span className="text-neon-pink">(Strictly BEP-20 BSC Chain)</span> *
            </label>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Wallet className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Enter your 0x... Binance Smart Chain wallet destination"
                value={walletAddress}
                onChange={(e) => { setWalletAddress(e.target.value); clearErrors('walletAddress'); }}
                disabled={isLocked}
                className={`${inputClass('walletAddress')} pl-10 font-mono`}
              />
            </div>
            {errors.walletAddress && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.walletAddress}</p>}
          </div>

          {/* NETWORK ASSIGNED BADGE (static, no dropdown) */}
          <div className="rounded-xl p-4 border-2"
            style={{
              background: isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.06)',
              borderColor: '#8B5CF6',
              boxShadow: isDark ? '0 0 16px rgba(139, 92, 246, 0.15)' : 'none',
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
            disabled={isLocked}
            className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all mt-1 ${
              !isLocked
                ? isDark ? 'btn-neon-dark' : 'btn-neon-light'
                : isDark ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            }`}
          >
            {isLocked ? (
              <><Lock className="w-4 h-4" />{referralLocked ? `Locked — ${referralsNeeded} referral${referralsNeeded !== 1 ? 's' : ''} required` : `Minimum $${MIN_WITHDRAWAL} balance required`}</>
            ) : (
              <><CheckCircle className="w-4 h-4" />Request Cashout<ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
