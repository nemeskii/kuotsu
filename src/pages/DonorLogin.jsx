import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/theme.css";
import "./AdminLogin.css";

export default function DonorLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/donor/login", form);
      localStorage.setItem("donor_token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <span className="site-mark admin-login-mark">
          COMMUNITY<span>BLOOD</span>
        </span>

        <div className="site-eyebrow admin-login-eyebrow">Donor access</div>
        <h1 className="admin-login-heading">Donor login</h1>
        <p className="admin-login-sub">
          Sign in to view your donation history and log new donations.
        </p>

        {error && (
          <div className="admin-login-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
          <label className="admin-login-field">
            <span className="admin-login-label">Email</span>
            <input
              className="admin-login-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </label>

          <label className="admin-login-field">
            <span className="admin-login-label">Password</span>
            <input
              className="admin-login-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </label>

          <button
            className="btn btn-primary admin-login-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <Link to="/" className="admin-login-back">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}