export type AccountTier = 0 | 1 | 2;
export type SubmissionStatus = 'Submitted_Pending' | 'Approved' | 'Rejected';
export type CashoutStatus = 'Pending' | 'Completed' | 'Rejected';
export type DepositStatus = 'Pending' | 'Approved' | 'Declined';
export type ActivationStatus = 'Activation_Pending' | 'Active' | null;
export type SubmissionType = 'local_text' | 'photo_document';

export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  email: string;
  depositTier: AccountTier;
  availableEarnings: number;
  currentCycleReferrals: number; // Active referrals who completed deposit
  completedTopicIds: string[];
  activationStatus: ActivationStatus;
  avatarUrl: string | null;
  lastSubmissionsLedger: string[]; // ISO timestamps of submissions in last 24h
  invitedBy: string | null; // Username of referrer (null if no referral)
  lifetimeWithdrawals: number; // Total successful withdrawals count
  createdAt: string;
}

export interface Assignment {
  id: string;
  topicId: string;
  topicTitle: string;
  payout: number;
  status: 'Available' | 'Submitted_Pending' | 'Approved';
}

export interface Submission {
  submissionId: string;
  userId: string;
  username: string;
  topicTitle: string;
  topicId: string;
  submittedText: string;
  fileProofName: string | null;
  fileProofUrl?: string | null;
  status: SubmissionStatus;
  calculatedPayout: number;
  submittedAt: string;
  submissionType: SubmissionType;
  estimatedWordCount: number | null;
  charCount: number | null;
  rejectionFeedback: string | null;
}

export interface PendingDeposit {
  id: string;
  userId: string;
  username: string;
  chosenTier: 1 | 2;
  senderEmail: string;
  senderWalletAddress: string;
  receiptFilename: string | null;
  screenshotUrl?: string | null;
  status: DepositStatus;
  submittedAt: string;
  reviewedAt?: string;
}

export interface CashoutRequest {
  requestId: string;
  userId: string;
  username: string;
  userEmail: string;
  amount: number;
  beneficiaryName: string;
  walletAddress: string;
  networkMethod: string;
  status: CashoutStatus;
  createdAt: string;
  processedAt?: string;
}

export interface AppState {
  users: User[];
  submissions: Submission[];
  cashoutRequests: CashoutRequest[];
  pendingDeposits: PendingDeposit[];
  currentUserId: string | null;
  viewMode: 'user' | 'admin';
}
