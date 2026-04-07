'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, Check, X } from 'lucide-react';
import VocabCard, { VocabCardData } from './VocabCard';
import { useLexicaStore } from '../store/lexicaStore';

export default function SwipeDeck() {
    const cards = useLexicaStore(state => state.currentDeck);
    const swipeCard = useLexicaStore(state => state.swipeCard);
    const consumeEnergy = useLexicaStore(state => state.consumeEnergy);
    const energy = useLexicaStore(state => state.energy);

    const [lastSwipeDirection, setLastSwipeDirection] = useState<'left' | 'right' | null>(null);

    // Pre-compute exit directions based on card ID (deterministic)
    const exitDirections = useMemo(() => {
        return cards.reduce((acc, card, index) => {
            const direction = index % 2 === 0 ? 1 : -1;
            acc[card.id] = {
                x: direction * 500,
                y: 200,
                rotate: direction * 25,
            };
            return acc;
        }, {} as Record<string, { x: number; y: number; rotate: number }>);
    }, [cards]);

    const handleSwipe = (direction: 'left' | 'right', cardId: string) => {
        // Check energy
        if (energy <= 0) {
            alert('No energy left! Come back tomorrow.');
            return;
        }

        // Consume energy
        const hasEnergy = consumeEnergy();
        if (!hasEnergy) return;

        setLastSwipeDirection(direction);

        // Show feedback briefly
        setTimeout(() => setLastSwipeDirection(null), 1000);

        // Record swipe in store (updates ELO, stats, removes card)
        swipeCard(cardId, direction);

        // Play sound effect (optional)
        if (direction === 'right') {
            console.log('✅ Remembered!');
        } else {
            console.log('❌ Forgot!');
        }
    };

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

                    return (
                        <motion.div
                            key={card.id}
                            exit={{
                                x: exitDirections[card.id]?.x || 500,
                                y: exitDirections[card.id]?.y || 200,
                                opacity: 0,
                                rotate: exitDirections[card.id]?.rotate || 25,
                                transition: { duration: 0.5, ease: 'easeInOut' },
                            }}
                            className="absolute w-full top-1/2 -translate-y-1/2"
                        >
                            <VocabCard
                                card={card}
                                index={index}
                                onSwipe={(direction) => handleSwipe(direction, card.id)}
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>

        </div>
    );
}
