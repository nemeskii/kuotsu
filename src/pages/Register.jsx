import { useState } from "react";
import api from "../api/axios";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Register() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    blood_group: "",
    age: "",
    gender: "",
    city: "",
    address: "",
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
      setStatus({ loading: false, message: res.data.message, error: "" });
      setForm({
        full_name: "",
        email: "",
        phone: "",
        blood_group: "",
        age: "",
        gender: "",
        city: "",
        address: "",
      });
    } catch (err) {
      const errors = err.response?.data?.errors;
      const firstError = errors
        ? Object.values(errors)[0][0]
        : "Something went wrong. Please try again.";
      setStatus({ loading: false, message: "", error: firstError });
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Become a Blood Donor</h1>
      <p style={styles.subheading}>
        Register below to join our community donor list.
      </p>

      {status.message && <div style={styles.success}>{status.message}</div>}
      {status.error && <div style={styles.errorBox}>{status.error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={form.full_name}
          onChange={handleChange}
          required
        />
        <input
          style={styles.input}
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          style={styles.input}
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <select
          style={styles.input}
          name="blood_group"
          value={form.blood_group}
          onChange={handleChange}
          required
        >
          <option value="">Select Blood Group</option>
          {BLOOD_GROUPS.map((bg) => (
            <option key={bg} value={bg}>
              {bg}
            </option>
          ))}
        </select>

        <input
          style={styles.input}
          type="number"
          name="age"
          placeholder="Age"
          min="18"
          max="65"
          value={form.age}
          onChange={handleChange}
          required
        />

        <select
          style={styles.input}
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <input
          style={styles.input}
          type="text"
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          required
        />

        <textarea
          style={{ ...styles.input, height: 80 }}
          name="address"
          placeholder="Address (optional)"
          value={form.address}
          onChange={handleChange}
        />

        <button style={styles.button} type="submit" disabled={status.loading}>
          {status.loading ? "Submitting..." : "Register as Donor"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 520,
    margin: "40px auto",
    padding: "24px 32px",
    fontFamily: "system-ui, sans-serif",
  },
  heading: { color: "#b91c1c", marginBottom: 4, fontSize: 28, lineHeight: 1.3 },
  subheading: { color: "#555", marginBottom: 20 },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: {
    padding: "10px 12px",
    fontSize: 15,
    border: "1px solid #ccc",
    borderRadius: 6,
  },
  button: {
    padding: "12px",
    fontSize: 16,
    fontWeight: 600,
    color: "#fff",
    background: "#b91c1c",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    marginTop: 8,
  },
  success: {
    background: "#dcfce7",
    color: "#166534",
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
  },
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
  },
};
