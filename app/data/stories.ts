import { DifficultyLevel } from '../components/VocabCard';

export interface Story {
    id: string;
    title: string;
    content: string; // Story with vocabulary words marked as {word}
    vocabularyIds: string[]; // 10 vocab card IDs used
    difficultyLevel: DifficultyLevel | 'mixed';
    darkComedyLevel: 'medium' | 'high' | 'extreme';
}

/**
 * Pre-generated absurd dark-comedy stories
 * Each story contains exactly 10 vocabulary words
 */
export const STORIES: Story[] = [
    {
        id: 'story_001',
        title: 'The Meticulous Heist',
        difficultyLevel: 'intermediate',
        darkComedyLevel: 'high',
        vocabularyIds: ['v001', 'v002', 'v003', 'v004', 'v005', 'v006', 'v007', 'v008', 'v009', 'v010'],
        content: `You arrive at the bank at 3 AM. The plan must be absolutely {meticulous}—one wrong move and the alarm triggers.

Your hands are {trembling} as you approach the vault. "Stay calm," you whisper to yourself. This is the most {significant} moment of your criminal career.

The security guard looks {suspicious}. He's been watching you for the past 2 minutes. You maintain a {casual} expression, pretending to fill out a deposit slip at midnight. Completely normal behavior.

"Sir, we're closed," he says in a {stern} voice.

"Oh really?" You act {surprised}, as if the locked doors and darkness weren't {obvious} clues.

He escorts you out. Your heist has been {thoroughly} ruined before it even started.

Outside, you realize you forgot the most {critical} detail: banks close at 5 PM.

You are not a {competent} criminal.`,
    },
    {
        id: 'story_002',
        title: 'The Apocalypse Job Interview',
        difficultyLevel: 'advanced',
        darkComedyLevel: 'extreme',
        vocabularyIds: ['v011', 'v012', 'v013', 'v014', 'v015', 'v016', 'v017', 'v018', 'v019', 'v020'],
        content: `The zombies are {approaching} the building. You check your watch: 2:54 PM. Your job interview starts in 6 minutes.

"I need to make a good {impression}," you think, straightening your tie. The apocalypse is no excuse for being {unprofessional}.

The interviewer—missing half his face—asks about your {qualifications}. You mention your MBA. He seems {indifferent}, probably because he's actively decomposing.

"Where do you see yourself in 5 years?" he {inquires}, his jawbone hanging loose.

You consider the question {carefully}. "Well, given the current circumstances, probably hiding in a bunker eating canned beans."

He writes something down. You notice his hand is {literally} falling off.

"Do you work well under {pressure}?" 

"I'm having a job interview during a zombie apocalypse. You tell me."

He nods, {appreciating} your honesty. "You're {hired}. Start Monday."

Monday never comes. Everyone is dead by Thursday.`,
    },
    {
        id: 'story_003',
        title: 'The Sophisticated Time Traveler',
        difficultyLevel: 'expert',
        darkComedyLevel: 'extreme',
        vocabularyIds: ['v021', 'v022', 'v023', 'v024', 'v025', 'v026', 'v027', 'v028', 'v029', 'v030'],
        content: `You've traveled back to 1920. Your mission: prevent a {catastrophic} timeline split. Your method: incredibly {elaborate} planning.

The problem? You're {simultaneously} trying to maintain historical accuracy while also stopping a world war. This is proving {remarkably} difficult.

A flapper asks if you'd like to dance. You {decline} politely, explaining you're from 2026 and touching people could create a {paradox}.

She thinks you're insane. She's not {entirely} wrong.

You spot your target: a man who will {inadvertently} start World War III by inventing a {peculiar} type of sandwich in 1987. Don't ask how. Time travel logic is {convoluted}.

"Sir, would you consider becoming a vegetarian?" you ask desperately.

He looks at you, {bewildered}. "What's a vegetarian?"

You realize you've just introduced the concept 30 years too early.

The timeline splits again. There are now 47 parallel universes. You've made everything worse.

You should've just stayed home.`,
    },
];

/**
 * Get story by learned words count
 * Unlock stories sequentially based on total words learned
 * Every 10 words = 1 new story unlocked
 */
export function getStoryForProgress(
    learnedWordIds: string[],
    unlockedStoryIds: string[]
): Story | null {
    const totalLearned = learnedWordIds.length;

    // Calculate how many stories should be unlocked
    const storiesShouldBeUnlocked = Math.floor(totalLearned / 10);

    // Check if there's a new story to unlock
    if (storiesShouldBeUnlocked > unlockedStoryIds.length) {
        // Find the next story that hasn't been unlocked yet
        const nextStory = STORIES.find(story => !unlockedStoryIds.includes(story.id));
        return nextStory || null;
    }

    return null;
}

/**
 * Parse story content and highlight vocabulary words
 * Returns array of text segments with highlighting info
 */
export function parseStoryContent(content: string): Array<{ text: string; isVocab: boolean }> {
    const segments: Array<{ text: string; isVocab: boolean }> = [];
    const regex = /\{([^}]+)\}/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            segments.push({
                text: content.substring(lastIndex, match.index),
                isVocab: false,
            });
        }

        // Add the vocabulary word (without braces)
        segments.push({
            text: match[1],
            isVocab: true,
        });

        lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < content.length) {
        segments.push({
            text: content.substring(lastIndex),
            isVocab: false,
        });
    }

    return segments;
}

/**
 * Enhanced parser that includes vocab IDs for interactive stories
 */
export function parseStoryContentWithIds(
    content: string,
    vocabularyIds: string[]
): Array<{ text: string; isVocab: boolean; vocabId?: string }> {
    const segments: Array<{ text: string; isVocab: boolean; vocabId?: string }> = [];
    const regex = /\{([^}]+)\}/g;
    let lastIndex = 0;
    let match;
    let vocabIndex = 0;

    while ((match = regex.exec(content)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            segments.push({
                text: content.substring(lastIndex, match.index),
                isVocab: false,
            });
        }

        // Add the vocabulary word (without braces) with its ID
        segments.push({
            text: match[1],
            isVocab: true,
            vocabId: vocabularyIds[vocabIndex] || undefined,
        });

        vocabIndex++;
        lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < content.length) {
        segments.push({
            text: content.substring(lastIndex),
            isVocab: false,
        });
    }

    return segments;
}
