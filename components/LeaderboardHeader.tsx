import React from 'react';
import { Flame, Clock, Radio } from 'lucide-react';
import { LeaderboardResponse } from '@/lib/types';
import Image from 'next/image';

interface HeaderProps {
    data: LeaderboardResponse;
    filter: 'this_month' | 'all' | 'custom';
    setFilter: (filter: 'this_month' | 'all' | 'custom') => void;
    mode: 'task' | 'attendance' | 'both';
    setMode: (mode: 'task' | 'attendance' | 'both') => void;
    lastUpdated: string;
    customStart: string;
    setCustomStart: (date: string) => void;
    customEnd: string;
    setCustomEnd: (date: string) => void;
    onApplyCustomRange: () => void;
}

export const LeaderboardHeader: React.FC<HeaderProps> = ({
    data,
    filter,
    setFilter,
    mode,
    setMode,
    lastUpdated,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    onApplyCustomRange,
}) => {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
            {/* Title & Live Badge */}
            <div>
                <div className="flex items-center gap-3">
                    <Image
                        src="/images/logo-pama-dark-sm.png"
                        alt="Logo PAMA"
                        width={50}
                        height={50}
                    />
                    <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-wider bg-clip-text">
                        {mode == 'task' ? 'Performance' : mode == 'attendance' ? 'Attendance' : 'Performance & Attendance'} Leaderboard
                    </h1>
                </div>
                <div className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> Last Auto Sync: <span className="font-mono text-neutral-300">{lastUpdated}</span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
                        <Radio className="w-3.5 h-3.5" /> LIVE DISPLAY
                    </div>
                </div>
            </div>

            {/* Filter Tabs & Quick Team Stats */}
            <div className="flex items-center gap-4 flex-wrap">
                {/* Rising Star Alert */}
                {data.risingStar && (
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                        <Flame className="w-4 h-4 text-amber-400" />
                        <span>Rising Star: {data.risingStar.name} (▲ +{data.risingStar.rankDelta})</span>
                    </div>
                )}

                {/* Mode Filter Buttons */}
                <div className="inline-flex rounded-lg bg-neutral-900 border border-neutral-800 p-1">
                    <button onClick={() => setMode('task')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${mode === 'task' ? 'bg-neutral-800 text-purple-400 shadow' : 'text-neutral-400 hover:text-neutral-200'}`}>
                        Task Only
                    </button>
                    <button onClick={() => setMode('attendance')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${mode === 'attendance' ? 'bg-neutral-800 text-blue-400 shadow' : 'text-neutral-400 hover:text-neutral-200'}`}>
                        Attendance
                    </button>
                    <button onClick={() => setMode('both')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${mode === 'both' ? 'bg-neutral-800 text-yellow-400 shadow' : 'text-neutral-400 hover:text-neutral-200'}`}>
                        Combined
                    </button>
                </div>

                {/* Date Filter Buttons */}
                <div className="flex flex-col items-start gap-2">
                    <div className="inline-flex rounded-lg bg-neutral-900 border border-neutral-800 p-1 items-center">
                        <button
                            onClick={() => {
                                setFilter('this_month');
                                setCustomStart('');
                                setCustomEnd('');
                            }}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filter === 'this_month'
                                ? 'bg-neutral-800 text-yellow-400 shadow'
                                : 'text-neutral-400 hover:text-neutral-200'
                                }`}
                        >
                            This Month
                        </button>
                        <button
                            onClick={() => {
                                setFilter('all');
                                setCustomStart('');
                                setCustomEnd('');
                            }}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filter === 'all'
                                ? 'bg-neutral-800 text-yellow-400 shadow'
                                : 'text-neutral-400 hover:text-neutral-200'
                                }`}
                        >
                            All-Time
                        </button>
                        <button
                            onClick={() => setFilter('custom')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filter === 'custom'
                                ? 'bg-neutral-800 text-yellow-400 shadow'
                                : 'text-neutral-400 hover:text-neutral-200'
                                }`}
                        >
                            Custom
                        </button>
                    </div>

                    {/* Custom Date Range Inputs (Hanya Muncul jika Filter = Custom) */}
                    {filter === 'custom' && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800">
                            <input
                                type="date"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                className="bg-neutral-950 text-xs rounded px-2 py-1 border border-neutral-700 text-neutral-300 outline-none cursor-pointer focus:border-yellow-500/50 [color-scheme:dark]"
                            />
                            <span className="text-neutral-600 text-xs font-bold">-</span>
                            <input
                                type="date"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                className="bg-neutral-950 text-xs rounded px-2 py-1 border border-neutral-700 text-neutral-300 outline-none cursor-pointer focus:border-yellow-500/50 [color-scheme:dark]"
                            />
                            {/* TAMBAHKAN TOMBOL TERAPKAN INI */}
                            <button
                                onClick={onApplyCustomRange}
                                disabled={!customStart || !customEnd}
                                className="ml-1 px-3 py-1 text-[11px] font-bold rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                                Filter
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};