import { describe, expect, it } from "vitest";
import { getMonthData } from "./AttendanceCalendar";
import {
  findAttendanceRecord,
  getAttendanceForDate,
  getAttendanceExceptions,
  getAttendanceStatusLabel,
  getAttendanceStatuses,
} from "./attendanceUtils";

describe("getMonthData", () => {
  it("returns the correct number of days and weekday offset", () => {
    const month = getMonthData(new Date(2024, 1, 1));

    expect(month.days).toHaveLength(29);
    expect(month.calendarOffset).toBe(4);
    expect(month.label).toBe("February 2024");
  });

  it("returns 30 days for a month with 30 days", () => {
    expect(getMonthData(new Date(2025, 3, 1)).days).toHaveLength(30);
  });
});

describe("attendanceUtils", () => {
  it("omits normal attendance and keeps exception records", () => {
    const records = [
      { status: "present" },
      { status: "late" },
      { status: "leave" },
      { status: "early_departure" },
    ];

    expect(getAttendanceExceptions(records)).toEqual(records.slice(1));
    expect(getAttendanceExceptions([{ status: "present" }])).toEqual([]);
    expect(getAttendanceStatuses([{ status: "present" }])).toEqual([]);
  });

  it("returns unique exception statuses and maps legacy absence to leave", () => {
    expect(
      getAttendanceStatuses([
        { status: "present" },
        { status: "late" },
        { status: "leave" },
        { status: "absent" },
        { status: "early_departure" },
      ]),
    ).toEqual(["late", "leave", "early_departure"]);
    expect(getAttendanceStatusLabel("absent")).toBe("Leave");
  });

  it("returns only exception attendance for the selected date", () => {
    const records = [
      { date: "2026-11-13", status: "present" },
      { date: "2026-11-13", status: "late" },
      { date: "2026-11-14", status: "leave" },
    ];

    expect(getAttendanceForDate(records, "2026-11-13")).toEqual([
      records[1],
    ]);
  });

  it("finds existing attendance by the backend unique key", () => {
    const records = [
      {
        id: "1",
        member: { id: 12 },
        date: "2026-11-13T00:00:00.000Z",
        shift: "morning",
        status: "present",
      },
    ];

    expect(
      findAttendanceRecord(records, {
        memberId: "12",
        date: "2026-11-13",
        shift: "morning",
      }),
    ).toBe(records[0]);
    expect(
      findAttendanceRecord(records, {
        memberId: 12,
        date: "2026-11-13",
        shift: "afternoon",
      }),
    ).toBeUndefined();
  });
});
