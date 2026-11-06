import React from 'react';
import { Icon } from '../common/Icon';
import { PanelHeader } from '../common/PanelHeader';
import { icons } from '../../constants/icons';
import { activity } from '../../data/overview/overviewData';

export function ActivityPanel() {
  return (
    <section className="panel activity-panel">
      <PanelHeader title="Problem reminders" subtitle="Problems that need follow-up" action={<button className="more-button">•••</button>} />
      <div className="activity-list">{activity.map((item) => <article className={`problem-card ${item.tone}`} key={item.detail}><div className="problem-card-top"><div className={`activity-icon ${item.tone}`}>{item.icon}</div><div className="activity-content"><div className="problem-title-row"><strong>{item.detail}</strong><span className={`priority-badge ${item.priority.toLowerCase()}`}>{item.priority}</span></div><small className="problem-time">Terjadi {item.occurredAt}</small></div></div><div className="problem-details"><div><small>Temporary action</small><span>{item.temporaryAction}</span></div><div><small>Planning penanggulangan</small><span>{item.planning}</span></div></div><div className="problem-card-footer"><span>EVA</span><em className={item.eva === 'Open' ? 'eva-open' : 'eva-progress'}>{item.eva}</em></div></article>)}</div>
      <button className="activity-footer">View activity log <Icon name={icons.arrow} /></button>
    </section>
  );
}
