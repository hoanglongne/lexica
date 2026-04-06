'use client';

import Link from 'next/link';
import { useLexicaStore } from '../store/lexicaStore';
import LearnedWordsList from '../components/LearnedWordsList';

export default function LearnedPage() {
    const learnedCount = useLexicaStore(state => state.learnedWords.size);
    const masteredCount = useLexicaStore(state => state.getMasteredWordsCount());

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
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        📚 Từ đã học
                    </h1>
                    <div className="flex items-center justify-center gap-8 text-base">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400">Tổng số:</span>
                            <span className="text-cyan-400 font-bold text-2xl">{learnedCount}</span>
                        </div>
                        <div className="w-px h-8 bg-slate-700"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400">Thành thạo:</span>
                            <span className="text-yellow-400 font-bold text-2xl">{masteredCount} 🏆</span>
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
                                className="h-full bg-gradient-to-r from-cyan-500 to-yellow-400 transition-all duration-500"
                                style={{ width: `${(masteredCount / learnedCount) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Learned Words List */}
            <div className="max-w-2xl mx-auto">
                <LearnedWordsList />
            </div>

            {/* Footer Info */}
            <div className="max-w-2xl mx-auto mt-12 text-center space-y-2">
                <p className="text-xs text-slate-500">
                    💾 Dữ liệu được lưu an toàn trong localStorage
                </p>
                <p className="text-xs text-slate-600">
                    Mỗi ngày bạn học, bộ não sẽ mạnh hơn một chút ✨
                </p>
            </div>
        </div>
    );
}
