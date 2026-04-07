import { VOCAB_DATABASE } from '../data/vocabCards';
import { VocabCardData, DifficultyLevel } from '../components/VocabCard';

/**
 * LEXICA ELO ROUTING & ADAPTIVE DIFFICULTY ALGORITHM
 * 
 * CORE CONCEPT:
 * - User starts at ELO 1000 (average)
 * - Each card has ELO 800-1500
 * - Algorithm adapts card difficulty based on recent performance
 * - Goal: Maintain "flow state" (not too easy, not too hard)
 * 
 * PERFORMANCE TRACKING:
 * - Track last 10 swipes (LEFT = struggle, RIGHT = success)
 * - Calculate "struggle rate" (% of LEFT swipes)
 * 
 * DIFFICULTY ADJUSTMENT RULES:
 * 1. High struggle (≥60% LEFT): Too hard → reduce ELO range by 100-200
 * 2. Low struggle (≤20% LEFT): Too easy → increase ELO range by 100-200
 * 3. Balanced (21-59% LEFT): Perfect flow → maintain current range
 * 
 * CARD SELECTION:
 * - Based on user's current ELO ± dynamic range
 * - Exclude recently seen cards (last 20 cards)
 * - Weighted random selection within range (prefer closer to user ELO)
 */

export interface SwipeHistory {
    direction: 'left' | 'right';
    cardId: string;
    timestamp: number;
}

/**
 * Track individual card review progress (Spaced Repetition)
 */
export interface UserCardProgress {
    cardId: string;
    state: 'seed' | 'sprout' | 'gold' | 'mastered';
    lastReviewedAt: number;      // timestamp of last swipe
    nextReviewAt: number;         // when card should appear again
    reviewCount: number;          // total correct swipes (RIGHT)
    wrongCount: number;           // total wrong swipes (LEFT)
}

export interface UserStats {
    currentElo: number;
    totalSwipes: number;
    correctSwipes: number; // RIGHT swipes
    wrongSwipes: number;   // LEFT swipes
    recentSwipes: SwipeHistory[]; // Last 10 swipes
    seenCardIds: string[]; // Last 20 card IDs
}

/**
 * Calculate struggle rate from recent swipes
 * Returns percentage of LEFT swipes (0-100)
 */
export function calculateStruggleRate(recentSwipes: SwipeHistory[]): number {
    if (recentSwipes.length === 0) return 50; // Default: balanced

    const leftCount = recentSwipes.filter(s => s.direction === 'left').length;
    return (leftCount / recentSwipes.length) * 100;
}

/**
 * Determine optimal ELO range based on struggle rate
 * Returns [minElo, maxElo] adjusted from user's current ELO
 */
export function getAdaptiveEloRange(userElo: number, struggleRate: number): [number, number] {
    let range = 200; // Default range: ±200 from user ELO

    if (struggleRate >= 70) {
        // VERY HIGH STRUGGLE: User failing too much
        // Drop difficulty significantly
        range = 150;
        userElo = Math.max(800, userElo - 100); // Lower target ELO
    } else if (struggleRate >= 50) {
        // HIGH STRUGGLE: Challenging but manageable
        // Reduce difficulty slightly
        range = 180;
        userElo = Math.max(800, userElo - 50);
    } else if (struggleRate <= 20) {
        // VERY LOW STRUGGLE: Too easy, user crushing it
        // Increase difficulty significantly
        range = 150;
        userElo = Math.min(1500, userElo + 100); // Raise target ELO
    } else if (struggleRate <= 35) {
        // LOW STRUGGLE: Getting comfortable
        // Increase difficulty slightly
        range = 180;
        userElo = Math.min(1500, userElo + 50);
    }
    // 36-49%: PERFECT FLOW STATE - maintain current range

    const minElo = Math.max(800, userElo - range);
    const maxElo = Math.min(1500, userElo + range);

    return [minElo, maxElo];
}

/**
 * Select next card using weighted random selection
 * Closer cards to user ELO are more likely to be selected
 * 
 * @param selectedLevel - Filter by difficulty level (null/'all' = no filter)
 */
