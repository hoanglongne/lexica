'use client';

import Link from 'next/link';
import { useLexicaStore } from '../store/lexicaStore';

export default function LearnedWordsCounter() {
    const learnedCount = useLexicaStore(state => state.getLearnedWordsCount());
    const masteredCount = useLexicaStore(state => state.getMasteredWordsCount());

    return (
        <Link href="/learned">
            <div className="flex items-center gap-4 text-sm px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-cyan-500 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer">
                <div className="flex items-center gap-2">
                    <span className="text-slate-400">Đã học:</span>
                    <span className="text-cyan-400 font-semibold">{learnedCount}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-slate-400">Thành thạo:</span>
                    <span className="text-yellow-400 font-semibold">{masteredCount} 🏆</span>
                </div>
            </div>
        </Link>
    );
}
