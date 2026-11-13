import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  useGetAttendanceQuery,
  useGetJobsQuery,
} from "../../services/teamApi";
import { AttendanceCalendar, getMonthData } from "./AttendanceCalendar";
import { EditJobAttendanceSidebar } from "./EditJobAttendanceSidebar";
import { TeamRoster } from "./TeamRoster";
import { VoiceMembers } from "./VoiceMembers";
import { getAttendanceExceptions } from "./attendanceUtils";

const now = new Date();
const initialMonth = new Date(now.getFullYear(), now.getMonth(), 1);

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMonthRange(date) {
  return {
    from: formatDate(new Date(date.getFullYear(), date.getMonth(), 1)),
    to: formatDate(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
  };
}

function getErrorMessage(error) {
  if (!error) return "";
  const data = error.data;
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const message = typeof data.error === "string" ? data.error : "";
    const details = Array.isArray(data.details)
      ? data.details
          .map((item) =>
            item && typeof item === "object"
              ? [item.path, item.message].filter(Boolean).join(": ")
              : "",
          )
          .filter(Boolean)
          .join("; ")
      : "";
    if (message || details) return [message, details].filter(Boolean).join(" — ");
  }
  return error.error || `HTTP ${error.status || "network error"}`;
}

function TeamStats({
  attendance,
  jobs,
  members,
  attendanceError,
  jobsError,
  membersError,
}) {
  const averageJobs = jobsError || membersError
    ? "—"
    : members.length
    ? (jobs.length / members.length).toFixed(1)
    : "—";

  return (
    <div className="team-stat-grid">
      <article className="team-stat-card">
        <span className="team-stat-icon purple">◉</span>
        <div>
          <strong>{attendanceError ? "—" : attendance.length}</strong>
          <span>Attendance exceptions this month</span>
        </div>
      </article>
      <article className="team-stat-card">
        <span className="team-stat-icon orange">◷</span>
        <div>
          <strong>{jobsError ? "—" : jobs.length}</strong>
          <span>Jobs plotted this month</span>
        </div>
      </article>
      <article className="team-stat-card">
        <span className="team-stat-icon green">✓</span>
        <div>
          <strong>{membersError ? "—" : members.length}</strong>
          <span>Team members</span>
        </div>
      </article>
      <article className="team-stat-card">
        <span className="team-stat-icon blue">▣</span>
        <div>
          <strong>{averageJobs}</strong>
          <span>Avg. jobs per member</span>
        </div>
      </article>
    </div>
  );
}

function ApiError({ title, error, onRetry }) {
  if (!error) return null;
  return (
    <p className="sidebar-error" role="alert">
      {title}: {getErrorMessage(error)}{" "}
      <button type="button" className="text-button" onClick={onRetry}>
        Coba lagi
      </button>
    </p>
  );
}

export function TeamPage({
  members = [],
  membersLoading = false,
  membersError,
  onRetryMembers,
  onEditSidebarOpen,
  canManageOperations = true,
}) {
  const [monthDate, setMonthDate] = useState(initialMonth);
  const [editSidebarOpen, setEditSidebarOpen] = useState(false);
  const [editDate, setEditDate] = useState(formatDate(initialMonth));
  const range = getMonthRange(monthDate);
  const {
    data: attendance = [],
    isLoading: attendanceLoading,
    error: attendanceError,
    refetch: refetchAttendance,
  } = useGetAttendanceQuery(range);
  const {
    data: jobs = [],
    isLoading: jobsLoading,
    error: jobsError,
    refetch: refetchJobs,
  } = useGetJobsQuery(range);
  const attendanceExceptions = getAttendanceExceptions(attendance);
  const monthLabel = getMonthData(monthDate).label.toUpperCase();
  const memberStats = members.map((member) => {
    const memberAttendance = attendanceExceptions.filter(
      (record) => record.member.id === member.id,
    );
    const assignedJobs = jobs.filter((job) =>
      job.assignees.some((assignee) => assignee.id === member.id),
    ).length;

    return {
      ...member,
      attendance: memberAttendance.length,
      jobs: assignedJobs,
    };
  });

  const changeMonth = (amount) => {
    setMonthDate((currentDate) =>
      new Date(currentDate.getFullYear(), currentDate.getMonth() + amount, 1),
    );
  };

  const openEditSidebar = (date) => {
    setEditDate(formatDate(date));
    setEditSidebarOpen(true);
    onEditSidebarOpen?.();
  };

  return (
    <section className="content team-content">
      <div className="page-heading team-heading">
        <div>
          <p className="eyebrow">TEAM OPERATIONS · {monthLabel}</p>
          <h1>
            Team attendance &amp; job plotting <span>✦</span>
          </h1>
          <p className="heading-subtitle">
            Record Leave, Late, or Early departure; normal attendance needs no
            entry.
          </p>
        </div>
        <Link
          className="primary-button"
          to="/attendance-requests"
        >
          <span>＋</span>{" "}
          {canManageOperations ? "Pengajuan absensi" : "Ajukan absensi"}
        </Link>
      </div>

      <ApiError
        title="Gagal memuat anggota tim"
        error={membersError}
        onRetry={onRetryMembers}
      />
      <ApiError
        title="Gagal memuat absensi"
        error={attendanceError}
        onRetry={refetchAttendance}
      />
      <ApiError
        title="Gagal memuat job"
        error={jobsError}
        onRetry={refetchJobs}
      />

      <TeamStats
        attendance={attendanceExceptions}
        jobs={jobs}
        members={members}
        attendanceError={attendanceError}
        jobsError={jobsError}
        membersError={membersError}
      />

      <div className="team-main-grid">
        <AttendanceCalendar
          monthDate={monthDate}
          onMonthChange={changeMonth}
          onEditSidebarOpen={openEditSidebar}
          attendance={attendanceExceptions}
          jobs={jobs}
          isLoading={attendanceLoading || jobsLoading}
          hasError={Boolean(attendanceError || jobsError)}
        />
        <div className="team-secondary-grid">
          <TeamRoster members={memberStats} isLoading={membersLoading} />
          <VoiceMembers />
        </div>
      </div>

      <EditJobAttendanceSidebar
        isOpen={editSidebarOpen}
        onClose={() => setEditSidebarOpen(false)}
        members={members}
        attendance={attendance}
        jobs={jobs}
        initialDate={editDate}
        canManageOperations={canManageOperations}
      />
    </section>
  );
}
