import React from 'react';
import { Icon } from '../common/Icon';
import { PanelHeader } from '../common/PanelHeader';
import { icons } from '../../constants/icons';
import { activity } from '../../data/dashboardData';

export function ActivityPanel() {
  return (
    <section className="panel activity-panel">
      <PanelHeader title="Recent activity" subtitle="Latest updates from your team" action={<button className="more-button">•••</button>} />
      <div className="activity-list">{activity.map((item) => <div className="activity-row" key={item.title}><div className={`activity-icon ${item.tone}`}>{item.icon}</div><div><strong>{item.title}</strong><span>{item.detail}</span><small>{item.time}</small></div></div>)}</div>
      <button className="activity-footer">View activity log <Icon name={icons.arrow} /></button>
    </section>
  );
}
