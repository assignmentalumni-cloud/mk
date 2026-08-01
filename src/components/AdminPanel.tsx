import { useState } from 'react';
import {
  CheckCircle, XCircle, Users, DollarSign, FileText, Lock,
  Crown, Zap, Clock, ChevronDown, ShieldCheck, RefreshCw,
  PlusCircle, Settings, Inbox, Wallet, ExternalLink,
  Camera, PenLine, Hash, Link2, Copy, X, ImageIcon,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useGlobalState } from '../hooks/useGlobalState.tsx';
import type { AccountTier, PendingDeposit, Submission } from '../types';

type Tab = 'approvals' | 'deposits' | 'payouts';

// Copy to clipboard utility
function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all hover:bg-white/20"
      title={`Copy ${label || 'to clipboard'}`}
    >
      {copied ? (
        <CheckCircle className="w-3.5 h-3.5 text-green-400" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
      <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  );
}

// Lightbox modal for image preview
function LightboxModal({
  isOpen,
  onClose,
  imageUrl,
  title
}: {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  title?: string;
}) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden bg-gray-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/50">
          <span className="text-sm font-medium text-white">{title || 'Image Preview'}</span>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-4 h-4" />
            Close View
          </button>
        </div>
        {/* Image */}
        <div className="flex items-center justify-center p-4 overflow-auto max-h-[70vh]">
          <img
            src={imageUrl}
            alt={title || 'Preview'}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

// Receipt thumbnail for deposits
function ReceiptThumbnail({
  deposit,
  onPreview
}: {
  deposit: PendingDeposit;
  onPreview: (url: string) => void;
}) {
  const { isDark } = useTheme();

  if (!deposit.receiptFilename && !deposit.screenshotUrl) {
    return <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>No receipt</span>;
  }

  const imageUrl = deposit.screenshotUrl || `https://assignmentalumni.com/receipts/${deposit.receiptFilename}`;

  return (
    <button
      onClick={() => onPreview(imageUrl)}
      className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-all"
    >
      <div
        className="w-[60px] h-[40px] rounded-lg overflow-hidden flex items-center justify-center border-2 transition-all"
        style={{
          borderColor: isDark ? 'rgba(255, 0, 60, 0.3)' : 'rgba(255, 0, 60, 0.2)',
          boxShadow: isDark ? '0 0 15px rgba(255, 0, 60, 0.2)' : 'none',
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
        }}
      >
        <ImageIcon className={`w-5 h-5 ${isDark ? 'text-neon-pink' : 'text-neon-pink'}`} />
      </div>
      <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'} truncate max-w-[100px]`}>
        {deposit.receiptFilename || 'View Receipt'}
      </span>
    </button>
  );
}

// Photo document thumbnail for submissions
function PhotoDocumentThumbnail({
  submission,
  onPreview
}: {
  submission: Submission;
  onPreview: (url: string) => void;
}) {
  const { isDark } = useTheme();

  if (submission.submissionType !== 'photo_document') return null;

  const imageUrl = submission.fileProofUrl || `https://assignmentalumni.com/uploads/${submission.fileProofName}`;

  return (
    <button
      onClick={() => onPreview(imageUrl)}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
        isDark ? 'bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30' : 'bg-purple-50 hover:bg-purple-100 border border-purple-200'
      }`}
    >
      <div
        className="w-[60px] h-[40px] rounded-lg overflow-hidden flex items-center justify-center"
        style={{
          boxShadow: isDark ? '0 0 15px rgba(168, 85, 247, 0.3)' : 'none',
          background: isDark ? 'rgba(168, 85, 247, 0.2)' : 'white',
        }}
      >
        <Camera className="w-5 h-5 text-purple-400" />
      </div>
      <div className="text-left">
        <p className={`text-xs font-semibold ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
          View Handwritten Image Document
        </p>
        <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {submission.fileProofName || 'Click to view'}
        </p>
      </div>
    </button>
  );
}

