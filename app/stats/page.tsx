'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Target, Flame, Trophy, TrendingUp, Calendar, PieChart as PieChartIcon, MousePointerClick } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { getProgressStats } from '../lib/eloAlgorithm';
import ActivityHeatmap from '../components/ActivityHeatmap';
import ELOChart from '../components/ELOChart';
import AccuracyChart from '../components/AccuracyChart';
import CardStatesPieChart from '../components/CardStatesPieChart';
import CountUp from '../components/CountUp';

function StatsPageContent() {
    const learnedCount = useLexicaStore(state => state.learnedWords.size);
    const learnedWords = useLexicaStore(state => state.learnedWords);
    const currentStreak = useLexicaStore(state => state.currentStreak);
    const longestStreak = useLexicaStore(state => state.longestStreak);
    const userStats = useLexicaStore(state => state.userStats);
    const highestElo = useLexicaStore(state => state.highestElo);
    const cardProgress = useLexicaStore(state => state.cardProgress);
    const studyHistory = useLexicaStore(state => state.studyHistory);
    const getStudyStats = useLexicaStore(state => state.getStudyStats);

    const progressStats = getProgressStats(cardProgress);
    const studyStats = getStudyStats();
    const accuracy = userStats.totalSwipes > 0
        ? Math.round((userStats.correctSwipes / userStats.totalSwipes) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-slate-900 px-4 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors group text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Trang chủ
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Thống kê & Phân tích</h1>
                    <div className="w-20" /> {/* spacer */}
                </div>

                {/* Featured Streak Card */}
                {(() => {
                    const MILESTONES = [3, 7, 14, 30, 60, 100];
                    const MAX_TRACK = 100;
                    const fillPct = Math.min((currentStreak / MAX_TRACK) * 100, 100);
                    const nextMilestone = MILESTONES.find(m => m > currentStreak) ?? null;
                    const MILESTONE_LABELS: Record<number, string> = {
                        3: '3 ngày',
                        7: '1 tuần',
                        14: '2 tuần',
                        30: '1 tháng',
                        60: '2 tháng',
                        100: '100 ngày'
                    };

                    return (
                        <div className={`rounded-xl border p-6 mb-8 ${currentStreak >= 7
                                ? 'bg-orange-500/8 border-orange-500/30'
                                : currentStreak >= 3
                                    ? 'bg-amber-500/8 border-amber-500/20'
                                    : 'bg-slate-800/40 border-slate-700'
                            }`}>
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${currentStreak >= 7 ? 'bg-orange-500/20' : 'bg-slate-700/60'
                                        }`}>
                                        <Flame className={`w-7 h-7 ${currentStreak >= 7
                                                ? 'text-orange-400'
                                                : currentStreak >= 3
                                                    ? 'text-amber-400'
                                                    : 'text-slate-500'
                                            }`} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                            Streak
                                        </div>
                                        <div className={`text-3xl font-bold ${currentStreak >= 7
                                                ? 'text-orange-400'
                                                : currentStreak >= 3
                                                    ? 'text-amber-400'
                                                    : 'text-slate-300'
                                            }`}>
                                            {currentStreak} <span className="text-lg font-normal text-slate-400">
                                                ngày liên tiếp
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {longestStreak > 0 && (
                                    <div className="text-right">
                                        <div className="text-xs text-slate-600">Kỷ lục</div>
                                        <div className="text-lg font-bold text-slate-400">{longestStreak} ngày</div>
                                    </div>
                                )}
                            </div>

                            {/* Milestone track */}
                            <div className="space-y-2">
                                <div className="relative h-2.5 bg-slate-800 rounded-full">
                                    {/* Fill bar */}
                                    <div
                                        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${currentStreak >= 30
                                                ? 'bg-linear-to-r from-orange-500 to-red-400'
                                                : currentStreak >= 7
                                                    ? 'bg-linear-to-r from-amber-400 to-orange-500'
                                                    : 'bg-amber-500'
                                            }`}
                                        style={{ width: `${fillPct}%` }}
                                    />
                                    {/* Milestone markers */}
                                    {MILESTONES.map(m => (
                                        <div
                                            key={m}
                                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                                            style={{ left: `${(m / MAX_TRACK) * 100}%` }}
                                        >
                                            <div className={`w-3 h-3 rounded-full border-2 transition-colors duration-500 ${currentStreak >= m
                                                    ? 'bg-orange-400 border-orange-300'
                                                    : 'bg-slate-700 border-slate-600'
                                                }`} />
                                        </div>
                                    ))}
                                </div>
                                {/* Labels */}
                                <div className="relative h-4">
                                    {MILESTONES.map(m => (
                                        <span
                                            key={m}
                                            className={`absolute text-[9px] -translate-x-1/2 transition-colors font-mono ${currentStreak >= m ? 'text-orange-400/80' : 'text-slate-600'
                                                }`}
                                            style={{ left: `${(m / MAX_TRACK) * 100}%` }}
                                        >
                                            {MILESTONE_LABELS[m]}
                                        </span>
                                    ))}
                                </div>
                                <div className="text-right mt-2">
                                    <span className="text-xs text-slate-500">
                                        {nextMilestone
                                            ? `${nextMilestone - currentStreak} ngày nữa đến mốc ${MILESTONE_LABELS[nextMilestone]}`
                                            : '🏆 Đã đạt tất cả mốc!'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Total Words Learned */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-cyan-500/15">
                                <BookOpen className="w-5 h-5 text-cyan-400" />
                            </div>
                            <span className="text-slate-400 text-sm">Từ đã học</span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            <CountUp end={learnedCount} />
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            <CountUp end={progressStats.mastered} /> thành thạo
                        </p>
                    </div>

                    {/* Total Swipes */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/15">
                                <MousePointerClick className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="text-slate-400 text-sm">Tổng swipes</span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            <CountUp end={userStats.totalSwipes} />
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            <CountUp end={userStats.correctSwipes} /> đúng
                        </p>
                    </div>

                    {/* Accuracy Rate */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-green-500/15">
                                <Target className="w-5 h-5 text-green-400" />
                            </div>
                            <span className="text-slate-400 text-sm whitespace-nowrap">Độ chính xác</span>
                        </div>
                        <p className="text-3xl font-bold text-green-400">
                            <CountUp end={accuracy} suffix="%" />
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            trung bình
                        </p>
                    </div>

                    {/* ELO Rating (Combined) */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-amber-500/15">
                                <Trophy className="w-5 h-5 text-amber-400" />
                            </div>
                            <span className="text-slate-400 text-sm">ELO Rating</span>
                        </div>
                        <p className="text-3xl font-bold text-amber-400">
                            <CountUp end={userStats.currentElo} />
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            cao nhất: <span className="text-orange-400 font-semibold"><CountUp end={highestElo} /></span>
                        </p>
                    </div>
                </div>

                {/* Activity Heatmap */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8 focus:outline-none">
                    <div className="flex items-center gap-3 mb-4">
                        <Calendar className="w-5 h-5 text-cyan-400" />
                        <h2 className="text-lg font-bold text-white">Lịch hoạt động</h2>
                        <span className="text-xs text-slate-500">(365 ngày qua)</span>
                    </div>
                    <ActivityHeatmap studyHistory={studyHistory} />
                </div>

                {/* Charts Grid */}
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* ELO Progress Chart */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 focus:outline-none">
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingUp className="w-5 h-5 text-cyan-400" />
                            <h2 className="text-lg font-bold text-white">Tiến độ ELO</h2>
                            <span className="text-xs text-slate-500">(30 ngày)</span>
                        </div>
                        <ELOChart studyHistory={studyHistory} currentElo={userStats.currentElo} />
                    </div>

                    {/* Card States Chart */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 focus:outline-none">
                        <div className="flex items-center gap-3 mb-4">
                            <PieChartIcon className="w-5 h-5 text-cyan-400" />
                            <h2 className="text-lg font-bold text-white">Phân bổ từ vựng</h2>
                        </div>
                        <CardStatesPieChart cardProgress={cardProgress} learnedWords={learnedWords} />
                    </div>
                </div>

                {/* Accuracy Trend Chart - Full width */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 focus:outline-none">
                    <div className="flex items-center gap-3 mb-4">
                        <Target className="w-5 h-5 text-green-400" />
                        <h2 className="text-lg font-bold text-white">Xu hướng Accuracy</h2>
                        <span className="text-xs text-slate-500">(30 ngày)</span>
                    </div>
                    <AccuracyChart studyHistory={studyHistory} />
                </div>
            </div>
        </div>
    );
}

// Wrapper with Suspense boundary
function StatsPageFallback() {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-cyan-400 animate-spin" />
        </div>
    );
}

export default function StatsPage() {
    return (
        <Suspense fallback={<StatsPageFallback />}>
            <StatsPageContent />
        </Suspense>
    );
}