export function selectNextCard(
    userStats: UserStats,
    availableCards: Omit<VocabCardData, 'state'>[],
    selectedLevel?: DifficultyLevel | 'all' | null
): Omit<VocabCardData, 'state'> | null {
    // Filter by level if specified
    let filteredCards = availableCards;
    if (selectedLevel && selectedLevel !== 'all') {
        filteredCards = availableCards.filter(card => card.level === selectedLevel);
    }

    // Filter out recently seen cards
    const unseenCards = filteredCards.filter(
        card => !userStats.seenCardIds.includes(card.id)
    );

    if (unseenCards.length === 0) {
        // If all cards seen, reset seen list and use all filtered cards
        if (filteredCards.length === 0) return null;
        return filteredCards[Math.floor(Math.random() * filteredCards.length)];
    }

    if (unseenCards.length === 0) {
        // If all cards seen, reset seen list and use all cards
        return availableCards[Math.floor(Math.random() * availableCards.length)];
    }

    // Calculate struggle rate
    const struggleRate = calculateStruggleRate(userStats.recentSwipes);

    // Get adaptive ELO range
    const [minElo, maxElo] = getAdaptiveEloRange(userStats.currentElo, struggleRate);

    // Filter cards within ELO range
    const eligibleCards = unseenCards.filter(
        card => card.elo >= minElo && card.elo <= maxElo
    );

    if (eligibleCards.length === 0) {
        // Fallback: pick any unseen card
        return unseenCards[Math.floor(Math.random() * unseenCards.length)];
    }

    // Weighted selection: cards closer to user ELO are preferred
    const weights = eligibleCards.map(card => {
        const distance = Math.abs(card.elo - userStats.currentElo);
        // Inverse weight: closer = higher weight
        return 1 / (distance + 1);
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < eligibleCards.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return eligibleCards[i];
        }
    }

    // Fallback
    return eligibleCards[0];
}

/**
 * Generate initial card deck (10 cards)
 * Prioritizes due cards for review, then fills with new cards
 * 
 * Deck composition:
 * - Priority 1: Cards due for review (from cardProgress)
 * - Priority 2: New cards based on ELO routing
 * 
 * @param selectedLevel - Filter cards by difficulty level
 */
export function generateInitialDeck(
    userStats: UserStats,
    cardProgress: Record<string, UserCardProgress>,
    selectedLevel?: DifficultyLevel | 'all' | null
): VocabCardData[] {
    const deck: VocabCardData[] = [];
    const DECK_SIZE = 10;

    // Filter database by level if specified
    const filteredDatabase = (selectedLevel && selectedLevel !== 'all')
        ? VOCAB_DATABASE.filter(card => card.level === selectedLevel)
        : VOCAB_DATABASE;

    // Step 1: Get all due cards
    const dueCardProgresses = getDueCards(cardProgress);

    // Step 2: Add due cards to deck (up to DECK_SIZE)
    // Only include due cards that match the selected level filter
    for (const progress of dueCardProgresses) {
        if (deck.length >= DECK_SIZE) break;

        // Find card in database
        const cardData = filteredDatabase.find((c: Omit<VocabCardData, 'state'>) => c.id === progress.cardId);
        if (cardData) {
            deck.push({
                ...cardData,
                state: progress.state, // Use saved state
            });

            // Add to seen list
            userStats.seenCardIds.push(cardData.id);
            if (userStats.seenCardIds.length > 20) {
                userStats.seenCardIds.shift();
            }
        }
    }

    // Step 3: Fill remaining slots with new cards (ELO-based)
    while (deck.length < DECK_SIZE) {
        const nextCard = selectNextCard(userStats, filteredDatabase, selectedLevel);
        if (!nextCard) break; // No more cards available

        // Check if card has existing progress
        const progress = cardProgress[nextCard.id];

        deck.push({
            ...nextCard,
            state: progress?.state || 'seed', // Use saved state or default to seed
        });

        // Add to seen list
        userStats.seenCardIds.push(nextCard.id);
        if (userStats.seenCardIds.length > 20) {
            userStats.seenCardIds.shift();
        }
    }

    return deck;
}

/**
 * Update user ELO based on swipe result
 * Simple implementation: +5 for RIGHT, -3 for LEFT
 */
export function updateUserElo(currentElo: number, swipeDirection: 'left' | 'right'): number {
    if (swipeDirection === 'right') {
        return Math.min(1500, currentElo + 5);
    } else {
        return Math.max(800, currentElo - 3);
    }
}

/**
 * Add swipe to history and update stats
 */
export function recordSwipe(
    userStats: UserStats,
    cardId: string,
    direction: 'left' | 'right'
): UserStats {
    const swipeHistory: SwipeHistory = {
        direction,
        cardId,
        timestamp: Date.now(),
    };

    // Update recent swipes (keep last 10)
    const recentSwipes = [...userStats.recentSwipes, swipeHistory].slice(-10);

    // Update counters
    const totalSwipes = userStats.totalSwipes + 1;
    const correctSwipes = direction === 'right' ? userStats.correctSwipes + 1 : userStats.correctSwipes;
    const wrongSwipes = direction === 'left' ? userStats.wrongSwipes + 1 : userStats.wrongSwipes;

    // Update user ELO
    const currentElo = updateUserElo(userStats.currentElo, direction);

    return {
        ...userStats,
        currentElo,
        totalSwipes,
        correctSwipes,
        wrongSwipes,
        recentSwipes,
    };
}

