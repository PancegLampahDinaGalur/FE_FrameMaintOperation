import React, { useState } from 'react';
import { Icon } from '../common/Icon';
import { PanelHeader } from '../common/PanelHeader';
import { icons } from '../../constants/icons';

const defectByDay = [42, 48, 45, 54, 51, 58, 55, 62, 59, 66, 64, 70];
const efficiencyByDay = [72, 78, 75, 84, 80, 88, 85, 92, 89, 96, 94, 100];
const monthOptions = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function MaintenanceChart() {
  const [selectedMonth, setSelectedMonth] = useState('November');
  const [hoveredDay, setHoveredDay] = useState(null);
  const selectedMonthIndex = monthOptions.indexOf(selectedMonth);
  const daysInMonth = new Date(2024, selectedMonthIndex + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  return (
    <section className="panel chart-panel">
      <PanelHeader
        title="Efficiency & Defect Rate"
        subtitle="Efficiency and defect rate over time"
        action={<div className="period-select"><select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>{monthOptions.map((month) => <option key={month} value={month}>{month} 2024</option>)}</select><Icon name={icons.chevron} /></div>}
      />
      <div className="chart-legend"><span><i className="dot purple-dot" />Efficiency <b>86%</b></span><span><i className="dot orange-dot" />Defect <b>70 unit/day</b></span></div>
      <div className="chart">
        <div className="y-axis-label left-axis-label">Efficiency (%)</div>
        <div className="y-labels"><span>100%</span><span>75%</span><span>50%</span><span>0%</span></div>
        <div className="chart-area" style={{ '--chart-days': daysInMonth }}>
          <div className="grid-lines"><i /><i /><i /><i /></div>
          <div className="defect-bars" aria-label="Defect output in units per day">
            {days.map((day) => {
              const value = defectByDay[(day - 1) % defectByDay.length];
              return <i key={day} style={{ height: `${value}%` }} title={`${value} unit/day`} />;
            })}
          </div>
          <div className="defect-labels"><span>80</span><span>60</span><span>40</span><span>0</span></div>
          <div className="y-axis-label right-axis-label">Defect (unit/day)</div>
          <svg viewBox="0 0 720 215" preserveAspectRatio="none" aria-label="Efficiency and defect chart">
            <defs><linearGradient id="areaPurple" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#7b61ff" stopOpacity=".25" /><stop offset="100%" stopColor="#7b61ff" stopOpacity="0" /></linearGradient></defs>
            <path className="area-fill" d="M0,170 C35,162 48,135 80,141 S120,155 150,124 S180,117 215,136 S250,96 285,110 S320,126 350,88 S385,103 415,78 S450,58 480,80 S520,54 550,74 S580,93 610,55 S645,68 680,41 S700,53 720,25 L720,215 L0,215 Z" />
            <path className="line purple-line" d="M0,170 C35,162 48,135 80,141 S120,155 150,124 S180,117 215,136 S250,96 285,110 S320,126 350,88 S385,103 415,78 S450,58 480,80 S520,54 550,74 S580,93 610,55 S645,68 680,41 S700,53 720,25" />
          </svg>
          <div className="x-labels">{
            days.map((day) => <span key={day}>{String(day).padStart(2, '0')}</span>)
          }</div>
          <div className="chart-hover-zones" aria-label="Chart data points">
            {days.map((day) => {
              const defect = defectByDay[(day - 1) % defectByDay.length];
              const efficiency = efficiencyByDay[(day - 1) % efficiencyByDay.length];
              return (
                <button
                  className="chart-hover-zone"
                  key={day}
                  type="button"
                  aria-label={`Day ${day}: efficiency ${efficiency} percent, defect ${defect} unit per day`}
                  onMouseEnter={() => setHoveredDay({ day, defect, efficiency })}
                  onMouseLeave={() => setHoveredDay(null)}
                  onFocus={() => setHoveredDay({ day, defect, efficiency })}
                  onBlur={() => setHoveredDay(null)}
                />
              );
            })}
          </div>
          {hoveredDay && (
            <div className="chart-tooltip" role="status">
              <strong>Day {hoveredDay.day}</strong>
              <span><i className="dot purple-dot" />Efficiency: {hoveredDay.efficiency}%</span>
              <span><i className="dot orange-dot" />Defect: {hoveredDay.defect} unit/day</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
