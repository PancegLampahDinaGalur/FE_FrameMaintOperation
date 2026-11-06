import React from 'react';
import { Icon } from '../common/Icon';
import { icons } from '../../constants/icons';
import { statCards } from '../../data/overview/overviewData';

export function StatsGrid() {
  return (
    <div className="stat-grid">
      {statCards.map((card) => (
        <article className={`stat-card ${card.highlight ? 'highlight' : ''}`} key={card.label}>
          <div className="stat-top"><span className="stat-label">{card.label}</span><span className={`stat-icon ${card.tone}`}><Icon name={card.icon} /></span></div>
          <strong className="stat-value">{card.value} {card.unit && <small>{card.unit}</small>}</strong>
          <div className="stat-footer"><span className={`trend ${card.trendTone}`}>{card.trend}</span><span>vs. last month</span><Icon name={icons.arrow} className="card-arrow" /></div>
        </article>
      ))}
    </div>
  );
}
