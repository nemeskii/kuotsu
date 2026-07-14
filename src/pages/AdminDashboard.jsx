import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/theme.css';
import './AdminDashboard.css';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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
    <div className="admin-dash-page">
      <div className="admin-dash-header">
        <div className="admin-dash-header-inner">
          <div>
            <span className="site-mark admin-dash-mark">
              COMMUNITY<span>BLOOD</span>
            </span>
            <div className="site-eyebrow admin-dash-eyebrow">Admin panel</div>
          </div>
          <button className="admin-dash-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      <div className="admin-dash-body">
        <div className="admin-dash-titlebar">
          <h1 className="admin-dash-heading">Donor dashboard</h1>
          <p className="admin-dash-sub">
            {loading
              ? 'Loading donors…'
              : `${donors.length} donor${donors.length === 1 ? '' : 's'} listed`}
          </p>
        </div>

        <div className="admin-dash-toolbar">
          <label className="admin-dash-filter">
            <span className="admin-dash-filter-label">Blood group</span>
            <select
              className="admin-dash-select"
              value={filterBloodGroup}
              onChange={(e) => setFilterBloodGroup(e.target.value)}
            >
              <option value="">All groups</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <div className="admin-dash-error" role="alert">
            {error}
          </div>
        )}

        <div className="admin-dash-table-wrap">
          <table className="admin-dash-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Group</th>
                <th>Phone</th>
                <th>City</th>
                <th>Status</th>
                <th className="admin-dash-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="admin-dash-empty">
                    Loading donors…
                  </td>
                </tr>
              )}
              {!loading && donors.length === 0 && (
                <tr>
                  <td colSpan={6} className="admin-dash-empty">
                    No donors found.
                  </td>
                </tr>
              )}
              {!loading &&
                donors.map((donor) => (
                  <tr key={donor.id}>
                    <td className="admin-dash-name">{donor.full_name}</td>
                    <td>
                      <span className="admin-dash-badge">{donor.blood_group}</span>
                    </td>
                    <td>{donor.phone}</td>
                    <td>{donor.city}</td>
                    <td>
                      <span
                        className={`admin-dash-status${
                          donor.available ? ' is-available' : ''
                        }`}
                      >
                        {donor.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="admin-dash-actions">
                      <button
                        className="admin-dash-btn"
                        onClick={() => toggleAvailable(donor)}
                      >
                        Toggle
                      </button>
                      <button
                        className="admin-dash-btn admin-dash-btn--danger"
                        onClick={() => deleteDonor(donor)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}