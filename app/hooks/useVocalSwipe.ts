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
    startListening: () => void;
    stopListening: () => void;
    transcript: string;
    isSupported: boolean;
    permissionDenied: boolean;
}

export function useVocalSwipe({
    targetWord,
    onSuccess,
    enabled,
}: UseVocalSwipeProps): UseVocalSwipeReturn {
    const [state, setState] = useState<VocalSwipeState>('INIT');
    const [hitsRemaining, setHitsRemaining] = useState(3);
    const [transcript, setTranscript] = useState('');
    const [permissionDenied, setPermissionDenied] = useState(false);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const consecutiveHits = useRef(0);

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
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [isSupported]);

    // Process speech result
    const processResult = useCallback((spokenWord: string) => {
        const normalized = spokenWord.toLowerCase().trim();
        const target = targetWord.toLowerCase().trim();

        console.log(`🎤 Spoken: "${normalized}" | Target: "${target}"`);

        if (normalized === target || normalized.includes(target)) {
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

                // Play success sound and trigger auto-swipe
                setTimeout(() => {
                    onSuccess();
                }, 800);
            }
        } else {
            // MISS! Reset combo
            consecutiveHits.current = 0;
            setHitsRemaining(3);
            setState('FAIL');
            setTranscript(`✗ "${spokenWord}" ≠ "${targetWord}"`);

            // Auto-reset to INIT after showing error
            setTimeout(() => {
                setState('INIT');
                setTranscript('');
            }, 2000);
        }
    }, [targetWord, onSuccess]);

    // Setup speech recognition handlers
    useEffect(() => {
        if (!recognitionRef.current || !enabled) return;

        const recognition = recognitionRef.current;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const result = event.results[0][0];
            const spokenWord = result.transcript;
            setState('INIT'); // Reset to INIT while processing
            processResult(spokenWord);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);

            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                setPermissionDenied(true);
                setState('INIT');
            } else if (event.error === 'no-speech') {
                setState('INIT');
                setTranscript('No speech detected. Try again.');
                setTimeout(() => setTranscript(''), 2000);
            } else {
                setState('INIT');
                setTranscript(`Error: ${event.error}`);
                setTimeout(() => setTranscript(''), 2000);
            }
        };

        recognition.onend = () => {
            // If still listening state, restart (for continuous mode simulation)
            if (state === 'LISTENING') {
                setState('INIT');
            }
        };

        recognition.onstart = () => {
            setState('LISTENING');
            setTranscript('Listening...');
        };
    }, [enabled, processResult, state]);

    const startListening = useCallback(() => {
        if (!recognitionRef.current || !isSupported || permissionDenied) {
            console.warn('Cannot start listening: recognition unavailable');
            return;
        }

        try {
            recognitionRef.current.start();
        } catch (error) {
            console.error('Error starting recognition:', error);
        }
    }, [isSupported, permissionDenied]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setState('INIT');
        }
    }, []);

    return {
        state,
        hitsRemaining,
        startListening,
        stopListening,
        transcript,
        isSupported,
        permissionDenied,
    };
}
