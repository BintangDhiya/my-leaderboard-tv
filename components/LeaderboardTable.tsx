import React from 'react';
import { DeveloperStats } from '@/lib/types';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';

interface LeaderboardTableProps {
    chasers: DeveloperStats[];
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ chasers }) => {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .slice(0, 2)
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    const renderDelta = (delta: number) => {
        if (delta > 0) {
            return (
                <span className="flex items-center text-xs font-bold text-emerald-400">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +{delta}
                </span>
            );
        }
        if (delta < 0) {
            return (
                <span className="flex items-center text-xs font-bold text-rose-400">
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> {delta}
                </span>
            );
        }
        return (
            <span className="flex items-center text-xs font-semibold text-neutral-500">
                <Minus className="w-3.5 h-3.5 mr-0.5" /> 0
            </span>
        );
    };

    return (
        <div className="w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/80 shadow-2xl backdrop-blur-md">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-300">
                    <thead className="bg-neutral-900/90 text-[11px] uppercase font-bold tracking-wider text-neutral-400 border-b border-neutral-800">
                        <tr>
                            <th className="py-3 px-4 text-center">Standing</th>
                            <th className="py-3 px-3 text-center">Trend</th>
                            <th className="py-3 px-4">Developer</th>
                            <th className="py-3 px-4 text-center">Score</th>
                            <th className="py-3 px-4 text-center">On-Time %</th>
                            <th className="py-3 px-4 text-center">Done / Late</th>
                            <th className="py-3 px-3 text-center" title="Closed">Closed</th>
                            <th className="py-3 px-3 text-center" title="Feedback">Feedback</th>
                            <th className="py-3 px-3 text-center" title="In Progress">In Prog.</th>
                            <th className="py-3 px-3 text-center" title="New / Not Started">New</th>
                            <th className="py-3 px-4">Gap to Rank Above</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                        {chasers.map((dev) => (
                            <tr
                                key={dev.nrp}
                                className="hover:bg-neutral-800/40 transition-colors duration-150 group"
                            >
                                {/* Standing */}
                                <td className="py-3 px-4 text-center font-black font-mono text-neutral-400 group-hover:text-neutral-200">
                                    #{dev.currentRank}
                                </td>

                                {/* Trend Delta */}
                                <td className="py-3 px-3 text-center">
                                    <div className="flex justify-center">{renderDelta(dev.rankDelta)}</div>
                                </td>

                                {/* Username / Avatar */}
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-xs text-neutral-300">
                                            {getInitials(dev.name)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-neutral-200 line-clamp-1">{dev.name}</div>
                                            <div className="text-[10px] text-neutral-500 font-mono">NRP: {dev.nrp}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* Score */}
                                <td className="py-3 px-4 text-center font-black font-mono text-amber-400 text-base">
                                    {dev.score.toLocaleString()}
                                </td>

                                {/* On-Time Rate */}
                                <td className="py-3 px-4 text-center">
                                    <span
                                        className={`font-mono font-bold ${dev.onTimeRate >= 80
                                            ? 'text-emerald-400'
                                            : dev.onTimeRate >= 60
                                                ? 'text-yellow-400'
                                                : 'text-rose-400'
                                            }`}
                                    >
                                        {dev.onTimeRate}%
                                    </span>
                                </td>

                                {/* Done vs Late */}
                                <td className="py-3 px-4 text-center font-mono text-xs">
                                    <span className="text-neutral-200 font-bold">{dev.onTimeTasks}</span>
                                    <span className="text-neutral-500 mx-1">/</span>
                                    <span className="text-rose-400">{dev.lateTasks}</span>
                                </td>

                                {/* Closed — GREEN */}
                                <td className="py-3 px-3 text-center font-mono text-xs">
                                    <span className="font-bold text-emerald-400">{dev.closedTasks}</span>
                                </td>

                                {/* Feedback — YELLOW */}
                                <td className="py-3 px-3 text-center font-mono text-xs">
                                    <span className="font-bold text-yellow-400">{dev.feedbackTasks}</span>
                                </td>

                                {/* In Progress — ORANGE */}
                                <td className="py-3 px-3 text-center font-mono text-xs">
                                    <span className="font-bold text-orange-400">{dev.inProgressTasks}</span>
                                </td>

                                {/* New / Not Started — RED */}
                                <td className="py-3 px-3 text-center font-mono text-xs">
                                    <span className="font-bold text-red-400">{dev.newTasks}</span>
                                </td>

                                {/* Gap to Rank Above (Motivator Bar) */}
                                <td className="py-3 px-4">
                                    {dev.currentRank > 1 ? (
                                        <div className="flex items-center gap-2">
                                            <Target className="w-4 h-4 text-amber-500/70 shrink-0" />
                                            <span className="font-mono text-xs font-semibold text-neutral-300">
                                                {dev.gapToAbove === 0 ? '0 pts' : `+${dev.gapToAbove} pts`}
                                            </span>
                                            <span className="text-[10px] text-neutral-500 hidden xl:inline">
                                                {dev.gapToAbove === 0 ? `tied with #${dev.currentRank - 1}` : `to #${dev.currentRank - 1}`}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-neutral-500 font-mono">-</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};