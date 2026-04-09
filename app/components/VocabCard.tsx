'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sprout, Leaf, Sparkles, Trophy, Swords, Eye, Volume2, Check, X as XIcon, Mic } from 'lucide-react';
import { useVocalSwipe } from '../hooks/useVocalSwipe';
import { useLexicaStore } from '../store/lexicaStore';

export type CardState = 'seed' | 'sprout' | 'gold' | 'mastered';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface VocabCardData {
    id: string;
    word: string;
    ipa?: string;
    elo: number;
    level: DifficultyLevel;
    scenario: string;
    translationHint: string;
    state: CardState;
    isBossCard?: boolean;
}

interface VocabCardProps {
    card: VocabCardData;
    index: number;
    onSwipe: (direction: 'left' | 'right', source?: 'manual' | 'voice') => void;
    revealed?: boolean;
    onReveal?: () => void;
}

export default function VocabCard({ card, index, onSwipe, revealed: controlledRevealed, onReveal }: VocabCardProps) {
    const [internalRevealed, setInternalRevealed] = useState(false);
    const swipeMode = useLexicaStore(state => state.swipeMode);

    const revealed = controlledRevealed !== undefined ? controlledRevealed : internalRevealed;
    const handleReveal = onReveal ?? (() => setInternalRevealed(true));

    const isBossCard = card.isBossCard || false;
    const isVoiceSwipeRequired = isBossCard || (swipeMode === 'voice' && index === 0);

    const speakWord = () => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(card.word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        }
    };

    const {
        state: vocalState,
        hitsRemaining,
        streakCount,
        startListening,
        lastSpokenWord,
        lastWasCorrect,
        canStartListening,
    } = useVocalSwipe({
        targetWord: card.word,
        onSuccess: () => {
            onSwipe('right', 'voice');
        },
        enabled: isVoiceSwipeRequired,
    });

    return (
        <div className="relative w-full">
            <motion.div
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.7}
                whileDrag={{ scale: 1.05 }}
                onDragEnd={(_event, info) => {
                    const threshold = 150;
                    if (Math.abs(info.offset.x) > threshold) {
                        const direction = info.offset.x > 0 ? 'right' : 'left';
                        if (direction === 'right' && isVoiceSwipeRequired) return;
                        onSwipe(direction);
                    }
                }}
                animate={{ y: index * 5, scale: 1 - index * 0.02, rotate: 0 }}
                className="w-full"
                style={{ userSelect: 'none', zIndex: 100 - index }}
            >
                <div
                    className="relative mx-4 h-100 rounded-2xl bg-slate-800 p-6 border border-slate-700 overflow-hidden"
                    style={{ boxShadow: index > 0 ? '0 -4px 12px rgba(0,0,0,0.3)' : 'none' }}
                >
                    {/* Normal content */}
                    {isBossCard && (
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-orange-600 text-white text-xs font-bold uppercase flex items-center gap-1.5">
                            <Swords className="w-3.5 h-3.5" /> BOSS CARD
                        </div>
                    )}
                    <div className="absolute top-3 right-3">
                        {card.state === 'seed' && <div className="p-1.5 bg-slate-700/50 rounded-lg"><Sprout className="w-5 h-5 text-green-400" /></div>}
                        {card.state === 'sprout' && <div className="p-1.5 bg-slate-700/50 rounded-lg"><Leaf className="w-5 h-5 text-cyan-400" /></div>}
                        {card.state === 'gold' && <div className="p-1.5 bg-slate-700/50 rounded-lg"><Sparkles className="w-5 h-5 text-yellow-400" /></div>}
                        {card.state === 'mastered' && <div className="p-1.5 bg-slate-700/50 rounded-lg"><Trophy className="w-5 h-5 text-yellow-400" /></div>}
                    </div>
                    <div className="absolute top-3 left-3 px-2 py-1 rounded bg-slate-700 text-slate-400 text-xs font-mono">
                        ELO {card.elo}
                    </div>
                    <div className={`${isBossCard ? 'mt-16' : 'mt-12'} mb-8 text-center`}>
                        <p className="text-lg text-slate-200 leading-relaxed">{card.scenario}</p>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                        {isVoiceSwipeRequired ? (
                            /* Voice mode: mic + feedback replaces reveal button */
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-slate-500">Từ cần nói</span>
                                    <span className="text-cyan-300 font-bold tracking-wide">{card.word.toUpperCase()}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500">Bạn vừa nói</span>
                                    <span className="text-slate-300 truncate max-w-32 text-right">{lastSpokenWord || '—'}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs mb-2">
                                    <span className="text-slate-500">Streak</span>
                                    <span className={`font-semibold ${lastWasCorrect === false ? 'text-red-400' : 'text-green-400'}`}>
                                        {streakCount}/3{lastWasCorrect === false ? ' • sai, reset' : ''}
                                    </span>
                                </div>
                                <button
                                    onClick={startListening}
                                    disabled={!canStartListening}
                                    className={`w-full px-4 py-3 rounded-lg border font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed ${vocalState === 'LISTENING' ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' :
                                            vocalState === 'SUCCESS' ? 'bg-green-500/20 border-green-500/40 text-green-300' :
                                                vocalState === 'FAIL' ? 'bg-red-500/20 border-red-500/40 text-red-300' :
                                                    vocalState === 'HIT_1' || vocalState === 'HIT_2' ? 'bg-green-500/20 border-green-500/40 text-green-300' :
                                                        'bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30'
                                        }`}
                                >
                                    <Mic className={`w-4 h-4 ${vocalState === 'LISTENING' ? 'animate-pulse' : ''}`} />
                                    {vocalState === 'LISTENING' ? 'Đang nghe...' :
                                        vocalState === 'SUCCESS' ? '✓ Hoàn hảo!' :
                                            vocalState === 'FAIL' ? 'Đang reset...' :
                                                vocalState === 'HIT_1' ? '1/3 ✓ — Tiếp tục!' :
                                                    vocalState === 'HIT_2' ? '2/3 ✓ — Một lần nữa!' :
                                                        'Tap để nói'}
                                    <div className="ml-auto flex gap-1">
                                        {[0, 1, 2].map((i) => (
                                            <div key={i} className={`w-2 h-2 rounded-full ${i < 3 - hitsRemaining ? 'bg-green-400' : 'bg-slate-600'}`} />
                                        ))}
                                    </div>
                                </button>
                            </div>
                        ) : !revealed ? (
                            <div className="space-y-2">
                                <button onClick={handleReveal} className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 hover:bg-slate-600 transition-colors active:scale-95 flex items-center justify-center gap-2">
                                    <Eye className="w-4 h-4 text-slate-300" />
                                    <p className="text-sm text-slate-300 font-medium">Nhấn để xem nghĩa</p>
                                </button>
                                {index === 0 && <p className="text-xs text-slate-500 text-center hidden lg:block">Space: Xem nghĩa • ← Quên • → Nhớ</p>}
                            </div>
                        ) : (
                            <div className="px-4 py-3 rounded-lg bg-slate-700/80 border border-slate-600 w-full">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <p className="text-base text-slate-200 font-medium">{card.word}</p>
                                    <button onClick={(e) => { e.stopPropagation(); speakWord(); }} className="text-slate-400 hover:text-cyan-400 transition-colors">
                                        <Volume2 className="w-5 h-5" />
                                    </button>
                                </div>
                                {card.ipa && <p className="text-xs text-slate-500 text-center mb-1 font-mono">/{card.ipa}/</p>}
                                <p className="text-sm text-slate-400 text-center">{card.translationHint}</p>
                            </div>
                        )}
                    </div>
                </div>

                {!isVoiceSwipeRequired && (
                    <>
                        <motion.div className="absolute top-1/2 left-8 -translate-y-1/2 opacity-0" style={{ opacity: 0 }}>
                            <XIcon className="w-16 h-16 text-red-400" />
                        </motion.div>
                        <motion.div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-0" style={{ opacity: 0 }}>
                            <Check className="w-16 h-16 text-green-400" />
                        </motion.div>
                    </>
                )}
            </motion.div>
        </div>
    );
}
