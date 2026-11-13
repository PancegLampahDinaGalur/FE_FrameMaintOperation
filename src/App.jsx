import React, { useEffect, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { OverviewPage } from "./components/overview/OverviewPage";
import { TeamPage } from "./components/team/TeamPage";
import { useGetTeamMembersQuery } from "./services/teamApi";
import { implementedRoutes, routeLabels } from "./routes";

function NotFoundPage() {
  return (
    <section className="content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">PAGE NOT AVAILABLE</p>
          <h1>Halaman belum tersedia</h1>
          <p className="heading-subtitle">
            Halaman ini belum dibuat. Kembali ke dashboard untuk melanjutkan.
          </p>
        </div>
        <Link className="primary-button" to={implementedRoutes.overview}>
          Kembali ke overview
        </Link>
      </div>
    </section>
  );
}

export default function App() {
  const location = useLocation();
  const activeNav = routeLabels[location.pathname] || "Page not found";

  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("frame-maint-theme") === "dark");
  const {
    data: members = [],
    isLoading: membersLoading,
    error: membersError,
    refetch: refetchMembers,
  } = useGetTeamMembersQuery(undefined, {
    skip: location.pathname !== implementedRoutes.team,
  });
  useEffect(() => {
    localStorage.setItem("frame-maint-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

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
            path={implementedRoutes.team}
            element={
              <TeamPage
                members={members}
                membersLoading={membersLoading}
                membersError={membersError}
                onRetryMembers={refetchMembers}
                onEditSidebarOpen={() => setMenuOpen(false)}
              />
            }
          />
          <Route path={implementedRoutes.overview} element={<OverviewPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

    </div>
  );
}
