const attendanceStatusOrder = ["late", "leave", "early_departure"];

export function getAttendanceExceptions(records) {
  return records.filter((record) => record.status !== "present");
}

export function getAttendanceForDate(records, date) {
  return getAttendanceExceptions(
    records.filter((record) => record.date.slice(0, 10) === date),
  );
}

export function normalizeAttendanceStatus(status) {
  return status === "absent" ? "leave" : status;
}

export function getAttendanceStatusLabel(status) {
  const normalizedStatus = normalizeAttendanceStatus(status);
  const labels = {
    late: "Late",
    leave: "Leave",
    early_departure: "Early departure",
  };
  return labels[normalizedStatus] || normalizedStatus;
}

export function getAttendanceStatuses(records) {
  const statuses = new Set(
    records.map((record) => normalizeAttendanceStatus(record.status)),
  );
  return attendanceStatusOrder.filter((status) => statuses.has(status));
}
