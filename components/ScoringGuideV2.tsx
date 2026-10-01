'use client';

import React, { useState } from 'react';
import {
  Award, Zap, CheckCircle2, Clock, FastForward, CalendarCheck, AlertTriangle,
  XCircle, LogOut, ChevronDown, ChevronUp, AlertCircle, ArrowRight, Calculator, Info
} from 'lucide-react';

interface ScoringGuideV2Props {
  mode?: 'task' | 'attendance' | 'both';
}

export const ScoringGuideV2: React.FC<ScoringGuideV2Props> = ({ mode = 'both' }) => {
  const [isOpen, setIsOpen] = useState(false);

  // --- 1. KOMPONEN HEADER (Ringkasan yang selalu tampil) ---
  const renderHeader = () => {
    if (mode === 'attendance') {
      return (
        <>
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                Attendance Rules
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800/90 text-neutral-400 border border-neutral-700/60 hidden sm:inline-block">
                Absensi & Kedisiplinan
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 flex-wrap justify-center text-xs">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 font-mono text-[11px]"><span className="text-neutral-400">Hadir:</span><span className="font-bold text-emerald-400">+10 pt</span></div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-sky-950/40 border border-sky-500/30 font-mono text-[11px]"><span className="text-neutral-400">% Tepat:</span><span className="font-bold text-sky-400">+0.2 pt</span></div>
            <div className="h-4 w-[1px] bg-neutral-800 mx-1" />
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-yellow-950/40 border border-yellow-500/30 font-mono text-[11px]"><AlertTriangle className="w-3 h-3 text-yellow-400" /><span className="text-neutral-400">Telat:</span><span className="font-bold text-yellow-400">-5 pt</span></div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-rose-950/40 border border-rose-500/30 font-mono text-[11px]"><XCircle className="w-3 h-3 text-rose-400" /><span className="text-neutral-400">Absent:</span><span className="font-bold text-rose-400">-15 pt</span></div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-orange-950/40 border border-orange-500/30 font-mono text-[11px]"><LogOut className="w-3 h-3 text-orange-400" /><span className="text-neutral-400">Lupa Tap:</span><span className="font-bold text-orange-400">-2 pt</span></div>
          </div>
        </>
      );
    }

    if (mode === 'both') {
      return (
        <>
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
              <Award className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                Combined Rules
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800/90 text-neutral-400 border border-neutral-700/60 hidden sm:inline-block">
                Task + Attendance
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 flex-wrap justify-center text-xs">
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-950/40 border border-purple-500/30">
              <span className="font-bold text-purple-400 text-[11px] tracking-wide uppercase">Task Pts</span>
              <span className="font-mono text-[11px] font-bold text-neutral-200">50% Weight</span>
            </div>
            <span className="text-neutral-500 font-bold">+</span>
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-950/40 border border-blue-500/30">
              <span className="font-bold text-blue-400 text-[11px] tracking-wide uppercase">Attendance Pts</span>
              <span className="font-mono text-[11px] font-bold text-neutral-200">50% Weight</span>
            </div>
          </div>
        </>
      );
    }

    // Default: Task Mode
    return (
      <>
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Zap className="w-4 h-4 fill-purple-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              Task Scoring Rules
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800/90 text-neutral-400 border border-neutral-700/60 hidden sm:inline-block">
              Wb × Mt Formula
            </span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 flex-wrap justify-center text-xs">
          <div className="flex items-center gap-2 px-2 py-1 rounded bg-neutral-950/70 border border-yellow-500/25 font-mono text-[11px]"><span className="text-neutral-400 uppercase">High:</span><span className="font-bold text-yellow-400">10 pt</span></div>
          <div className="flex items-center gap-2 px-2 py-1 rounded bg-neutral-950/70 border border-blue-500/25 font-mono text-[11px]"><span className="text-neutral-400 uppercase">Normal:</span><span className="font-bold text-blue-400">5 pt</span></div>
          <div className="flex items-center gap-2 px-2 py-1 rounded bg-neutral-950/70 border border-neutral-700/50 font-mono text-[11px]"><span className="text-neutral-400 uppercase">Low:</span><span className="font-bold text-neutral-300">3 pt</span></div>
          <div className="h-4 w-[1px] bg-neutral-800 mx-1" />
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-emerald-400 font-bold flex items-center gap-1"><FastForward className="w-3 h-3" /> Early 1.2x</span>
            <span className="text-sky-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Done 1.0x</span>
            <span className="text-rose-400 font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> Late 0.7x</span>
          </div>
        </div>
      </>
    );
  };

  // --- 2. KOMPONEN DETAIL (Penjelasan Spesifik per Mode) ---
  const renderDetails = () => {
    if (!isOpen) return null;

    if (mode === 'attendance') {
      return (
        <div className="border-t border-neutral-800/80 bg-neutral-950/40 p-4 lg:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                <Calculator className="w-4 h-4" /> Variabel Formula Attendance
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-neutral-900/80 rounded-lg border border-neutral-800">
                  <span className="text-neutral-400 block mb-1">Kehadiran (Per Hari)</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">+10 Poin</span>
                </div>
                <div className="p-3 bg-neutral-900/80 rounded-lg border border-neutral-800">
                  <span className="text-neutral-400 block mb-1">Persentase Tepat Waktu</span>
                  <span className="font-mono text-sky-400 font-bold text-sm">+0.2 (Multiplier)</span>
                </div>
                <div className="p-3 bg-neutral-900/80 rounded-lg border border-neutral-800">
                  <span className="text-neutral-400 block mb-1">Terlambat (Per Hari)</span>
                  <span className="font-mono text-yellow-400 font-bold text-sm">-5 Poin (Penalti)</span>
                </div>
                <div className="p-3 bg-neutral-900/80 rounded-lg border border-neutral-800">
                  <span className="text-neutral-400 block mb-1">Lupa Tap Masuk / Pulang</span>
                  <span className="font-mono text-orange-400 font-bold text-sm">-2 Poin (Penalti)</span>
                </div>
                <div className="p-3 bg-neutral-900/80 rounded-lg border border-neutral-800 sm:col-span-2">
                  <span className="text-neutral-400 block mb-1">Mangkir / Tidak Masuk (Non-Libur)</span>
                  <span className="font-mono text-rose-400 font-bold text-sm">-15 Poin (Penalti Berat)</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-neutral-200 flex items-center gap-2">
                <Info className="w-4 h-4 text-neutral-400" /> Contoh Perhitungan
              </h4>

              <div className="p-3.5 bg-emerald-950/20 border border-emerald-900/50 rounded-lg text-xs space-y-2">
                <p className="font-semibold text-emerald-400">Skenario A: Disiplin Sempurna</p>
                <p className="text-neutral-400 leading-relaxed">
                  Bintang hadir 20 hari di bulan ini tanpa pernah telat (100% tepat waktu).
                </p>
                <ul className="font-mono text-[11px] space-y-1 text-neutral-300">
                  <li>Kehadiran: 20 hari × 10 = <span className="text-emerald-400">200</span></li>
                  <li>Persentase Tepat: 100(%) × 0.2 = <span className="text-sky-400">20</span></li>
                  <li className="pt-1 border-t border-neutral-800/50 mt-1">Total Skor = <span className="font-bold text-amber-400">220 Poin</span></li>
                </ul>
              </div>

              <div className="p-3.5 bg-yellow-950/20 border border-yellow-900/50 rounded-lg text-xs space-y-2">
                <p className="font-semibold text-yellow-400">Skenario B: Ada Keterlambatan</p>
                <p className="text-neutral-400 leading-relaxed">
                  Aris hadir 20 hari, tetapi 2 hari terlambat (artinya 18 hari tepat waktu = 90%).
                </p>
                <ul className="font-mono text-[11px] space-y-1 text-neutral-300">
                  <li>Kehadiran: 20 hari × 10 = <span className="text-emerald-400">200</span></li>
                  <li>Persentase Tepat: 90(%) × 0.2 = <span className="text-sky-400">18</span></li>
                  <li>Penalti Telat: 2 hari × 5 = <span className="text-rose-400">-10</span></li>
                  <li className="pt-1 border-t border-neutral-800/50 mt-1">Total Skor = <span className="font-bold text-amber-400">208 Poin</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (mode === 'both') {
      return (
        <div className="border-t border-neutral-800/80 bg-neutral-950/40 p-4 lg:p-5 text-xs text-neutral-300">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1 space-y-3">
              <h4 className="font-bold text-yellow-400 flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 fill-yellow-400" /> Penggabungan Skor (Combined)
              </h4>
              <p className="leading-relaxed text-neutral-400">
                Dalam mode ini, skor akhir Anda merupakan rata-rata berbobot antara kinerja pengerjaan Task Redmine dan Kedisiplinan Kehadiran Anda. Formula saat ini menetapkan bobot yang seimbang: <strong className="text-neutral-200">50% untuk Task, dan 50% untuk Attendance.</strong>
              </p>
              <div className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800 font-mono text-[11px]">
                Final Score = (Total Skor Task × 0.5) + (Total Skor Attendance × 0.5)
              </div>
            </div>

            <div className="w-full md:w-1/3 space-y-3">
              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/50 flex items-start gap-2.5">
                <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-400 block mb-1">Aturan Tie-Breaker</span>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">
                    Jika ada dua developer dengan Total Skor Akhir yang sama persis, peringkat akan ditentukan oleh:
                    <br /><span className="text-neutral-300 font-semibold">(1) On-Time Rate Task (%)</span>
                    <br /><span className="text-neutral-300 font-semibold">(2) Jumlah Task Diselesaikan</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default: Task Mode
    return (
      <div className="border-t border-neutral-800/80 bg-neutral-950/40 p-4 lg:p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
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

        <div className="p-3 rounded-lg bg-neutral-900/40 border border-neutral-800/80 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-neutral-200 block mb-0.5 text-xs">Ketentuan Status & Tanggal</span>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Task <span className="text-emerald-400 font-semibold font-mono">Closed (5)</span> menggunakan <code className="text-neutral-200">closed_on</code>, sedangkan task <span className="text-yellow-400 font-semibold font-mono">Feedback (4)</span> menggunakan <code className="text-neutral-200">updated_on</code> untuk dibandingkan dengan <code className="text-neutral-200">due_date</code>.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full rounded-xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md shadow-inner transition-all duration-200 overflow-hidden">
      {/* Header Interaktif */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 cursor-pointer hover:bg-neutral-800/40 transition-colors select-none"
      >
        {renderHeader()}

        {/* Toggle Chevron */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 hover:text-neutral-200 w-full xl:w-auto justify-end shrink-0">
          <span>{isOpen ? 'Tutup Detail' : 'Lihat Perhitungan'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* Body Penjelasan */}
      {renderDetails()}
    </div>
  );
};