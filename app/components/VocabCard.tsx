'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sprout, Leaf, Sparkles, Trophy, Swords, Eye, Volume2, Check, X as XIcon } from 'lucide-react';
import { useVocalSwipe } from '../hooks/useVocalSwipe';
import VocalSwipeUI from './VocalSwipeUI';

export type CardState = 'seed' | 'sprout' | 'gold' | 'mastered';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface VocabCardData {
    id: string;
    word: string;
    ipa?: string; // International Phonetic Alphabet
    elo: number;
    level: DifficultyLevel; // Difficulty level based on ELO
    scenario: string;
    translationHint: string;
    state: CardState;
    isBossCard?: boolean; // High ELO or transitioning to Gold requires vocal swipe
}

interface VocabCardProps {
    card: VocabCardData;
    index: number;
    onSwipe: (direction: 'left' | 'right') => void;
    revealed?: boolean;    // controlled from SwipeDeck (top card)
    onReveal?: () => void; // controlled reveal callback
}

export default function VocabCard({ card, index, onSwipe, revealed: controlledRevealed, onReveal }: VocabCardProps) {
    const [internalRevealed, setInternalRevealed] = useState(false);

    // Use controlled state from parent (top card) if provided, otherwise internal
    const revealed = controlledRevealed !== undefined ? controlledRevealed : internalRevealed;
    const handleReveal = onReveal ?? (() => setInternalRevealed(true));

    const isBossCard = card.isBossCard || false;
    // Text-to-Speech function
    const speakWord = () => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(card.word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8; // Speak slower for learning
            window.speechSynthesis.cancel(); // Cancel any ongoing speech
            window.speechSynthesis.speak(utterance);
        }
    };

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
            <div
                className="relative mx-4 h-100 rounded-2xl bg-slate-800 p-6 border border-slate-700"
                style={{
                    boxShadow: index > 0 ? '0 -4px 12px rgba(0, 0, 0, 0.3)' : 'none'
                }}
            >
                {/* Boss Card Badge */}
                {isBossCard && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-orange-600 text-white text-xs font-bold uppercase flex items-center gap-1.5">
                        <Swords className="w-3.5 h-3.5" />
                        BOSS CARD
                    </div>
                )}

                {/* Evolution Badge */}
                <div className="absolute top-3 right-3">
                    {card.state === 'seed' && (
                        <div className="p-1.5 bg-slate-700/50 rounded-lg">
                            <Sprout className="w-5 h-5 text-green-400" />
                        </div>
                    )}
                    {card.state === 'sprout' && (
                        <div className="p-1.5 bg-slate-700/50 rounded-lg">
                            <Leaf className="w-5 h-5 text-cyan-400" />
                        </div>
                    )}
                    {card.state === 'gold' && (
                        <div className="p-1.5 bg-slate-700/50 rounded-lg">
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                        </div>
                    )}
                    {card.state === 'mastered' && (
                        <div className="p-1.5 bg-slate-700/50 rounded-lg">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                        </div>
                    )}
                </div>

                {/* ELO Rating */}
                <div className="absolute top-3 left-3 px-2 py-1 rounded bg-slate-700 text-slate-400 text-xs font-mono">
                    ELO {card.elo}
                </div>

                {/* Scenario - Always visible */}
                <div className={`${isBossCard ? 'mt-16' : 'mt-12'} mb-8 text-center`}>
                    <p className="text-lg text-slate-200 leading-relaxed">
                        {card.scenario}
                    </p>
                </div>

                {/* Reveal prompt or meaning */}
                <div className="absolute bottom-6 left-6 right-6">
                    {!revealed ? (
                        <div className="space-y-2">
                            <button
                                onClick={handleReveal}
                                className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 hover:bg-slate-600 transition-colors active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Eye className="w-4 h-4 text-slate-300" />
                                <p className="text-sm text-slate-300 text-center font-medium">
                                    Nhấn để xem nghĩa
                                </p>
                            </button>
                            {index === 0 && (
                                <p className="text-xs text-slate-500 text-center hidden lg:block">
                                    Space: Xem nghĩa • ← Quên • → Nhớ
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="px-4 py-3 rounded-lg bg-slate-700/80 border border-slate-600 w-full">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <p className="text-base text-slate-200 text-center font-medium">
                                    {card.word}
                                </p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        speakWord();
                                    }}
                                    className="text-slate-400 hover:text-cyan-400 transition-colors active:scale-90"
                                    title="Phát âm"
                                >
                                    <Volume2 className="w-5 h-5" />
                                </button>
                            </div>
                            {card.ipa && (
                                <p className="text-xs text-slate-500 text-center mb-1 font-mono">
                                    /{card.ipa}/
                                </p>
                            )}
                            <p className="text-sm text-slate-400 text-center">
                                {card.translationHint}
                            </p>
                        </div>
                    )}
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
                        className="absolute top-1/2 left-8 -translate-y-1/2 opacity-0"
                        style={{
                            opacity: 0,
                        }}
                    >
                        <XIcon className="w-16 h-16 text-red-400" />
                    </motion.div>
                    <motion.div
                        className="absolute top-1/2 right-8 -translate-y-1/2 opacity-0"
                        style={{
                            opacity: 0,
                        }}
                    >
                        <Check className="w-16 h-16 text-green-400" />
                    </motion.div>
                </>
            )}
        </motion.div>
    );
}
