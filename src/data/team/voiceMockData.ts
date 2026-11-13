export interface VoiceMember {
  date: string;
  member: string;
  problem: string;
  danger: string;
  ideal: string;
  eva: "Close" | "Open";
}

export const voiceMembers: VoiceMember[] = [
  { date: "04 Nov 2024", member: "Pajar", problem: "CNC pressure check sering terlambat", danger: "Tekanan tidak terpantau dan mesin berisiko rusak", ideal: "Pengecekan selesai sesuai jadwal", eva: "Close" },
  { date: "06 Nov 2024", member: "Wahyu", problem: "Panel inspection perlu checklist", danger: "Komponen bermasalah bisa terlewat", ideal: "Checklist tersedia dan terisi lengkap", eva: "Close" },
  { date: "08 Nov 2024", member: "Artadi", problem: "Conveyor inspection butuh alat tambahan", danger: "Kerusakan conveyor terlambat diketahui", ideal: "Alat inspeksi siap sebelum pekerjaan", eva: "Open" },
  { date: "10 Nov 2024", member: "Awan", problem: "Safety calibration menunggu approval", danger: "Peralatan tidak memenuhi standar keselamatan", ideal: "Approval selesai sebelum jadwal kalibrasi", eva: "Open" },
];
