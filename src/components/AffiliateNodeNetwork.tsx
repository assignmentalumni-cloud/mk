import { useState, useMemo } from 'react';
import { QrCode, Copy, CheckCircle, Users, AlertTriangle, CheckCircle2, Clock, Link2, Gift, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from '../context/ThemeContext';

interface ReferralUser {
  username: string;
  status: 'pending' | 'active';
  createdAt: string;
}

interface AffiliateNodeNetworkProps {
  username: string;
  referralLink: string;
  pendingReferrals: ReferralUser[];
  activeReferrals: ReferralUser[];
  currentCycleCount: number;
}

export function AffiliateNodeNetwork({
  username,
  referralLink,
  pendingReferrals,
  activeReferrals,
  currentCycleCount,
}: AffiliateNodeNetworkProps) {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const glass = isDark ? 'glass-dark' : 'glass-light';

  return (
    <div className={`${glass} p-6 mb-6`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
          <Users className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Affiliate Node Network</h3>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Grow your referral network</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-bold text-purple-400 tabular-nums">{currentCycleCount}/2</p>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Active Cycle</p>
        </div>
      </div>

      {/* $5 Bonus Banner */}
      <div className={`rounded-xl p-4 mb-5 flex items-center gap-3 border-2 ${
        isDark
          ? 'bg-gradient-to-r from-yellow-500/10 to-green-500/10 border-yellow-500/30'
          : 'bg-gradient-to-r from-yellow-50 to-green-50 border-yellow-200'
      }`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isDark ? 'bg-yellow-500/20' : 'bg-yellow-100'
        }`}>
          <Gift className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <p className={`text-sm font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
            Earn a flat $5.00 bonus credited instantly to your wallet for every referral who completes their account security escrow deposit!
          </p>
        </div>
        <Sparkles className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
      </div>

      {/* QR Code and Referral Link */}
      <div className="grid md:grid-cols-2 gap-4 mb-5">
        {/* QR Code */}
        <div className={`rounded-xl p-4 text-center ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
          <div className={`inline-block p-3 rounded-xl ${isDark ? 'bg-white' : 'bg-white'} shadow-lg mb-3`}>
            <QRCodeSVG
              value={referralLink}
              size={120}
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
        <div className={`rounded-xl p-4 flex flex-col justify-center ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
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
        </div>
      </div>

      {/* Referral Status Lists */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Pending Network Nodes */}
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

        {/* Verified Active Nodes */}
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
            Active Node (Counted toward your 2/2 cashout cycle)
          </p>
        </div>
      </div>
    </div>
  );
}
