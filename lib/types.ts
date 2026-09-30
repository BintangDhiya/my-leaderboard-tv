export interface RawTask {
    login: string;
    nrp: string;
    nama: string;
    project_id: number;
    project_name: string;
    tracker_id: number;
    tracker_name: string;
    isu_id: string;
    isu_subject: string;
    description?: string;
    start_date: string;
    due_date?: string;
    plan_date?: number;
    created_on: string;
    closed_on?: string;
    updated_on?: string;
    actual_date?: number;
    status_id: number;
    status_desc: string;
    priority_id: number;
    priority_name: 'High' | 'Normal' | 'Low' | string;
    done_ratio: number;
}

export interface RawAttendance {
    nrp: string;
    attendance_date: string;
    att_time: string; // format HH:mm:ss
    trans: 'IN' | 'OUT';
}

// Interface untuk hasil query agregasi absensi dari Metabase CTE
export interface AttendanceSummary {
    peringkat: number;
    company: string;
    nrp: string;
    namaKaryawan: string;
    periode: string;
    totalKehadiran: number;
    totalHariDinas: number;
    totalTerlambat: number;
    totalTidakMasuk: number;
    totalLupaTapMasuk: number;
    totalLupaTapPulang: number;
    persentaseTerlambat: string;
    persentaseTidakTerlambat: string;
    keteranganDinas: string;
    skorAkhir: number;
}

export interface DeveloperStats {
    nrp: string;
    name: string;
    totalTasks: number;
    closedTasks: number;
    lebihCepatTasks: number; // Task selesai lebih cepat (Early)
    doneTasks: number;        // Task selesai tepat waktu (Done)
    onTimeTasks: number;      // Total On-Time (Early + Done)
    lateTasks: number;        // Task terlambat (Late)
    onTimeRate: number;       // Persentase 0 - 100

    // Data Attendance
    totalHadir: number;
    totalDinas: number;
    totalTelat: number;
    totalTidakMasuk: number;
    totalLupaTap: number;
    persentaseTerlambat?: string;
    persentaseTidakTerlambat?: string;
    keteranganDinas?: string;

    // Skor
    taskScore: number;
    attendanceScore: number;
    score: number; // Final Score

    currentRank: number;
    previousRank: number;
    rankDelta: number; // Positif (naik / hijau), Negatif (turun / merah), 0 (tetap)
    gapToAbove: number; // Selisih poin ke peringkat di atasnya (jika rank > 1)
    gapToRank3?: number; // Selisih poin ke peringkat 3 (backward compatibility)
    // Status breakdown
    newTasks: number;        // status_id = 1 (New / Not Started)
    inProgressTasks: number; // status_id = 2 (In Progress)
    feedbackTasks: number;   // status_id = 4 (Feedback)
}

export interface LeaderboardResponse {
    leaderboard: DeveloperStats[];
    podium: DeveloperStats[]; // Top 3
    risingStar: DeveloperStats | null; // Developer dengan lonjakan peringkat terbesar (rankDelta tertinggi)
    teamSummary: {
        totalClosedTasks: number;
        averageOnTimeRate: number;
        activeDevelopers: number;
    };
    latestActivity: {
        developer: string;
        taskTitle: string;
        closedAt: string;
        isOnTime: boolean;
    }[];
}