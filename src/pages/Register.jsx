import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/theme.css";
import "./Home.css";

const fieldStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #9A9280",
  borderRadius: 6,
  fontSize: 15,
  background: "#F6F1E4",
  color: "#2A2620",
  fontFamily: "inherit",
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontWeight: 600,
  fontSize: 14,
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    date_of_birth: "",
  });
  const [status, setStatus] = useState({
    loading: false,
    message: "",
    error: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: "", error: "" });

    try {
      const res = await api.post("/register", form);
      localStorage.setItem("donor_token", res.data.token);
      setStatus({ loading: false, message: res.data.message, error: "" });
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err) {
      const errors = err.response?.data?.errors;
      const firstError = errors
        ? Object.values(errors)[0][0]
        : "Something went wrong. Please try again.";
      setStatus({ loading: false, message: "", error: firstError });
    }
  };

  return (
    <div className="site">
      <div className="band-ink">
        <Navbar tone="dark" />
        <div className="section" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className="site-inner">
            <div className="site-eyebrow" style={{ color: "#AB1D2E" }}>
              Join the network
            </div>
            <h1 className="section-title" style={{ marginTop: 12 }}>
              Create your account
            </h1>
            <p
              className="about-teaser-text about-teaser-text--hero"
              style={{ marginTop: 12, maxWidth: 480 }}
            >
              Step 1 of 2. Register an account, then finish your donor
              profile in the next step.
            </p>
          </div>
        </div>
      </div>

      <div className="band-paper section">
        <div className="site-inner" style={{ maxWidth: 560 }}>
          {status.message && (
            <div
              style={{
                background: "rgba(47, 107, 79, 0.12)",
                border: "1px solid #2F6B4F",
                color: "#2F6B4F",
                padding: "12px 14px",
                borderRadius: 6,
                marginBottom: 20,
                fontSize: 15,
              }}
            >
              {status.message}
            </div>
          )}
          {status.error && (
            <div
              style={{
                background: "rgba(171, 29, 46, 0.1)",
                border: "1px solid #AB1D2E",
                color: "#AB1D2E",
                padding: "12px 14px",
                borderRadius: 6,
                marginBottom: 20,
                fontSize: 15,
              }}
            >
              {status.error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }}>
            <div>
              <label style={labelStyle} htmlFor="full_name">
                Full name
              </label>
              <input
                style={fieldStyle}
                id="full_name"
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div>
                <label style={labelStyle} htmlFor="email">
                  Email
                </label>
                <input
                  style={fieldStyle}
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label style={labelStyle} htmlFor="phone">
                  Phone number
                </label>
                <input
                  style={fieldStyle}
                  id="phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label style={labelStyle} htmlFor="date_of_birth">
                Date of birth
              </label>
              <input
                style={fieldStyle}
                id="date_of_birth"
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
                required
              />
              <div style={{ fontSize: 13, color: "#9A9280", marginTop: 4 }}>
                You must be 18 or older to register as a donor.
              </div>
            </div>

            <div>
              <label style={labelStyle} htmlFor="password">
                Password
              </label>
              <input
                style={fieldStyle}
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={status.loading}
              style={{ justifySelf: "start", marginTop: 8 }}
            >
              {status.loading ? "Creating account…" : "Continue"}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}