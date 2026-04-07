'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, MousePointerClick, Target, BookOpen, Award, Clock, Settings, RotateCcw, ArrowRight, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import EnergyBar from './components/EnergyBar';
import SwipeDeck from './components/SwipeDeck';
import LevelSelector from './components/LevelSelector';
import LevelTestWelcome from './components/LevelTestWelcome';
import LevelTest from './components/LevelTest';
import LevelTestResult from './components/LevelTestResult';
import { useLexicaStore, initializeLexicaStore } from './store/lexicaStore';
import { getDifficultyAnalysis, getProgressStats } from './lib/eloAlgorithm';

export default function Home() {
  const energy = useLexicaStore(state => state.energy);
  const maxEnergy = useLexicaStore(state => state.maxEnergy);
  const userStats = useLexicaStore(state => state.userStats);
  const cardProgress = useLexicaStore(state => state.cardProgress);
  const learnedCount = useLexicaStore(state => state.learnedWords.size);
  const selectedLevel = useLexicaStore(state => state.selectedLevel);
  const hasSeenWelcome = useLexicaStore(state => state.hasSeenWelcome);
  const isInTest = useLexicaStore(state => state.isInTest);
  const testScore = useLexicaStore(state => state.testScore);
  const recommendedLevel = useLexicaStore(state => state.recommendedLevel);

  const setSelectedLevel = useLexicaStore(state => state.setSelectedLevel);
  const startTest = useLexicaStore(state => state.startTest);
  const skipToManual = useLexicaStore(state => state.skipToManual);
  const completeTest = useLexicaStore(state => state.completeTest);
  const acceptRecommendedLevel = useLexicaStore(state => state.acceptRecommendedLevel);
  const resetProgress = useLexicaStore(state => state.resetProgress);

  // Mobile stats modal state
  const [showMobileStats, setShowMobileStats] = useState(false);

  // Initialize store on mount
  useEffect(() => {
    initializeLexicaStore();
  }, []);

  // Debug: Get difficulty analysis
  const analysis = getDifficultyAnalysis(userStats);
  const progressStats = getProgressStats(cardProgress);

  // FLOW: Welcome Screen (first time only)
  if (!hasSeenWelcome && selectedLevel === null) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-900 px-4 py-8">
        <LevelTestWelcome
          onStartTest={startTest}
          onSkipToManual={skipToManual}
        />
      </div>
    );
  }

  // FLOW: Taking Test
  if (isInTest) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-900 px-4 py-8">
        <LevelTest
          onComplete={completeTest}
          onBack={() => skipToManual()}
        />
      </div>
    );
  }

  // FLOW: Test Result Screen
  if (testScore !== null && recommendedLevel && selectedLevel === null) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-900 px-4 py-8">
        <LevelTestResult
          score={testScore}
          totalQuestions={5}
          recommendedLevel={recommendedLevel}
          onAccept={acceptRecommendedLevel}
          onChooseManually={skipToManual}
        />
      </div>
    );
  }

  // FLOW: Manual Level Selection (if user skipped test or wants to change)
  if (selectedLevel === null) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-900">
        <LevelSelector
          onSelect={setSelectedLevel}
          currentLevel={selectedLevel}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-900">
      {/* Logo - Top Left */}
      <div className="hidden lg:block fixed top-4 left-4 md:top-6 md:left-6 z-50">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          LEXICA
        </h1>
      </div>

      {/* Energy Bar Header */}
      <EnergyBar currentEnergy={energy} maxEnergy={maxEnergy} />

      {/* Main Content Area - Two Column Layout on Desktop */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 px-4 pt-20 pb-8 max-w-6xl mx-auto w-full">

        {/* Left Column - Swipe Deck */}
        <div className="w-full lg:flex-1 lg:max-w-lg flex flex-col items-center justify-between min-h-[calc(100vh-180px)] lg:min-h-150">
          {/* Swipe Deck */}
          <div className="w-full max-w-md flex-1 flex items-center justify-center">
            <SwipeDeck />
          </div>
        </div>

        {/* Right Column - Stats Sidebar */}
        <div className="w-full lg:w-72 xl:w-80 shrink-0">
          {/* Mobile Compact Stats - Icon Buttons */}
          <div className="lg:hidden flex items-center justify-center gap-1.5 mb-4">
            <button
              className="shrink-0 p-1.5 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-cyan-500 transition-colors active:scale-95"
              onClick={() => setShowMobileStats(true)}
            >
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </button>
            <button
              className="shrink-0 p-1.5 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-cyan-500 transition-colors active:scale-95"
              onClick={() => setShowMobileStats(true)}
            >
              <MousePointerClick className="w-4 h-4 text-slate-400" />
            </button>
            <button
              className="shrink-0 p-1.5 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-cyan-500 transition-colors active:scale-95"
              onClick={() => setShowMobileStats(true)}
            >
              <Target className="w-4 h-4 text-slate-400" />
            </button>
            <button
              className="shrink-0 p-1.5 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-cyan-500 transition-colors active:scale-95"
              onClick={() => setShowMobileStats(true)}
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
            </button>
            <button
              className="shrink-0 p-1.5 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-cyan-500 transition-colors active:scale-95"
              onClick={() => setShowMobileStats(true)}
            >
              <Award className="w-4 h-4 text-slate-400" />
            </button>
            <button
              className="shrink-0 p-1.5 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-cyan-500 transition-colors active:scale-95"
              onClick={() => setShowMobileStats(true)}
            >
              <Clock className="w-4 h-4 text-slate-400" />
            </button>
            
            {/* Learned Words Link - Compact */}
            <Link href="/learned" className="shrink-0">
              <div className="p-1.5 px-2.5 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-cyan-500 transition-colors active:scale-95 cursor-pointer flex items-center gap-1.5">
                <span className="text-slate-300 text-xs font-medium whitespace-nowrap">Đã học</span>
                <span className="text-cyan-400 text-xs font-semibold">({learnedCount})</span>
              </div>
            </Link>
          </div>

          {/* Desktop Full Stats Card */}
          <div className="hidden lg:block bg-slate-800/50 border border-slate-700 rounded-xl p-5 lg:p-6 space-y-5 lg:space-y-6">

            {/* Level Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <span className="text-slate-400 text-sm">Level hiện tại</span>
              <span className="text-white font-semibold">
                {selectedLevel === 'all' ? 'Tất cả' : selectedLevel === 'beginner' ? 'Cơ bản' : selectedLevel === 'intermediate' ? 'Trung cấp' : selectedLevel === 'advanced' ? 'Nâng cao' : 'Chuyên gia'}
              </span>
            </div>

            {/* Performance Stats - Hidden on mobile, shown in compact grid above */}
            <div className="hidden lg:block space-y-3">
              <h3 className="text-slate-400 text-xs uppercase tracking-wider font-medium">Performance</h3>

              <div className="flex justify-between items-center group" title="Your current ELO rating">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-300 text-sm">ELO Rating</span>
                </div>
                <span className="text-cyan-400 font-mono font-semibold">{userStats.currentElo}</span>
              </div>

              <div className="flex justify-between items-center group" title="Total number of swipes">
                <div className="flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">Total Swipes</span>
                </div>
                <span className="text-white font-semibold">{userStats.totalSwipes}</span>
              </div>

              <div className="flex justify-between items-center group" title="Percentage of correct answers">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">Accuracy</span>
                </div>
                <span className="text-white font-semibold">
                  {userStats.totalSwipes > 0 ? Math.round((userStats.correctSwipes / userStats.totalSwipes) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Progress Stats */}
            <div className="space-y-3 pt-4 border-t border-slate-700">
              <h3 className="text-slate-400 text-xs uppercase tracking-wider font-medium">Progress</h3>

              <div className="flex justify-between items-center" title="Words you've started learning">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-300 text-sm">Learned</span>
                </div>
                <span className="text-cyan-400 font-semibold">{progressStats.total}</span>
              </div>

              <div className="flex justify-between items-center" title="Words you've fully mastered">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">Mastered</span>
                </div>
                <span className="text-white font-semibold">{progressStats.mastered}</span>
              </div>

              <div className="flex justify-between items-center" title="Cards due for review today">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">Due Today</span>
                </div>
                <span className="text-white font-semibold">{progressStats.dueToday}</span>
              </div>
            </div>

            {/* Difficulty Status */}
            {analysis.recommendation && (
              <div className="pt-4 border-t border-slate-700">
                <p className="text-slate-400 text-xs leading-relaxed">
                  {analysis.recommendation}
                </p>
              </div>
            )}

            {/* Learned Words Link - Desktop */}
            <div className="pt-4 border-t border-slate-700">
              <Link href="/learned">
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-cyan-500 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-200 text-sm font-medium">Xem từ đã học</span>
                    </div>
                    <span className="text-cyan-400 text-sm font-semibold">({learnedCount})</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4 border-t border-slate-700">
              <button
                onClick={() => setSelectedLevel(null)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors border border-slate-600/50 hover:border-slate-500 flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Đổi level
              </button>
              <button
                onClick={resetProgress}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 text-slate-400 text-sm font-medium transition-colors border border-slate-600/30 hover:border-slate-600 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Progress
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Stats Modal */}
      <AnimatePresence>
        {showMobileStats && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileStats(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t-2 border-cyan-500/30 rounded-t-3xl z-50 lg:hidden max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Thống kê</h3>
                <button
                  onClick={() => setShowMobileStats(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Level Badge */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <span className="text-slate-400 text-sm">Level hiện tại</span>
                  <span className="text-white font-semibold">
                    {selectedLevel === 'all' ? 'Tất cả' : selectedLevel === 'beginner' ? 'Cơ bản' : selectedLevel === 'intermediate' ? 'Trung cấp' : selectedLevel === 'advanced' ? 'Nâng cao' : 'Chuyên gia'}
                  </span>
                </div>

                {/* Performance Stats */}
                <div className="space-y-3">
                  <h3 className="text-slate-400 text-xs uppercase tracking-wider font-medium">Performance</h3>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-300 text-sm">ELO Rating</span>
                    </div>
                    <span className="text-cyan-400 font-mono font-semibold">{userStats.currentElo}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <MousePointerClick className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300 text-sm">Total Swipes</span>
                    </div>
                    <span className="text-white font-semibold">{userStats.totalSwipes}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300 text-sm">Accuracy</span>
                    </div>
                    <span className="text-white font-semibold">
                      {userStats.totalSwipes > 0 ? Math.round((userStats.correctSwipes / userStats.totalSwipes) * 100) : 0}%
                    </span>
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="space-y-3 pt-4 border-t border-slate-700">
                  <h3 className="text-slate-400 text-xs uppercase tracking-wider font-medium">Progress</h3>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-300 text-sm">Learned</span>
                    </div>
                    <span className="text-cyan-400 font-semibold">{progressStats.total}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300 text-sm">Mastered</span>
                    </div>
                    <span className="text-white font-semibold">{progressStats.mastered}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300 text-sm">Due Today</span>
                    </div>
                    <span className="text-white font-semibold">{progressStats.dueToday}</span>
                  </div>
                </div>

                {/* Difficulty Status */}
                {analysis.recommendation && (
                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {analysis.recommendation}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => {
                      setSelectedLevel(null);
                      setShowMobileStats(false);
                    }}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors border border-slate-600/50 hover:border-slate-500 flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Đổi level
                  </button>
                  <button
                    onClick={() => {
                      resetProgress();
                      setShowMobileStats(false);
                    }}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 text-slate-400 text-sm font-medium transition-colors border border-slate-600/30 hover:border-slate-600 flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Progress
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
