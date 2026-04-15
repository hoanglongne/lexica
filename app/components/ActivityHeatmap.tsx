'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PeriodSelector from './PeriodSelector';

interface ActivityHeatmapProps {
    studyHistory: Record<string, { swipes: number; correct: number; wrong: number }>;
}

type Period = '1M' | '3M' | '1Y';

export default function ActivityHeatmap({ studyHistory }: ActivityHeatmapProps) {
    const [hoveredDate, setHoveredDate] = useState<string | null>(null);
    const [hoveredPosition, setHoveredPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [period, setPeriod] = useState<Period>('1Y');
    const [yearOffset, setYearOffset] = useState(0); // 0 = current year, -1 = last year, etc.

    // Generate days based on period and year offset
    const generateDays = () => {
        const days: Array<{ date: string; dayOfWeek: number; swipes: number; correct: number; accuracy: number }> = [];
        const today = new Date();

        // Calculate the reference date based on year offset
        const referenceDate = new Date(today);
        referenceDate.setFullYear(referenceDate.getFullYear() + yearOffset);

        // Determine number of days to show based on period
        let numDays: number;
        if (period === '1M') numDays = 30;
        else if (period === '3M') numDays = 90;
        else numDays = 365;

        // If year offset is not 0, show full year of that offset
        if (yearOffset !== 0) {
            numDays = 365;
        }

        for (let i = numDays - 1; i >= 0; i--) {
            const date = new Date(referenceDate);
            date.setDate(date.getDate() - i);
            const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
            const entry = studyHistory[dateString];

            days.push({
                date: dateString,
                dayOfWeek,
                swipes: entry?.swipes || 0,
                correct: entry?.correct || 0,
                accuracy: entry ? Math.round((entry.correct / entry.swipes) * 100) : 0,
            });
        }

        return days;
    };

    const days = generateDays();

    // Get year label
    const getYearLabel = () => {
        const today = new Date();
        const targetYear = today.getFullYear() + yearOffset;
        if (yearOffset === 0) {
            if (period === '1Y') return `${targetYear}`;
            return period === '1M' ? '30 ngày qua' : '90 ngày qua';
        }
        return `${targetYear}`;
    };

    // Check if we have data for previous years
    const hasDataForYear = (offset: number) => {
        const today = new Date();
        const year = today.getFullYear() + offset;
        return Object.keys(studyHistory).some(date => date.startsWith(`${year}-`));
    };

    // Get color based on swipes count
    const getColor = (swipes: number): string => {
        if (swipes === 0) return 'bg-slate-800';
        if (swipes <= 2) return 'bg-slate-700';
        if (swipes <= 5) return 'bg-cyan-700';
        if (swipes <= 10) return 'bg-cyan-600';
        return 'bg-cyan-500';
    };

    const periodOptions = [
        { label: '1 tháng', value: '1M' },
        { label: '3 tháng', value: '3M' },
        { label: '1 năm', value: '1Y' },
    ];

    // Group days by weeks (starting from Sunday)
    type DayEntry = { date: string; dayOfWeek: number; swipes: number; correct: number; accuracy: number };
    const weeks: DayEntry[][] = [];
    let currentWeek: DayEntry[] = [];

    // Pad the first week with empty days if it doesn't start on Sunday
    const firstDayOfWeek = days[0]?.dayOfWeek || 0;
    for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push({ date: '', dayOfWeek: i, swipes: 0, correct: 0, accuracy: 0 });
    }

    days.forEach((day) => {
        currentWeek.push(day);
        if (day.dayOfWeek === 6 || day === days[days.length - 1]) {
            // End of week (Saturday) or last day
            weeks.push([...currentWeek]);
            currentWeek = [];
        }
    });

    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const handleMouseEnter = (date: string, e: React.MouseEvent) => {
        if (!date) return;
        setHoveredDate(date);
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setHoveredPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 });
    };

    // Get gap sizes based on period
    const getGapSize = () => {
        if (period === '1M') return { gap: 'gap-2', height: 'h-10', legendCell: 'w-5 h-5', labelSize: 'text-xs' };
        if (period === '3M') return { gap: 'gap-1.5', height: 'h-6', legendCell: 'w-4 h-4', labelSize: 'text-[11px]' };
        return { gap: 'gap-1', height: 'h-4', legendCell: 'w-3 h-3', labelSize: 'text-[10px]' }; // 1Y
    };

    const sizes = getGapSize();

    return (
        <div className="relative">
            {/* Period selector and year navigator */}
            <div className="flex items-center justify-between mb-4 gap-4">
                <PeriodSelector
                    id="heatmap"
                    periods={periodOptions}
                    selected={period}
                    onChange={(value) => {
                        setPeriod(value as Period);
                        setYearOffset(0); // Reset to current when changing period
                    }}
                />

                {/* Year navigator (only show for yearly view) */}
                {(period === '1Y' || yearOffset !== 0) && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setYearOffset(yearOffset - 1)}
                            disabled={!hasDataForYear(yearOffset - 1) && yearOffset <= -5}
                            className="p-1.5 rounded-md hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 text-slate-400" />
                        </button>
                        <span className="text-xs font-medium text-slate-400 min-w-[100px] text-center">
                            {getYearLabel()}
                        </span>
                        <button
                            onClick={() => setYearOffset(yearOffset + 1)}
                            disabled={yearOffset >= 0}
                            className="p-1.5 rounded-md hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                )}
            </div>

            {/* Heatmap với day labels bên trái */}
            <div className={`flex ${sizes.gap} w-full`}>
                {/* Day labels (bên trái) */}
                <div className={`flex flex-col ${sizes.gap} ${sizes.labelSize} text-slate-500 justify-between shrink-0`}>
                    <div className="flex items-center">CN</div>
                    <div className="flex items-center">T2</div>
                    <div className="flex items-center">T3</div>
                    <div className="flex items-center">T4</div>
                    <div className="flex items-center">T5</div>
                    <div className="flex items-center">T6</div>
                    <div className="flex items-center">T7</div>
                </div>

                {/* Heatmap grid (bên phải, fill width) */}
                <div className={`flex ${sizes.gap} flex-1`}>
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className={`flex flex-col ${sizes.gap} flex-1`}>
                            {week.map((day, dayIndex) => (
                                <div
                                    key={`${weekIndex}-${dayIndex}`}
                                    className={`w-full ${sizes.height} rounded-sm transition-all cursor-pointer hover:ring-1 hover:ring-cyan-400 hover:scale-105 ${day.date ? getColor(day.swipes) : 'bg-slate-900'}`}
                                    onMouseEnter={(e) => handleMouseEnter(day.date, e)}
                                    onMouseLeave={() => setHoveredDate(null)}
                                    title={day.date ? `${formatDate(day.date)} - ${day.swipes} swipes` : ''}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
                <span>Ít</span>
                <div className={`flex ${sizes.gap}`}>
                    <div className={`${sizes.legendCell} rounded-sm bg-slate-800`} />
                    <div className={`${sizes.legendCell} rounded-sm bg-slate-700`} />
                    <div className={`${sizes.legendCell} rounded-sm bg-cyan-700`} />
                    <div className={`${sizes.legendCell} rounded-sm bg-cyan-600`} />
                    <div className={`${sizes.legendCell} rounded-sm bg-cyan-500`} />
                </div>
                <span>Nhiều</span>
            </div>

            {/* Tooltip */}
            <AnimatePresence>
                {hoveredDate && studyHistory[hoveredDate] && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="fixed z-50 pointer-events-none"
                        style={{
                            left: Math.min(Math.max(hoveredPosition.x, 120), window.innerWidth - 120),
                            top: hoveredPosition.y,
                            transform: 'translateX(-50%) translateY(-100%)',
                        }}
                    >
                        <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                            <p className="text-white text-xs font-bold mb-1">{formatDate(hoveredDate)}</p>
                            <p className="text-cyan-400 text-xs">
                                {studyHistory[hoveredDate].swipes} swipes
                            </p>
                            <p className="text-slate-400 text-xs">
                                {studyHistory[hoveredDate].correct} đúng, {studyHistory[hoveredDate].wrong} sai
                            </p>
                            <p className="text-green-400 text-xs">
                                {Math.round((studyHistory[hoveredDate].correct / studyHistory[hoveredDate].swipes) * 100)}% accuracy
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
