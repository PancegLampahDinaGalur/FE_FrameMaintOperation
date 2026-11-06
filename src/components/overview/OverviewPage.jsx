import React from 'react';
import { PageHeading } from './PageHeading';
import { StatsGrid } from './StatsGrid';
import { MaintenanceChart } from './MaintenanceChart';
import { UptimePanel } from './UptimePanel';
import { MaintenanceList } from './MaintenanceList';
import { ActivityPanel } from './ActivityPanel';

export function OverviewPage() {
  return (
    <section className="content">
      <PageHeading />
      <StatsGrid />
      <div className="dashboard-grid"><MaintenanceChart /><UptimePanel /></div>
      <div className="lower-grid"><MaintenanceList /><ActivityPanel /></div>
    </section>
  );
}
