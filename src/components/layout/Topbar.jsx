import React from 'react';
import { Icon } from '../common/Icon';
import { icons } from '../../constants/icons';

export function Topbar({ onMenuToggle, activeNav, menuOpen, darkMode, onThemeToggle }) {
  return (
    <header className="topbar">
      {!menuOpen && <button className="mobile-menu" onClick={onMenuToggle} aria-label="Open menu">☰</button>}
      <div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{activeNav}</strong></div>
      <div className="top-actions">
        <button className="icon-button search-button" aria-label="Search"><Icon name={icons.search} /></button>
        <button className="icon-button notification-button" aria-label="Notifications"><Icon name={icons.bell} /><i /></button>
        <button className="theme-toggle" onClick={onThemeToggle} aria-label={darkMode ? 'Switch to day mode' : 'Switch to night mode'} title={darkMode ? 'Day mode' : 'Night mode'}>{darkMode ? '☀' : '☾'}</button>
        <div className="top-avatar avatar-dark">JD</div>
      </div>
    </header>
  );
}
