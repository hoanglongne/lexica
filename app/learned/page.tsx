'use client';

import Link from 'next/link';
import { BookOpen, Trophy, Save, Sparkles, BookMarked } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { STORIES } from '../data/stories';
import LearnedWordsList from '../components/LearnedWordsList';
import StoryUnlockModal from '../components/StoryUnlockModal';
import StoryMode from '../components/StoryMode';
import { AnimatePresence } from 'framer-motion';

export default function LearnedPage() {
    const learnedCount = useLexicaStore(state => state.learnedWords.size);
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

    return (
        <div className="min-h-screen bg-slate-900 px-4 py-8">
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
                    <div className="flex items-center justify-center gap-8 text-base">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400">Tổng số:</span>
                            <span className="text-cyan-400 font-bold text-2xl">{learnedCount}</span>
                        </div>
                        <div className="w-px h-8 bg-slate-700"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400">Thành thạo:</span>
                            <span className="text-yellow-400 font-bold text-2xl flex items-center gap-1.5">
                                {masteredCount}
                                <Trophy className="w-5 h-5" />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                {learnedCount > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                            <span>Tiến độ</span>
                            <span>{Math.round((masteredCount / learnedCount) * 100)}% thành thạo</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-linear-to-r from-cyan-500 to-yellow-400 transition-all duration-500"
                                style={{ width: `${(masteredCount / learnedCount) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Stories Section */}
            {unlockedStories.length > 0 && (
                <div className="mb-8 bg-slate-800/30 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <BookMarked className="w-6 h-6 text-cyan-400" />
                        <h2 className="text-2xl font-bold text-white">Unlocked Stories</h2>
                    </div>

                    <div className="space-y-3">
                        {unlockedStories.map((storyId) => {
                            const story = STORIES.find(s => s.id === storyId);
                            if (!story) return null;

                            const isRead = readStories.includes(storyId);

                            return (
                                <button
                                    key={storyId}
                                    onClick={() => openStory(storyId)}
                                    className="w-full px-4 py-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 hover:border-cyan-500/50 transition-all text-left group"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <BookMarked className={`w-5 h-5 ${isRead ? 'text-slate-500' : 'text-cyan-400'}`} />
                                                <span className={`text-lg font-semibold ${isRead ? 'text-slate-400' : 'text-white'}`}>
                                                    {story.title}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 ml-8">
                                                <span className="text-sm text-slate-500">
                                                    {story.difficultyLevel === 'beginner' ? 'Cơ bản' :
                                                        story.difficultyLevel === 'intermediate' ? 'Trung cấp' :
                                                            story.difficultyLevel === 'advanced' ? 'Nâng cao' : 'Chuyên gia'}
                                                </span>
                                                <span className="text-slate-600">•</span>
                                                <span className="text-sm text-slate-500">
                                                    {story.vocabularyIds.length} words
                                                </span>
                                                {!isRead && (
                                                    <>
                                                        <span className="text-slate-600">•</span>
                                                        <span className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium">
                                                            Unread
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <p className="text-xs text-slate-500 mt-4 text-center">
                        Unlock 1 new story for every 10 words learned
                    </p>
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
