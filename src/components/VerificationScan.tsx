import { useEffect } from 'react';
import { Shield, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface VerificationScanProps {
  onComplete: () => void;
}

export function VerificationScan({ onComplete }: VerificationScanProps) {
  const { isDark } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-xl bg-black/80" />

      <div className={`relative ${isDark ? 'glass-dark' : 'glass-light'} max-w-md w-full p-8 text-center`}>
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-neon-pink/20 animate-pulse-glow absolute inset-0" />
            <div className="w-20 h-20 rounded-full border-4 border-neon-pink border-t-transparent animate-spin" />
            <Shield className="absolute inset-0 w-20 h-20 p-4 text-neon-pink" />
          </div>
        </div>

        <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Verification in Progress
        </h2>

        <p className={`text-sm mb-6 ${isDark ? 'text-neon-pink' : 'text-neon-pink'} animate-pulse`}>
          Running Automated Turnitin Plagiarism & AI-Verification Scan...
        </p>

        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mb-4`}>
          Please Hold.
        </p>

        <div className="space-y-2">
          <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <div className="w-5 h-5 rounded-full border-2 border-neon-pink border-t-transparent animate-spin" />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Scanning for plagiarism indicators...
            </span>
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <div className="w-5 h-5 rounded-full border-2 border-neon-pink border-t-transparent animate-spin" style={{ animationDelay: '0.3s' }} />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              AI content detection analysis...
            </span>
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <div className="w-5 h-5 rounded-full border-2 border-neon-pink border-t-transparent animate-spin" style={{ animationDelay: '0.6s' }} />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Compliance verification...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface VerificationResultProps {
  approved: boolean;
  payout: number;
  onClose: () => void;
}

export function VerificationResult({ approved, payout, onClose }: VerificationResultProps) {
  const { isDark } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-xl bg-black/80" />

      <div className={`relative ${isDark ? 'glass-dark' : 'glass-light'} max-w-md w-full p-8 text-center`}>
        <div className="mb-6 flex justify-center">
          {approved ? (
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse-glow">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-red-400" />
            </div>
          )}
        </div>

        <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {approved ? 'Verification Approved!' : 'Verification Failed'}
        </h2>

        <p className={`text-sm mb-4 ${approved ? (isDark ? 'text-green-400' : 'text-green-600') : isDark ? 'text-red-400' : 'text-red-600'}`}>
          {approved
            ? `Your submission passed all checks. +$${payout.toFixed(2)} added to your earnings.`
            : 'Issues detected in your submission. Please review and resubmit.'}
        </p>

        {approved && (
          <div className={`p-4 rounded-xl ${isDark ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'}`}>
            <p className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              +${payout.toFixed(2)}
            </p>
            <p className={`text-xs ${isDark ? 'text-green-400/80' : 'text-green-600/80'}`}>
              Credited to your ledger
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
