import React from "react";
import { Icon } from "../common/Icon";
import { PanelHeader } from "../common/PanelHeader";
import { icons } from "../../constants/icons";
import { TeamAvatar } from "./TeamAvatar";

const avatarTones = ["violet", "orange", "green", "blue"];

export function TeamRoster({ members, isLoading }) {
  return (
    <section className="panel roster-panel">
      <PanelHeader
        title="Team attendance"
        subtitle="Attendance exceptions and jobs for the selected month"
        action={
          <button className="text-button">
            View report <Icon name={icons.arrow} />
          </button>
        }
      />
      {isLoading ? (
        <p role="status">Memuat anggota tim...</p>
      ) : members.length ? (
        <div className="team-roster">
          {members.map((member, index) => (
            <div className="team-member" key={member.id}>
              <TeamAvatar
                member={{
                  ...member,
                  tone: avatarTones[index % avatarTones.length],
                }}
              />
              <div className="team-member-info">
                <strong>{member.name}</strong>
                <span>Team member</span>
              </div>
              <div className="team-member-stat">
                <strong>{member.attendance}</strong>
                <span>Exceptions</span>
              </div>
              <div className="team-member-stat">
                <strong>{member.jobs}</strong>
                <span>Jobs</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Belum ada data anggota tim.</p>
      )}
    </section>
  );
}
