import { icons } from '../constants/icons';

export const navItems = [
  { label: 'Overview', icon: icons.grid },
  { label: 'Assets', icon: icons.asset, count: '248' },
  { label: 'Work orders', icon: icons.calendar, count: '12' },
  { label: 'Team', icon: icons.team },
  { label: 'Reports', icon: icons.report },
];

export const statCards = [
  { label: 'Total assets', value: '248', icon: icons.asset, tone: 'purple', trend: '↗ 4.8%', trendTone: 'positive', highlight: true },
  { label: 'Open work orders', value: '12', icon: icons.calendar, tone: 'orange', trend: '↘ 2.1%', trendTone: 'negative' },
  { label: 'Completed this month', value: '86', icon: icons.check, tone: 'green', trend: '↗ 12.6%', trendTone: 'positive' },
  { label: 'Avg. resolution time', value: '2.4', unit: 'hrs', icon: icons.clock, tone: 'blue', trend: '↘ 8.3%', trendTone: 'positive' },
];

export const maintenance = [
  { title: 'Hydraulic pressure check', asset: 'CNC Machine · CNC-042', date: 'Today, 10:30 AM', status: 'In progress', tone: 'blue', initials: 'AR', avatar: 'violet' },
  { title: 'Replace air filter', asset: 'Compressor · CMP-018', date: 'Today, 01:00 PM', status: 'Scheduled', tone: 'yellow', initials: 'SM', avatar: 'orange' },
  { title: 'Conveyor belt inspection', asset: 'Assembly Line · ASM-007', date: 'Tomorrow, 09:00 AM', status: 'Scheduled', tone: 'yellow', initials: 'JL', avatar: 'green' },
  { title: 'Safety guard calibration', asset: 'Robot Arm · RBT-011', date: 'Nov 10, 02:30 PM', status: 'Scheduled', tone: 'yellow', initials: 'NK', avatar: 'blue' },
];

export const activity = [
  { icon: icons.check, tone: 'green', title: 'Work order completed', detail: 'Lubricate motor bearings · MTR-023', time: '12 min ago' },
  { icon: icons.alert, tone: 'red', title: 'Asset needs attention', detail: 'Temperature above threshold · PMP-006', time: '34 min ago' },
  { icon: icons.asset, tone: 'blue', title: 'New asset added', detail: 'Packaging machine · PKG-029', time: '2 hrs ago' },
];
