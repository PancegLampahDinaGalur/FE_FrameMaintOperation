import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { clearCredentials } from "../store/authSlice";

export type Shift = "morning" | "afternoon" | "night";
export type AttendanceStatus =
  | "present"
  | "late"
  | "absent"
  | "leave"
  | "early_departure";
export type Priority = "low" | "normal" | "high" | "urgent";

export interface TeamMember {
  id: number;
  name: string;
  initials: string;
}

export interface AttendanceRecord {
  id: string;
  member: Pick<TeamMember, "id" | "name">;
  date: string;
  shift: Shift;
  status: AttendanceStatus;
}

export interface JobRecord {
  id: string;
  title: string;
  date: string;
  shift: Shift;
  assignees: Pick<TeamMember, "id" | "name">[];
  priority: Priority;
}

export type AppRole = "member" | "team_leader" | "group_leader" | "sysadmin";
export type AttendanceRequestStatus = "pending" | "approved" | "rejected";
export type AttendanceRequestType = "leave" | "late" | "early_departure";

export interface AuthUser {
  id: number;
  username: string;
  role: AppRole;
  memberId: number | null;
}

export interface AttendanceRequestRecord {
  id: string;
  member: Pick<TeamMember, "id" | "name">;
  date: string;
  shift: Shift;
  requestType: AttendanceRequestType;
  reason: string;
  status: AttendanceRequestStatus;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  reviewer: { id: number; username: string; role: AppRole } | null;
}

export interface AdminAccount {
  id: number;
  username: string;
  member_id: number | null;
  role: AppRole;
  is_active: boolean;
  pending_member_id: number | null;
  created_at: string;
  updated_at: string;
  members: Pick<TeamMember, "id" | "name"> | null;
  pending_member: Pick<TeamMember, "id" | "name"> | null;
}

export interface AccountInput {
  username: string;
  password: string;
  memberId: number | null;
  role: AppRole;
  isActive?: boolean;
}

export type AccountPatch = Partial<AccountInput>;

interface ApiList<T> {
  data: T[];
}

export interface DateRange {
  from: string;
  to: string;
}

export interface AttendanceInput {
  memberId: number;
  date: string;
  shift: Shift;
  status: AttendanceStatus;
}

export type AttendancePatch = Partial<AttendanceInput>;

export interface JobInput {
  date: string;
  shift: Shift;
  title: string;
  assigneeIds: number[];
  priority: Priority;
}

interface ApiItem<T> {
  data: T;
}

interface LoginInput {
  username: string;
  password: string;
}

interface LoginResult {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: AuthUser;
}

interface RegistrationInput {
  username: string;
  password: string;
  memberId: number;
}

interface RegistrationResult {
  id: number;
  username: string;
  role: "member";
  isActive: false;
  requestedMember: Pick<TeamMember, "id" | "name">;
  message: string;
}

interface AttendanceRequestInput {
  date: string;
  shift: Shift;
  requestType: AttendanceRequestType;
  reason: string;
}

interface ReviewAttendanceRequestArgs {
  id: string;
  body: { decision: "approved" | "rejected"; reviewNote?: string };
}

interface UpdateAttendanceArgs {
  id: string;
  body: AttendancePatch;
}

interface UpdateJobArgs {
  id: string;
  body: Partial<JobInput>;
}

interface UpdateAccountArgs {
  id: number;
  body: AccountPatch;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(
    /\/+$/,
    "",
  ),
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth?: { accessToken?: string | null } }).auth
      ?.accessToken;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    api.dispatch(clearCredentials());
  }
  return result;
};

