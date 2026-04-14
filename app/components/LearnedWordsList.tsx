'use client';

import { useMemo, useCallback, useState } from 'react';
import { HandHeart, Sprout, Leaf, Sparkles, Trophy, Volume2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { VOCAB_DATABASE } from '../data/vocabCards';
import { type VocabCardData as BaseCardData } from './VocabCard';
import { type UserCardProgress } from '../lib/eloAlgorithm';

type CardWithProgress = Omit<BaseCardData, 'state'> & { progress?: UserCardProgress };

const PAGE_SIZE = 10;

const STATE_ICON = { seed: Sprout, sprout: Leaf, gold: Sparkles, mastered: Trophy } as const;
const STATE_COLOR = { seed: 'text-green-400', sprout: 'text-cyan-400', gold: 'text-yellow-400', mastered: 'text-yellow-400' } as const;
const STATE_LABEL = { seed: 'Đang học', sprout: 'Đang nhớ', gold: 'Thuộc tốt', mastered: 'Thành thạo' } as const;
const LEVEL_LABEL: Record<string, string> = { beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao', expert: 'Chuyên gia' };
const LEVEL_COLOR: Record<string, string> = {
    beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    intermediate: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    advanced: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    expert: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
};

function formatNextReviewFull(nextReviewAt?: number, isMastered?: boolean) {
    if (isMastered) return 'Đã thành thạo';
    if (!nextReviewAt) return 'Chưa có lịch ôn';
    const nextReviewDate = new Date(nextReviewAt);
    const now = new Date();
    if (nextReviewAt <= now.getTime()) return 'Cần ôn ngay hôm nay';
    if (nextReviewDate.toDateString() === now.toDateString()) {
        return `Ôn lại lúc ${nextReviewDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `Ôn lại ${nextReviewDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
}

function formatNextReview(nextReviewAt?: number, isMastered?: boolean) {
    if (isMastered) return 'Mastered';
    if (!nextReviewAt) return 'Chưa có lịch ôn';
    const nextReviewDate = new Date(nextReviewAt);
    const now = new Date();
    if (nextReviewAt <= now.getTime()) return 'Hôm nay';
    if (nextReviewDate.toDateString() === now.toDateString()) {
        return nextReviewDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    return nextReviewDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function highlightWord(sentence: string, word: string) {
    const regex = new RegExp(`(${word})`, 'gi');
    const parts = sentence.split(regex);
    return parts.map((part, i) =>
        regex.test(part)
            ? <span key={i} className="text-cyan-300 font-bold">{part}</span>
            : <span key={i}>{part}</span>
    );
}

function WordDetailModal({ card, onClose }: { card: CardWithProgress; onClose: () => void }) {
    const state = card.progress?.state || 'seed';
    const StateIcon = STATE_ICON[state];
    const stateColor = STATE_COLOR[state];

    const speakWord = () => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(card.word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
                className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Word header */}
                <div className="mb-5">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-3xl font-bold text-white tracking-wide">{card.word}</span>
                        <button onClick={speakWord} className="text-slate-500 hover:text-cyan-400 transition-colors">
                            <Volume2 className="w-5 h-5" />
                        </button>
                    </div>
                    {card.ipa && (
                        <p className="text-slate-500 font-mono text-sm mb-2">/{card.ipa}/</p>
                    )}
                    <p className="text-slate-300 text-base">{card.translationHint}</p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-5">
                    <span className={`px-2.5 py-1 rounded-full border text-xs font-medium ${LEVEL_COLOR[card.level] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                        {LEVEL_LABEL[card.level] || card.level}
                    </span>
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium ${stateColor}`}>
                        <StateIcon className="w-3 h-3" />
                        {STATE_LABEL[state]}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-400 font-mono">
                        ELO {card.elo}
                    </span>
                </div>

                {/* Example sentence */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 mb-5">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Ví dụ</p>
                    <p className="text-slate-200 text-sm leading-relaxed italic">
                        "{highlightWord(card.scenario, card.word)}"
                    </p>
                </div>

                {/* SRS info */}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Lịch ôn tập</span>
                    <span className={card.progress?.state === 'mastered' ? 'text-yellow-400' :
                        (card.progress?.nextReviewAt && card.progress.nextReviewAt <= Date.now() ? 'text-amber-400' : 'text-slate-400')}>
                        {formatNextReviewFull(card.progress?.nextReviewAt, card.progress?.state === 'mastered')}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function LearnedWordsList() {
    const learnedWordsSize = useLexicaStore(state => state.learnedWords.size);
    const cardProgress = useLexicaStore(state => state.cardProgress);
    const [page, setPage] = useState(0);
    const [selectedCard, setSelectedCard] = useState<CardWithProgress | null>(null);

    const learnedWords = useMemo(() => {
        return useLexicaStore.getState().getLearnedWordsList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [learnedWordsSize]);

    const learnedCards = useMemo(() => {
        return learnedWords
            .map(cardId => {
                const card = VOCAB_DATABASE.find(c => c.id === cardId);
                const progress = cardProgress[cardId];
                return card ? { ...card, progress } : null;
            })
            .filter(Boolean)
            .sort((a, b) => {
                const stateOrder = { mastered: 0, gold: 1, sprout: 2, seed: 3 };
                return (stateOrder[a!.progress?.state || 'seed'] || 999) - (stateOrder[b!.progress?.state || 'seed'] || 999);
            }) as CardWithProgress[];
    }, [learnedWords, cardProgress]);

    const totalPages = Math.ceil(learnedCards.length / PAGE_SIZE);
    const pageCards = learnedCards.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const speakWord = useCallback((e: React.MouseEvent, word: string) => {
        e.stopPropagation();
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        }
    }, []);

    if (learnedCards.length === 0) {
        return (
            <div className="text-slate-500 text-center py-8 flex flex-col items-center gap-2">
                <HandHeart className="w-8 h-8" />
                <p>Chưa học từ nào. Bắt đầu swipe thôi!</p>
            </div>
        );
    }

    return (
        <div>
            {selectedCard && (
                <WordDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
            )}
            <div className="space-y-1.5">
                {pageCards.map(card => {
                    if (!card) return null;
                    const state = card.progress?.state || 'seed';
                    const StateIcon = STATE_ICON[state];
                    const stateColor = STATE_COLOR[state];
                    const reviewLabel = formatNextReview(card.progress?.nextReviewAt, state === 'mastered');
                    const isDue = state !== 'mastered' && card.progress?.nextReviewAt && card.progress.nextReviewAt <= Date.now();

                    return (
                        <button
                            key={card.id}
                            onClick={() => setSelectedCard(card)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700/60 hover:border-slate-600 hover:bg-slate-700/50 transition-colors text-left cursor-pointer"
                        >
                            <StateIcon className={`w-3.5 h-3.5 shrink-0 ${stateColor}`} />
                            <span className="font-semibold text-slate-200 text-sm">{card.word}</span>
                            <button
                                onClick={(e) => speakWord(e, card.word)}
                                className="text-slate-600 hover:text-cyan-400 transition-colors shrink-0"
                                title="Nghe phát âm"
                            >
                                <Volume2 className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-slate-500 text-xs truncate flex-1">{card.translationHint}</span>
                            <span className={`text-xs shrink-0 ${isDue ? 'text-amber-400' : 'text-slate-600'}`}>
                                {reviewLabel}
                            </span>
                        </button>
                    );
                })}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Trước
                    </button>
                    <span className="text-xs text-slate-500">
                        {page + 1} / {totalPages} ({learnedCards.length} từ)
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page === totalPages - 1}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        Sau
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
