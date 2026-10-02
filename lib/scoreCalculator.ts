import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { RawTask, DeveloperStats, LeaderboardResponse, AttendanceSummary } from './types';

// Bobot dasar berdasarkan prioritas (kompleksitas)
const PRIORITY_WEIGHTS: Record<string, number> = {
    High: 10,
    Normal: 5,
    Low: 3,
};

// Multiplier berdasarkan ketepatan waktu
const TIME_MULTIPLIERS = {
    LEBIH_CEPAT: 1.2,
    DONE: 1.0,
    LATE: 0.7,
};

export function parseCSVData(): RawTask[] {
    const filePath = path.join(process.cwd(), 'data', 'query_result.csv');
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    return parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: (value, context) => {
            if (['project_id', 'tracker_id', 'status_id', 'priority_id', 'done_ratio'].includes(context.column as string)) {
                return Number(value) || 0;
            }
            return value;
        },
    });
}

/**
 * Menentukan status ketepatan waktu untuk task yang Closed (5) atau Feedback (4)
 */
function getTaskTimeCategory(task: RawTask): 'LEBIH_CEPAT' | 'DONE' | 'LATE' {
    const isNullDueDate = !task.due_date || task.due_date.trim() === '';
    if (isNullDueDate) return 'DONE';

    // Jika Feedback (4), gunakan updated_on. Jika Closed (5), gunakan closed_on.
    const completionDateStr = task.status_id === 4 ? task.updated_on : task.closed_on;
    if (!completionDateStr || completionDateStr.trim() === '') return 'DONE';

    const completionDate = new Date(completionDateStr);
    const dueDate = new Date(task.due_date!);

    // Bandingkan hanya bagian tanggal (tanpa jam)
    const compDateOnly = new Date(completionDate.getFullYear(), completionDate.getMonth(), completionDate.getDate());
    const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

    if (compDateOnly < dueDateOnly) {
        return 'LEBIH_CEPAT';
    } else if (compDateOnly.getTime() === dueDateOnly.getTime()) {
        return 'DONE';
    } else {
        return 'LATE';
    }
}

// Canonical NRP mapping - attendance DB NRP is the source of truth.
// If Redmine/other systems use a different NRP, alias it to the attendance DB value.
const NRP_ALIASES: Record<string, string> = {
    'JIMM21005': 'JIMM21009', // Rafi Fauzan: normalize any old alias to attendance DB NRP
    'JI260074': 'JI260374',  // Bintang Dhiya: normalize any old alias to attendance DB NRP
};

// Canonical Name mapping for name variations:
const NAME_ALIASES: Record<string, string> = {
    'MUHAMMAD TAUFIQ AZRA HAROMAIN': 'M. TAUFIQ AZRA HAROMAIN',
    'RAFI FAUZAN': 'RAFI FAUZAN NUGROHO',
};

export const MONITORED_DEVELOPERS = [
    { nrp: 'JI260011', name: 'AHMAD ANWAR HIDAYAT' },
    { nrp: 'JICE25003', name: 'RANDY AFIF HERLAMBANG' },
    { nrp: 'JICE25004', name: 'FARHAN DWICAHYO' },
    { nrp: 'JICE25007', name: 'HANUNG RIZQI WIDIANTO' },
    { nrp: 'JICE25008', name: 'MUHAMMAD ATSAL RIZANDRI' },
    { nrp: 'JIMT22012', name: 'OVIANTO' },
    { nrp: 'JIMT24002', name: 'YOSES DWI MAHESWARA' },
    { nrp: 'JIMT24006', name: 'M. TAUFIQ AZRA HAROMAIN' },
    { nrp: 'JIMT25004', name: 'ARIS PURNOMO' },
    { nrp: 'JIMM21009', name: 'RAFI FAUZAN NUGROHO' },
    { nrp: 'JI260374', name: 'BINTANG DHIYA ABIYYUSALAM' }
];

export function getCanonicalNrp(nrp: string): string {
    const clean = (nrp || '').trim().toUpperCase();
    return NRP_ALIASES[clean] || clean;
}

export function getCanonicalName(name: string): string {
    const clean = (name || '').trim().toUpperCase();
    return NAME_ALIASES[clean] || clean;
}

