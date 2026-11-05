import React, { useState } from 'react';
import { Icon } from '../common/Icon';
import { PanelHeader } from '../common/PanelHeader';
import { icons } from '../../constants/icons';
import { attendanceByDay, jobAssignments, leaveByDay, teamMembers } from '../../data/teamData';

const totalJobs = teamMembers.reduce((total, member) => total + member.jobs, 0);
const averageJobsPerPerson = (totalJobs / teamMembers.length).toFixed(1);
const initialMonth = new Date(2024, 10, 1);

function getMonthData(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return {
    days: Array.from({ length: daysInMonth }, (_, index) => index + 1),
    calendarOffset: new Date(year, month, 1).getDay(),
    jobCalendarOffset: (new Date(year, month, 1).getDay() + 6) % 7,
    label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  };
}

function isSampleMonth(date) {
  return date.getFullYear() === 2024 && date.getMonth() === 10;
}

function Avatar({ member, small = false }) {
  return <div className={`avatar avatar-${member.tone} ${small ? 'team-avatar-small' : ''}`}>{member.initials}</div>;
}

function AttendanceCalendar({ monthDate, onMonthChange }) {
  const { days, calendarOffset, label } = getMonthData(monthDate);
  const [selectedDay, setSelectedDay] = useState(4);
  const selectedJobs = isSampleMonth(monthDate) ? jobAssignments.filter((job) => job.day === selectedDay) : [];

  return (
    <section className="panel attendance-panel">
      <PanelHeader
        title="Attendance overview and plotting job"
        subtitle={`Daily attendance for ${label}`}
        action={<div className="calendar-month"><button aria-label="Previous month" onClick={() => onMonthChange(-1)}>‹</button><strong>{label}</strong><button aria-label="Next month" onClick={() => onMonthChange(1)}>›</button></div>}
      />
      <div className="attendance-legend"><span><i className="attendance-dot present" />Present</span><span><i className="attendance-dot late" />Late</span><span><i className="attendance-dot absent" />Absent</span><span><i className="attendance-dot weekend" />Weekend</span></div>
      <div className="attendance-calendar-layout">
        <div className="attendance-calendar-main">
          <div className="month-calendar">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div className="calendar-weekday" key={day}>{day}</div>)}
            {Array.from({ length: calendarOffset }, (_, index) => <div className="calendar-empty" key={`empty-${index}`} />)}
            {days.map((day) => {
              const leaveNames = isSampleMonth(monthDate) ? leaveByDay[day] || [] : [];
              const leaveLabel = leaveNames.length ? `Cuti: ${leaveNames.join(', ')}` : 'Tidak ada yang cuti';
              const attendance = isSampleMonth(monthDate) ? attendanceByDay[day - 1] : undefined;
              const dayStatus = attendance || (new Date(monthDate.getFullYear(), monthDate.getMonth(), day).getDay() % 6 === 0 ? 'weekend' : 'present');
              const jobs = isSampleMonth(monthDate) ? jobAssignments.filter((job) => job.day === day) : [];
              return <button className={`calendar-day ${dayStatus} ${day === selectedDay ? 'selected' : ''}`} onClick={() => setSelectedDay(day)} data-tooltip={leaveLabel} aria-label={`${label}, ${day}. ${leaveLabel}. ${jobs.length} job`} key={day}><span>{day}</span>{dayStatus !== 'weekend' && <i />}{jobs.length > 0 && <div className="calendar-job-dots">{jobs.slice(0, 3).map((job) => <i className={`job-calendar-dot ${job.tone}`} key={job.member} />)}</div>}</button>;
            })}
          </div>
          <div className="attendance-summary"><div><strong>94.8%</strong><span>Overall attendance</span></div><div><strong>3</strong><span>Late arrivals</span></div><div><strong>1</strong><span>Absent day</span></div><div><strong>21</strong><span>Working days</span></div></div>
        </div>
        <aside className="job-day-detail job-side-detail">
          <div className="calendar-jobs-heading"><div><strong>Job plotting</strong><span>Select a date to view assignments</span></div></div>
          <span className="job-detail-label">SELECTED DAY</span>
          <strong>{label.split(' ')[0]} {selectedDay}</strong>
          {selectedJobs.length ? selectedJobs.map((job) => {
            const member = teamMembers.find((person) => person.initials === job.member);
            return <div className="job-detail-item" key={job.member}><span className={`job-detail-accent ${job.tone}`} /><div><b>{job.title}</b><small>{member?.name} · Planned</small></div></div>;
          }) : <p className="job-detail-empty">No jobs scheduled for this day.</p>}
        </aside>
      </div>
    </section>
  );
}

