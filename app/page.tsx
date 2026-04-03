'use client';

import { useState } from 'react';
import EnergyBar from './components/EnergyBar';
import SwipeDeck from './components/SwipeDeck';

export default function Home() {
  // Initial energy state - will be connected to localStorage later
  const [energy, setEnergy] = useState(30);
  const maxEnergy = 30;

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-900">
      {/* Energy Bar Header */}
      <EnergyBar currentEnergy={energy} maxEnergy={maxEnergy} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center px-4 pt-30 pb-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            LEXICA
          </h1>
        </div>

        {/* Swipe Deck */}
        <div className="w-full max-w-md flex-1 flex items-center justify-center">
          <SwipeDeck />
        </div>

        {/* Swipe Instructions */}
        <div className="mt-4 text-center space-y-1">
          <p className="text-slate-500 text-sm">
            Swipe left to forget • Swipe right to remember
          </p>
          <p className="text-slate-600 text-xs">Each swipe costs 1 Energy ⚡</p>
        </div>
      </main>
    </div>
  );
}
