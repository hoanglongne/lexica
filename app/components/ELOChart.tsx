'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PeriodSelector from './PeriodSelector';

interface ELOChartProps {
    studyHistory: Record<string, { swipes: number; correct: number; wrong: number; eloChange: number }>;
    currentElo: number;
}

type Period = '7D' | '1M' | '3M';

export default function ELOChart({ studyHistory, currentElo }: ELOChartProps) {
    const [period, setPeriod] = useState<Period>('1M');

    // Generate data based on selected period
    const generateChartData = () => {
        const dates = Object.keys(studyHistory).sort();

        // Determine number of days based on period
        const numDays = period === '7D' ? 7 : period === '1M' ? 30 : 90;
        const lastDates = dates.slice(-numDays);

        if (lastDates.length === 0) {
            return [];
        }

        // Calculate cumulative ELO
        let currentCalculatedElo = currentElo;

        // Work backwards from current ELO to get historical values
        for (let i = lastDates.length - 1; i >= 0; i--) {
            const date = lastDates[i];
            if (i < lastDates.length - 1) {
                // Subtract eloChange to get previous ELO
                currentCalculatedElo -= studyHistory[date].eloChange;
            }
        }

        // Now build forward with cumulative sum
        const data = [];
        let elo = currentCalculatedElo;

        for (const date of lastDates) {
            elo += studyHistory[date].eloChange;
            const dateObj = new Date(date + 'T00:00:00');
            const shortDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;

            data.push({
                date: shortDate,
                fullDate: date,
                elo: Math.round(elo),
            });
        }

        return data;
    };

    const data = generateChartData();

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center py-16 text-slate-500">
                <p className="text-sm">Chưa có dữ liệu ELO</p>
            </div>
        );
    }

    const minElo = Math.min(...data.map(d => d.elo));
    const maxElo = Math.max(...data.map(d => d.elo));
    const yAxisMin = Math.floor((minElo - 50) / 50) * 50;
    const yAxisMax = Math.ceil((maxElo + 50) / 50) * 50;

    const periodOptions = [
        { label: '7 ngày', value: '7D' },
        { label: '1 tháng', value: '1M' },
        { label: '3 tháng', value: '3M' },
    ];

    return (
        <div>
            <div className="mb-4 flex justify-end">
                <PeriodSelector id="elo" periods={periodOptions} selected={period} onChange={(value) => setPeriod(value as Period)} />
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id="eloGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis
                        dataKey="date"
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        tickLine={{ stroke: '#475569' }}
                    />
                    <YAxis
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        tickLine={{ stroke: '#475569' }}
                        domain={[yAxisMin, yAxisMax]}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            fontSize: '12px',
                        }}
                        labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                        itemStyle={{ color: '#22d3ee' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="elo"
                        stroke="#22d3ee"
                        strokeWidth={2}
                        dot={{ fill: '#22d3ee', r: 3 }}
                        activeDot={{ r: 5, fill: '#06b6d4' }}
                        fill="url(#eloGradient)"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
