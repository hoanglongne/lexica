'use client';

import { motion } from 'framer-motion';

interface PeriodOption {
    label: string;
    value: string;
}

interface PeriodSelectorProps {
    periods: PeriodOption[];
    selected: string;
    onChange: (value: string) => void;
    id?: string; // Unique ID for animation
}

export default function PeriodSelector({ periods, selected, onChange, id = 'default' }: PeriodSelectorProps) {
    return (
        <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1 border border-slate-700">
            {periods.map((period) => (
                <button
                    key={period.value}
                    onClick={() => onChange(period.value)}
                    className={`
                        relative px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                        ${selected === period.value
                            ? 'text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        }
                    `}
                >
                    {selected === period.value && (
                        <motion.div
                            layoutId={`period-selector-${id}`}
                            className="absolute inset-0 bg-cyan-500/20 border border-cyan-500/50 rounded-md"
                            transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
                        />
                    )}
                    <span className="relative z-10">{period.label}</span>
                </button>
            ))}
        </div>
    );
}
