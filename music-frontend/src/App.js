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
  MinusCircle, Edit, Copy, ExternalLink, BarChart3, Key
} from 'lucide-react';

// ✅ PHASE 2 & 3 IMPORTS
import AdminDashboard from './components/AdminDashboard';
import Recommendations from './components/Recommendations';
import ForgotPassword from './components/ForgotPassword'; // ✅ NEW IMPORT

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
  
  // ✅ PHASE 2 & 3 STATE
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminStats, setAdminStats] = useState(null);
  
  // ✅ Auth Form state management
  const [authForm, setAuthForm] = useState({ username: '', password: '', email: '' });
  
  // ✅ FORGOT PASSWORD STATE
  const [showForgotPassword, setShowForgotPassword] = useState(false);

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
      setShowAdmin(false);
      setShowForgotPassword(false); // Reset forgot password view
    } catch (e) { console.log("Load error"); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('https://mega-project-2-musicapp-production.up.railway.app/api/auth/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) { console.log("Stats error"); }
  };

  // ✅ PHASE 2: Fetch Admin Stats
  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://mega-project-2-musicapp-production.up.railway.app/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.status === 403) {
        alert('Access denied! Admin only.');
        setShowAdmin(false);
        return;
      }
      
      const result = await res.json();
      if (result.status === "success") {
        setAdminStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    }
  };

  const fetchUserPlaylists = async (userId) => {
    try {
      const res = await fetchWithAuth(`https://mega-project-2-musicapp-production.up.railway.app/api/playlists/user/${userId}`);
      const result = await res.json();
      
      if (result.status === "success") {
        let playlistData = result.data;
        
        if (playlistData && playlistData.data) {
          playlistData = playlistData.data;
        }
        
        const playlistsArray = Array.isArray(playlistData) ? playlistData : [];
        
        if (playlistData && typeof playlistData === 'object' && !Array.isArray(playlistData)) {
          playlistsArray.push(playlistData);
        }
        
        setPlaylists(playlistsArray);
        localStorage.setItem(`userPlaylists_${userId}`, JSON.stringify(playlistsArray));
      } else {
        setPlaylists([]);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
      setPlaylists([]);
    }
  };

  const ensurePlaylistExists = async (userId) => {
    try {
      const res = await fetchWithAuth(`https://mega-project-2-musicapp-production.up.railway.app/api/playlists/user/${userId}`);
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
      return alert("Please fill all details!");
    }
    
    // Email validation
    if (!/\S+@\S+\.\S+/.test(authForm.email)) {
      return alert("Please enter a valid email address!");
    }
    
    // Password validation
    if (authForm.password.length < 6) {
      return alert("Password must be at least 6 characters!");
    }
    
    try {
      const res = await fetch(`https://mega-project-2-musicapp-production.up.railway.app/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const result = await res.json();
      if (res.ok) { 
        alert("Account created! Please login."); 
        setIsRegistering(false); 
        setAuthForm({ username: '', password: '', email: '' });
      } else { 
        alert(result.message || "Registration failed!"); 
      }
    } catch (e) { 
      console.error("Registration error:", e);
      alert("Server error. Please try again."); 
    }
  };

  // ✅ UPDATED: handleLogin with JWT token handling
  const handleLogin = async () => {
    // Client-side validation
    if (!authForm.username.trim()) {
      return alert("Username/Email is required!");
    }
    if (!authForm.password.trim()) {
      return alert("Password is required!");
    }
    if (authForm.password.length < 6) {
      return alert("Password must be at least 6 characters!");
    }
    
    try {
      const res = await fetch(`https://mega-project-2-musicapp-production.up.railway.app/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          usernameOrEmail: authForm.username, 
          password: authForm.password 
        })
      });
      
      const result = await res.json();
      
      if (result.status === "success") {
        const { token, user } = result.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setLoggedInUser(user);
        
        console.log("JWT Token stored:", token);
        console.log("User role:", user.role);
        
        setPlayHistory([]);
        setPlaylists([]);
        setUserPlaylistId(null);
        setActivePlaylistId(null);
        setCurrentSong(null);
        setView('home');
        setShowAdmin(false);
        setShowForgotPassword(false);
        
        ensurePlaylistExists(user.id);
        fetchUserPlaylists(user.id);
        
        const savedHistory = localStorage.getItem(`musicHistory_${user.id}`);
        if (savedHistory) {
          setPlayHistory(JSON.parse(savedHistory));
        } else {
          setPlayHistory([]);
        }
        
        // Clear auth form
        setAuthForm({ username: '', password: '', email: '' });
        
      } else { 
        alert(result.message || "User not found or incorrect password!"); 
      }
    } catch (e) { 
      console.error("Login error:", e);
      alert("Server error. Please try again!"); 
    }
  };

  // ✅ FIXED: Logout should ONLY clear current session
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setLoggedInUser(null);
    setPlaylists([]);
    setPlayHistory([]);
    setUserPlaylistId(null);
    setActivePlaylistId(null);
    setCurrentSong(null);
    setView('home');
    setShowAdmin(false);
    setShowForgotPassword(false);
    window.location.reload(); 
  };

  const playSong = (song) => {
    setCurrentSong(song);
    setView('playing');
    setShowAdmin(false);
    setShowForgotPassword(false);
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
      const res = await fetchWithAuth(`https://mega-project-2-musicapp-production.up.railway.app/api/playlists/${activePlaylistId}/songs/${songId}`, { 
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
    if(!window.confirm("Are you sure you want to delete this playlist?")) return;
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
        setShowAdmin(false);
        setShowForgotPassword(false);
        
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
      const basicShareInfo = {
        id: playlistId,
        name: playlistName,
        shareUrl: `https://mega-project-2-musicapp-production.up.railway.app/#/playlist/${playlistId}`,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://mega-project-2-musicapp-production.up.railway.app/#/playlist/${playlistId}`
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
      setShowAdmin(false);
      setShowForgotPassword(false);
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
        setShowAdmin(false);
        setShowForgotPassword(false);
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

  // ✅ PHASE 2: Toggle Admin Dashboard
  const toggleAdminDashboard = async () => {
    if (!showAdmin) {
      await fetchAdminStats();
    }
    setShowAdmin(!showAdmin);
    setView('home');
    setShowForgotPassword(false);
  };

  // ✅ Show Forgot Password Screen
  const showForgotPasswordScreen = () => {
    setShowForgotPassword(true);
  };

  // ✅ Go Back to Login from Forgot Password
  const goBackToLogin = () => {
    setShowForgotPassword(false);
    setAuthForm({ username: '', password: '', email: '' });
  };

  // =========================== RENDER LOGIC ===========================
  
  if (!loggedInUser) {
    // ✅ Show Forgot Password Screen
    if (showForgotPassword) {
      return <ForgotPassword onBackToLogin={goBackToLogin} />;
    }
    
    // ✅ Show Login/Register Screen
    return (
      <div style={styles.authContainer}>
        <div style={styles.authCard}>
          <Music size={50} color="#1DB954" style={{ marginBottom: '20px' }} />
          <h2 style={{ marginBottom: '30px' }}>{isRegistering ? 'Sign up for free' : 'Log in to MusicApp'}</h2>
          
          <input 
            name="username" 
            style={styles.authInput} 
            placeholder="Username or Email" 
            value={authForm.username} 
            onChange={handleAuthInputChange} 
          />
          
          {isRegistering && (
            <input 
              name="email" 
              style={styles.authInput} 
              placeholder="Email" 
              value={authForm.email} 
              onChange={handleAuthInputChange} 
            />
          )}
          
          <input 
            name="password" 
            style={styles.authInput} 
            type="password" 
            placeholder="Password (min. 6 characters)" 
            value={authForm.password} 
            onChange={handleAuthInputChange} 
          />
          
          <button 
            style={styles.authBtn} 
            onClick={isRegistering ? handleRegister : handleLogin}
          >
            {isRegistering ? 'Sign Up' : 'Log In'}
          </button>
          
          {/* Forgot Password Link - Only show on login screen */}
          {!isRegistering && (
            <div style={styles.forgotPasswordContainer}>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  showForgotPasswordScreen();
                }}
                style={styles.forgotPasswordLink}
              >
                <Key size={14} style={{ marginRight: '8px' }} />
                Forgot your password?
              </a>
            </div>
          )}
          
          <p 
            onClick={() => { 
              setIsRegistering(!isRegistering); 
              setAuthForm({username:'', email:'', password:''}); 
              setShowForgotPassword(false);
            }} 
            style={{ marginTop: '20px', fontSize: '14px', color: '#b3b3b3', cursor: 'pointer' }}
          >
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
          <div style={{...styles.navItem, color: view === 'home' && !showAdmin ? '#1DB954' : 'white'}} onClick={loadFeatured}>
            <Home size={22} /> Home
          </div>
          <div style={{...styles.navItem, color: view === 'search' ? '#1DB954' : 'white'}} onClick={() => { setView('search'); setShowAdmin(false); setShowForgotPassword(false); }}>
            <Search size={22} /> Search
          </div>
          <div style={{...styles.navItem, color: view === 'history' ? '#1DB954' : 'white'}} onClick={() => { setView('history'); setShowAdmin(false); setShowForgotPassword(false); }}>
            <History size={22} /> History
          </div>
          
          {/* ✅ PHASE 2: ADMIN DASHBOARD LINK - Only show for ADMIN users */}
          {loggedInUser && loggedInUser.role === 'ADMIN' && (
            <div style={{...styles.navItem, color: showAdmin ? '#1DB954' : 'white'}} onClick={toggleAdminDashboard}>
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
        {/* ✅ PHASE 2: ADMIN DASHBOARD */}
        {showAdmin && loggedInUser && loggedInUser.role === 'ADMIN' ? (
          <AdminDashboard />
        ) : (
          <>
            {view !== 'playing' && (
              <div style={styles.searchBar}>
                <input style={styles.input} placeholder="Search songs..." value={query} 
                       onChange={(e) => setQuery(e.target.value)} 
                       onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
                <button onClick={handleSearch} style={styles.searchBtn}>
                  <Search size={20} />
                </button>
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

            {view === 'playing' && currentSong && (
              <div style={styles.playingContainer}>
                <button onClick={() => { setView('home'); setShowAdmin(false); setShowForgotPassword(false); }} style={styles.backBtn}>
                  <ChevronLeft /> Back
                </button>
                
                <div style={styles.playerLayout}>
                  <div style={styles.videoSection}>
                    <iframe 
                      width="100%" 
                      height="480" 
                      src={`https://www.youtube.com/embed/${getYouTubeId(currentSong.audioUrl)}?autoplay=1&loop=${isLooping === 'one' ? 1 : 0}&playlist=${getYouTubeId(currentSong.audioUrl)}`} 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen 
                      style={{ borderRadius: '15px' }} 
                      title="YouTube player"
                    >
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
                
                {/* ✅ PHASE 3: RECOMMENDATIONS */}
                <div style={{marginTop: '40px'}}>
                  <Recommendations 
                    currentSong={currentSong} 
                    onSelectSong={(song) => {
                      playSong(song);
                    }}
                  />
                </div>
              </div>
            )}
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
    outline: 'none',
    fontSize: '14px'
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
    fontSize: '16px',
    transition: '0.2s',
    ':hover': {
      opacity: 0.9,
      transform: 'translateY(-2px)'
    }
  },
  forgotPasswordContainer: {
    marginTop: '15px',
    textAlign: 'center'
  },
  forgotPasswordLink: {
    color: '#1DB954',
    fontSize: '14px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: '0.2s',
    ':hover': {
      textDecoration: 'underline'
    }
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
  }
};

export default App;

