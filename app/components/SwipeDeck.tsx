'use client';

import { useState, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, Check, X, RotateCcw, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import VocabCard from './VocabCard';
import { useLexicaStore } from '../store/lexicaStore';
import { analytics } from '../lib/analytics';
import { getDueCards } from '../lib/eloAlgorithm';

export default function SwipeDeck() {
    const cards = useLexicaStore(state => state.currentDeck);
    const cardProgress = useLexicaStore(state => state.cardProgress);
    const swipeCard = useLexicaStore(state => state.swipeCard);
    const consumeEnergy = useLexicaStore(state => state.consumeEnergy);
    const energy = useLexicaStore(state => state.energy);

    const swipeMode = useLexicaStore(state => state.swipeMode);

    const dueCount = getDueCards(cardProgress).length;

    const [lastSwipeWasReview, setLastSwipeWasReview] = useState<boolean>(false);
    const [lastSwipeDirection, setLastSwipeDirection] = useState<'left' | 'right' | null>(null);
    const [cardExitDirections, setCardExitDirections] = useState<Record<string, 'left' | 'right'>>({});

    // Revealed state for top card, controlled here so keyboard handler can access it
    const topCardId = cards[0]?.id;
    const [revealedForCardId, setRevealedForCardId] = useState<string | null>(null);
    const topCardRevealed = revealedForCardId === topCardId;
    const setTopCardRevealed = useCallback((val: boolean) => {
        setRevealedForCardId(val ? topCardId ?? null : null);
    }, [topCardId]);

    const handleSwipe = useCallback((
        direction: 'left' | 'right',
        cardId: string,
        source: 'manual' | 'voice' | 'quiz' = 'manual'
    ) => {
        const isReviewCard = Boolean(cardProgress[cardId]);

        // BLOCKING LOGIC: User cannot swipe RIGHT manually if it's a review card.
        // For review cards, they MUST answer the quiz.
        // For new cards, we allow swiping right to start learning.
        if (direction === 'right' && source === 'manual' && isReviewCard) {
            return;
        }

        if (swipeMode === 'voice' && direction === 'right' && source !== 'voice') {
            return;
        }

        if (!isReviewCard && energy <= 0) {
            alert('No energy left! Come back tomorrow.');
            return;
        }

        if (!isReviewCard) {
            const hasEnergy = consumeEnergy();
            if (!hasEnergy) return;
        }

        setLastSwipeWasReview(isReviewCard);
        setLastSwipeDirection(direction);
        setTimeout(() => setLastSwipeDirection(null), 1000);

        analytics.swipe(direction, cardId, source);

        // flushSync forces a synchronous re-render with the correct exit direction
        // BEFORE swipeCard removes the card, so AnimatePresence snapshots the right values
        flushSync(() => {
            setCardExitDirections(prev => ({ ...prev, [cardId]: direction }));
        });

        swipeCard(cardId, direction);
    }, [cardProgress, energy, consumeEnergy, swipeCard, swipeMode]);

    // Keyboard controls (desktop)
    useEffect(() => {
        if (!topCardId) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            const isSpaceKey = e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar';

            if (isSpaceKey) {
                e.preventDefault();
                setTopCardRevealed(true);
                return;
            }

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handleSwipe('left', topCardId);
                return;
            }

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                if (swipeMode === 'voice') {
                    return;
                }
                handleSwipe('right', topCardId);
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [topCardId, handleSwipe, swipeMode, setTopCardRevealed]);

    if (cards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-100 px-8 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mb-4"
                >
                    <PartyPopper className="w-20 h-20 text-yellow-400 mx-auto" />
                </motion.div>
                <h2 className="text-2xl font-bold text-cyan-400 mb-2">
                    Hoàn thành bộ bài!
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                    Bạn đã quẹt hết các thẻ trong lượt này.
                </p>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                    {dueCount > 0 && (
                        <Link
                            href="/review"
                            className="w-full flex items-center justify-between px-4 py-3 bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 rounded-xl transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-500/20">
                                    <RotateCcw className="w-4 h-4 text-amber-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-amber-200 text-sm font-bold">Ôn tập chuyên sâu</p>
                                    <p className="text-amber-500/70 text-[10px]">Còn {dueCount} từ đến hạn</p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    )}

                    <button
                        onClick={() => useLexicaStore.getState().loadNewDeck()}
                        className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl font-bold text-white text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        HỌC TIẾP →
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-100 flex items-center justify-center">
            {/* Mode Toggle */}
            <AnimatePresence>
                {lastSwipeDirection && (
                    <motion.div
                        key="feedback"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute z-50 flex flex-col items-center gap-2 text-4xl font-bold pointer-events-none"
                    >
                        {lastSwipeDirection === 'right' ? (
                            <div className="flex flex-col items-center">
                                <span className="flex items-center gap-2 text-green-400">
                                    <Check className="w-12 h-12" />
                                    {lastSwipeWasReview ? 'CHÍNH XÁC' : 'GHI NHỚ'}
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <span className="flex items-center gap-2 text-red-400">
                                    <X className="w-12 h-12" />
                                    {lastSwipeWasReview ? 'QUÊN' : 'BỎ QUA'}
                                </span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {cards.map((card, index) => {
                    if (index > 2) return null; // Only show top 3 cards for performance

                    // Get exit direction for this card (left = negative, right = positive)
                    const exitDirection = cardExitDirections[card.id];
                    const xMultiplier = exitDirection === 'left' ? -1 : 1;

                    return (
                        <motion.div
                            key={card.id}
                            exit={{
                                x: xMultiplier * 500,
                                y: 200,
                                opacity: 0,
                                rotate: xMultiplier * 25,
                                transition: { duration: 0.5, ease: 'easeInOut' },
                            }}
                            className="absolute w-full top-1/2 -translate-y-1/2"
                            style={{ zIndex: cards.length - index }}
                        >
                            <VocabCard
                                card={card}
                                index={index}
                                onSwipe={(direction, source) => handleSwipe(direction, card.id, source)}
                                revealed={index === 0 ? topCardRevealed : undefined}
                                onReveal={index === 0 ? () => setTopCardRevealed(true) : undefined}
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>

        </div>
    );
}
