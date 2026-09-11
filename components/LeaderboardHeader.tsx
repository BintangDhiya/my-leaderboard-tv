import React from 'react';
import { Flame, Clock, Radio } from 'lucide-react';
import { LeaderboardResponse } from '@/lib/types';

interface HeaderProps {
    data: LeaderboardResponse;
    filter: 'this_month' | 'all' | 'custom';
    setFilter: (filter: 'this_month' | 'all' | 'custom') => void;
    lastUpdated: string;
}

export const LeaderboardHeader: React.FC<HeaderProps> = ({
    data,
    filter,
    setFilter,
    lastUpdated,
}) => {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
            {/* Title & Live Badge */}
            <div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
                        <Radio className="w-3.5 h-3.5" /> LIVE DISPLAY
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-wider bg-gradient-to-r from-neutral-100 via-neutral-300 to-neutral-400 bg-clip-text text-transparent">
                        Performance Leaderboard
                    </h1>
                </div>
                <p className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> Last Auto Sync: <span className="font-mono text-neutral-300">{lastUpdated}</span>
                </p>
            </div>

            {/* Filter Tabs & Quick Team Stats */}
            <div className="flex items-center gap-4 flex-wrap">
                {/* Rising Star Alert jika ada */}
                {data.risingStar && (
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                        <Flame className="w-4 h-4 text-amber-400" />
                        <span>Rising Star: {data.risingStar.name} (▲ +{data.risingStar.rankDelta})</span>
                    </div>
                )}

                {/* Date Filter Buttons */}
                <div className="inline-flex rounded-lg bg-neutral-900 border border-neutral-800 p-1">
                    <button
                        onClick={() => setFilter('this_month')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filter === 'this_month'
                            ? 'bg-neutral-800 text-yellow-400 shadow'
                            : 'text-neutral-400 hover:text-neutral-200'
                            }`}
                    >
                        This Month
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filter === 'all'
                            ? 'bg-neutral-800 text-yellow-400 shadow'
                            : 'text-neutral-400 hover:text-neutral-200'
                            }`}
                    >
                        All-Time
                    </button>
                </div>
            </div>
        </div>
    );
};