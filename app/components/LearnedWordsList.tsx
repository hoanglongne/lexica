'use client';

import { useMemo, useCallback } from 'react';
import { HandHeart, Sprout, Leaf, Sparkles, Trophy, Volume2 } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { VOCAB_DATABASE } from '../data/vocabCards';

function formatNextReview(nextReviewAt?: number, isMastered?: boolean) {
    if (isMastered) {
        return 'Mastered';
    }

    if (!nextReviewAt) {
        return 'Chưa có lịch ôn';
    }

    const nextReviewDate = new Date(nextReviewAt);
    const now = new Date();
    const isToday = nextReviewDate.toDateString() === now.toDateString();

    if (nextReviewAt <= now.getTime()) {
        return 'Ôn lại: Hôm nay';
    }

    if (isToday) {
        return `Ôn lại: ${nextReviewDate.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        })}`;
    }

    return `Ôn lại: ${nextReviewDate.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })}`;
}

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
                <div className="text-slate-500 text-center py-8 flex flex-col items-center gap-2">
                    <HandHeart className="w-8 h-8" />
                    <p>Chưa học từ nào. Bắt đầu swipe thôi!</p>
                </div>
            ) : (
                learnedCards.map(card => {
                    if (!card) return null;

                    const StateIcon = {
                        seed: Sprout,
                        sprout: Leaf,
                        gold: Sparkles,
                        mastered: Trophy,
                    }[card.progress?.state || 'seed'];

                    const stateColor = {
                        seed: 'text-green-400',
                        sprout: 'text-cyan-400',
                        gold: 'text-yellow-400',
                        mastered: 'text-yellow-400',
                    }[card.progress?.state || 'seed'];

                    const reviewLabel = formatNextReview(
                        card.progress?.nextReviewAt,
                        card.progress?.state === 'mastered'
                    );

                    return (
                        <div
                            key={card.id}
                            className="p-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 bg-slate-700/50 rounded">
                                        <StateIcon className={`w-4 h-4 ${stateColor}`} />
                                    </div>
                                    <span className="font-semibold text-slate-200">{card.word}</span>
                                    <button
                                        onClick={() => speakWord(card.word)}
                                        className="text-slate-500 hover:text-cyan-400 transition-colors p-1"
                                        title="Nghe phát âm"
                                    >
                                        <Volume2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <span className="text-xs text-slate-500 font-mono">ELO {card.elo}</span>
                            </div>
                            {card.ipa && (
                                <p className="text-xs text-slate-500 font-mono mb-1">/{card.ipa}/</p>
                            )}
                            <p className="text-sm text-slate-400">{card.translationHint}</p>
                            <div className="mt-2 flex items-center justify-between gap-3">
                                <span className={`text-xs font-medium ${card.progress?.state === 'mastered' ? 'text-yellow-400' : 'text-slate-500'}`}>
                                    {reviewLabel}
                                </span>
                                {card.progress && card.progress.state !== 'mastered' && (
                                    <span className="text-[11px] uppercase tracking-wide text-amber-300 bg-amber-400/10 border border-amber-300/15 px-2 py-1 rounded-full">
                                        Ôn tập
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
