import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8080/api'
});

export const searchSongs = (query) => API.get(`/songs/search/external?query=${query}`);
export const getRecentSongs = () => API.get('/songs/recent');
// Future ke liye login
export const loginUser = (data) => API.post('/users/login', data);