import React, { useState, useEffect, useCallback } from 'react';
import { 
  searchSongs, getRecentSongs, createPlaylist, getUserPlaylists, 
  getPlaylistById, addSongToPlaylist, renamePlaylist, deletePlaylist,
  sharePlaylist
} from './api';
import { 
  Search, Music, Plus, Home, Heart, User, LogOut, Play, 
  ChevronLeft, Repeat, SkipForward, SkipBack, Share2, 
  AlignLeft, History, Trash2, Settings, Save, MoreVertical, 
  Radio, Info, Monitor, Disc, UserCircle, Shuffle, Layout, 
  MinusCircle, Edit, Copy, ExternalLink, BarChart3
} from 'lucide-react';

function App() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [view, setView] = useState('home'); 
  const [stats, setStats] = useState({ totalSongs: 0, totalPlaylists: 0, totalUsers: 0 });
  const [isLooping, setIsLooping] = useState('none'); 
  const [isShuffle, setIsShuffle] = useState(false);
  const [playHistory, setPlayHistory] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null); 
  const [playlists, setPlaylists] = useState([]); 
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [activePlaylistId, setActivePlaylistId] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [userPlaylistId, setUserPlaylistId] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // ✅ NEW FEATURES STATE
  const [renamingId, setRenamingId] = useState(null);
  const [tempName, setTempName] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareInfo, setShareInfo] = useState(null);
  
  // ✅ Auth Form state management
  const [authForm, setAuthForm] = useState({ username: '', password: '', email: '' });

  // ✅ HELPER FUNCTION: Authenticated API calls with JWT
  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return fetch(url, {
      ...options,
      headers
    });
  };

  const loadFeatured = async () => {
    try {
      const res = await getRecentSongs();
      setSongs(res.data.data);
      setView('home');
      setActivePlaylistId(null);
    } catch (e) { console.log("Load error"); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/auth/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) { console.log("Stats error"); }
  };

  const fetchUserPlaylists = async (userId) => {
    try {
      const res = await fetchWithAuth(`http://localhost:8080/api/playlists/user/${userId}`);
      const result = await res.json();
      
      // ✅ FIX: Ensure playlists is always an array
      if (result.status === "success") {
        let playlistData = result.data;
        
        // Handle different response formats
        if (playlistData && playlistData.data) {
          playlistData = playlistData.data; // If nested in data property
        }
        
        // Convert to array if it's not
        const playlistsArray = Array.isArray(playlistData) ? playlistData : [];
        
        // If it's a single object, put it in array
        if (playlistData && typeof playlistData === 'object' && !Array.isArray(playlistData)) {
          playlistsArray.push(playlistData);
        }
        
        setPlaylists(playlistsArray);
        localStorage.setItem(`userPlaylists_${userId}`, JSON.stringify(playlistsArray));
      } else {
        // If API fails or no playlists, set empty array
        setPlaylists([]);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
      setPlaylists([]); // ✅ Set empty array on error
    }
  };

  const ensurePlaylistExists = async (userId) => {
    try {
      const res = await fetchWithAuth(`http://localhost:8080/api/playlists/user/${userId}`);
      const result = await res.json();
      if (result.status === "success" && result.data) {
        setUserPlaylistId(result.data.id);
        return result.data.id;
      }
    } catch (e) { 
      console.log("PL check fail"); 
    }
    return null;
  };

  useEffect(() => {
    loadFeatured();
    fetchStats();
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setLoggedInUser(user);
        ensurePlaylistExists(user.id);
        
        const savedHistory = localStorage.getItem(`musicHistory_${user.id}`);
        if (savedHistory) setPlayHistory(JSON.parse(savedHistory));
        
        const localPL = localStorage.getItem(`userPlaylists_${user.id}`);
        if (localPL) {
          const parsed = JSON.parse(localPL);
          // ✅ Ensure it's an array
          setPlaylists(Array.isArray(parsed) ? parsed : []);
        }
        
        fetchUserPlaylists(user.id);
      } catch (error) {
        console.error("Error loading saved user:", error);
      }
    }
  }, []);

  // ✅ Handle Input Change for all fields
  const handleAuthInputChange = (e) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({ ...prev, [name]: value }));
  };

  // ✅ handleRegister with validation
  const handleRegister = async () => {
    if(!authForm.username || !authForm.email || !authForm.password) {
      return alert("Poora detail bhar!");
    }
    try {
      const res = await fetch(`http://localhost:8080/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const result = await res.json();
      if (res.ok) { 
        alert("Account ban gaya! Ab login kar le."); 
        setIsRegistering(false); 
        setAuthForm({ username: '', password: '', email: '' });
      } else { 
        alert(result.message || "Registration fail! Email already exists."); 
      }
    } catch (e) { alert("Backend is offline!"); }
  };

  // ✅ UPDATED: handleLogin with JWT token handling
  const handleLogin = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          usernameOrEmail: authForm.username, 
          password: authForm.password 
        })
      });
      
      const result = await res.json();
      
      if (result.status === "success") {
        // ✅ Extract JWT token and user from response
        const { token, user } = result.data;
        
        // ✅ Store JWT token in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Set user state
        setLoggedInUser(user);
        
        // ✅ Log for debugging
        console.log("JWT Token stored:", token);
        console.log("User role:", user.role);
        
        // Clear state
        setPlayHistory([]);
        setPlaylists([]); // ✅ Reset to empty array
        setUserPlaylistId(null);
        setActivePlaylistId(null);
        setCurrentSong(null);
        setView('home');
        
        // Load user data
        ensurePlaylistExists(user.id);
        fetchUserPlaylists(user.id);
        
        // Load history
        const savedHistory = localStorage.getItem(`musicHistory_${user.id}`);
        if (savedHistory) {
          setPlayHistory(JSON.parse(savedHistory));
        } else {
          setPlayHistory([]);
        }
        
      } else { 
        alert(result.message || "User nahi mila ya password galat!"); 
      }
    } catch (e) { 
      alert("Backend band hai!"); 
    }
  };

  // ✅ FIXED: Logout should ONLY clear current session
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setLoggedInUser(null);
    setPlaylists([]); // ✅ Set to empty array
    setPlayHistory([]);
    setUserPlaylistId(null);
    setActivePlaylistId(null);
    setCurrentSong(null);
    setView('home');
    window.location.reload(); 
  };

  const playSong = (song) => {
    setCurrentSong(song);
    setView('playing');
    const updatedHistory = [song, ...playHistory.filter(s => s.id !== song.id)].slice(0, 20);
    setPlayHistory(updatedHistory);
    
    if(loggedInUser) {
      localStorage.setItem(`musicHistory_${loggedInUser.id}`, JSON.stringify(updatedHistory));
    }
    setMenuOpen(null);
  };

  const skipSong = useCallback((direction) => {
    const currentList = view === 'history' ? playHistory : songs;
    if (currentList.length === 0 || !currentSong) return;
    let nextIndex;
    const currentIndex = currentList.findIndex(s => s.id === currentSong.id);
    if (isShuffle && direction === 'next') nextIndex = Math.floor(Math.random() * currentList.length);
    else nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= currentList.length) { if (isLooping === 'all') nextIndex = 0; else return; }
    if (nextIndex < 0) nextIndex = currentList.length - 1;
    playSong(currentList[nextIndex]);
  }, [songs, playHistory, currentSong, isShuffle, isLooping, view]);

  const removeFromPlaylist = async (songId) => {
    if(!activePlaylistId) return;
    try {
      const res = await fetchWithAuth(`http://localhost:8080/api/playlists/${activePlaylistId}/songs/${songId}`, { 
        method: 'DELETE' 
      });
      if (res.ok) {
        setSongs(songs.filter(s => s.id !== songId));
        setMenuOpen(null);
        alert("Song removed!");
      }
    } catch (e) { alert("Remove error!"); }
  };

  const deletePlaylistHandler = async (pId) => {
    if(!window.confirm("Bhai, pakka uda dun?")) return;
    try {
      const response = await deletePlaylist(pId);
      if(response.data.status === "success") {
        const updated = playlists.filter(p => p.id !== pId);
        setPlaylists(updated);
        localStorage.setItem(`userPlaylists_${loggedInUser.id}`, JSON.stringify(updated));
        if (activePlaylistId === pId) {
          loadFeatured();
          setActivePlaylistId(null);
        }
        alert("Playlist deleted!");
      }
    } catch (e) { alert("Error deleting!"); }
  };

  // ✅ FEATURE 1: RENAME PLAYLIST
  const renamePlaylistHandler = async (id, newName) => {
    if(!newName.trim()) return;
    try {
      const userId = loggedInUser ? loggedInUser.id : null;
      const response = await renamePlaylist(id, newName, userId);
      if(response.data.status === "success") {
        const updated = playlists.map(p => 
          p.id === id ? { ...p, name: newName } : p
        );
        setPlaylists(updated);
        localStorage.setItem(`userPlaylists_${loggedInUser.id}`, JSON.stringify(updated));
        setRenamingId(null);
        alert("✅ Playlist renamed!");
      }
    } catch(e) { 
      alert("❌ Rename failed!"); 
      console.error(e);
    }
  };

  // ✅ FEATURE 2: AUTOPLAY PLAYLIST
  const autoplayPlaylist = async (playlistId, playlistName) => {
    try {
      const response = await getPlaylistById(playlistId);
      if (response.data.status === "success") {
        const songs = response.data.data.songs || [];
        setSongs(songs);
        setView('playlist-view');
        setActivePlaylistId(playlistId);
        
        if (songs.length > 0) {
          setTimeout(() => {
            playSong(songs[0]);
            alert(`🎵 Autoplay started! "${playlistName}" - ${songs.length} songs in queue.`);
          }, 500);
        } else {
          alert("Playlist is empty!");
        }
      }
    } catch(e) { 
      alert("❌ Autoplay failed!"); 
      console.error(e);
    }
  };

  // ✅ FEATURE 3: SHARE PLAYLIST
  const sharePlaylistHandler = async (playlistId, playlistName) => {
    try {
      const response = await sharePlaylist(playlistId);
      if (response.data.status === "success") {
        setShareInfo({
          ...response.data.data,
          name: playlistName
        });
        setShowShareModal(true);
      }
    } catch(e) { 
      // If API fails, create basic share info
      const basicShareInfo = {
        id: playlistId,
        name: playlistName,
        shareUrl: `http://localhost:8080/#/playlist/${playlistId}`,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http://localhost:8080/#/playlist/${playlistId}`
      };
      setShareInfo(basicShareInfo);
      setShowShareModal(true);
    }
  };

  // ✅ COPY TO CLIPBOARD
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => alert("✅ Copied to clipboard!"))
      .catch(() => prompt("Copy this:", text));
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

  const loadPlaylistSongs = async (pId) => {
    try {
      const result = await getPlaylistById(pId);
      if (result.status === "success") {
        setSongs(result.data.data.songs || []);
        setView('playlist-view');
        setActivePlaylistId(pId);
        setMenuOpen(null);
      }
    } catch (e) { alert("Playlist empty!"); }
  };

  const createPlaylistHandler = async () => {
    if(!newPlaylistName || !loggedInUser) return;
    try {
      const response = await createPlaylist(newPlaylistName, loggedInUser.id);
      if(response.data.status === "success") {
        const updated = [...playlists, response.data.data];
        setPlaylists(updated);
        localStorage.setItem(`userPlaylists_${loggedInUser.id}`, JSON.stringify(updated));
        setNewPlaylistName('');
        setShowPlaylistModal(false);
        alert("✅ Playlist created!");
      }
    } catch (e) { 
      console.log("Error:", e); 
      alert("Failed to create playlist!");
    }
  };

  const addToSpecificPlaylist = async (song, pId) => {
    try {
      const response = await addSongToPlaylist(pId, song);
      if(response.data.status === "success") {
        alert(`✅ Saved to Playlist! 🔥`);
        setMenuOpen(null);
        if (activePlaylistId === pId) {
          loadPlaylistSongs(pId);
        }
      }
    } catch (error) { 
      alert("❌ Error adding song"); 
    }
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  if (!loggedInUser) {
    return (
      <div style={styles.authContainer}>
        <div style={styles.authCard}>
          <Music size={50} color="#1DB954" style={{ marginBottom: '20px' }} />
          <h2 style={{ marginBottom: '30px' }}>{isRegistering ? 'Sign up for free' : 'Log in to MusicApp'}</h2>
          
          <input name="username" style={styles.authInput} placeholder="Username" value={authForm.username} onChange={handleAuthInputChange} />
          {isRegistering && <input name="email" style={styles.authInput} placeholder="Email" value={authForm.email} onChange={handleAuthInputChange} />}
          <input name="password" style={styles.authInput} type="password" placeholder="Password" value={authForm.password} onChange={handleAuthInputChange} />
          
          <button style={styles.authBtn} onClick={isRegistering ? handleRegister : handleLogin}>
            {isRegistering ? 'Sign Up' : 'Log In'}
          </button>
          
          <p onClick={() => { setIsRegistering(!isRegistering); setAuthForm({username:'', email:'', password:''}); }} style={{ marginTop: '20px', fontSize: '14px', color: '#b3b3b3', cursor: 'pointer' }}>
            {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={{ color: '#1DB954', cursor: 'pointer', display: 'flex', gap: '10px' }} onClick={loadFeatured}>
          <Music /> MusicApp
        </h2>
        <div style={{color: '#b3b3b3', fontSize: '12px', marginBottom: '10px'}}>
          👤 {loggedInUser.username} ({loggedInUser.role})
        </div>
        
        <nav style={styles.nav}>
          <div style={{...styles.navItem, color: view === 'home' ? '#1DB954' : 'white'}} onClick={loadFeatured}>
            <Home size={22} /> Home
          </div>
          <div style={{...styles.navItem, color: view === 'search' ? '#1DB954' : 'white'}} onClick={() => setView('search')}>
            <Search size={22} /> Search
          </div>
          <div style={{...styles.navItem, color: view === 'history' ? '#1DB954' : 'white'}} onClick={() => setView('history')}>
            <History size={22} /> History
          </div>
          
          {/* ✅ ADMIN DASHBOARD LINK - Only show for ADMIN users */}
          {loggedInUser && loggedInUser.role === 'ADMIN' && (
            <div style={{...styles.navItem, color: view === 'admin' ? '#1DB954' : 'white'}} onClick={() => setView('admin')}>
              <BarChart3 size={22} /> Admin Dashboard
            </div>
          )}
          
          <div style={styles.navItem} onClick={handleLogout}>
            <LogOut size={22} /> Logout
          </div>
          
          <hr style={{ borderColor: '#282828', margin: '20px 0' }} />
          
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingRight:'10px', marginBottom:'15px'}}>
            <span style={{fontSize:'12px', color:'#b3b3b3', letterSpacing:'1px', fontWeight:'bold'}}>PLAYLISTS</span>
            <Plus size={16} onClick={() => setShowPlaylistModal(true)} style={{cursor:'pointer'}} title="Create Playlist"/>
          </div>
          
          <div style={styles.playlistScroll}>
            <div style={{...styles.playlistItem, color: activePlaylistId === userPlaylistId ? 'white' : '#b3b3b3'}} 
                 onClick={() => userPlaylistId && loadPlaylistSongs(userPlaylistId)}>
              <Heart size={16} fill={activePlaylistId === userPlaylistId ? "#1DB954" : "none"} 
                     color={activePlaylistId === userPlaylistId ? "#1DB954" : "currentColor"}/> 
              Liked Songs
            </div>
            
            {/* ✅ FIX: Check if playlists is array before mapping */}
            {Array.isArray(playlists) && playlists.map((p) => (
              <div key={p.id} style={styles.playlistItemContainer}>
                {renamingId === p.id ? (
                  <input 
                    defaultValue={p.name}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && renamePlaylistHandler(p.id, tempName)}
                    onBlur={() => setRenamingId(null)}
                    autoFocus
                    style={styles.renameInput}
                  />
                ) : (
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px', flex: 1, cursor: 'pointer'}} 
                       onClick={() => loadPlaylistSongs(p.id)}>
                    <Disc size={16} />
                    <span style={{flex: 1}}>{p.name}</span>
                  </div>
                )}
                
                <div style={styles.playlistActions}>
                  <Edit size={14} onClick={(e) => { 
                    e.stopPropagation(); 
                    setRenamingId(p.id); 
                    setTempName(p.name); 
                  }} title="Rename" />
                  
                  <Share2 size={14} onClick={(e) => { 
                    e.stopPropagation(); 
                    sharePlaylistHandler(p.id, p.name); 
                  }} title="Share" />
                  
                  <Play size={14} onClick={(e) => { 
                    e.stopPropagation(); 
                    autoplayPlaylist(p.id, p.name); 
                  }} title="Autoplay" />
                  
                  <Trash2 size={14} onClick={(e) => { 
                    e.stopPropagation(); 
                    deletePlaylistHandler(p.id); 
                  }} title="Delete" />
                </div>
              </div>
            ))}
          </div>
        </nav>
      </div>

      <div style={styles.main}>
        {view !== 'playing' && view !== 'admin' && (
          <div style={styles.searchBar}>
            <input style={styles.input} placeholder="Search songs..." value={query} 
                   onChange={(e) => setQuery(e.target.value)} 
                   onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
            <button onClick={handleSearch} style={styles.searchBtn}>
              <Search size={20} />
            </button>
          </div>
        )}

        {/* ✅ ADMIN DASHBOARD VIEW */}
        {view === 'admin' && loggedInUser && loggedInUser.role === 'ADMIN' && (
          <div style={styles.adminContainer}>
            <h2>📊 Admin Dashboard</h2>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <h3>👥 Total Users</h3>
                <p style={styles.statNumber}>{stats.totalUsers || 0}</p>
              </div>
              <div style={styles.statCard}>
                <h3>🎵 Total Songs</h3>
                <p style={styles.statNumber}>{stats.totalSongs || 0}</p>
              </div>
              <div style={styles.statCard}>
                <h3>📁 Total Playlists</h3>
                <p style={styles.statNumber}>{stats.totalPlaylists || 0}</p>
              </div>
            </div>
            
            <div style={styles.adminSection}>
              <h3>Recent Activity</h3>
              <p>Welcome, Admin! JWT Authentication is successfully implemented.</p>
              <p>User Role: <strong>{loggedInUser.role}</strong></p>
              <p>Features Added: JWT Authentication, Role-Based Access, Admin Dashboard</p>
            </div>
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
                  <div style={styles.moreIcon} onClick={(e) => { 
                    e.stopPropagation(); 
                    setMenuOpen(menuOpen === index ? null : index); 
                  }}>
                    <MoreVertical size={20} />
                  </div>
                  
                  {menuOpen === index && (
                    <div style={styles.contextMenu} onClick={(e) => e.stopPropagation()}>
                      <div style={styles.menuHeader}>Save to...</div>
                      <div style={styles.menuItem} onClick={() => addToSpecificPlaylist(song, userPlaylistId)}>
                        <Plus size={14}/> Liked Songs
                      </div>
                      
                      {/* ✅ FIX: Check if playlists is array before mapping */}
                      {Array.isArray(playlists) && playlists.map(p => (
                        <div key={p.id} style={styles.menuItem} onClick={() => addToSpecificPlaylist(song, p.id)}>
                          <Disc size={14}/> {p.name}
                        </div>
                      ))}
                      
                      {view === 'playlist-view' && (
                        <div style={{...styles.menuItem, color:'#ff4d4d'}} onClick={() => removeFromPlaylist(song.id)}>
                          <MinusCircle size={14}/> Remove from Playlist
                        </div>
                      )}
                      
                      <hr style={{borderColor:'#444', margin: '5px 0'}}/>
                      
                      <div style={styles.menuItem} onClick={() => copyToClipboard(song.audioUrl)}>
                        <Copy size={14}/> Copy Song URL
                      </div>
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
              <input style={styles.input} placeholder="Playlist name..." 
                     value={newPlaylistName} onChange={(e)=>setNewPlaylistName(e.target.value)} />
              <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                <button onClick={createPlaylistHandler} style={styles.saveBtn}>Create</button>
                <button onClick={()=>setShowPlaylistModal(false)} style={{...styles.saveBtn, backgroundColor:'#333'}}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showShareModal && shareInfo && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3>Share "{shareInfo.name}"</h3>
              
              {shareInfo.qrCode && (
                <img src={shareInfo.qrCode} alt="QR Code" style={{width: '150px', height: '150px', margin: '20px auto', display: 'block'}} />
              )}
              
              <div style={{background: '#333', padding: '10px', borderRadius: '5px', margin: '10px 0'}}>
                <div style={{fontSize: '12px', color: '#b3b3b3'}}>Share URL:</div>
                <div style={{fontSize: '14px', wordBreak: 'break-all'}}>{shareInfo.shareUrl}</div>
              </div>
              
              <div style={{display:'flex', gap:'10px', marginTop:'20px', flexWrap: 'wrap'}}>
                <button onClick={() => copyToClipboard(shareInfo.shareUrl)} style={styles.shareBtn}>
                  <Copy size={16}/> Copy Link
                </button>
                
                <button onClick={() => window.open(shareInfo.shareUrl, '_blank')} style={{...styles.shareBtn, background: '#333'}}>
                  <ExternalLink size={16}/> Open
                </button>
                
                {navigator.share && (
                  <button onClick={() => {
                    navigator.share({
                      title: shareInfo.name,
                      text: `Check out "${shareInfo.name}" playlist on MusicApp!`,
                      url: shareInfo.shareUrl
                    });
                  }} style={{...styles.shareBtn, background: '#1a73e8'}}>
                    <Share2 size={16}/> Share
                  </button>
                )}
                
                <button onClick={() => setShowShareModal(false)} style={{...styles.shareBtn, background: '#ff4d4d'}}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'playing' && currentSong && (
          <div style={styles.playingContainer}>
            <button onClick={() => setView('home')} style={styles.backBtn}>
              <ChevronLeft /> Back
            </button>
            
            <div style={styles.playerLayout}>
              <div style={styles.videoSection}>
                <iframe width="100%" height="480" 
                  src={`https://www.youtube.com/embed/${getYouTubeId(currentSong.audioUrl)}?autoplay=1&loop=${isLooping === 'one' ? 1 : 0}&playlist=${getYouTubeId(currentSong.audioUrl)}`} 
                  frameBorder="0" allowFullScreen style={{ borderRadius: '15px' }} 
                  title="YouTube player">
                </iframe>
              </div>
              
              <div style={styles.detailsSection}>
                <img src={currentSong.albumArtUrl} style={styles.bigArt} alt="cover" />
                <h1 style={{marginTop: '20px'}}>{currentSong.title}</h1>
                <div style={{color: '#b3b3b3', fontSize: '14px'}}>{currentSong.artist}</div>
                
                <div style={styles.controlsRow}>
                  <button onClick={() => setIsShuffle(!isShuffle)} style={{...styles.iconBtn, color: isShuffle ? '#1DB954' : 'white'}}>
                    <Shuffle size={24} />
                  </button>
                  
                  <SkipBack size={32} fill="white" onClick={() => skipSong('prev')} style={{cursor:'pointer'}}/>
                  
                  <div style={styles.playCircle}>
                    <Play size={24} fill="black" />
                  </div>
                  
                  <SkipForward size={32} fill="white" onClick={() => skipSong('next')} style={{cursor:'pointer'}}/>
                  
                  <button onClick={() => setIsLooping(isLooping === 'none' ? 'all' : isLooping === 'all' ? 'one' : 'none')} 
                          style={{...styles.iconBtn, color: isLooping !== 'none' ? '#1DB954' : 'white'}}>
                    <Repeat size={24} />
                    {isLooping === 'one' && <span style={styles.repeatOneBadge}>1</span>}
                  </button>
                </div>
                
                <div style={styles.largeVisualizer}>
                  {[...Array(24)].map((_, i) => (
                    <div key={i} className="bar" style={{ 
                      width: '5px', 
                      background: '#1DB954', 
                      borderRadius: '3px', 
                      animation: `bounce 0.4s infinite alternate ${i * 0.04}s` 
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes bounce { from { height: 6px; } to { height: 40px; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

const styles = {
  authContainer: { 
    height: '100vh', 
    width: '100vw', 
    background: 'linear-gradient(#1a1a1a, #000)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  authCard: { 
    background: '#121212', 
    padding: '50px', 
    borderRadius: '12px', 
    textAlign: 'center', 
    width: '420px', 
    boxShadow: '0 20px 50px rgba(0,0,0,0.7)' 
  },
  authInput: { 
    width: '100%', 
    padding: '14px', 
    borderRadius: '4px', 
    background: '#333', 
    border: 'none', 
    color: '#fff', 
    marginBottom: '15px', 
    outline: 'none' 
  },
  authBtn: { 
    width: '100%', 
    background: '#1DB954', 
    color: '#000', 
    border: 'none', 
    padding: '14px', 
    borderRadius: '30px', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    fontSize: '16px' 
  },
  container: { 
    backgroundColor: '#000', 
    color: 'white', 
    minHeight: '100vh', 
    display: 'flex', 
    fontFamily: 'sans-serif' 
  },
  sidebar: { 
    width: '260px', 
    padding: '24px', 
    borderRight: '1px solid #333', 
    background: '#000' 
  },
  nav: { 
    marginTop: '30px' 
  },
  navItem: { 
    display: 'flex', 
    gap: '15px', 
    marginBottom: '20px', 
    cursor: 'pointer', 
    alignItems: 'center', 
    fontWeight: 'bold', 
    fontSize: '14px',
    transition: '0.2s',
    ':hover': {
      color: '#1DB954'
    }
  },
  main: { 
    flex: 1, 
    backgroundColor: '#121212', 
    padding: '30px', 
    overflowY: 'auto' 
  },
  songGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
    gap: '25px' 
  },
  card: { 
    backgroundColor: '#181818', 
    padding: '15px', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    position: 'relative',
    transition: '0.3s',
    ':hover': {
      backgroundColor: '#282828',
      transform: 'translateY(-5px)'
    }
  },
  albumArt: { 
    width: '100%', 
    borderRadius: '8px',
    aspectRatio: '1/1',
    objectFit: 'cover'
  },
  moreIcon: { 
    position: 'absolute', 
    top: '20px', 
    right: '20px', 
    background: 'rgba(0,0,0,0.6)', 
    borderRadius: '50%', 
    padding: '5px',
    transition: '0.2s',
    ':hover': {
      background: 'rgba(0,0,0,0.8)'
    }
  },
  contextMenu: { 
    position: 'absolute', 
    top: '55px', 
    right: '10px', 
    backgroundColor: '#282828', 
    borderRadius: '8px', 
    padding: '8px', 
    zIndex: 100, 
    width: '220px', 
    boxShadow: '0 16px 24px rgba(0,0,0,0.5)',
    animation: 'fadeIn 0.2s ease'
  },
  menuHeader: { 
    padding: '8px', 
    fontSize: '11px', 
    color: '#b3b3b3', 
    fontWeight: 'bold', 
    textTransform: 'uppercase' 
  },
  menuItem: { 
    padding: '10px 8px', 
    fontSize: '13px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    color: '#b3b3b3', 
    cursor: 'pointer',
    borderRadius: '4px',
    transition: '0.2s',
    ':hover': {
      backgroundColor: '#383838',
      color: 'white'
    }
  },
  modalOverlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    backgroundColor: 'rgba(0,0,0,0.8)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease'
  },
  modal: { 
    backgroundColor: '#282828', 
    padding: '40px', 
    borderRadius: '15px', 
    width: '500px', 
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  saveBtn: { 
    backgroundColor: '#1DB954', 
    color: 'white', 
    border: 'none', 
    padding: '12px 25px', 
    borderRadius: '30px', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    flex: 1,
    transition: '0.2s',
    ':hover': {
      opacity: 0.9
    }
  },
  shareBtn: {
    backgroundColor: '#1DB954', 
    color: 'white', 
    border: 'none', 
    padding: '10px 15px', 
    borderRadius: '5px', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    flex: 1,
    minWidth: '120px',
    justifyContent: 'center',
    transition: '0.2s',
    ':hover': {
      opacity: 0.9
    }
  },
  playingContainer: { 
    animation: 'fadeIn 0.6s ease' 
  },
  backBtn: { 
    background: 'none', 
    border: '1px solid #333', 
    color: '#fff', 
    padding: '8px 20px', 
    borderRadius: '20px', 
    cursor: 'pointer', 
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: '0.2s',
    ':hover': {
      borderColor: '#1DB954',
      color: '#1DB954'
    }
  },
  playerLayout: { 
    display: 'flex', 
    gap: '40px',
    '@media (max-width: 1024px)': {
      flexDirection: 'column'
    }
  },
  videoSection: { 
    flex: 2 
  },
  detailsSection: { 
    flex: 1, 
    textAlign: 'center' 
  },
  bigArt: { 
    width: '100%', 
    maxWidth: '300px',
    height: 'auto',
    aspectRatio: '1/1',
    borderRadius: '15px', 
    boxShadow: '0 15px 40px rgba(0,0,0,0.8)' 
  },
  controlsRow: { 
    display: 'flex', 
    gap: '25px', 
    marginTop: '30px', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  playCircle: { 
    background: 'white', 
    width: '56px', 
    height: '56px', 
    borderRadius: '50%', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    cursor: 'pointer',
    transition: '0.2s',
    ':hover': {
      transform: 'scale(1.1)'
    }
  },
  iconBtn: { 
    background: 'none', 
    border: 'none', 
    cursor: 'pointer', 
    position: 'relative',
    transition: '0.2s',
    ':hover': {
      transform: 'scale(1.1)'
    }
  },
  repeatOneBadge: { 
    position: 'absolute', 
    top: '-5px', 
    right: '-5px', 
    background: '#1DB954', 
    color: 'black', 
    fontSize: '10px', 
    borderRadius: '50%', 
    width: '14px', 
    height: '14px', 
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  largeVisualizer: { 
    display: 'flex', 
    gap: '4px', 
    height: '40px', 
    justifyContent: 'center', 
    alignItems: 'flex-end', 
    marginTop: '30px' 
  },
  input: { 
    flex: 1, 
    padding: '12px 20px', 
    borderRadius: '30px', 
    border: 'none', 
    backgroundColor: '#333', 
    color: 'white', 
    width: '100%',
    outline: 'none',
    fontSize: '14px'
  },
  searchBar: { 
    display: 'flex', 
    gap: '10px', 
    marginBottom: '30px', 
    maxWidth: '500px' 
  },
  searchBtn: { 
    backgroundColor: '#1DB954', 
    border: 'none', 
    borderRadius: '50%', 
    padding: '10px', 
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: '0.2s',
    ':hover': {
      transform: 'scale(1.1)'
    }
  },
  playlistScroll: { 
    maxHeight: '450px', 
    overflowY: 'auto',
    paddingRight: '5px'
  },
  playlistItem: { 
    padding: '12px 0', 
    fontSize: '14px', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px',
    transition: '0.2s',
    ':hover': {
      color: 'white'
    }
  },
  playlistItemContainer: {
    padding: '10px 15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: '5px',
    marginBottom: '5px',
    transition: '0.2s',
    ':hover': {
      backgroundColor: '#282828'
    }
  },
  renameInput: {
    background: '#333', 
    color: 'white', 
    border: 'none', 
    padding: '8px 12px',
    borderRadius: '5px',
    flex: 1,
    fontSize: '14px',
    outline: 'none'
  },
  playlistActions: {
    display: 'flex',
    gap: '12px',
    opacity: 0.6,
    transition: '0.2s',
    ':hover': {
      opacity: 1
    }
  },
  // ✅ ADMIN DASHBOARD STYLES
  adminContainer: {
    padding: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '15px',
    color: 'white',
    animation: 'fadeIn 0.6s ease'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    margin: '20px 0'
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    backdropFilter: 'blur(10px)'
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '10px 0'
  },
  adminSection: {
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '15px',
    borderRadius: '10px',
    margin: '20px 0',
    backdropFilter: 'blur(10px)'
  }
};

export default App;