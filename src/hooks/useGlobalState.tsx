import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useRef,
} from 'react';
import type {
  User,
  Submission,
  CashoutRequest,
  PendingDeposit,
  AppState,
  AccountTier,
  Assignment,
  ActivationStatus,
} from '../types';
import { supabase } from '../lib/supabase';
import {
  generateUniqueSubId,
  generateUniqueRequestId,
  generateUniqueAssignmentId,
  ASSIGNMENT_TITLES,
  ACADEMIC_TOPICS,
} from '../utils/dataStore';
import { getTopicsForUser } from '../data/academicTopics';

// ─── Admin identity ───────────────────────────────────────────────────────────
export const ADMIN_USERNAME = 'adminowner';

// ─── DB row shapes ────────────────────────────────────────────────────────────

interface DbUser {
  id: string;
  username: string;
  password: string;
  full_name: string;
  email: string;
  deposit_tier: number;
  available_earnings: number;
  current_cycle_referrals: number;
  completed_topic_ids: string[];
  activation_status: string | null;
  last_submissions_ledger: string[];
  invited_by: string | null;
  lifetime_withdrawals: number;
  created_at: string;
}

interface DbSubmission {
  id: string;
  user_id: string;
  username: string;
  topic_id: string;
  topic_title: string;
  submitted_text: string;
  file_proof_name: string | null;
  file_proof_url: string | null;
  status: string;
  calculated_payout: number;
  submitted_at: string;
  submission_type: string;
  estimated_word_count: number | null;
  char_count: number | null;
  rejection_feedback: string | null;
}

interface DbCashout {
  id: string;
  user_id: string;
  username: string;
  user_email: string | null;
  amount: number;
  beneficiary_name: string | null;
  wallet_address: string | null;
  network_method: string | null;
  status: string;
  created_at: string;
  processed_at: string | null;
}

