import React from 'react';
import { Icon } from '../common/Icon';
import { PanelHeader } from '../common/PanelHeader';
import { icons } from '../../constants/icons';
import { teamMembers } from '../../data/team/teamData';
import { TeamAvatar } from './TeamAvatar';

export function TeamRoster() {
  return (
    <section className="panel roster-panel">
      <PanelHeader title="Team attendance" subtitle="Attendance by team member" action={<button className="text-button">View report <Icon name={icons.arrow} /></button>} />
      <div className="team-roster">{teamMembers.map((member) => <div className="team-member" key={member.name}><TeamAvatar member={member} /><div className="team-member-info"><strong>{member.name}</strong><span>{member.role}</span></div><div className="team-member-stat"><strong>{member.attendance}</strong><span>Attendance</span></div><div className="team-member-stat"><strong>{member.jobs}</strong><span>Jobs</span></div></div>)}</div>
    </section>
  );
}
