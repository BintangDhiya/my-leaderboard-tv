import React from 'react';
import { DeveloperStats } from '@/lib/types';

export const renderBadges = (dev: DeveloperStats) => {
    const badges = [];
    const now = new Date();
    // Cek jika jam kerja sudah lewat 16:30
    const isPastTapOut = now.getHours() > 16 || (now.getHours() === 16 && now.getMinutes() >= 30);

    if (dev.isDinasToday) {
        badges.push(<span key="dinas" className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] font-bold uppercase tracking-wider">Dinas</span>);
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