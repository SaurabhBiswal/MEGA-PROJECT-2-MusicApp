import React, { useState, useEffect, useCallback } from 'react';
import { searchSongs, getRecentSongs } from './api';
import { 
  Search, Music, Plus, Home, Heart, User, LogOut, Play, 
  ChevronLeft, Repeat, SkipForward, SkipBack, Share2, 
  AlignLeft, History, Trash2, Settings, Save, MoreVertical, Radio, Info, Monitor, Disc, UserCircle, Shuffle, Layout
} from 'lucide-react';

function App() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [view, setView] = useState('home'); 
  const [stats, setStats] = useState({ totalSongs: 0, totalPlaylists: 0 });
  const [isLooping, setIsLooping] = useState('none'); // none, one, all
  const [isShuffle, setIsShuffle] = useState(false);
  const [playHistory, setPlayHistory] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null); 
  const [playlists, setPlaylists] = useState([]); 
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [activePlaylistId, setActivePlaylistId] = useState(null);

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [userPlaylistId, setUserPlaylistId] = useState(null);

  useEffect(() => {
    loadFeatured();
    fetchStats();
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setLoggedInUser(user);
      ensurePlaylistExists(user.id);
      fetchUserPlaylists(user.id);
    }
    const savedHistory = localStorage.getItem('musicHistory');
    if (savedHistory) setPlayHistory(JSON.parse(savedHistory));

    const localPL = localStorage.getItem('userPlaylists');
    if (localPL) setPlaylists(JSON.parse(localPL));
  }, []);

  const fetchUserPlaylists = async (userId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/playlists/user/${userId}/all`);
      const result = await res.json();
      if (result.status === "success") {
        setPlaylists(result.data);
        localStorage.setItem('userPlaylists', JSON.stringify(result.data));
      }
    } catch (e) { console.log("Playlists error"); }
  };

  const loadPlaylistSongs = async (pId, pName) => {
    try {
      const res = await fetch(`http://localhost:8080/api/playlists/${pId}`);
      const result = await res.json();
      if (result.status === "success") {
        setSongs(result.data.songs || []);
        setView('playlist-view');
        setActivePlaylistId(pId);
        setMenuOpen(null);
      }
    } catch (e) { alert("Playlist is empty!"); }
  };

  const addToSpecificPlaylist = async (song, pId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/playlists/${pId}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(song)
      });
      if (res.ok) {
        alert(`Saved to Playlist! 🔥`);
        setMenuOpen(null);
        if (activePlaylistId === pId) loadPlaylistSongs(pId);
      }
    } catch (error) { alert("Error adding song"); }
  };

  const skipSong = useCallback((direction) => {
    if (songs.length === 0 || !currentSong) return;
    let nextIndex;
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    if (isShuffle && direction === 'next') {
      nextIndex = Math.floor(Math.random() * songs.length);
    } else {
      nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    }
    if (nextIndex >= songs.length) {
      if (isLooping === 'all') nextIndex = 0;
      else return;
    }
    if (nextIndex < 0) nextIndex = songs.length - 1;
    playSong(songs[nextIndex]);
  }, [songs, currentSong, isShuffle, isLooping]);

  const playSong = (song) => {
    setCurrentSong(song);
    setView('playing');
    const updatedHistory = [song, ...playHistory.filter(s => s.id !== song.id)].slice(0, 20);
    setPlayHistory(updatedHistory);
    localStorage.setItem('musicHistory', JSON.stringify(updatedHistory));
    setMenuOpen(null);
  };

  const createPlaylist = async () => {
    if(!newPlaylistName) return;
    try {
      const res = await fetch(`http://localhost:8080/api/playlists/create?name=${newPlaylistName}&userId=${loggedInUser.id}`, {
        method: 'POST'
      });
      const data = await res.json();
      if(data.status === "success") {
        const updated = [...playlists, data.data];
        setPlaylists(updated);
        localStorage.setItem('userPlaylists', JSON.stringify(updated));
        setNewPlaylistName('');
        setShowPlaylistModal(false);
      }
    } catch (e) { console.log("Error"); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/auth/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) { console.log("Stats error"); }
  };

  const ensurePlaylistExists = async (userId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/playlists/user/${userId}`);
      const result = await res.json();
      if (result.status === "success" && result.data) {
        setUserPlaylistId(result.data.id);
        return result.data.id;
      }
    } catch (e) { console.log("Playlist check failed"); }
    return null;
  };

  const loadFeatured = async () => {
    try {
      const res = await getRecentSongs();
      setSongs(res.data.data);
      setView('home');
      setActivePlaylistId(null);
    } catch (e) { console.log("Load error"); }
  };

  const handleSearch = async () => {
    if (!query) return;
    try {
      const res = await searchSongs(query);
      setSongs(res.data.data);
      setView('search');
      setActivePlaylistId(null);
    } catch (e) { alert("Search failed!"); }
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={{ color: '#1DB954', cursor: 'pointer', display: 'flex', gap: '10px' }} onClick={loadFeatured}><Music /> MusicApp</h2>
        <nav style={styles.nav}>
          <div style={{...styles.navItem, color: view === 'home' ? '#1DB954' : 'white'}} onClick={loadFeatured}><Home size={22} /> Home</div>
          <div style={{...styles.navItem, color: view === 'search' ? '#1DB954' : 'white'}} onClick={() => setView('search')}><Search size={22} /> Search</div>
          <div style={{...styles.navItem, color: view === 'history' ? '#1DB954' : 'white'}} onClick={() => setView('history')}><History size={22} /> History</div>
          <hr style={{ borderColor: '#282828', margin: '20px 0' }} />
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingRight:'10px', marginBottom:'15px'}}>
             <span style={{fontSize:'12px', color:'#b3b3b3', letterSpacing:'1px', fontWeight:'bold'}}>PLAYLISTS</span>
             <Plus size={16} onClick={() => setShowPlaylistModal(true)} style={{cursor:'pointer'}}/>
          </div>
          <div style={styles.playlistScroll}>
             <div style={{...styles.playlistItem, color: activePlaylistId === userPlaylistId ? 'white' : '#b3b3b3'}} onClick={() => loadPlaylistSongs(userPlaylistId)}>
               <Heart size={16} fill={activePlaylistId === userPlaylistId ? "#1DB954" : "none"} color={activePlaylistId === userPlaylistId ? "#1DB954" : "currentColor"}/> Liked Songs
             </div>
             {playlists.map((p) => (
               <div key={p.id} style={{...styles.playlistItem, color: activePlaylistId === p.id ? 'white' : '#b3b3b3'}} onClick={() => loadPlaylistSongs(p.id)}>
                 <Disc size={16} /> {p.name}
               </div>
             ))}
          </div>
        </nav>
      </div>

      <div style={styles.main}>
        {(view !== 'playing') && (
          <div style={styles.searchBar}>
            <input style={styles.input} placeholder="Search songs..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
            <button onClick={handleSearch} style={styles.searchBtn}><Search size={20} /></button>
          </div>
        )}

        {(view === 'home' || view === 'search' || view === 'history' || view === 'playlist-view') && (
          <>
            <h2 style={{ marginBottom: '20px', textTransform: 'capitalize' }}>
              {activePlaylistId ? (playlists.find(p => p.id === activePlaylistId)?.name) : view}
            </h2>
            <div style={styles.songGrid}>
              {(view === 'history' ? playHistory : songs).map((song, index) => (
                <div key={index} style={styles.card} onClick={() => playSong(song)}>
                  <img src={song.albumArtUrl || 'https://via.placeholder.com/150'} style={styles.albumArt} alt="art" />
                  <div style={styles.moreIcon} onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === index ? null : index); }}>
                    <MoreVertical size={20} />
                  </div>
                  {menuOpen === index && (
                    <div style={styles.contextMenu} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.menuHeader}>Save to...</div>
                        <div style={styles.menuItem} onClick={() => addToSpecificPlaylist(song, userPlaylistId)}><Plus size={14}/> Add to playlist</div>
                        <div style={styles.menuItem} onClick={() => {/* Remove Logic */}}><Heart size={14}/> Remove from Liked</div>
                        <hr style={{borderColor:'#444'}}/>
                        <div style={styles.menuItem}><Radio size={14}/> Go to song radio</div>
                        <div style={styles.menuItem}><UserCircle size={14}/> Go to artist</div>
                        <div style={styles.menuItem}><Disc size={14}/> Go to album</div>
                        <div style={styles.menuItem}><Info size={14}/> View credits</div>
                        <div style={styles.menuItem} onClick={() => {navigator.clipboard.writeText(song.audioUrl); alert("Link Copied!");}}><Share2 size={14}/> Share</div>
                    </div>
                  )}
                  <div style={{ fontWeight: 'bold', marginTop: '10px' }}>{song.title}</div>
                  <div style={{ color: '#b3b3b3', fontSize: '12px' }}>{song.artist}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {showPlaylistModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3>Create New Playlist</h3>
              <input style={styles.input} placeholder="Playlist name..." value={newPlaylistName} onChange={(e)=>setNewPlaylistName(e.target.value)} />
              <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                <button onClick={createPlaylist} style={styles.saveBtn}>Create</button>
                <button onClick={()=>setShowPlaylistModal(false)} style={{...styles.saveBtn, backgroundColor:'#333'}}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {view === 'playing' && currentSong && (
          <div style={styles.playingContainer}>
            <button onClick={() => setView('home')} style={styles.backBtn}><ChevronLeft /> Back</button>
            <div style={styles.playerLayout}>
              <div style={styles.videoSection}>
                <iframe width="100%" height="480" src={`https://www.youtube.com/embed/${getYouTubeId(currentSong.audioUrl)}?autoplay=1&vq=hd1080&loop=${isLooping === 'one' ? 1 : 0}&playlist=${getYouTubeId(currentSong.audioUrl)}`} frameBorder="0" allowFullScreen style={{ borderRadius: '15px' }}></iframe>
              </div>
              <div style={styles.detailsSection}>
                <img src={currentSong.albumArtUrl} style={styles.bigArt} alt="cover" />
                <h1 style={{marginTop: '20px'}}>{currentSong.title}</h1>
                <div style={styles.controlsRow}>
                  <button onClick={() => setIsShuffle(!isShuffle)} style={{...styles.iconBtn, color: isShuffle ? '#1DB954' : 'white'}}><Shuffle size={24} /></button>
                  <button onClick={() => skipSong('prev')} style={styles.iconBtn}><SkipBack size={32} fill="white"/></button>
                  <div style={styles.playCircle}><Play size={24} fill="black"/></div>
                  <button onClick={() => skipSong('next')} style={styles.iconBtn}><SkipForward size={32} fill="white"/></button>
                  <button onClick={() => setIsLooping(isLooping === 'none' ? 'all' : isLooping === 'all' ? 'one' : 'none')} style={{...styles.iconBtn, color: isLooping !== 'none' ? '#1DB954' : 'white'}}>
                    <Repeat size={24} />
                    {isLooping === 'one' && <span style={styles.repeatOneBadge}>1</span>}
                  </button>
                </div>
                <div style={styles.largeVisualizer}>
                  {[...Array(24)].map((_, i) => (
                    <div key={i} className="bar" style={{ width: '5px', background: '#1DB954', borderRadius: '3px', animation: `bounce 0.4s infinite alternate ${i * 0.04}s` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes bounce { from { height: 6px; } to { height: 40px; } }`}</style>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#000', color: 'white', minHeight: '100vh', display: 'flex', fontFamily: 'sans-serif' },
  sidebar: { width: '260px', padding: '24px', borderRight: '1px solid #333', background: '#000' },
  nav: { marginTop: '30px' },
  navItem: { display: 'flex', gap: '15px', marginBottom: '20px', cursor: 'pointer', alignItems: 'center', fontWeight: 'bold', fontSize: '14px' },
  playlistScroll: { maxHeight:'450px', overflowY:'auto' },
  playlistItem: { padding:'12px 0', fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', gap:'12px', transition:'0.2s' },
  main: { flex: 1, backgroundColor: '#121212', padding: '30px', overflowY: 'auto' },
  searchBar: { display: 'flex', gap: '10px', marginBottom: '30px', maxWidth: '500px' },
  input: { flex: 1, padding: '12px 20px', borderRadius: '30px', border: 'none', backgroundColor: '#333', color: 'white', width: '100%' },
  searchBtn: { backgroundColor: '#1DB954', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer' },
  songGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '25px' },
  card: { backgroundColor: '#181818', padding: '15px', borderRadius: '10px', cursor: 'pointer', position: 'relative', transition: '0.3s' },
  albumArt: { width: '100%', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' },
  moreIcon: { position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '5px' },
  contextMenu: { position: 'absolute', top: '55px', right: '10px', backgroundColor: '#282828', borderRadius: '4px', padding: '8px', zIndex: 100, width: '220px', boxShadow: '0 16px 24px rgba(0,0,0,0.5)' },
  menuHeader: { padding:'5px', fontSize:'11px', color:'#b3b3b3', fontWeight:'bold', textTransform:'uppercase' },
  menuItem: { padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', color: '#b3b3b3', cursor: 'pointer', transition: '0.2s' },
  modalOverlay: { position:'fixed', top:0, left:0, width:'100%', height:'100%', backgroundColor:'rgba(0,0,0,0.8)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000 },
  modal: { backgroundColor:'#282828', padding:'40px', borderRadius:'15px', width:'400px', textAlign:'center' },
  saveBtn: { backgroundColor: '#1DB954', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' },
  playingContainer: { animation: 'fadeIn 0.6s ease' },
  backBtn: { background: 'none', border: '1px solid #333', color: '#fff', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', marginBottom: '20px' },
  playerLayout: { display: 'flex', gap: '40px' },
  videoSection: { flex: 2 },
  detailsSection: { flex: 1, textAlign: 'center' },
  bigArt: { width: '300px', height: '300px', borderRadius: '15px', boxShadow: '0 15px 40px rgba(0,0,0,0.8)' },
  controlsRow: { display: 'flex', gap: '25px', margin: '30px 0', justifyContent: 'center', alignItems: 'center' },
  playCircle: { background: 'white', width:'56px', height:'56px', borderRadius:'50%', display:'flex', justifyContent:'center', alignItems:'center' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', position: 'relative' },
  repeatOneBadge: { position:'absolute', top:'-5px', right:'-5px', background:'#1DB954', color:'black', fontSize:'10px', borderRadius:'50%', width:'14px', height:'14px', fontWeight:'bold' },
  largeVisualizer: { display: 'flex', gap: '4px', height: '40px', justifyContent: 'center', alignItems: 'flex-end' }
};

export default App;