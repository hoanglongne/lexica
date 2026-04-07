'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, BookOpen, Trophy, Volume2 } from 'lucide-react';
import { STORIES, parseStoryContentWithIds } from '../data/stories';
import { VOCAB_DATABASE } from '../data/vocabCards';

interface StoryModeProps {
    storyId: string;
    onClose: () => void;
    onFinish: () => void;
}

export default function StoryMode({ storyId, onClose, onFinish }: StoryModeProps) {
    const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
    const [selectedVocabId, setSelectedVocabId] = useState<string | null>(null);
    const story = STORIES.find(s => s.id === storyId);

    if (!story) return null;

    const contentSegments = parseStoryContentWithIds(story.content, story.vocabularyIds);
    const selectedVocab = selectedVocabId
        ? VOCAB_DATABASE.find(v => v.id === selectedVocabId)
        : null;

    // Track scroll to show CTA
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const element = e.currentTarget;
        const scrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100;
        if (scrolledToBottom && !hasScrolledToEnd) {
            setHasScrolledToEnd(true);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 z-10">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-cyan-400" />
                        <div>
                            <h1 className="text-lg font-bold text-white">{story.title}</h1>
                            <p className="text-xs text-slate-500">
                                {story.vocabularyIds.length} từ vựng
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Story Content */}
            <div
                className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
                onScroll={handleScroll}
            >
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Story text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="prose prose-invert max-w-none"
                    >
                        <div className="text-slate-300 text-base lg:text-lg leading-relaxed whitespace-pre-wrap">
                            {contentSegments.map((segment, index) => {
                                if (segment.isVocab && segment.vocabId) {
                                    return (
                                        <motion.button
                                            key={index}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => setSelectedVocabId(segment.vocabId || null)}
                                            className="text-cyan-400 font-semibold bg-cyan-500/10 px-1 rounded hover:bg-cyan-500/20 cursor-pointer transition-colors border-b-2 border-cyan-500/30 hover:border-cyan-400"
                                            title="Click to see definition"
                                        >
                                            {segment.text}
                                        </motion.button>
                                    );
                                }
                                return <span key={index}>{segment.text}</span>;
                            })}
                        </div>
                    </motion.div>

                    {/* Vocabulary summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
                    >
                        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-cyan-400" />
                            Từ vựng trong câu chuyện này
                        </h3>
                        <p className="text-xs text-slate-500">
                            Bạn đã học được {story.vocabularyIds.length} từ được làm nổi bật bên trên
                        </p>
                    </motion.div>

                    {/* ORATIO Funnel CTA */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{
                            opacity: hasScrolledToEnd ? 1 : 0.3,
                            scale: hasScrolledToEnd ? 1 : 0.95,
                        }}
                        transition={{ duration: 0.5 }}
                        className="bg-cyan-500/10 border-2 border-cyan-500/50 rounded-2xl p-6 space-y-4"
                    >
                        <div className="text-center space-y-2">
                            <h3 className="text-xl lg:text-2xl font-bold text-white">
                                Vocabulary is dead until spoken.
                            </h3>
                            <p className="text-slate-300 text-sm lg:text-base">
                                Hãy lấy câu chuyện vô lý này và tranh luận nó với một người thật trên ORATIO ngay bây giờ.
                            </p>
                        </div>

                        <a
                            href="https://oratio.example.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={onFinish}
                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-center py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 group"
                        >
                            <span className="text-lg">Thử ORATIO miễn phí</span>
                            <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </a>

                        <p className="text-center text-xs text-slate-500">
                            100% miễn phí • Luyện speaking IELTS với người thật • Không quảng cáo
                        </p>
                    </motion.div>

                    {/* Bottom padding for mobile */}
                    <div className="h-20 lg:h-8" />
                </div>
            </div>

            {/* Bottom hint (mobile only) */}
            {!hasScrolledToEnd && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:hidden sticky bottom-0 bg-slate-900 p-4 text-center border-t border-slate-800"
                >
                    <p className="text-slate-500 text-sm">👇 Cuộn xuống để xem tiếp</p>
                </motion.div>
            )}

            {/* Vocabulary Detail Modal */}
            <AnimatePresence>
                {selectedVocab && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedVocabId(null)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-slate-800 border-2 border-cyan-500/50 rounded-2xl p-6 z-50 shadow-2xl"
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setSelectedVocabId(null)}
                                className="absolute top-4 right-4 p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>

                            {/* Word */}
                            <div className="mb-4">
                                <h2 className="text-3xl font-bold text-cyan-400 mb-2">
                                    {selectedVocab.word}
                                </h2>
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-400 text-sm font-mono">
                                        {selectedVocab.ipa}
                                    </span>
                                    <button
                                        onClick={() => {
                                            const utterance = new SpeechSynthesisUtterance(selectedVocab.word);
                                            utterance.lang = 'en-US';
                                            utterance.rate = 0.8;
                                            speechSynthesis.speak(utterance);
                                        }}
                                        className="p-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg transition-colors"
                                        title="Hear pronunciation"
                                    >
                                        <Volume2 className="w-4 h-4 text-cyan-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Definition */}
                            <div className="mb-4">
                                <h3 className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">
                                    Meaning
                                </h3>
                                <p className="text-white text-sm">
                                    {selectedVocab.translationHint}
                                </p>
                            </div>

                            {/* Example Scenario */}
                            <div className="mb-4">
                                <h3 className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">
                                    Example
                                </h3>
                                <p className="text-slate-300 text-sm italic leading-relaxed">
                                    &ldquo;{selectedVocab.scenario}&rdquo;
                                </p>
                            </div>

                            {/* Level Badge */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                                <span className="text-xs text-slate-500">Level</span>
                                <span className="text-xs font-semibold text-cyan-400 uppercase">
                                    {selectedVocab.level}
                                </span>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
