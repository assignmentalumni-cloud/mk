import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useRef,
  useMemo,
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
  LevelClaim,
  LevelClaimStatus,
} from '../types';
import { TIER_CONFIG, REFERRAL_LEVELS } from '../types';
import { supabase } from '../lib/supabase';
import {
  generateUniqueSubId,
  generateUniqueRequestId,
  generateUniqueAssignmentId,
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
  avatar_url: string | null;
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

interface DbLevelClaim {
  id: string;
  user_id: string;
  username: string;
  level: number;
  reward_amount: number;
  status: string;
  rejection_note: string | null;
  created_at: string;
  reviewed_at: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBaseRate(tier: AccountTier): number {
  if (tier === 1) return TIER_CONFIG[1].baseRate;
  if (tier === 2) return TIER_CONFIG[2].baseRate;
  if (tier === 3) return TIER_CONFIG[3].baseRate;
  return 0;
}

function getDailyLimit(tier: AccountTier): number {
  if (tier === 1) return TIER_CONFIG[1].dailyLimit;
  if (tier === 2) return TIER_CONFIG[2].dailyLimit;
  if (tier === 3) return TIER_CONFIG[3].dailyLimit;
  return 0;
}

function getApprovedLevelBoost(approvedLevels: number): number {
  return approvedLevels * 0.005;
}

function applyBoost(baseRate: number, approvedLevels: number): number {
  return baseRate * (1 + getApprovedLevelBoost(approvedLevels));
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
    chosenTier: row.chosen_tier as 1 | 2 | 3,
    senderEmail: row.sender_email,
    senderWalletAddress: row.sender_wallet_address || row.sender_name,
    receiptFilename: row.receipt_filename,
    screenshotUrl: row.screenshot_url ?? null,
    status: row.status as PendingDeposit['status'],
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at ?? undefined,
  };
}

function mapLevelClaim(row: DbLevelClaim): LevelClaim {
  return {
    id: row.id,
    userId: row.user_id,
    username: row.username,
    level: row.level as 1 | 2 | 3,
    rewardAmount: Number(row.reward_amount),
    status: row.status as LevelClaimStatus,
    rejectionNote: row.rejection_note ?? null,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at ?? null,
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
  levelClaims: LevelClaim[];
  currentUserLevelClaims: LevelClaim[];
  approvedLevelCount: number;
  currentUserBoostPercent: number;
  taskRestrictionStatus: { isLocked: boolean; activeSubmissions: number; maxAllowed: number; oldestSubmissionTime: string | null };
  login(username: string, password: string): Promise<{ success: boolean; error?: string }>;
  signup(fullName: string, username: string, email: string, password: string, invitedBy?: string | null): Promise<{ success: boolean; error?: string }>;
  logout(): void;
  selectTier(tier: AccountTier): Promise<void>;
  submitDepositProof(
    chosenTier: 1 | 2 | 3,
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
  claimLevelReward(level: 1 | 2 | 3): Promise<void>;
  approveLevelClaim(claimId: string): Promise<void>;
  rejectLevelClaim(claimId: string, note?: string): Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | null>(null);

const SESSION_KEY = 'assignment_alumni_session';

// ─── Provider ─────────────────────────────────────────────────────────────────

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [cashouts, setCashouts] = useState<CashoutRequest[]>([]);
  const [deposits, setDeposits] = useState<PendingDeposit[]>([]);
  const [levelClaims, setLevelClaims] = useState<LevelClaim[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [viewMode, setViewModeState] = useState<'user' | 'admin'>('user');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadedRef = useRef(false);

  const loadAll = useCallback(async () => {
    try {
      const [usersRes, subsRes, cashoutsRes, depositsRes, claimsRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('submissions').select('*').order('submitted_at', { ascending: false }),
        supabase.from('cashout_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('pending_deposits').select('*').order('submitted_at', { ascending: false }),
        supabase.from('referral_level_claims').select('*').order('created_at', { ascending: false }),
      ]);
      if (!usersRes.error) setUsers((usersRes.data as DbUser[]).map(mapUser));
      else console.error('Failed to load users:', usersRes.error);
      if (!subsRes.error) setSubmissions((subsRes.data as DbSubmission[]).map(mapSubmission));
      if (!cashoutsRes.error) setCashouts((cashoutsRes.data as DbCashout[]).map(mapCashout));
      if (!depositsRes.error) setDeposits((depositsRes.data as DbDeposit[]).map(mapDeposit));
      if (!claimsRes.error) setLevelClaims((claimsRes.data as DbLevelClaim[]).map(mapLevelClaim));
    } catch (err) {
      console.error('loadAll error:', err);
    }
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

  const currentUserLevelClaims = levelClaims.filter((c) => c.userId === currentUserId);
  const approvedLevelCount = currentUserLevelClaims.filter((c) => c.status === 'Approved').length;
  const currentUserBoostPercent = approvedLevelCount * 0.5;

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
    const maxAllowed = getDailyLimit(currentUser.depositTier);
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
    const baseRate = getBaseRate(user.depositTier);
    const boostedRate = applyBoost(baseRate, levelClaims.filter((c) => c.userId === user.id && c.status === 'Approved').length);
    const count = getDailyLimit(user.depositTier);

    const todaysTopics = getTopicsForUser(user.id, count);

    return todaysTopics.map((title: string) => ({
      id: generateUniqueAssignmentId(),
      topicId: `topic-${String(ACADEMIC_TOPICS.indexOf(title) + 1).padStart(3, '0')}`,
      topicTitle: title,
      payout: boostedRate,
      status: 'Available' as const,
    }));
  }, [levelClaims]);

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
    try {
      let user = users.find(
        (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
      );
      // Fallback: if local cache isn't populated yet, query Supabase directly
      if (!user) {
        const { data, error } = await supabase.from('users')
          .select('*')
          .ilike('username', username)
          .eq('password', password)
          .maybeSingle();
        if (error) { console.error(error); return { success: false, error: 'Login failed. Please try again.' }; }
        if (data) {
          user = {
            id: data.id, username: data.username, password: data.password,
            fullName: data.full_name, email: data.email,
            depositTier: data.deposit_tier, availableEarnings: data.available_earnings,
            currentCycleReferrals: data.current_cycle_referrals,
            completedTopicIds: data.completed_topic_ids || [],
            activationStatus: data.activation_status,
            avatarUrl: data.avatar_url,
            lastSubmissionsLedger: data.last_submissions_ledger || [],
            invitedBy: data.invited_by,
            lifetimeWithdrawals: data.lifetime_withdrawals ?? 0,
            createdAt: data.created_at,
          };
        }
      }
      if (!user) return { success: false, error: 'Invalid username or password.' };
      localStorage.setItem(SESSION_KEY, user.id);
      setCurrentUserId(user.id);
      setViewModeState('user');
      if (user.depositTier !== 0) setAssignments(buildAssignments(user));
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }, [users, buildAssignments]);

  const signup = useCallback(async (fullName: string, username: string, email: string, password: string, invitedBy: string | null = null) => {
    try {
      if (users.some((u) => u.username.toLowerCase() === username.toLowerCase()))
        return { success: false, error: 'Username already taken.' };
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase()))
        return { success: false, error: 'Email already registered.' };
      const id = `user-${Date.now()}`;
      const { error } = await supabase.from('users').insert([{
        id, username, password, full_name: fullName, email,
        deposit_tier: 0, available_earnings: 0,
        current_cycle_referrals: 0, completed_topic_ids: [],
        avatar_url: null, activation_status: null, last_submissions_ledger: [],
        invited_by: invitedBy, lifetime_withdrawals: 0,
      }]);
      if (error) return { success: false, error: 'Failed to create account.' };
      setUsers((prev) => [...prev, {
        id, username, password, fullName, email,
        depositTier: 0, availableEarnings: 0,
        currentCycleReferrals: 0, completedTopicIds: [],
        activationStatus: null, avatarUrl: null, lastSubmissionsLedger: [],
        invitedBy, lifetimeWithdrawals: 0,
        createdAt: new Date().toISOString(),
      }]);
      return { success: true };
    } catch (err) {
      console.error('Signup error:', err);
      return { success: false, error: 'Failed to create account. Please try again.' };
    }
  }, [users]);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUserId(null);
    setViewModeState('user');
    setAssignments([]);
  }, []);

  // ── Tier ──────────────────────────────────────────────────────────────────────

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
    chosenTier: 1 | 2 | 3,
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
        sender_name: username,
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

    // Increment referrer's referral count + $5.00 bonus
    if (user?.invitedBy) {
      const referrer = users.find((u) => u.username === user.invitedBy);
      if (referrer) {
        const newReferralCount = referrer.currentCycleReferrals + 1;
        const newEarnings = referrer.availableEarnings + 5.00;
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

    const maxAllowed = getDailyLimit(currentUser.depositTier);
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

    const baseRate = getBaseRate(currentUser.depositTier);
    const payout = applyBoost(baseRate, approvedLevelCount);
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
  }, [currentUser, approvedLevelCount]);

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

    const lifetimeWithdrawals = currentUser.lifetimeWithdrawals ?? 0;
    const activeReferrals = currentUser.currentCycleReferrals ?? 0;

    if (lifetimeWithdrawals === 0) {
      if (activeReferrals < 3) {
        return {
          success: false,
          error: 'First Withdrawal Requirement: You need at least 3 active referrals who have completed their account activation deposit to unlock your first payout.',
        };
      }
    } else {
      if (activeReferrals < 2) {
        return {
          success: false,
          error: 'Withdrawal Requirement: You need at least 2 active referrals who have completed their account activation deposit to unlock this payout.',
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
    const newCount = user.currentCycleReferrals + 1;
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

  // ── Referral Level Claims ─────────────────────────────────────────────────────

  const claimLevelReward = useCallback(async (level: 1 | 2 | 3) => {
    if (!currentUser) return;
    const config = REFERRAL_LEVELS.find((l) => l.level === level);
    if (!config) return;

    // Check if already claimed
    const existing = levelClaims.find(
      (c) => c.userId === currentUser.id && c.level === level && c.status !== 'Rejected'
    );
    if (existing) return;

    const id = `claim-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const { error } = await supabase.from('referral_level_claims').insert([{
      id,
      user_id: currentUser.id,
      username: currentUser.username,
      level,
      reward_amount: config.reward,
      status: 'Pending',
    }]);
    if (error) { console.error(error); return; }

    setLevelClaims((prev) => [{
      id,
      userId: currentUser.id,
      username: currentUser.username,
      level,
      rewardAmount: config.reward,
      status: 'Pending' as const,
      rejectionNote: null,
      createdAt: new Date().toISOString(),
      reviewedAt: null,
    }, ...prev]);
  }, [currentUser, levelClaims]);

  const approveLevelClaim = useCallback(async (claimId: string) => {
    const claim = levelClaims.find((c) => c.id === claimId);
    if (!claim || claim.status !== 'Pending') return;
    const user = users.find((u) => u.id === claim.userId);
    if (!user) return;

    const newEarnings = user.availableEarnings + claim.rewardAmount;
    const now = new Date().toISOString();
    const [claimRes, userRes] = await Promise.all([
      supabase.from('referral_level_claims')
        .update({ status: 'Approved', reviewed_at: now })
        .eq('id', claimId),
      supabase.from('users')
        .update({ available_earnings: newEarnings })
        .eq('id', user.id),
    ]);
    if (claimRes.error || userRes.error) { console.error(claimRes.error ?? userRes.error); return; }

    setLevelClaims((prev) => prev.map((c) =>
      c.id === claimId ? { ...c, status: 'Approved' as const, reviewedAt: now } : c
    ));
    setUsers((prev) => prev.map((u) =>
      u.id === user.id ? { ...u, availableEarnings: newEarnings } : u
    ));
  }, [levelClaims, users]);

  const rejectLevelClaim = useCallback(async (claimId: string, note?: string) => {
    const claim = levelClaims.find((c) => c.id === claimId);
    if (!claim || claim.status !== 'Pending') return;
    const now = new Date().toISOString();
    const { error } = await supabase.from('referral_level_claims')
      .update({ status: 'Rejected', rejection_note: note ?? null, reviewed_at: now })
      .eq('id', claimId);
    if (error) { console.error(error); return; }
    setLevelClaims((prev) => prev.map((c) =>
      c.id === claimId ? { ...c, status: 'Rejected' as const, rejectionNote: note ?? null, reviewedAt: now } : c
    ));
  }, [levelClaims]);

  // ── Utilities ─────────────────────────────────────────────────────────────────

  const getUserById = useCallback((userId: string) => users.find((u) => u.id === userId), [users]);

  const getPendingReferrals = useCallback((username: string) => {
    return users
      .filter((u) => u.invitedBy === username && u.activationStatus !== 'Active')
      .map((u) => ({ username: u.username, status: 'pending' as const, createdAt: u.createdAt }));
  }, [users]);

  const getActiveReferrals = useCallback((username: string) => {
    return users
      .filter((u) => u.invitedBy === username && u.activationStatus === 'Active')
      .map((u) => ({ username: u.username, status: 'active' as const, createdAt: u.createdAt }));
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

  const value: GlobalContextType = useMemo(() => ({
    users, submissions, cashoutRequests: cashouts,
    pendingDeposits: deposits,
    currentUserId, viewMode,
    currentUser, isAuthenticated, isAdmin, isProfileActive,
    currentUserAssignments: assignments,
    pendingUserSubmissions, pendingCashoutRequests,
    allSubmissions: submissions,
    levelClaims,
    currentUserLevelClaims,
    approvedLevelCount,
    currentUserBoostPercent,
    taskRestrictionStatus,
    login, signup, logout, selectTier,
    submitDepositProof, approveDeposit, declineDeposit,
    submitAssignment, approveSubmission, rejectSubmission,
    requestCashout, processCashout, rejectCashout,
    addReferral, forceSetTier,
    setViewMode, getUserById, getPendingReferrals, getActiveReferrals,
    refreshCurrentUser, refreshAssignments, refreshAll,
    uploadAvatar,
    claimLevelReward, approveLevelClaim, rejectLevelClaim,
  }), [
    users, submissions, cashouts, deposits, currentUserId, viewMode,
    currentUser, isAuthenticated, isAdmin, isProfileActive,
    assignments, pendingUserSubmissions, pendingCashoutRequests,
    levelClaims, currentUserLevelClaims, approvedLevelCount,
    currentUserBoostPercent, taskRestrictionStatus,
    login, signup, logout, selectTier,
    submitDepositProof, approveDeposit, declineDeposit,
    submitAssignment, approveSubmission, rejectSubmission,
    requestCashout, processCashout, rejectCashout,
    addReferral, forceSetTier,
    setViewMode, getUserById, getPendingReferrals, getActiveReferrals,
    refreshCurrentUser, refreshAssignments, refreshAll,
    uploadAvatar,
    claimLevelReward, approveLevelClaim, rejectLevelClaim,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cosmic-midnight">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-10 h-10 text-neon-pink" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-gray-400">Loading your workspace…</p>
        </div>
      </div>
    );
  }
  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

export function useGlobalState(): GlobalContextType {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error('useGlobalState must be used within a GlobalProvider');
  return ctx;
}
