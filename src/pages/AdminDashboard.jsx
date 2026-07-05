import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function AdminDashboard() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState('');
  const navigate = useNavigate();

  const fetchDonors = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/donors', {
        params: filterBloodGroup ? { blood_group: filterBloodGroup } : {},
      });
      setDonors(res.data.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
      } else {
        setError('Failed to load donors');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterBloodGroup]);

  const handleLogout = async () => {
    try {
      await api.post('/admin/logout');
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const toggleAvailable = async (donor) => {
    try {
      await api.put(`/admin/donors/${donor.id}`, { available: !donor.available });
      fetchDonors();
    } catch (e) {
      alert('Failed to update donor');
    }
  };

  const deleteDonor = async (donor) => {
    if (!confirm(`Remove ${donor.full_name} from the donor list?`)) return;
    try {
      await api.delete(`/admin/donors/${donor.id}`);
      fetchDonors();
    } catch (e) {
      alert('Failed to delete donor');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.heading}>Donor Dashboard</h1>
        <button style={styles.logoutButton} onClick={handleLogout}>Logout</button>
      </div>

      <div style={styles.filterRow}>
        <select
          style={styles.select}
          value={filterBloodGroup}
          onChange={(e) => setFilterBloodGroup(e.target.value)}
        >
          <option value="">All Blood Groups</option>
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
            <option key={bg} value={bg}>{bg}</option>
          ))}
        </select>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {loading ? (
        <p>Loading donors...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Blood Group</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>City</th>
              <th style={styles.th}>Available</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {donors.length === 0 && (
              <tr><td style={styles.td} colSpan={6}>No donors found.</td></tr>
            )}
            {donors.map((donor) => (
              <tr key={donor.id}>
                <td style={styles.td}>{donor.full_name}</td>
                <td style={styles.td}>{donor.blood_group}</td>
                <td style={styles.td}>{donor.phone}</td>
                <td style={styles.td}>{donor.city}</td>
                <td style={styles.td}>{donor.available ? 'Yes' : 'No'}</td>
                <td style={styles.td}>
                  <button style={styles.smallButton} onClick={() => toggleAvailable(donor)}>
                    Toggle
                  </button>
                  <button style={{ ...styles.smallButton, background: '#b91c1c' }} onClick={() => deleteDonor(donor)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 900, margin: '40px auto', padding: 24, fontFamily: 'system-ui, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  heading: { color: '#111827' },
  logoutButton: {
    padding: '8px 16px', background: '#374151', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer',
  },
  filterRow: { marginBottom: 16 },
  select: { padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: 10, borderBottom: '2px solid #e5e7eb', fontSize: 14, color: '#374151' },
  td: { padding: 10, borderBottom: '1px solid #f0f0f0', fontSize: 14 },
  smallButton: {
    padding: '6px 10px', marginRight: 6, fontSize: 13, border: 'none', borderRadius: 4,
    background: '#2563eb', color: '#fff', cursor: 'pointer',
  },
  errorBox: { background: '#fee2e2', color: '#991b1b', padding: 10, borderRadius: 6, marginBottom: 16 },
};
