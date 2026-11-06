export const teamMembers = [
  { initials: 'PJ', name: 'Pajar', role: 'Maintenance lead', tone: 'violet', attendance: '98%', jobs: 12 },
  { initials: 'WH', name: 'Wahyu', role: 'Electrical technician', tone: 'orange', attendance: '96%', jobs: 10 },
  { initials: 'AT', name: 'Artadi', role: 'Mechanical technician', tone: 'green', attendance: '94%', jobs: 9 },
  { initials: 'AW', name: 'Awan', role: 'Safety specialist', tone: 'blue', attendance: '91%', jobs: 8 },
  { initials: 'HR', name: 'Heru', role: 'Maintenance technician', tone: 'violet', attendance: '95%', jobs: 8 },
  { initials: 'TT', name: 'Tata', role: 'Electrical technician', tone: 'orange', attendance: '93%', jobs: 7 },
  { initials: 'RW', name: 'Ridwan', role: 'Mechanical technician', tone: 'green', attendance: '92%', jobs: 6 },
];

export const voiceMembers = [
  { date: '04 Nov 2024', member: 'Pajar', problem: 'CNC pressure check sering terlambat', danger: 'Tekanan tidak terpantau dan mesin berisiko rusak', ideal: 'Pengecekan selesai sesuai jadwal', eva: 'Close' },
  { date: '06 Nov 2024', member: 'Wahyu', problem: 'Panel inspection perlu checklist', danger: 'Komponen bermasalah bisa terlewat', ideal: 'Checklist tersedia dan terisi lengkap', eva: 'Close' },
  { date: '08 Nov 2024', member: 'Artadi', problem: 'Conveyor inspection butuh alat tambahan', danger: 'Kerusakan conveyor terlambat diketahui', ideal: 'Alat inspeksi siap sebelum pekerjaan', eva: 'Open' },
  { date: '10 Nov 2024', member: 'Awan', problem: 'Safety calibration menunggu approval', danger: 'Peralatan tidak memenuhi standar keselamatan', ideal: 'Approval selesai sebelum jadwal kalibrasi', eva: 'Open' },
];

export const jobAssignments = [
  { day: 4, member: 'PJ', title: 'CNC pressure check', tone: 'purple' },
  { day: 6, member: 'WH', title: 'Panel inspection', tone: 'orange' },
  { day: 8, member: 'AT', title: 'Conveyor inspection', tone: 'green' },
  { day: 10, member: 'AW', title: 'Safety calibration', tone: 'blue' },
  { day: 12, member: 'HR', title: 'Hydraulic service', tone: 'purple' },
  { day: 15, member: 'TT', title: 'Motor diagnostics', tone: 'orange' },
  { day: 18, member: 'RW', title: 'Belt replacement', tone: 'green' },
  { day: 22, member: 'PJ', title: 'Monthly equipment audit', tone: 'purple' },
  { day: 25, member: 'AW', title: 'Guard inspection', tone: 'blue' },
];

export const attendanceByDay = [
  'present', 'weekend', 'weekend', 'present', 'present', 'present', 'present',
  'present', 'weekend', 'weekend', 'late', 'present', 'present', 'present',
  'present', 'weekend', 'weekend', 'absent', 'present', 'present', 'present',
  'present', 'weekend', 'weekend', 'present', 'present', 'present', 'present',
  'present', 'weekend',
];

export const leaveByDay = {
  11: ['Tata'],
  18: ['Heru', 'Ridwan'],
  25: ['Wahyu'],
};
