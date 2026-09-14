import sql from 'mssql';
import { RawTask } from './types';

// Global cached connection pool for Next.js hot-reloading
let poolPromise: Promise<sql.ConnectionPool> | null = null;

export function getDbConfig(): sql.config {
    return {
        user: process.env.DB_USER || '',
        password: process.env.DB_PASSWORD || '',
        server: process.env.DB_SERVER || '',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1433,
        database: process.env.DB_NAME || '',
        options: {
            encrypt: process.env.DB_ENCRYPT === 'true',
            trustServerCertificate: process.env.DB_TRUST_SERVER_CERT !== 'false', // Default true for internal MSSQL
            connectTimeout: 8000,
            requestTimeout: 20000,
        },
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000,
        },
    };
}

export async function getDbPool(): Promise<sql.ConnectionPool> {
    const config = getDbConfig();

    if (!config.server || !config.database) {
        throw new Error('Database server or database name is not configured in environment variables');
    }

    if (!poolPromise) {
        poolPromise = new sql.ConnectionPool(config)
            .connect()
            .then((pool) => {
                console.log(`[MSSQL] Successfully connected to ${config.server}:${config.port}/${config.database}`);
                return pool;
            })
            .catch((err) => {
                poolPromise = null;
                throw err;
            });
    }

    return poolPromise;
}

export interface GetTasksFilter {
    filterType?: 'all' | 'this_month' | 'custom';
    customStart?: string;
    customEnd?: string;
    excludedNames?: string[];
    onlyClosed?: boolean; // Default: true (status_id = 5)
}

/**
 * Fetch tasks from Microsoft SQL Server with parameterized WHERE clause filters.
 * Uses placeholder table name configurable via DB_TABLE (default: 'tasks').
 */
export async function getTasksFromDB(filterOptions?: GetTasksFilter): Promise<RawTask[]> {
    const pool = await getDbPool();
    const tableName = process.env.DB_TABLE || 'tasks';

    const request = pool.request();
    const conditions: string[] = [];

    // 1. Filter status_id = 5 (Closed tasks only)
    const onlyClosed = filterOptions?.onlyClosed !== false;
    if (onlyClosed) {
        conditions.push('status_id = 5 AND closed_on IS NOT NULL');
    }

    // 2. Filter rentang tanggal (Date range)
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (filterOptions?.filterType === 'this_month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (filterOptions?.filterType === 'custom' && filterOptions.customStart && filterOptions.customEnd) {
        startDate = new Date(filterOptions.customStart);
        endDate = new Date(filterOptions.customEnd);
    }

    if (startDate) {
        request.input('startDate', sql.DateTime2, startDate);
        conditions.push('closed_on >= @startDate');
    }
    if (endDate) {
        request.input('endDate', sql.DateTime2, endDate);
        conditions.push('closed_on <= @endDate');
    }

    // 3. Filter nama yang dikecualikan (Excluded names)
    if (filterOptions?.excludedNames && filterOptions.excludedNames.length > 0) {
        const nameParams = filterOptions.excludedNames.map((name, i) => {
            const paramName = `excName${i}`;
            request.input(paramName, sql.NVarChar, name.trim().toUpperCase());
            return `@${paramName}`;
        });
        conditions.push(`UPPER(LTRIM(RTRIM(nama))) NOT IN (${nameParams.join(', ')})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Query columns matching the RawTask interface
    const query = `
        SELECT 
            ISNULL(login, '') AS login,
            ISNULL(nrp, '') AS nrp,
            ISNULL(nama, '') AS nama,
            ISNULL(project_id, 0) AS project_id,
            ISNULL(project_name, '') AS project_name,
            ISNULL(tracker_id, 0) AS tracker_id,
            ISNULL(tracker_name, '') AS tracker_name,
            ISNULL(CAST(isu_id AS VARCHAR(50)), '') AS isu_id,
            ISNULL(isu_subject, '') AS isu_subject,
            description,
            start_date,
            due_date,
            plan_date,
            created_on,
            closed_on,
            actual_date,
            ISNULL(status_id, 0) AS status_id,
            ISNULL(status_desc, '') AS status_desc,
            ISNULL(priority_id, 0) AS priority_id,
            ISNULL(priority_name, 'Normal') AS priority_name,
            ISNULL(done_ratio, 0) AS done_ratio
        FROM ${tableName}
        ${whereClause}
    `;

    const result = await request.query(query);

    return result.recordset.map((row) => {
        const formatDate = (val: unknown): string | undefined => {
            if (!val) return undefined;
            if (val instanceof Date) return val.toISOString();
            return String(val);
        };

        return {
            login: String(row.login || ''),
            nrp: String(row.nrp || ''),
            nama: String(row.nama || ''),
            project_id: Number(row.project_id) || 0,
            project_name: String(row.project_name || ''),
            tracker_id: Number(row.tracker_id) || 0,
            tracker_name: String(row.tracker_name || ''),
            isu_id: String(row.isu_id || ''),
            isu_subject: String(row.isu_subject || ''),
            description: row.description ? String(row.description) : undefined,
            start_date: formatDate(row.start_date) || '',
            due_date: formatDate(row.due_date),
            plan_date: row.plan_date !== null && row.plan_date !== undefined ? Number(row.plan_date) : undefined,
            created_on: formatDate(row.created_on) || new Date().toISOString(),
            closed_on: formatDate(row.closed_on),
            actual_date: row.actual_date !== null && row.actual_date !== undefined ? Number(row.actual_date) : undefined,
            status_id: Number(row.status_id) || 0,
            status_desc: String(row.status_desc || ''),
            priority_id: Number(row.priority_id) || 0,
            priority_name: String(row.priority_name || 'Normal'),
            done_ratio: Number(row.done_ratio) || 0,
        };
    });
}
