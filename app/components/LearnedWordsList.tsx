'use client';

import { useMemo, useCallback } from 'react';
import { useLexicaStore } from '../store/lexicaStore';
import { VOCAB_DATABASE } from '../data/vocabCards';

export default function LearnedWordsList() {
    // Subscribe to size changes only
    const learnedWordsSize = useLexicaStore(state => state.learnedWords.size);
    const cardProgress = useLexicaStore(state => state.cardProgress);

    // Memoize the array conversion - only recalculate when size changes
    const learnedWords = useMemo(() => {
        return useLexicaStore.getState().getLearnedWordsList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [learnedWordsSize]);

    // Get full card data for learned words
    const learnedCards = useMemo(() => {
        return learnedWords
            .map(cardId => {
                const card = VOCAB_DATABASE.find(c => c.id === cardId);
                const progress = cardProgress[cardId];
                return card ? { ...card, progress } : null;
            })
            .filter(Boolean)
            .sort((a, b) => {
                // Sort by state: mastered > gold > sprout > seed
                const stateOrder = { mastered: 0, gold: 1, sprout: 2, seed: 3 };
                return (stateOrder[a!.progress?.state || 'seed'] || 999) - (stateOrder[b!.progress?.state || 'seed'] || 999);
            });
    }, [learnedWords, cardProgress]);

    const speakWord = useCallback((word: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        }
    }, []);

    return (
        <div className="space-y-2">
            {learnedCards.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                    Chưa học từ nào. Bắt đầu swipe thôi! 👆
                </p>
            ) : (
                learnedCards.map(card => {
                    if (!card) return null;
                    const stateEmoji = {
                        seed: '🌱',
                        sprout: '🌿',
                        gold: '✨',
                        mastered: '🏆',
                    }[card.progress?.state || 'seed'];

                    return (
                        <div
                            key={card.id}
                            className="p-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{stateEmoji}</span>
                                    <span className="font-semibold text-slate-200">{card.word}</span>
                                    <button
                                        onClick={() => speakWord(card.word)}
                                        className="text-slate-500 hover:text-cyan-400 transition-colors"
                                    >
                                        🔊
                                    </button>
                                </div>
                                <span className="text-xs text-slate-500">ELO {card.elo}</span>
                            </div>
                            {card.ipa && (
                                <p className="text-xs text-slate-500 font-mono mb-1">/{card.ipa}/</p>
                            )}
                            <p className="text-sm text-slate-400">{card.translationHint}</p>
                        </div>
                    );
                })
            )}
        </div>
    );
}
