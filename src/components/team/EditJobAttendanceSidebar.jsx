import React, { useEffect, useMemo, useRef, useState } from "react";
import { RightInputSidebar } from "../layout/RightInputSidebar";
import {
  useCreateAttendanceMutation,
  useCreateJobMutation,
  useDeleteAttendanceMutation,
  useDeleteJobMutation,
  useUpdateAttendanceMutation,
  useUpdateJobMutation,
} from "../../services/teamApi";
import {
  findAttendanceRecord,
  getAttendanceExceptions,
  getAttendanceStatusLabel,
  normalizeAttendanceStatus,
} from "./attendanceUtils";

const shifts = [
  { value: "morning", label: "Pagi" },
  { value: "afternoon", label: "Siang" },
  { value: "night", label: "Malam" },
];

function getErrorMessage(error) {
  if (!error) return "Terjadi kesalahan. Silakan coba lagi.";
  const data = error.data;
  const status = typeof error.status === "number" ? ` (HTTP ${error.status})` : "";
  if (typeof data === "string") return `${data}${status}`;
  if (data && typeof data === "object") {
    const message = typeof data.error === "string" ? data.error : "";
    const details = Array.isArray(data.details)
      ? data.details
          .map((item) =>
            item && typeof item === "object"
              ? [item.path, item.message].filter(Boolean).join(": ")
              : "",
          )
          .filter(Boolean)
          .join("; ")
      : "";
    if (message || details) {
      return `${[message, details].filter(Boolean).join(" — ")}${status}`;
    }
  }
  return `${error.error || "Request gagal"}${status}`;
}

function initialAttendanceForm(date, record) {
  return {
    memberId: record ? String(record.member.id) : "",
    date: record?.date.slice(0, 10) || date,
    shift: record?.shift || "morning",
    status: record ? normalizeAttendanceStatus(record.status) : "",
  };
}

function initialJobForm(date, record) {
  return {
    title: record?.title || "",
    date: record?.date.slice(0, 10) || date,
    shift: record?.shift || "morning",
    priority: record?.priority || "normal",
    assigneeIds: record?.assignees.map((member) => String(member.id)) || [],
  };
}

function FormField({ label, children }) {
  return (
    <div className="form-group form-span-2">
      <label>{label}</label>
      {children}
    </div>
  );
}

