import React, { useState, useEffect } from 'react';
import { searchSongs, getRecentSongs } from './api';
import { Play, Search, Music, Disc, Plus, Home, Heart, User } from 'lucide-react';

function App() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [view, setView] = useState('home');

  // --- LOGIN STATES ---
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });

  useEffect(() => {
    loadFeatured();
  }, []);

  const loadFeatured = async () => {
    try {
      const res = await getRecentSongs();
      setSongs(res.data.data);
      setView('home');
    } catch (e) { console.log("Recent songs load nahi huye"); }
  };

  const handleSearch = async () => {
    if(!query) return;
    const res = await searchSongs(query);
    setSongs(res.data.data);
    setView('search');
  };

  const loadLibrary = async () => {
    try {
        const response = await fetch(`http://localhost:8080/api/playlists/1`);
        const result = await response.json();
        if (result.status === "success" && result.data && result.data.songs) {
            setSongs(result.data.songs);
            setView('library');
        } else {
            setSongs([]);
            setView('library');
            alert("Bhai, ye playlist toh khali nikli!");
        }
    } catch (error) {
        alert("Backend se baat nahi ho pa rahi!");
    }
  };

  // --- LOGIN LOGIC ---
  const handleLogin = async () => {
    try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usernameOrEmail: authForm.username, 
                password: authForm.password
            })
        });

        const result = await response.json();

        if (response.ok && (result.status === "success" || result.success)) {
            setLoggedInUser(result.data); 
            setIsLoginOpen(false);
            alert("Swaagat hai, " + (result.data?.username || "Admin") + "!");
        } else {
            alert("Lafda: " + (result.message || "Invalid Credentials"));
        }
    } catch (error) {
        alert("Backend band hai shayad!");
    }
  };

  const playSong = (song) => {
    if (!song.audioUrl) return alert("Audio link nahi hai!");
    setCurrentSong(song);
    const audio = document.querySelector('audio');
    if (audio) { audio.src = song.audioUrl; audio.load(); audio.play(); }
  };

  const addToPlaylist = async (song) => {
    if (!loggedInUser) {
        alert("Bhai, pehle login toh kar lo!");
        setIsLoginOpen(true); 
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/playlists/1/songs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(song) 
        });
        
        if(response.ok) {
            alert(`✅ ${song.title} Library mein add ho gaya!`);
            if (view === 'library') loadLibrary(); 
        }
    } catch (error) { 
        alert("Gaana add nahi ho paya!");
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={{color: '#1DB954', display:'flex', alignItems:'center', gap:'10px'}}><Music /> MusicApp</h2>
        <nav style={styles.nav}>
          <div style={{...styles.navItem, color: view === 'home' ? '#1DB954' : 'white'}} onClick={loadFeatured}>
            <Home size={22}/> Home
          </div>
          <div style={{...styles.navItem, color: view === 'search' ? '#1DB954' : 'white'}} onClick={() => setView('search')}>
            <Search size={22}/> Search
          </div>
          <div style={{...styles.navItem, color: view === 'library' ? '#1DB954' : 'white'}} onClick={loadLibrary}>
            <Heart size={22}/> Your Library
          </div>
          
          <hr style={{borderColor: '#282828', margin: '20px 0'}} />
          
          {/* LOGIN/USER SECTION WITH LOGOUT */}
          {!loggedInUser ? (
            <div style={styles.navItem} onClick={() => setIsLoginOpen(true)}>
              <User size={22}/> Login / Register
            </div>
          ) : (
            <div>
              <div style={{...styles.navItem, color: '#1DB954', marginBottom: '5px'}}>
                <User size={22}/> Hi, {loggedInUser.username}
              </div>
              <div style={{...styles.navItem, color: '#b3b3b3', marginLeft: '37px', fontSize: '14px', cursor: 'pointer'}} 
                   onClick={() => {
                     setLoggedInUser(null);
                     alert("Alvida! Phir milenge.");
                   }}>
                Logout
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Main Area */}
      <div style={styles.main}>
        {view === 'search' && (
          <div style={styles.searchBar}>
            <input 
              type="text" 
              placeholder="Shakira, Arijit Singh..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={styles.input}
            />
            <button onClick={handleSearch} style={styles.searchBtn}><Search size={20}/></button>
          </div>
        )}

        <h3>
          {view === 'home' && "Recommended for you"}
          {view === 'search' && `Results for "${query}"`}
          {view === 'library' && "Your Liked Songs"}
        </h3>

        <div style={styles.songGrid}>
          {songs.length > 0 ? songs.map((song, index) => (
            <div key={index} style={styles.card} onClick={() => playSong(song)}>
              <img src={song.albumArtUrl || 'https://via.placeholder.com/150'} style={styles.albumArt} alt="art" />
              <button onClick={(e) => { e.stopPropagation(); addToPlaylist(song); }} style={styles.addBtn}>
                <Plus size={18} color="black" />
              </button>
              <div style={styles.songTitle}>{song.title}</div>
              <div style={styles.songArtist}>{song.artist}</div>
            </div>
          )) : <p style={{color: '#b3b3b3'}}>Yahan kuch nahi hai bhai...</p>}
        </div>
      </div>

      {/* LOGIN MODAL */}
      {isLoginOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.loginBox}>
            <h2 style={{color: '#1DB954', marginBottom: '20px'}}>MusicApp Login</h2>
            <input 
              style={styles.loginInput} 
              placeholder="Username or Email" 
              onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
            />
            <input 
              style={styles.loginInput} 
              type="password" 
              placeholder="Password" 
              onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
            />
            <button style={styles.loginSubmit} onClick={handleLogin}>
              Login
            </button>
            <button style={{background:'transparent', color:'#b3b3b3', border:'none', marginTop:'15px', cursor:'pointer'}} 
                    onClick={() => setIsLoginOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Player Bar */}
      {currentSong && (
        <div style={styles.playerBar}>
          <div style={{display:'flex', alignItems:'center', gap:'15px', width: '30%'}}>
             <img src={currentSong.albumArtUrl} style={{width:'55px', borderRadius:'4px'}} alt="thumb" />
             <div style={{overflow:'hidden'}}>
                <div style={{fontSize:'14px', fontWeight:'bold', whiteSpace:'nowrap'}}>{currentSong.title}</div>
                <div style={{fontSize:'12px', color:'#b3b3b3'}}>{currentSong.artist}</div>
             </div>
          </div>
          <div style={{width: '40%', textAlign: 'center'}}>
            <audio controls autoPlay src={currentSong.audioUrl} style={{width: '100%', height: '40px'}}></audio>
          </div>
          <div style={{width: '30%'}}></div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#000', color: 'white', minHeight: '100vh', display: 'flex' },
  sidebar: { width: '240px', backgroundColor: '#000', padding: '24px', borderRight: '1px solid #282828' },
  nav: { marginTop: '30px' },
  navItem: { display: 'flex', gap: '15px', marginBottom: '25px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: '0.2s' },
  main: { flex: 1, backgroundColor: '#121212', padding: '30px', overflowY: 'auto', paddingBottom: '120px' },
  searchBar: { display: 'flex', gap: '10px', marginBottom: '40px' },
  input: { padding: '12px 20px', borderRadius: '25px', width: '100%', maxWidth: '400px', border: 'none', backgroundColor: '#242424', color: 'white' },
  searchBtn: { backgroundColor: '#1DB954', border: 'none', borderRadius: '50%', padding: '12px', cursor: 'pointer' },
  songGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' },
  card: { backgroundColor: '#181818', padding: '16px', borderRadius: '8px', cursor: 'pointer', position: 'relative', transition: '0.3s' },
  albumArt: { width: '100%', borderRadius: '4px', marginBottom: '12px' },
  songTitle: { fontSize: '15px', fontWeight: 'bold', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  songArtist: { fontSize: '13px', color: '#b3b3b3' },
  addBtn: { position: 'absolute', top: '20px', right: '20px', backgroundColor: '#1DB954', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  playerBar: { position: 'fixed', bottom: 0, left: 0, width: '100%', background: '#181818', padding: '15px 30px', borderTop: '1px solid #282828', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100 },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  loginBox: { backgroundColor: '#282828', padding: '40px', borderRadius: '8px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column' },
  loginInput: { padding: '14px', marginBottom: '15px', borderRadius: '4px', border: 'none', backgroundColor: '#3e3e3e', color: 'white', fontSize: '16px' },
  loginSubmit: { backgroundColor: '#1DB954', color: 'white', padding: '14px', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', marginTop: '10px' }
};

export default App;