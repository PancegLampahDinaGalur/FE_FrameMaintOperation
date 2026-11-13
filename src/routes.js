export const navRoutes = {
  Overview: "/",
  Assets: "/assets",
  "Work orders": "/work-orders",
  Team: "/team",
  Reports: "/reports",
  "Attendance requests": "/attendance-requests",
  Accounts: "/admin/accounts",
  Settings: "/settings",
};

export const routeLabels = Object.fromEntries(
  Object.entries(navRoutes).map(([label, path]) => [path, label]),
);

export const implementedRoutes = {
  overview: navRoutes.Overview,
  team: navRoutes.Team,
  login: "/login",
  register: "/register",
  attendanceRequests: "/attendance-requests",
  adminAccounts: "/admin/accounts",
};
