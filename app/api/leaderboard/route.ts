import { NextRequest, NextResponse } from 'next/server';
import { parseCSVData, generateLeaderboard, DEFAULT_EXCLUDED_NAMES } from '@/lib/scoreCalculator';
import { getTasksFromDB } from '@/lib/db';
import { RawTask } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filter = (searchParams.get('filter') || 'this_month') as 'all' | 'this_month' | 'custom';
        const startDate = searchParams.get('start') || undefined;
        const endDate = searchParams.get('end') || undefined;
        const includeAll = searchParams.get('includeAll') === 'true';
        const excludedNames = includeAll ? [] : DEFAULT_EXCLUDED_NAMES;

        let rawTasks: RawTask[] = [];
        const isDbConfigured = Boolean(process.env.DB_SERVER && process.env.DB_NAME);

        if (isDbConfigured) {
            try {
                rawTasks = await getTasksFromDB({
                    filterType: filter,
                    customStart: startDate,
                    customEnd: endDate,
                    excludedNames,
                });
            } catch (dbError) {
                console.warn(
                    '[Leaderboard API] Failed to fetch from MSSQL, falling back to dummy CSV:',
                    dbError instanceof Error ? dbError.message : dbError
                );
                rawTasks = parseCSVData();
            }
        } else {
            // DB not yet configured in environment variables, use CSV dummy
            rawTasks = parseCSVData();
        }

        const leaderboardData = generateLeaderboard(
            rawTasks,
            filter,
            startDate,
            endDate,
            includeAll ? [] : DEFAULT_EXCLUDED_NAMES
        );

        return NextResponse.json(leaderboardData, { status: 200 });
    } catch (error) {
        console.error('Leaderboard Calculation Error:', error);
        return NextResponse.json({ error: 'Failed to process leaderboard data' }, { status: 500 });
    }
}