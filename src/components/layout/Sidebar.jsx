import React from 'react';
import { Icon } from '../common/Icon';
import { icons } from '../../constants/icons';
import { navItems } from '../../data/overview/overviewData';

export function Sidebar({ activeNav, onNavigate, isOpen, onMenuToggle }) {
  return (
    <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
      <div className="brand">
        <div className="brand-mark"><span /></div>
        <div><strong>Frame<span>Maint</span></strong><small>OPERATIONS HUB</small></div>
      </div>
      <button className="sidebar-close" onClick={onMenuToggle} aria-label="Close menu">‹</button>
      <div className="workspace-switcher">
        <div className="workspace-icon">F</div>
        <div><small>WORKSPACE</small><strong>Factory Floor 01</strong></div>
        <Icon name={icons.chevron} className="muted" />
      </div>
      <nav className="main-nav" aria-label="Main navigation">
        <p>MAIN MENU</p>
        {navItems.map((item) => (
          <button key={item.label} className={`nav-item ${activeNav === item.label ? 'active' : ''}`} onClick={() => onNavigate(item.label)}>
            <Icon name={item.icon} /><span>{item.label}</span>{item.count && <em>{item.count}</em>}
          </button>
        ))}
        <p className="nav-section">SYSTEM</p>
        <button className={`nav-item ${activeNav === 'Settings' ? 'active' : ''}`} onClick={() => onNavigate('Settings')}>
          <Icon name={icons.settings} /><span>Settings</span>
        </button>
      </nav>
      <div className="sidebar-bottom">
        <div className="support-card">
          <div className="support-icon">?</div>
          <div><strong>Need a hand?</strong><span>Visit our help center</span></div>
          <Icon name={icons.arrow} />
        </div>
        <div className="profile">
          <div className="avatar avatar-dark">JD</div>
          <div><strong>Jordan Davis</strong><span>Operations manager</span></div>
          <Icon name={icons.chevron} className="muted" />
        </div>
      </div>
    </aside>
  );
}
