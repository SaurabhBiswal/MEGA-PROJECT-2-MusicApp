import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch('https://mega-project-2-musicapp-production.up.railway.app/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 403) {
        alert('Access denied! Admin only.');
        navigate('/');
        return;
      }

      const result = await res.json();
      if (result.status === "success") {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-error">
        <p>Unable to load admin data.</p>
        <button onClick={handleBack} className="back-btn">Back to Home</button>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1><i className="fas fa-chart-line"></i> Admin Dashboard</h1>
        <button onClick={handleBack} className="back-btn">
          <i className="fas fa-arrow-left"></i> Back to Player
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card user-card">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers || 0}</p>
          </div>
        </div>

        <div className="stat-card song-card">
          <div className="stat-icon">
            <i className="fas fa-music"></i>
          </div>
          <div className="stat-content">
            <h3>Total Songs</h3>
            <p className="stat-number">{stats.totalSongs || 0}</p>
          </div>
        </div>

        <div className="stat-card playlist-card">
          <div className="stat-icon">
            <i className="fas fa-list"></i>
          </div>
          <div className="stat-content">
            <h3>Total Playlists</h3>
            <p className="stat-number">{stats.totalPlaylists || 0}</p>
          </div>
        </div>
      </div>

      <div className="data-sections">
        <div className="section recent-users">
          <h2><i className="fas fa-user-clock"></i> Recent Users</h2>
          <div className="section-content">
            {stats.recentUsers && stats.recentUsers.length > 0 ? (
              <ul className="user-list">
                {stats.recentUsers.map((user, index) => (
                  <li key={user.id || index} className="user-item">
                    <div className="user-avatar">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="user-info">
                      <strong>{user.username || 'Unknown'}</strong>
                      <p>{user.email || 'No email'}</p>
                    </div>
                    <span className="user-role">{user.role || 'USER'}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No recent users found</p>
            )}
          </div>
        </div>

        <div className="section popular-songs">
          <h2><i className="fas fa-fire"></i> Popular Songs</h2>
          <div className="section-content">
            {stats.popularSongs && stats.popularSongs.length > 0 ? (
              <ul className="song-list">
                {stats.popularSongs.map((song, index) => (
                  <li key={song.id || index} className="song-item">
                    <div className="song-rank">{index + 1}</div>
                    <div className="song-info">
                      <strong>{song.title || 'Unknown Title'}</strong>
                      <p>{song.artist || 'Unknown Artist'}</p>
                    </div>
                    <div className="song-stats">
                      <span className="play-count">
                        <i className="fas fa-play"></i> {song.playCount || 0}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No popular songs data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

