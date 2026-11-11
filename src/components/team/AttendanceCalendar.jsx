import React, { useState } from "react";
import { PanelHeader } from "../common/PanelHeader";
import { attendanceByDay, jobAssignments, leaveByDay, teamMembers } from "../../data/team/teamData";

function isSampleMonth(date) {
  return date.getFullYear() === 2024 && date.getMonth() === 10;
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

export function AttendanceCalendar({ monthDate, onMonthChange, editSidebarOpen, onEditSidebarOpen, onEditSidebarClose }) {
  const { days, calendarOffset, label } = getMonthData(monthDate);
  const [selectedDay, setSelectedDay] = useState(4);
  const selectedJobs = isSampleMonth(monthDate) ? jobAssignments.filter((job) => job.day === selectedDay) : [];

  return (
    <section className="panel attendance-panel">
      <PanelHeader
        title="Attendance overview and plotting job"
        subtitle={`Daily attendance for ${label}`}
        action={
          <div className="calendar-header-actions">
            <div className="calendar-month">
              <button aria-label="Previous month" onClick={() => onMonthChange(-1)}>
                ‹
              </button>
              <strong>{label}</strong>
              <button aria-label="Next month" onClick={() => onMonthChange(1)}>
                ›
              </button>
            </div>
            <button className="edit-button" onClick={() => onEditSidebarOpen(new Date(monthDate.getFullYear(), monthDate.getMonth(), selectedDay))}>
              <span>✎</span> Edit
            </button>
          </div>
        }
      />
      <div className="attendance-legend">
        <span>
          <i className="attendance-dot present" />
          Present
        </span>
        <span>
          <i className="attendance-dot late" />
          Late
        </span>
        <span>
          <i className="attendance-dot absent" />
          Absent
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
              const leaveNames = isSampleMonth(monthDate) ? leaveByDay[day] || [] : [];
              const leaveLabel = leaveNames.length ? `Cuti: ${leaveNames.join(", ")}` : "Tidak ada yang cuti";
              const attendance = isSampleMonth(monthDate) ? attendanceByDay[day - 1] : undefined;
              const dayStatus = attendance || (new Date(monthDate.getFullYear(), monthDate.getMonth(), day).getDay() % 6 === 0 ? "weekend" : "present");
              const jobs = isSampleMonth(monthDate) ? jobAssignments.filter((job) => job.day === day) : [];
              return (
                <button
                  className={`calendar-day ${dayStatus} ${day === selectedDay ? "selected" : ""}`}
                  onClick={() => setSelectedDay(day)}
                  data-tooltip={leaveLabel}
                  aria-label={`${label}, ${day}. ${leaveLabel}. ${jobs.length} job`}
                  key={day}
                >
                  <span>{day}</span>
                  {dayStatus !== "weekend" && <i />}
                  {jobs.length > 0 && (
                    <div className="calendar-job-dots">
                      {jobs.slice(0, 3).map((job) => (
                        <i className={`job-calendar-dot ${job.tone}`} key={job.member} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="attendance-summary">
            <div>
              <strong>94.8%</strong>
              <span>Overall attendance</span>
            </div>
            <div>
              <strong>3</strong>
              <span>Late arrivals</span>
            </div>
            <div>
              <strong>1</strong>
              <span>Absent day</span>
            </div>
            <div>
              <strong>21</strong>
              <span>Working days</span>
            </div>
          </div>
        </div>
        <aside className="job-day-detail job-side-detail">
          <div className="calendar-jobs-heading">
            <div>
              <strong>Job plotting</strong>
              <span>Select a date to view assignments</span>
            </div>
          </div>
          <span className="job-detail-label">SELECTED DAY</span>
          <strong>
            {label.split(" ")[0]} {selectedDay}
          </strong>
          {selectedJobs.length ? (
            selectedJobs.map((job) => {
              const member = teamMembers.find((person) => person.initials === job.member);
              return (
                <div className="job-detail-item" key={job.member}>
                  <span className={`job-detail-accent ${job.tone}`} />
                  <div>
                    <b>{job.title}</b>
                    <small>{member?.name} · Planned</small>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="job-detail-empty">No jobs scheduled for this day.</p>
          )}
        </aside>
      </div>
    </section>
  );
}
