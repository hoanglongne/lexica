'use client';

import { useState } from 'react';
import { Lightbulb, Target as TargetIcon } from 'lucide-react';
import { DifficultyLevel } from './VocabCard';

interface TestQuestion {
    id: string;
    word: string;
    ipa: string;
    scenario: string;
    options: string[];
    correctAnswer: number; // index in options array
    level: DifficultyLevel;
}

const TEST_QUESTIONS: TestQuestion[] = [
    {
        id: 'q1',
        word: 'ABUNDANT',
        ipa: 'əˈbʌndənt',
        scenario: 'Ảnh couple mới của ex tôi ABUNDANT trên Instagram vãi.',
        options: [
            'Hiếm hoi, khan hiếm',
            'Dư thừa, nhiều hơn cần thiết',
            'Đẹp đẽ, ấn tượng',
            'Gây shock, bất ngờ'
        ],
        correctAnswer: 1,
        level: 'beginner'
    },
    {
        id: 'q2',
        word: 'FEASIBLE',
        ipa: 'ˈfiːzəbl',
        scenario: 'Ngủ đủ 8 tiếng mà làm 2 công việc có FEASIBLE không? Không luôn.',
        options: [
            'Dễ dàng, đơn giản',
            'Khả thi, có thể thực hiện được',
            'Vui vẻ, thú vị',
            'Căng thẳng, mệt mỏi'
        ],
        correctAnswer: 1,
        level: 'beginner'
    },
    {
        id: 'q3',
        word: 'UBIQUITOUS',
        ipa: 'juːˈbɪkwɪtəs',
        scenario: 'Lo âu thì UBIQUITOUS trong đời tôi như Wi-Fi free vậy.',
        options: [
            'Nguy hiểm, đáng sợ',
            'Phổ biến khắp nơi, có mặt mọi lúc',
            'Tạm thời, nhất thời',
            'Khó chịu, bực bội'
        ],
        correctAnswer: 1,
        level: 'intermediate'
    },
    {
        id: 'q4',
        word: 'CONTEMPLATE',
        ipa: 'ˈkɒntəmpleɪt',
        scenario: 'Tôi CONTEMPLATE việc nhắn "còn thức không?" lúc 2h sáng quá thường xuyên.',
        options: [
            'Hối hận, tiếc nuối',
            'Từ chối, phản đối',
            'Suy ngẫm, trầm tư',
            'Thực hiện, hành động'
        ],
        correctAnswer: 2,
        level: 'intermediate'
    },
    {
        id: 'q5',
        word: 'RECALCITRANT',
        ipa: 'rɪˈkælsɪtrənt',
        scenario: 'Laptop RECALCITRANT của tôi từ chối update như mục tiêu cuộc đời vậy.',
        options: [
            'Cũ kỹ, lỗi thời',
            'Chậm chạp, lag',
            'Ngoan cố, bướng bỉnh',
            'Hỏng hóc, lỗi'
        ],
        correctAnswer: 2,
        level: 'advanced'
    }
];

interface LevelTestProps {
    onComplete: (score: number, recommendedLevel: DifficultyLevel) => void;
    onBack: () => void;
}

export default function LevelTest({ onComplete, onBack }: LevelTestProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    const currentQuestion = TEST_QUESTIONS[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / TEST_QUESTIONS.length) * 100;

    const handleSelectOption = (optionIndex: number) => {
        setSelectedOption(optionIndex);
    };

    const handleNext = () => {
        if (selectedOption === null) return;

        const newAnswers = [...answers, selectedOption];
        setAnswers(newAnswers);

        if (currentQuestionIndex < TEST_QUESTIONS.length - 1) {
            // Move to next question
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
        } else {
            // Test completed - calculate score
            const score = calculateScore(newAnswers);
            const recommendedLevel = getRecommendedLevel(score);
            onComplete(score, recommendedLevel);
        }
    };

    const calculateScore = (answers: number[]): number => {
        let correctCount = 0;
        TEST_QUESTIONS.forEach((question, index) => {
            if (answers[index] === question.correctAnswer) {
                correctCount++;
            }
        });
        return correctCount;
    };

    const getRecommendedLevel = (score: number): DifficultyLevel => {
        if (score <= 2) return 'beginner';
        if (score === 3) return 'intermediate';
        if (score === 4) return 'advanced';
        return 'expert';
    };

    return (
        <div className="w-full h-full px-4">
            {/* Logo - Top Left */}
            <div className="fixed top-4 left-4 md:top-6 md:left-6 z-50">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    LEXICA
                </h1>
            </div>

            {/* Content */}
            <div className="w-full max-w-2xl mx-auto pt-20 md:pt-24 space-y-4 md:space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 md:gap-2 group text-sm md:text-base"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                        <span className="hidden sm:inline">Quay lại</span>
                    </button>
                    <div className="text-xs md:text-sm text-slate-400">
                        Câu {currentQuestionIndex + 1} / {TEST_QUESTIONS.length}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-cyan-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                {/* Question Card */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl md:rounded-2xl p-5 md:p-8 space-y-6 md:space-y-8">
                    {/* Word and IPA */}
                    <div className="text-center space-y-3 md:space-y-4">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white wrap-break-word">
                            {currentQuestion.word}
                        </h2>
                        <p className="text-slate-400 font-mono text-base md:text-lg">
                            /{currentQuestion.ipa}/
                        </p>
                    </div>

                    {/* Question */}
                    <div className="text-center py-2 md:py-4">
                        <p className="text-lg md:text-xl text-slate-300 font-semibold">
                            Từ này có nghĩa là gì?
                        </p>
                    </div>

                    {/* Options */}
                    <div className="space-y-2 md:space-y-3">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedOption === index;
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleSelectOption(index)}
                                    className={`
                                    w-full p-3 md:p-4 rounded-lg md:rounded-xl text-left transition-all
                                    ${isSelected
                                            ? 'bg-cyan-500/20 border-2 border-cyan-400 scale-[1.02]'
                                            : 'bg-slate-700/30 border-2 border-slate-600/30 hover:border-slate-500 hover:bg-slate-700/50'
                                        }
                                `}
                                >
                                    <div className="flex items-start md:items-center gap-2 md:gap-3">
                                        <div className={`
                                        w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 md:mt-0
                                        ${isSelected
                                                ? 'border-cyan-400 bg-cyan-400'
                                                : 'border-slate-500'
                                            }
                                    `}>
                                            {isSelected && (
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            )}
                                        </div>
                                        <span className={`
                                        text-sm md:text-base leading-tight md:leading-normal
                                        ${isSelected ? 'text-white font-semibold' : 'text-slate-300'}
                                    `}>
                                            {option}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={handleNext}
                        disabled={selectedOption === null}
                        className={`
                        w-full py-3 md:py-4 rounded-lg md:rounded-xl font-bold text-base md:text-lg transition-all
                        ${selectedOption !== null
                                ? 'bg-cyan-500 text-white hover:scale-[1.02] active:scale-95'
                                : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                            }
                    `}
                    >
                        {currentQuestionIndex < TEST_QUESTIONS.length - 1 ? 'Câu tiếp theo →' : (
                            <span className="flex items-center justify-center gap-2">
                                Xem kết quả
                                <TargetIcon className="w-4 h-4" />
                            </span>
                        )}
                    </button>
                </div>

                {/* Helper Text */}
                <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Chọn đáp án phù hợp nhất với nghĩa của từ trong câu
                </div>
            </div>
        </div>
    );
}
