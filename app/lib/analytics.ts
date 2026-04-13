/**
 * LEXICA Analytics Module
 *
 * Thin event-tracking layer. Currently logs to console.
 * To wire to a real provider (Plausible, Mixpanel, Umami):
 *   1. Replace the `send` function body below.
 *   2. No call-site changes needed.
 */

export type LexicaEvent =
    | 'swipe'
    | 'voice_success'
    | 'voice_fail'
    | 'voice_hit'
    | 'story_open'
    | 'story_finish'
    | 'oratio_cta_click'
    | 'level_selected'
    | 'test_completed'
    | 'deck_complete'
    | 'energy_depleted';

interface EventProps {
    [key: string]: string | number | boolean | null | undefined;
}

function send(event: LexicaEvent, props?: EventProps): void {
    // ── Swap this block to integrate with a real analytics service ──────────
    if (process.env.NODE_ENV === 'development') {
        console.log(`[analytics] ${event}`, props ?? {});
    }
    // Example Plausible integration:
    // if (typeof window !== 'undefined' && window.plausible) {
    //     window.plausible(event, { props });
    // }
    // ────────────────────────────────────────────────────────────────────────
}

export const analytics = {
    swipe(direction: 'left' | 'right', cardId: string, source: 'manual' | 'voice') {
        send('swipe', { direction, cardId, source });
    },

    voiceSuccess(word: string, attempts: number) {
        send('voice_success', { word, attempts });
    },

    voiceFail(word: string, spokenWord: string) {
        send('voice_fail', { word, spokenWord });
    },

    voiceHit(word: string, hitNumber: number) {
        send('voice_hit', { word, hitNumber });
    },

    storyOpen(storyId: string) {
        send('story_open', { storyId });
    },

    storyFinish(storyId: string) {
        send('story_finish', { storyId });
    },

    oratioCTAClick(storyId: string) {
        send('oratio_cta_click', { storyId });
    },

    levelSelected(level: string) {
        send('level_selected', { level });
    },

    testCompleted(score: number, recommendedLevel: string) {
        send('test_completed', { score, recommendedLevel });
    },

    deckComplete(wordsLearned: number) {
        send('deck_complete', { wordsLearned });
    },

    energyDepleted() {
        send('energy_depleted', {});
    },
};