export const teamApi = createApi({
  reducerPath: "teamApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    "Auth",
    "TeamMembers",
    "Attendance",
    "Jobs",
    "AttendanceRequests",
    "Accounts",
  ],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResult, LoginInput>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      transformResponse: (response: ApiItem<LoginResult>) => response.data,
      invalidatesTags: ["Auth"],
    }),
    register: builder.mutation<RegistrationResult, RegistrationInput>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      transformResponse: (response: ApiItem<RegistrationResult>) => response.data,
    }),
    getCurrentUser: builder.query<AuthUser, void>({
      query: () => "/auth/me",
      transformResponse: (response: ApiItem<AuthUser>) => response.data,
      providesTags: ["Auth"],
    }),
    getAccounts: builder.query<AdminAccount[], void>({
      query: () => "/admin/accounts",
      transformResponse: (response: ApiList<AdminAccount>) => response.data,
      providesTags: ["Accounts"],
    }),
    createAccount: builder.mutation<AdminAccount, AccountInput>({
      query: (body) => ({ url: "/admin/accounts", method: "POST", body }),
      transformResponse: (response: ApiItem<AdminAccount>) => response.data,
      invalidatesTags: ["Accounts"],
    }),
    updateAccount: builder.mutation<AdminAccount, UpdateAccountArgs>({
      query: ({ id, body }) => ({
        url: `/admin/accounts/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiItem<AdminAccount>) => response.data,
      invalidatesTags: ["Accounts", "Auth"],
    }),
    getAttendanceRequests: builder.query<
      AttendanceRequestRecord[],
      Partial<DateRange> & { status?: AttendanceRequestStatus }
    >({
      query: (params) => ({ url: "/attendance-requests", params }),
      transformResponse: (response: ApiList<AttendanceRequestRecord>) => response.data,
      providesTags: ["AttendanceRequests"],
    }),
    createAttendanceRequest: builder.mutation<
      AttendanceRequestRecord,
      AttendanceRequestInput
    >({
      query: (body) => ({ url: "/attendance-requests", method: "POST", body }),
      transformResponse: (response: ApiItem<AttendanceRequestRecord>) => response.data,
      invalidatesTags: ["AttendanceRequests"],
    }),
    reviewAttendanceRequest: builder.mutation<
      AttendanceRequestRecord,
      ReviewAttendanceRequestArgs
    >({
      query: ({ id, body }) => ({
        url: `/attendance-requests/${encodeURIComponent(id)}/review`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiItem<AttendanceRequestRecord>) => response.data,
      invalidatesTags: ["AttendanceRequests", "Attendance"],
    }),
    getTeamMembers: builder.query<TeamMember[], void>({
      query: () => "/team-members",
      transformResponse: (response: ApiList<TeamMember>) => {
        if (!response || !Array.isArray(response.data)) {
          throw new Error("Respons GET /team-members harus memiliki data berupa array.");
        }
        return response.data;
      },
      providesTags: ["TeamMembers"],
    }),
    getAttendance: builder.query<AttendanceRecord[], DateRange>({
      query: ({ from, to }) => ({
        url: "/attendance",
        params: { from, to },
      }),
      transformResponse: (response: ApiList<AttendanceRecord>) => {
        if (!response || !Array.isArray(response.data)) {
          throw new Error("Respons GET /attendance harus memiliki data berupa array.");
        }
        return response.data;
      },
      providesTags: ["Attendance"],
    }),
    getJobs: builder.query<JobRecord[], DateRange>({
      query: ({ from, to }) => ({
        url: "/jobs",
        params: { from, to },
      }),
      transformResponse: (response: ApiList<JobRecord>) => {
        if (!response || !Array.isArray(response.data)) {
          throw new Error("Respons GET /jobs harus memiliki data berupa array.");
        }
        return response.data;
      },
      providesTags: ["Jobs"],
    }),
    createAttendance: builder.mutation<AttendanceRecord, AttendanceInput>({
      query: (body) => ({ url: "/attendance", method: "POST", body }),
      transformResponse: (response: ApiItem<AttendanceRecord>) => response.data,
      invalidatesTags: ["Attendance"],
    }),
    updateAttendance: builder.mutation<AttendanceRecord, UpdateAttendanceArgs>({
      query: ({ id, body }) => ({
        url: `/attendance/${encodeURIComponent(id)}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiItem<AttendanceRecord>) => response.data,
      invalidatesTags: ["Attendance"],
    }),
    deleteAttendance: builder.mutation<void, string>({
      query: (id) => ({
        url: `/attendance/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Attendance"],
    }),
    createJob: builder.mutation<JobRecord, JobInput>({
      query: (body) => ({ url: "/jobs", method: "POST", body }),
      transformResponse: (response: ApiItem<JobRecord>) => response.data,
      invalidatesTags: ["Jobs"],
    }),
    updateJob: builder.mutation<JobRecord, UpdateJobArgs>({
      query: ({ id, body }) => ({
        url: `/jobs/${encodeURIComponent(id)}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiItem<JobRecord>) => response.data,
      invalidatesTags: ["Jobs"],
    }),
    deleteJob: builder.mutation<void, string>({
      query: (id) => ({
        url: `/jobs/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Jobs"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useGetAccountsQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useGetAttendanceRequestsQuery,
  useCreateAttendanceRequestMutation,
  useReviewAttendanceRequestMutation,
  useGetTeamMembersQuery,
  useGetAttendanceQuery,
  useGetJobsQuery,
  useCreateAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
} = teamApi;
