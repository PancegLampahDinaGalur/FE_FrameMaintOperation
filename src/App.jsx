import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { OverviewPage } from "./components/overview/OverviewPage";
import { TeamPage } from "./components/team/TeamPage";
import { EditJobAttendanceSidebar } from "./components/team/EditJobAttendanceSidebar";
import { useSaveTeamOperationsMutation } from "./services/teamApi";
import { routeLabels } from "./routes";

export default function App() {
  const location = useLocation();
  const activeNav = routeLabels[location.pathname] || "Overview";

  const [menuOpen, setMenuOpen] = useState(false);
  const [editSidebarOpen, setEditSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("frame-maint-theme") === "dark");
  const [saveMessage, setSaveMessage] = useState("");
  const [saveTeamOperations] = useSaveTeamOperationsMutation();

  useEffect(() => {
    localStorage.setItem("frame-maint-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleEditSidebarOpen = () => {
    setMenuOpen(false);
    setEditSidebarOpen(true);
  };

  const handleEditSidebarClose = () => setEditSidebarOpen(false);
  const handleSave = async (data, completedRequestKeys) => {
    await saveTeamOperations({ formData: data, completedRequestKeys }).unwrap();
    setSaveMessage("Data attendance dan job berhasil disimpan.");
  };

  return (
    <div className={`app-shell ${menuOpen ? "sidebar-open" : ""} ${darkMode ? "dark-mode" : ""}`}>
      <Sidebar
        isOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((isOpen) => !isOpen)}
      />

      <main
        className="main-content"
        style={{ marginLeft: menuOpen ? "252px" : "0px" }}
      >
        <Topbar
          activeNav={activeNav}
          onMenuToggle={() => setMenuOpen((isOpen) => !isOpen)}
          menuOpen={menuOpen}
          darkMode={darkMode}
          onThemeToggle={() => setDarkMode((isDark) => !isDark)}
        />

        <Routes>
          <Route
            path="/team"
            element={
              <TeamPage
                editSidebarOpen={editSidebarOpen}
                onEditSidebarOpen={handleEditSidebarOpen}
                onEditSidebarClose={handleEditSidebarClose}
              />
            }
          />
          <Route path="*" element={<OverviewPage />} />
        </Routes>
      </main>

      <EditJobAttendanceSidebar
        isOpen={editSidebarOpen}
        onClose={handleEditSidebarClose}
        onSave={handleSave}
      />

      {saveMessage && (
        <div className="app-save-notice" role="status">
          <span>{saveMessage}</span>
          <button
            type="button"
            onClick={() => setSaveMessage("")}
            aria-label="Tutup notifikasi"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
