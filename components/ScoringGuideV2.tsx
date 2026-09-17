import React from 'react';
import { Award, Zap, CheckCircle2, Clock, FastForward } from 'lucide-react';

export const ScoringGuideV2: React.FC = () => {
  return (
    <div className="w-full rounded-xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md px-4 py-2.5 flex flex-col xl:flex-row items-center justify-between gap-3 shadow-inner">
      {/* 1. Label / Kriteria Dasar */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
          <Zap className="w-3.5 h-3.5 fill-yellow-400" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
            Scoring Rules
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800/90 text-neutral-400 border border-neutral-700/60">
            Closed (5) & Feedback (4)
          </span>
        </div>
      </div>

      {/* 2. Compact Point Matrix (Horizontal Chips) */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center text-xs">
        {/* High Priority */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-neutral-950/70 border border-yellow-500/25">
          <span className="font-bold text-yellow-400 text-[11px] tracking-wide uppercase">High</span>
          <span className="font-mono text-[11px] font-bold text-neutral-200">10 pt</span>
        </div>

        {/* Normal Priority */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-neutral-950/70 border border-blue-500/25">
          <span className="font-bold text-blue-400 text-[11px] tracking-wide uppercase">Normal</span>
          <span className="font-mono text-[11px] font-bold text-neutral-200">5 pt</span>
        </div>

        {/* Low Priority */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-neutral-950/70 border border-neutral-700/50">
          <span className="font-bold text-neutral-400 text-[11px] tracking-wide uppercase">Low</span>
          <span className="font-mono text-[11px] font-bold text-neutral-200">3 pt</span>
        </div>

        <div className="h-4 w-[1px] bg-neutral-800 mx-1 hidden sm:block" />

        {/* Multipliers */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-emerald-400 font-bold flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
            <FastForward className="w-3 h-3" /> Early 1.2x
          </span>
          <span className="text-sky-400 font-bold flex items-center gap-1 px-2 py-0.5 rounded bg-sky-950/40 border border-sky-500/30">
            <CheckCircle2 className="w-3 h-3" /> Done 1.0x
          </span>
          <span className="text-rose-400 font-medium flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/40 border border-rose-500/30">
            <Clock className="w-3 h-3" /> Late 0.7x
          </span>
        </div>
      </div>

      {/* 3. Legend Ketepatan & Tie-Breaker */}
      <div className="flex items-center gap-3 text-[11px] text-neutral-400 shrink-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950/50 border border-neutral-800 text-neutral-300 font-mono text-[10px]">
          <Award className="w-3 h-3 text-yellow-400" />
          <span>Formula: Wb × Mt</span>
        </div>
      </div>
    </div>
  );
};