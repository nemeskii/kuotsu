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
  const [donations, setDonations] = useState([]);
  const [donationsLoading, setDonationsLoading] = useState(true);
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

  const fetchPendingDonations = async () => {
    setDonationsLoading(true);
    try {
      const res = await api.get('/admin/donations', {
        params: { status: 'pending' },
      });
      setDonations(res.data);
    } catch (err) {
      // non-critical, ignore
    } finally {
      setDonationsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterBloodGroup]);

  useEffect(() => {
    fetchPendingDonations();
  }, []);

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

  const reviewDonation = async (donation, status) => {
    try {
      await api.put(`/admin/donations/${donation.id}`, { status });
      fetchPendingDonations();
      fetchDonors();
    } catch (e) {
      alert('Failed to update donation');
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
          <h1 className="admin-dash-heading">Pending donations</h1>
          <p className="admin-dash-sub">
            {donationsLoading
              ? 'Loading…'
              : `${donations.length} awaiting review`}
          </p>
        </div>

        <div className="admin-dash-table-wrap" style={{ marginBottom: 40 }}>
          <table className="admin-dash-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Blood group</th>
                <th>Units</th>
                <th>Date</th>
                <th>Location</th>
                <th className="admin-dash-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {donationsLoading && (
                <tr>
                  <td colSpan={6} className="admin-dash-empty">
                    Loading…
                  </td>
                </tr>
              )}
              {!donationsLoading && donations.length === 0 && (
                <tr>
                  <td colSpan={6} className="admin-dash-empty">
                    No pending donations.
                  </td>
                </tr>
              )}
              {!donationsLoading &&
                donations.map((d) => (
                  <tr key={d.id}>
                    <td className="admin-dash-name">
                      {d.donor?.full_name || '—'}
                      {d.donor?.phone && (
                        <div style={{ fontSize: 13, color: '#9A9280' }}>
                          {d.donor.phone}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="admin-dash-badge">{d.blood_group}</span>
                    </td>
                    <td>{d.units}</td>
                    <td>{d.donation_date}</td>
                    <td>{d.location || '—'}</td>
                    <td className="admin-dash-actions">
                      <button
                        className="admin-dash-btn"
                        onClick={() => reviewDonation(d, 'completed')}
                      >
                        Approve
                      </button>
                      <button
                        className="admin-dash-btn admin-dash-btn--danger"
                        onClick={() => reviewDonation(d, 'cancelled')}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

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