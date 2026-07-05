import { Clock, CheckCircle, XCircle, AlertCircle, ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { PendingDeposit, CashoutRequest } from '../types';

interface TransactionLedgerProps {
  deposits: PendingDeposit[];
  cashouts: CashoutRequest[];
}

type TransactionEntry = {
  id: string;
  type: 'deposit' | 'payout';
  amount: number;
  status: 'Pending' | 'Approved' | 'Completed' | 'Declined' | 'Rejected';
  timestamp: string;
  details: string;
};

export function TransactionLedger({ deposits, cashouts }: TransactionLedgerProps) {
  const { isDark } = useTheme();

  const transactions: TransactionEntry[] = [
    ...deposits.map((d): TransactionEntry => ({
      id: d.id,
      type: 'deposit',
      amount: d.chosenTier === 1 ? 35 : 70,
      status: d.status,
      timestamp: d.submittedAt,
      details: `Tier ${d.chosenTier} Deposit • ${d.senderWalletAddress?.slice(0, 12) || 'N/A'}...`,
    })),
    ...cashouts.map((c): TransactionEntry => ({
      id: c.requestId,
      type: 'payout',
      amount: c.amount,
      status: c.status,
      timestamp: c.createdAt,
      details: `BEP-20 Withdrawal • ${c.walletAddress?.slice(0, 12) || 'N/A'}...`,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const glass = isDark ? 'glass-dark' : 'glass-light';

  const getStatusBadge = (status: TransactionEntry['status']) => {
    switch (status) {
      case 'Pending':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
            <Clock className="w-3 h-3 animate-pulse" />
            <span>Pending Admin Review</span>
          </div>
        );
      case 'Approved':
      case 'Completed':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
            <CheckCircle className="w-3 h-3" />
            <span>Verified & Cleared</span>
          </div>
        );
      case 'Declined':
      case 'Rejected':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
            <XCircle className="w-3 h-3" />
            <span>Transaction Declined - Contact Support</span>
          </div>
        );
      default:
        return null;
    }
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (transactions.length === 0) {
    return (
      <div className={`${glass} p-6`}>
        <div className="flex items-center gap-2 mb-4">
          <Wallet className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Live Transaction Ledger History
          </h3>
        </div>
        <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No transactions yet</p>
          <p className="text-xs mt-1">Your deposit and payout history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${glass} p-6`}>
      <div className="flex items-center gap-2 mb-4">
        <Wallet className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Live Transaction Ledger History
        </h3>
      </div>

      <div className="space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
              isDark
                ? 'bg-white/5 hover:bg-white/10'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            {/* Icon */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              tx.type === 'deposit'
                ? isDark ? 'bg-green-500/20' : 'bg-green-100'
                : isDark ? 'bg-neon-pink/20' : 'bg-neon-pink/10'
            }`}>
              {tx.type === 'deposit' ? (
                <ArrowDownLeft className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              ) : (
                <ArrowUpRight className={`w-5 h-5 text-neon-pink`} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {tx.type === 'deposit' ? 'Security Deposit' : 'Payout Request'}
                </span>
                <span className={`text-xs font-bold ${
                  tx.type === 'deposit' ? 'text-green-400' : 'text-neon-pink'
                }`}>
                  {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                </span>
              </div>

              <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {tx.details}
              </p>

              {getStatusBadge(tx.status)}
            </div>

            {/* Timestamp */}
            <div className="flex-shrink-0 text-right">
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {formatDate(tx.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
