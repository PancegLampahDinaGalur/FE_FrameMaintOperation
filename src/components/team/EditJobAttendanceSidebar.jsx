import React, { useEffect, useState } from "react";
import { teamMembers } from "../../data/team/teamData";
import { RightInputSidebar } from "../layout/RightInputSidebar";

const createInitialFormData = () => ({
  member: "",
  assignedTo: "",
  date: "",
  jobTitle: "",
  attendance: "",
  attendanceShift: "",
  jobShift: "",
  priority: "normal",
  allMembersPresent: false,
});

function ShiftOptions() {
  return (
    <>
      <option value="">Pilih shift</option>
      <option value="day">Shift pagi</option>
      <option value="evening">Shift siang</option>
      <option value="night">Shift malam</option>
    </>
  );
}

function AttendanceSection({ formData, onChange, onAllMembersPresentChange }) {
  const isAllPresent = formData.allMembersPresent;

  return (
    <section className="sidebar-section">
      <div className="section-title-wrap">
        <span className="section-badge">Absensi</span>
        <h4>Input kehadiran</h4>
      </div>

      <label className="attendance-toggle">
        <span>
          <strong>Semua member hadir</strong>
          <small>Aktifkan untuk mencatat seluruh tim hadir</small>
        </span>
        <input
          type="checkbox"
          checked={isAllPresent}
          onChange={(event) => onAllMembersPresentChange(event.target.checked)}
        />
        <span className="attendance-toggle-track" aria-hidden="true" />
      </label>

      <div className="sidebar-form-grid">
        <div className="form-group form-span-2">
          <label htmlFor="edit-member">Pegawai / Tim</label>
          <select
            id="edit-member"
            value={formData.member}
            onChange={(event) => onChange("member", event.target.value)}
            required={!isAllPresent}
            disabled={isAllPresent}
          >
            <option value="">Pilih pegawai</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.initials}>
                {member.name} · {member.role}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="edit-date">Tanggal</label>
          <input
            id="edit-date"
            type="date"
            value={formData.date}
            onChange={(event) => onChange("date", event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-attendance-shift">Shift absensi</label>
          <select
            id="edit-attendance-shift"
            value={formData.attendanceShift}
            onChange={(event) => onChange("attendanceShift", event.target.value)}
            required
          >
            <ShiftOptions />
          </select>
        </div>

        <div className="form-group form-span-2">
          <label htmlFor="edit-attendance">Status kehadiran</label>
          <select
            id="edit-attendance"
            value={formData.attendance}
            onChange={(event) => onChange("attendance", event.target.value)}
            required={!isAllPresent}
            disabled={isAllPresent}
          >
            <option value="">Pilih status kehadiran</option>
            <option value="present">Hadir</option>
            <option value="late">Terlambat</option>
            <option value="absent">Tidak hadir</option>
          </select>
        </div>
      </div>
    </section>
  );
}

function JobPlotSection({ formData, onChange }) {
  return (
    <section className="sidebar-section">
      <div className="section-title-wrap">
        <span className="section-badge accent">Job plotting</span>
        <h4>Detail pekerjaan</h4>
      </div>

      <div className="sidebar-form-grid">
        <div className="form-group form-span-2">
          <label htmlFor="edit-assigned-to">Assign ke</label>
          <select
            id="edit-assigned-to"
            value={formData.assignedTo}
            onChange={(event) => onChange("assignedTo", event.target.value)}
            required
          >
            <option value="">Pilih penanggung jawab job</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.initials}>
                {member.name} · {member.role}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group form-span-2">
          <label htmlFor="edit-job-title">Judul pekerjaan</label>
          <input
            id="edit-job-title"
            type="text"
            value={formData.jobTitle}
            onChange={(event) => onChange("jobTitle", event.target.value)}
            placeholder="Contoh: Pemeriksaan panel listrik"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-job-shift">Shift pekerjaan</label>
          <select
            id="edit-job-shift"
            value={formData.jobShift}
            onChange={(event) => onChange("jobShift", event.target.value)}
            required
          >
            <ShiftOptions />
          </select>
        </div>

        <div className="form-group form-span-2">
          <label htmlFor="edit-status">Prioritas</label>
          <select
            id="edit-status"
            value={formData.priority}
            onChange={(event) => onChange("priority", event.target.value)}
            required
          >
            <option value="low">Rendah</option>
            <option value="normal">Normal</option>
            <option value="high">Tinggi</option>
            <option value="urgent">Darurat</option>
          </select>
        </div>
      </div>
    </section>
  );
}

export function EditJobAttendanceSidebar({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState(createInitialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [completedRequestKeys, setCompletedRequestKeys] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    setFormData(createInitialFormData());
    setSaveError("");
    setCompletedRequestKeys([]);
  }, [isOpen]);

  const handleChange = (field, value) => {
    setFormData((currentData) => ({ ...currentData, [field]: value }));
    setSaveError("");
  };

  const handleAllMembersPresentChange = (isChecked) => {
    setFormData((currentData) => ({
      ...currentData,
      allMembersPresent: isChecked,
      member: "",
      attendance: isChecked ? "present" : "",
    }));
    setSaveError("");
  };

  const handleReset = () => {
    setFormData(createInitialFormData());
    setSaveError("");
    setCompletedRequestKeys([]);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveError("");

    try {
      await onSave(formData, completedRequestKeys);
      onClose();
    } catch (error) {
      const message =
        error?.error ||
        error?.data?.message ||
        (error instanceof Error ? error.message : "Data gagal disimpan. Silakan coba lagi.");
      setSaveError(message);

      if (Array.isArray(error?.data?.completedRequestKeys)) {
        setCompletedRequestKeys(error.data.completedRequestKeys);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <RightInputSidebar
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="TEAM OPERATIONS"
      title="Edit Attendance & Job Plot"
      subtitle="Isi detail tugas dan status kehadiran agar jelas pekerjaan siapa dan untuk tanggal berapa."
      headerActions={
        <button type="button" className="sidebar-ghost-btn" onClick={handleReset}>
          Reset
        </button>
      }
    >
      <form onSubmit={handleSave} className="sidebar-form">
        <AttendanceSection
          formData={formData}
          onChange={handleChange}
          onAllMembersPresentChange={handleAllMembersPresentChange}
        />
        <JobPlotSection formData={formData} onChange={handleChange} />

        {saveError && (
          <p className="sidebar-error" role="alert">
            {saveError}
          </p>
        )}

        <div className="sidebar-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
            disabled={isSaving}
          >
            Batal
          </button>
          <button type="submit" className="save-button" disabled={isSaving}>
            {isSaving ? "Menyimpan..." : "Simpan perubahan"}
          </button>
        </div>
      </form>
    </RightInputSidebar>
  );
}
