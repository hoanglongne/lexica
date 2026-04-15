'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Zap, Mic, BookOpen, Trophy, Sprout, Leaf, Sparkles, Flame } from 'lucide-react';

interface OnboardingModalProps {
    onComplete: () => void;
}

const STEPS = [
    {
        icon: Zap,
        iconColor: 'text-cyan-400',
        iconBg: 'bg-cyan-500/15 border-cyan-500/30',
        title: 'Chào mừng đến LEXICA',
        body: 'LEXICA giúp bạn học từ vựng tiếng Anh theo cách tốt nhất: học bằng ngữ cảnh thực tế, ôn tập đúng lúc trước khi quên.',
        detail: 'Mỗi ngày bạn có 30 năng lượng ⚡. Hết năng lượng → nghỉ ngơi → hôm sau học tiếp.',
    },
    {
        icon: BookOpen,
        iconColor: 'text-green-400',
        iconBg: 'bg-green-500/15 border-green-500/30',
        title: 'Quẹt để học',
        body: (
            <span>
                Mỗi card có một tình huống thực tế. Đọc tình huống, đoán từ, rồi quyết định:
            </span>
        ),
        detail: null,
        cards: [
            { icon: '←', label: 'Quẹt Trái', desc: 'Chưa nhớ — từ sẽ quay lại sau 1 ngày', color: 'border-red-500/40 bg-red-500/10 text-red-300' },
            { icon: '→', label: 'Quẹt Phải', desc: 'Đã nhớ — vào danh sách từ đã học', color: 'border-green-500/40 bg-green-500/10 text-green-300' },
        ],
    },
    {
        icon: Mic,
        iconColor: 'text-purple-400',
        iconBg: 'bg-purple-500/15 border-purple-500/30',
        title: 'Voice Mode',
        body: 'Bật Voice Mode để luyện phát âm. Thay vì quẹt tay, bạn phải nói đúng từ 3 lần liên tiếp mới được "nhớ".',
        detail: 'Boss Card 🗡️ luôn yêu cầu Voice Mode, kể cả khi bạn đang ở Touch Mode.',
    },
    {
        icon: Trophy,
        iconColor: 'text-yellow-400',
        iconBg: 'bg-yellow-500/15 border-yellow-500/30',
        title: 'Hệ thống ôn tập thông minh',
        body: 'Mỗi từ bạn học sẽ được lên lịch ôn tập tự động: 1 ngày → 3 ngày → 7 ngày → 14 ngày.',
        detail: 'Học đủ 10 từ → mở khóa Story Mode 📖. Đọc câu chuyện vô lý để ôn lại toàn bộ từ vựng đã học.',
    },
    {
        icon: Sprout,
        iconColor: 'text-emerald-400',
        iconBg: 'bg-emerald-500/15 border-emerald-500/30',
        title: 'Trạng thái từ vựng',
        body: 'Mỗi từ bạn học đều có trạng thái phát triển riêng. Ôn tập đúng lịch để từ "lớn lên":',
        detail: null,
        cards: [
            { icon: <Sprout className="w-4 h-4" />, label: 'Seed — Đang học', desc: 'Mới gặp, chưa vào bộ nhớ dài hạn', color: 'border-green-500/40 bg-green-500/10 text-green-300' },
            { icon: <Leaf className="w-4 h-4" />, label: 'Sprout — Đang nhớ', desc: 'Đã ôn 1–2 lần, đang củng cố', color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' },
            { icon: <Sparkles className="w-4 h-4" />, label: 'Gold — Thuộc tốt', desc: 'Nhớ vững, ôn thưa dần', color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300' },
            { icon: <Trophy className="w-4 h-4" />, label: 'Mastered — Thành thạo', desc: 'Nhớ lâu dài, không cần ôn nữa', color: 'border-orange-500/40 bg-orange-500/10 text-orange-300' },
        ],
    },
    {
        icon: Flame,
        iconColor: 'text-orange-400',
        iconBg: 'bg-orange-500/15 border-orange-500/30',
        title: 'Streak & Trang "Đã học"',
        body: 'Mỗi ngày bạn swipe ít nhất 1 từ = +1 streak 🔥. Bỏ 1 ngày là streak về 0. Đạt các mốc 7, 14, 30, 60, 100 ngày để tự hào.',
        detail: 'Vào trang "Đã học" để xem toàn bộ từ vựng đã học, lịch ôn tập SRS theo ngày, tiến trình Story Pack — và nhấn vào từng từ để xem chi tiết.',
    },
];

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);

    const currentStep = STEPS[step];
    const Icon = currentStep.icon;
    const isLast = step === STEPS.length - 1;

    const goNext = () => {
        if (isLast) { onComplete(); return; }
        setDirection(1);
        setStep(s => s + 1);
    };

    const goPrev = () => {
        setDirection(-1);
        setStep(s => s - 1);
    };

    return (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-t-3xl sm:rounded-2xl p-6 pb-8 mx-0 sm:mx-4 overflow-hidden"
            >
                {/* Skip button */}
                <button
                    onClick={onComplete}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-200"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Step indicator */}
                <div className="flex items-center gap-1.5 mb-6">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'bg-cyan-400 w-6' : i < step ? 'bg-cyan-600 w-3' : 'bg-slate-600 w-3'}`}
                        />
                    ))}
                </div>

                {/* Content — slides in */}
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        initial={{ x: direction * 60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: direction * -60, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 min-h-48"
                    >
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${currentStep.iconBg}`}>
                            <Icon className={`w-7 h-7 ${currentStep.iconColor}`} />
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-bold text-white">{currentStep.title}</h2>

                        {/* Body */}
                        <p className="text-slate-300 text-sm leading-relaxed">{currentStep.body}</p>

                        {/* Swipe cards (step 2 only) */}
                        {'cards' in currentStep && currentStep.cards && (
                            <div className="space-y-2 mt-2">
                                {currentStep.cards.map(c => (
                                    <div key={c.label} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${c.color}`}>
                                        <span className="text-xl font-bold w-5 flex items-center justify-center shrink-0">{c.icon}</span>
                                        <div>
                                            <p className="font-semibold text-sm">{c.label}</p>
                                            <p className="text-xs opacity-75 mt-0.5">{c.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Detail */}
                        {currentStep.detail && (
                            <p className="text-xs text-slate-400 bg-slate-700/50 rounded-lg px-3 py-2.5 leading-relaxed border border-slate-700">
                                {currentStep.detail}
                            </p>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6 gap-3">
                    <button
                        onClick={goPrev}
                        disabled={step === 0}
                        className="p-2.5 rounded-xl border border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                        onClick={goNext}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-sm transition-colors active:scale-95"
                    >
                        {isLast ? 'Bắt đầu học!' : 'Tiếp theo'}
                        {!isLast && <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
