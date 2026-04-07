'use client';

import { Sprout, Leaf, Sparkles, Trophy, Target, CheckCircle } from 'lucide-react';
import { DifficultyLevel } from './VocabCard';

interface LevelSelectorProps {
    onSelect: (level: DifficultyLevel | 'all') => void;
    currentLevel: DifficultyLevel | 'all' | null;
}

interface LevelOption {
    value: DifficultyLevel | 'all';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    eloRange: string;
    cardCount: string;
    color: string;
    borderColor: string;
    hoverColor: string;
}

const LEVEL_OPTIONS: LevelOption[] = [
    {
        value: 'beginner',
        label: 'Cơ bản',
        icon: Sprout,
        description: 'Từ vựng dễ, phù hợp người mới bắt đầu',
        eloRange: 'ELO 800-950',
        cardCount: '~10 từ',
        color: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/30',
        hoverColor: 'hover:border-cyan-400 hover:bg-cyan-500/20',
    },
    {
        value: 'intermediate',
        label: 'Trung cấp',
        icon: Leaf,
        description: 'Từ vựng phổ biến trong IELTS',
        eloRange: 'ELO 900-1200',
        cardCount: '~25 từ',
        color: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/30',
        hoverColor: 'hover:border-cyan-400 hover:bg-cyan-500/20',
    },
    {
        value: 'advanced',
        label: 'Nâng cao',
        icon: Sparkles,
        description: 'Từ vựng học thuật phức tạp hơn',
        eloRange: 'ELO 1100-1400',
        cardCount: '~30 từ',
        color: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/30',
        hoverColor: 'hover:border-cyan-400 hover:bg-cyan-500/20',
    },
    {
        value: 'expert',
        label: 'Chuyên gia',
        icon: Trophy,
        description: 'Từ vựng advanced cho band 8+',
        eloRange: 'ELO 1300-1500',
        cardCount: '~30 từ',
        color: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/30',
        hoverColor: 'hover:border-cyan-400 hover:bg-cyan-500/20',
    },
    {
        value: 'all',
        label: 'Tất cả',
        icon: Target,
        description: 'Học hết 60 từ, hệ thống sẽ adaptive theo khả năng',
        eloRange: 'ELO 800-1500',
        cardCount: '60 từ',
        color: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/30',
        hoverColor: 'hover:border-cyan-400 hover:bg-cyan-500/20',
    },
];

export default function LevelSelector({ onSelect, currentLevel }: LevelSelectorProps) {
    return (
        <div className="w-full h-full px-4">
            {/* Logo - Top Left */}
            <div className="fixed top-4 left-4 md:top-6 md:left-6 z-50">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    LEXICA
                </h1>
            </div>

            {/* Content */}
            <div className="w-full max-w-4xl mx-auto pt-20 md:pt-24 space-y-6">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                        Chọn độ khó
                    </h2>
                    <p className="text-slate-400 text-sm md:text-base">
                        Chọn level phù hợp với trình độ của bạn. Bạn có thể đổi level bất cứ lúc nào.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {LEVEL_OPTIONS.map((option) => {
                        const isSelected = currentLevel === option.value;

                        return (
                            <button
                                key={option.value}
                                onClick={() => onSelect(option.value)}
                                className={`
                                relative p-6 rounded-2xl border-2 text-left
                                transition-all duration-300
                                ${option.color}
                                ${option.borderColor}
                                ${option.hoverColor}
                                transform hover:scale-105
                                ${isSelected ? 'ring-4 ring-cyan-400/50 scale-105' : 'hover:shadow-xl'}
                            `}
                            >
                                {/* Selected indicator */}
                                {isSelected && (
                                    <div className="absolute top-2 right-2">
                                        <CheckCircle className="w-6 h-6 text-cyan-400" />
                                    </div>
                                )}

                                {/* Icon */}
                                <div className="flex justify-center mb-3">
                                    <option.icon className="w-10 h-10 text-cyan-400" />
                                </div>

                                {/* Label */}
                                <div className="text-xl font-bold text-white mb-2">
                                    {option.label}
                                </div>

                                {/* Description */}
                                <p className="text-sm text-slate-300 mb-4 min-h-10">
                                    {option.description}
                                </p>

                                {/* Stats */}
                                <div className="space-y-1 text-xs text-slate-400">
                                    <div className="flex items-center justify-between">
                                        <span>Độ khó:</span>
                                        <span className="font-mono">{option.eloRange}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Số lượng:</span>
                                        <span className="font-semibold text-cyan-400">{option.cardCount}</span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="text-center text-xs text-slate-500 space-y-1">
                    <p>Hệ thống sẽ tự động điều chỉnh độ khó dựa trên performance của bạn</p>
                    <p>ELO routing đảm bảo bạn luôn ở flow state tối ưu</p>
                </div>
            </div>
        </div>
    );
}
