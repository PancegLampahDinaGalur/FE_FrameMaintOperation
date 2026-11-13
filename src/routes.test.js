import { describe, expect, it } from "vitest";
import { implementedRoutes, navRoutes, routeLabels } from "./routes";

describe("navigation routes", () => {
  it("maps navigation labels to unique paths", () => {
    const paths = Object.values(navRoutes);

    expect(new Set(paths).size).toBe(paths.length);
    expect(routeLabels["/"]).toBe("Overview");
    expect(routeLabels["/team"]).toBe("Team");
  });

  it("identifies only pages that have an implemented screen", () => {
    expect(implementedRoutes).toEqual({
      overview: "/",
      team: "/team",
    });
  });
});
