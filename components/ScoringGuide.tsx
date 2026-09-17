import React, { useState } from 'react';
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Award,
  FastForward,
  ArrowRight
} from 'lucide-react';

export const ScoringGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-md overflow-hidden transition-all duration-200">
      {/* Baris Ringkasan Cepat */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 p-3.5 px-4 cursor-pointer hover:bg-neutral-800/40 transition-colors select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs lg:text-sm font-bold tracking-wide uppercase text-neutral-200">
                Cara Kerja Scoring System
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400">
                Wb × Mt Formula
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Poin = Bobot Kompleksitas (High:10, Normal:5, Low:3) × Pengali Waktu (Cepat:1.2, Done:1.0, Late:0.7).
            </p>
          </div>
        </div>

        {/* Quick Badges Preview */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-900 border border-neutral-800">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
              <span className="text-neutral-400 font-semibold">High:</span>
              <span className="text-amber-400 font-bold">10pt</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-900 border border-neutral-800">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span className="text-neutral-400 font-semibold">Normal:</span>
              <span className="text-amber-400 font-bold">5pt</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-neutral-900 border border-neutral-800">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
              <span className="text-neutral-400 font-semibold">Low:</span>
              <span className="text-amber-400 font-bold">3pt</span>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-1 text-[11px] font-semibold text-yellow-400 hover:text-yellow-300 ml-2 shrink-0"
          >
            <span>{isOpen ? 'Tutup' : 'Detail'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Detail Penjelasan (Expanded) */}
      {isOpen && (
        <div className="border-t border-neutral-800/80 bg-neutral-950/40 p-4 lg:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* High */}
            <div className="p-3.5 rounded-lg bg-neutral-900/80 border border-yellow-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-yellow-400">High Priority</span>
                <span className="text-xs font-mono font-bold text-amber-400">10 Poin</span>
              </div>
              <div className="space-y-1 text-[11px] text-neutral-400">
                <div className="flex justify-between"><span>Lebih Cepat (1.2x):</span> <strong className="text-emerald-400 font-mono">12 pt</strong></div>
                <div className="flex justify-between"><span>Done (1.0x):</span> <strong className="text-sky-400 font-mono">10 pt</strong></div>
                <div className="flex justify-between"><span>Late (0.7x):</span> <strong className="text-rose-400 font-mono">7 pt</strong></div>
              </div>
            </div>
            {/* Normal */}
            <div className="p-3.5 rounded-lg bg-neutral-900/80 border border-blue-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-blue-400">Normal Priority</span>
                <span className="text-xs font-mono font-bold text-amber-400">5 Poin</span>
              </div>
              <div className="space-y-1 text-[11px] text-neutral-400">
                <div className="flex justify-between"><span>Lebih Cepat (1.2x):</span> <strong className="text-emerald-400 font-mono">6 pt</strong></div>
                <div className="flex justify-between"><span>Done (1.0x):</span> <strong className="text-sky-400 font-mono">5 pt</strong></div>
                <div className="flex justify-between"><span>Late (0.7x):</span> <strong className="text-rose-400 font-mono">3.5 pt</strong></div>
              </div>
            </div>
            {/* Low */}
            <div className="p-3.5 rounded-lg bg-neutral-900/80 border border-neutral-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-neutral-300">Low Priority</span>
                <span className="text-xs font-mono font-bold text-amber-400">3 Poin</span>
              </div>
              <div className="space-y-1 text-[11px] text-neutral-400">
                <div className="flex justify-between"><span>Lebih Cepat (1.2x):</span> <strong className="text-emerald-400 font-mono">3.6 pt</strong></div>
                <div className="flex justify-between"><span>Done (1.0x):</span> <strong className="text-sky-400 font-mono">3 pt</strong></div>
                <div className="flex justify-between"><span>Late (0.7x):</span> <strong className="text-rose-400 font-mono">2.1 pt</strong></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-lg bg-neutral-900/40 border border-neutral-800/80 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-neutral-200 block mb-0.5">Ketentuan Status & Tanggal</span>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Task <span className="text-emerald-400 font-semibold font-mono">Closed (5)</span> menggunakan <code className="text-neutral-200">closed_on</code>, sedangkan task <span className="text-yellow-400 font-semibold font-mono">Feedback (4)</span> menggunakan <code className="text-neutral-200">updated_on</code> untuk dibandingkan dengan <code className="text-neutral-200">due_date</code>.
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-neutral-900/40 border border-neutral-800/80 flex items-start gap-2.5">
              <Award className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-neutral-200 block mb-0.5">Aturan Tie-Breaker</span>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Jika skor sama: <span className="text-neutral-300 font-semibold">(1) Total Score</span> <ArrowRight className="inline w-3 h-3 text-neutral-500" /> <span className="text-neutral-300 font-semibold">(2) On-Time Rate (%)</span> <ArrowRight className="inline w-3 h-3 text-neutral-500" /> <span className="text-neutral-300 font-semibold">(3) Jumlah Closed+Feedback</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};