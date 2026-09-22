'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LeaderboardResponse } from '@/lib/types';
import { TopPodium } from '@/components/TopPodium';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { LeaderboardHeader } from '@/components/LeaderboardHeader';
import { ScoringGuideV2 } from '@/components/ScoringGuideV2';
import { Zap } from 'lucide-react';

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [filter, setFilter] = useState<'this_month' | 'all' | 'custom'>('this_month');
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFilterChanging, setIsFilterChanging] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchData = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setIsFilterChanging(true);
    try {
      const res = await fetch(`/api/leaderboard?filter=${filter}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const json: LeaderboardResponse = await res.json();
      setData(json);
      setLastUpdated(new Date().toLocaleTimeString('id-ID'));
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
      if (showSkeleton) setIsFilterChanging(false);
    }
  }, [filter]);

  // Auto Polling setiap 30 detik untuk TV Display (Silent Update)
  // Trigger skeleton HANYA saat filter berubah
  useEffect(() => {
    fetchData(true); // true = show skeleton on filter change
    const interval = setInterval(() => fetchData(false), 30000); // false = silent background poll
    return () => clearInterval(interval);
  }, [fetchData]);

  // Tampilkan skeleton saat initial load ATAU saat filter berubah
  if (initialLoading || isFilterChanging || !data) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
        <div className="w-full mx-auto py-4 lg:py-8 px-12 lg:px-16 space-y-6 flex-1 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-[50px] h-[50px] bg-neutral-800 rounded-full" />
              <div className="h-8 w-64 bg-neutral-800 rounded-md" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-24 bg-neutral-800 rounded-md" />
              <div className="h-8 w-24 bg-neutral-800 rounded-md" />
            </div>
          </div>

          {/* Scoring Guide Skeleton */}
          <div className="w-full h-14 bg-neutral-900/50 rounded-xl border border-neutral-800/80" />

          {/* Top Podium Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-end pt-2">
            <div className="h-48 bg-neutral-900/60 rounded-2xl border border-neutral-800/50" />
            <div className="h-56 bg-neutral-800/60 rounded-2xl border border-neutral-700/50 lg:-translate-y-3" />
            <div className="h-48 bg-neutral-900/60 rounded-2xl border border-neutral-800/50" />
          </div>

          {/* Table Skeleton */}
          <div className="space-y-2 pt-4">
            <div className="flex justify-between">
              <div className="h-4 w-48 bg-neutral-800 rounded" />
              <div className="h-4 w-32 bg-neutral-800 rounded" />
            </div>
            <div className="w-full h-64 bg-neutral-900/80 rounded-xl border border-neutral-800" />
          </div>
        </div>
      </main>
    );
  }

  const chasers = data.leaderboard.slice(3); // Rank #4 ke bawah

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-yellow-500 selection:text-black">
      <div className="w-full mx-auto py-4 lg:py-8 px-12 lg:px-16 space-y-6 flex-1">
        {/* 1. Header Bar */}
        <LeaderboardHeader
          data={data}
          filter={filter}
          setFilter={setFilter}
          lastUpdated={lastUpdated}
        />

        {/* 2. Scoring System Guide (Compact TV Edition) */}
        <ScoringGuideV2 />

        {/* 3. Top 3 Podium Cards */}
        <section className="pt-2">
          <TopPodium podium={data.podium} />
        </section>

        {/* 4. Table Ranks #4 ke bawah */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm uppercase font-bold tracking-wider text-neutral-400">
              Rank Division #4 — #{data.leaderboard.length} (The Chasers)
            </h2>
            <span className="text-xs font-mono text-neutral-500">
              Showing {chasers.length} Developers
            </span>
          </div>
          <LeaderboardTable chasers={chasers} />
        </section>
      </div>

      {/* 5. Live Ticker Footer */}
      {data.latestActivity.length > 0 && (
        <footer className="sticky bottom-0 z-50 w-full bg-neutral-950/90 backdrop-blur-md border-t border-neutral-800/80 py-3 shadow-2xl">
          <div className="max-w-[1700px] w-full mx-auto px-4 lg:px-8 flex items-center gap-3 text-xs text-neutral-400 overflow-hidden">
            <span className="flex items-center gap-1 font-bold text-yellow-400 shrink-0 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-yellow-400" /> Latest Submissions:
            </span>
            <div className="truncate font-mono">
              {data.latestActivity.map((act, i) => (
                <span key={i} className="mr-6">
                  <span className="text-neutral-200 font-semibold">{act.developer}</span> shipped{' '}
                  <span className="text-neutral-400 italic">"{act.taskTitle}"</span>{' '}
                  {act.isOnTime ? (
                    <span className="text-emerald-400 font-bold">[ON-TIME]</span>
                  ) : (
                    <span className="text-rose-400 font-bold">[LATE]</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </footer>
      )}
    </main>
  );
}