interface DbDeposit {
  id: string;
  user_id: string;
  username: string;
  chosen_tier: number;
  sender_name: string;
  sender_email: string;
  sender_wallet_address: string;
  receipt_filename: string | null;
  screenshot_url: string | null;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapUser(row: DbUser): User {
  return {
    id: row.id,
    username: row.username,
    password: row.password,
    fullName: row.full_name,
    email: row.email,
    depositTier: row.deposit_tier as AccountTier,
    availableEarnings: Number(row.available_earnings),
    currentCycleReferrals: row.current_cycle_referrals,
    completedTopicIds: Array.isArray(row.completed_topic_ids) ? row.completed_topic_ids : [],
    activationStatus: (row.activation_status as ActivationStatus) ?? null,
    avatarUrl: row.avatar_url ?? null,
    lastSubmissionsLedger: Array.isArray(row.last_submissions_ledger) ? row.last_submissions_ledger : [],
    invitedBy: row.invited_by ?? null,
    lifetimeWithdrawals: row.lifetime_withdrawals ?? 0,
    createdAt: row.created_at,
  };
}

function mapSubmission(row: DbSubmission): Submission {
  return {
    submissionId: row.id,
    userId: row.user_id,
    username: row.username,
    topicId: row.topic_id,
    topicTitle: row.topic_title,
    submittedText: row.submitted_text,
    fileProofName: row.file_proof_name,
    fileProofUrl: row.file_proof_url ?? null,
    status: row.status as Submission['status'],
    calculatedPayout: Number(row.calculated_payout),
    submittedAt: row.submitted_at,
    submissionType: (row.submission_type as Submission['submissionType']) || 'local_text',
    estimatedWordCount: row.estimated_word_count ?? null,
    charCount: row.char_count ?? null,
    rejectionFeedback: row.rejection_feedback ?? null,
  };
}

function mapCashout(row: DbCashout): CashoutRequest {
  return {
    requestId: row.id,
    userId: row.user_id,
    username: row.username,
    userEmail: row.user_email ?? '',
    amount: Number(row.amount),
    beneficiaryName: row.beneficiary_name ?? '',
    walletAddress: row.wallet_address ?? '',
    networkMethod: row.network_method ?? '',
    status: row.status as CashoutRequest['status'],
    createdAt: row.created_at,
    processedAt: row.processed_at ?? undefined,
  };
}

function mapDeposit(row: DbDeposit): PendingDeposit {
  return {
    id: row.id,
    userId: row.user_id,
    username: row.username,
    chosenTier: row.chosen_tier as 1 | 2,
    senderEmail: row.sender_email,
    senderWalletAddress: row.sender_wallet_address || row.sender_name, // fallback for old records
    receiptFilename: row.receipt_filename,
    screenshotUrl: row.screenshot_url ?? null,
    status: row.status as PendingDeposit['status'],
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at ?? undefined,
  };
}

// ─── Context type ─────────────────────────────────────────────────────────────

interface GlobalContextType extends AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isProfileActive: boolean;
  currentUserAssignments: Assignment[];
  pendingUserSubmissions: Submission[];
  pendingCashoutRequests: CashoutRequest[];
  allSubmissions: Submission[];
  taskRestrictionStatus: { isLocked: boolean; activeSubmissions: number; maxAllowed: number; oldestSubmissionTime: string | null };
  login(username: string, password: string): Promise<{ success: boolean; error?: string }>;
  signup(fullName: string, username: string, email: string, password: string, invitedBy?: string | null): Promise<{ success: boolean; error?: string }>;
  logout(): void;
  selectTier(tier: AccountTier): Promise<void>;
  submitDepositProof(
    chosenTier: 1 | 2,
    username: string,
    senderEmail: string,
    senderWalletAddress: string,
    receiptFilename: string | null
  ): Promise<void>;
  approveDeposit(depositId: string): Promise<void>;
  declineDeposit(depositId: string): Promise<void>;
  submitAssignment(
    assignmentId: string,
    topicId: string,
    topicTitle: string,
    text: string,
    fileName: string | null,
    submissionType: 'local_text' | 'photo_document',
    estimatedWordCount: number | null,
    charCount: number | null
  ): Promise<void>;
  approveSubmission(submissionId: string): Promise<void>;
  rejectSubmission(submissionId: string, feedback?: string): Promise<void>;
  requestCashout(
    amount: number,
    beneficiaryName: string,
    userEmail: string,
    walletAddress: string
  ): Promise<{ success: boolean; error?: string }>;
  processCashout(requestId: string): Promise<void>;
  rejectCashout(requestId: string): Promise<void>;
  addReferral(userId?: string): Promise<void>;
  forceSetTier(userId: string, tier: AccountTier): Promise<void>;
  setViewMode(mode: 'user' | 'admin'): void;
  uploadAvatar(avatarUrl: string): Promise<void>;
  getUserById(userId: string): User | undefined;
  getPendingReferrals(username: string): { username: string; status: 'pending' | 'active'; createdAt: string }[];
  getActiveReferrals(username: string): { username: string; status: 'pending' | 'active'; createdAt: string }[];
  refreshCurrentUser(): Promise<void>;
  refreshAssignments(): void;
  refreshAll(): Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | null>(null);

const SESSION_KEY = 'assignment_alumni_session';

// ─── Provider ─────────────────────────────────────────────────────────────────

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [cashouts, setCashouts] = useState<CashoutRequest[]>([]);
  const [deposits, setDeposits] = useState<PendingDeposit[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [viewMode, setViewModeState] = useState<'user' | 'admin'>('user');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadedRef = useRef(false);

  const loadAll = useCallback(async () => {
    const [usersRes, subsRes, cashoutsRes, depositsRes] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('submissions').select('*').order('submitted_at', { ascending: false }),
      supabase.from('cashout_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('pending_deposits').select('*').order('submitted_at', { ascending: false }),
    ]);
    if (!usersRes.error) setUsers((usersRes.data as DbUser[]).map(mapUser));
    if (!subsRes.error) setSubmissions((subsRes.data as DbSubmission[]).map(mapSubmission));
    if (!cashoutsRes.error) setCashouts((cashoutsRes.data as DbCashout[]).map(mapCashout));
    if (!depositsRes.error) setDeposits((depositsRes.data as DbDeposit[]).map(mapDeposit));
  }, []);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    (async () => {
      try {
        const storedId = localStorage.getItem(SESSION_KEY);
        if (storedId) setCurrentUserId(storedId);
        await loadAll();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [loadAll]);

  // ── Derived ───────────────────────────────────────────────────────────────────

  const currentUser = currentUserId ? (users.find((u) => u.id === currentUserId) ?? null) : null;
  const isAuthenticated = currentUserId !== null;
  const isAdmin = currentUser?.username === ADMIN_USERNAME;
  const isProfileActive = currentUser !== null && currentUser.depositTier !== 0;

  const pendingUserSubmissions = submissions.filter(
    (s) => s.userId === currentUserId && s.status === 'Submitted_Pending'
  );
  const pendingCashoutRequests = cashouts.filter((c) => c.status === 'Pending');

  // ── Anti-Cheat Task Restriction Engine ───────────────────────────────────────────

  const getTaskRestrictionStatus = useCallback((): {
    isLocked: boolean;
    activeSubmissions: number;
    maxAllowed: number;
    oldestSubmissionTime: string | null;
  } => {
    if (!currentUser || currentUser.depositTier === 0) {
      return { isLocked: false, activeSubmissions: 0, maxAllowed: 0, oldestSubmissionTime: null };
    }
    const maxAllowed = currentUser.depositTier === 2 ? 2 : 1;
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const activeTimestamps = (currentUser.lastSubmissionsLedger || [])
      .filter((ts) => new Date(ts) > twentyFourHoursAgo)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const activeSubmissions = activeTimestamps.length;
    const oldestSubmissionTime = activeTimestamps[0] || null;
    const isLocked = activeSubmissions >= maxAllowed;
    return { isLocked, activeSubmissions, maxAllowed, oldestSubmissionTime };
  }, [currentUser]);

  const taskRestrictionStatus = getTaskRestrictionStatus();

  // ── Assignments ───────────────────────────────────────────────────────────────

  const buildAssignments = useCallback((user: User): Assignment[] => {
    const payout = 1.7; // Flat $1.70 for both tiers
    const count = user.depositTier === 2 ? 2 : 1;

    // Get deterministic topics for user based on current day
    const todaysTopics = getTopicsForUser(user.id, count);

    return todaysTopics.map((title: string) => ({
      id: generateUniqueAssignmentId(),
      topicId: `topic-${String(ACADEMIC_TOPICS.indexOf(title) + 1).padStart(3, '0')}`,
      topicTitle: title,
      payout,
      status: 'Available' as const,
    }));
  }, []);

  const refreshAssignments = useCallback(() => {
    if (!currentUser || currentUser.depositTier === 0) { setAssignments([]); return; }
    setAssignments(buildAssignments(currentUser));
  }, [currentUser, buildAssignments]);

  useEffect(() => {
    if (currentUser && currentUser.depositTier !== 0 && assignments.length === 0) {
      setAssignments(buildAssignments(currentUser));
    }
  }, [currentUser, assignments.length, buildAssignments]);

  // ── Auth ──────────────────────────────────────────────────────────────────────

  const login = useCallback(async (username: string, password: string) => {
    const user = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (!user) return { success: false, error: 'Invalid username or password.' };
    localStorage.setItem(SESSION_KEY, user.id);
    setCurrentUserId(user.id);
    setViewModeState('user');
    if (user.depositTier !== 0) setAssignments(buildAssignments(user));
    return { success: true };
  }, [users, buildAssignments]);

  const signup = useCallback(async (fullName: string, username: string, email: string, password: string, invitedBy: string | null = null) => {
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase()))
      return { success: false, error: 'Username already taken.' };
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase()))
      return { success: false, error: 'Email already registered.' };
    const id = `user-${Date.now()}`;
    const { error } = await supabase.from('users').insert([{
      id, username, password, full_name: fullName, email,
      deposit_tier: 0, available_earnings: 0,
      current_cycle_referrals: 0, completed_topic_ids: [],
      avatar_url: null,
    activation_status: null, last_submissions_ledger: [],
      invited_by: invitedBy, lifetime_withdrawals: 0,
    }]);
    if (error) return { success: false, error: 'Failed to create account.' };
    setUsers((prev) => [...prev, {
      id, username, password, fullName, email,
      depositTier: 0, availableEarnings: 0,
      currentCycleReferrals: 0, completedTopicIds: [],
      activationStatus: null, lastSubmissionsLedger: [],
      invitedBy, lifetimeWithdrawals: 0,
      createdAt: new Date().toISOString(),
    }]);
    return { success: true };
  }, [users]);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUserId(null);
    setViewModeState('user');
    setAssignments([]);
  }, []);

  // ── Tier (direct admin path only, kept for forceSetTier) ─────────────────────

  const selectTier = useCallback(async (tier: AccountTier) => {
    if (!currentUser) return;
    const { error } = await supabase
      .from('users').update({ deposit_tier: tier }).eq('id', currentUser.id);
    if (error) { console.error(error); return; }
    const updated = { ...currentUser, depositTier: tier };
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    setAssignments(buildAssignments(updated));
  }, [currentUser, buildAssignments]);

  // ── Deposit proof workflow ────────────────────────────────────────────────────

  const submitDepositProof = useCallback(async (
    chosenTier: 1 | 2,
    username: string,
    senderEmail: string,
    senderWalletAddress: string,
    receiptFilename: string | null,
  ) => {
    if (!currentUser) return;
    const id = `dep-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const [depRes, userRes] = await Promise.all([
      supabase.from('pending_deposits').insert([{
        id,
        user_id: currentUser.id,
        username: currentUser.username,
        chosen_tier: chosenTier,
        sender_name: username, // Store username in sender_name for backwards compatibility
        sender_email: senderEmail,
        sender_wallet_address: senderWalletAddress,
        receipt_filename: receiptFilename,
        status: 'Pending',
      }]),
      supabase.from('users')
        .update({ activation_status: 'Activation_Pending' })
        .eq('id', currentUser.id),
    ]);
    if (depRes.error) { console.error(depRes.error); return; }
    if (userRes.error) { console.error(userRes.error); return; }

    const dep: PendingDeposit = {
      id, userId: currentUser.id, username: currentUser.username,
      chosenTier, senderEmail, senderWalletAddress,
      receiptFilename, status: 'Pending',
      submittedAt: new Date().toISOString(),
    };
    setDeposits((prev) => [dep, ...prev]);
    setUsers((prev) => prev.map((u) =>
      u.id === currentUser.id ? { ...u, activationStatus: 'Activation_Pending' } : u
    ));
  }, [currentUser]);

  const approveDeposit = useCallback(async (depositId: string) => {
    const dep = deposits.find((d) => d.id === depositId);
    if (!dep) return;
    const user = users.find((u) => u.id === dep.userId);
    const now = new Date().toISOString();

    // Update deposit and user status
    const [depRes, userRes] = await Promise.all([
      supabase.from('pending_deposits')
        .update({ status: 'Approved', reviewed_at: now })
        .eq('id', depositId),
      supabase.from('users')
        .update({ deposit_tier: dep.chosenTier, activation_status: 'Active' })
        .eq('id', dep.userId),
    ]);
    if (depRes.error) { console.error(depRes.error); return; }
    if (userRes.error) { console.error(userRes.error); return; }

    // Increment referrer's referral count + $5.00 bonus (anti-fraud: only counts on deposit approval)
    if (user?.invitedBy) {
      const referrer = users.find((u) => u.username === user.invitedBy);
      if (referrer) {
        const newReferralCount = referrer.currentCycleReferrals + 1;
        const newEarnings = referrer.availableEarnings + 5.00; // $5.00 referral bonus
        const refRes = await supabase.from('users')
          .update({
            current_cycle_referrals: newReferralCount,
            available_earnings: newEarnings,
          })
          .eq('id', referrer.id);
        if (!refRes.error) {
          setUsers((prev) => prev.map((u) =>
            u.id === referrer.id
              ? { ...u, currentCycleReferrals: newReferralCount, availableEarnings: newEarnings }
              : u
          ));
        }
      }
    }

    setDeposits((prev) => prev.map((d) =>
      d.id === depositId ? { ...d, status: 'Approved' as const, reviewedAt: now } : d
    ));
    setUsers((prev) => prev.map((u) =>
      u.id === dep.userId
        ? { ...u, depositTier: dep.chosenTier as AccountTier, activationStatus: 'Active' }
        : u
    ));
  }, [deposits, users]);

  const declineDeposit = useCallback(async (depositId: string) => {
    const dep = deposits.find((d) => d.id === depositId);
    if (!dep) return;
    const now = new Date().toISOString();
    const [depRes, userRes] = await Promise.all([
      supabase.from('pending_deposits')
        .update({ status: 'Declined', reviewed_at: now })
        .eq('id', depositId),
      supabase.from('users')
        .update({ activation_status: null })
        .eq('id', dep.userId),
    ]);
    if (depRes.error) { console.error(depRes.error); return; }
    if (userRes.error) { console.error(userRes.error); return; }
    setDeposits((prev) => prev.map((d) =>
      d.id === depositId ? { ...d, status: 'Declined' as const, reviewedAt: now } : d
    ));
    setUsers((prev) => prev.map((u) =>
      u.id === dep.userId ? { ...u, activationStatus: null } : u
    ));
  }, [deposits]);

  // ── Submissions ───────────────────────────────────────────────────────────────

  const submitAssignment = useCallback(async (
    assignmentId: string, topicId: string, topicTitle: string,
    text: string, fileName: string | null,
    submissionType: 'local_text' | 'photo_document',
    estimatedWordCount: number | null,
    charCount: number | null
  ) => {
    if (!currentUser) return;

    // Anti-cheat: enforce 24-hour rolling window limit
    const maxAllowed = currentUser.depositTier === 2 ? 2 : 1;
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const cleanLedger = (currentUser.lastSubmissionsLedger || []).filter(
      (ts) => new Date(ts) > twentyFourHoursAgo
    );

    if (cleanLedger.length >= maxAllowed) {
      console.error('Task limit reached for current 24-hour window');
      return;
    }

    const newTimestamp = now.toISOString();
    const updatedLedger = [...cleanLedger, newTimestamp];

    const payout = 1.7; // Flat $1.70 for both tiers
    const id = generateUniqueSubId();

    const [subRes, userRes] = await Promise.all([
      supabase.from('submissions').insert([{
        id, user_id: currentUser.id, username: currentUser.username,
        topic_id: topicId, topic_title: topicTitle,
        submitted_text: text, file_proof_name: fileName,
        status: 'Submitted_Pending', calculated_payout: payout,
        submission_type: submissionType,
        estimated_word_count: estimatedWordCount,
        char_count: charCount,
      }]),
      supabase.from('users')
        .update({ last_submissions_ledger: updatedLedger })
        .eq('id', currentUser.id),
    ]);

    if (subRes.error) { console.error(subRes.error); return; }
    if (userRes.error) { console.error(userRes.error); return; }

    setSubmissions((prev) => [{
      submissionId: id, userId: currentUser.id, username: currentUser.username,
      topicId, topicTitle, submittedText: text, fileProofName: fileName,
      status: 'Submitted_Pending', calculatedPayout: payout,
      submittedAt: newTimestamp,
      submissionType,
      estimatedWordCount,
      charCount,
      rejectionFeedback: null,
    }, ...prev]);
    setAssignments((prev) =>
      prev.map((a) => (a.id === assignmentId ? { ...a, status: 'Submitted_Pending' as const } : a))
    );
    setUsers((prev) => prev.map((u) =>
      u.id === currentUser.id ? { ...u, lastSubmissionsLedger: updatedLedger } : u
    ));
  }, [currentUser]);

  const approveSubmission = useCallback(async (submissionId: string) => {
    const sub = submissions.find((s) => s.submissionId === submissionId);
    if (!sub) return;
    const user = users.find((u) => u.id === sub.userId);
    if (!user) return;
    const newEarnings = user.availableEarnings + sub.calculatedPayout;
    const newTopicIds = [...user.completedTopicIds, sub.topicId];
    const [subRes, userRes] = await Promise.all([
      supabase.from('submissions').update({ status: 'Approved' }).eq('id', submissionId),
      supabase.from('users').update({
        available_earnings: newEarnings, completed_topic_ids: newTopicIds,
      }).eq('id', user.id),
    ]);
    if (subRes.error || userRes.error) { console.error(subRes.error ?? userRes.error); return; }
    setSubmissions((prev) => prev.map((s) =>
      s.submissionId === submissionId ? { ...s, status: 'Approved' as const } : s
    ));
    setUsers((prev) => prev.map((u) =>
      u.id === user.id ? { ...u, availableEarnings: newEarnings, completedTopicIds: newTopicIds } : u
    ));
  }, [submissions, users]);

  const rejectSubmission = useCallback(async (submissionId: string, feedback?: string) => {
    const sub = submissions.find((s) => s.submissionId === submissionId);
    const { error } = await supabase.from('submissions')
      .update({ status: 'Rejected', rejection_feedback: feedback ?? null })
      .eq('id', submissionId);
    if (error) { console.error(error); return; }
    setSubmissions((prev) => prev.map((s) =>
      s.submissionId === submissionId
        ? { ...s, status: 'Rejected' as const, rejectionFeedback: feedback ?? null }
        : s
    ));
    // Revert assignment to Available so user can resubmit
    if (sub) {
      setAssignments((prev) => prev.map((a) =>
        a.topicId === sub.topicId ? { ...a, status: 'Available' as const } : a
      ));
    }
  }, [submissions]);

  // ── Cashout ───────────────────────────────────────────────────────────────────

  const requestCashout = useCallback(async (
    amount: number,
    beneficiaryName: string,
    userEmail: string,
    walletAddress: string,
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    // Referral-based withdrawal eligibility check
    const lifetimeWithdrawals = currentUser.lifetimeWithdrawals ?? 0;
    const activeReferrals = currentUser.currentCycleReferrals ?? 0;

    if (lifetimeWithdrawals === 0) {
      // First withdrawal requires 2 active referrals
      if (activeReferrals < 2) {
        return {
          success: false,
          error: 'First Withdrawal Requirement: You need at least 2 active referrals who have completed their account activation deposit to unlock your first payout.',
        };
      }
    } else {
      // Subsequent withdrawals require 1 new active referral
      if (activeReferrals < 1) {
        return {
          success: false,
          error: 'Withdrawal Requirement: You need at least 1 active referral who has completed their account activation deposit to unlock this payout.',
        };
      }
    }

    const id = generateUniqueRequestId();
    const networkMethod = 'BNB Smart Chain (BEP-20)';
    const { error } = await supabase.from('cashout_requests').insert([{
      id, user_id: currentUser.id, username: currentUser.username,
      user_email: userEmail,
      amount, beneficiary_name: beneficiaryName,
      wallet_address: walletAddress, network_method: networkMethod,
      status: 'Pending',
    }]);
    if (error) { console.error(error); return { success: false, error: 'Failed to submit request' }; }
    setCashouts((prev) => [{
      requestId: id, userId: currentUser.id, username: currentUser.username,
      userEmail,
      amount, beneficiaryName, walletAddress, networkMethod,
      status: 'Pending', createdAt: new Date().toISOString(),
    }, ...prev]);
    return { success: true };
  }, [currentUser]);

  const processCashout = useCallback(async (requestId: string) => {
    const req = cashouts.find((c) => c.requestId === requestId);
    if (!req || req.status !== 'Pending') return;
    const user = users.find((u) => u.id === req.userId);
    if (!user) return;
    const newEarnings = Math.max(0, user.availableEarnings - req.amount);
    const newLifetimeWithdrawals = (user.lifetimeWithdrawals ?? 0) + 1;
    const now = new Date().toISOString();
    const [cashRes, userRes] = await Promise.all([
      supabase.from('cashout_requests').update({ status: 'Completed', processed_at: now }).eq('id', requestId),
      supabase.from('users').update({
        available_earnings: newEarnings,
        current_cycle_referrals: 0,
        lifetime_withdrawals: newLifetimeWithdrawals,
      }).eq('id', req.userId),
    ]);
    if (cashRes.error || userRes.error) { console.error(cashRes.error ?? userRes.error); return; }
    setCashouts((prev) => prev.map((c) =>
      c.requestId === requestId ? { ...c, status: 'Completed' as const, processedAt: now } : c
    ));
    setUsers((prev) => prev.map((u) =>
      u.id === req.userId ? { ...u, availableEarnings: newEarnings, currentCycleReferrals: 0, lifetimeWithdrawals: newLifetimeWithdrawals } : u
    ));
  }, [cashouts, users]);

  const rejectCashout = useCallback(async (requestId: string) => {
    const req = cashouts.find((c) => c.requestId === requestId);
    if (!req || req.status !== 'Pending') return;
    const user = users.find((u) => u.id === req.userId);
    if (!user) return;
    const now = new Date().toISOString();
    const [cashRes, userRes] = await Promise.all([
      supabase.from('cashout_requests').update({ status: 'Rejected', processed_at: now }).eq('id', requestId),
      supabase.from('users').update({ available_earnings: user.availableEarnings + req.amount }).eq('id', req.userId),
    ]);
    if (cashRes.error || userRes.error) { console.error(cashRes.error ?? userRes.error); return; }
    setCashouts((prev) => prev.map((c) =>
      c.requestId === requestId ? { ...c, status: 'Rejected' as const, processedAt: now } : c
    ));
    setUsers((prev) => prev.map((u) =>
      u.id === req.userId ? { ...u, availableEarnings: u.availableEarnings + req.amount } : u
    ));
  }, [cashouts, users]);

  // ── Referrals & admin controls ────────────────────────────────────────────────

  const addReferral = useCallback(async (userId?: string) => {
    const targetId = userId ?? currentUserId;
    if (!targetId) return;
    const user = users.find((u) => u.id === targetId);
    if (!user) return;
    const newCount = Math.min(2, user.currentCycleReferrals + 1);
    const { error } = await supabase.from('users')
      .update({ current_cycle_referrals: newCount }).eq('id', targetId);
    if (error) { console.error(error); return; }
    setUsers((prev) => prev.map((u) => (u.id === targetId ? { ...u, currentCycleReferrals: newCount } : u)));
  }, [currentUserId, users]);

  const forceSetTier = useCallback(async (userId: string, tier: AccountTier) => {
    const { error } = await supabase.from('users').update({ deposit_tier: tier }).eq('id', userId);
    if (error) { console.error(error); return; }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, depositTier: tier } : u)));
  }, []);

  // ── Utilities ─────────────────────────────────────────────────────────────────

  const getUserById = useCallback((userId: string) => users.find((u) => u.id === userId), [users]);

  // Get users who registered with this user's referral link but haven't deposited yet
  const getPendingReferrals = useCallback((username: string) => {
    return users
      .filter((u) => u.invitedBy === username && u.activationStatus !== 'Active')
      .map((u) => ({
        username: u.username,
        status: 'pending' as const,
        createdAt: u.createdAt,
      }));
  }, [users]);

  // Get users who registered with this user's referral link AND have deposited
  const getActiveReferrals = useCallback((username: string) => {
    return users
      .filter((u) => u.invitedBy === username && u.activationStatus === 'Active')
      .map((u) => ({
        username: u.username,
        status: 'active' as const,
        createdAt: u.createdAt,
      }));
  }, [users]);

  const refreshCurrentUser = useCallback(async () => {
    if (!currentUserId) return;
    const { data, error } = await supabase.from('users').select('*').eq('id', currentUserId).maybeSingle();
    if (error || !data) return;
    setUsers((prev) => prev.map((u) => (u.id === currentUserId ? mapUser(data as DbUser) : u)));
  }, [currentUserId]);

  const refreshAll = useCallback(async () => { await loadAll(); }, [loadAll]);

  const setViewMode = useCallback((mode: 'user' | 'admin') => { setViewModeState(mode); }, []);

  const uploadAvatar = useCallback(async (avatarUrl: string): Promise<void> => {
    if (!currentUser) return;
    const { error } = await supabase.from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', currentUser.id);
    if (error) { console.error(error); return; }
    setUsers((prev) => prev.map((u) =>
      u.id === currentUser.id ? { ...u, avatarUrl } : u
    ));
  }, [currentUser]);

  // ── Context value ─────────────────────────────────────────────────────────────

  const value: GlobalContextType = {
    users, submissions, cashoutRequests: cashouts,
    pendingDeposits: deposits,
    currentUserId, viewMode,
    currentUser, isAuthenticated, isAdmin, isProfileActive,
    currentUserAssignments: assignments,
    pendingUserSubmissions, pendingCashoutRequests,
    allSubmissions: submissions,
    taskRestrictionStatus,
    login, signup, logout, selectTier,
    submitDepositProof, approveDeposit, declineDeposit,
    submitAssignment, approveSubmission, rejectSubmission,
    requestCashout, processCashout, rejectCashout,
    addReferral, forceSetTier,
    setViewMode, getUserById, getPendingReferrals, getActiveReferrals,
    refreshCurrentUser, refreshAssignments, refreshAll,
    uploadAvatar,
  };

  if (isLoading) return null;
  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

export function useGlobalState(): GlobalContextType {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error('useGlobalState must be used within a GlobalProvider');
  return ctx;
}
