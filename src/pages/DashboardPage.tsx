import { useNavigate } from 'react-router-dom';
import { DollarSign, Users, Lock, TrendingUp, Crown, Zap, Mail, Globe, Award, Network } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useGlobalState } from '../hooks/useGlobalState.tsx';
import { MetricCard } from '../components/MetricCard';
import { WithdrawalPanel } from '../components/WithdrawalPanel';
import { DepositOverlay } from '../components/DepositOverlay';
import { Notification } from '../components/Notification';
import { TransactionLedger } from '../components/TransactionLedger';
import { AffiliateNodeNetwork } from '../components/AffiliateNodeNetwork';
import { useState, useMemo } from 'react';

const SUPPORT_EMAIL = 'Assignmentalumni@gmail.com';

export function DashboardPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const {
    currentUser,
    isProfileActive,
    currentUserAssignments,
    pendingUserSubmissions,
    pendingCashoutRequests,
    pendingDeposits,
    cashoutRequests,
    requestCashout,
    getPendingReferrals,
    getActiveReferrals,
  } = useGlobalState();

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const glassClass = isDark ? 'glass-dark' : 'glass-light';

  const availableEarnings = currentUser?.availableEarnings ?? 0;
  const currentCycleReferrals = currentUser?.currentCycleReferrals ?? 0;
  const accountTier = currentUser?.depositTier ?? 0;

  // Generate referral link
  const referralLink = useMemo(() => {
    if (!currentUser) return '';
    return `${window.location.origin}/register?ref=${currentUser.username}`;
  }, [currentUser]);

  // Get pending and active referrals
  const pendingReferrals = useMemo(() => {
    if (!currentUser) return [];
    return getPendingReferrals(currentUser.username);
  }, [currentUser, getPendingReferrals]);

  const activeReferrals = useMemo(() => {
    if (!currentUser) return [];
    return getActiveReferrals(currentUser.username);
  }, [currentUser, getActiveReferrals]);

  // Show overlay when not active OR when deposit is pending review
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

  const getTierBadge = () => {
    if (!isProfileActive) return null;
    return accountTier === 2 ? (
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-pink/20 text-neon-pink text-xs font-medium">
        <Crown className="w-3 h-3" />Tier II
      </div>
    ) : (
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
        <Zap className="w-3 h-3" />Tier I
      </div>
    );
  };

  const totalDailyPayout = currentUserAssignments.reduce((sum, a) => sum + a.payout, 0);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-cosmic-midnight' : 'bg-ivory'} pt-24 pb-12 px-4`}>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-10 mt-6">
          {/* Dynamic Welcome Header */}
          <div className="mb-4">
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Welcome to Assignment Alumni, <span className="font-bold text-neon-pink">{currentUser?.fullName?.split(' ')[0] ?? currentUser?.username ?? 'Scholar'}</span>!
            </p>
          </div>

          {/* Main Heading */}
          <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            The Elite Global Hub for Academic Freelancers
          </h2>

          {/* Subheading */}
          <p className={`text-base md:text-lg max-w-3xl mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            We bridge the gap between top-tier academic expertise and global market demand, offering an independent alternative for elite minds from{' '}
            <span className="font-bold">Upwork</span>, <span className="font-bold">Fiverr</span>, and <span className="font-bold">Freelancer</span>.
          </p>

          {/* Body Text */}
          <div className={`max-w-3xl mx-auto rounded-xl p-5 mb-4 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            <p className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Registered under the elite standards of the <span className="font-bold">Australian National University (ANU)</span>, our platform provides verified digital earnings ledgers for professionals worldwide. Turn your analytical skills and handwritten research into structured assets.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Globe className={`w-4 h-4 ${isDark ? 'text-neon-pink' : 'text-neon-pink'}`} />
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-bold">Global Workspace:</span> Open to dedicated freelancers across all borders
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award className={`w-4 h-4 ${isDark ? 'text-neon-pink' : 'text-neon-pink'}`} />
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-bold">Guaranteed Returns:</span> Secure <span className="font-bold text-neon-pink">$1.70</span> per approved submission
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Network className={`w-4 h-4 ${isDark ? 'text-neon-pink' : 'text-neon-pink'}`} />
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-bold">Network Growth:</span> <span className="font-bold text-neon-pink">$5.00</span> automated activation bonuses
                </span>
              </div>
            </div>
          </div>

          {/* Support Helpline */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-sm">
            <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              For immediate assistance with account activation, verification holds, or payment processing, please contact our dedicated 24/7 helpline at:
            </span>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=AssignmentAlumni Support Request`}
              className={`inline-flex items-center gap-1 font-semibold transition-all ${
                isDark
                  ? 'text-neon-pink hover:text-pink-400'
                  : 'text-neon-pink hover:text-pink-600'
              }`}
              style={isDark ? { textShadow: '0 0 10px rgba(255, 0, 60, 0.5)' } : {}}
            >
              <Mail className="w-4 h-4" />
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>

        <div className={`relative ${showDepositOverlay ? 'filter blur-md pointer-events-none select-none' : ''}`}>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <MetricCard
              icon={<Lock className="w-6 h-6 text-neon-pink" />}
              label="Active Escrow Tier Level"
              value={isProfileActive ? (accountTier === 2 ? 'Tier II ($70)' : 'Tier I ($35)') : '--'}
              badge={
                isProfileActive ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Active
                  </div>
                ) : (
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-200 text-gray-500'} text-xs font-medium`}>
                    <Lock className="w-3 h-3" />Locked
                  </div>
                )
              }
            />
            <MetricCard
              icon={<DollarSign className="w-6 h-6 text-neon-pink" />}
              label="Available Wallet Balance ($)"
              value={`$${availableEarnings.toFixed(2)}`}
              badge={availableEarnings > 0 ? <TrendingUp className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-500'}`} /> : null}
              accent
            />
            <MetricCard
              icon={<Users className="w-6 h-6 text-neon-pink" />}
              label="Referral Tracker Loop"
              value={`${currentCycleReferrals} / 2`}
            />
          </div>

          {!isProfileActive && (
            <div className={`${glassClass} p-6 mb-8 text-center`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Complete your security deposit to unlock daily assignments and start earning.
              </p>
            </div>
          )}

          {isProfileActive && (
            <>
              <WithdrawalPanel
                availableEarnings={availableEarnings}
                currentCycleReferrals={currentCycleReferrals}
                lifetimeWithdrawals={currentUser?.lifetimeWithdrawals ?? 0}
                onCashout={handleCashout}
                hasPendingCashout={pendingCashoutRequests.some((r) => r.userId === currentUser?.id)}
              />

              {/* Affiliate Node Network */}
              {currentUser && (
                <AffiliateNodeNetwork
                  username={currentUser.username}
                  referralLink={referralLink}
                  pendingReferrals={pendingReferrals}
                  activeReferrals={activeReferrals}
                  currentCycleCount={currentCycleReferrals}
                />
              )}

              <div className={`${glassClass} p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Academic Workspace</h3>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? 'bg-neon-pink/10' : 'bg-neon-pink/10'}`}>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Daily Potential:</span>
                    <span className="text-sm font-bold text-neon-pink">${totalDailyPayout.toFixed(2)}</span>
                  </div>
                </div>
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  You have {currentUserAssignments.length} assignment{currentUserAssignments.length !== 1 ? 's' : ''} available today.
                </p>
                {pendingUserSubmissions.length > 0 && (
                  <p className={`text-sm mb-2 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    {pendingUserSubmissions.length} submission{pendingUserSubmissions.length !== 1 ? 's' : ''} pending verification.
                  </p>
                )}
                <button onClick={() => navigate('/workspace')} className={isDark ? 'btn-neon-dark' : 'btn-neon-light'}>
                  Open Writing Desk
                </button>
              </div>

              {/* Transaction Ledger */}
              <TransactionLedger
                deposits={pendingDeposits.filter((d) => d.userId === currentUser?.id)}
                cashouts={cashoutRequests.filter((c) => c.userId === currentUser?.id)}
              />
            </>
          )}
        </div>
      </div>

      {/* Deposit overlay — handles both "choose tier" and "pending review" states internally */}
      {showDepositOverlay && <DepositOverlay onSelectTier={() => {}} />}

      <Notification
        message={notificationMessage}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}
