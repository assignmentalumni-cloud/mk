import { useMemo, useState } from 'react';
import {
  Users, Gift, Sparkles, Copy, CheckCircle, Link2, Clock,
  AlertTriangle, CheckCircle2, TrendingUp, Lock, Crown, Award,
  Zap, MessageSquare, XCircle,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from '../context/ThemeContext';
import { useGlobalState } from '../hooks/useGlobalState.tsx';
import { REFERRAL_LEVELS } from '../types';

export function ReferralPage() {
  const { isDark } = useTheme();
  const {
    currentUser,
    isProfileActive,
    getPendingReferrals,
    getActiveReferrals,
    currentUserLevelClaims,
    claimLevelReward,
    approvedLevelCount,
    currentUserBoostPercent,
  } = useGlobalState();

  const glass = isDark ? 'glass-dark' : 'glass-light';
  const [copied, setCopied] = useState(false);

  const referralLink = useMemo(() => {
    if (!currentUser) return '';
    return `${window.location.origin}/register?ref=${currentUser.username}`;
  }, [currentUser]);

  const pendingReferrals = useMemo(() => {
    if (!currentUser) return [];
    return getPendingReferrals(currentUser.username);
  }, [currentUser, getPendingReferrals]);

  const activeReferrals = useMemo(() => {
    if (!currentUser) return [];
    return getActiveReferrals(currentUser.username);
  }, [currentUser, getActiveReferrals]);

  const verifiedCount = activeReferrals.length;
  const totalEarnings = verifiedCount * 5;

  // Level progression
  const getClaimForLevel = (level: number) =>
    currentUserLevelClaims.find((c) => c.level === level);

  const nextLevel = REFERRAL_LEVELS.find((l) => verifiedCount < l.requiredReferrals);
  const currentLevel = REFERRAL_LEVELS.filter((l) => verifiedCount >= l.requiredReferrals).length;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-cosmic-midnight' : 'bg-ivory'} pt-24 pb-28 md:pb-12 px-4 overflow-x-hidden`}>
      <div className="max-w-4xl mx-auto relative z-10 mt-6">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Referral Network
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Share your link, earn $5.00 per active referral, and unlock milestone rewards
          </p>
        </div>

        {/* Reward Counter */}
        <div className={`rounded-2xl p-6 mb-6 border-2 ${
          isDark
            ? 'bg-gradient-to-br from-yellow-500/10 via-green-500/5 to-neon-pink/10 border-yellow-500/40'
            : 'bg-gradient-to-br from-yellow-50 via-green-50 to-pink-50 border-yellow-300'
        }`}
        style={{ boxShadow: isDark ? '0 0 40px rgba(245, 158, 11, 0.15)' : 'none' }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                isDark ? 'bg-yellow-500/20' : 'bg-yellow-100'
              }`}>
                <Gift className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total Referral Earnings
                </p>
                <p className="text-4xl font-bold text-yellow-400 tabular-nums">
                  ${totalEarnings.toFixed(2)}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  $5.00 credited per active referral
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center gap-1.5 justify-center mb-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active</span>
                </div>
                <p className="text-2xl font-bold text-green-400 tabular-nums">{verifiedCount}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1.5 justify-center mb-1">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pending</span>
                </div>
                <p className="text-2xl font-bold text-yellow-400 tabular-nums">{pendingReferrals.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Referral Level Progression ─────────────────────────────────────────── */}
        <div className={`${glass} p-6 mb-6`}>
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-neon-pink/20' : 'bg-neon-pink/10'}`}>
              <Award className="w-5 h-5 text-neon-pink" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Level Progression</h3>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Unlock cash rewards and earning boosts as your network grows
              </p>
            </div>
            {approvedLevelCount > 0 && (
              <div className={`ml-auto px-3 py-1.5 rounded-full ${isDark ? 'bg-green-500/20' : 'bg-green-100'} flex items-center gap-1.5`}>
                <Zap className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs font-bold text-green-400">+{currentUserBoostPercent}% Boost Active</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mb-5">
            {nextLevel ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {verifiedCount}/{nextLevel.requiredReferrals} Referrals to Unlock Level {nextLevel.level}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    ${nextLevel.reward} reward + {nextLevel.boostPercent}% boost
                  </p>
                </div>
                <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-neon-pink to-purple-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (verifiedCount / nextLevel.requiredReferrals) * 100)}%` }}
                  />
                </div>
              </>
            ) : (
              <div className={`rounded-xl p-4 text-center border-2 ${isDark ? 'bg-green-500/10 border-green-500/40' : 'bg-green-50 border-green-200'}`}>
                <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-green-400">All Levels Unlocked!</p>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  You've reached the highest referral milestone. Total boost: +{currentUserBoostPercent}%
                </p>
              </div>
            )}
          </div>

          {/* Level cards */}
          <div className="grid sm:grid-cols-3 gap-3">
            {REFERRAL_LEVELS.map((lvl) => {
              const claim = getClaimForLevel(lvl.level);
              const isUnlocked = verifiedCount >= lvl.requiredReferrals;
              const isClaimed = claim !== undefined;
              const isApproved = claim?.status === 'Approved';
              const isPending = claim?.status === 'Pending';
              const isRejected = claim?.status === 'Rejected';
              const canClaim = isUnlocked && !isClaimed;

              return (
                <div
                  key={lvl.level}
                  className={`rounded-xl p-4 border-2 transition-all ${
                    isApproved
                      ? isDark ? 'bg-green-500/10 border-green-500/40' : 'bg-green-50 border-green-200'
                      : isPending
                      ? isDark ? 'bg-yellow-500/10 border-yellow-500/40' : 'bg-yellow-50 border-yellow-200'
                      : isRejected
                      ? isDark ? 'bg-red-500/10 border-red-500/40' : 'bg-red-50 border-red-200'
                      : isUnlocked
                      ? isDark ? 'bg-neon-pink/10 border-neon-pink/40' : 'bg-pink-50 border-pink-200'
                      : isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wide ${
                      isApproved ? 'text-green-400'
                        : isPending ? 'text-yellow-400'
                        : isRejected ? 'text-red-400'
                        : isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Level {lvl.level}
                    </span>
                    {isApproved ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : isPending ? (
                      <Clock className="w-4 h-4 text-yellow-400" />
                    ) : isRejected ? (
                      <XCircle className="w-4 h-4 text-red-400" />
                    ) : isUnlocked ? (
                      <Sparkles className="w-4 h-4 text-neon-pink" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-500" />
                    )}
                  </div>

                  <p className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${lvl.reward}
                  </p>
                  <p className={`text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {lvl.requiredReferrals} verified referrals
                  </p>
                  <div className={`text-xs font-medium mb-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    +{lvl.boostPercent}% earning boost
                  </div>

                  {/* Status / action */}
                  {isApproved && (
                    <div className={`text-xs font-bold text-green-400 flex items-center gap-1`}>
                      <CheckCircle className="w-3 h-3" />
                      Approved & ${lvl.reward} Credited
                    </div>
                  )}
                  {isPending && (
                    <div className={`text-xs font-bold text-yellow-400 flex items-center gap-1`}>
                      <Clock className="w-3 h-3" />
                      Pending Admin Approval
                    </div>
                  )}
                  {isRejected && (
                    <div className="space-y-1">
                      <div className={`text-xs font-bold text-red-400 flex items-center gap-1`}>
                        <XCircle className="w-3 h-3" />
                        Reward Claim Rejected
                      </div>
                      {claim?.rejectionNote && (
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          {claim.rejectionNote}
                        </p>
                      )}
                    </div>
                  )}
                  {canClaim && (
                    <button
                      onClick={() => claimLevelReward(lvl.level)}
                      className={`w-full text-xs font-bold py-2 rounded-lg ${isDark ? 'btn-neon-dark' : 'btn-neon-light'}`}
                    >
                      Claim ${lvl.reward} Reward
                    </button>
                  )}
                  {!isUnlocked && !isClaimed && (
                    <p className={`text-xs text-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                      {verifiedCount}/{lvl.requiredReferrals} referrals
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* QR Code + Referral Link */}
        <div className={`${glass} p-6 mb-6`}>
          <div className="grid md:grid-cols-2 gap-6">
            <div className={`rounded-xl p-5 flex flex-col items-center justify-center mx-auto ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <div className="inline-block p-3 rounded-xl bg-white shadow-lg mb-3">
                <QRCodeSVG value={referralLink} size={140} level="H" includeMargin={false} bgColor="#ffffff" fgColor="#000000" />
              </div>
              <p className={`text-xs font-medium text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Scan QR to join network node
              </p>
            </div>

            <div className={`rounded-xl p-5 flex flex-col justify-center ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Your Unique Referral Link
              </p>
              <div className={`w-full max-w-full flex-1 min-w-0 flex items-center gap-2 px-3 py-2 rounded-lg ${isDark ? 'bg-black/30' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <Link2 className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <code className={`text-xs flex-1 min-w-0 truncate overflow-hidden text-ellipsis ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                  {referralLink}
                </code>
                <button
                  onClick={handleCopy}
                  className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${
                    copied ? 'bg-green-500/20' : isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                  }`}
                >
                  {copied
                    ? <CheckCircle className="w-4 h-4 text-green-400" />
                    : <Copy className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />}
                </button>
              </div>

              <div className={`mt-4 rounded-xl p-3 flex items-center gap-2 border-2 ${
                isDark
                  ? 'bg-gradient-to-r from-yellow-500/10 to-green-500/10 border-yellow-500/30'
                  : 'bg-gradient-to-r from-yellow-50 to-green-50 border-yellow-200'
              }`}>
                <Gift className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <p className={`text-xs font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                  Earn $5.00 for every referral who completes their deposit!
                </p>
                <Sparkles className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Referral lists */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className={`rounded-xl p-4 border-2 ${isDark ? 'bg-yellow-500/5 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-yellow-400" />
              <h4 className={`text-sm font-semibold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>Pending Network Nodes</h4>
              <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-200 text-yellow-700'}`}>
                {pendingReferrals.length}
              </span>
            </div>
            {pendingReferrals.length === 0 ? (
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No pending referrals</p>
            ) : (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {pendingReferrals.map((ref, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                    <AlertTriangle className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                    <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>@{ref.username}</span>
                  </div>
                ))}
              </div>
            )}
            <p className={`text-xs mt-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Awaiting Activation Deposit (Does not count toward your cycle)
            </p>
          </div>

          <div className={`rounded-xl p-4 border-2 ${isDark ? 'bg-green-500/5 border-green-500/30' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <h4 className={`text-sm font-semibold ${isDark ? 'text-green-400' : 'text-green-700'}`}>Verified Active Nodes</h4>
              <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-200 text-green-700'}`}>
                {verifiedCount}
              </span>
            </div>
            {verifiedCount === 0 ? (
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No active referrals yet</p>
            ) : (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {activeReferrals.map((ref, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                    <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                    <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>@{ref.username}</span>
                    <span className={`ml-auto px-1.5 py-0.5 rounded text-xs ${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>Active</span>
                  </div>
                ))}
              </div>
            )}
            <p className={`text-xs mt-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Active Node (Counted toward your cashout cycle & level progression)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
