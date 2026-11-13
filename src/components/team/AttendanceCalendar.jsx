import React, { useEffect, useState } from "react";
import { PanelHeader } from "../common/PanelHeader";
import {
  getAttendanceForDate,
  getAttendanceStatusLabel,
  getAttendanceStatuses,
} from "./attendanceUtils";

const jobTones = ["purple", "orange", "green", "blue"];

function formatSelectedDate(date, day) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-${String(day).padStart(2, "0")}`;
}

export function getMonthData(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return {
    days: Array.from({ length: daysInMonth }, (_, index) => index + 1),
    calendarOffset: new Date(year, month, 1).getDay(),
    label: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
  };
}

export function AttendanceCalendar({
  monthDate,
  onMonthChange,
  onEditSidebarOpen,
  attendance,
  jobs,
  isLoading,
  hasError,
}) {
  const { days, calendarOffset, label } = getMonthData(monthDate);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const selectedDate = formatSelectedDate(monthDate, selectedDay);
  const selectedAttendance = getAttendanceForDate(attendance, selectedDate);
  const selectedJobs = jobs.filter((job) => job.date.slice(0, 10) === selectedDate);

  useEffect(() => {
    if (selectedDay > days.length) setSelectedDay(1);
  }, [days.length, selectedDay]);

  return (
    <section className="panel attendance-panel">
      <PanelHeader
        title="Attendance overview and plotting job"
        subtitle={`Record only Leave, Late, and Early departure for ${label}`}
        action={
          <div className="calendar-header-actions">
            <div className="calendar-month">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => onMonthChange(-1)}
              >
                ‹
              </button>
              <strong>{label}</strong>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => onMonthChange(1)}
              >
                ›
              </button>
            </div>
            <button
              type="button"
              className="edit-button"
              onClick={() =>
                onEditSidebarOpen(
                  new Date(
                    monthDate.getFullYear(),
                    monthDate.getMonth(),
                    selectedDay,
                  ),
                )
              }
            >
              <span>✎</span> Edit
            </button>
          </div>
        }
      />
      <div className="attendance-legend">
        <span>
          <i className="attendance-dot late" />
          Late
        </span>
        <span>
          <i className="attendance-dot leave" />
          Leave
        </span>
        <span>
          <i className="attendance-dot early-departure" />
          Early departure
        </span>
        <span>
          <i className="attendance-dot weekend" />
          Weekend
        </span>
      </div>
      <div className="attendance-calendar-layout">
        <div className="attendance-calendar-main">
          <div className="month-calendar">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div className="calendar-weekday" key={day}>
                {day}
              </div>
            ))}
            {Array.from({ length: calendarOffset }, (_, index) => (
              <div className="calendar-empty" key={`empty-${index}`} />
            ))}
            {days.map((day) => {
              const date = formatSelectedDate(monthDate, day);
              const dailyAttendance = attendance.filter(
                (record) => record.date.slice(0, 10) === date,
              );
              const dailyJobs = jobs.filter(
                (job) => job.date.slice(0, 10) === date,
              );
              const dailyStatuses = getAttendanceStatuses(dailyAttendance);
              const isWeekend =
                new Date(
                  monthDate.getFullYear(),
                  monthDate.getMonth(),
                  day,
                ).getDay() % 6 === 0;
              const statusCounts = dailyAttendance.reduce(
                (counts, record) => {
                  const status = getAttendanceStatusLabel(record.status);
                  counts[status] = (counts[status] || 0) + 1;
                  return counts;
                },
                {},
              );
              const tooltip = dailyAttendance.length
                ? Object.entries(statusCounts)
                    .map(([status, count]) => `${status}: ${count}`)
                    .join(", ")
                : "No attendance exceptions";

              return (
                <button
                  type="button"
                  className={`calendar-day ${!dailyStatuses.length && isWeekend ? "weekend" : ""} ${day === selectedDay ? "selected" : ""}`}
                  onClick={() => setSelectedDay(day)}
                  data-tooltip={tooltip}
                  aria-label={`${label}, ${day}. ${tooltip}. ${dailyJobs.length} job`}
                  key={day}
                >
                  <span>{day}</span>
                  {dailyStatuses.length > 0 && (
                    <span className="calendar-attendance-dots" aria-hidden="true">
                      {dailyStatuses.map((status) => (
                        <i
                          className={`calendar-attendance-dot ${status.replace("_", "-")}`}
                          key={status}
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="attendance-summary">
            <div>
              <strong>
                {hasError
                  ? "—"
                  : attendance.filter((record) => record.status === "late").length}
              </strong>
              <span>Late records</span>
            </div>
            <div>
              <strong>
                {hasError
                  ? "—"
                  : attendance.filter(
                      (record) =>
                        record.status === "leave" || record.status === "absent",
                    ).length}
              </strong>
              <span>Leave records</span>
            </div>
            <div>
              <strong>
                {hasError
                  ? "—"
                  : attendance.filter(
                      (record) => record.status === "early_departure",
                    ).length}
              </strong>
              <span>Early departures</span>
            </div>
            <div>
              <strong>{hasError ? "—" : attendance.length}</strong>
              <span>Total exceptions</span>
            </div>
          </div>
        </div>
        <aside className="job-day-detail job-side-detail">
          <div className="calendar-jobs-heading">
            <div>
              <strong>Selected day details</strong>
              <span>Attendance exceptions and job assignments</span>
            </div>
          </div>
          <span className="job-detail-label">SELECTED DAY</span>
          <strong>
            {label.split(" ")[0]} {selectedDay}
          </strong>
          {isLoading ? (
            <p className="job-detail-empty" role="status">
              Memuat absensi dan job...
            </p>
          ) : (
            <>
              <section className="selected-day-section">
                <h3>Attendance exceptions</h3>
                {selectedAttendance.length ? (
                  selectedAttendance.map((record) => (
                    <div className="selected-attendance-item" key={record.id}>
                      <div>
                        <b>{record.member.name}</b>
                        <small>{record.shift}</small>
                      </div>
                      <span
                        className={`attendance-status-badge ${record.status === "absent" ? "leave" : record.status.replace("_", "-")}`}
                      >
                        {getAttendanceStatusLabel(record.status)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="job-detail-empty">
                    {hasError
                      ? "Data absensi tidak dapat dimuat."
                      : "No attendance exceptions for this date."}
                  </p>
                )}
              </section>
              <section className="selected-day-section">
                <h3>Job plotting</h3>
                {selectedJobs.length ? (
                  selectedJobs.map((job) => (
                    <div className="job-detail-item" key={job.id}>
                      <span
                        className={`job-detail-accent ${jobTones[job.id.length % jobTones.length]}`}
                      />
                      <div>
                        <b>{job.title}</b>
                        <small>
                          {job.assignees.map((member) => member.name).join(", ") ||
                            "Belum ada penanggung jawab"}{" "}
                          · {job.priority}
                        </small>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="job-detail-empty">
                    {hasError
                      ? "Data job tidak dapat dimuat."
                      : "Tidak ada job untuk tanggal ini."}
                  </p>
                )}
              </section>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
