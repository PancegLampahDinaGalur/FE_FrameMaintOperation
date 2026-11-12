import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { teamMembers } from "../data/team/teamData";

const apiShift = {
  day: "morning",
  evening: "afternoon",
  night: "night",
};

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

function createAttendanceRequests(formData) {
  const attendanceMembers = formData.allMembersPresent
    ? teamMembers
    : [teamMembers.find((member) => member.initials === formData.member)].filter(Boolean);

  return attendanceMembers.map((member) => ({
    label: `Absensi ${member.name}`,
    path: "/attendance",
    payload: {
      memberId: member.id,
      date: formData.date,
      shift: apiShift[formData.attendanceShift],
      status: formData.allMembersPresent ? "present" : formData.attendance,
    },
  }));
}

function createJobRequest(formData) {
  const assignedMember = teamMembers.find((member) => member.initials === formData.assignedTo);

  return {
    label: "Job plotting",
    path: "/jobs",
    payload: {
      date: formData.date,
      shift: apiShift[formData.jobShift],
      title: formData.jobTitle.trim(),
      assigneeIds: assignedMember ? [assignedMember.id] : [],
      priority: formData.priority,
    },
  };
}

function getSaveRequests(formData) {
  return [
    ...createAttendanceRequests(formData),
    createJobRequest(formData),
  ];
}

function getRequestKey(request) {
  return JSON.stringify([request.path, request.payload]);
}

function getRequestError(request, error) {
  const status = error?.status ? ` (HTTP ${error.status})` : "";
  const detail =
    typeof error?.data === "string"
      ? error.data
      : error?.data?.message || error?.data?.error || error?.error || "";

  return `${request.label}${status}${detail ? `: ${detail}` : ""}`;
}

async function submitRequests(requests, queryApi, extraOptions, baseQuery) {
  return Promise.all(
    requests.map(async (request) => ({
      request,
      result: await baseQuery(
        {
          url: request.path,
          method: "POST",
          body: request.payload,
        },
        queryApi,
        extraOptions,
      ),
    })),
  );
}

function collectRequestResults(results, completedKeys) {
  const completedLabels = [];
  const failures = [];

  results.forEach(({ request, result }) => {
    if (result.error) {
      failures.push(getRequestError(request, result.error));
      return;
    }

    completedLabels.push(request.label);
    completedKeys.add(getRequestKey(request));
  });

  return { completedLabels, failures };
}

function createSaveError(failures, completedLabels, completedKeys) {
  const partialSuccess = completedLabels.length
    ? ` Berhasil tersimpan: ${completedLabels.join(", ")}.`
    : "";
  const hasAttendanceConflict = failures.some((failure) =>
    failure.includes("HTTP 409"),
  );
  const conflictHint = hasAttendanceConflict
    ? " HTTP 409 berarti data attendance untuk anggota, tanggal, dan shift tersebut sudah ada; backend belum menyediakan update untuk record itu."
    : "";

  return {
    status: "CUSTOM_ERROR",
    error: `${failures.join("\n")}${partialSuccess}${conflictHint} Periksa data atau koneksi backend sebelum mencoba lagi.`,
    data: { completedRequestKeys: [...completedKeys] },
  };
}

export const teamApi = createApi({
  reducerPath: "teamApi",
  baseQuery: fetchBaseQuery({ baseUrl: apiBaseUrl }),
  endpoints: (builder) => ({
    saveTeamOperations: builder.mutation({
      async queryFn({ formData, completedRequestKeys = [] }, queryApi, extraOptions, baseQuery) {
        const completedKeys = new Set(completedRequestKeys);
        const requests = getSaveRequests(formData);
        const pendingRequests = requests.filter(
          (request) => !completedKeys.has(getRequestKey(request)),
        );
        const results = await submitRequests(
          pendingRequests,
          queryApi,
          extraOptions,
          baseQuery,
        );
        const { completedLabels, failures } = collectRequestResults(
          results,
          completedKeys,
        );

        if (failures.length > 0) {
          return {
            error: createSaveError(failures, completedLabels, completedKeys),
          };
        }

        return { data: { completedLabels } };
      },
    }),
  }),
});

export const { useSaveTeamOperationsMutation } = teamApi;
