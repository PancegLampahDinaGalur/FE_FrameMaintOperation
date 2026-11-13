import React, { useState } from "react";
import {
  useCreateAccountMutation,
  useGetAccountsQuery,
  useUpdateAccountMutation,
} from "../../services/teamApi";
import "../../styles/auth-workflows.css";

const roles = [
  { value: "member", label: "Member" },
  { value: "team_leader", label: "Team leader" },
  { value: "group_leader", label: "Group leader" },
  { value: "sysadmin", label: "Sysadmin" },
];

function getErrorMessage(error) {
  const data = error?.data;
  if (data && typeof data === "object" && typeof data.error === "string") {
    return data.error;
  }
  if (typeof data === "string") return data;
  return "Request gagal. Periksa koneksi lalu coba lagi.";
}

export function AdminAccountsPage() {
  const [formMessage, setFormMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedRoles, setSelectedRoles] = useState({});
  const [selectedUsernames, setSelectedUsernames] = useState({});
  const [passwords, setPasswords] = useState({});
  const [createRole, setCreateRole] = useState("member");
  const { data: accounts = [], isLoading, error, refetch } = useGetAccountsQuery();
  const [createAccount, createState] = useCreateAccountMutation();
  const [updateAccount, updateState] = useUpdateAccountMutation();

  const handleCreate = async (event) => {
    event.preventDefault();
    setFormMessage("");
    setSuccessMessage("");
    const formData = new FormData(event.currentTarget);
    const form = event.currentTarget;
    const role = String(formData.get("role"));
    const memberIdText = String(formData.get("memberId")).trim();
    const password = String(formData.get("password"));

    try {
      await createAccount({
        username: String(formData.get("username")).trim(),
        password,
        role,
        memberId: role === "sysadmin" ? null : Number(memberIdText),
        isActive: true,
      }).unwrap();
      form.reset();
      setSuccessMessage("Akun berhasil dibuat.");
    } catch (requestError) {
      setFormMessage(getErrorMessage(requestError));
    }
  };

  const handleAccountUpdate = async (account, body) => {
    setFormMessage("");
    setSuccessMessage("");
    try {
      await updateAccount({ id: account.id, body }).unwrap();
      setSuccessMessage(`Akun ${account.username} berhasil diperbarui.`);
    } catch (requestError) {
      setFormMessage(getErrorMessage(requestError));
    }
  };

  return (
    <section className="content auth-workflow-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SYSTEM · SYSADMIN</p>
          <h1>Manajemen akun</h1>
          <p className="heading-subtitle">
            Buat akun, atur role, dan verifikasi pendaftar member.
          </p>
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

      <form className="auth-workflow-card request-form" onSubmit={handleCreate}>
        <h2>Buat akun</h2>
        <div className="auth-workflow-form-grid">
          <label>
            Username
            <input name="username" maxLength={80} required />
          </label>
          <label>
            Password (minimal 12 karakter)
            <input name="password" minLength={12} required type="password" />
          </label>
          <label>
            Role
            <select
              name="role"
              value={createRole}
              onChange={(event) => setCreateRole(event.target.value)}
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>
          {createRole !== "sysadmin" && (
            <label>
              Member ID
              <input name="memberId" min="1" required type="number" />
            </label>
          )}
        </div>
        <button
          className="primary-button"
          type="submit"
          disabled={createState.isLoading}
        >
          {createState.isLoading ? "Membuat..." : "Buat akun"}
        </button>
      </form>

      <section className="auth-workflow-card">
        <div className="auth-workflow-list-heading">
          <h2>Akun dan pendaftar</h2>
          <button type="button" className="text-button" onClick={refetch}>
            Refresh
          </button>
        </div>
        {error && (
          <p className="auth-workflow-error" role="alert">
            {getErrorMessage(error)}
          </p>
        )}
        {isLoading ? (
          <p>Memuat akun...</p>
        ) : accounts.length ? (
          <div className="auth-account-list">
            {accounts.map((account) => {
              const isPending =
                !account.is_active && account.pending_member_id !== null;
              const selectedRole = selectedRoles[account.id] || account.role;
              return (
                <article className="auth-account-item" key={account.id}>
                  <div className="auth-account-details">
                    <strong>{account.username}</strong>
                    <span>
                      {account.pending_member
                        ? `Pendaftar: ${account.pending_member.name} (ID ${account.pending_member.id})`
                        : account.members
                          ? `${account.members.name} (ID ${account.members.id})`
                          : "Belum terhubung ke member"}
                    </span>
                    <span>
                      {account.role} · {account.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                    <label className="auth-account-edit-field">
                      Username
                      <input
                        aria-label={`Username untuk ${account.username}`}
                        value={selectedUsernames[account.id] ?? account.username}
                        onChange={(event) =>
                          setSelectedUsernames((current) => ({
                            ...current,
                            [account.id]: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="auth-account-edit-field">
                      Password baru (opsional, minimal 12 karakter)
                      <input
                        aria-label={`Password baru untuk ${account.username}`}
                        minLength={12}
                        type="password"
                        value={passwords[account.id] || ""}
                        onChange={(event) =>
                          setPasswords((current) => ({
                            ...current,
                            [account.id]: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                  <div className="auth-account-actions">
                    <select
                      aria-label={`Role untuk ${account.username}`}
                      value={selectedRole}
                      onChange={(event) =>
                        setSelectedRoles((current) => ({
                          ...current,
                          [account.id]: event.target.value,
                        }))
                      }
                    >
                      {roles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="primary-button"
                      disabled={updateState.isLoading}
                      onClick={() =>
                        handleAccountUpdate(account, {
                          username:
                            selectedUsernames[account.id] ?? account.username,
                          role: selectedRole,
                          ...(passwords[account.id]
                            ? { password: passwords[account.id] }
                            : {}),
                        })
                      }
                    >
                      Simpan akun
                    </button>
                    {isPending ? (
                      <button
                        type="button"
                        className="primary-button"
                        disabled={updateState.isLoading}
                        onClick={() =>
                          handleAccountUpdate(account, {
                            memberId: account.pending_member_id,
                            isActive: true,
                          })
                        }
                      >
                        Verifikasi member
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={updateState.isLoading}
                        onClick={() =>
                          handleAccountUpdate(account, {
                            isActive: !account.is_active,
                          })
                        }
                      >
                        {account.is_active ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="auth-workflow-empty">Belum ada akun.</p>
        )}
      </section>
    </section>
  );
}