function calculateDevScores(tasks: RawTask[]): Map<string, {
    name: string;
    nrp: string;
    totalProcessed: number;
    closedTasks: number;
    lebihCepatTasks: number;
    doneTasks: number;
    onTimeTasks: number;
    lateTasks: number;
    totalScore: number;
    newTasks: number;
    inProgressTasks: number;
    feedbackTasks: number;
}> {
    const devMap = new Map();

    for (const task of tasks) {
        const cNrp = getCanonicalNrp(task.nrp);
        const cName = getCanonicalName(task.nama);

        if (!devMap.has(cNrp)) {
            devMap.set(cNrp, {
                name: cName,
                nrp: cNrp,
                totalProcessed: 0,
                closedTasks: 0,
                lebihCepatTasks: 0,
                doneTasks: 0,
                onTimeTasks: 0,
                lateTasks: 0,
                totalScore: 0,
                newTasks: 0,
                inProgressTasks: 0,
                feedbackTasks: 0,
            });
        }

        const dev = devMap.get(cNrp);

        // Track breakdown status
        if (task.status_id === 1) {
            dev.newTasks += 1;
        } else if (task.status_id === 2) {
            dev.inProgressTasks += 1;
        } else if (task.status_id === 4) {
            dev.feedbackTasks += 1;
        } else if (task.status_id === 5) {
            dev.closedTasks += 1;
        }

        // Hitung Skor & Performance Waktu HANYA untuk Closed (5) dan Feedback (4)
        if (task.status_id === 5 || task.status_id === 4) {
            dev.totalProcessed += 1;

            const priority = (task.priority_name in PRIORITY_WEIGHTS ? task.priority_name : 'Normal') as keyof typeof PRIORITY_WEIGHTS;
            const basePoints = PRIORITY_WEIGHTS[priority] || 5;

            const timeCategory = getTaskTimeCategory(task); // Menggunakan updated_on jika status 4, closed_on jika status 5
            const multiplier = TIME_MULTIPLIERS[timeCategory];

            // Tambahkan skor
            dev.totalScore += basePoints * multiplier;

            if (timeCategory === 'LEBIH_CEPAT') {
                dev.lebihCepatTasks += 1;
                dev.onTimeTasks += 1;
            } else if (timeCategory === 'DONE') {
                dev.doneTasks += 1;
                dev.onTimeTasks += 1;
            } else {
                dev.lateTasks += 1;
            }
        }
    }

    devMap.forEach((dev) => {
        dev.totalScore = Math.round(dev.totalScore * 10) / 10;
    });

    return devMap;
}

export const DEFAULT_EXCLUDED_NAMES: string[] = [
    'BAGAS EKO PRASETYO',
    'ADI PRANOTO',
    'FEBRIANTO JAYA WARDANA',
    'SUGIYANTO PAMA',
    'RIDHWAN WAHYUDI',
    'TUBAGUS MAULANA AGHNI',
    'OKTAVIA NUR AZIZAH',
    'TEGAR NAUFAL HANIP',
    'MUHAMMAD FAUZAN ACYUTO',
    'MOHAMAD BAYU AFRIANSYAH',
    'DESTRY ZUMAR SASTIANI',
    'M. PUTRA TAMA BAYU HARGIO',
    'TITIN ERVINA SARI',
];

