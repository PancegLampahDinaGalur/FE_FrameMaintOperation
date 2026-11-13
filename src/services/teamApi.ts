import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

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

interface UpdateAttendanceArgs {
  id: string;
  body: AttendancePatch;
}

interface UpdateJobArgs {
  id: string;
  body: Partial<JobInput>;
}

export const teamApi = createApi({
  reducerPath: "teamApi",
  baseQuery: fetchBaseQuery({
    baseUrl: (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(
      /\/+$/,
      "",
    ),
  }),
  tagTypes: ["TeamMembers", "Attendance", "Jobs"],
  endpoints: (builder) => ({
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