/**
 * Debug helper: Get difficulty analysis
 */
export function getDifficultyAnalysis(userStats: UserStats): {
    struggleRate: number;
    eloRange: [number, number];
    status: 'very-hard' | 'challenging' | 'too-easy' | 'easy' | 'perfect';
    message: string;
} {
    const struggleRate = calculateStruggleRate(userStats.recentSwipes);
    const eloRange = getAdaptiveEloRange(userStats.currentElo, struggleRate);

    let status: 'very-hard' | 'challenging' | 'too-easy' | 'easy' | 'perfect';
    let message = '';

    if (struggleRate >= 70) {
        status = 'very-hard';
        message = 'Very Hard - Reducing difficulty significantly';
    } else if (struggleRate >= 50) {
        status = 'challenging';
        message = 'Challenging - Lowering difficulty slightly';
    } else if (struggleRate <= 20) {
        status = 'too-easy';
        message = 'Too Easy - Increasing difficulty significantly';
    } else if (struggleRate <= 35) {
        status = 'easy';
        message = 'Easy - Raising difficulty slightly';
    } else {
        status = 'perfect';
        message = 'Perfect Flow State - Maintaining balance';
    }

    return { struggleRate, eloRange, status, message };
}

/**
 * ============================================
 * SPACED REPETITION SYSTEM (SRS) FUNCTIONS
 * ============================================
 */

/**
 * Calculate next review timestamp based on card state
 * Review intervals:
 * - seed → 1 day
 * - sprout → 3 days
 * - gold → 7 days
 * - mastered → 14 days
 */
export function calculateNextReview(state: 'seed' | 'sprout' | 'gold' | 'mastered'): number {
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    const intervals = {
        seed: 1 * DAY_MS,      // 1 day
        sprout: 3 * DAY_MS,    // 3 days
        gold: 7 * DAY_MS,      // 7 days
        mastered: 14 * DAY_MS, // 14 days
    };

    return now + intervals[state];
}

/**
 * Update card progress after swipe
 */
export function updateCardProgress(
    existingProgress: UserCardProgress | undefined,
    cardId: string,
    direction: 'left' | 'right'
): UserCardProgress {
    const now = Date.now();

    // If card never seen before, create new progress
    if (!existingProgress) {
        const newState: 'seed' | 'sprout' | 'gold' | 'mastered' = 'seed';
        return {
            cardId,
            state: newState,
            lastReviewedAt: now,
            nextReviewAt: calculateNextReview(newState),
            reviewCount: direction === 'right' ? 1 : 0,
            wrongCount: direction === 'left' ? 1 : 0,
        };
    }

    // Update existing progress
    const reviewCount = direction === 'right' ? existingProgress.reviewCount + 1 : existingProgress.reviewCount;
    const wrongCount = direction === 'left' ? existingProgress.wrongCount + 1 : existingProgress.wrongCount;

    // Determine new state based on swipe direction
    let newState = existingProgress.state;

    if (direction === 'right') {
        // Advance state on correct swipe
        if (existingProgress.state === 'seed' && reviewCount >= 1) {
            newState = 'sprout';
        } else if (existingProgress.state === 'sprout' && reviewCount >= 2) {
            newState = 'gold';
        } else if (existingProgress.state === 'gold' && reviewCount >= 3) {
            newState = 'mastered';
        }
    } else {
        // Reset to seed on wrong swipe
        newState = 'seed';
    }

    return {
        cardId,
        state: newState,
        lastReviewedAt: now,
        nextReviewAt: calculateNextReview(newState),
        reviewCount,
        wrongCount,
    };
}

/**
 * Check if card is due for review
 */
export function isCardDue(progress: UserCardProgress | undefined): boolean {
    if (!progress) return false; // Never seen = not due, it's new
    return Date.now() >= progress.nextReviewAt;
}

/**
 * Get all cards that are due for review
 */
export function getDueCards(
    cardProgress: Record<string, UserCardProgress>
): UserCardProgress[] {
    return Object.values(cardProgress).filter(isCardDue);
}

/**
 * Count cards by state
 */
export function getProgressStats(cardProgress: Record<string, UserCardProgress>): {
    total: number;
    seed: number;
    sprout: number;
    gold: number;
    mastered: number;
    dueToday: number;
} {
    const stats = {
        total: 0,
        seed: 0,
        sprout: 0,
        gold: 0,
        mastered: 0,
        dueToday: 0,
    };

    Object.values(cardProgress).forEach(progress => {
        stats.total++;
        stats[progress.state]++;
        if (isCardDue(progress)) {
            stats.dueToday++;
        }
    });

    return stats;
}
