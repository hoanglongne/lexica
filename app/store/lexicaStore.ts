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
 */

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
    completeTest: (score: number, recommendedLevel: DifficultyLevel) => void;
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

            // Test flow state
            hasSeenWelcome: false,
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

                // Add to learned words set (any word that has been swiped)
                const updatedLearnedWords = new Set(learnedWords);
                updatedLearnedWords.add(cardId);

                // Remove swiped card from deck
                const updatedDeck = currentDeck.filter(card => card.id !== cardId);

                set({
                    userStats: updatedStats,
                    cardProgress: updatedCardProgress,
                    learnedWords: updatedLearnedWords,
                    currentDeck: updatedDeck,
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
                    isInTest: false
                });
            },

            completeTest: (score, recommendedLevel) => {
                set({
                    isInTest: false,
                    testScore: score,
                    recommendedLevel: recommendedLevel
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
                selectedLevel: state.selectedLevel, // Persist user's level choice
                hasSeenWelcome: state.hasSeenWelcome, // Persist welcome screen state
                testScore: state.testScore, // Persist test score
                recommendedLevel: state.recommendedLevel, // Persist recommendation
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