export function generateLeaderboard(
    allTasks: RawTask[],
    attendanceData: AttendanceSummary[] = [],
    filterType: 'all' | 'this_month' | 'custom' = 'this_month',
    mode: 'task' | 'attendance' | 'both' = 'both',
    customStart?: string,
    customEnd?: string,
    excludedNames: string[] = DEFAULT_EXCLUDED_NAMES
): LeaderboardResponse {

    // --- BOBOT KOMBINASI SKOR (BISA DIUBAH DI SINI) ---
    const TASK_WEIGHT = 0.5; // 50%
    const ATTENDANCE_WEIGHT = 0.5; // 50%

    // 1. Filter Tasks & Kalkulasi Skor Task
    const excludedSet = new Set(excludedNames.map((n) => n.trim().toUpperCase()));
    const validTasks = allTasks.filter((t) => !excludedSet.has((t.nama || '').trim().toUpperCase()));
    const now = new Date();
    let filterStartDate: Date | null = null;
    let filterEndDate: Date | null = null;

    if (filterType === 'this_month') {
        filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        filterEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (filterType === 'custom' && customStart && customEnd) {
        filterStartDate = new Date(customStart);
        filterEndDate = new Date(customEnd);
    }

    const currentPeriodTasks = validTasks.filter((t) => {
        if (!filterStartDate || !filterEndDate) return true;
        const taskDateStr = t.status_id === 4 ? (t.updated_on || t.due_date || t.created_on) : (t.closed_on || t.due_date || t.created_on);
        const taskDate = new Date(taskDateStr);
        return taskDate >= filterStartDate && taskDate <= filterEndDate;
    });

    const currentScoresMap = calculateDevScores(currentPeriodTasks);

    // 2. Map Attendance Data agar mudah dicari berdasarkan Canonical NRP
    const attByNrp = new Map<string, AttendanceSummary>();
    attendanceData.forEach(att => {
        const cNrp = getCanonicalNrp(att.nrp);
        attByNrp.set(cNrp, att);
    });

    // 3. Gabungkan Semua Developer secara unik berdasarkan Canonical NRP
    const unifiedDevs = new Map<string, { nrp: string, name: string }>();

    // --- TAMBAHKAN LOOP INI (Menjamin 11 karyawan selalu ada) ---
    MONITORED_DEVELOPERS.forEach(dev => {
        unifiedDevs.set(getCanonicalNrp(dev.nrp), { nrp: dev.nrp, name: dev.name });
    });

    // Menimpa/mengupdate data jika mereka punya skor task
    currentScoresMap.forEach((dev) => {
        const cNrp = getCanonicalNrp(dev.nrp);
        const cName = getCanonicalName(dev.name);
        unifiedDevs.set(cNrp, { nrp: cNrp, name: cName });
    });

    // Menimpa/mengupdate data jika mereka punya skor attendance
    attendanceData.forEach(att => {
        const cNrp = getCanonicalNrp(att.nrp);
        const cName = getCanonicalName(att.namaKaryawan);
        // Tetap set untuk memastikan formatting nama mengikuti sumber terbaru
        unifiedDevs.set(cNrp, { nrp: cNrp, name: cName });
    });

    // 4. Susun Data Mentah ke Array
    let leaderboardRaw: DeveloperStats[] = [];

    unifiedDevs.forEach((baseDev, cNrp) => {
        const normName = getCanonicalName(baseDev.name);
        // Abaikan jika masuk daftar exclude
        if (excludedSet.has(normName) || excludedSet.has(baseDev.name.toUpperCase())) return;

        const devTask = currentScoresMap.get(cNrp) || {
            totalProcessed: 0, closedTasks: 0, lebihCepatTasks: 0, doneTasks: 0,
            onTimeTasks: 0, lateTasks: 0, totalScore: 0, newTasks: 0, inProgressTasks: 0, feedbackTasks: 0
        };
        const devAtt = attByNrp.get(cNrp);

        const tScore = devTask.totalScore || 0;
        const aScore = devAtt ? devAtt.skorAkhir : 0;

        // Tentukan skor murni sesuai mode yang dipilih
        let finalScore = 0;
        if (mode === 'task') {
            finalScore = tScore;
        } else if (mode === 'attendance') {
            finalScore = aScore; // Murni mengambil Skor Akhir dari Metabase SQL
        } else {
            finalScore = (tScore * TASK_WEIGHT) + (aScore * ATTENDANCE_WEIGHT);
        }

        const onTimeRate = devTask.totalProcessed > 0 ? Math.round((devTask.onTimeTasks / devTask.totalProcessed) * 100) : 0;

        leaderboardRaw.push({
            nrp: cNrp,
            name: baseDev.name,
            totalTasks: devTask.totalProcessed,
            closedTasks: devTask.closedTasks,
            lebihCepatTasks: devTask.lebihCepatTasks,
            doneTasks: devTask.doneTasks,
            onTimeTasks: devTask.onTimeTasks,
            lateTasks: devTask.lateTasks,
            onTimeRate,

            // Attendance Properties
            totalHadir: devAtt ? devAtt.totalKehadiran : 0,
            totalDinas: devAtt ? devAtt.totalHariDinas : 0,
            totalWeekend: devAtt ? devAtt.totalMskWeekend : 0,
            totalTelat: devAtt ? devAtt.totalTerlambat : 0,
            totalTidakMasuk: devAtt ? devAtt.totalTidakMasuk : 0,
            totalLupaTap: devAtt ? (devAtt.totalLupaTapMasuk + devAtt.totalLupaTapPulang) : 0,
            persentaseTerlambat: devAtt ? devAtt.persentaseTerlambat : '0%',
            persentaseTidakTerlambat: devAtt ? devAtt.persentaseTidakTerlambat : '0%',
            keteranganDinas: devAtt ? devAtt.keteranganDinas : '-',

            // Score Breakdowns
            taskScore: tScore,
            attendanceScore: aScore,
            score: Math.round(finalScore * 10) / 10,

            // Placeholders
            currentRank: 0, previousRank: 0, rankDelta: 0, gapToAbove: 0, gapToRank3: 0,
            newTasks: devTask.newTasks, inProgressTasks: devTask.inProgressTasks, feedbackTasks: devTask.feedbackTasks,
        });
    });

    // 5. SORTING UTAMA BERDASARKAN MODE SKOR
    leaderboardRaw.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (mode === 'attendance') {
            return b.totalHadir - a.totalHadir;
        }
        if (b.onTimeRate !== a.onTimeRate) return b.onTimeRate - a.onTimeRate;
        return b.totalTasks - a.totalTasks;
    });

    // (Pendukung) Hitung rank kemarin berdasar tasks saja untuk fallback Tren Rank
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayTasks = validTasks.filter((t) => {
        const taskDateStr = t.status_id === 4 ? (t.updated_on || t.due_date) : (t.closed_on || t.due_date);
        if (!taskDateStr) return false;
        const taskDate = new Date(taskDateStr);
        return (!filterStartDate || taskDate >= filterStartDate) && taskDate < startOfToday;
    });
    const yesterdayScoresMap = calculateDevScores(yesterdayTasks);
    const sortedYesterday = Array.from(yesterdayScoresMap.values()).sort((a, b) => b.totalScore - a.totalScore);
    const yesterdayRankMap = new Map<string, number>();
    sortedYesterday.forEach((dev, idx) => yesterdayRankMap.set(dev.nrp, idx + 1));

    // 6. Finishing (Hitung Gap & Rank Delta dengan standar SQL RANK)
    const rank3Score = leaderboardRaw[2]?.score || 0;

    const leaderboard: DeveloperStats[] = [];
    let currentRank = 1;

    for (let idx = 0; idx < leaderboardRaw.length; idx++) {
        const dev = leaderboardRaw[idx];
        const prevDev = idx > 0 ? leaderboardRaw[idx - 1] : null;

        if (prevDev && dev.score === prevDev.score) {
            currentRank = leaderboard[idx - 1].currentRank;
        } else {
            currentRank = idx + 1;
        }

        const defaultPrevRank = sortedYesterday.length > 0 ? sortedYesterday.length + 1 : currentRank;
        const previousRank = yesterdayRankMap.get(dev.nrp) ?? defaultPrevRank;
        const rankDelta = previousRank - currentRank;

        const gapToAbove = prevDev ? Math.max(0, prevDev.score - dev.score) : 0;
        const gapToRank3 = currentRank > 3 ? Math.max(0, rank3Score - dev.score + 1) : 0;

        leaderboard.push({
            ...dev,
            currentRank,
            previousRank,
            rankDelta,
            gapToAbove: Math.round(gapToAbove * 10) / 10,
            gapToRank3: Math.round(gapToRank3 * 10) / 10,
        });
    }

    const risingStarCandidate = [...leaderboard]
        .filter((d) => d.rankDelta > 0)
        .sort((a, b) => b.rankDelta - a.rankDelta)[0] || null;

    const totalClosed = leaderboard.reduce((acc, cur) => acc + cur.closedTasks, 0);
    const totalOnTime = leaderboard.reduce((acc, cur) => acc + cur.onTimeTasks, 0);
    const averageOnTimeRate = totalClosed > 0 ? Math.round((totalOnTime / totalClosed) * 100) : 0;

    const latestActivity = currentPeriodTasks
        .filter((t) => t.status_id === 5 || t.status_id === 4)
        .sort((a, b) => {
            const dateA = a.status_id === 4 ? (a.updated_on || a.due_date) : (a.closed_on || a.due_date);
            const dateB = b.status_id === 4 ? (b.updated_on || b.due_date) : (b.closed_on || b.due_date);
            const timeA = dateA ? new Date(dateA).getTime() : 0;
            const timeB = dateB ? new Date(dateB).getTime() : 0;
            return timeB - timeA;
        })
        .slice(0, 5)
        .map((t) => {
            const timeCat = getTaskTimeCategory(t);
            const completedAt = t.status_id === 4 ? (t.updated_on || t.due_date || '') : (t.closed_on || t.due_date || '');
            return {
                developer: t.nama,
                taskTitle: t.isu_subject,
                closedAt: completedAt,
                isOnTime: timeCat === 'LEBIH_CEPAT' || timeCat === 'DONE',
            };
        });

    return {
        leaderboard,
        podium: leaderboard.slice(0, 3),
        risingStar: risingStarCandidate,
        teamSummary: { totalClosedTasks: totalClosed, averageOnTimeRate, activeDevelopers: leaderboard.length },
        latestActivity,
    };
}