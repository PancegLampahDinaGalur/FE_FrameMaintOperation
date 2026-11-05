import React, { useState } from 'react';
import { Icon } from '../common/Icon';
import { PanelHeader } from '../common/PanelHeader';
import { icons } from '../../constants/icons';

export function MaintenanceChart() {
  const [period, setPeriod] = useState('This month');

  return (
    <section className="panel chart-panel">
      <PanelHeader
        title="Maintenance overview"
        subtitle="Work order activity over time"
        action={<div className="period-select"><select value={period} onChange={(event) => setPeriod(event.target.value)}><option>This month</option><option>Last month</option><option>This year</option></select><Icon name={icons.chevron} /></div>}
      />
      <div className="chart-legend"><span><i className="dot purple-dot" />Completed <b>86</b></span><span><i className="dot orange-dot" />Open <b>12</b></span></div>
      <div className="chart">
        <div className="y-labels"><span>30</span><span>20</span><span>10</span><span>0</span></div>
        <div className="chart-area">
          <div className="grid-lines"><i /><i /><i /><i /></div>
          <svg viewBox="0 0 720 215" preserveAspectRatio="none" aria-label="Maintenance activity chart">
            <defs><linearGradient id="areaPurple" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#7b61ff" stopOpacity=".25" /><stop offset="100%" stopColor="#7b61ff" stopOpacity="0" /></linearGradient></defs>
            <path className="area-fill" d="M0,170 C35,162 48,135 80,141 S120,155 150,124 S180,117 215,136 S250,96 285,110 S320,126 350,88 S385,103 415,78 S450,58 480,80 S520,54 550,74 S580,93 610,55 S645,68 680,41 S700,53 720,25 L720,215 L0,215 Z" />
            <path className="line purple-line" d="M0,170 C35,162 48,135 80,141 S120,155 150,124 S180,117 215,136 S250,96 285,110 S320,126 350,88 S385,103 415,78 S450,58 480,80 S520,54 550,74 S580,93 610,55 S645,68 680,41 S700,53 720,25" />
            <path className="line orange-line" d="M0,198 C60,192 95,201 130,186 S190,180 225,190 S275,168 320,178 S380,164 425,174 S475,155 520,162 S580,143 620,154 S680,133 720,143" />
          </svg>
          <div className="x-labels"><span>01 Nov</span><span>08 Nov</span><span>15 Nov</span><span>22 Nov</span><span>30 Nov</span></div>
        </div>
      </div>
    </section>
  );
}
