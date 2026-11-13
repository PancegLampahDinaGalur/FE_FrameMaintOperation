import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { AuthVisual } from "./AuthVisual";
import { setCredentials } from "../../store/authSlice";
import { useLoginMutation } from "../../services/teamApi";
import "../../styles/login.css";

function getErrorMessage(error) {
  const data = error?.data;
  if (data && typeof data === "object" && typeof data.error === "string") {
    return data.error;
  }
  if (typeof data === "string") return data;
  return "Login gagal. Periksa koneksi dan data akun, lalu coba lagi.";
}

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormMessage("");
    const formData = new FormData(event.currentTarget);

    try {
      const result = await login({
        username: String(formData.get("identity")).trim(),
        password: String(formData.get("password")),
      }).unwrap();
      dispatch(
        setCredentials({
          accessToken: result.accessToken,
          rememberMe: formData.get("remember") === "on",
        }),
      );
      navigate("/");
    } catch (error) {
      setFormMessage(getErrorMessage(error));
    }
  };

  return (
    <main className="login-page">
      <div className="login-layout">
        <AuthVisual />

        <section className="login-card" aria-labelledby="login-title">
          <div className="login-card-heading">
            <span className="login-card-kicker">WELCOME BACK</span>
            <h2 id="login-title">Sign in to your account</h2>
            <p>
              Enter your account details to continue to the workspace.
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="login-identity">Username</label>
              <input
                autoComplete="username"
                id="login-identity"
                name="identity"
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="login-field">
              <div className="login-password-label">
                <label htmlFor="login-password">Password</label>
              </div>
              <div className="login-password-input">
                <input
                  autoComplete="current-password"
                  id="login-password"
                  name="password"
                  placeholder="Enter your password"
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

            <label className="login-remember">
              <input type="checkbox" name="remember" />
              <span>Remember me</span>
            </label>

            {formMessage && (
              <p className="login-message" role="status">
                {formMessage}
              </p>
            )}

            <button className="login-submit" type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <p className="login-help login-mode-switch">
            Don&apos;t have an account?
            <Link to="/register">Create account</Link>
          </p>
          <div className="login-card-footer">
            <span>FRAME MAINTENANCE OPERATIONS</span>
            <span>SECURE WORKSPACE</span>
          </div>
        </section>
      </div>

      <span className="login-copyright">
        © {new Date().getFullYear()} Frame Maintenance Operations
      </span>
    </main>
  );
}
