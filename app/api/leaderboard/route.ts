import { NextRequest, NextResponse } from 'next/server';
import { parseCSVData, generateLeaderboard, DEFAULT_EXCLUDED_NAMES } from '@/lib/scoreCalculator';
import { getTasksFromDB, getAttendanceFromDB } from '@/lib/db';
import { RawTask, AttendanceSummary } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filter = (searchParams.get('filter') || 'this_month') as 'all' | 'this_month' | 'custom';
        const mode = (searchParams.get('mode') || 'both') as 'task' | 'attendance' | 'both';
        const role = (searchParams.get('role') || 'devs') as 'devs' | 'non-devs';
        const startDate = searchParams.get('start') || undefined;
        const endDate = searchParams.get('end') || undefined;
        const includeAll = searchParams.get('includeAll') === 'true';
        const excludedNames = includeAll ? [] : DEFAULT_EXCLUDED_NAMES;

        let rawTasks: RawTask[] = [];
        let attendanceData: AttendanceSummary[] = [];

        const isDbConfigured = Boolean(process.env.DB_SERVER && process.env.DB_NAME);
        const isAttDbConfigured = Boolean(process.env.ATT_DB_SERVER && process.env.ATT_DB_NAME);

        // 1. Tarik Data Tasks
        if (isDbConfigured) {
            try {
                rawTasks = await getTasksFromDB({
                    filterType: filter, customStart: startDate, customEnd: endDate, excludedNames, onlyClosed: false, role
                });
            } catch (dbError) {
                console.warn('[Leaderboard API] Failed to fetch Tasks, fallback to CSV:', dbError);
                rawTasks = parseCSVData();
            }
        } else {
            rawTasks = parseCSVData();
        }

        // 2. Tarik Data Attendance (Hanya dijalankan jika mode bukan 'task' only)
        if (isAttDbConfigured && (mode === 'attendance' || mode === 'both')) {
            try {
                attendanceData = await getAttendanceFromDB({
                    filterType: filter, customStart: startDate, customEnd: endDate, role
                });
            } catch (dbError) {
                console.warn('[Leaderboard API] Failed to fetch Attendance:', dbError);
            }
        }

        // 3. Gabungkan Data
        const leaderboardData = generateLeaderboard(
            rawTasks,
            attendanceData,
            filter,
            mode,
            startDate,
            endDate,
            includeAll ? [] : DEFAULT_EXCLUDED_NAMES,
            role
        );

        return NextResponse.json(leaderboardData, { status: 200 });
    } catch (error) {
        console.error('Leaderboard API Error:', error);
        return NextResponse.json({ error: 'Failed to process leaderboard data' }, { status: 500 });
    }
}