export function EditJobAttendanceSidebar({
  isOpen,
  onClose,
  members,
  attendance,
  jobs,
  initialDate,
  canManageOperations = true,
}) {
  const [mode, setMode] = useState("list");
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [jobRecord, setJobRecord] = useState(null);
  const [attendanceForm, setAttendanceForm] = useState(() =>
    initialAttendanceForm(initialDate, null),
  );
  const [jobForm, setJobForm] = useState(() => initialJobForm(initialDate, null));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const cancelDeleteButtonRef = useRef(null);
  const [createAttendance] = useCreateAttendanceMutation();
  const [updateAttendance] = useUpdateAttendanceMutation();
  const [deleteAttendance] = useDeleteAttendanceMutation();
  const [createJob] = useCreateJobMutation();
  const [updateJob] = useUpdateJobMutation();
  const [deleteJob] = useDeleteJobMutation();

  const dayAttendance = useMemo(
    () =>
      getAttendanceExceptions(
        attendance.filter(
          (record) => record.date.slice(0, 10) === initialDate,
        ),
      ),
    [attendance, initialDate],
  );
  const dayJobs = useMemo(
    () => jobs.filter((job) => job.date.slice(0, 10) === initialDate),
    [jobs, initialDate],
  );

  useEffect(() => {
    if (!isOpen) return;
    setMode("list");
    setAttendanceRecord(null);
    setJobRecord(null);
    setErrorMessage("");
    setSuccessMessage("");
    setAttendanceForm(initialAttendanceForm(initialDate, null));
    setJobForm(initialJobForm(initialDate, null));
  }, [initialDate, isOpen]);

  useEffect(() => {
    if (!pendingDelete) return undefined;
    cancelDeleteButtonRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSaving) {
        setPendingDelete(null);
        setDeleteError("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pendingDelete, isSaving]);

  const startAttendanceForm = (record = null) => {
    setAttendanceRecord(record);
    setAttendanceForm(initialAttendanceForm(initialDate, record));
    setErrorMessage("");
    setSuccessMessage("");
    setMode("attendance");
  };

  const startJobForm = (record = null) => {
    setJobRecord(record);
    setJobForm(initialJobForm(initialDate, record));
    setErrorMessage("");
    setSuccessMessage("");
    setMode("job");
  };

  const returnToList = () => {
    setMode("list");
    setAttendanceRecord(null);
    setJobRecord(null);
    setErrorMessage("");
  };

  const handleAttendanceSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    try {
      const body = {
        memberId: Number(attendanceForm.memberId),
        date: attendanceForm.date,
        shift: attendanceForm.shift,
        status: attendanceForm.status,
      };
      const existingRecord =
        attendanceRecord ||
        findAttendanceRecord(attendance, {
          memberId: body.memberId,
          date: body.date,
          shift: body.shift,
        });
      if (existingRecord) {
        await updateAttendance({ id: existingRecord.id, body }).unwrap();
        setSuccessMessage("Absensi berhasil diperbarui.");
      } else {
        await createAttendance(body).unwrap();
        setSuccessMessage("Absensi berhasil dicatat.");
      }
      setMode("list");
      setAttendanceRecord(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleJobSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    try {
      const body = {
        title: jobForm.title.trim(),
        date: jobForm.date,
        shift: jobForm.shift,
        priority: jobForm.priority,
        assigneeIds: jobForm.assigneeIds.map(Number),
      };
      if (jobRecord) {
        await updateJob({ id: jobRecord.id, body }).unwrap();
        setSuccessMessage("Job berhasil diperbarui.");
      } else {
        await createJob(body).unwrap();
        setSuccessMessage("Job berhasil ditambahkan.");
      }
      setMode("list");
      setJobRecord(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setIsSaving(true);
    setDeleteError("");
    setSuccessMessage("");
    try {
      if (pendingDelete.type === "attendance") {
        await deleteAttendance(pendingDelete.record.id).unwrap();
        setSuccessMessage("Absensi berhasil dihapus.");
      } else {
        await deleteJob(pendingDelete.record.id).unwrap();
        setSuccessMessage("Job berhasil dihapus.");
      }
      setPendingDelete(null);
    } catch (error) {
      setDeleteError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const requestDelete = (type, record) => {
    setDeleteError("");
    setPendingDelete({ type, record });
  };

  return (
    <>
      <RightInputSidebar
        isOpen={isOpen}
        onClose={onClose}
        eyebrow="TEAM OPERATIONS"
        title={
          mode === "attendance"
            ? attendanceRecord
              ? "Edit absensi"
              : "Catat absensi"
            : mode === "job"
              ? jobRecord
                ? "Edit job"
                : "Tambah job"
              : "Kelola absensi & job"
        }
        subtitle={
          mode === "list"
            ? `Data absensi dan job tanggal ${initialDate}. Kehadiran normal tidak perlu dicatat.`
            : "Periksa kembali detail sebelum menyimpan perubahan."
        }
        headerActions={
          mode !== "list" && (
            <button
              type="button"
              className="sidebar-ghost-btn"
              onClick={returnToList}
              disabled={isSaving}
            >
              Kembali
            </button>
          )
        }
      >
        {errorMessage && (
          <p className="sidebar-error" role="alert">
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p className="crud-success-message" role="status">
            {successMessage}
          </p>
        )}

        {mode === "list" && (
        <div className="sidebar-form">
          <section className="sidebar-section crud-record-section">
            <div className="section-title-wrap">
              <span className="section-badge">Absensi</span>
              {canManageOperations && (
                <button
                  type="button"
                  className="secondary-button crud-add-button"
                  onClick={() => startAttendanceForm()}
                  disabled={!members.length || isSaving}
                >
                  + Catat absensi
                </button>
              )}
            </div>
            {dayAttendance.length ? (
              dayAttendance.map((record) => (
                <article className="crud-record" key={record.id}>
                  <div className="crud-record-copy">
                    <strong>{record.member.name}</strong>
                    <span>
                      {getAttendanceStatusLabel(record.status)} ·{" "}
                      {shifts.find((shift) => shift.value === record.shift)?.label ||
                        record.shift}
                    </span>
                  </div>
                  {canManageOperations && (
                    <div className="crud-record-actions">
                      <button
                        type="button"
                        className="crud-action-button"
                        onClick={() => startAttendanceForm(record)}
                        disabled={isSaving}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="crud-action-button danger"
                        onClick={() => requestDelete("attendance", record)}
                        disabled={isSaving}
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </article>
              ))
            ) : (
              <p className="crud-empty">
                Belum ada data absensi untuk tanggal ini.
              </p>
            )}
          </section>

          <section className="sidebar-section crud-record-section">
            <div className="section-title-wrap">
              <span className="section-badge accent">Job plotting</span>
              {canManageOperations && (
                <button
                  type="button"
                  className="secondary-button crud-add-button"
                  onClick={() => startJobForm()}
                  disabled={isSaving}
                >
                  + Tambah job
                </button>
              )}
            </div>
            {dayJobs.length ? (
              dayJobs.map((record) => (
                <article className="crud-record" key={record.id}>
                  <div className="crud-record-copy">
                    <strong>{record.title}</strong>
                    <span>
                      {record.assignees.map((member) => member.name).join(", ") ||
                        "Tanpa penanggung jawab"}{" "}
                      · {record.priority} ·{" "}
                      {shifts.find((shift) => shift.value === record.shift)?.label ||
                        record.shift}
                    </span>
                  </div>
                  {canManageOperations && (
                    <div className="crud-record-actions">
                      <button
                        type="button"
                        className="crud-action-button"
                        onClick={() => startJobForm(record)}
                        disabled={isSaving}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="crud-action-button danger"
                        onClick={() => requestDelete("job", record)}
                        disabled={isSaving}
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </article>
              ))
            ) : (
              <p className="crud-empty">Belum ada job pada tanggal ini.</p>
            )}
          </section>
        </div>
        )}

        {mode === "attendance" && (
        <form onSubmit={handleAttendanceSubmit} className="sidebar-form">
          <section className="sidebar-section">
            <div className="sidebar-form-grid">
              <FormField label="Pegawai">
                <select
                  value={attendanceForm.memberId}
                  onChange={(event) =>
                    setAttendanceForm((form) => ({
                      ...form,
                      memberId: event.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Pilih pegawai</option>
                  {members.map((member) => (
                    <option key={member.id} value={String(member.id)}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Tanggal">
                <input
                  type="date"
                  value={attendanceForm.date}
                  onChange={(event) =>
                    setAttendanceForm((form) => ({
                      ...form,
                      date: event.target.value,
                    }))
                  }
                  required
                />
              </FormField>
              <FormField label="Shift">
                <select
                  value={attendanceForm.shift}
                  onChange={(event) =>
                    setAttendanceForm((form) => ({
                      ...form,
                      shift: event.target.value,
                    }))
                  }
                  required
                >
                  {shifts.map((shift) => (
                    <option key={shift.value} value={shift.value}>
                      {shift.label}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Status absensi">
                <select
                  value={attendanceForm.status}
                  onChange={(event) =>
                    setAttendanceForm((form) => ({
                      ...form,
                      status: event.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Pilih status absensi</option>
                  <option value="late">Late</option>
                  <option value="leave">Leave</option>
                  <option value="early_departure">Early departure</option>
                </select>
              </FormField>
            </div>
          </section>
          <div className="sidebar-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={returnToList}
              disabled={isSaving}
            >
              Batal
            </button>
            <button type="submit" className="save-button" disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan absensi"}
            </button>
          </div>
        </form>
        )}

        {mode === "job" && (
        <form onSubmit={handleJobSubmit} className="sidebar-form">
          <section className="sidebar-section">
            <div className="sidebar-form-grid">
              <FormField label="Judul pekerjaan">
                <input
                  type="text"
                  value={jobForm.title}
                  onChange={(event) =>
                    setJobForm((form) => ({
                      ...form,
                      title: event.target.value,
                    }))
                  }
                  maxLength={255}
                  required
                />
              </FormField>
              <FormField label="Tanggal">
                <input
                  type="date"
                  value={jobForm.date}
                  onChange={(event) =>
                    setJobForm((form) => ({
                      ...form,
                      date: event.target.value,
                    }))
                  }
                  required
                />
              </FormField>
              <FormField label="Shift">
                <select
                  value={jobForm.shift}
                  onChange={(event) =>
                    setJobForm((form) => ({
                      ...form,
                      shift: event.target.value,
                    }))
                  }
                  required
                >
                  {shifts.map((shift) => (
                    <option key={shift.value} value={shift.value}>
                      {shift.label}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Prioritas">
                <select
                  value={jobForm.priority}
                  onChange={(event) =>
                    setJobForm((form) => ({
                      ...form,
                      priority: event.target.value,
                    }))
                  }
                  required
                >
                  <option value="low">Rendah</option>
                  <option value="normal">Normal</option>
                  <option value="high">Tinggi</option>
                  <option value="urgent">Darurat</option>
                </select>
              </FormField>
              <FormField label="Penanggung jawab">
                <select
                  multiple
                  size={Math.min(Math.max(members.length, 2), 5)}
                  value={jobForm.assigneeIds}
                  onChange={(event) =>
                    setJobForm((form) => ({
                      ...form,
                      assigneeIds: Array.from(
                        event.target.selectedOptions,
                        (option) => option.value,
                      ),
                    }))
                  }
                >
                  {members.map((member) => (
                    <option key={member.id} value={String(member.id)}>
                      {member.name}
                    </option>
                  ))}
                </select>
                <small className="crud-field-hint">
                  Pilih beberapa nama dengan Ctrl/Cmd. Kosongkan pilihan untuk
                  menghapus semua penanggung jawab.
                </small>
              </FormField>
            </div>
          </section>
          <div className="sidebar-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={returnToList}
              disabled={isSaving}
            >
              Batal
            </button>
            <button type="submit" className="save-button" disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan job"}
            </button>
          </div>
        </form>
        )}
      </RightInputSidebar>
      {pendingDelete && (
        <div
          className="confirm-dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSaving) {
              setPendingDelete(null);
              setDeleteError("");
            }
          }}
        >
          <section
            className="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            aria-describedby="confirm-delete-description"
          >
            <div className="confirm-dialog-icon" aria-hidden="true">
              !
            </div>
            <h2 id="confirm-delete-title">
              Hapus {pendingDelete.type === "attendance" ? "absensi" : "job"}?
            </h2>
            <p id="confirm-delete-description">
              {pendingDelete.type === "attendance"
                ? `Absensi ${pendingDelete.record.member.name} tanggal ${pendingDelete.record.date.slice(0, 10)}`
                : `Job "${pendingDelete.record.title}"`}{" "}
              akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            {deleteError && (
              <p className="confirm-dialog-error" role="alert">
                Gagal menghapus: {deleteError}
              </p>
            )}
            <div className="confirm-dialog-actions">
              <button
                ref={cancelDeleteButtonRef}
                type="button"
                className="secondary-button"
                onClick={() => {
                  setPendingDelete(null);
                  setDeleteError("");
                }}
                disabled={isSaving}
              >
                Batal
              </button>
              <button
                type="button"
                className="confirm-delete-button"
                onClick={handleConfirmDelete}
                disabled={isSaving}
              >
                {isSaving ? "Menghapus..." : "Ya, hapus"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
