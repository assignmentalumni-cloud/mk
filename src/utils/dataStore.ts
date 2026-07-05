import type { Assignment } from '../types';
import { ACADEMIC_TOPICS, getTopicsForUser } from '../data/academicTopics';

// Export topics for reference
export { ACADEMIC_TOPICS };

// Convert 500 topics array to the expected format with IDs
export const ASSIGNMENT_TITLES = ACADEMIC_TOPICS.map((title, index) => ({
  id: `topic-${String(index + 1).padStart(3, '0')}`,
  title,
}));

export function generateUniqueAssignmentId(): string {
  return `#AA-${9000 + Math.floor(Math.random() * 999)}`;
}

export function generateUniqueSubId(): string {
  return `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateUniqueRequestId(): string {
  return `cashout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateAssignmentsForUser(
  userId: string,
  depositTier: number,
  completedTopicIds: string[]
): Assignment[] {
  const payout = 1.70; // Flat $1.70 for both tiers
  const count = depositTier === 2 ? 2 : 1;

  // Get deterministic topics for user based on current day
  const todaysTopics = getTopicsForUser(userId, count);

  return todaysTopics.map((title, index) => ({
    id: generateUniqueAssignmentId(),
    topicId: `topic-${String(ACADEMIC_TOPICS.indexOf(title) + 1).padStart(3, '0')}`,
    topicTitle: title,
    payout,
    status: 'Available' as const,
  }));
}
