import { DollarSign, Users, Lock, TrendingUp, Crown, Zap, Mail, Globe, Award, Network } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useGlobalState } from '../hooks/useGlobalState.tsx';
import { MetricCard } from '../components/MetricCard';
import { DepositOverlay } from '../components/DepositOverlay';

const SUPPORT_EMAIL = 'Assignmentalumni@gmail.com';

export function HomePage() {
  const { isDark } = useTheme();
  const {
    currentUser,
    isProfileActive,
    currentUserAssignments,
  } = useGlobalState();

  const glassClass = isDark ? 'glass-dark' : 'glass-light';

  const availableEarnings = currentUser?.availableEarnings ?? 0;
  const currentCycleReferrals = currentUser?.currentCycleReferrals ?? 0;
  const lifetimeWithdrawals = currentUser?.lifetimeWithdrawals ?? 0;
  const accountTier = currentUser?.depositTier ?? 0;

  const showDepositOverlay =
    !isProfileActive || currentUser?.activationStatus === 'Activation_Pending';

  const totalDailyPayout = currentUserAssignments.reduce((sum, a) => sum + a.payout, 0);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-cosmic-midnight' : 'bg-ivory'} pt-24 pb-28 md:pb-12 px-4`}>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-10 mt-6">
          <div className="mb-4">
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Welcome to Assignment Alumni, <span className="font-bold text-neon-pink">{currentUser?.fullName?.split(' ')[0] ?? currentUser?.username ?? 'Scholar'}</span>!
            </p>
          </div>

          <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            The Elite Global Hub for Academic Freelancers
          </h2>

          <p className={`text-base md:text-lg max-w-3xl mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            We bridge the gap between top-tier academic expertise and global market demand, offering an independent alternative for elite minds from{' '}
            <span className="font-bold">Upwork</span>, <span className="font-bold">Fiverr</span>, and <span className="font-bold">Freelancer</span>.
          </p>

          <div className={`max-w-3xl mx-auto rounded-xl p-5 mb-4 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            <p className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Registered under the elite standards of the <span className="font-bold">Australian National University (ANU)</span>, our platform provides verified digital earnings ledgers for professionals worldwide. Turn your analytical skills and handwritten research into structured assets.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Globe className={`w-4 h-4 text-neon-pink`} />
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-bold">Global Workspace:</span> Open to dedicated freelancers across all borders
                </span>
              </div>
                <div className="flex items-center gap-2">
                <Award className={`w-4 h-4 text-neon-pink`} />
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-bold">Tiered Earning:</span> $0.70, $1.70, or $3.40 daily based on your plan
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Network className={`w-4 h-4 text-neon-pink`} />
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-bold">Network Growth:</span> <span className="font-bold text-neon-pink">$5.00</span> automated activation bonuses
                </span>
              </div>
            </div>
          </div>

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
              value={isProfileActive ? (accountTier === 3 ? 'Tier III ($70)' : accountTier === 2 ? 'Tier II ($35)' : 'Tier I ($15)') : '--'}
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
              value={`${currentCycleReferrals} / ${lifetimeWithdrawals === 0 ? 3 : 2}`}
            />
          </div>

          {isProfileActive && (
            <div className={`${glassClass} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Academic Workspace</h3>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? 'bg-neon-pink/10' : 'bg-neon-pink/10'}`}>
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Daily Potential:</span>
                  <span className="text-sm font-bold text-neon-pink">${totalDailyPayout.toFixed(2)}</span>
                </div>
              </div>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                You have {currentUserAssignments.length} assignment{currentUserAssignments.length !== 1 ? 's' : ''} available today. Head to the Working tab to complete them.
              </p>
            </div>
          )}

          {!isProfileActive && (
            <div className={`${glassClass} p-6 text-center`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Complete your security deposit to unlock daily assignments and start earning.
              </p>
            </div>
          )}
        </div>
      </div>

      {showDepositOverlay && <DepositOverlay onSelectTier={() => {}} />}
    </div>
  );
}
