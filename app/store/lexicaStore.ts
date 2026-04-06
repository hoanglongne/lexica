import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VocabCardData } from '../components/VocabCard';
import { UserStats, UserCardProgress, recordSwipe, generateInitialDeck, updateCardProgress } from '../lib/eloAlgorithm';

/**
 * LEXICA Global State Store (Zustand + localStorage persistence)
 * 
 * Manages:
 * - User stats (ELO, swipe history, energy)
 * - Current card deck
 * - Energy system (30 max, resets at midnight)
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

    // Actions
    swipeCard: (cardId: string, direction: 'left' | 'right') => void;
    consumeEnergy: () => boolean; // Returns false if not enough energy
    checkAndResetEnergy: () => void; // Check if midnight passed, reset if needed
    loadNewDeck: () => void;
    resetProgress: () => void; // Debug: reset everything

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

                // If deck is empty, load new deck (Story Mode trigger point)
                if (updatedDeck.length === 0) {
                    // Note: Phase 5 will add Story Mode UI here
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
                const { userStats, cardProgress } = get();
                const newDeck = generateInitialDeck(userStats, cardProgress);

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
                });
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
                // Don't persist currentDeck (will be regenerated)
            }),
            // Custom merge to handle Set serialization
            merge: (persistedState: any, currentState) => {
                return {
                    ...currentState,
                    ...persistedState,
                    // Convert Array back to Set
                    learnedWords: new Set(persistedState?.learnedWords || []),
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
