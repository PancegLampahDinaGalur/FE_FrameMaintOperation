import React, { useEffect, useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { OverviewPage } from "./components/overview/OverviewPage";
import { TeamPage } from "./components/team/TeamPage";
import { EditJobAttendanceSidebar } from "./components/team/EditJobAttendanceSidebar";

export default function App() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [editSidebarOpen, setEditSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("frame-maint-theme") === "dark");

  useEffect(() => {
    localStorage.setItem("frame-maint-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleNavigate = (label) => {
    setActiveNav(label);
  };

  const handleEditSidebarOpen = (selectedDate = new Date()) => {
    setMenuOpen(false); // auto close left sidebar
    setEditSidebarOpen(true);
    setSelectedDate(selectedDate);
  };

  const handleEditSidebarClose = () => {
    setEditSidebarOpen(false);
  };

  return (
    <div className={`app-shell ${menuOpen ? "sidebar-open" : ""} ${darkMode ? "dark-mode" : ""}`}>
      <Sidebar activeNav={activeNav} onNavigate={handleNavigate} isOpen={menuOpen} onMenuToggle={() => setMenuOpen((isOpen) => !isOpen)} />
      <main className="main-content" style={{ marginLeft: menuOpen ? "252px" : "0px" }}>
        <Topbar activeNav={activeNav} onMenuToggle={() => setMenuOpen((isOpen) => !isOpen)} menuOpen={menuOpen} darkMode={darkMode} onThemeToggle={() => setDarkMode((isDark) => !isDark)} />
        {activeNav === "Team" ? <TeamPage editSidebarOpen={editSidebarOpen} onEditSidebarOpen={handleEditSidebarOpen} onEditSidebarClose={handleEditSidebarClose} /> : <OverviewPage />}
      </main>
      <EditJobAttendanceSidebar
        isOpen={editSidebarOpen}
        defaultDate={selectedDate}
        onClose={handleEditSidebarClose}
        onSave={(data) => {
          console.log("Data disimpan:", data);
          // TODO: Integrasi dengan API / update state data attendance & job
        }}
      />
    </div>
  );
}
