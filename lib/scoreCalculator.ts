import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { RawTask, DeveloperStats, LeaderboardResponse } from './types';

const PRIORITY_WEIGHTS = {
    High: { onTime: 15, late: 3 },
    Normal: { onTime: 10, late: 2 },
    Low: { onTime: 5, late: 1 },
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

function calculateDevScores(tasks: RawTask[]): Map<string, {
    name: string;
    nrp: string;
    closedTasks: number;
    onTimeTasks: number;
    lateTasks: number;
    totalScore: number;
}> {
    const devMap = new Map();

    for (const task of tasks) {
        if (!devMap.has(task.nrp)) {
            devMap.set(task.nrp, {
                name: task.nama,
                nrp: task.nrp,
                closedTasks: 0,
                onTimeTasks: 0,
                lateTasks: 0,
                totalScore: 0,
            });
        }

        if (task.status_id === 5 && task.closed_on) {
            const dev = devMap.get(task.nrp);
            dev.closedTasks += 1;

            const closedDate = new Date(task.closed_on);
            const isNullDueDate = !task.due_date || task.due_date.trim() === '';
            const dueDate = isNullDueDate ? null : new Date(task.due_date!);

            const isOnTime = isNullDueDate || (dueDate ? closedDate <= dueDate : true);

            const priority = (task.priority_name in PRIORITY_WEIGHTS ? task.priority_name : 'Normal') as keyof typeof PRIORITY_WEIGHTS;
            const weight = PRIORITY_WEIGHTS[priority];

            if (isOnTime) {
                dev.onTimeTasks += 1;
                dev.totalScore += weight.onTime;
            } else {
                dev.lateTasks += 1;
                dev.totalScore += weight.late;
            }
        }
    }

    return devMap;
}

export function generateLeaderboard(
    allTasks: RawTask[],
    filterType: 'all' | 'this_month' | 'custom' = 'this_month',
    customStart?: string,
    customEnd?: string
): LeaderboardResponse {
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

    const currentPeriodTasks = allTasks.filter((t) => {
        if (!filterStartDate || !filterEndDate) return true;
        const taskDate = t.closed_on ? new Date(t.closed_on) : new Date(t.created_on);
        return taskDate >= filterStartDate && taskDate <= filterEndDate;
    });

    const yesterdayTasks = allTasks.filter((t) => {
        if (!t.closed_on) return false;
        const closedDate = new Date(t.closed_on);
        const inFilterRange = (!filterStartDate || closedDate >= filterStartDate);
        return inFilterRange && closedDate < startOfToday;
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
        const onTimeRate = dev.closedTasks > 0 ? Math.round((dev.onTimeTasks / dev.closedTasks) * 100) : 0;
        const gapToRank3 = currentRank > 3 ? Math.max(0, rank3Score - dev.totalScore + 1) : 0;

        return {
            nrp: dev.nrp,
            name: dev.name,
            totalTasks: dev.closedTasks,
            closedTasks: dev.closedTasks,
            onTimeTasks: dev.onTimeTasks,
            lateTasks: dev.lateTasks,
            onTimeRate,
            score: dev.totalScore,
            currentRank,
            previousRank,
            rankDelta,
            gapToRank3,
        };
    });

    const risingStarCandidate = [...leaderboard]
        .filter((d) => d.rankDelta > 0)
        .sort((a, b) => b.rankDelta - a.rankDelta)[0] || null;

    const totalClosed = leaderboard.reduce((acc, cur) => acc + cur.closedTasks, 0);
    const totalOnTime = leaderboard.reduce((acc, cur) => acc + cur.onTimeTasks, 0);
    const averageOnTimeRate = totalClosed > 0 ? Math.round((totalOnTime / totalClosed) * 100) : 0;

    const latestActivity = currentPeriodTasks
        .filter((t) => t.status_id === 5 && t.closed_on)
        .sort((a, b) => new Date(b.closed_on!).getTime() - new Date(a.closed_on!).getTime())
        .slice(0, 5)
        .map((t) => {
            const isNullDue = !t.due_date || t.due_date.trim() === '';
            const onTime = isNullDue || (t.due_date ? new Date(t.closed_on!) <= new Date(t.due_date) : true);
            return {
                developer: t.nama,
                taskTitle: t.isu_subject,
                closedAt: t.closed_on!,
                isOnTime: onTime,
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