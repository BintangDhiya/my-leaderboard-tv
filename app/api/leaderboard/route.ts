import { NextRequest, NextResponse } from 'next/server';
import { parseCSVData, generateLeaderboard, DEFAULT_EXCLUDED_NAMES } from '@/lib/scoreCalculator';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filter = (searchParams.get('filter') || 'this_month') as 'all' | 'this_month' | 'custom';
        const startDate = searchParams.get('start') || undefined;
        const endDate = searchParams.get('end') || undefined;
        const includeAll = searchParams.get('includeAll') === 'true';

        const rawTasks = parseCSVData();
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