// Wallet address display with copy
function WalletAddress({ address }: { address: string }) {
  const { isDark } = useTheme();

  if (!address) return <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>—</span>;

  return (
    <div
      className={`flex items-start gap-2 p-2 rounded-lg ${isDark ? 'bg-black/30' : 'bg-gray-50'}`}
      style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}
    >
      <span className={`font-mono text-xs ${isDark ? 'text-neon-pink' : 'text-neon-pink'} flex-1`}>
        {address}
      </span>
      <CopyButton text={address} label="wallet address" />
    </div>
  );
}

export function AdminPanel() {
  const { isDark } = useTheme();
  const {
    allSubmissions,
    cashoutRequests,
    pendingDeposits,
    users,
    approveSubmission,
    rejectSubmission,
    processCashout,
    rejectCashout,
    approveDeposit,
    declineDeposit,
    addReferral,
    forceSetTier,
    getUserById,
    refreshAll,
  } = useGlobalState();

  const [activeTab, setActiveTab] = useState<Tab>('approvals');
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [tierDropdown, setTierDropdown] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string | undefined>();
  const [rejectionNotes, setRejectionNotes] = useState<Record<string, string>>({});

  const glass = isDark ? 'glass-dark' : 'glass-light';

  const pendingSubmissions = allSubmissions.filter((s) => s.status === 'Submitted_Pending');
  const approvedSubmissions = allSubmissions.filter((s) => s.status === 'Approved');
  const queuedDeposits = pendingDeposits.filter((d) => d.status === 'Pending');
  const pendingCashouts = cashoutRequests.filter((c) => c.status === 'Pending');

  const openLightbox = (url: string, title?: string) => {
    setLightboxUrl(url);
    setLightboxTitle(title);
  };

  const closeLightbox = () => {
    setLightboxUrl(null);
    setLightboxTitle(undefined);
  };

  const act = async (key: string, fn: () => Promise<void>) => {
    setProcessing(key);
    await fn();
    setProcessing(null);
  };

  const tierBadge = (tier: AccountTier) => {
    if (tier === 2) return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-neon-pink/20 text-neon-pink">
        <Crown className="w-3 h-3" /> Tier II
      </span>
    );
    if (tier === 1) return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
        <Zap className="w-3 h-3" /> Tier I
      </span>
    );
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
        Inactive
      </span>
    );
  };

  const tabs: { key: Tab; label: string; count?: number; icon: React.ReactNode }[] = [
    { key: 'approvals', label: 'Proof Approvals', count: pendingSubmissions.length, icon: <FileText className="w-4 h-4" /> },
    { key: 'deposits', label: 'Deposit Ledger', count: queuedDeposits.length, icon: <Inbox className="w-4 h-4" /> },
    { key: 'payouts', label: 'Payout Vault', count: pendingCashouts.length, icon: <DollarSign className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${glass} p-5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-neon-pink/20' : 'bg-neon-pink/10'}`}>
              <ShieldCheck className="w-5 h-5 text-neon-pink" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Owner Admin Terminal</h2>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Full database control panel</p>
            </div>
          </div>
          <button
            onClick={async () => { setIsRefreshing(true); await refreshAll(); setIsRefreshing(false); }}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          {[
            { label: 'Total Users', val: users.length },
            { label: 'Pending Reviews', val: pendingSubmissions.length, hi: pendingSubmissions.length > 0 },
            { label: 'Deposit Queue', val: queuedDeposits.length, hi: queuedDeposits.length > 0 },
            { label: 'Pending Payouts', val: pendingCashouts.length, hi: pendingCashouts.length > 0 },
          ].map(({ label, val, hi }) => (
            <div key={label} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${hi ? 'bg-neon-pink/20 text-neon-pink' : isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
              {label}: <span className="font-bold">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === t.key
                ? isDark ? 'bg-neon-pink/20 text-neon-pink' : 'bg-white text-neon-pink shadow-sm'
                : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
            {t.count !== undefined && t.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${activeTab === t.key ? 'bg-neon-pink text-white' : isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB A: Writing Proof Approvals */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {pendingSubmissions.length === 0 ? (
            <div className={`${glass} p-8 text-center`}>
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No pending submissions</p>
            </div>
          ) : pendingSubmissions.map((sub) => {
            const user = getUserById(sub.userId);
            const isExpanded = expandedSub === sub.submissionId;
            const isBusy = processing === sub.submissionId;
            return (
              <div key={sub.submissionId} className={`${glass} overflow-hidden`}>
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${isDark ? 'bg-neon-pink/20 text-neon-pink' : 'bg-neon-pink/10 text-neon-pink'}`}>
                      {sub.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>@{sub.username}</span>
                        {user && tierBadge(user.depositTier)}
                        <span className={`text-xs font-mono ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{sub.submissionId.slice(0, 18)}…</span>
                        {sub.submissionType === 'photo_document' && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                            <Camera className="w-3 h-3" /> Photo
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} line-clamp-1`}>{sub.topicTitle}</p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-neon-pink text-sm font-bold">${sub.calculatedPayout.toFixed(2)}</span>
                        <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{new Date(sub.submittedAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <button onClick={() => setExpandedSub(isExpanded ? null : sub.submissionId)}
                      className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className={`px-5 pb-5 border-t ${isDark ? 'border-white/10' : 'border-gray-200'} pt-4 space-y-4`}>
                    {/* Submission type indicator */}
                    <div className="flex items-center gap-2">
                      {sub.submissionType === 'photo_document' ? (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                          <Camera className="w-3.5 h-3.5" />
                          Photo Document Submission
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                          <PenLine className="w-3.5 h-3.5" />
                          Local Text Submission
                        </span>
                      )}
                    </div>

                    {/* Content display based on submission type */}
                    {sub.submissionType === 'photo_document' ? (
                      <>
                        {/* Photo document preview with thumbnail */}
                        <PhotoDocumentThumbnail
                          submission={sub}
                          onPreview={(url) => openLightbox(url, `Handwritten Assignment - @${sub.username}`)}
                        />
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Click the thumbnail to view the full handwritten document and verify it contains substantial content before approving.
                        </p>
                      </>
                    ) : (
                      <>
                        {/* Text submission preview */}
                        <div className={`rounded-xl p-4 max-h-64 overflow-y-auto ${isDark ? 'bg-black/20' : 'bg-gray-50'}`}>
                          <p className={`text-xs leading-relaxed whitespace-pre-wrap ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>{sub.submittedText}</p>
                        </div>
                        {/* Text statistics */}
                        <div className={`flex items-center gap-4 px-1`}>
                          <div className={`flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Hash className="w-3.5 h-3.5" />
                            <span className="text-xs">Words:</span>
                            <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {sub.submittedText.trim() ? sub.submittedText.trim().split(/\s+/).length.toLocaleString() : '0'}
                            </span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <FileText className="w-3.5 h-3.5" />
                            <span className="text-xs">Characters:</span>
                            <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {sub.charCount?.toLocaleString() || sub.submittedText.length.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => act(sub.submissionId, () => approveSubmission(sub.submissionId))}
                        disabled={isBusy}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${isDark ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/20' : 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isBusy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Approve &amp; Credit ${sub.calculatedPayout.toFixed(2)}
                      </button>
                    </div>

                    {/* Rejection feedback */}
                    <div className={`mt-3 pt-3 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                      <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Rejection Note (sent to user)
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={rejectionNotes[sub.submissionId] ?? ''}
                          onChange={(e) => setRejectionNotes((prev) => ({ ...prev, [sub.submissionId]: e.target.value }))}
                          placeholder="e.g. Rejected: Copy-pasted assignment"
                          className={`flex-1 px-3 py-2 rounded-lg text-xs outline-none transition-all ${
                            isDark
                              ? 'bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-red-500/40'
                              : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-red-300'
                          }`}
                        />
                        <button
                          onClick={() => {
                            const note = rejectionNotes[sub.submissionId]?.trim();
                            act(sub.submissionId, () => rejectSubmission(sub.submissionId, note || 'Submission rejected by admin.'));
                            setRejectionNotes((prev) => { const n = { ...prev }; delete n[sub.submissionId]; return n; });
                          }}
                          disabled={isBusy}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${isDark ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20' : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {isBusy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                          Reject &amp; Send
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {approvedSubmissions.length > 0 && (
            <div className={`${glass} p-5`}>
              <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Recently Approved ({approvedSubmissions.length})</h4>
              <div className="space-y-2">
                {approvedSubmissions.slice(0, 5).map((sub) => (
                  <div key={sub.submissionId} className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>@{sub.username}</span>
                      <span className={`text-xs mx-1.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>—</span>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} line-clamp-1`}>{sub.topicTitle}</span>
                    </div>
                    <span className="text-xs font-bold text-green-400">+${sub.calculatedPayout.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB B: Deposit Ledger Verification */}
      {activeTab === 'deposits' && (
        <div className="space-y-4">
          {queuedDeposits.length === 0 ? (
            <div className={`${glass} p-8 text-center`}>
              <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-500" />
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No pending deposit submissions</p>
            </div>
          ) : (
            <div className={`${glass} overflow-hidden`}>
              <div className={`px-5 py-3 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Master Deposit Verification Table
                </h3>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {queuedDeposits.length} deposit{queuedDeposits.length !== 1 ? 's' : ''} awaiting verification
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                      <th className={`text-left px-4 py-3 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Username</th>
                      <th className={`text-left px-4 py-3 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email</th>
                      <th className={`text-left px-4 py-3 font-medium min-w-[200px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Wallet Address</th>
                      <th className={`text-left px-4 py-3 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Amount</th>
                      <th className={`text-left px-4 py-3 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Receipt</th>
                      <th className={`text-left px-4 py-3 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</th>
                      <th className={`text-right px-4 py-3 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queuedDeposits.map((dep) => {
                      const user = getUserById(dep.userId);
                      const isBusy = processing === dep.id;
                      return (
                        <tr key={dep.id} className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1">
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>@{dep.username}</span>
                              {user && tierBadge(user.depositTier)}
                            </div>
                          </td>
                          <td className={`px-4 py-4 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {dep.senderEmail}
                          </td>
                          <td className="px-4 py-4">
                            <WalletAddress address={dep.senderWalletAddress} />
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${dep.chosenTier === 2 ? 'bg-neon-pink/20 text-neon-pink' : 'bg-blue-500/20 text-blue-400'}`}>
                              {dep.chosenTier === 2 ? <Crown className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                              ${dep.chosenTier === 1 ? '35' : '70'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <ReceiptThumbnail
                              deposit={dep}
                              onPreview={(url) => openLightbox(url, `Deposit Receipt - @${dep.username}`)}
                            />
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => act(dep.id, () => approveDeposit(dep.id))}
                                disabled={isBusy}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${isDark ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/20' : 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {isBusy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                Verify & Activate
                              </button>
                              <button
                                onClick={() => act(dep.id + '_dec', () => declineDeposit(dep.id))}
                                disabled={isBusy}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${isDark ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20' : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                <XCircle className="w-3 h-3" /> Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Completed deposits */}
          {pendingDeposits.filter((d) => d.status === 'Approved' || d.status === 'Declined').length > 0 && (
            <div className={`${glass} p-5`}>
              <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Recent Deposit Decisions
              </h4>
              <div className="space-y-2">
                {pendingDeposits.filter((d) => d.status === 'Approved' || d.status === 'Declined').slice(0, 6).map((dep) => (
                  <div key={dep.id} className={`flex items-center gap-3 p-3 rounded-lg ${dep.status === 'Approved' ? isDark ? 'bg-green-500/10' : 'bg-green-50' : isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                    {dep.status === 'Approved' ? (
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>@{dep.username}</span>
                      <span className={`text-xs mx-1.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>—</span>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Tier {dep.chosenTier} (${dep.chosenTier === 1 ? '35' : '70'})
                      </span>
                    </div>
                    <span className={`text-xs font-bold ${dep.status === 'Approved' ? 'text-green-400' : 'text-red-400'}`}>
                      {dep.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Matrix */}
          <div className={`${glass} p-5`}>
            <h4 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Users className="w-4 h-4" />
              User Database &amp; Dev Controls
            </h4>
            <div className="space-y-4">
              {users.map((user) => {
                const isRefBusy = processing === user.id + '_ref';
                const isTierBusy = processing === user.id + '_tier';
                const isTierOpen = tierDropdown === user.id;
                const userSubs = allSubmissions.filter((s) => s.userId === user.id);
                return (
                  <div key={user.id} className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${user.depositTier === 2 ? isDark ? 'bg-neon-pink/20 text-neon-pink' : 'bg-neon-pink/10 text-neon-pink' : user.depositTier === 1 ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600' : isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                        {user.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.fullName}</span>
                          {tierBadge(user.depositTier)}
                          {user.activationStatus === 'Activation_Pending' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                              <Clock className="w-3 h-3" /> Pending Activation
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>@{user.username} · {user.email}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                          {[
                            { label: 'Balance', val: `$${user.availableEarnings.toFixed(2)}`, accent: user.availableEarnings > 0 },
                            { label: 'Referrals', val: `${user.currentCycleReferrals}/2` },
                            { label: 'Completed', val: `${user.completedTopicIds.length}` },
                            { label: 'Submissions', val: `${userSubs.length}` },
                          ].map(({ label, val, accent }) => (
                            <div key={label} className={`p-2 rounded-lg ${isDark ? 'bg-black/20' : 'bg-white'}`}>
                              <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{label}</p>
                              <p className={`text-sm font-bold ${accent ? 'text-neon-pink' : isDark ? 'text-white' : 'text-gray-900'}`}>{val}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className={`mt-3 pt-3 border-t ${isDark ? 'border-white/10' : 'border-gray-200'} flex items-center gap-2 flex-wrap`}>
                      <span className={`text-xs font-semibold flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}><Settings className="w-3 h-3" />Dev:</span>
                      <button onClick={() => act(user.id + '_ref', () => addReferral(user.id))} disabled={isRefBusy || user.currentCycleReferrals >= 2}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${user.currentCycleReferrals >= 2 ? isDark ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed' : isDark ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'}`}>
                        {isRefBusy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <PlusCircle className="w-3 h-3" />}+1 Referral
                      </button>
                      <div className="relative">
                        <button onClick={() => setTierDropdown(isTierOpen ? null : user.id)} disabled={isTierBusy}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${isDark ? 'bg-neon-pink/20 hover:bg-neon-pink/30 text-neon-pink' : 'bg-neon-pink/10 hover:bg-neon-pink/20 text-neon-pink'}`}>
                          {isTierBusy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                          Force Tier<ChevronDown className={`w-3 h-3 transition-transform ${isTierOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isTierOpen && (
                          <div className={`absolute top-full left-0 mt-1 rounded-xl shadow-lg z-10 overflow-hidden min-w-[140px] ${isDark ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-200'}`}>
                            {([0, 1, 2] as AccountTier[]).map((t) => (
                              <button key={t} onClick={() => { setTierDropdown(null); act(user.id + '_tier', () => forceSetTier(user.id, t)); }}
                                className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-all flex items-center gap-2 ${user.depositTier === t ? isDark ? 'bg-neon-pink/20 text-neon-pink' : 'bg-neon-pink/10 text-neon-pink' : isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`}>
                                {t === 2 ? <Crown className="w-3 h-3" /> : t === 1 ? <Zap className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                {t === 0 ? 'Inactive' : t === 1 ? 'Tier I — $35' : 'Tier II — $70'}
                                {user.depositTier === t && <span className="ml-auto">✓</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB C: Payout Execution Vault */}
      {activeTab === 'payouts' && (
        <div className="space-y-4">
          {pendingCashouts.length === 0 ? (
            <div className={`${glass} p-8 text-center`}>
              <Wallet className="w-10 h-10 mx-auto mb-3 text-gray-500" />
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No pending payout requests</p>
            </div>
          ) : (
            <div className={`${glass} overflow-hidden`}>
              <div className={`px-5 py-3 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Master Withdrawal Verification Table
                </h3>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {pendingCashouts.length} payout request{pendingCashouts.length !== 1 ? 's' : ''} awaiting processing
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                      <th className={`text-left px-4 py-3 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Username</th>
                      <th className={`text-left px-4 py-3 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Full Name</th>
                      <th className={`text-left px-4 py-3 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email</th>
                      <th className={`text-left px-4 py-3 font-medium min-w-[200px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Wallet Address</th>
                      <th className={`text-left px-4 py-3 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Network</th>
                      <th className={`text-left px-4 py-3 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Amount</th>
                      <th className={`text-left px-4 py-3 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Referrals</th>
                      <th className={`text-right px-4 py-3 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingCashouts.map((req) => {
                      const user = getUserById(req.userId);
                      const completedCount = user?.lifetimeWithdrawals ?? 0;
                      const requiredReferrals = completedCount === 0 ? 2 : 1;
                      const referralsMet = (user?.currentCycleReferrals ?? 0) >= requiredReferrals;
                      const isBusy = processing === req.requestId;
                      return (
                        <tr key={req.requestId} className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1">
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>@{req.username}</span>
                              {user && tierBadge(user.depositTier)}
                            </div>
                          </td>
                          <td className={`px-4 py-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {user?.fullName || req.beneficiaryName || '—'}
                          </td>
                          <td className={`px-4 py-4 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {req.userEmail || user?.email || '—'}
                          </td>
                          <td className="px-4 py-4">
                            <WalletAddress address={req.walletAddress} />
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                              <Link2 className="w-3 h-3" />
                              BEP-20
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-base font-bold text-neon-pink">${req.amount.toFixed(2)}</span>
                          </td>
                          <td className="px-4 py-4">
                            {referralsMet ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                                <CheckCircle className="w-3 h-3" /> {user?.currentCycleReferrals ?? 0}/{requiredReferrals} Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400">
                                <Lock className="w-3 h-3" /> {user?.currentCycleReferrals ?? 0}/{requiredReferrals}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => act(req.requestId, () => processCashout(req.requestId))}
                                disabled={!referralsMet || isBusy}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${isDark ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/20' : 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {isBusy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                Mark Transfer Settled
                              </button>
                              <button
                                onClick={() => act(req.requestId + '_rej', () => rejectCashout(req.requestId))}
                                disabled={isBusy}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${isDark ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20' : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                <XCircle className="w-3 h-3" /> Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Settled history */}
          {cashoutRequests.filter((c) => c.status === 'Completed' || c.status === 'Rejected').length > 0 && (
            <div className={`${glass} p-5`}>
              <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Recent Payout Decisions
              </h4>
              <div className="space-y-2">
                {cashoutRequests.filter((c) => c.status === 'Completed' || c.status === 'Rejected').slice(0, 8).map((req) => (
                  <div key={req.requestId} className={`flex items-center gap-3 p-3 rounded-lg ${req.status === 'Completed' ? isDark ? 'bg-green-500/10' : 'bg-green-50' : isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                    {req.status === 'Completed' ? (
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>@{req.username}</span>
                      {req.networkMethod && <span className={`text-xs ml-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>· {req.networkMethod}</span>}
                    </div>
                    <span className={`text-xs font-bold ${req.status === 'Completed' ? 'text-green-400' : 'text-red-400'}`}>
                      {req.status === 'Completed' ? `−$${req.amount.toFixed(2)}` : 'Returned'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      <LightboxModal
        isOpen={lightboxUrl !== null}
        onClose={closeLightbox}
        imageUrl={lightboxUrl}
        title={lightboxTitle}
      />
    </div>
  );
}
