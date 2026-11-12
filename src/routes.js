export const navRoutes = {
  Overview: "/",
  Assets: "/assets",
  "Work orders": "/work-orders",
  Team: "/team",
  Reports: "/reports",
  Settings: "/settings",
};

export const routeLabels = Object.fromEntries(
  Object.entries(navRoutes).map(([label, path]) => [path, label]),
);
