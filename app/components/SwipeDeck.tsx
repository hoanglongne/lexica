'use client';

import { useState, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, Check, X } from 'lucide-react';
import VocabCard from './VocabCard';
import { useLexicaStore } from '../store/lexicaStore';

export default function SwipeDeck() {
    const cards = useLexicaStore(state => state.currentDeck);
    const swipeCard = useLexicaStore(state => state.swipeCard);
    const consumeEnergy = useLexicaStore(state => state.consumeEnergy);
    const energy = useLexicaStore(state => state.energy);

    const swipeMode = useLexicaStore(state => state.swipeMode);

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
        source: 'manual' | 'voice' = 'manual'
    ) => {
        if (swipeMode === 'voice' && direction === 'right' && source !== 'voice') {
            return;
        }

        if (energy <= 0) {
            alert('No energy left! Come back tomorrow.');
            return;
        }

        const hasEnergy = consumeEnergy();
        if (!hasEnergy) return;

        setLastSwipeDirection(direction);
        setTimeout(() => setLastSwipeDirection(null), 1000);

        // flushSync forces a synchronous re-render with the correct exit direction
        // BEFORE swipeCard removes the card, so AnimatePresence snapshots the right values
        flushSync(() => {
            setCardExitDirections(prev => ({ ...prev, [cardId]: direction }));
        });

        swipeCard(cardId, direction);
    }, [energy, consumeEnergy, swipeCard, swipeMode]);

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
                    className="mb-6"
                >
                    <PartyPopper className="w-24 h-24 text-yellow-400 mx-auto" />
                </motion.div>
                <h2 className="text-3xl font-bold text-cyan-400 mb-4">
                    Deck Complete!
                </h2>
                <p className="text-slate-400 text-lg mb-8">
                    You cleared the deck. Story Mode coming in Phase 5...
                </p>
                <button
                    onClick={() => useLexicaStore.getState().loadNewDeck()}
                    className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 rounded-xl font-bold text-white transition-colors"
                >
                    LOAD NEW DECK →
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full h-100 flex items-center justify-center">
            {/* Mode Toggle */}
            {/* Swipe Feedback */}
            <AnimatePresence>
                {lastSwipeDirection && (
                    <motion.div
                        key="feedback"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute z-50 flex items-center gap-2 text-4xl font-bold"
                    >
                        {lastSwipeDirection === 'right' ? (
                            <span className="flex items-center gap-2 text-green-400">
                                <Check className="w-12 h-12" />
                                REMEMBER
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 text-red-400">
                                <X className="w-12 h-12" />
                                FORGET
                            </span>
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
