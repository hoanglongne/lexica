'use client';

import { motion } from 'framer-motion';
import { Ban, MicOff, PartyPopper, Mic } from 'lucide-react';
import { VocalSwipeState } from '../hooks/useVocalSwipe';

interface VocalSwipeUIProps {
    state: VocalSwipeState;
    hitsRemaining: number;
    streakCount: number;
    transcript: string;
    targetWord: string;
    lastSpokenWord: string;
    lastWasCorrect: boolean | null;
    isSupported: boolean;
    permissionDenied: boolean;
    onMicClick: () => void;
}

export default function VocalSwipeUI({
    state,
    hitsRemaining,
    streakCount,
    transcript,
    targetWord,
    lastSpokenWord,
    lastWasCorrect,
    isSupported,
    permissionDenied,
    onMicClick,
}: VocalSwipeUIProps) {
    if (!isSupported) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur rounded-3xl">
                <div className="text-center px-8">
                    <Ban className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <p className="text-red-400 font-semibold">
                        Web Speech API not supported
                    </p>
                    <p className="text-slate-400 text-sm mt-2">
                        Try Chrome or Edge on desktop
                    </p>
                </div>
            </div>
        );
    }

    if (permissionDenied) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur rounded-3xl">
                <div className="text-center px-8">
                    <MicOff className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                    <p className="text-orange-400 font-semibold mb-2">
                        Microphone permission denied
                    </p>
                    <p className="text-slate-400 text-sm">
                        Enable microphone access in browser settings
                    </p>
                </div>
            </div>
        );
    }

    const getMicColor = () => {
        switch (state) {
            case 'LISTENING':
                return 'text-cyan-400 animate-pulse';
            case 'HIT_1':
                return 'text-green-400';
            case 'HIT_2':
                return 'text-green-300';
            case 'SUCCESS':
                return 'text-yellow-300';
            case 'FAIL':
                return 'text-red-400';
            default:
                return 'text-purple-400';
        }
    };

    const getGlowIntensity = () => {
        // Removed heavy shadow effects
        return '';
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 rounded-2xl z-50">
            {/* Success Confetti */}
            {/* Success Confetti */}
            {state === 'SUCCESS' && (
                <motion.div
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: [0, 1.5, 1], rotate: [0, 180, 360] }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                    <PartyPopper className="w-32 h-32 text-yellow-400" />
                </motion.div>
            )}

            {/* Microphone Icon */}
            <motion.button
                onClick={onMicClick}
                disabled={state === 'LISTENING' || state === 'SUCCESS'}
                animate={{
                    scale: state === 'LISTENING' ? [1, 1.1, 1] : 1,
                }}
                transition={{
                    repeat: state === 'LISTENING' ? Infinity : 0,
                    duration: 1,
                }}
                className={`relative mb-6 ${getMicColor()} ${getGlowIntensity()} transition-all cursor-pointer hover:scale-110 disabled:cursor-not-allowed`}
            >
                <Mic className="w-24 h-24" />

                {/* Hit Counter Badge */}
                {hitsRemaining < 3 && state !== 'SUCCESS' && state !== 'FAIL' && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold"
                    >
                        {3 - hitsRemaining}
                    </motion.div>
                )}
            </motion.button>

            {/* Transcript / Instructions */}
            <div className="text-center px-8 mb-4">
                {transcript ? (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`font-mono text-lg ${state === 'FAIL' ? 'text-red-400' :
                            state === 'SUCCESS' ? 'text-yellow-300' :
                                state === 'LISTENING' ? 'text-cyan-400' :
                                    'text-green-400'
                            }`}
                    >
                        {transcript}
                    </motion.p>
                ) : (
                    <p className="text-slate-400 text-sm">
                        Tap the mic and say the word <strong>3 times</strong> correctly
                    </p>
                )}
            </div>

            {/* Explicit feedback for control */}
            <div className="w-full max-w-xs px-6 mb-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Target</span>
                    <span className="text-cyan-300 font-semibold tracking-wide">{targetWord.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Bạn vừa nói</span>
                    <span className="text-slate-300 font-medium truncate max-w-37.5 text-right">
                        {lastSpokenWord || '...'}
                    </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Đúng liên tiếp</span>
                    <span className={`${lastWasCorrect === false ? 'text-red-400' : 'text-green-400'} font-semibold`}>
                        {streakCount}/3 {lastWasCorrect === false ? '• sai, reset' : ''}
                    </span>
                </div>
            </div>

            {/* Progress Indicators */}
            <div className="flex gap-2">
                {[0, 1, 2].map((index) => {
                    const isCompleted = index < 3 - hitsRemaining;
                    const isCurrent = index === 3 - hitsRemaining && state === 'LISTENING';

                    return (
                        <motion.div
                            key={index}
                            animate={{
                                scale: isCurrent ? [1, 1.2, 1] : 1,
                            }}
                            transition={{
                                repeat: isCurrent ? Infinity : 0,
                                duration: 0.5,
                            }}
                            className={`w-4 h-4 rounded-full ${isCompleted ? 'bg-green-400' :
                                isCurrent ? 'bg-cyan-400' :
                                    'bg-slate-700'
                                }`}
                        />
                    );
                })}
            </div>

            {/* Hint */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-slate-500 text-xs"
            >
                {state === 'FAIL' ? 'Try again! Pronunciation matters.' :
                    state === 'SUCCESS' ? 'Perfect! Auto-swiping...' :
                        'Speak clearly into your microphone'}
            </motion.p>
        </div>
    );
}
