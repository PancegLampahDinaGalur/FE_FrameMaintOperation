import { icons } from '../../constants/icons';

export const navItems = [
  { label: 'Overview', icon: icons.grid },
  { label: 'Assets', icon: icons.asset, count: '248' },
  { label: 'Work orders', icon: icons.calendar, count: '12' },
  { label: 'Team', icon: icons.team },
  { label: 'Reports', icon: icons.report },
];

export const statCards = [
  { label: 'Total Core Equipt', value: '248', icon: icons.asset, tone: 'purple', trend: '↗ 4.8%', trendTone: 'positive', highlight: true },
  { label: 'Problem Remind', value: '3', icon: icons.alert, tone: 'orange', trend: '↘ 2.1%', trendTone: 'positive' },
  { label: 'Attendance', value: '94.8', unit: '%', icon: icons.team, tone: 'green', trend: '↗ 1.6%', trendTone: 'positive' },
  { label: 'Daily Maintenance Jobs', value: '4', unit: 'jobs', icon: icons.calendar, tone: 'blue', trend: '↗ 8.3%', trendTone: 'positive' },
];

export const maintenance = [
  { title: 'Hydraulic pressure check', asset: 'CNC Machine · CNC-042', date: 'Today, 10:30 AM', phase: 'After production', status: 'In progress', tone: 'blue', initials: 'AR', avatar: 'violet' },
  { title: 'Replace air filter', asset: 'Compressor · CMP-018', date: 'Today, 01:00 PM', phase: 'After production', status: 'Scheduled', tone: 'yellow', initials: 'SM', avatar: 'orange' },
  { title: 'Conveyor belt inspection', asset: 'Assembly Line · ASM-007', date: 'Today, 09:00 AM', phase: 'After production', status: 'Scheduled', tone: 'yellow', initials: 'JL', avatar: 'green' },
  { title: 'Safety guard calibration', asset: 'Robot Arm · RBT-011', date: 'Today, 02:30 PM', phase: 'After production', status: 'Scheduled', tone: 'yellow', initials: 'NK', avatar: 'blue' },
];

export const activity = [
  { icon: icons.alert, tone: 'red', priority: 'High', title: 'Problem reminder', detail: 'Temperature above threshold · PMP-006', occurredAt: 'Today, 08:15 AM', temporaryAction: 'Reduce machine load and monitor temperature', planning: 'Inspect cooling system after production', eva: 'Open' },
  { icon: icons.alert, tone: 'orange', priority: 'Medium', title: 'Problem reminder', detail: 'Hydraulic pressure check overdue · CNC-042', occurredAt: 'Today, 09:40 AM', temporaryAction: 'Stop hydraulic cycle and check pressure gauge', planning: 'Schedule pressure test and replace seal', eva: 'In progress' },
  { icon: icons.alert, tone: 'red', priority: 'High', title: 'Problem reminder', detail: 'Conveyor belt vibration detected · ASM-007', occurredAt: 'Today, 11:20 AM', temporaryAction: 'Limit conveyor speed and secure the area', planning: 'Align belt and inspect bearing after production', eva: 'Open' },
];
