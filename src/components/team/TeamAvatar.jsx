import React from 'react';

export function TeamAvatar({ member, small = false }) {
  return <div className={`avatar avatar-${member.tone} ${small ? 'team-avatar-small' : ''}`}>{member.initials}</div>;
}
