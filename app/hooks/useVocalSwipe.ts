'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export type VocalSwipeState = 'INIT' | 'LISTENING' | 'HIT_1' | 'HIT_2' | 'SUCCESS' | 'FAIL';

interface UseVocalSwipeProps {
    targetWord: string;
    onSuccess: () => void;
    enabled: boolean;
}

interface UseVocalSwipeReturn {
    state: VocalSwipeState;
    hitsRemaining: number;
    streakCount: number;
    startListening: () => void;
    stopListening: () => void;
    transcript: string;
    lastSpokenWord: string;
    lastWasCorrect: boolean | null;
    isSupported: boolean;
    permissionDenied: boolean;
    canStartListening: boolean;
}

export function useVocalSwipe({
    targetWord,
    onSuccess,
    enabled,
}: UseVocalSwipeProps): UseVocalSwipeReturn {
    const [state, setState] = useState<VocalSwipeState>('INIT');
    const [hitsRemaining, setHitsRemaining] = useState(3);
    const [transcript, setTranscript] = useState('');
    const [lastSpokenWord, setLastSpokenWord] = useState('');
    const [lastWasCorrect, setLastWasCorrect] = useState<boolean | null>(null);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [isCoolingDown, setIsCoolingDown] = useState(false);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const consecutiveHits = useRef(0);
    const recognitionActiveRef = useRef(false);
    const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const failResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Lazy initialization for browser support check
    const [isSupported] = useState(() => {
        if (typeof window === 'undefined') return false;
        const SpeechRecognitionAPI =
            (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof webkitSpeechRecognition }).SpeechRecognition ||
            (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof webkitSpeechRecognition }).webkitSpeechRecognition;
        return !!SpeechRecognitionAPI;
    });

    // Check browser support and initialize recognition
    useEffect(() => {
        if (!isSupported) return;

        const SpeechRecognitionAPI =
            (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof webkitSpeechRecognition }).SpeechRecognition ||
            (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof webkitSpeechRecognition }).webkitSpeechRecognition;

        if (SpeechRecognitionAPI && !recognitionRef.current) {
            recognitionRef.current = new SpeechRecognitionAPI();

            if (recognitionRef.current) {
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = false;
                recognitionRef.current.lang = 'en-US';
                recognitionRef.current.maxAlternatives = 1;
            }
        }

        return () => {
            if (successTimerRef.current) {
                clearTimeout(successTimerRef.current);
            }
            if (failResetTimerRef.current) {
                clearTimeout(failResetTimerRef.current);
            }
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [isSupported]);

    // Process speech result
    const processResult = useCallback((spokenWord: string) => {
        const normalized = spokenWord.toLowerCase().trim();
        const target = targetWord.toLowerCase().trim();
        setLastSpokenWord(spokenWord);

        if (normalized === target || normalized.includes(target)) {
            setLastWasCorrect(true);
            // HIT! Increment combo
            consecutiveHits.current += 1;
            const remaining = 3 - consecutiveHits.current;
            setHitsRemaining(remaining);

            if (consecutiveHits.current === 1) {
                setState('HIT_1');
                setTranscript(`✓ ${spokenWord} (2 left)`);
            } else if (consecutiveHits.current === 2) {
                setState('HIT_2');
                setTranscript(`✓✓ ${spokenWord} (1 left)`);
            } else if (consecutiveHits.current >= 3) {
                setState('SUCCESS');
                setTranscript(`✓✓✓ ${spokenWord} PERFECT!`);
                setIsCoolingDown(true);

                // Delay a bit so user can see success state, then auto-swipe.
                if (successTimerRef.current) {
                    clearTimeout(successTimerRef.current);
                }
                successTimerRef.current = setTimeout(() => {
                    setIsCoolingDown(false);
                    onSuccess();
                }, 700);
            }
        } else {
            setLastWasCorrect(false);
            // MISS! Reset combo
            consecutiveHits.current = 0;
            setHitsRemaining(3);
            setState('FAIL');
            setTranscript(`✗ "${spokenWord}" ≠ "${targetWord}"`);
            setIsCoolingDown(true);

            // Auto-reset to INIT after showing error
            if (failResetTimerRef.current) {
                clearTimeout(failResetTimerRef.current);
            }
            failResetTimerRef.current = setTimeout(() => {
                setState('INIT');
                setTranscript('');
                setIsCoolingDown(false);
            }, 1200);
        }
    }, [targetWord, onSuccess]);

    // Setup speech recognition handlers
    useEffect(() => {
        if (!recognitionRef.current || !enabled) return;

        const recognition = recognitionRef.current;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            recognitionActiveRef.current = false;
            const result = event.results[0][0];
            const spokenWord = result.transcript;
            setState('INIT'); // Reset to INIT while processing
            processResult(spokenWord);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            recognitionActiveRef.current = false;

            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                setPermissionDenied(true);
                setState('INIT');
            } else if (event.error === 'no-speech') {
                setState('INIT');
                setTranscript('No speech detected. Try again.');
                setLastWasCorrect(null);
                setTimeout(() => setTranscript(''), 2000);
            } else {
                setState('INIT');
                setTranscript(`Error: ${event.error}`);
                setLastWasCorrect(null);
                setTimeout(() => setTranscript(''), 2000);
            }
        };

        recognition.onend = () => {
            recognitionActiveRef.current = false;
            if (state === 'LISTENING') {
                setState('INIT');
            }
        };

        recognition.onstart = () => {
            recognitionActiveRef.current = true;
            setState('LISTENING');
            setTranscript('Listening...');
        };
    }, [enabled, processResult, state]);

    const startListening = useCallback(() => {
        if (
            !recognitionRef.current ||
            !isSupported ||
            permissionDenied ||
            isCoolingDown ||
            recognitionActiveRef.current
        ) {
            return;
        }

        try {
            recognitionActiveRef.current = true;
            recognitionRef.current.start();
        } catch (error) {
            recognitionActiveRef.current = false;
        }
    }, [isSupported, permissionDenied, isCoolingDown]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionActiveRef.current = false;
            recognitionRef.current.stop();
            setState('INIT');
        }
    }, []);

    const canStartListening =
        enabled &&
        isSupported &&
        !permissionDenied &&
        !isCoolingDown &&
        !recognitionActiveRef.current &&
        state !== 'SUCCESS';

    return {
        state,
        hitsRemaining,
        streakCount: consecutiveHits.current,
        startListening,
        stopListening,
        transcript,
        lastSpokenWord,
        lastWasCorrect,
        isSupported,
        permissionDenied,
        canStartListening,
    };
}
