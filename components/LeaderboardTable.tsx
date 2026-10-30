import React from 'react';
import { DeveloperStats } from '@/lib/types';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import { renderBadges } from './AttendanceBadge';

interface LeaderboardTableProps {
    chasers: DeveloperStats[];
    mode?: 'task' | 'attendance' | 'both';
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ chasers, mode = 'both' }) => {
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



    const isAttendanceMode = mode === 'attendance';

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

                            {mode === 'attendance' ? (
                                <>
                                    <th className="py-3 px-3 text-center">Kehadiran</th>
                                    <th className="text-center">Masuk (Weekend)</th>
                                    <th className="py-3 px-3 text-center">Dinas</th>
                                    <th className="py-3 px-3 text-center">Izin</th>
                                    <th className="py-3 px-3 text-center">Terlambat</th>
                                    <th className="py-3 px-3 text-center">Absent</th>
                                    <th className="py-3 px-3 text-center">Lupa Tap</th>
                                </>
                            ) : mode === 'both' ? (
                                <>
                                    <th className="py-3 px-3 text-center">Task Pts</th>
                                    <th className="py-3 px-3 text-center">Att Pts</th>
                                    <th className="py-3 px-3 text-center">Closed</th>
                                    <th className="py-3 px-4 text-center">On-Time %</th>
                                    <th className="py-3 px-3 text-center">Kehadiran</th>
                                    <th className="py-3 px-3 text-center">Terlambat</th>
                                </>
                            ) : (
                                <>
                                    <th className="py-3 px-4 text-center">On-Time %</th>
                                    <th className="py-3 px-4 text-center">Early / Done / Late</th>
                                    <th className="py-3 px-3 text-center">Closed</th>
                                    <th className="py-3 px-3 text-center">Feedback</th>
                                    <th className="py-3 px-3 text-center">In Prog.</th>
                                    <th className="py-3 px-3 text-center">New</th>
                                </>
                            )}

                            <th className="py-3 px-4">Gap to Rank Above</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                        {chasers.map((dev) => (
                            <tr key={`${dev.nrp}-${dev.currentRank}`} className="hover:bg-neutral-800/40 transition-colors duration-150 group">
                                <td className="py-3 px-4 text-center font-black font-mono text-neutral-400 group-hover:text-neutral-200">
                                    #{dev.currentRank}
                                </td>
                                <td className="py-3 px-3 text-center">
                                    <div className="flex justify-center">{renderDelta(dev.rankDelta)}</div>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-xs text-neutral-300">
                                            {getInitials(dev.name)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-neutral-200 line-clamp-1">{dev.name}</div>
                                            <div className="text-[10px] text-neutral-500 font-mono">NRP: {dev.nrp}</div>
                                            {renderBadges(dev)}
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-center font-black font-mono text-amber-400 text-base">
                                    {dev.score.toLocaleString()}
                                </td>

                                {mode === 'attendance' ? (
                                    <>
                                        <td className="py-3 px-3 text-center font-mono text-xs font-bold text-emerald-400">{dev.totalHadir}</td>
                                        <td className="text-center font-mono text-xs font-bold text-emerald-600">{dev.totalWeekend}</td>
                                        <td className="py-3 px-3 text-center">
                                            <div className="relative group inline-block">
                                                <span className={`font-mono text-xs font-bold text-sky-400 ${dev.totalDinas > 0 ? 'cursor-help border-b border-dashed border-sky-400/50 pb-0.5' : ''}`}>
                                                    {dev.totalDinas}
                                                </span>
                                                {dev.totalDinas > 0 && dev.keteranganDinas && dev.keteranganDinas !== '-' && (
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[250px] p-2 bg-neutral-800 text-neutral-200 text-[10px] font-sans font-normal rounded-md shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-pre-wrap text-left border border-neutral-700">
                                                        <span className="font-bold text-sky-400 block mb-1">Detail Dinas:</span>
                                                        {dev.keteranganDinas}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 text-center">
                                            <div className="relative group inline-block">
                                                <span className={`font-mono text-xs font-bold text-indigo-400 ${dev.totalIzin > 0 ? 'cursor-help border-b border-dashed border-indigo-400/50 pb-0.5' : ''}`}>
                                                    {dev.totalIzin}
                                                </span>
                                                {dev.totalIzin > 0 && dev.keteranganIzin && dev.keteranganIzin !== '-' && (
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[250px] p-2 bg-neutral-800 text-neutral-200 text-[10px] font-sans font-normal rounded-md shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-pre-wrap text-left border border-neutral-700">
                                                        <span className="font-bold text-indigo-400 block mb-1">Detail Izin/Cuti:</span>
                                                        {dev.keteranganIzin}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 text-center font-mono text-xs font-bold text-yellow-400">{dev.totalTelat}</td>
                                        <td className="py-3 px-3 text-center font-mono text-xs font-bold text-rose-400">{dev.totalTidakMasuk}</td>
                                        <td className="py-3 px-3 text-center font-mono text-xs font-bold text-orange-400">{dev.totalLupaTap}</td>
                                    </>
                                ) : mode === 'both' ? (
                                    <>
                                        <td className="py-3 px-3 text-center font-mono text-xs font-bold text-purple-400">{dev.taskScore}</td>
                                        <td className="py-3 px-3 text-center font-mono text-xs font-bold text-blue-400">{dev.attendanceScore}</td>
                                        <td className="py-3 px-3 text-center font-mono text-xs font-bold text-neutral-200">{dev.closedTasks}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`font-mono font-bold ${dev.onTimeRate >= 80 ? 'text-emerald-400' : dev.onTimeRate >= 60 ? 'text-yellow-400' : 'text-rose-400'}`}>
                                                {dev.onTimeRate}%
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-center font-mono text-xs font-bold text-emerald-400">{dev.totalHadir}</td>
                                        <td className="py-3 px-3 text-center font-mono text-xs font-bold text-yellow-400">{dev.totalTelat}</td>
                                    </>
                                ) : (
                                    <>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`font-mono font-bold ${dev.onTimeRate >= 80 ? 'text-emerald-400' : dev.onTimeRate >= 60 ? 'text-yellow-400' : 'text-rose-400'}`}>
                                                {dev.onTimeRate}%
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center font-mono text-xs">
                                            <span className="text-emerald-400 font-bold">{dev.lebihCepatTasks || 0}</span>
                                            <span className="text-neutral-500 mx-1">/</span>
                                            <span className="text-sky-400 font-bold">{dev.doneTasks || 0}</span>
                                            <span className="text-neutral-500 mx-1">/</span>
                                            <span className="text-rose-400 font-bold">{dev.lateTasks}</span>
                                        </td>
                                        <td className="py-3 px-3 text-center font-mono text-xs font-bold text-emerald-400">{dev.closedTasks}</td>
                                        <td className="py-3 px-3 text-center font-mono text-xs font-bold text-yellow-400">{dev.feedbackTasks}</td>
                                        <td className="py-3 px-3 text-center font-mono text-xs font-bold text-orange-400">{dev.inProgressTasks}</td>
                                        <td className="py-3 px-3 text-center font-mono text-xs font-bold text-red-400">{dev.newTasks}</td>
                                    </>
                                )}

                                <td className="py-3 px-4">
                                    {dev.currentRank > 1 ? (
                                        <div className="flex items-center gap-2">
                                            <Target className="w-4 h-4 text-amber-500/70 shrink-0" />
                                            <span className="font-mono text-xs font-semibold text-neutral-300">
                                                {dev.gapToAbove === 0 ? '0 pts' : `+${dev.gapToAbove} pts`}
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