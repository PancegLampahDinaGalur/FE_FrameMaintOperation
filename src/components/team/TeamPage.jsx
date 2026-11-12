import React, { useState } from "react";
import { teamMembers } from "../../data/team/teamData";
import { AttendanceCalendar, getMonthData } from "./AttendanceCalendar";
import { TeamRoster } from "./TeamRoster";
import { VoiceMembers } from "./VoiceMembers";

const totalJobs = teamMembers.reduce((total, member) => total + member.jobs, 0);
const averageJobsPerPerson = (totalJobs / teamMembers.length).toFixed(1);
const initialMonth = new Date(2024, 10, 1);

function TeamStats() {
  return (
    <div className="team-stat-grid">
      <article className="team-stat-card">
        <span className="team-stat-icon purple">◉</span>
        <div>
          <strong>94.8%</strong>
          <span>Monthly attendance</span>
        </div>
        <b className="trend positive">↗ 2.4%</b>
      </article>

      <article className="team-stat-card">
        <span className="team-stat-icon orange">◷</span>
        <div>
          <strong>{totalJobs}</strong>
          <span>Jobs plotted</span>
        </div>
        <b className="trend positive">↗ 8.6%</b>
      </article>

      <article className="team-stat-card">
        <span className="team-stat-icon green">✓</span>
        <div>
          <strong>
            {teamMembers.length} / {teamMembers.length}
          </strong>
          <span>Team members active</span>
        </div>
        <b className="team-stat-label">On track</b>
      </article>

      <article className="team-stat-card">
        <span className="team-stat-icon blue">▣</span>
        <div>
          <strong>{averageJobsPerPerson}</strong>
          <span>Avg. jobs per person</span>
        </div>
        <b className="team-stat-label">This month</b>
      </article>
    </div>
  );
}

export function TeamPage({
  editSidebarOpen,
  onEditSidebarOpen,
  onEditSidebarClose,
}) {
  const [monthDate, setMonthDate] = useState(initialMonth);
  const monthLabel = getMonthData(monthDate).label.toUpperCase();

  const changeMonth = (amount) => {
    setMonthDate((currentDate) =>
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + amount,
        1,
      ),
    );
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
            Track attendance and plan every technician assignment in one monthly
            view.
          </p>
        </div>
        <button className="primary-button">
          <span>＋</span> Add team member
        </button>
      </div>

      <TeamStats />

      <div className="team-main-grid">
        <AttendanceCalendar
          monthDate={monthDate}
          onMonthChange={changeMonth}
          editSidebarOpen={editSidebarOpen}
          onEditSidebarOpen={onEditSidebarOpen}
          onEditSidebarClose={onEditSidebarClose}
        />
        <div className="team-secondary-grid">
          <TeamRoster />
          <VoiceMembers />
        </div>
      </div>
    </section>
  );
}
