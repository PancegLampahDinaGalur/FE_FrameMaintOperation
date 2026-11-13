import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { OverviewPage } from "./components/overview/OverviewPage";
import { TeamPage } from "./components/team/TeamPage";
import { LoginPage } from "./components/auth/LoginPage";
import { RegisterPage } from "./components/auth/RegisterPage";
import { AdminAccountsPage } from "./components/auth/AdminAccountsPage";
import { AttendanceRequestsPage } from "./components/auth/AttendanceRequestsPage";
import {
  teamApi,
  useGetCurrentUserQuery,
  useGetTeamMembersQuery,
} from "./services/teamApi";
import { clearCredentials } from "./store/authSlice";
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
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.auth.accessToken);
  const isPublicRoute =
    location.pathname === implementedRoutes.login ||
    location.pathname === implementedRoutes.register;
  const {
    data: currentUser,
    isLoading: userLoading,
    error: userError,
    refetch: refetchCurrentUser,
  } = useGetCurrentUserQuery(undefined, {
    skip: !accessToken || isPublicRoute,
    pollingInterval: accessToken && !isPublicRoute ? 30000 : 0,
  });
  const activeNav = routeLabels[location.pathname] || "Page not found";

  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("frame-maint-theme") === "dark");
  const {
    data: members = [],
    isLoading: membersLoading,
    error: membersError,
    refetch: refetchMembers,
  } = useGetTeamMembersQuery(undefined, {
    skip: location.pathname !== implementedRoutes.team || !accessToken,
  });
  useEffect(() => {
    localStorage.setItem("frame-maint-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    if (userError?.status === 401) {
      dispatch(clearCredentials());
      dispatch(teamApi.util.resetApiState());
    }
  }, [dispatch, userError]);

  if (location.pathname === implementedRoutes.login) return <LoginPage />;
  if (location.pathname === implementedRoutes.register) {
    return <RegisterPage />;
  }

  if (!accessToken) {
    return <Navigate to={implementedRoutes.login} replace />;
  }

  if (userLoading) {
    return <main className="auth-loading">Memeriksa sesi akun...</main>;
  }

  if (userError) {
    return (
      <main className="auth-loading" role="alert">
        <p>Sesi tidak dapat diverifikasi. Silakan coba lagi.</p>
        <button type="button" onClick={refetchCurrentUser}>
          Coba lagi
        </button>
        <button
          type="button"
          onClick={() => {
            dispatch(clearCredentials());
            dispatch(teamApi.util.resetApiState());
          }}
        >
          Kembali ke login
        </button>
      </main>
    );
  }

  if (!currentUser) {
    return <main className="auth-loading">Memuat akun...</main>;
  }

  if (
    currentUser.role === "member" &&
    location.pathname !== implementedRoutes.team &&
    location.pathname !== implementedRoutes.attendanceRequests
  ) {
    return <Navigate to={implementedRoutes.team} replace />;
  }

  if (
    currentUser.role !== "sysadmin" &&
    location.pathname === implementedRoutes.adminAccounts
  ) {
    return <Navigate to={implementedRoutes.team} replace />;
  }

  const handleLogout = () => {
    dispatch(clearCredentials());
    dispatch(teamApi.util.resetApiState());
  };

  return (
    <div className={`app-shell ${menuOpen ? "sidebar-open" : ""} ${darkMode ? "dark-mode" : ""}`}>
      <Sidebar
        isOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((isOpen) => !isOpen)}
        role={currentUser.role}
        onLogout={handleLogout}
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
                canManageOperations={currentUser.role !== "member"}
              />
            }
          />
          <Route
            path={implementedRoutes.attendanceRequests}
            element={<AttendanceRequestsPage user={currentUser} />}
          />
          <Route
            path={implementedRoutes.adminAccounts}
            element={
              currentUser.role === "sysadmin" ? (
                <AdminAccountsPage />
              ) : (
                <Navigate to={implementedRoutes.team} replace />
              )
            }
          />
          <Route path={implementedRoutes.overview} element={<OverviewPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

    </div>
  );
}
