'use client';

import Link from 'next/link';
import { BookOpen, Trophy, Save, Sparkles, BookMarked, RotateCcw } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { STORIES, getStoryLearnedCount, isStoryPreviewVisible, isStoryUnlocked } from '../data/stories';
import { getProgressStats } from '../lib/eloAlgorithm';
import LearnedWordsList from '../components/LearnedWordsList';
import SRSCalendar from '../components/SRSCalendar';
import StoryUnlockModal from '../components/StoryUnlockModal';
import StoryMode from '../components/StoryMode';
import OnboardingModal from '../components/OnboardingModal';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';

function getLevelLabel(level: string) {
    switch (level) {
        case 'beginner':
            return 'Cơ bản';
        case 'intermediate':
            return 'Trung cấp';
        case 'advanced':
            return 'Nâng cao';
        case 'expert':
            return 'Chuyên gia';
        default:
            return 'Mixed';
    }
}

function getLevelBadgeClasses(level: string) {
    switch (level) {
        case 'beginner':
            return 'bg-slate-800 text-slate-400 border-slate-700';
        case 'intermediate':
            return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
        case 'advanced':
            return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
        case 'expert':
            return 'bg-cyan-500/30 text-cyan-200 border-cyan-500/40';
        default:
            return 'bg-slate-800 text-slate-400 border-slate-700';
    }
}

