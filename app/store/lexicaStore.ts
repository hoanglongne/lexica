import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VocabCardData, DifficultyLevel } from '../components/VocabCard';
import { UserStats, UserCardProgress, recordSwipe, generateInitialDeck, updateCardProgress } from '../lib/eloAlgorithm';
import { getStoryCatchUpWordIds, getUnlockableStory } from '../data/stories';

/**
 * LEXICA Global State Store (Zustand + localStorage persistence)
 * 
 * Manages:
 * - User stats (ELO, swipe history, energy)
 * - Current card deck
 * - Energy system (30 max, resets at midnight)
 * - Selected difficulty level
 * - Story Mode progress
 * - Study history (for charts & analytics)
 */

// Study History Entry (per day)
interface StudyHistoryEntry {
    swipes: number;       // Total swipes that day
    correct: number;      // Swipes right (remember)
    wrong: number;        // Swipes left (forget)
    eloChange: number;    // Net ELO change that day
}

interface LexicaStore {
    // User Stats
    userStats: UserStats;

    // Card Progress (Spaced Repetition)
    cardProgress: Record<string, UserCardProgress>; // { "v001": {...}, "v002": {...} }

    // Learned Words (words user has seen and practiced)
    learnedWords: Set<string>; // Set of card IDs that have been learned

    // Energy System
    energy: number;
    maxEnergy: number;
    lastEnergyReset: number; // Timestamp of last midnight reset

    // Current Deck
    currentDeck: VocabCardData[];

    // Difficulty Level Selection
    selectedLevel: DifficultyLevel | 'all' | null; // null = not selected yet

    // Level Test Flow
    hasSeenWelcome: boolean; // Has user seen the welcome screen
    isInTest: boolean; // Currently taking the test
    testScore: number | null; // Test score (0-5)
    recommendedLevel: DifficultyLevel | null; // AI recommended level from test

    // Story Mode
    unlockedStories: string[]; // IDs of stories user has unlocked
    readStories: string[]; // IDs of stories user has read
    currentStoryId: string | null; // Currently viewing story
    showStoryUnlock: boolean; // Show "Story Unlocked!" modal
    showStoryMode: boolean; // Show story reading screen

    // Streak
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string | null; // 'YYYY-MM-DD'

    // Highest ELO (peak rating)
    highestElo: number;

    // Study History (for analytics)
    studyHistory: Record<string, StudyHistoryEntry>; // { '2026-04-15': {...}, ... }

    // Onboarding
    hasSeenOnboarding: boolean;
    completeOnboarding: () => void;

    // Swipe Mode
    swipeMode: 'touch' | 'voice';
    setSwipeMode: (mode: 'touch' | 'voice') => void;

    // Actions
    swipeCard: (cardId: string, direction: 'left' | 'right') => void;
    consumeEnergy: () => boolean; // Returns false if not enough energy
    checkAndResetEnergy: () => void; // Check if midnight passed, reset if needed
    loadNewDeck: () => void;
    resetProgress: () => void; // Debug: reset everything
    setSelectedLevel: (level: DifficultyLevel | 'all' | null) => void; // Set difficulty level

    // Test flow actions
    startTest: () => void;
    skipToManual: () => void;
    completeTest: (score: number, recommendedLevel: DifficultyLevel, calibratedElo?: number) => void;
    acceptRecommendedLevel: () => void;

    // Story Mode actions
    checkStoryUnlock: () => void; // Check if user should unlock a new story
    openStoryUnlockModal: (storyId: string) => void;
    closeStoryUnlockModal: () => void;
    openStory: (storyId: string) => void;
    closeStory: () => void;
    markStoryAsRead: (storyId: string) => void;

    // Helpers
    getLearnedWordsCount: () => number;
    getLearnedWordsList: () => string[];
    getMasteredWordsCount: () => number;
    getStudyStats: () => { totalDays: number; totalSwipes: number; averageAccuracy: number; last30Days: Array<{ date: string; swipes: number; accuracy: number; eloChange: number }> };

    // Review Session
    submitReviewAnswer: (cardId: string, correct: boolean) => void;

    // Mastered action
    markAsMastered: (cardId: string) => void;
}

const INITIAL_USER_STATS: UserStats = {
    currentElo: 1000,
    totalSwipes: 0,
    correctSwipes: 0,
    wrongSwipes: 0,
    recentSwipes: [],
    seenCardIds: [],
};

/**
 * Get today's date as 'YYYY-MM-DD' in local time
 */
function getTodayDateString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Get yesterday's date as 'YYYY-MM-DD' in local time
 */
function getYesterdayDateString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
}

/**
 * Get midnight timestamp for today
 */
function getMidnightTimestamp(): number {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    return midnight.getTime();
}

/**
 * Check if energy should reset (new day)
 */
