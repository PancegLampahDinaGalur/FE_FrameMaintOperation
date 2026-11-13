import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AuthVisual } from "./AuthVisual";
import { useRegisterMutation } from "../../services/teamApi";
import "../../styles/login.css";
import "../../styles/register.css";

function getErrorMessage(error) {
  const data = error?.data;
  if (data && typeof data === "object" && typeof data.error === "string") {
    return data.error;
  }
  if (typeof data === "string") return data;
  return "Pendaftaran gagal. Periksa data dan koneksi, lalu coba lagi.";
}

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [register, { isLoading }] = useRegisterMutation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const form = event.currentTarget;
    setFormMessage("");
    setSuccessMessage("");

    const password = String(formData.get("password"));
    if (password !== formData.get("confirmPassword")) {
      setFormMessage("Konfirmasi kata sandi belum sama.");
      return;
    }

    try {
      const result = await register({
        username: String(formData.get("username")).trim(),
        password,
        memberId: Number(formData.get("memberId")),
      }).unwrap();
      setSuccessMessage(result.message);
      form.reset();
    } catch (error) {
      setFormMessage(getErrorMessage(error));
    }
  };

  return (
    <main className="register-page">
      <div className="register-layout">
        <AuthVisual />

        <section className="register-card" aria-labelledby="register-title">
          <div className="register-card-heading">
            <span className="register-card-kicker">GET STARTED</span>
            <h1 id="register-title">Create your account</h1>
            <p>Create an account to request access to the workspace.</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="register-field">
              <label htmlFor="register-username">Username</label>
              <input
                autoComplete="username"
                id="register-username"
                name="username"
                placeholder="Create a username"
                required
              />
            </div>

            <div className="register-field">
              <label htmlFor="register-member-id">Member ID / No. Reg</label>
              <input
                autoComplete="off"
                id="register-member-id"
                name="memberId"
                min="1"
                placeholder="Enter your member ID"
                required
                type="number"
              />
            </div>

            <div className="register-field">
              <label htmlFor="register-password">Password</label>
              <div className="register-password-input">
                <input
                  autoComplete="new-password"
                  id="register-password"
                  name="password"
                  placeholder="Enter your password"
                  minLength={12}
                  required
                  type={showPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="register-confirm-password">
                Confirm password
              </label>
              <input
                autoComplete="new-password"
                id="register-confirm-password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                minLength={12}
                required
                type={showPassword ? "text" : "password"}
              />
            </div>

            {formMessage && (
              <p className="register-message" role="alert">
                {formMessage}
              </p>
            )}

            {successMessage && (
              <p className="register-success" role="status">
                {successMessage}
              </p>
            )}

            <button className="register-submit" type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Create account"}
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <p className="register-note">
            Access level will be assigned by your administrator.
          </p>
          <Link className="register-back-button" to="/login">
            <span aria-hidden="true">←</span> Back to login
          </Link>
        </section>
      </div>

      <span className="register-copyright">
        © {new Date().getFullYear()} Frame Maintenance Operations
      </span>
    </main>
  );
}