export default function LearnedPage() {
    const [showHelp, setShowHelp] = useState(false);
    const learnedCount = useLexicaStore(state => state.learnedWords.size);
    const learnedWords = useLexicaStore(state => state.learnedWords);
    const masteredCount = useLexicaStore(state => state.getMasteredWordsCount());
    const unlockedStories = useLexicaStore(state => state.unlockedStories);
    const readStories = useLexicaStore(state => state.readStories);
    const openStory = useLexicaStore(state => state.openStory);
    const showStoryUnlock = useLexicaStore(state => state.showStoryUnlock);
    const showStoryMode = useLexicaStore(state => state.showStoryMode);
    const currentStoryId = useLexicaStore(state => state.currentStoryId);
    const closeStory = useLexicaStore(state => state.closeStory);
    const closeStoryUnlockModal = useLexicaStore(state => state.closeStoryUnlockModal);
    const markStoryAsRead = useLexicaStore(state => state.markStoryAsRead);
    const learnedWordIds = Array.from(learnedWords);
    const cardProgress = useLexicaStore(state => state.cardProgress);
    const userStats = useLexicaStore(state => state.userStats);
    const visibleStories = STORIES.filter(story => isStoryPreviewVisible(story, learnedWordIds));
    const progressStats = getProgressStats(cardProgress);

    return (
        <div className="min-h-screen bg-slate-900 px-4 py-8">
            {showHelp && (
                <OnboardingModal onComplete={() => setShowHelp(false)} />
            )}
            {/* Help Button */}
            <button
                onClick={() => setShowHelp(true)}
                className="fixed bottom-5 right-5 z-50 w-8 h-8 rounded-full bg-slate-700 border border-slate-600 hover:border-cyan-500 hover:bg-slate-600 transition-colors flex items-center justify-center text-slate-400 hover:text-cyan-400 text-sm font-bold"
                aria-label="Hướng dẫn"
            >
                ?
            </button>
            {/* Header */}
            <div className="max-w-2xl mx-auto mb-8">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-6 group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span>
                    <span>Quay lại trang chính</span>
                </Link>

                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <BookOpen className="w-8 h-8 text-cyan-400" />
                        <h1 className="text-4xl md:text-5xl font-bold text-white">
                            Từ đã học
                        </h1>
                    </div>
                    <div className="flex items-center justify-center gap-8 text-base flex-wrap">
                        <div className="flex flex-col items-center">
                            <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">Tổng số</span>
                            <span className="text-white font-bold text-2xl tracking-tight">{learnedCount}</span>
                        </div>
                        <div className="w-px h-10 bg-slate-800"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">Thành thạo</span>
                            <span className="text-amber-400 font-bold text-2xl tracking-tight flex items-center gap-1.5">
                                {masteredCount}
                                <Trophy className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="w-px h-10 bg-slate-800"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">Stories</span>
                            <span className="text-cyan-400 font-bold text-2xl tracking-tight flex items-center gap-1.5">
                                {unlockedStories.length}<span className="text-slate-600 text-sm font-medium">/{STORIES.length}</span>
                                <BookMarked className="w-4 h-4" />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                {learnedCount > 0 && (
                    <div className="mb-6 px-4 py-3 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-2">
                            <span>Tiến độ thành thạo</span>
                            <span className="text-cyan-400">{Math.round((masteredCount / learnedCount) * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-cyan-500 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                                style={{ width: `${(masteredCount / learnedCount) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            {/* SRS Calendar */}
            <div className="max-w-2xl mx-auto mb-8">
                <SRSCalendar cardProgress={cardProgress} />
                {progressStats.dueToday > 0 && (
                    <Link href="/review" className="mt-3 flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 transition-all hover:scale-[1.01] active:scale-95">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/20">
                                <RotateCcw className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <div className="text-amber-200 font-semibold text-sm">Ôn tập hôm nay</div>
                                <div className="text-amber-400/70 text-xs">{progressStats.dueToday} từ cần ôn</div>
                            </div>
                        </div>
                        <span className="text-amber-400 text-lg font-bold">→</span>
                    </Link>
                )}
            </div>

            {/* Stories Section */}
            {visibleStories.length > 0 && (
                <div className="max-w-2xl mx-auto mb-8 bg-slate-800/30 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <BookMarked className="w-6 h-6 text-cyan-400" />
                        <h2 className="text-2xl font-bold text-white">Story Packs</h2>
                        <span className="ml-auto px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-xs font-medium">
                            {visibleStories.length}
                        </span>
                    </div>

                    <div className="space-y-3 max-h-100 overflow-y-auto pr-1">
                        {visibleStories.map((story) => {
                            const storyId = story.id;
                            const isRead = readStories.includes(storyId);
                            const learnedCountForStory = getStoryLearnedCount(story, learnedWordIds);
                            const unlocked = isStoryUnlocked(story, learnedWordIds);
                            const alreadyAnnounced = unlockedStories.includes(storyId);

                            return (
                                <button
                                    key={storyId}
                                    onClick={() => {
                                        if (unlocked) {
                                            openStory(storyId);
                                        }
                                    }}
                                    className={`w-full px-4 py-4 rounded-lg border transition-all text-left group ${unlocked
                                        ? 'bg-slate-700/30 hover:bg-slate-700/50 border-slate-600/30 hover:border-cyan-500/50'
                                        : 'bg-slate-800/40 border-slate-700/50 cursor-default'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <BookMarked className={`w-5 h-5 ${unlocked ? (isRead ? 'text-slate-500' : 'text-cyan-400') : 'text-slate-500'}`} />
                                                <span className={`text-lg font-semibold ${unlocked ? (isRead ? 'text-slate-400' : 'text-white') : 'text-slate-300'}`}>
                                                    {story.title}
                                                </span>
                                            </div>
                                            <div className="ml-8">
                                                <div className="flex flex-wrap items-center gap-2.5 mb-2">
                                                    <span className={`px-2 py-1 rounded-full border text-xs font-medium ${getLevelBadgeClasses(story.difficultyLevel)}`}>
                                                        {getLevelLabel(story.difficultyLevel)}
                                                    </span>
                                                    <span className="text-sm text-slate-500">
                                                        {learnedCountForStory}/10
                                                    </span>
                                                    <span className="text-slate-600">•</span>
                                                    <span className="text-sm text-slate-500">
                                                        {story.darkComedyLevel === 'extreme' ? 'Dark comedy cực mạnh' : story.darkComedyLevel === 'high' ? 'Dark comedy cao' : 'Dark comedy vừa'}
                                                    </span>
                                                    {unlocked && !isRead && (
                                                        <span className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium">
                                                            Unread
                                                        </span>
                                                    )}
                                                    {!unlocked && learnedCountForStory >= 2 && (
                                                        <span className="px-2 py-1 rounded-full bg-slate-700 text-slate-300 text-xs font-medium">
                                                            Preview
                                                        </span>
                                                    )}
                                                    {unlocked && alreadyAnnounced && (
                                                        <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                                                            10/10
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-3">
                                                    <div
                                                        className={`h-full transition-all duration-500 ${unlocked ? 'bg-cyan-400' : 'bg-slate-500'}`}
                                                        style={{ width: `${(learnedCountForStory / 10) * 100}%` }}
                                                    />
                                                </div>

                                                <p className="text-sm text-slate-400 leading-relaxed">
                                                    {story.teaser}
                                                </p>

                                                {!unlocked && (
                                                    <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                                                        Thu thập thêm {10 - learnedCountForStory} từ trong pack này để mở khóa story.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>


                </div>
            )}

            {/* Learned Words List */}
            <div className="max-w-2xl mx-auto">
                <LearnedWordsList />
            </div>

            {/* Footer Info */}
            <div className="max-w-2xl mx-auto mt-12 text-center space-y-2">
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                    <Save className="w-3.5 h-3.5" />
                    Dữ liệu được lưu an toàn trong localStorage
                </p>
                <p className="text-xs text-slate-600 flex items-center justify-center gap-1.5">
                    Mỗi ngày bạn học, bộ não sẽ mạnh hơn một chút
                    <Sparkles className="w-3.5 h-3.5" />
                </p>
            </div>

            {/* Story Unlock Modal */}
            <AnimatePresence>
                {showStoryUnlock && currentStoryId && (
                    <StoryUnlockModal
                        storyId={currentStoryId}
                        onReadNow={() => {
                            if (currentStoryId) {
                                openStory(currentStoryId);
                            }
                        }}
                        onClose={closeStoryUnlockModal}
                    />
                )}
            </AnimatePresence>

            {/* Story Mode */}
            {showStoryMode && currentStoryId && (
                <StoryMode
                    storyId={currentStoryId}
                    onClose={closeStory}
                    onFinish={() => {
                        if (currentStoryId) {
                            markStoryAsRead(currentStoryId);
                        }
                        closeStory();
                    }}
                />
            )}
        </div>
    );
}
