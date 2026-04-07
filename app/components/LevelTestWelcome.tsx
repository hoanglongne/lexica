'use client';

import { Lightbulb, Gamepad2, FlaskConical, CheckCircle } from 'lucide-react';

interface LevelTestWelcomeProps {
    onStartTest: () => void;
    onSkipToManual: () => void;
}

export default function LevelTestWelcome({ onStartTest, onSkipToManual }: LevelTestWelcomeProps) {
    return (
        <div className="w-full h-full px-4">
            {/* Logo - Top Left */}
            <div className="fixed top-4 left-4 md:top-6 md:left-6 z-50">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    LEXICA
                </h1>
            </div>

            {/* Content */}
            <div className="w-full max-w-2xl mx-auto pt-20 md:pt-24 space-y-6 md:space-y-8">
                {/* Header */}
                <div className="text-center space-y-3 md:space-y-4">
                    <p className="text-lg md:text-xl text-slate-300 md:hidden">
                        Học từ vựng IELTS theo level của bạn
                    </p>
                    <p className="hidden md:block text-lg md:text-xl text-slate-300">
                        Học từ vựng IELTS với ELO-based adaptive learning
                    </p>
                    <p className="text-slate-400 text-xs md:text-sm">
                        60 từ vựng cao cấp • ELO routing • Spaced repetition
                    </p>
                </div>

                {/* Welcome Message */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl md:rounded-2xl p-6 md:p-8">
                    <div className="text-center space-y-2 md:space-y-3 mb-4 md:mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-white">
                            Chào mừng lần đầu!
                        </h2>
                        <p className="text-sm md:text-base text-slate-300">
                            Để trải nghiệm tốt nhất, chúng tôi cần biết trình độ của bạn
                        </p>
                    </div>

                    {/* Options */}
                    <div className="space-y-3 md:space-y-4">
                        {/* Test Option - Recommended */}
                        <button
                            onClick={onStartTest}
                            className="w-full p-4 md:p-6 rounded-lg md:rounded-xl bg-cyan-500/10 border-2 border-cyan-500/30 hover:border-cyan-400 transition-all hover:scale-[1.02] active:scale-95 group"
                        >
                            <div className="flex items-start gap-3 md:gap-4">
                                <div className="p-2 rounded-lg bg-cyan-500/10 group-hover:scale-110 transition-transform shrink-0">
                                    <FlaskConical className="w-6 h-6 md:w-7 md:h-7 text-cyan-400" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 mb-1">
                                        <h3 className="text-base md:text-lg font-bold text-white leading-tight">
                                            Test nhanh (30s)
                                        </h3>
                                        <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
                                            Recommended
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-300 mb-2 leading-relaxed md:hidden">
                                        Gợi ý level nhanh, chính xác.
                                    </p>
                                    <p className="hidden md:block text-sm text-slate-300 mb-2 leading-relaxed">
                                        Hệ thống sẽ đánh giá và gợi ý level phù hợp nhất
                                    </p>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            5 câu hỏi
                                        </span>
                                        <span className="hidden md:inline">•</span>
                                        <span className="hidden md:flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            Chính xác hơn
                                        </span>
                                        <span className="hidden md:inline">•</span>
                                        <span className="hidden md:flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            Adaptive ngay từ đầu
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* Manual Option */}
                        <button
                            onClick={onSkipToManual}
                            className="w-full p-4 md:p-6 rounded-lg md:rounded-xl bg-slate-700/30 border-2 border-slate-600/30 hover:border-slate-500 transition-all hover:scale-[1.02] active:scale-95 group"
                        >
                            <div className="flex items-start gap-3 md:gap-4">
                                <div className="p-2 rounded-lg bg-slate-700/30 group-hover:scale-110 transition-transform shrink-0">
                                    <Gamepad2 className="w-6 h-6 md:w-7 md:h-7 text-slate-300" />
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="text-base md:text-lg font-bold text-white mb-1">
                                        Tự chọn level
                                    </h3>
                                    <p className="text-sm text-slate-300 mb-2 leading-relaxed md:hidden">
                                        Chọn level bạn muốn học.
                                    </p>
                                    <p className="hidden md:block text-sm text-slate-300 mb-2 leading-relaxed">
                                        Chọn level phù hợp với trình độ của bạn.
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <span>4 level: Cơ bản / Trung cấp / Nâng cao / Chuyên gia</span>
                                    </div>
                                    <p className="hidden md:block text-xs text-slate-400 mt-2 leading-relaxed">
                                        Hệ thống sẽ tự động điều chỉnh độ khó dựa trên performance của bạn. ELO routing đảm bảo bạn luôn ở flow state tối ưu cho bạn. Bạn có thể đổi level bất cứ lúc nào.
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="text-center text-xs text-slate-500 space-y-1">
                    <p className="flex items-center justify-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5" />
                        Bắt đầu với test 30 giây để hệ thống cân bằng độ khó chuẩn hơn
                    </p>
                </div>
            </div>
        </div>
    );
}
