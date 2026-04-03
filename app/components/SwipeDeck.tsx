'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VocabCard, { VocabCardData } from './VocabCard';

// Mock data for testing
const mockCards: VocabCardData[] = [
    {
        id: 'card_001',
        word: 'METICULOUS',
        elo: 1200,
        scenario: 'The bomb is ticking (0:10). You must cut the wires in an extremely [ ___ ] manner to survive.',
        translationHint: 'Tỉ mỉ, cẩn thận chi tiết',
        state: 'seed',
    },
    {
        id: 'card_002',
        word: 'UBIQUITOUS',
        elo: 1350,
        scenario: 'Smartphones are [ ___ ] in 2026—even your grandma livestreams on 3 platforms.',
        translationHint: 'Có mặt khắp nơi',
        state: 'seed',
    },
    {
        id: 'card_003',
        word: 'EPHEMERAL',
        elo: 1450,
        scenario: 'Your ex\'s Instagram story is [ ___ ]—gone in 24 hours, just like their promises.',
        translationHint: 'Phù du, tồn tại ngắn ngủi',
        state: 'sprout',
    },
];

export default function SwipeDeck() {
    const [cards, setCards] = useState<VocabCardData[]>(mockCards);
    const [swipedCount, setSwipedCount] = useState(0);
    const [lastSwipeDirection, setLastSwipeDirection] = useState<'left' | 'right' | null>(null);

    // Pre-compute exit directions based on card ID (deterministic)
    const [exitDirections] = useState<Record<string, { x: number; y: number; rotate: number }>>(() =>
        mockCards.reduce((acc, card, index) => {
            const direction = index % 2 === 0 ? 1 : -1;
            acc[card.id] = {
                x: direction * 500,
                y: 200,
                rotate: direction * 25,
            };
            return acc;
        }, {} as Record<string, { x: number; y: number; rotate: number }>)
    );

    const handleSwipe = (direction: 'left' | 'right', cardId: string) => {
        setLastSwipeDirection(direction);

        // Show feedback briefly
        setTimeout(() => setLastSwipeDirection(null), 1000);

        // Animate card out
        setCards((prev) => prev.filter((card) => card.id !== cardId));
        setSwipedCount((prev) => prev + 1);

        // Play sound effect (optional)
        if (direction === 'right') {
            console.log('✅ Remembered!');
        } else {
            console.log('❌ Forgot!');
        }

        // Decrease energy (will implement later with global state)
    };

    if (cards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-100 px-8 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-8xl mb-6"
                >
                    🎉
                </motion.div>
                <h2 className="text-3xl font-bold text-cyan-400 mb-4">
                    Deck Complete!
                </h2>
                <p className="text-slate-400 text-lg mb-8">
                    You swiped through {swipedCount} cards. Time to unlock an absurd story...
                </p>
                <button className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 rounded-xl font-bold text-white transition-colors">
                    UNLOCK STORY MODE →
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
                        className="absolute z-50 text-6xl font-bold"
                    >
                        {lastSwipeDirection === 'right' ? (
                            <span className="text-green-400">✓ REMEMBER</span>
                        ) : (
                            <span className="text-red-400">✗ FORGET</span>
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
