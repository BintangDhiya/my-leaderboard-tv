import sql from 'mssql';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { RawTask, AttendanceSummary } from './types';

// =========================================================
// TASK DB CONNECTION
// =========================================================
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
            trustServerCertificate: process.env.DB_TRUST_SERVER_CERT !== 'false',
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
                console.log(`[MSSQL] Successfully connected to Task DB at ${config.server}:${config.port}/${config.database}`);
                return pool;
            })
            .catch((err) => {
                poolPromise = null;
                throw err;
            });
    }
    return poolPromise;
}

// =========================================================
// ATTENDANCE DB CONNECTION (jiepsqco423)
// =========================================================
let attPoolPromise: Promise<sql.ConnectionPool> | null = null;

export function getAttDbConfig(): sql.config {
    return {
        user: process.env.ATT_DB_USER || '',
        password: process.env.ATT_DB_PASSWORD || '',
        server: process.env.ATT_DB_SERVER || '',
        port: process.env.ATT_DB_PORT ? parseInt(process.env.ATT_DB_PORT, 10) : 1433,
        database: process.env.ATT_DB_NAME || '',
        options: {
            encrypt: process.env.ATT_DB_ENCRYPT === 'true',
            trustServerCertificate: process.env.ATT_DB_TRUST_SERVER_CERT !== 'false',
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

export async function getAttDbPool(): Promise<sql.ConnectionPool> {
    const config = getAttDbConfig();
    if (!config.server || !config.database) {
        throw new Error('Attendance DB server or database name is not configured in environment variables');
    }
    if (!attPoolPromise) {
        attPoolPromise = new sql.ConnectionPool(config)
            .connect()
            .then((pool) => {
                console.log(`[MSSQL] Successfully connected to Attendance DB at ${config.server}:${config.port}/${config.database}`);
                return pool;
            })
            .catch((err) => {
                attPoolPromise = null;
                throw err;
            });
    }
    return attPoolPromise;
}

export interface GetFilter {
    filterType?: 'all' | 'this_month' | 'custom';
    customStart?: string;
    customEnd?: string;
    excludedNames?: string[];
    onlyClosed?: boolean;
}

// =========================================================
// GET TASKS FROM REDMINE DB
// =========================================================
export async function getTasksFromDB(filterOptions?: GetFilter): Promise<RawTask[]> {
    const pool = await getDbPool();
    const tableName = process.env.DB_TABLE || 'tasks';
    const request = pool.request();
    const conditions: string[] = [];

    const onlyClosed = filterOptions?.onlyClosed !== false;
    if (onlyClosed) conditions.push('status_id = 5');

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();

    if (filterOptions?.filterType === 'this_month') {
        const startStr = `${year}-${String(month + 1).padStart(2, '0')}-01 00:00:00`;
        const endStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')} 23:59:59`;
        request.input('startDate', sql.VarChar, startStr);
        request.input('endDate', sql.VarChar, endStr);
        conditions.push('due_date >= CAST(@startDate AS DATETIME2)');
        conditions.push('due_date <= CAST(@endDate AS DATETIME2)');
    } else if (filterOptions?.filterType === 'custom' && filterOptions.customStart && filterOptions.customEnd) {
        request.input('startDate', sql.VarChar, filterOptions.customStart);
        request.input('endDate', sql.VarChar, filterOptions.customEnd);
        conditions.push('due_date >= CAST(@startDate AS DATETIME2)');
        conditions.push('due_date <= CAST(@endDate AS DATETIME2)');
    }

    const monitoredNRPs = [
        'JI260011', 'JICE25003', 'JICE25004', 'JICE25007', 'JICE25008',
        'JIMT22012', 'JIMT24002', 'JIMT24006', 'JIMT25004', 'JIMM21009', 'JI260374',
        'JIMM21005', 'JI260074', 'JI260398' // Termasuk variasi/alias nrp lama agar aman
    ];

    const nrpParams = monitoredNRPs.map((nrp, i) => {
        const paramName = `monitoredNrp${i}`;
        request.input(paramName, sql.VarChar, nrp);
        return `@${paramName}`;
    });
    conditions.push(`nrp IN (${nrpParams.join(', ')})`);

    if (filterOptions?.excludedNames && filterOptions.excludedNames.length > 0) {
        const nameParams = filterOptions.excludedNames.map((name, i) => {
            const paramName = `excName${i}`;
            request.input(paramName, sql.NVarChar, name.trim().toUpperCase());
            return `@${paramName}`;
        });
        conditions.push(`UPPER(LTRIM(RTRIM(nama))) NOT IN (${nameParams.join(', ')})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
        SELECT 
            ISNULL(login, '') AS login, ISNULL(nrp, '') AS nrp, ISNULL(nama, '') AS nama,
            ISNULL(project_id, 0) AS project_id, ISNULL(project_name, '') AS project_name,
            ISNULL(tracker_id, 0) AS tracker_id, ISNULL(tracker_name, '') AS tracker_name,
            ISNULL(CAST(isu_id AS VARCHAR(50)), '') AS isu_id, ISNULL(isu_subject, '') AS isu_subject,
            description, start_date, due_date, plan_date, created_on, closed_on, actual_date,
            ISNULL(status_id, 0) AS status_id, ISNULL(status_desc, '') AS status_desc,
            ISNULL(priority_id, 0) AS priority_id, ISNULL(priority_name, 'Normal') AS priority_name,
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
            login: String(row.login || ''), nrp: String(row.nrp || ''), nama: String(row.nama || ''),
            project_id: Number(row.project_id) || 0, project_name: String(row.project_name || ''),
            tracker_id: Number(row.tracker_id) || 0, tracker_name: String(row.tracker_name || ''),
            isu_id: String(row.isu_id || ''), isu_subject: String(row.isu_subject || ''),
            description: row.description ? String(row.description) : undefined,
            start_date: formatDate(row.start_date) || '', due_date: formatDate(row.due_date),
            plan_date: row.plan_date !== null && row.plan_date !== undefined ? Number(row.plan_date) : undefined,
            created_on: formatDate(row.created_on) || new Date().toISOString(), closed_on: formatDate(row.closed_on),
            actual_date: row.actual_date !== null && row.actual_date !== undefined ? Number(row.actual_date) : undefined,
            status_id: Number(row.status_id) || 0, status_desc: String(row.status_desc || ''),
            priority_id: Number(row.priority_id) || 0, priority_name: String(row.priority_name || 'Normal'),
            done_ratio: Number(row.done_ratio) || 0,
        };
    });
}

// =========================================================
// CSV PARSER HELPERS FOR ATTENDANCE
// =========================================================
function getHolidayValuesSQL(): string {
    try {
        const filePath = path.join(process.cwd(), 'data', 'holiday2026.csv');
        if (!fs.existsSync(filePath)) return "('1900-01-01', 'DUMMY')";
        const records = parse(fs.readFileSync(filePath, 'utf-8'), { columns: true, skip_empty_lines: true });
        if (records.length === 0) return "('1900-01-01', 'DUMMY')";
        return records.map((r: any) => `('${r.holiday_date}', '${r.holiday_name.replace(/'/g, "''")}')`).join(',\n');
    } catch (e) {
        return "('1900-01-01', 'DUMMY')";
    }
}

function getDinasValuesSQL(): string {
    try {
        const filePath = path.join(process.cwd(), 'data', 'master-list-dinas.csv');
        if (!fs.existsSync(filePath)) return "('1900-01-01', 'DUMMY', 'DUMMY', 'DUMMY')";
        const records = parse(fs.readFileSync(filePath, 'utf-8'), { columns: true, skip_empty_lines: true });
        if (records.length === 0) return "('1900-01-01', 'DUMMY', 'DUMMY', 'DUMMY')";
        return records.map((r: any) => `('${r.tanggal}', '${r.nrp}', '${r.nama.replace(/'/g, "''")}', '${r.keperluan.replace(/'/g, "''")}')`).join(',\n');
    } catch (e) {
        return "('1900-01-01', 'DUMMY', 'DUMMY', 'DUMMY')";
    }
}

// =========================================================
// GET ATTENDANCE SUMMARY FROM DB_ATTENDANCE
// =========================================================
export async function getAttendanceFromDB(filterOptions?: GetFilter): Promise<AttendanceSummary[]> {
    const pool = await getAttDbPool();
    const request = pool.request();

    // Default Date Range menggunakan local time format YYYY-MM-DD
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

    let startDateStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    let endDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;

    if (filterOptions?.filterType === 'custom' && filterOptions.customStart && filterOptions.customEnd) {
        startDateStr = filterOptions.customStart.slice(0, 10);
        endDateStr = filterOptions.customEnd.slice(0, 10);
    } else if (filterOptions?.filterType === 'all') {
        startDateStr = '2024-01-01';
        endDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    // Bind parameters as VarChar to prevent UTC offset shifts
    request.input('startDate', sql.VarChar(10), startDateStr);
    request.input('endDate', sql.VarChar(10), endDateStr);

    // --- KALKULASI ZONA WAKTU WIB UNTUK REAL-TIME BADGES ---
    const wibFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    const nowParts = wibFormatter.format(now).split(', ');
    const todayDateStr = nowParts[0];
    const currentTimeStr = nowParts[1] === '24:00:00' ? '00:00:00' : nowParts[1];

    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayDateStr = wibFormatter.format(yesterday).split(', ')[0];

    request.input('todayDate', sql.VarChar(10), todayDateStr);
    request.input('yesterdayDate', sql.VarChar(10), yesterdayDateStr);
    request.input('currentTime', sql.VarChar(8), currentTimeStr);

    // Get CSV Data as VALUES snippet
    const holidayValues = getHolidayValuesSQL();
    const dinasValues = getDinasValuesSQL();

    const query = `
        WITH 
        weight_config AS (
            SELECT 10.0 AS w_kehadiran, 0.2 AS w_persen_hadir, 5.0 AS w_terlambat, 15.0 AS w_tidak_masuk, 2.0 AS w_lupa_masuk, 2.0 AS w_lupa_pulang      
        ),
        oc_dinas AS (
            SELECT CAST(tanggal AS DATE) AS dinas_tanggal, nrp, nama AS dinas_nama, keperluan
            FROM (VALUES ${dinasValues}) AS d(tanggal, nrp, nama, keperluan) WHERE nrp != 'DUMMY'
        ),
        calendar AS (
            SELECT CAST(@startDate AS DATE) AS tgl
            UNION ALL
            SELECT DATEADD(DAY, 1, tgl) FROM calendar
            WHERE tgl < CAST(@endDate AS DATE) AND tgl < CAST(GETDATE() AS DATE)
        ),
        holiday_list AS (
            SELECT CAST(tanggal AS DATE) AS tanggal, UPPER(keterangan) AS keterangan
            FROM (VALUES ${holidayValues}) AS h(tanggal, keterangan) WHERE keterangan != 'DUMMY'
        ),
        employee_list AS (
            SELECT nrp, company, name FROM (
                VALUES 
                ('JI260011',  'MTG', 'AHMAD ANWAR HIDAYAT'), ('JICE25003', 'MTG', 'RANDY AFIF HERLAMBANG'),
                ('JICE25004', 'MTG', 'FARHAN DWICAHYO'), ('JICE25007', 'MTG', 'HANUNG RIZQI WIDIANTO'),
                ('JICE25008', 'MTG', 'MUHAMMAD ATSAL RIZANDRI'), ('JIMT22012', 'MTG', 'OVIANTO'),
                ('JIMT24002', 'MTG', 'YOSES DWI MAHESWARA'), ('JIMT24006', 'MTG', 'M. TAUFIQ AZRA HAROMAIN'),
                ('JIMT25004', 'MTG', 'ARIS PURNOMO'), ('JIMM21009', 'MW',  'RAFI FAUZAN NUGROHO'),
                ('JI260374',  'MTG', 'BINTANG DHIYA ABIYYUSALAM'), ('JI260398',  'MTG', 'IRMA INNAYAH')
            ) AS t(nrp, company, name)
        ),
        base_data AS (
            SELECT c.tgl, e.nrp, e.company, e.name FROM calendar c CROSS JOIN employee_list e
        ),
        data_raw AS (
            SELECT nrp, CAST(attendance_date AS DATE) AS attendance_date, CAST(attendance_hour AS TIME) AS att_time, trans
            FROM [db_attendance].[attend].[tbl_t_att_daily_history]
            WHERE attendance_date BETWEEN CAST(@startDate AS DATE) AND CAST(@endDate AS DATE)
            UNION ALL
            SELECT nrp, CAST(attendance_date AS DATE) AS attendance_date, CAST(attendance_hour AS TIME) AS att_time, trans
            FROM [db_attendance].[attend].[tbl_t_att_daily]
            WHERE attendance_date BETWEEN CAST(@startDate AS DATE) AND CAST(@endDate AS DATE)
        ),
        attendance_calc AS (
            SELECT nrp, attendance_date, MIN(CASE WHEN trans = 'IN' THEN att_time END) AS raw_in, MAX(CASE WHEN trans = 'OUT' THEN att_time END) AS raw_out
            FROM data_raw GROUP BY nrp, attendance_date
        ),
        daily_status AS (
            SELECT
                b.nrp, b.name, b.company, b.tgl AS attendance_date,
                FORMAT(b.tgl, 'MMMM', 'id-ID') AS bulan, MONTH(b.tgl) AS month_num,
                a.raw_in, a.raw_out, d.keperluan AS dinas_keperluan,
                CASE WHEN h.tanggal IS NOT NULL THEN 1 WHEN DATEPART(WEEKDAY, b.tgl) IN (1, 7) THEN 1 ELSE 0 END AS is_holiday
            FROM base_data b
            LEFT JOIN attendance_calc a ON b.tgl = a.attendance_date AND b.nrp = a.nrp
            LEFT JOIN holiday_list h ON b.tgl = h.tanggal
            LEFT JOIN oc_dinas d ON b.tgl = d.dinas_tanggal AND b.nrp = d.nrp
        ),
        final_status AS (
            SELECT *,
                CASE
                    WHEN raw_in IS NULL AND raw_out IS NULL AND dinas_keperluan IS NOT NULL THEN 'DINAS'
                    WHEN raw_in IS NULL AND raw_out IS NULL AND is_holiday = 0 THEN 'TIDAK MASUK'
                    WHEN raw_in IS NULL AND raw_out IS NULL AND is_holiday = 1 THEN 'LIBUR'
                    WHEN raw_in IS NOT NULL AND raw_out IS NULL THEN 'LUPA TAP PULANG'
                    WHEN raw_in IS NULL AND raw_out IS NOT NULL THEN 'LUPA TAP MASUK'
                    WHEN raw_in > '07:30:00' THEN 'TERLAMBAT'
                    ELSE 'TEPAT WAKTU'
                END AS status_detail,
                CASE WHEN raw_in > '07:30:00' THEN 1 ELSE 0 END AS status_telat
            FROM daily_status
        ),
        aggregated_data AS (
            SELECT
                company, nrp, name AS [Nama Karyawan], bulan AS [Periode], month_num,
                COUNT(CASE WHEN raw_in IS NOT NULL OR status_detail = 'DINAS' THEN 1 END) AS [Total Kehadiran],
                SUM(CASE WHEN raw_in IS NOT NULL AND is_holiday = 1 THEN 1 ELSE 0 END) AS [Masuk (Weekend)],
                SUM(status_telat) AS [Total Terlambat],
                SUM(CASE WHEN status_detail = 'TIDAK MASUK' THEN 1 ELSE 0 END) AS [Total Tidak Masuk],
                SUM(CASE WHEN status_detail = 'LUPA TAP MASUK' THEN 1 ELSE 0 END) AS [Total Lupa Tap Masuk],
                SUM(CASE WHEN status_detail = 'LUPA TAP PULANG' THEN 1 ELSE 0 END) AS [Total Lupa Tap Pulang],
                SUM(CASE WHEN status_detail = 'DINAS' THEN 1 ELSE 0 END) AS [Total Hari Dinas],
                CAST(( SUM(status_telat) * 100.0 ) / NULLIF(COUNT(CASE WHEN raw_in IS NOT NULL OR status_detail = 'DINAS' THEN 1 END), 0) AS DECIMAL(10,2)) AS pct_terlambat_num,
                CAST(( SUM(CASE WHEN (raw_in IS NOT NULL OR status_detail = 'DINAS') AND status_telat = 0 THEN 1 ELSE 0 END) * 100.0 ) / NULLIF(COUNT(CASE WHEN raw_in IS NOT NULL OR status_detail = 'DINAS' THEN 1 END), 0) AS DECIMAL(10,2)) AS pct_tidak_terlambat_num
            FROM final_status GROUP BY company, nrp, name, bulan, month_num
        ),
        dinas_text_summary AS (
            SELECT nrp, month_num, STRING_AGG(keperluan, ', ') AS gabungan_keterangan FROM (
                SELECT DISTINCT nrp, MONTH(dinas_tanggal) AS month_num, keperluan FROM oc_dinas
            ) x GROUP BY nrp, month_num
        ),
        scored_data AS (
            SELECT
                a.company, a.nrp, a.[Nama Karyawan], a.[Periode], a.month_num,
                a.[Total Kehadiran], a.[Masuk (Weekend)], a.[Total Hari Dinas], a.[Total Terlambat],
                a.[Total Tidak Masuk], a.[Total Lupa Tap Masuk], a.[Total Lupa Tap Pulang],
                ISNULL(CONCAT(a.pct_terlambat_num, '%'), '0%') AS [Persentase Terlambat],
                ISNULL(CONCAT(a.pct_tidak_terlambat_num, '%'), '0%') AS [Persentase Tidak Terlambat],
                dt.gabungan_keterangan AS [Keterangan Dinas],
                CAST(
                    (a.[Total Kehadiran] * w.w_kehadiran) + (ISNULL(a.pct_tidak_terlambat_num, 0) * w.w_persen_hadir)
                    - (a.[Total Terlambat] * w.w_terlambat) - (a.[Total Tidak Masuk] * w.w_tidak_masuk) 
                    - (a.[Total Lupa Tap Masuk] * w.w_lupa_masuk) - (a.[Total Lupa Tap Pulang] * w.w_lupa_pulang)
                AS DECIMAL(10,2)) AS [Skor Akhir]
            FROM aggregated_data a CROSS JOIN weight_config w
            LEFT JOIN dinas_text_summary dt ON a.nrp = dt.nrp AND a.month_num = dt.month_num
        ),
        -- === CTE BARU: REAL-TIME BADGE FLAGS ===
        realtime_raw AS (
            SELECT nrp, CAST(attendance_date AS DATE) AS attendance_date, CAST(attendance_hour AS TIME) AS att_time, trans
            FROM [db_attendance].[attend].[tbl_t_att_daily] WHERE attendance_date IN (CAST(@todayDate AS DATE), CAST(@yesterdayDate AS DATE))
            UNION ALL
            SELECT nrp, CAST(attendance_date AS DATE) AS attendance_date, CAST(attendance_hour AS TIME) AS att_time, trans
            FROM [db_attendance].[attend].[tbl_t_att_daily_history] WHERE attendance_date IN (CAST(@todayDate AS DATE), CAST(@yesterdayDate AS DATE))
        ),
        realtime_base AS (
            SELECT 
                e.nrp,
                MIN(CASE WHEN r.attendance_date = CAST(@todayDate AS DATE) AND r.trans = 'IN' THEN r.att_time END) as today_in,
                MAX(CASE WHEN r.attendance_date = CAST(@todayDate AS DATE) AND r.trans = 'OUT' THEN r.att_time END) as today_out,
                MIN(CASE WHEN r.attendance_date = CAST(@yesterdayDate AS DATE) AND r.trans = 'IN' THEN r.att_time END) as yesterday_in,
                MAX(CASE WHEN r.attendance_date = CAST(@yesterdayDate AS DATE) AND r.trans = 'OUT' THEN r.att_time END) as yesterday_out,
                MAX(CASE WHEN d.dinas_tanggal = CAST(@todayDate AS DATE) THEN 1 ELSE 0 END) as is_dinas_today,
                MAX(CASE WHEN h.tanggal = CAST(@todayDate AS DATE) THEN 1 ELSE 0 END) as is_holiday_today
            FROM employee_list e
            LEFT JOIN realtime_raw r ON e.nrp = r.nrp
            LEFT JOIN oc_dinas d ON e.nrp = d.nrp AND d.dinas_tanggal = CAST(@todayDate AS DATE)
            LEFT JOIN holiday_list h ON h.tanggal = CAST(@todayDate AS DATE)
            GROUP BY e.nrp
        ),
        realtime_flags AS (
            SELECT 
                nrp,
                CAST(is_dinas_today AS BIT) AS isDinasToday,
                CAST(CASE WHEN today_in IS NOT NULL AND today_out IS NULL THEN 1 ELSE 0 END AS BIT) AS isActiveToday,
                CAST(CASE WHEN yesterday_in IS NOT NULL AND yesterday_out IS NULL THEN 1 ELSE 0 END AS BIT) AS isLupaTapOutYesterday,
                CAST(CASE WHEN is_dinas_today = 0 AND is_holiday_today = 0 AND DATEPART(WEEKDAY, CAST(@todayDate AS DATE)) NOT IN (1, 7) AND CAST(@currentTime AS TIME) > '07:30:00' AND today_in IS NULL THEN 1 ELSE 0 END AS BIT) AS isLupaTapInToday
            FROM realtime_base
        )
        -- === FINAL JOIN ===
        SELECT 
            RANK() OVER (ORDER BY SUM(a.[Skor Akhir]) DESC, SUM(a.[Total Kehadiran]) DESC) AS [Peringkat],
            a.company AS [Company], a.nrp AS [NRP], a.[Nama Karyawan], MAX(a.[Periode]) AS [Periode],
            SUM(a.[Total Kehadiran]) AS [Total Kehadiran], SUM(a.[Masuk (Weekend)]) AS [Masuk (Weekend)],
            SUM(a.[Total Hari Dinas]) AS [Total Hari Dinas], SUM(a.[Total Terlambat]) AS [Total Terlambat],
            SUM(a.[Total Tidak Masuk]) AS [Total Tidak Masuk], SUM(a.[Total Lupa Tap Masuk]) AS [Total Lupa Tap Masuk],
            SUM(a.[Total Lupa Tap Pulang]) AS [Total Lupa Tap Pulang], MAX(a.[Persentase Terlambat]) AS [Persentase Terlambat],
            MAX(a.[Persentase Tidak Terlambat]) AS [Persentase Tidak Terlambat], MAX(a.[Keterangan Dinas]) AS [Keterangan Dinas],
            SUM(a.[Skor Akhir]) AS [Skor Akhir],
            MAX(CAST(rf.isDinasToday AS INT)) AS isDinasToday, MAX(CAST(rf.isActiveToday AS INT)) AS isActiveToday,
            MAX(CAST(rf.isLupaTapOutYesterday AS INT)) AS isLupaTapOutYesterday, MAX(CAST(rf.isLupaTapInToday AS INT)) AS isLupaTapInToday
        FROM scored_data a
        LEFT JOIN realtime_flags rf ON a.nrp = rf.nrp
        GROUP BY a.company, a.nrp, a.[Nama Karyawan]
        ORDER BY [Peringkat] ASC
        OPTION (MAXRECURSION 0);
    `;

    const result = await request.query(query);

    return result.recordset.map(row => ({
        peringkat: Number(row.Peringkat),
        company: row.Company,
        nrp: row.NRP,
        namaKaryawan: row['Nama Karyawan'],
        periode: row.Periode,
        totalKehadiran: Number(row['Total Kehadiran'] || 0),
        totalMskWeekend: Number(row['Masuk (Weekend)'] || 0),
        totalHariDinas: Number(row['Total Hari Dinas'] || 0),
        totalTerlambat: Number(row['Total Terlambat'] || 0),
        totalTidakMasuk: Number(row['Total Tidak Masuk'] || 0),
        totalLupaTapMasuk: Number(row['Total Lupa Tap Masuk'] || 0),
        totalLupaTapPulang: Number(row['Total Lupa Tap Pulang'] || 0),
        persentaseTerlambat: row['Persentase Terlambat'],
        persentaseTidakTerlambat: row['Persentase Tidak Terlambat'],
        keteranganDinas: row['Keterangan Dinas'] || '-',
        skorAkhir: Number(row['Skor Akhir'] || 0),
        isDinasToday: Boolean(row.isDinasToday),
        isActiveToday: Boolean(row.isActiveToday),
        isLupaTapOutYesterday: Boolean(row.isLupaTapOutYesterday),
        isLupaTapInToday: Boolean(row.isLupaTapInToday)
    }));
}