import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { icons } from '../../constants/icons';
import { navItems } from '../../data/overview/overviewData';
import { navRoutes } from '../../routes';

export function Sidebar({ isOpen, onMenuToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeNav =
    Object.keys(navRoutes).find((label) => navRoutes[label] === location.pathname) ||
    'Overview';
  const [selectedWorkspace, setSelectedWorkspace] = useState('Zone 1 & ED');
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const workspaces = ['Zone 1 & ED', 'Zone 2', 'Zone & Unit'];
  const handleNavigate = (label) => navigate(navRoutes[label] || '/');

  return (
    <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
      <div className="brand">
        <div className="brand-mark"><span /></div>
        <div>
          <strong>Frame<span>Maint</span></strong>
          <small>OPERATIONS HUB</small>
        </div>
      </div>
      <button
        className="sidebar-close"
        onClick={onMenuToggle}
        aria-label="Close menu"
      >
        ‹
      </button>

      {activeNav === 'Assets' && (
        <div className={`workspace-switcher ${workspaceMenuOpen ? 'is-open' : ''}`}>
          <div className="workspace-icon">F</div>
          <div className="workspace-picker">
            <button
              className="workspace-trigger"
              type="button"
              aria-expanded={workspaceMenuOpen}
              aria-haspopup="listbox"
              onClick={() => setWorkspaceMenuOpen((isOpen) => !isOpen)}
            >
              <small>WORKSPACE</small>
              <strong>{selectedWorkspace}</strong>
              <Icon name={icons.chevron} className="workspace-chevron" />
            </button>
            {workspaceMenuOpen && (
              <div className="workspace-menu" role="listbox" aria-label="Workspace options">
                {workspaces.map((workspace) => (
                  <button
                    className={workspace === selectedWorkspace ? 'selected' : ''}
                    key={workspace}
                    type="button"
                    role="option"
                    aria-selected={workspace === selectedWorkspace}
                    onClick={() => {
                      setSelectedWorkspace(workspace);
                      setWorkspaceMenuOpen(false);
                    }}
                  >
                    <span className="workspace-option-mark">
                      {workspace === selectedWorkspace ? '✓' : '·'}
                    </span>
                    <span>{workspace}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <nav className="main-nav" aria-label="Main navigation">
        <p>MAIN MENU</p>
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`nav-item ${activeNav === item.label ? 'active' : ''}`}
            onClick={() => handleNavigate(item.label)}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {item.count && <em>{item.count}</em>}
          </button>
        ))}
        <p className="nav-section">SYSTEM</p>
        <button
          className={`nav-item ${activeNav === 'Settings' ? 'active' : ''}`}
          onClick={() => handleNavigate('Settings')}
        >
          <Icon name={icons.settings} />
          <span>Settings</span>
        </button>
      </nav>

      <div className="sidebar-bottom">
        <div className="support-card">
          <div className="support-icon">?</div>
          <div>
            <strong>Need a hand?</strong>
            <span>Visit our help center</span>
          </div>
          <Icon name={icons.arrow} />
        </div>
      </div>
    </aside>
  );
}
