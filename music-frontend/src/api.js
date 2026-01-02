import axios from 'axios';

// ✅ Define the API instance first
const API = axios.create({
    baseURL: "http://localhost:8080/api/songs"
});

// ✅ Now export the functions using that 'API' instance
export const getRecentSongs = () => API.get('/all'); 

export const searchSongs = (query) => API.get(`/search/title?title=${query}`);
// Future ke liye login
export const loginUser = (data) => API.post('/users/login', data);