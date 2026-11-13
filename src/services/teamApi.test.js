import { configureStore } from "@reduxjs/toolkit";
import { afterEach, describe, expect, it, vi } from "vitest";
import { teamApi } from "./teamApi";

afterEach(() => {
  vi.unstubAllGlobals();
});

function createStore() {
  return configureStore({
    reducer: { [teamApi.reducerPath]: teamApi.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(teamApi.middleware),
  });
}

describe("team API CRUD endpoints", () => {
  it("uses GET endpoints with inclusive date range query params", async () => {
    const fetchMock = vi.fn(async (request) => {
      const url = typeof request === "string" ? request : request.url;
      const data = url.includes("/team-members")
        ? [{ id: 12, name: "Ayu Putri", initials: "AP" }]
        : url.includes("/attendance")
          ? [{
              id: "101",
              member: { id: 12, name: "Ayu Putri" },
              date: "2026-11-12",
              shift: "morning",
              status: "present",
            }]
          : [{
              id: "201",
              title: "Pemeriksaan panel listrik",
              date: "2026-11-12",
              shift: "afternoon",
              assignees: [{ id: 12, name: "Ayu Putri" }],
              priority: "normal",
            }];

      return new Response(JSON.stringify({ data }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const store = createStore();
    const range = { from: "2026-11-01", to: "2026-11-30" };

    const membersRequest = store.dispatch(
      teamApi.endpoints.getTeamMembers.initiate(),
    );
    const attendanceRequest = store.dispatch(
      teamApi.endpoints.getAttendance.initiate(range),
    );
    const jobsRequest = store.dispatch(teamApi.endpoints.getJobs.initiate(range));

    await expect(membersRequest.unwrap()).resolves.toEqual([
      { id: 12, name: "Ayu Putri", initials: "AP" },
    ]);
    await expect(attendanceRequest.unwrap()).resolves.toMatchObject([
      { id: "101", member: { id: 12 }, status: "present" },
    ]);
    await expect(jobsRequest.unwrap()).resolves.toMatchObject([
      { id: "201", assignees: [{ id: 12 }], priority: "normal" },
    ]);

    const urls = fetchMock.mock.calls.map(([request]) =>
      typeof request === "string" ? request : request.url,
    );
    expect(urls).toHaveLength(3);
    expect(urls.some((url) => url.endsWith("/team-members"))).toBe(true);
    expect(
      urls.some(
        (url) =>
          url.includes("/attendance?") &&
          url.includes("from=2026-11-01") &&
          url.includes("to=2026-11-30"),
      ),
    ).toBe(true);
    expect(
      urls.some(
        (url) =>
          url.includes("/jobs?") &&
          url.includes("from=2026-11-01") &&
          url.includes("to=2026-11-30"),
      ),
    ).toBe(true);

    membersRequest.unsubscribe();
    attendanceRequest.unsubscribe();
    jobsRequest.unsubscribe();
    store.dispatch(teamApi.util.resetApiState());
  });

  it("sends POST/PATCH bodies and DELETE requests to CRUD endpoints", async () => {
    const attendance = {
      id: "101",
      member: { id: 12, name: "Ayu Putri" },
      date: "2026-11-12",
      shift: "afternoon",
      status: "late",
    };
    const job = {
      id: "201",
      title: "Pemeriksaan panel listrik",
      date: "2026-11-12",
      shift: "afternoon",
      assignees: [{ id: 12, name: "Ayu Putri" }],
      priority: "high",
    };
    const requests = [];
    const fetchMock = vi.fn(async (request) => {
      const url = typeof request === "string" ? request : request.url;
      const method = typeof request === "string" ? "GET" : request.method;
      const body =
        typeof request === "string" || method === "GET"
          ? undefined
          : await request.clone().text();
      requests.push({ url, method, body });

      if (method === "DELETE") return new Response(null, { status: 204 });
      const data = url.includes("/attendance") ? attendance : job;
      return new Response(JSON.stringify({ data }), {
        status: method === "POST" ? 201 : 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const store = createStore();

    await expect(
      store.dispatch(
        teamApi.endpoints.createAttendance.initiate({
          memberId: 12,
          date: "2026-11-12",
          shift: "afternoon",
          status: "late",
        }),
      ).unwrap(),
    ).resolves.toEqual(attendance);
    await expect(
      store.dispatch(
        teamApi.endpoints.updateAttendance.initiate({
          id: "101",
          body: { status: "late", shift: "afternoon" },
        }),
      ).unwrap(),
    ).resolves.toEqual(attendance);
    await expect(
      store.dispatch(teamApi.endpoints.deleteAttendance.initiate("101")).unwrap(),
    ).resolves.toBeNull();
    await expect(
      store.dispatch(
        teamApi.endpoints.createJob.initiate({
          date: "2026-11-12",
          shift: "afternoon",
          title: job.title,
          assigneeIds: [12],
          priority: "high",
        }),
      ).unwrap(),
    ).resolves.toEqual(job);
    await expect(
      store.dispatch(
        teamApi.endpoints.updateJob.initiate({
          id: "201",
          body: { assigneeIds: [12], priority: "high" },
        }),
      ).unwrap(),
    ).resolves.toEqual(job);
    await expect(
      store.dispatch(teamApi.endpoints.deleteJob.initiate("201")).unwrap(),
    ).resolves.toBeNull();

    expect(requests.map(({ method, url }) => [method, new URL(url).pathname]))
      .toEqual([
        ["POST", "/attendance"],
        ["PATCH", "/attendance/101"],
        ["DELETE", "/attendance/101"],
        ["POST", "/jobs"],
        ["PATCH", "/jobs/201"],
        ["DELETE", "/jobs/201"],
      ]);
    expect(JSON.parse(requests[1].body)).toEqual({
      status: "late",
      shift: "afternoon",
    });
    expect(JSON.parse(requests[4].body)).toEqual({
      assigneeIds: [12],
      priority: "high",
    });

    store.dispatch(teamApi.util.resetApiState());
  });
});
