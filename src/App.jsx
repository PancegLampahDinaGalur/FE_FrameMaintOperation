import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { TeamPage } from './components/team/TeamPage';

export default function App() {
  const [activeNav, setActiveNav] = useState('Overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('frame-maint-theme') === 'dark');

  useEffect(() => {
    localStorage.setItem('frame-maint-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleNavigate = (label) => {
    setActiveNav(label);
  };

  return (
    <div className={`app-shell ${menuOpen ? 'sidebar-open' : ''} ${darkMode ? 'dark-mode' : ''}`}>
      <Sidebar activeNav={activeNav} onNavigate={handleNavigate} isOpen={menuOpen} onMenuToggle={() => setMenuOpen((isOpen) => !isOpen)} />
      <main className="main-content" style={{ marginLeft: menuOpen ? '252px' : '0px' }}>
        <Topbar activeNav={activeNav} onMenuToggle={() => setMenuOpen((isOpen) => !isOpen)} menuOpen={menuOpen} darkMode={darkMode} onThemeToggle={() => setDarkMode((isDark) => !isDark)} />
        {activeNav === 'Team' ? <TeamPage /> : <DashboardPage />}
      </main>
    </div>
  );
}
