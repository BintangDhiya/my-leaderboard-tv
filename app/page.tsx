'use client';

import React, { useState, useEffect } from 'react';
import { LeaderboardResponse } from '@/lib/types';
import { TopPodium } from '@/components/TopPodium';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { LeaderboardHeader } from '@/components/LeaderboardHeader';
import { ScoringGuideV2 } from '@/components/ScoringGuideV2';
import { Loader2, Zap } from 'lucide-react';

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [filter, setFilter] = useState<'this_month' | 'all' | 'custom'>('this_month');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/leaderboard?filter=${filter}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const json: LeaderboardResponse = await res.json();
      setData(json);
      setLastUpdated(new Date().toLocaleTimeString('id-ID'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Auto Polling setiap 30 detik untuk TV Display
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-neutral-400 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
        <span className="font-mono text-sm tracking-widest uppercase">Loading Arena Leaderboard...</span>
      </div>
    );
  }

  if (!data) return null;

  const chasers = data.leaderboard.slice(3); // Rank #4 ke bawah

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-yellow-500 selection:text-black">
      <div className="max-w-[1700px] w-full mx-auto p-4 lg:p-8 space-y-6 flex-1">
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

        {/* 3. Table Ranks #4 ke bawah */}
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

      {/* 4. Live Ticker Footer */}
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