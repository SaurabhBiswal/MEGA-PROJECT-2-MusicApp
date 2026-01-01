import React, { useState, useEffect } from 'react';
import { searchSongs, getRecentSongs } from './api';
import { Play, Pause, Search, Music, Disc } from 'lucide-react';

function App() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Home page load hote hi kuch gaane dikhao
  useEffect(() => {
    loadFeatured();
  }, []);

  const loadFeatured = async () => {
    try {
      const res = await getRecentSongs();
      setSongs(res.data.data);
    } catch (e) { console.log("Recent songs load nahi huye"); }
  };

  const handleSearch = async () => {
    if(!query) return;
    const res = await searchSongs(query);
    setSongs(res.data.data);
  };

const playSong = (song) => {
    // Check karo ki gaane ka link hai ya nahi
    if (!song.audioUrl) {
        alert("Bhai, is gaane ka audio link database mein nahi hai!");
        return;
    }
    
    setCurrentSong(song);
    setIsPlaying(true);
    
    const audio = document.querySelector('audio');
    if (audio) {
        audio.src = song.audioUrl;
        audio.load(); // Naya link load karo
        audio.play().catch(error => {
            console.error("Playback failed:", error);
        });
    }
};

  return (
    <div style={styles.container}>
      {/* Sidebar - Day 9 */}
      <div style={styles.sidebar}>
        <h2 style={{color: '#1DB954'}}><Music /> MusicApp</h2>
        <nav style={styles.nav}>
          <div style={styles.navItem}><Disc size={20}/> Home</div>
          <div style={styles.navItem}><Search size={20}/> Search</div>
        </nav>
      </div>

      {/* Main Area */}
      <div style={styles.main}>
        <div style={styles.searchBar}>
          <input 
            type="text" 
            placeholder="Shakira, Arijit Singh..." 
            onChange={(e) => setQuery(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleSearch} style={styles.searchBtn}><Search size={20}/></button>
        </div>

        <h3>Recommended for you</h3>
        <div style={styles.songGrid}>
          {songs.map((song, index) => (
            <div key={index} style={styles.card} onClick={() => playSong(song)}>
              <img src={song.albumArtUrl || 'https://via.placeholder.com/150'} style={styles.albumArt} alt="art" />
              <div style={styles.songTitle}>{song.title}</div>
              <div style={styles.songArtist}>{song.artist}</div>
              <div style={styles.playIcon}><Play fill="black" /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Media Player Bar - Day 10 */}
      {currentSong && (
        <div style={styles.playerBar}>
          <div style={{display:'flex', alignItems:'center', gap:'15px', width: '30%'}}>
             <img src={currentSong.albumArtUrl} style={{width:'50px', borderRadius:'4px'}} />
             <div>
                <div style={{fontSize:'14px', fontWeight:'bold'}}>{currentSong.title}</div>
                <div style={{fontSize:'12px', color:'#b3b3b3'}}>{currentSong.artist}</div>
             </div>
          </div>
          
          <div style={{width: '40%', textAlign: 'center'}}>
            <audio 
              controls 
              autoPlay 
              src={currentSong.audioUrl} 
              style={{width: '100%', height: '35px'}}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            ></audio>
          </div>
          <div style={{width: '30%'}}></div>
        </div>
      )}
    </div>
  );
}

// Spotify Theme Styles
const styles = {
  container: { backgroundColor: '#000', color: 'white', minHeight: '100vh', display: 'flex' },
  sidebar: { width: '240px', backgroundColor: '#000', padding: '24px', borderRight: '1px solid #282828' },
  nav: { marginTop: '30px' },
  navItem: { display: 'flex', gap: '15px', marginBottom: '20px', cursor: 'pointer', fontWeight: 'bold' },
  main: { flex: 1, backgroundColor: '#121212', padding: '30px', overflowY: 'auto', paddingBottom: '100px' },
  searchBar: { display: 'flex', gap: '10px', marginBottom: '40px' },
  input: { padding: '12px 20px', borderRadius: '25px', width: '400px', border: 'none', backgroundColor: '#242424', color: 'white' },
  searchBtn: { backgroundColor: '#1DB954', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer' },
  songGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' },
  card: { backgroundColor: '#181818', padding: '16px', borderRadius: '8px', cursor: 'pointer', position: 'relative' },
  albumArt: { width: '100%', borderRadius: '4px', marginBottom: '12px', boxShadow: '0 8px 24px rgba(0,0,0,.5)' },
  songTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  songArtist: { fontSize: '14px', color: '#b3b3b3' },
  playerBar: { position: 'fixed', bottom: 0, left: 0, width: '100%', background: '#181818', padding: '15px 30px', borderTop: '1px solid #282828', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
};

export default App;