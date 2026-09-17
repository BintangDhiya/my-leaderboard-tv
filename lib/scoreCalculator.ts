import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { RawTask, DeveloperStats, LeaderboardResponse } from './types';

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
        if (!devMap.has(task.nrp)) {
            devMap.set(task.nrp, {
                name: task.nama,
                nrp: task.nrp,
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

        const dev = devMap.get(task.nrp);

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
    filterType: 'all' | 'this_month' | 'custom' = 'this_month',
    customStart?: string,
    customEnd?: string,
    excludedNames: string[] = DEFAULT_EXCLUDED_NAMES
): LeaderboardResponse {
    const excludedSet = new Set(excludedNames.map((name) => name.trim().toUpperCase()));
    const validTasks = excludedSet.size > 0
        ? allTasks.filter((t) => !excludedSet.has((t.nama || '').trim().toUpperCase()))
        : allTasks;

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

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const currentPeriodTasks = validTasks.filter((t) => {
        if (!filterStartDate || !filterEndDate) return true;
        const taskDateStr = t.status_id === 4 ? (t.updated_on || t.due_date || t.created_on) : (t.closed_on || t.due_date || t.created_on);
        const taskDate = new Date(taskDateStr);
        return taskDate >= filterStartDate && taskDate <= filterEndDate;
    });

    const yesterdayTasks = validTasks.filter((t) => {
        const taskDateStr = t.status_id === 4 ? (t.updated_on || t.due_date) : (t.closed_on || t.due_date);
        if (!taskDateStr) return false;
        const taskDate = new Date(taskDateStr);
        const inFilterRange = (!filterStartDate || taskDate >= filterStartDate);
        return inFilterRange && taskDate < startOfToday;
    });

    const currentScoresMap = calculateDevScores(currentPeriodTasks);
    const sortedCurrent = Array.from(currentScoresMap.values()).sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        const rateA = a.closedTasks ? (a.onTimeTasks / a.closedTasks) : 0;
        const rateB = b.closedTasks ? (b.onTimeTasks / b.closedTasks) : 0;
        if (rateB !== rateA) return rateB - rateA;
        return b.closedTasks - a.closedTasks;
    });

    const yesterdayScoresMap = calculateDevScores(yesterdayTasks);
    const sortedYesterday = Array.from(yesterdayScoresMap.values()).sort((a, b) => b.totalScore - a.totalScore);
    const yesterdayRankMap = new Map<string, number>();
    sortedYesterday.forEach((dev, idx) => yesterdayRankMap.set(dev.nrp, idx + 1));

    const rank3Score = sortedCurrent[2]?.totalScore || 0;

    const leaderboard: DeveloperStats[] = sortedCurrent.map((dev, idx) => {
        const currentRank = idx + 1;
        const previousRank = yesterdayRankMap.get(dev.nrp) || currentRank;
        const rankDelta = previousRank - currentRank;
        // Pembagi On-Time Rate menggunakan totalProcessed (Closed + Feedback)
        const onTimeRate = dev.totalProcessed > 0 ? Math.round((dev.onTimeTasks / dev.totalProcessed) * 100) : 0;
        const prevDev = idx > 0 ? sortedCurrent[idx - 1] : null;
        const gapToAbove = prevDev ? Math.max(0, prevDev.totalScore - dev.totalScore) : 0;
        const gapToRank3 = currentRank > 3 ? Math.max(0, rank3Score - dev.totalScore + 1) : 0;

        return {
            nrp: dev.nrp,
            name: dev.name,
            totalTasks: dev.totalProcessed,
            closedTasks: dev.closedTasks,
            lebihCepatTasks: dev.lebihCepatTasks,
            doneTasks: dev.doneTasks,
            onTimeTasks: dev.onTimeTasks,
            lateTasks: dev.lateTasks,
            onTimeRate,
            score: dev.totalScore,
            currentRank,
            previousRank,
            rankDelta,
            gapToAbove,
            gapToRank3,
            newTasks: dev.newTasks,
            inProgressTasks: dev.inProgressTasks,
            feedbackTasks: dev.feedbackTasks,
        };
    });

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
        teamSummary: {
            totalClosedTasks: totalClosed,
            averageOnTimeRate,
            activeDevelopers: leaderboard.length,
        },
        latestActivity,
    };
}