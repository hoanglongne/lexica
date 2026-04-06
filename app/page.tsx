'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import EnergyBar from './components/EnergyBar';
import SwipeDeck from './components/SwipeDeck';
import LearnedWordsCounter from './components/LearnedWordsCounter';
import { useLexicaStore, initializeLexicaStore } from './store/lexicaStore';
import { getDifficultyAnalysis, getProgressStats } from './lib/eloAlgorithm';

export default function Home() {
  const energy = useLexicaStore(state => state.energy);
  const maxEnergy = useLexicaStore(state => state.maxEnergy);
  const userStats = useLexicaStore(state => state.userStats);
  const cardProgress = useLexicaStore(state => state.cardProgress);
  const learnedCount = useLexicaStore(state => state.learnedWords.size);
  const resetProgress = useLexicaStore(state => state.resetProgress);

  // Initialize store on mount
  useEffect(() => {
    initializeLexicaStore();
  }, []);

  // Debug: Get difficulty analysis
  const analysis = getDifficultyAnalysis(userStats);
  const progressStats = getProgressStats(cardProgress);

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-900">
      {/* Energy Bar Header */}
      <EnergyBar currentEnergy={energy} maxEnergy={maxEnergy} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center px-4 pt-30 pb-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            LEXICA
          </h1>
          <LearnedWordsCounter />
        </div>

        {/* Swipe Deck */}
        <div className="w-full max-w-md flex-1 flex items-center justify-center">
          <SwipeDeck />
        </div>

        {/* Learned Words Link */}
        <div className="w-full max-w-md mt-8">
          <Link href="/learned">
            <div className="p-4 rounded-lg bg-slate-800 border border-slate-700 hover:border-cyan-500 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-slate-200 font-semibold">📚 Xem từ đã học</span>
                  <span className="text-cyan-400 text-sm">({learnedCount})</span>
                </div>
                <span className="text-slate-500">→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Swipe Instructions */}
        <div className="mt-4 text-center space-y-1">
          <p className="text-slate-500 text-sm">
            Swipe left to forget • Swipe right to remember
          </p>
          <p className="text-slate-600 text-xs">Each swipe costs 1 Energy ⚡</p>
        </div>

        {/* Debug Info */}
        <div className="mt-6 text-center space-y-2">
          <div className="text-xs text-slate-500">
            ELO: {userStats.currentElo} | Swipes: {userStats.totalSwipes} | Accuracy: {userStats.totalSwipes > 0 ? Math.round((userStats.correctSwipes / userStats.totalSwipes) * 100) : 0}%
          </div>
          <div className="text-xs text-slate-600">
            {analysis.recommendation}
          </div>
          <div className="text-xs text-cyan-400">
            📚 {progressStats.total} learned | 🌱 {progressStats.seed} | 🌿 {progressStats.sprout} | ✨ {progressStats.gold} | 🏆 {progressStats.mastered} | ⏰ {progressStats.dueToday} due
          </div>
          <button
            onClick={resetProgress}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-medium transition-colors border border-slate-600"
          >
            Reset Progress
          </button>
        </div>
      </main>
    </div>
  );
}