function shouldResetEnergy(lastResetTimestamp: number): boolean {
    const currentMidnight = getMidnightTimestamp();
    return lastResetTimestamp < currentMidnight;
}

// ============================================
// MOCK DATA GENERATOR (TEMPORARY - FOR TESTING)
// ============================================
function generateMockStudyHistory(): Record<string, StudyHistoryEntry> {
    const history: Record<string, StudyHistoryEntry> = {};
    const today = new Date();

    // Generate 100 days of mock data
    for (let i = 99; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        // Random activity with some variance
        const swipes = Math.floor(Math.random() * 25) + 5; // 5-30 swipes
        const correctRate = 0.6 + Math.random() * 0.3; // 60-90% accuracy
        const correct = Math.floor(swipes * correctRate);
        const wrong = swipes - correct;

        // ELO change varies (-20 to +30)
        const eloChange = Math.floor(Math.random() * 50) - 20;

        history[dateString] = {
            swipes,
            correct,
            wrong,
            eloChange,
        };
    }

    return history;
}

export const useLexicaStore = create<LexicaStore>()(
    persist(
        (set, get) => ({
            // Initial state
            userStats: INITIAL_USER_STATS,
            cardProgress: {}, // Empty at start, will populate as user learns
            learnedWords: new Set<string>(), // Empty set at start
            energy: 30,
            maxEnergy: 30,
            lastEnergyReset: getMidnightTimestamp(),
            currentDeck: [],
            selectedLevel: null, // User hasn't selected level yet
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: null,
            highestElo: 1000, // Initialize with starting ELO
            studyHistory: generateMockStudyHistory(), // MOCK DATA - Replace with {} for production
            swipeMode: 'touch',
            setSwipeMode: (mode) => set({ swipeMode: mode }),

            completeOnboarding: () => set({ hasSeenOnboarding: true }),

            // Test flow state
            hasSeenWelcome: false,
            hasSeenOnboarding: false,
            isInTest: false,
            testScore: null,
            recommendedLevel: null,

            // Story Mode state
            unlockedStories: [],
            readStories: [],
            currentStoryId: null,
            showStoryUnlock: false,
            showStoryMode: false,


            // Swipe card action
            swipeCard: (cardId, direction) => {
                const { userStats, cardProgress, currentDeck, learnedWords } = get();

                // Update user stats
                const updatedStats = recordSwipe(userStats, cardId, direction);

                // Update card progress (SRS)
                const existingProgress = cardProgress[cardId];
                const updatedProgress = updateCardProgress(existingProgress, cardId, direction);
                const updatedCardProgress = {
                    ...cardProgress,
                    [cardId]: updatedProgress,
                };

                // Only count as "learned" when user swipes Right (Nhớ)
                const updatedLearnedWords = new Set(learnedWords);
                if (direction === 'right') {
                    updatedLearnedWords.add(cardId);
                }

                // Remove swiped card from deck
                const updatedDeck = currentDeck.filter(card => card.id !== cardId);

                // Update streak
                const today = getTodayDateString();
                const { currentStreak, longestStreak, lastActivityDate, studyHistory } = get();
                let streakUpdate = {};
                if (lastActivityDate !== today) {
                    const yesterday = getYesterdayDateString();
                    const newStreak = lastActivityDate === yesterday ? currentStreak + 1 : 1;
                    streakUpdate = {
                        currentStreak: newStreak,
                        longestStreak: Math.max(longestStreak, newStreak),
                        lastActivityDate: today,
                    };
                }

                // Update study history (for analytics)
                const todayEntry = studyHistory[today] || { swipes: 0, correct: 0, wrong: 0, eloChange: 0 };
                const eloChange = updatedStats.currentElo - userStats.currentElo;
                const updatedStudyHistory = {
                    ...studyHistory,
                    [today]: {
                        swipes: todayEntry.swipes + 1,
                        correct: todayEntry.correct + (direction === 'right' ? 1 : 0),
                        wrong: todayEntry.wrong + (direction === 'left' ? 1 : 0),
                        eloChange: todayEntry.eloChange + eloChange,
                    },
                };

                // Track highest ELO
                const { highestElo } = get();
                const newHighestElo = Math.max(highestElo, updatedStats.currentElo);

                set({
                    userStats: updatedStats,
                    cardProgress: updatedCardProgress,
                    learnedWords: updatedLearnedWords,
                    currentDeck: updatedDeck,
                    studyHistory: updatedStudyHistory,
                    highestElo: newHighestElo,
                    ...streakUpdate,
                });

                // Check if user should unlock a story (every 10 words)
                get().checkStoryUnlock();

                // If deck is empty, load new deck
                if (updatedDeck.length === 0) {
                    get().loadNewDeck();
                }
            },

            // Consume energy for swipe
            consumeEnergy: () => {
                const { energy } = get();

                if (energy <= 0) {
                    return false; // Not enough energy
                }

                set({ energy: energy - 1 });
                return true;
            },

            // Check and reset energy at midnight
            checkAndResetEnergy: () => {
                const { lastEnergyReset, maxEnergy } = get();

                if (shouldResetEnergy(lastEnergyReset)) {
                    set({
                        energy: maxEnergy,
                        lastEnergyReset: getMidnightTimestamp(),
                    });
                }
            },

            // Load new deck
            loadNewDeck: () => {
                const { userStats, cardProgress, selectedLevel, learnedWords } = get();
                const learnedWordIds = Array.from(learnedWords);

                // If any story pack is at 7-9/10, inject missing words regardless of ELO.
                const forcedCardIds = getStoryCatchUpWordIds(learnedWordIds, 3);
                const newDeck = generateInitialDeck(userStats, cardProgress, selectedLevel, forcedCardIds);

                set({ currentDeck: newDeck });
            },

            // Reset all progress (debug only)
            resetProgress: () => {
                set({
                    userStats: INITIAL_USER_STATS,
                    cardProgress: {},
                    learnedWords: new Set<string>(),
                    energy: 30,
                    lastEnergyReset: getMidnightTimestamp(),
                    currentDeck: [],
                    selectedLevel: null, // Reset level selection
                    hasSeenWelcome: false, // Reset welcome screen
                    isInTest: false,
                    testScore: null,
                    recommendedLevel: null,
                    // Reset Story Mode state
                    unlockedStories: [],
                    readStories: [],
                    currentStoryId: null,
                    showStoryUnlock: false,
                    showStoryMode: false,
                    // Reset streak
                    currentStreak: 0,
                    longestStreak: 0,
                    lastActivityDate: null,
                });
            },

            // Set selected difficulty level
            setSelectedLevel: (level) => {
                set({ selectedLevel: level });
                // Reload deck with new level filter
                get().loadNewDeck();
            },

            // Test flow actions
            startTest: () => {
                set({
                    hasSeenWelcome: true,
                    isInTest: true
                });
            },

            skipToManual: () => {
                set({
                    hasSeenWelcome: true,
                    isInTest: false,
                    testScore: null,
                    recommendedLevel: null
                });
            },

            completeTest: (score, recommendedLevel, calibratedElo) => {
                const { userStats } = get();
                set({
                    isInTest: false,
                    testScore: score,
                    recommendedLevel: recommendedLevel,
                    ...(calibratedElo !== undefined && {
                        userStats: { ...userStats, currentElo: calibratedElo },
                    }),
                });
            },

            acceptRecommendedLevel: () => {
                const { recommendedLevel } = get();
                if (recommendedLevel) {
                    get().setSelectedLevel(recommendedLevel);
                }
            },

            // Helper: Get count of learned words
            getLearnedWordsCount: () => {
                return get().learnedWords.size;
            },

            // Helper: Get list of learned word IDs
            getLearnedWordsList: () => {
                return Array.from(get().learnedWords);
            },

            // Helper: Get count of mastered words (cards with state = 'mastered' or high confidence)
            getMasteredWordsCount: () => {
                const { cardProgress } = get();
                return Object.values(cardProgress).filter(
                    progress => progress.state === 'mastered'
                ).length;
            },

            // Helper: Get study statistics for analytics
            getStudyStats: () => {
                const { studyHistory } = get();
                const dates = Object.keys(studyHistory).sort();

                // Calculate totals
                const totalDays = dates.length;
                let totalSwipes = 0;
                let totalCorrect = 0;

                for (const date of dates) {
                    const entry = studyHistory[date];
                    totalSwipes += entry.swipes;
                    totalCorrect += entry.correct;
                }

                const averageAccuracy = totalSwipes > 0 ? Math.round((totalCorrect / totalSwipes) * 100) : 0;

                // Get last 30 days
                const last30Days = dates.slice(-30).map(date => {
                    const entry = studyHistory[date];
                    const accuracy = entry.swipes > 0 ? Math.round((entry.correct / entry.swipes) * 100) : 0;
                    return {
                        date,
                        swipes: entry.swipes,
                        accuracy,
                        eloChange: entry.eloChange,
                    };
                });

                return {
                    totalDays,
                    totalSwipes,
                    averageAccuracy,
                    last30Days,
                };
            },

            submitReviewAnswer: (cardId, correct) => {
                const { cardProgress, studyHistory } = get();
                const existing = cardProgress[cardId];
                if (!existing) return;
                const updated = updateCardProgress(existing, cardId, correct ? 'right' : 'left');

                // Update study history for review sessions
                const today = getTodayDateString();
                const todayEntry = studyHistory[today] || { swipes: 0, correct: 0, wrong: 0, eloChange: 0 };
                const updatedStudyHistory = {
                    ...studyHistory,
                    [today]: {
                        ...todayEntry,
                        swipes: todayEntry.swipes + 1,
                        correct: todayEntry.correct + (correct ? 1 : 0),
                        wrong: todayEntry.wrong + (correct ? 0 : 1),
                        // Review doesn't change ELO, so eloChange stays the same
                    },
                };

                set({
                    cardProgress: { ...cardProgress, [cardId]: updated },
                    studyHistory: updatedStudyHistory,
                });
            },

            markAsMastered: (cardId) => {
                const { cardProgress, learnedWords, currentDeck } = get();
                const now = Date.now();

                // Set card to mastered state immediately
                const updatedCardProgress = {
                    ...cardProgress,
                    [cardId]: {
                        cardId,
                        state: 'mastered' as const,
                        lastReviewedAt: now,
                        nextReviewAt: now + (30 * 24 * 60 * 60 * 1000), // Review in 30 days
                        reviewCount: (cardProgress[cardId]?.reviewCount || 0) + 1,
                        wrongCount: cardProgress[cardId]?.wrongCount || 0,
                    },
                };

                // Add to learned words
                const updatedLearnedWords = new Set(learnedWords);
                updatedLearnedWords.add(cardId);

                // Remove from deck
                const updatedDeck = currentDeck.filter(card => card.id !== cardId);

                set({
                    cardProgress: updatedCardProgress,
                    learnedWords: updatedLearnedWords,
                    currentDeck: updatedDeck,
                });

                // Load new deck if empty
                if (updatedDeck.length === 0) {
                    get().loadNewDeck();
                }
            },

            // Story Mode: Check if user should unlock a new story
            checkStoryUnlock: () => {
                const { learnedWords, unlockedStories } = get();
                const learnedWordsList = Array.from(learnedWords);

                const availableStory = getUnlockableStory(learnedWordsList, unlockedStories);

                if (availableStory) {
                    get().openStoryUnlockModal(availableStory.id);
                }
            },

            openStoryUnlockModal: (storyId) => {
                set({
                    currentStoryId: storyId,
                    showStoryUnlock: true,
                    unlockedStories: [...get().unlockedStories, storyId],
                });
            },

            closeStoryUnlockModal: () => {
                set({ showStoryUnlock: false });
            },

            openStory: (storyId) => {
                set({
                    currentStoryId: storyId,
                    showStoryMode: true,
                    showStoryUnlock: false,
                });
            },

            closeStory: () => {
                set({
                    showStoryMode: false,
                    currentStoryId: null,
                });
            },

            markStoryAsRead: (storyId) => {
                const { readStories } = get();
                if (!readStories.includes(storyId)) {
                    set({
                        readStories: [...readStories, storyId],
                    });
                }
            },
        }),
        {
            name: 'lexica-storage', // localStorage key
            partialize: (state) => ({
                // Only persist these fields
                userStats: state.userStats,
                cardProgress: state.cardProgress, // Persist SRS progress
                learnedWords: Array.from(state.learnedWords), // Convert Set to Array for JSON
                energy: state.energy,
                lastEnergyReset: state.lastEnergyReset,
                swipeMode: state.swipeMode, // Persist voice/touch preference
                selectedLevel: state.selectedLevel, // Persist user's level choice
                hasSeenWelcome: state.hasSeenWelcome, // Persist welcome screen state
                hasSeenOnboarding: state.hasSeenOnboarding,
                testScore: state.testScore, // Persist test score
                recommendedLevel: state.recommendedLevel, // Persist recommendation
                // Streak persistence
                currentStreak: state.currentStreak,
                longestStreak: state.longestStreak,
                lastActivityDate: state.lastActivityDate,
                // Highest ELO
                highestElo: state.highestElo,
                // Story Mode persistence
                unlockedStories: state.unlockedStories,
                readStories: state.readStories,
                // Don't persist currentDeck (will be regenerated)
                // Don't persist isInTest (transient state)
                // Don't persist showStoryUnlock, showStoryMode (transient UI state)
            }),
            // Custom merge to handle Set serialization
            merge: (persistedState: unknown, currentState) => {
                const persisted = persistedState as Partial<LexicaStore> & { learnedWords?: string[] | Set<string> };
                return {
                    ...currentState,
                    ...persisted,
                    learnedWords: new Set(
                        Array.isArray(persisted?.learnedWords)
                            ? persisted.learnedWords
                            : persisted?.learnedWords instanceof Set
                                ? Array.from(persisted.learnedWords)
                                : []
                    ),
                };
            },
        }
    )
);

/**
 * Initialize store on app load
 * Call this in root layout or main component
 */
export function initializeLexicaStore() {
    const store = useLexicaStore.getState();

    // Check and reset energy if new day
    store.checkAndResetEnergy();

    // Load initial deck if empty
    if (store.currentDeck.length === 0) {
        store.loadNewDeck();
    }
}
