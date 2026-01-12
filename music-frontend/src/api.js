import axios from 'axios';

// ✅ Base URLs
const SONGS_API = axios.create({
    baseURL: "https://mega-project-2-musicapp-production.up.railway.app/api/songs"
});

const PLAYLISTS_API = axios.create({
    baseURL: "https://mega-project-2-musicapp-production.up.railway.app/api/playlists"
});

const AUTH_API = axios.create({
    baseURL: "https://mega-project-2-musicapp-production.up.railway.app/api/auth"
});

// ✅ SONGS API
export const getRecentSongs = () => SONGS_API.get('/all');
export const searchSongs = (query) => SONGS_API.get(`/search/title?title=${query}`);
export const getFeaturedSongs = () => SONGS_API.get('/featured');
export const getSongById = (id) => SONGS_API.get(`/${id}`);
export const uploadSong = (formData) => SONGS_API.post('/upload', formData);
export const getSongsByGenre = (genre) => SONGS_API.get(`/genre/${genre}`);
export const getRecentSongsLimited = (limit) => SONGS_API.get(`/recent?limit=${limit}`);

// ✅ PLAYLISTS API
export const createPlaylist = (name, userId) => 
    PLAYLISTS_API.post(`/create?name=${encodeURIComponent(name)}&userId=${userId}`);

export const getUserPlaylists = (userId) => 
    PLAYLISTS_API.get(`/user/${userId}/all`);

export const getPlaylistById = (playlistId) => 
    PLAYLISTS_API.get(`/${playlistId}`);

export const addSongToPlaylist = (playlistId, song) => 
    PLAYLISTS_API.post(`/${playlistId}/songs`, song);

export const deletePlaylist = (playlistId) => 
    PLAYLISTS_API.delete(`/${playlistId}`);

// ✅ FIXED: Single renamePlaylist function with userId support
export const renamePlaylist = (playlistId, newName, userId = null) => {
    // Agar userId hai toh header mein bhejo
    const config = userId ? {
        headers: {
            'X-User-Id': userId
        }
    } : {};
    
    return PLAYLISTS_API.put(
        `/${playlistId}?name=${encodeURIComponent(newName)}`,
        null,
        config
    );
};

export const sharePlaylist = (playlistId) => 
    PLAYLISTS_API.get(`/${playlistId}/share`);

export const getPlaylistShareInfo = (playlistId) => 
    PLAYLISTS_API.get(`/${playlistId}/share`);

export const addExternalSongToPlaylist = (playlistId, songDTO) => 
    PLAYLISTS_API.post(`/${playlistId}/songs`, songDTO);

export const removeSongFromPlaylist = (playlistId, songId) => 
    PLAYLISTS_API.delete(`/${playlistId}/songs/${songId}`);

// ✅ AUTH API
export const loginUser = (usernameOrEmail, password) => 
    AUTH_API.post('/login', { usernameOrEmail, password });

export const registerUser = (userData) => 
    AUTH_API.post('/register', userData);

export const getAppStats = () => 
    AUTH_API.get('/stats');

export const getCurrentUser = (userId) => 
    AUTH_API.get('/me', { headers: { 'X-User-Id': userId } });

export const logoutUser = (userId) => 
    AUTH_API.post('/logout', {}, { headers: { 'X-User-Id': userId } });

// ✅ UTILITY FUNCTIONS
export const autoplayPlaylist = async (playlistId) => {
    try {
        const response = await getPlaylistById(playlistId);
        if (response.data.status === "success") {
            return response.data.data.songs || [];
        }
        return [];
    } catch (error) {
        console.error('Autoplay error:', error);
        return [];
    }
};

export const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
};

export const copyToClipboard = (text) => {
    return navigator.clipboard.writeText(text);
};

// ✅ DEFAULT EXPORT FOR ALL APIs
export default {
    // Songs
    getRecentSongs,
    searchSongs,
    getFeaturedSongs,
    getSongById,
    uploadSong,
    getSongsByGenre,
    getRecentSongsLimited,
    
    // Playlists
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addSongToPlaylist,
    deletePlaylist,
    renamePlaylist,
    sharePlaylist,
    getPlaylistShareInfo,
    addExternalSongToPlaylist,
    removeSongFromPlaylist,
    
    // Auth
    loginUser,
    registerUser,
    getAppStats,
    getCurrentUser,
    logoutUser,
    
    // Utilities
    autoplayPlaylist,
    getYouTubeId,
    copyToClipboard
};

