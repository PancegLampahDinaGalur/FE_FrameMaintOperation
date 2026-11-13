import { configureStore } from "@reduxjs/toolkit";
import { afterEach, describe, expect, it, vi } from "vitest";
import { authReducer } from "../store/authSlice";
import { teamApi } from "./teamApi";

afterEach(() => {
  vi.unstubAllGlobals();
});

function createStore(authState = { accessToken: null, rememberMe: false }) {
  return configureStore({
    reducer: {
      auth: authReducer,
      [teamApi.reducerPath]: teamApi.reducer,
    },
    preloadedState: { auth: authState },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(teamApi.middleware),
  });
}

describe("auth and RBAC API endpoints", () => {
  it("sends authentication, registration, account, and request payloads with bearer auth", async () => {
    const user = {
      id: 8,
      username: "leader",
      role: "team_leader",
      memberId: 12,
    };
    const member = { id: 12, name: "Ayu Putri" };
    const account = {
      id: 8,
      username: "leader",
      member_id: 12,
      role: "team_leader",
      is_active: true,
      pending_member_id: null,
      created_at: "2026-11-13T00:00:00.000Z",
      updated_at: "2026-11-13T00:00:00.000Z",
      members: member,
      pending_member: null,
    };
    const attendanceRequest = {
      id: "501",
      member,
      date: "2026-11-14",
      shift: "morning",
      requestType: "leave",
      reason: "Personal matter",
      status: "pending",
      reviewedAt: null,
      reviewNote: null,
      createdAt: "2026-11-13T00:00:00.000Z",
      reviewer: null,
    };
    const requests = [];
    const fetchMock = vi.fn(async (request) => {
      const url = new URL(request.url);
      const method = request.method;
      const body = method === "GET" ? undefined : await request.clone().json();
      requests.push({
        path: url.pathname,
        method,
        query: url.search,
        authorization: request.headers.get("authorization"),
        body,
      });

      let data;
      if (url.pathname === "/auth/login") {
        data = {
          accessToken: "test.jwt.token",
          tokenType: "Bearer",
          expiresIn: 900,
          user,
        };
      } else if (url.pathname === "/auth/register") {
        data = {
          id: 9,
          username: "new.member",
          role: "member",
          isActive: false,
          requestedMember: member,
          message: "Registration submitted. Wait for sysadmin approval.",
        };
      } else if (url.pathname === "/auth/me") {
        data = user;
      } else if (url.pathname === "/admin/accounts" && method === "GET") {
        data = [account];
      } else if (url.pathname === "/admin/accounts" && method === "POST") {
        data = account;
      } else if (url.pathname.startsWith("/admin/accounts/")) {
        data = account;
      } else if (
        url.pathname === "/attendance-requests" &&
        method === "GET"
      ) {
        data = [attendanceRequest];
      } else if (
        url.pathname === "/attendance-requests" &&
        method === "POST"
      ) {
        data = attendanceRequest;
      } else {
        data = { ...attendanceRequest, status: body.decision };
      }

      return new Response(JSON.stringify({ data }), {
        status: method === "POST" ? 201 : 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const store = createStore({ accessToken: "test.jwt.token", rememberMe: false });

    await expect(
      store.dispatch(
        teamApi.endpoints.login.initiate({
          username: "leader",
          password: "example-password",
        }),
      ).unwrap(),
    ).resolves.toMatchObject({ accessToken: "test.jwt.token", user });
    await expect(
      store.dispatch(
        teamApi.endpoints.register.initiate({
          username: "new.member",
          password: "a-secure-password",
          memberId: 12,
        }),
      ).unwrap(),
    ).resolves.toMatchObject({ role: "member", isActive: false });
    const currentUserQuery = store.dispatch(
      teamApi.endpoints.getCurrentUser.initiate(),
    );
    await expect(currentUserQuery.unwrap()).resolves.toEqual(user);
    currentUserQuery.unsubscribe();
    const accountsQuery = store.dispatch(
      teamApi.endpoints.getAccounts.initiate(),
    );
    await expect(accountsQuery.unwrap()).resolves.toEqual([account]);
    accountsQuery.unsubscribe();
    await expect(
      store.dispatch(
        teamApi.endpoints.createAccount.initiate({
          username: "leader",
          password: "a-secure-password",
          memberId: 12,
          role: "team_leader",
          isActive: true,
        }),
      ).unwrap(),
    ).resolves.toEqual(account);
    await expect(
      store.dispatch(
        teamApi.endpoints.updateAccount.initiate({
          id: 8,
          body: { memberId: 12, isActive: true },
        }),
      ).unwrap(),
    ).resolves.toEqual(account);
    const attendanceRequestsQuery = store.dispatch(
      teamApi.endpoints.getAttendanceRequests.initiate({
        status: "pending",
        from: "2026-11-01",
        to: "2026-11-30",
      }),
    );
    await expect(attendanceRequestsQuery.unwrap()).resolves.toEqual([
      attendanceRequest,
    ]);
    attendanceRequestsQuery.unsubscribe();
    await expect(
      store.dispatch(
        teamApi.endpoints.createAttendanceRequest.initiate({
          date: "2026-11-14",
          shift: "morning",
          requestType: "leave",
          reason: "Personal matter",
        }),
      ).unwrap(),
    ).resolves.toEqual(attendanceRequest);
    await expect(
      store.dispatch(
        teamApi.endpoints.reviewAttendanceRequest.initiate({
          id: "501",
          body: { decision: "approved", reviewNote: "Approved" },
        }),
      ).unwrap(),
    ).resolves.toMatchObject({ status: "approved" });

    expect(requests.map(({ method, path }) => [method, path])).toEqual([
      ["POST", "/auth/login"],
      ["POST", "/auth/register"],
      ["GET", "/auth/me"],
      ["GET", "/admin/accounts"],
      ["POST", "/admin/accounts"],
      ["PATCH", "/admin/accounts/8"],
      ["GET", "/attendance-requests"],
      ["POST", "/attendance-requests"],
      ["PATCH", "/attendance-requests/501/review"],
    ]);
    expect(requests.slice(2).every(
      ({ authorization }) => authorization === "Bearer test.jwt.token",
    )).toBe(true);
    expect(requests[6].query).toContain("status=pending");
    expect(requests[6].query).toContain("from=2026-11-01");
    expect(requests[6].query).toContain("to=2026-11-30");
    expect(requests[1].body).toEqual({
      username: "new.member",
      password: "a-secure-password",
      memberId: 12,
    });
    expect(requests[7].body).toEqual({
      date: "2026-11-14",
      shift: "morning",
      requestType: "leave",
      reason: "Personal matter",
    });
    expect(requests[8].body).toEqual({
      decision: "approved",
      reviewNote: "Approved",
    });

    store.dispatch(teamApi.util.resetApiState());
  });
});

describe("team API CRUD endpoints", () => {
  it("sends the early departure attendance payload as JSON to POST /attendance", async () => {
    let requestDetails;
    const fetchMock = vi.fn(async (request) => {
      requestDetails = {
        url: request.url,
        method: request.method,
        contentType: request.headers.get("content-type"),
        body: await request.clone().json(),
      };

      return new Response(
        JSON.stringify({
          data: {
            id: "102",
            member: { id: 12, name: "Ayu Putri" },
            date: "2026-11-14",
            shift: "morning",
            status: "early_departure",
          },
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        },
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    const store = createStore();

    await expect(
      store.dispatch(
        teamApi.endpoints.createAttendance.initiate({
          memberId: 12,
          date: "2026-11-14",
          shift: "morning",
          status: "early_departure",
        }),
      ).unwrap(),
    ).resolves.toMatchObject({
      id: "102",
      status: "early_departure",
    });

    expect(requestDetails).toEqual({
      url: expect.stringMatching(/\/attendance$/),
      method: "POST",
      contentType: "application/json",
      body: {
        memberId: 12,
        date: "2026-11-14",
        shift: "morning",
        status: "early_departure",
      },
    });

    store.dispatch(teamApi.util.resetApiState());
  });

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
