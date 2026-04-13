'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { TrendingUp, MousePointerClick, Target, BookOpen, Award, Clock, Settings, RotateCcw, X, BarChart3, AlertCircle, TrendingDown, Zap, Check, Mic, Hand } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import EnergyBar from './components/EnergyBar';
import ErrorBoundary from './components/ErrorBoundary';
import SwipeDeck from './components/SwipeDeck';
import LevelSelector from './components/LevelSelector';

const LevelTestWelcome = dynamic(() => import('./components/LevelTestWelcome'));
const LevelTest = dynamic(() => import('./components/LevelTest'));
const LevelTestResult = dynamic(() => import('./components/LevelTestResult'));
const StoryUnlockModal = dynamic(() => import('./components/StoryUnlockModal'));
const StoryMode = dynamic(() => import('./components/StoryMode'));
const OnboardingModal = dynamic(() => import('./components/OnboardingModal'));
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
  const swipeMode = useLexicaStore(state => state.swipeMode);
  const hasSeenOnboarding = useLexicaStore(state => state.hasSeenOnboarding);
  const completeOnboarding = useLexicaStore(state => state.completeOnboarding);

  const setSelectedLevel = useLexicaStore(state => state.setSelectedLevel);
  const startTest = useLexicaStore(state => state.startTest);
  const skipToManual = useLexicaStore(state => state.skipToManual);
  const completeTest = useLexicaStore(state => state.completeTest);
  const acceptRecommendedLevel = useLexicaStore(state => state.acceptRecommendedLevel);
  const resetProgress = useLexicaStore(state => state.resetProgress);
  const setSwipeMode = useLexicaStore(state => state.setSwipeMode);

  // Story Mode state
  const showStoryUnlock = useLexicaStore(state => state.showStoryUnlock);
  const showStoryMode = useLexicaStore(state => state.showStoryMode);
  const currentStoryId = useLexicaStore(state => state.currentStoryId);
  const openStory = useLexicaStore(state => state.openStory);
  const closeStory = useLexicaStore(state => state.closeStory);
  const closeStoryUnlockModal = useLexicaStore(state => state.closeStoryUnlockModal);
  const markStoryAsRead = useLexicaStore(state => state.markStoryAsRead);

  // Mobile stats modal state
  const [showMobileStats, setShowMobileStats] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Difficulty status notification state
  const [showDifficultyStatus, setShowDifficultyStatus] = useState(false);
  const previousStatusRef = useRef<string | null>(null);

  // Initialize store on mount
  useEffect(() => {
    initializeLexicaStore();
  }, []);

  // Debug: Get difficulty analysis
  const analysis = getDifficultyAnalysis(userStats);
  const progressStats = getProgressStats(cardProgress);

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'very-hard':
        return {
          icon: AlertCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
        };
      case 'challenging':
        return {
          icon: TrendingDown,
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/30',
        };
      case 'too-easy':
        return {
          icon: TrendingUp,
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
        };
      case 'easy':
        return {
          icon: TrendingUp,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
        };
      case 'perfect':
        return {
          icon: Zap,
          color: 'text-cyan-400',
          bgColor: 'bg-cyan-500/10',
          borderColor: 'border-cyan-500/30',
        };
      default:
        return {
          icon: Check,
          color: 'text-slate-400',
          bgColor: 'bg-slate-500/10',
          borderColor: 'border-slate-500/30',
        };
    }
  };

  const statusDisplay = getStatusDisplay(analysis.status);
  const isVoiceMode = swipeMode === 'voice';

  // Track status changes and show notification
  useEffect(() => {
    const previousStatus = previousStatusRef.current;

    // Only show if status actually changed (not initial load)
    if (previousStatus !== null && previousStatus !== analysis.status) {
      // Schedule state update for next tick to avoid cascading renders
      const showTimer = setTimeout(() => {
        setShowDifficultyStatus(true);
      }, 0);

      // Auto-hide after 5 seconds
      const hideTimer = setTimeout(() => {
        setShowDifficultyStatus(false);
      }, 5000);

      // Update ref for next comparison
      previousStatusRef.current = analysis.status;

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }

    // Set initial value
    if (previousStatus === null) {
      previousStatusRef.current = analysis.status;
    }
  }, [analysis.status]);

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
          totalQuestions={10}
          recommendedLevel={recommendedLevel}
          calibratedElo={userStats.currentElo}
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
    <div className="relative h-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Onboarding — shown on first visit or when user clicks ? */}
      {(!hasSeenOnboarding || showOnboarding) && (
        <OnboardingModal onComplete={() => { completeOnboarding(); setShowOnboarding(false); }} />
      )}
      {/* Logo - Top Left */}
      <div className="hidden lg:block fixed top-4 left-4 md:top-6 md:left-6 z-50">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          LEXICA
        </h1>
      </div>

      {/* Help Button - fixed bottom right */}
      <button
        onClick={() => setShowOnboarding(true)}
        className="fixed bottom-5 right-5 z-50 w-8 h-8 rounded-full bg-slate-700 border border-slate-600 hover:border-cyan-500 hover:bg-slate-600 transition-colors flex items-center justify-center text-slate-400 hover:text-cyan-400 text-sm font-bold"
        aria-label="Hướng dẫn"
      >
        ?
      </button>

      {/* Energy Bar Header */}
      <EnergyBar currentEnergy={energy} maxEnergy={maxEnergy} />

      {/* Mobile Quick Level Switch */}
      <div className="lg:hidden fixed top-[102px] right-4 z-40">
        <button
          onClick={() => setSelectedLevel(null)}
          className="px-3 py-2 rounded-lg bg-slate-800/90 border border-slate-700 hover:border-cyan-500 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
        >
          <Settings className="w-3.5 h-3.5" />
          Đổi level
        </button>
      </div>

      {/* Main Content Area - Two Column Layout on Desktop */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 px-4 pt-16 pb-4 lg:pt-20 lg:pb-8 max-w-6xl mx-auto w-full overflow-hidden">

        {/* Left Column - Swipe Deck */}
        <div className="w-full lg:flex-1 lg:max-w-lg flex flex-col items-center justify-between h-full lg:min-h-150">
          {/* Swipe Deck */}
          <div className="w-full max-w-md flex-1 flex items-center justify-center">
            <ErrorBoundary>
              <SwipeDeck />
            </ErrorBoundary>
          </div>

          {/* Difficulty Status Notification */}
          <AnimatePresence>
            {showDifficultyStatus && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-md mt-6"
              >
                <div className={`flex items-start gap-3 p-4 rounded-xl border-2 ${statusDisplay.bgColor} ${statusDisplay.borderColor} shadow-lg backdrop-blur-sm`}>
                  <statusDisplay.icon className={`w-6 h-6 ${statusDisplay.color} shrink-0 mt-0.5`} />
                  <div className="flex-1">
                    <p className={`text-base font-bold ${statusDisplay.color}`}>
                      {analysis.message.split(' - ')[0]}
                    </p>
                    <p className="text-sm text-slate-300 mt-1">
                      {analysis.message.split(' - ')[1]}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDifficultyStatus(false)}
                    className="p-1 hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column - Stats Sidebar */}
        <div className="w-full lg:w-72 xl:w-80 shrink-0">
          {/* Mobile Action Bar */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
            {/* Voice/Touch Toggle */}
            <button
              onClick={() => setSwipeMode(isVoiceMode ? 'touch' : 'voice')}
              className={`shrink-0 p-2 px-3 rounded-lg border text-xs font-semibold transition-colors active:scale-95 flex items-center gap-1.5 ${isVoiceMode
                ? 'bg-cyan-500/12 border-cyan-400/35 text-cyan-200'
                : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-cyan-500'
                }`}
            >
              {isVoiceMode ? <Mic className="w-3.5 h-3.5" /> : <Hand className="w-3.5 h-3.5" />}
              {isVoiceMode ? 'Voice' : 'Touch'}
            </button>

            {/* Stats Button */}
            <button
              className="flex-1 p-2 px-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-cyan-500 transition-colors active:scale-95 flex items-center justify-center gap-2"
              onClick={() => setShowMobileStats(true)}
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300 text-sm font-medium">Xem thống kê</span>
            </button>

            {/* Learned Words Link */}
            <Link href="/learned" className="shrink-0">
              <div className="p-2 px-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-cyan-500 transition-colors active:scale-95 cursor-pointer flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300 text-sm font-medium whitespace-nowrap">Đã học</span>
                <span className="text-cyan-400 text-sm font-semibold">({learnedCount})</span>
              </div>
            </Link>
          </div>

          {/* Desktop Full Stats Card */}
          <div className="hidden lg:block bg-slate-800/50 border border-slate-700 rounded-xl p-5 lg:p-6 space-y-4 lg:space-y-5">

            {/* Level Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <span className="text-slate-400 text-sm">Level hiện tại</span>
              <span className="text-white font-semibold">
                {selectedLevel === 'all' ? 'Tất cả' : selectedLevel === 'beginner' ? 'Cơ bản' : selectedLevel === 'intermediate' ? 'Trung cấp' : selectedLevel === 'advanced' ? 'Nâng cao' : 'Chuyên gia'}
              </span>
            </div>

            <div className="space-y-3 pb-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Chế độ swipe</span>
                <button
                  onClick={() => setSwipeMode(isVoiceMode ? 'touch' : 'voice')}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${isVoiceMode
                    ? 'bg-cyan-500/12 border-cyan-400/35 text-cyan-200'
                    : 'bg-slate-700/40 border-slate-600/50 text-slate-200 hover:border-slate-400/60'
                    }`}
                >
                  {isVoiceMode ? <Mic className="w-3.5 h-3.5" /> : <Hand className="w-3.5 h-3.5" />}
                  {isVoiceMode ? 'Voice Mode' : 'Touch Mode'}
                </button>
              </div>
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

                <div className="space-y-3 pb-4 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Chế độ swipe</span>
                    <button
                      onClick={() => setSwipeMode(isVoiceMode ? 'touch' : 'voice')}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${isVoiceMode
                        ? 'bg-cyan-500/12 border-cyan-400/35 text-cyan-200'
                        : 'bg-slate-700/40 border-slate-600/50 text-slate-200 hover:border-slate-400/60'
                        }`}
                    >
                      {isVoiceMode ? <Mic className="w-3.5 h-3.5" /> : <Hand className="w-3.5 h-3.5" />}
                      {isVoiceMode ? 'Voice Mode' : 'Touch Mode'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Voice mode yêu cầu đọc đúng từ trên cùng 3 lần liên tiếp.
                  </p>
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

      {/* Story Unlock Modal */}
      <AnimatePresence>
        {showStoryUnlock && currentStoryId && (
          <StoryUnlockModal
            storyId={currentStoryId}
            onReadNow={() => {
              if (currentStoryId) {
                openStory(currentStoryId);
              }
            }}
            onClose={closeStoryUnlockModal}
          />
        )}
      </AnimatePresence>

      {/* Story Mode */}
      {showStoryMode && currentStoryId && (
        <StoryMode
          storyId={currentStoryId}
          onClose={closeStory}
          onFinish={() => {
            if (currentStoryId) {
              markStoryAsRead(currentStoryId);
            }
            closeStory();
          }}
        />
      )}
    </div>
  );
}
