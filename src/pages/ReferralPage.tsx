import { useMemo } from 'react';
import { Users, Gift, Sparkles, Copy, CheckCircle, Link2, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from '../context/ThemeContext';
import { useGlobalState } from '../hooks/useGlobalState.tsx';
import { AffiliateNodeNetwork } from '../components/AffiliateNodeNetwork';
import { DepositOverlay } from '../components/DepositOverlay';
import { useState } from 'react';

export function ReferralPage() {
  const { isDark } = useTheme();
  const {
    currentUser,
    isProfileActive,
    getPendingReferrals,
    getActiveReferrals,
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

  const currentCycleCount = currentUser?.currentCycleReferrals ?? 0;
  const lifetimeWithdrawals = currentUser?.lifetimeWithdrawals ?? 0;
  const requiredReferrals = lifetimeWithdrawals === 0 ? 2 : 1;
  const referralsMet = currentCycleCount >= requiredReferrals;

  const showDepositOverlay =
    !isProfileActive || currentUser?.activationStatus === 'Activation_Pending';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-cosmic-midnight' : 'bg-ivory'} pt-24 pb-28 md:pb-12 px-4`}>
      <div className="max-w-4xl mx-auto relative z-10 mt-6">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Referral Network
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Share your link and earn $5.00 for every active referral
          </p>
        </div>

        <div className={`relative ${showDepositOverlay ? 'filter blur-md pointer-events-none select-none' : ''}`}>
          {/* Referral status banner */}
          <div className={`rounded-2xl p-6 mb-6 border-2 text-center ${
            referralsMet
              ? isDark ? 'bg-green-500/10 border-green-500/40' : 'bg-green-50 border-green-200'
              : isDark ? 'bg-yellow-500/10 border-yellow-500/40' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center justify-center gap-3 mb-2">
              {referralsMet ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <Users className="w-6 h-6 text-yellow-400" />
              )}
              <span className={`text-2xl font-bold tabular-nums ${
                referralsMet ? 'text-green-400' : isDark ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                {currentCycleCount}/{requiredReferrals}
              </span>
              <span className={`text-sm font-semibold ${
                referralsMet ? 'text-green-400' : isDark ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                {referralsMet ? 'Verified' : 'Referrals'}
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {lifetimeWithdrawals === 0
                ? 'First cashout requires 2 active referrals'
                : 'Each cashout requires 1 active referral'}
            </p>
          </div>

          {/* QR Code + Referral Link */}
          <div className={`${glass} p-6 mb-6`}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* QR Code */}
              <div className={`rounded-xl p-5 text-center ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <div className={`inline-block p-3 rounded-xl bg-white shadow-lg mb-3`}>
                  <QRCodeSVG
                    value={referralLink}
                    size={140}
                    level="H"
                    includeMargin={false}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
                <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Scan QR to join network node
                </p>
              </div>

              {/* Referral Link */}
              <div className={`rounded-xl p-5 flex flex-col justify-center ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Your Unique Referral Link
                </p>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDark ? 'bg-black/30' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <Link2 className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <code className={`text-xs flex-1 truncate ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    {referralLink}
                  </code>
                  <button
                    onClick={handleCopy}
                    className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${
                      copied
                        ? 'bg-green-500/20'
                        : isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                    }`}
                  >
                    {copied
                      ? <CheckCircle className="w-4 h-4 text-green-400" />
                      : <Copy className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    }
                  </button>
                </div>

                {/* $5 Bonus Banner */}
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
            <div className={`rounded-xl p-4 border-2 ${
              isDark ? 'bg-yellow-500/5 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-yellow-400" />
                <h4 className={`text-sm font-semibold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                  Pending Network Nodes
                </h4>
                <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
                  isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-200 text-yellow-700'
                }`}>
                  {pendingReferrals.length}
                </span>
              </div>
              {pendingReferrals.length === 0 ? (
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  No pending referrals
                </p>
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {pendingReferrals.map((ref, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs p-2 rounded-lg ${
                      isDark ? 'bg-white/5' : 'bg-white'
                    }`}>
                      <AlertTriangle className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                      <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        @{ref.username}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <p className={`text-xs mt-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Awaiting Activation Deposit (Does not count toward your cycle)
              </p>
            </div>

            <div className={`rounded-xl p-4 border-2 ${
              isDark ? 'bg-green-500/5 border-green-500/30' : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <h4 className={`text-sm font-semibold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                  Verified Active Nodes
                </h4>
                <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
                  isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-200 text-green-700'
                }`}>
                  {activeReferrals.length}
                </span>
              </div>
              {activeReferrals.length === 0 ? (
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  No active referrals yet
                </p>
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {activeReferrals.map((ref, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs p-2 rounded-lg ${
                      isDark ? 'bg-white/5' : 'bg-white'
                    }`}>
                      <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                      <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        @{ref.username}
                      </span>
                      <span className={`ml-auto px-1.5 py-0.5 rounded text-xs ${
                        isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                      }`}>
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <p className={`text-xs mt-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Active Node (Counted toward your cashout cycle)
              </p>
            </div>
          </div>
        </div>
      </div>

      {showDepositOverlay && <DepositOverlay onSelectTier={() => {}} />}
    </div>
  );
}
