import React, { useMemo, useState } from "react";
import {
  useCreateAttendanceRequestMutation,
  useGetAttendanceRequestsQuery,
  useReviewAttendanceRequestMutation,
} from "../../services/teamApi";
import "../../styles/auth-workflows.css";

const shifts = [
  { value: "morning", label: "Pagi" },
  { value: "afternoon", label: "Siang" },
  { value: "night", label: "Malam" },
];
const requestTypes = [
  { value: "leave", label: "Leave" },
  { value: "late", label: "Late" },
  { value: "early_departure", label: "Early departure" },
];

function getErrorMessage(error) {
  const data = error?.data;
  if (data && typeof data === "object" && typeof data.error === "string") {
    return data.error;
  }
  if (typeof data === "string") return data;
  return "Request gagal. Periksa koneksi lalu coba lagi.";
}

function formatStatus(status) {
  return { pending: "Menunggu", approved: "Disetujui", rejected: "Ditolak" }[
    status
  ];
}

export function AttendanceRequestsPage({ user }) {
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const filters = useMemo(
    () => ({
      ...(status ? { status } : {}),
      ...(from && to ? { from, to } : {}),
    }),
    [from, status, to],
  );
  const {
    data: requests = [],
    isLoading,
    error,
    refetch,
  } = useGetAttendanceRequestsQuery(filters);
  const [createRequest, createState] = useCreateAttendanceRequestMutation();
  const [reviewRequest, reviewState] = useReviewAttendanceRequestMutation();
  const canSubmit = user.memberId !== null && user.role !== "sysadmin";
  const canReview = [
    "team_leader",
    "group_leader",
    "sysadmin",
  ].includes(user.role);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormMessage("");
    setSuccessMessage("");
    const formData = new FormData(event.currentTarget);
    const form = event.currentTarget;
    try {
      await createRequest({
        date: String(formData.get("date")),
        shift: String(formData.get("shift")),
        requestType: String(formData.get("requestType")),
        reason: String(formData.get("reason")).trim(),
      }).unwrap();
      form.reset();
      setSuccessMessage("Pengajuan absensi berhasil dikirim.");
    } catch (requestError) {
      setFormMessage(getErrorMessage(requestError));
    }
  };

  const handleReview = async (id, decision) => {
    setFormMessage("");
    setSuccessMessage("");
    try {
      await reviewRequest({ id, body: { decision } }).unwrap();
      setSuccessMessage(
        decision === "approved"
          ? "Pengajuan disetujui dan absensi resmi diperbarui."
          : "Pengajuan ditolak.",
      );
    } catch (requestError) {
      setFormMessage(getErrorMessage(requestError));
    }
  };

  return (
    <section className="content auth-workflow-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">ATTENDANCE</p>
          <h1>Pengajuan absensi</h1>
          <p className="heading-subtitle">
            {canReview
              ? "Tinjau pengajuan dan setujui agar absensi resmi diperbarui."
              : "Ajukan Leave, Late, atau Early departure untuk akun Anda."}
          </p>
        </div>
      </div>

      {canSubmit && (
        <form className="auth-workflow-card request-form" onSubmit={handleSubmit}>
          <h2>Buat pengajuan</h2>
          <div className="auth-workflow-form-grid">
            <label>
              Tanggal
              <input name="date" type="date" required />
            </label>
            <label>
              Shift
              <select name="shift" defaultValue="morning" required>
                {shifts.map((shift) => (
                  <option value={shift.value} key={shift.value}>
                    {shift.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Jenis pengajuan
              <select name="requestType" defaultValue="leave" required>
                {requestTypes.map((type) => (
                  <option value={type.value} key={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="auth-workflow-span">
              Alasan
              <textarea name="reason" minLength={3} maxLength={2000} required />
            </label>
          </div>
          <button
            className="primary-button"
            type="submit"
            disabled={createState.isLoading}
          >
            {createState.isLoading ? "Mengirim..." : "Kirim pengajuan"}
          </button>
        </form>
      )}

      <section className="auth-workflow-card">
        <div className="auth-workflow-list-heading">
          <h2>{canReview ? "Daftar pengajuan" : "Pengajuan saya"}</h2>
          <div className="auth-workflow-filters">
            <select
              aria-label="Filter status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">Semua status</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </select>
            <input
              aria-label="Dari tanggal"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
            <input
              aria-label="Sampai tanggal"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>
        </div>

        {formMessage && (
          <p className="auth-workflow-error" role="alert">
            {formMessage}
          </p>
        )}
        {successMessage && (
          <p className="auth-workflow-success" role="status">
            {successMessage}
          </p>
        )}
        {error && (
          <p className="auth-workflow-error" role="alert">
            {getErrorMessage(error)}{" "}
            <button type="button" className="text-button" onClick={refetch}>
              Coba lagi
            </button>
          </p>
        )}
        {isLoading ? (
          <p>Memuat pengajuan...</p>
        ) : requests.length ? (
          <div className="auth-request-list">
            {requests.map((request) => (
              <article className="auth-request-item" key={request.id}>
                <div>
                  <div className="auth-request-title">
                    <strong>{request.member.name}</strong>
                    <span className={`auth-status is-${request.status}`}>
                      {formatStatus(request.status)}
                    </span>
                  </div>
                  <p>
                    {request.date} ·{" "}
                    {shifts.find((shift) => shift.value === request.shift)?.label} ·{" "}
                    {requestTypes.find(
                      (type) => type.value === request.requestType,
                    )?.label}
                  </p>
                  <p>{request.reason}</p>
                  {request.reviewNote && (
                    <p className="auth-review-note">
                      Catatan reviewer: {request.reviewNote}
                    </p>
                  )}
                </div>
                {canReview && request.status === "pending" && (
                  <div className="auth-review-actions">
                    <button
                      type="button"
                      className="primary-button"
                      disabled={reviewState.isLoading}
                      onClick={() => handleReview(request.id, "approved")}
                    >
                      Setujui
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={reviewState.isLoading}
                      onClick={() => handleReview(request.id, "rejected")}
                    >
                      Tolak
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="auth-workflow-empty">Belum ada pengajuan absensi.</p>
        )}
      </section>
    </section>
  );
}
