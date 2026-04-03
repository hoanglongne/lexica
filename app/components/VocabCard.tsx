'use client';

import { motion } from 'framer-motion';
import { useVocalSwipe } from '../hooks/useVocalSwipe';
import VocalSwipeUI from './VocalSwipeUI';

export type CardState = 'seed' | 'sprout' | 'gold';

export interface VocabCardData {
    id: string;
    word: string;
    elo: number;
    scenario: string;
    translationHint: string;
    state: CardState;
    isBossCard?: boolean; // High ELO or transitioning to Gold requires vocal swipe
}

interface VocabCardProps {
    card: VocabCardData;
    index: number;
    onSwipe: (direction: 'left' | 'right') => void;
}

export default function VocabCard({ card, index, onSwipe }: VocabCardProps) {
    // Vocal Swipe Hook for Boss Cards
    const {
        state: vocalState,
        hitsRemaining,
        startListening,
        transcript,
        isSupported,
        permissionDenied,
    } = useVocalSwipe({
        targetWord: card.word,
        onSuccess: () => {
            // Auto-swipe right when vocal challenge is completed
            setTimeout(() => onSwipe('right'), 500);
        },
        enabled: card.isBossCard || false,
    });

    const isBossCard = card.isBossCard || false;

    return (
        <motion.div
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.7}
            whileDrag={{ scale: 1.05 }}
            onDragEnd={(_event, info) => {
                const threshold = 150;
                if (Math.abs(info.offset.x) > threshold) {
                    onSwipe(info.offset.x > 0 ? 'right' : 'left');
                }
            }}
            animate={{
                y: index * 5,
                scale: 1 - index * 0.02,
                rotate: 0
            }}
            className="w-full"
            style={{
                userSelect: 'none',
                zIndex: 100 - index,
            }}
        >
            <div className="relative mx-4 h-100 rounded-2xl bg-slate-800 p-6 border border-slate-700" style={{
                boxShadow: index > 0 ? '0 -4px 12px rgba(0, 0, 0, 0.3)' : 'none'
            }}>
                {/* Boss Card Badge */}
                {isBossCard && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-orange-600 text-white text-xs font-bold uppercase">
                        ⚔️ BOSS CARD
                    </div>
                )}

                {/* Evolution Badge */}
                <div className="absolute top-3 right-3">
                    {card.state === 'seed' && (
                        <div className="text-2xl">🌱</div>
                    )}
                    {card.state === 'sprout' && (
                        <div className="text-2xl">🌿</div>
                    )}
                    {card.state === 'gold' && (
                        <div className="text-2xl">✨</div>
                    )}
                </div>

                {/* ELO Rating */}
                <div className="absolute top-3 left-3 px-2 py-1 rounded bg-slate-700 text-slate-400 text-xs font-mono">
                    ELO {card.elo}
                </div>

                {/* Target Word */}
                <div className={`${isBossCard ? 'mt-16' : 'mt-12'} mb-6 text-center`}>
                    <h2 className="text-4xl font-bold text-cyan-400">
                        {card.word}
                    </h2>
                </div>

                {/* POV Scenario */}
                <div className="mb-4">
                    <p className="text-base text-slate-300 leading-relaxed">
                        {card.scenario}
                    </p>
                </div>

                {/* Translation Hint */}
                <div className="absolute bottom-6 left-6 right-6">
                    <div className="px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600">
                        <p className="text-sm text-slate-400 text-center">
                            💡 {card.translationHint}
                        </p>
                    </div>
                </div>

                {/* Vocal Swipe UI Overlay (Boss Cards Only) */}
                {isBossCard && (
                    <VocalSwipeUI
                        state={vocalState}
                        hitsRemaining={hitsRemaining}
                        transcript={transcript}
                        isSupported={isSupported}
                        permissionDenied={permissionDenied}
                        onMicClick={startListening}
                    />
                )}
            </div>

            {/* Swipe Indicators (Only for normal cards) */}
            {!isBossCard && (
                <>
                    <motion.div
                        className="absolute top-1/2 left-8 -translate-y-1/2 text-6xl opacity-0"
                        style={{
                            opacity: 0,
                        }}
                    >
                        ❌
                    </motion.div>
                    <motion.div
                        className="absolute top-1/2 right-8 -translate-y-1/2 text-6xl opacity-0"
                        style={{
                            opacity: 0,
                        }}
                    >
                        ✅
                    </motion.div>
                </>
            )}
        </motion.div>
    );
}
