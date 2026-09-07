import React, { useState } from 'react';
import { 
  Calculator, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Award, 
  Layers,
  ArrowRight
} from 'lucide-react';

export const ScoringGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-md overflow-hidden transition-all duration-200">
      {/* Baris Ringkasan Cepat / Quick Summary Header */}
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
                Formula Bobot & Ketentuan
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Poin dihitung otomatis berdasarkan prioritas task & ketepatan waktu penyelesaian (Closed).
            </p>
          </div>
        </div>

        {/* Quick Badges Preview */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-900 border border-neutral-800">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
              <span className="text-neutral-400 font-semibold">High:</span>
              <span className="text-emerald-400 font-bold">+15</span>
              <span className="text-neutral-600">/</span>
              <span className="text-rose-400 font-bold">+3</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-900 border border-neutral-800">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span className="text-neutral-400 font-semibold">Normal:</span>
              <span className="text-emerald-400 font-bold">+10</span>
              <span className="text-neutral-600">/</span>
              <span className="text-rose-400 font-bold">+2</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-neutral-900 border border-neutral-800">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
              <span className="text-neutral-400 font-semibold">Low:</span>
              <span className="text-emerald-400 font-bold">+5</span>
              <span className="text-neutral-600">/</span>
              <span className="text-rose-400 font-bold">+1</span>
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
            {/* Kartu Prioritas High */}
            <div className="p-3.5 rounded-lg bg-neutral-900/80 border border-yellow-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                  High Priority
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/30">
                  Critical Impact
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-1.5 rounded bg-neutral-950/60 border border-neutral-800/60">
                  <span className="text-neutral-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Tepat Waktu (On-Time)
                  </span>
                  <span className="font-mono font-black text-emerald-400">+15 Poin</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-neutral-950/60 border border-neutral-800/60">
                  <span className="text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-rose-400" /> Terlambat (Late)
                  </span>
                  <span className="font-mono font-bold text-rose-400">+3 Poin</span>
                </div>
              </div>
            </div>

            {/* Kartu Prioritas Normal */}
            <div className="p-3.5 rounded-lg bg-neutral-900/80 border border-blue-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  Normal Priority
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                  Standard Task
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-1.5 rounded bg-neutral-950/60 border border-neutral-800/60">
                  <span className="text-neutral-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Tepat Waktu (On-Time)
                  </span>
                  <span className="font-mono font-black text-emerald-400">+10 Poin</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-neutral-950/60 border border-neutral-800/60">
                  <span className="text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-rose-400" /> Terlambat (Late)
                  </span>
                  <span className="font-mono font-bold text-rose-400">+2 Poin</span>
                </div>
              </div>
            </div>

            {/* Kartu Prioritas Low */}
            <div className="p-3.5 rounded-lg bg-neutral-900/80 border border-neutral-700/50 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-neutral-500" />
                  Low Priority
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                  Minor / Routine
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-1.5 rounded bg-neutral-950/60 border border-neutral-800/60">
                  <span className="text-neutral-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Tepat Waktu (On-Time)
                  </span>
                  <span className="font-mono font-black text-emerald-400">+5 Poin</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-neutral-950/60 border border-neutral-800/60">
                  <span className="text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-rose-400" /> Terlambat (Late)
                  </span>
                  <span className="font-mono font-bold text-rose-400">+1 Poin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Aturan & Kriteria Penentuan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-lg bg-neutral-900/40 border border-neutral-800/80 flex items-start gap-2.5">
              <div className="p-1 rounded bg-amber-500/10 text-amber-400 mt-0.5 shrink-0">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-neutral-200 block mb-0.5">Kriteria Task Dihitung</span>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Hanya task berstatus <span className="text-yellow-400 font-semibold font-mono">Closed</span> dengan tanggal penyelesaian (<span className="text-neutral-300 font-mono">closed_on</span>) yang sah yang mendapatkan poin. Task yang masih in-progress tidak dihitung.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-neutral-900/40 border border-neutral-800/80 flex items-start gap-2.5">
              <div className="p-1 rounded bg-yellow-500/10 text-yellow-400 mt-0.5 shrink-0">
                <Award className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-neutral-200 block mb-0.5">Aturan Peringkat (Tie-Breaker)</span>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Jika skor sama, urutan ditentukan oleh: 
                  <span className="text-neutral-300 font-semibold"> (1) Total Skor</span>
                  {' '}<ArrowRight className="inline w-3 h-3 text-neutral-500" />{' '}
                  <span className="text-neutral-300 font-semibold">(2) On-Time Rate (%)</span>
                  {' '}<ArrowRight className="inline w-3 h-3 text-neutral-500" />{' '}
                  <span className="text-neutral-300 font-semibold">(3) Jumlah Task Selesai</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
