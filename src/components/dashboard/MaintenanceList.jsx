import React from 'react';
import { Icon } from '../common/Icon';
import { PanelHeader } from '../common/PanelHeader';
import { icons } from '../../constants/icons';
import { maintenance } from '../../data/dashboardData';

export function MaintenanceList() {
  return (
    <section className="panel table-panel">
      <PanelHeader title="Upcoming maintenance" subtitle="Scheduled work for the next 7 days" action={<button className="text-button">View all <Icon name={icons.arrow} /></button>} />
      <div className="maintenance-list">{maintenance.map((item) => <div className="maintenance-row" key={item.title}><div className="row-icon"><Icon name={icons.settings} /></div><div className="maintenance-info"><strong>{item.title}</strong><span>{item.asset}</span></div><div className="maintenance-date"><span><Icon name={icons.calendar} />{item.date}</span></div><span className={`status-pill ${item.tone}`}>{item.status}</span><div className={`avatar avatar-${item.avatar}`}>{item.initials}</div></div>)}</div>
    </section>
  );
}
