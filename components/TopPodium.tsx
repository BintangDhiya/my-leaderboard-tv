import React from 'react';
import { DeveloperStats } from '@/lib/types';
import { Trophy, Medal, Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TopPodiumProps {
    podium: DeveloperStats[];
}

export const TopPodium: React.FC<TopPodiumProps> = ({ podium }) => {
    const rank1 = podium[0];
    const rank2 = podium[1];
    const rank3 = podium[2];

    // Helper untuk inisial avatar jika tidak ada foto
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .slice(0, 2)
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    const renderRankBadge = (rank: number) => {
        if (rank === 1) return <Trophy className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]" />;
        if (rank === 2) return <Medal className="w-9 h-9 text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.4)]" />;
        return <Medal className="w-9 h-9 text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.4)]" />;
    };

    const renderDelta = (delta: number) => {
        if (delta > 0) {
            return (
                <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3 mr-1" /> +{delta}
                </span>
            );
        }
        if (delta < 0) {
            return (
                <span className="flex items-center text-xs font-bold text-rose-400 bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 rounded-full">
                    <TrendingDown className="w-3 h-3 mr-1" /> {delta}
                </span>
            );
        }
        return (
            <span className="flex items-center text-xs font-semibold text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-full">
                <Minus className="w-3 h-3 mr-1" /> 0
            </span>
        );
    };

    const renderCard = (dev: DeveloperStats | undefined, rank: number, isCenter: boolean = false) => {
        if (!dev) return null;

        const borderGlow =
            rank === 1
                ? 'border-yellow-500/50 bg-gradient-to-b from-yellow-950/20 via-neutral-900/90 to-neutral-950 ring-1 ring-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.15)]'
                : rank === 2
                    ? 'border-slate-500/40 bg-gradient-to-b from-slate-900/40 via-neutral-900/90 to-neutral-950 shadow-[0_0_20px_rgba(148,163,184,0.1)]'
                    : 'border-amber-700/40 bg-gradient-to-b from-amber-950/30 via-neutral-900/90 to-neutral-950 shadow-[0_0_20px_rgba(180,83,9,0.1)]';

        return (
            <div
                className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 ${borderGlow} ${isCenter ? 'lg:-translate-y-3 z-10' : 'z-0'
                    }`}
            >
                {/* Header Kartu: Avatar, Nama, Delta & Rank Badge */}
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex items-center justify-center font-bold text-neutral-100 rounded-xl ${isCenter ? 'w-14 h-14 text-lg bg-yellow-500/20 border border-yellow-500/40 text-yellow-300' : 'w-12 h-12 text-sm bg-neutral-800 border border-neutral-700'
                                }`}
                        >
                            {getInitials(dev.name)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className={`font-black tracking-wide text-neutral-100 line-clamp-1 ${isCenter ? 'text-lg lg:text-xl' : 'text-base'}`}>
                                    {dev.name}
                                </h3>
                                {renderDelta(dev.rankDelta)}
                            </div>
                            <p className="text-xs text-neutral-400 font-mono">NRP: {dev.nrp}</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        {renderRankBadge(rank)}
                        <span
                            className={`text-xs font-black uppercase tracking-wider mt-1 ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-slate-300' : 'text-amber-500'
                                }`}
                        >
                            #{rank}
                        </span>
                    </div>
                </div>

                {/* Stats Grid Esports Bar */}
                <div className="grid grid-cols-7 gap-1.5 pt-3 border-t border-neutral-800/80 text-center">
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Score</span>
                        <span className="text-sm lg:text-base font-black text-amber-400 font-mono">{dev.score.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">On-Time %</span>
                        <span className="text-sm lg:text-base font-black text-emerald-400 font-mono">{dev.onTimeRate}%</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Closed</span>
                        <span className="text-sm lg:text-base font-bold text-neutral-200 font-mono">{dev.closedTasks}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Feedback</span>
                        <span className="text-sm lg:text-base font-bold text-neutral-200 font-mono">{dev.feedbackTasks}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Early</span>
                        <span className="text-sm lg:text-base font-bold text-emerald-400 font-mono">{dev.lebihCepatTasks || 0}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Done</span>
                        <span className="text-sm lg:text-base font-bold text-sky-400 font-mono">{dev.doneTasks || 0}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Late</span>
                        <span className="text-sm lg:text-base font-bold text-rose-400 font-mono">{dev.lateTasks}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-end">
            {/* Peringkat 2 (Kiri) */}
            {renderCard(rank2, 2, false)}

            {/* Peringkat 1 (Tengah - Highlight Utama) */}
            {renderCard(rank1, 1, true)}

            {/* Peringkat 3 (Kanan) */}
            {renderCard(rank3, 3, false)}
        </div>
    );
};