function TeamRoster() {
  return (
    <section className="panel roster-panel">
      <PanelHeader title="Team attendance" subtitle="Attendance by team member" action={<button className="text-button">View report <Icon name={icons.arrow} /></button>} />
      <div className="team-roster">{teamMembers.map((member) => <div className="team-member" key={member.name}><Avatar member={member} /><div className="team-member-info"><strong>{member.name}</strong><span>{member.role}</span></div><div className="team-member-stat"><strong>{member.attendance}</strong><span>Attendance</span></div><div className="team-member-stat"><strong>{member.jobs}</strong><span>Jobs</span></div></div>)}</div>
    </section>
  );
}

function VoiceMembers() {
  return (
    <section className="panel voice-panel">
      <PanelHeader title="Voice member" subtitle="Available for voice updates" action={<button className="text-button">Manage <Icon name={icons.arrow} /></button>} />
      <div className="voice-list">
        {teamMembers.slice(0, 4).map((member, index) => (
          <div className="voice-member" key={member.name}>
            <Avatar member={member} small />
            <div className="voice-member-info"><strong>{member.name}</strong><span>{index < 3 ? 'Available' : 'On a call'}</span></div>
            <i className={`voice-status ${index < 3 ? 'available' : 'busy'}`} />
            <button className="voice-call" aria-label={`Call ${member.name}`}>♩</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TeamPage() {
  const [monthDate, setMonthDate] = useState(initialMonth);
  const changeMonth = (amount) => setMonthDate((date) => new Date(date.getFullYear(), date.getMonth() + amount, 1));
  const monthLabel = getMonthData(monthDate).label.toUpperCase();

  return (
    <section className="content team-content">
      <div className="page-heading team-heading"><div><p className="eyebrow">TEAM OPERATIONS · {monthLabel}</p><h1>Team attendance &amp; job plotting <span>✦</span></h1><p className="heading-subtitle">Track attendance and plan every technician assignment in one monthly view.</p></div><button className="primary-button"><span>＋</span> Add team member</button></div>
      <div className="team-stat-grid"><article className="team-stat-card"><span className="team-stat-icon purple">◉</span><div><strong>94.8%</strong><span>Monthly attendance</span></div><b className="trend positive">↗ 2.4%</b></article><article className="team-stat-card"><span className="team-stat-icon orange">◷</span><div><strong>{totalJobs}</strong><span>Jobs plotted</span></div><b className="trend positive">↗ 8.6%</b></article><article className="team-stat-card"><span className="team-stat-icon green">✓</span><div><strong>{teamMembers.length} / {teamMembers.length}</strong><span>Team members active</span></div><b className="team-stat-label">On track</b></article><article className="team-stat-card"><span className="team-stat-icon blue">▣</span><div><strong>{averageJobsPerPerson}</strong><span>Avg. jobs per person</span></div><b className="team-stat-label">This month</b></article></div>
      <div className="team-main-grid">
        <AttendanceCalendar monthDate={monthDate} onMonthChange={changeMonth} />
        <div className="team-secondary-grid"><TeamRoster /><VoiceMembers /></div>
      </div>
    </section>
  );
}
