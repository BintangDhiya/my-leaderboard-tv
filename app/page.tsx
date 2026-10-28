'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LeaderboardResponse, DeveloperStats } from '@/lib/types'; // <-- Pastikan DeveloperStats di-import
import { TopPodium } from '@/components/TopPodium';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { LeaderboardHeader } from '@/components/LeaderboardHeader';
import { ScoringGuideV2 } from '@/components/ScoringGuideV2';
import { Zap } from 'lucide-react';

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [filter, setFilter] = useState<'this_month' | 'all' | 'custom'>('this_month');
  const [mode, setMode] = useState<'task' | 'attendance' | 'both'>('both');
  const [role, setRole] = useState<'devs' | 'non-devs' | 'pama'>('devs');
  // --- STATE BARU UNTUK SORTING ---
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [appliedStart, setAppliedStart] = useState<string>('');
  const [appliedEnd, setAppliedEnd] = useState<string>('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFilterChanging, setIsFilterChanging] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchData = useCallback(async (showSkeleton = false) => {
    if (mode != 'attendance' && role == 'pama') setRole('devs');
    if (showSkeleton) setIsFilterChanging(true);
    try {
      let url = `/api/leaderboard?filter=${filter}&mode=${mode}&role=${role}&includeAll=true`;
      if (filter === 'custom' && appliedStart && appliedEnd) {
        url += `&start=${appliedStart}&end=${appliedEnd}`;
      }

      const res = await fetch(url);
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
  }, [filter, mode, role, appliedStart, appliedEnd]);

  // Auto Polling setiap 30 detik untuk TV Display (Silent Update)
  // Trigger skeleton HANYA saat filter atau mode berubah
  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Tampilkan skeleton saat initial load ATAU saat filter berubah
  if (initialLoading || isFilterChanging || !data) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
        <div className="w-full mx-auto py-4 lg:py-8 px-12 lg:px-16 space-y-6 flex-1 animate-pulse">
          {/* Skeleton ... (tetap sama) ... */}
        </div>
      </main>
    );
  }

  // --- LOGIKA PENGURUTAN DINAMIS ---
  // Data dari API selalu Descending. Jika user memilih Ascending, kita balik urutannya.
  let displayLeaderboard: DeveloperStats[] = [...data.leaderboard];

  if (sortOrder === 'asc') {
    displayLeaderboard.sort((a, b) => a.score - b.score);
  }

  // Chasers selalu Rank #4 ke bawah dari daftar yang sudah diurutkan secara Descending,
  // tapi kita terapkan sorting arah sesuai pilihan user pada array finalnya.
  const podiumData = data.podium; // Podium selalu juara 1, 2, 3 (tetap)

  // Untuk tabel chasers, kita ambil dari data asli (desc) mulai indeks ke-3,
  // lalu kita urutkan sesuai keinginan user.
  let chasers = [...data.leaderboard].slice(3);
  if (sortOrder === 'asc') {
    chasers.sort((a, b) => a.score - b.score);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-yellow-500 selection:text-black">
      <div className="w-full mx-auto py-4 lg:py-8 px-12 lg:px-16 space-y-6 flex-1">
        {/* 1. Header Bar */}
        <LeaderboardHeader
          data={data}
          filter={filter} setFilter={setFilter}
          mode={mode} setMode={setMode}
          role={role} setRole={setRole}
          lastUpdated={lastUpdated}
          customStart={customStart} setCustomStart={setCustomStart}
          customEnd={customEnd} setCustomEnd={setCustomEnd}
          onApplyCustomRange={() => { setAppliedStart(customStart); setAppliedEnd(customEnd); }}
          sortOrder={sortOrder} setSortOrder={setSortOrder} // <-- Kirim Props Sorting
        />

        <ScoringGuideV2 mode={mode} />

        {/* 3. Top 3 Podium Cards */}
        <section className="pt-2">
          <TopPodium podium={podiumData} mode={mode} />
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
          {/* Kirim chasers yang sudah disorting */}
          <LeaderboardTable chasers={chasers} mode={mode} />
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