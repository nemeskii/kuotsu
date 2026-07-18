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

// Donor must be at least 18 years old; cap the earliest allowed year too.
const today = new Date();
const MAX_DOB = new Date(
  today.getFullYear() - 18,
  today.getMonth(),
  today.getDate(),
)
  .toISOString()
  .split("T")[0];
const MIN_DOB = "1900-01-01";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    date_of_birth: "",
    government_id: "",
    password_confirmation: "",
  });
  const [govIdFile, setGovIdFile] = useState(null);
  const [status, setStatus] = useState({
    loading: false,
    message: "",
    error: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "government_id") {
      // digits only, capped at 12
      const digitsOnly = value.replace(/\D/g, "").slice(0, 12);
      setForm({ ...form, government_id: digitsOnly });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    setGovIdFile(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.password_confirmation) {
      setStatus({
        loading: false,
        message: "",
        error: "Passwords do not match.",
      });
      return;
    }
    if (form.government_id.length !== 12) {
      setStatus({
        loading: false,
        message: "",
        error: "Government ID must be exactly 12 digits.",
      });
      return;
    }
    if (!govIdFile) {
      setStatus({
        loading: false,
        message: "",
        error: "Please upload a copy of your government ID.",
      });
      return;
    }

    setStatus({ loading: true, message: "", error: "" });

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) =>
        payload.append(key, value),
      );
      payload.append("government_id_document", govIdFile);

      const res = await api.post("/register", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
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
              Step 1 of 2. Register an account, then finish your donor profile
              in the next step.
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

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 18,
              }}
            >
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
                min={MIN_DOB}
                max={MAX_DOB}
                required
              />
              <div style={{ fontSize: 13, color: "#9A9280", marginTop: 4 }}>
                You must be 18 or older to register as a donor.
              </div>
            </div>

            <div>
              <label style={labelStyle} htmlFor="government_id">
                Government ID number
              </label>
              <input
                style={fieldStyle}
                id="government_id"
                type="text"
                name="government_id"
                inputMode="numeric"
                autoComplete="off"
                placeholder="12-digit ID number"
                value={form.government_id}
                onChange={handleChange}
                minLength={12}
                maxLength={12}
                required
              />
              <div style={{ fontSize: 13, color: "#9A9280", marginTop: 4 }}>
                {form.government_id.length}/12 digits entered
              </div>
            </div>

            <div>
              <label style={labelStyle} htmlFor="government_id_document">
                Upload government ID (front side)
              </label>
              <input
                style={fieldStyle}
                id="government_id_document"
                type="file"
                name="government_id_document"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                required
              />
              <div style={{ fontSize: 13, color: "#9A9280", marginTop: 4 }}>
                JPG, PNG, or PDF. Used only to verify your identity.
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

            <div>
              <label style={labelStyle} htmlFor="password_confirmation">
                Confirm password
              </label>
              <input
                style={fieldStyle}
                id="password_confirmation"
                type="password"
                name="password_confirmation"
                value={form.password_confirmation}
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
