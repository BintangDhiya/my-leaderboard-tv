import React from 'react';
import { DeveloperStats } from '@/lib/types';

export const renderBadges = (dev: DeveloperStats) => {
    const badges = [];
    const now = new Date();
    // Cek jika jam kerja sudah lewat 16:30
    const isPastTapOut = now.getDay() === 5
        ? now.getHours() >= 17 // Jika hari Jumat: periksa apakah jam 17:00 ke atas
        : now.getHours() > 16 || (now.getHours() === 16 && now.getMinutes() >= 30); // Hari biasa: 16:30

    if (dev.isDinasToday) {
        badges.push(
            <div key="dinas" className="relative group inline-block">
                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] font-bold uppercase tracking-wider cursor-help">
                    Dinas
                </span>
                {dev.keteranganDinas && dev.keteranganDinas !== '-' && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-max max-w-[200px] p-1.5 bg-neutral-800 text-neutral-200 text-[9px] font-normal normal-case rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-normal text-center border border-neutral-700">
                        {dev.keteranganDinas}
                    </div>
                )}
            </div>
        );
    }
    if (dev.isIzinToday) {
        badges.push(
            <div key="izin" className="relative group inline-block">
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[9px] font-bold uppercase tracking-wider cursor-help">
                    Cuti
                </span>
                {dev.keteranganIzin && dev.keteranganIzin !== '-' && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-max max-w-[200px] p-1.5 bg-neutral-800 text-neutral-200 text-[9px] font-normal normal-case rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-normal text-center border border-neutral-700">
                        {dev.keteranganIzin}
                    </div>
                )}
            </div>
        );
    }
    if (dev.isLupaTapInToday) {
        badges.push(<span key="no-in" className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-bold uppercase tracking-wider">Belum Tap-IN (Today)</span>);
    }
    if (dev.isLupaTapOutYesterday) {
        badges.push(<span key="no-out-yest" className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[9px] font-bold uppercase tracking-wider">FOrgot Tap-OUT (H-1)</span>);
    }
    if (dev.isActiveToday) {
        if (isPastTapOut) {
            badges.push(<span key="no-out-today" className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-bold uppercase tracking-wider">Lupa OUT</span>);
        } else {
            badges.push(<span key="in-office" className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold uppercase tracking-wider">In Office</span>);
        }
    }

    return badges.length > 0 ? <div className="flex flex-wrap gap-1 mt-1">{badges}</div> : null;
};