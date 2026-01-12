import React, { useState, useEffect } from 'react';
import '../styles/Recommendations.css';

const Recommendations = ({ currentSong, onSelectSong }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentSong && currentSong.id) {
      fetchRecommendations(currentSong.id);
    }
  }, [currentSong]);

  const fetchRecommendations = async (songId) => {
    if (!songId) return;
    
    setLoading(true);
    try {
      const res = await fetch(`https://mega-project-2-musicapp-production.up.railway.app/api/songs/recommendations/${songId}`);
      const result = await res.json();
      
      if (result.status === "success") {
        setRecommendations(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSongSelect = (song) => {
    if (onSelectSong) {
      onSelectSong(song);
    }
  };

  if (!currentSong) {
    return null;
  }

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <h3><i className="fas fa-bullseye"></i> You May Also Like</h3>
        <p className="recommendations-subtitle">
          Based on your current song: <strong>{currentSong.title}</strong>
        </p>
      </div>

      {loading ? (
        <div className="recommendations-loading">
          <div className="loading-spinner"></div>
          <p>Finding similar songs...</p>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="recommendations-list">
          {recommendations.map((song, index) => (
            <div 
              key={song.id || index} 
              className="recommendation-item"
              onClick={() => handleSongSelect(song)}
            >
              <div className="recommendation-number">{index + 1}</div>
              <div className="recommendation-info">
                <h4 className="song-title">{song.title || 'Unknown Title'}</h4>
                <p className="song-artist">{song.artist || 'Unknown Artist'}</p>
                {song.genre && (
                  <span className="song-genre">{song.genre}</span>
                )}
              </div>
              <div className="recommendation-action">
                <button className="play-recommendation-btn">
                  <i className="fas fa-play"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-recommendations">
          <p><i className="fas fa-info-circle"></i> No recommendations available</p>
          <p className="recommendation-tip">
            Try playing more songs to get better recommendations!
          </p>
        </div>
      )}
    </div>
  );
};

export default Recommendations;

