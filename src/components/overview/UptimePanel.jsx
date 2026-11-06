import React from 'react';
import { PanelHeader } from '../common/PanelHeader';

export function UptimePanel() {
  return (
    <section className="panel uptime-panel">
      <PanelHeader title="Asset uptime" subtitle="Current equipment health" action={<button className="more-button">•••</button>} />
      <div className="uptime-score"><div className="score-ring"><strong>94<span>%</span></strong><small>UPTIME</small></div><div className="uptime-copy"><strong>Excellent</strong><span>Above your 90% target</span><div className="mini-bar"><i /></div></div></div>
      <div className="uptime-list"><div><span><i className="status-dot green-dot" />Operational</span><b>229 <small>92.3%</small></b></div><div><span><i className="status-dot yellow-dot" />In maintenance</span><b>14 <small>5.6%</small></b></div><div><span><i className="status-dot red-dot" />Needs attention</span><b>5 <small>2.1%</small></b></div></div>
    </section>
  );
}
