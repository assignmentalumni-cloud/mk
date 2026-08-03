import { Lock, Crown, Zap, Mail, Globe, Award, Network } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useGlobalState } from '../hooks/useGlobalState.tsx';
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
