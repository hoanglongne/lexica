'use client';

import { Sprout, Leaf, Sparkles, Trophy, Lightbulb, Target as TargetIcon, CheckCircle } from 'lucide-react';
import { DifficultyLevel } from './VocabCard';

interface LevelTestResultProps {
    score: number;
    totalQuestions: number;
    recommendedLevel: DifficultyLevel;
    calibratedElo?: number;
    onAccept: () => void;
    onChooseManually: () => void;
}

const LEVEL_INFO = {
    beginner: {
        icon: Sprout,
        label: 'Cơ bản',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        description: 'Bạn đang ở giai đoạn xây dựng nền tảng. Từ vựng cơ bản sẽ giúp bạn tự tin hơn!',
        cardCount: '40 từ',
        eloRange: 'ELO 800-950'
    },
    intermediate: {
        icon: Leaf,
        label: 'Trung cấp',
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/30',
        description: 'Bạn đã có nền tảng tốt! Các từ vựng phổ biến trong IELTS sẽ nâng band điểm của bạn.',
        cardCount: '72 từ',
        eloRange: 'ELO 950-1200'
    },
    advanced: {
        icon: Sparkles,
        label: 'Nâng cao',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30',
        description: 'Ấn tượng! Bạn đã sẵn sàng với từ vựng học thuật phức tạp hơn.',
        cardCount: '98 từ',
        eloRange: 'ELO 1100-1400'
    },
    expert: {
        icon: Trophy,
        label: 'Chuyên gia',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        description: 'Xuất sắc! Bạn thuộc top tier. Từ vựng advanced cho band 8+ đang chờ bạn!',
        cardCount: '90 từ',
        eloRange: 'ELO 1350-1500'
    }
};

export default function LevelTestResult({
    score,
    totalQuestions,
    recommendedLevel,
    calibratedElo,
    onAccept,
    onChooseManually
}: LevelTestResultProps) {
    const levelInfo = LEVEL_INFO[recommendedLevel];
    const percentage = Math.round((score / totalQuestions) * 100);

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
                {/* Celebration Animation */}
                <div className="text-center space-y-3 md:space-y-4 animate-[fadeIn_0.5s_ease-out]">
                    <div className="flex justify-center">
                        <div className="p-6 md:p-8 bg-slate-800/50 rounded-2xl animate-[bounce_1s_ease-in-out]">
                            <levelInfo.icon className={`w-16 h-16 md:w-20 md:h-20 ${levelInfo.color}`} />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                        Kết quả của bạn!
                    </h1>
                </div>

                {/* Score Card */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl md:rounded-2xl p-5 md:p-8 space-y-5 md:space-y-6">
                    {/* Score Display */}
                    <div className="text-center space-y-2">
                        <div className="text-5xl md:text-6xl font-bold text-white">
                            {score}/{totalQuestions}
                        </div>
                        <div className="text-lg md:text-xl text-slate-300">
                            {percentage}% chính xác
                        </div>
                        {calibratedElo !== undefined && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-700/60 rounded-full text-sm font-mono text-cyan-400 border border-cyan-500/20">
                                <TargetIcon className="w-3.5 h-3.5" />
                                ELO khởi điểm: {calibratedElo}
                            </div>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 bg-slate-900 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-1000 ease-out ${percentage >= 80 ? 'bg-yellow-400' :
                                percentage >= 60 ? 'bg-purple-400' :
                                    percentage >= 40 ? 'bg-cyan-400' :
                                        'bg-green-400'
                                }`}
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>

                    <div className="h-px bg-slate-700"></div>

                    {/* Recommended Level */}
                    <div className={`p-4 md:p-6 rounded-lg md:rounded-xl ${levelInfo.bgColor} border-2 ${levelInfo.borderColor}`}>
                        <div className="flex items-start gap-3 md:gap-4">
                            <div className="p-2 bg-slate-800/50 rounded-lg shrink-0">
                                <levelInfo.icon className="w-8 h-8 md:w-10 md:h-10 text-cyan-400" />
                            </div>
                            <div className="flex-1 space-y-3">
                                <div>
                                    <h3 className={`text-xl md:text-2xl font-bold ${levelInfo.color} mb-1`}>
                                        Level: {levelInfo.label}
                                    </h3>
                                    <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                                        {levelInfo.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                                    <div className="bg-slate-900/50 rounded-lg p-3">
                                        <div className="text-slate-500 mb-1">Số lượng từ</div>
                                        <div className={`font-bold ${levelInfo.color}`}>
                                            {levelInfo.cardCount}
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-lg p-3">
                                        <div className="text-slate-500 mb-1">Độ khó</div>
                                        <div className={`font-bold font-mono text-xs ${levelInfo.color}`}>
                                            {levelInfo.eloRange}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 md:space-y-3">
                        <button
                            onClick={onAccept}
                            className="w-full py-3 md:py-4 rounded-lg md:rounded-xl bg-cyan-500 text-white font-bold text-base md:text-lg hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Bắt đầu với level {levelInfo.label}
                            </span>
                        </button>

                        <button
                            onClick={onChooseManually}
                            className="w-full py-2.5 md:py-3 rounded-lg md:rounded-xl bg-slate-700/30 border border-slate-600/30 text-slate-300 text-sm md:text-base hover:border-slate-500 hover:bg-slate-700/50 transition-all"
                        >
                            Hoặc tự chọn level khác
                        </button>
                    </div>
                </div>

                {/* Info Footer */}
                <div className="text-center text-xs text-slate-500 space-y-1">
                    <p className="flex items-center justify-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Hệ thống sẽ tự động điều chỉnh độ khó dựa trên performance của bạn</span>
                    </p>
                    <p className="flex items-center justify-center gap-1.5">
                        <TargetIcon className="w-3.5 h-3.5" />
                        <span>Bạn có thể thay đổi level bất cứ lúc nào trong quá trình học</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
