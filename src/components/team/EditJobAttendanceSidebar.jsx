import React, { useEffect, useState } from "react";
import { teamMembers } from "../../data/team/teamData";

const formatDateInput = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function EditJobAttendanceSidebar({ isOpen, onClose, onSave, defaultDate = new Date() }) {
  const [formData, setFormData] = useState({
    member: teamMembers[0]?.initials || "",
    assignedTo: teamMembers[0]?.initials || "",
    date: formatDateInput(defaultDate),
    jobTitle: "",
    attendance: "present",
    shift: "day",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        member: prev.member || teamMembers[0]?.initials || "",
        date: formatDateInput(defaultDate),
      }));
    }
  }, [isOpen, defaultDate]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const selectedMember = teamMembers.find((member) => member.initials === formData.member);

  const handleSave = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={`sidebar-backdrop ${isOpen ? "is-visible" : ""}`} onClick={onClose} />
      <aside className={`edit-job-sidebar ${isOpen ? "is-open" : ""}`}>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Tutup">
          ✕
        </button>
        <div className="sidebar-content">
          <div className="sidebar-header-row">
            <div>
              <p className="sidebar-kicker">TEAM OPERATIONS</p>
              <h3>Edit Attendance & Job Plot</h3>
            </div>
            <button
              type="button"
              className="sidebar-ghost-btn"
              onClick={() =>
                setFormData({
                  member: teamMembers[0]?.initials || "",
                  assignedTo: teamMembers[0]?.initials || "",
                  date: formatDateInput(defaultDate),
                  jobTitle: "",
                  attendance: "present",
                  shift: "day",
                  notes: "",
                })
              }
            >
              Reset
            </button>
          </div>

          <p className="sidebar-subtitle">Isi detail tugas dan status kehadiran agar jelas pekerjaan siapa dan untuk tanggal berapa.</p>

          <div className="sidebar-assign-preview">
            <span>Penanggung jawab</span>
            <strong>{selectedMember ? `${selectedMember.name} · ${selectedMember.role}` : "Belum memilih pegawai"}</strong>
          </div>

          <form onSubmit={handleSave} className="sidebar-form">
            <section className="sidebar-section">
              <div className="section-title-wrap">
                <span className="section-badge">Absensi</span>
                <h4>Input kehadiran</h4>
              </div>

              <div className="sidebar-form-grid">
                <div className="form-group form-span-2">
                  <label htmlFor="edit-member">Pegawai / Tim</label>
                  <select id="edit-member" value={formData.member} onChange={(e) => handleChange("member", e.target.value)} required>
                    <option value="">Pilih pegawai</option>
                    {teamMembers.map((m) => (
                      <option key={m.initials} value={m.initials}>
                        {m.name} · {m.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-date">Tanggal</label>
                  <input id="edit-date" type="date" value={formData.date} onChange={(e) => handleChange("date", e.target.value)} required />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-shift">Shift</label>
                  <select id="edit-shift" value={formData.shift} onChange={(e) => handleChange("shift", e.target.value)}>
                    <option value="day">Shift pagi</option>
                    <option value="evening">Shift siang</option>
                    <option value="night">Shift malam</option>
                  </select>
                </div>

                <div className="form-group form-span-2">
                  <label htmlFor="edit-attendance">Status kehadiran</label>
                  <select id="edit-attendance" value={formData.attendance} onChange={(e) => handleChange("attendance", e.target.value)}>
                    <option value="present">Hadir</option>
                    <option value="late">Terlambat</option>
                    <option value="absent">Tidak hadir</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="sidebar-section">
              <div className="section-title-wrap">
                <span className="section-badge accent">Job plotting</span>
                <h4>Detail pekerjaan</h4>
              </div>

              <div className="sidebar-form-grid">
                <div className="form-group form-span-2">
                  <label htmlFor="edit-assigned-to">Assign ke</label>
                  <select id="edit-assigned-to" value={formData.assignedTo} onChange={(e) => handleChange("assignedTo", e.target.value)} required>
                    <option value="">Pilih penanggung jawab job</option>
                    {teamMembers.map((m) => (
                      <option key={m.initials} value={m.initials}>
                        {m.name} · {m.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group form-span-2">
                  <label htmlFor="edit-job-title">Judul pekerjaan</label>
                  <input id="edit-job-title" type="text" value={formData.jobTitle} onChange={(e) => handleChange("jobTitle", e.target.value)} placeholder="Contoh: Pemeriksaan panel listrik" required />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-status">Prioritas</label>
                  <select id="edit-status" defaultValue="normal">
                    <option value="normal">Normal</option>
                    <option value="medium">Menengah</option>
                    <option value="urgent">Darurat</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-location">Lokasi</label>
                  <input id="edit-location" type="text" placeholder="Contoh: Area produksi 2" />
                </div>

                <div className="form-group form-span-2">
                  <label htmlFor="edit-notes">Catatan / detail pekerjaan</label>
                  <textarea id="edit-notes" value={formData.notes} onChange={(e) => handleChange("notes", e.target.value)} rows={4} placeholder="Contoh: cek kondisi kabel, periksa suhu, dan lakukan pemeliharaan awal." />
                </div>
              </div>
            </section>

            <div className="sidebar-actions">
              <button type="button" className="secondary-button" onClick={onClose}>
                Batal
              </button>
              <button type="submit" className="save-button">
                Simpan perubahan
              </button>
            </div>
          </form>
        </div>
      </aside>
    </>
  );
}
