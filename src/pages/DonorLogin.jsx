import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/theme.css";
import "./DonorLogin.css";

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
    <div className="donor-login-page">
      <div className="donor-login-card">
        <span className="site-mark donor-login-mark">
          COMMUNITY<span>BLOOD</span>
        </span>

        <div className="site-eyebrow donor-login-eyebrow">Donor access</div>
        <h1 className="donor-login-heading">Donor login</h1>
        <p className="donor-login-sub">
          Sign in to view your donation history and log new donations.
        </p>

        {error && (
          <div className="donor-login-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="donor-login-form" noValidate>
          <label className="donor-login-field">
            <span className="donor-login-label">Email</span>
            <input
              className="donor-login-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </label>

          <label className="donor-login-field">
            <span className="donor-login-label">Password</span>
            <input
              className="donor-login-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </label>

          <button
            className="btn btn-primary donor-login-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <Link
          to="/register"
          className="btn btn-ghost-light donor-login-register"
        >
          Register
        </Link>

        <Link to="/" className="donor-login-back">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
