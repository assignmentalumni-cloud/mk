export type AccountTier = 0 | 1 | 2 | 3;
export type SubmissionStatus = 'Submitted_Pending' | 'Approved' | 'Rejected';
export type CashoutStatus = 'Pending' | 'Completed' | 'Rejected';
export type DepositStatus = 'Pending' | 'Approved' | 'Declined';
export type ActivationStatus = 'Activation_Pending' | 'Active' | null;
export type SubmissionType = 'local_text' | 'photo_document';
export type LevelClaimStatus = 'Pending' | 'Approved' | 'Rejected';

export interface TierConfig {
  deposit: number;
  dailyLimit: number;
  baseRate: number;
  label: string;
}

export const TIER_CONFIG: Record<1 | 2 | 3, TierConfig> = {
  1: { deposit: 15, dailyLimit: 1, baseRate: 0.70, label: 'Tier I' },
  2: { deposit: 35, dailyLimit: 1, baseRate: 1.70, label: 'Tier II' },
  3: { deposit: 70, dailyLimit: 2, baseRate: 1.70, label: 'Tier III' },
};

export interface ReferralLevel {
  level: 1 | 2 | 3;
  requiredReferrals: number;
  reward: number;
  boostPercent: number;
}

export const REFERRAL_LEVELS: ReferralLevel[] = [
  { level: 1, requiredReferrals: 10, reward: 100, boostPercent: 0.5 },
  { level: 2, requiredReferrals: 15, reward: 200, boostPercent: 0.5 },
  { level: 3, requiredReferrals: 30, reward: 250, boostPercent: 0.5 },
];

export interface LevelClaim {
  id: string;
  userId: string;
  username: string;
  level: 1 | 2 | 3;
  rewardAmount: number;
  status: LevelClaimStatus;
  rejectionNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  email: string;
  depositTier: AccountTier;
  availableEarnings: number;
  currentCycleReferrals: number;
  completedTopicIds: string[];
  activationStatus: ActivationStatus;
  avatarUrl: string | null;
  phone: string | null;
  lastSubmissionsLedger: string[];
  invitedBy: string | null;
  lifetimeWithdrawals: number;
  proofOfWorkUrls: string[];
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
  proofUrls?: string[];
  status: SubmissionStatus;
  calculatedPayout: number;
  submittedAt: string;
  submissionType: SubmissionType;
  estimatedWordCount: number | null;
  charCount: number | null;
  rejectionFeedback: string | null;
}

export interface PenaltyTransaction {
  id: string;
  userId: string;
  username: string;
  amount: number;
  reason: string | null;
  createdAt: string;
}

export interface PendingDeposit {
  id: string;
  userId: string;
  username: string;
  chosenTier: 1 | 2 | 3;
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
