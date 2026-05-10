import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});
// Add token to every request automatically
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('podcraft_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token expiry
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('podcraft_token');
            localStorage.removeItem('podcraft_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth endpoints
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const logoutUser = () => API.post('/auth/logout');
export const getMe = () => API.get('/auth/me');
export const updateAccount = (data) => API.put('/auth/update', data);
export const updatePassword = (data) => API.put('/auth/update-password', data);
export const deleteAccount = () => API.delete('/auth/delete');

// Episode endpoints
export const createEpisode = (data) => API.post('/episodes', data);
export const getEpisodes = () => API.get('/episodes');
export const getEpisode = (id) => API.get(`/episodes/${id}`);
export const updateEpisode = (id, data) => API.put(`/episodes/${id}`, data);
export const deleteEpisode = (id) => API.delete(`/episodes/${id}`);
export const getEpisodeHistory = () => API.get('/episodes/history');
export const addGuest = (id, data) => API.post(`/episodes/${id}/guests`, data);
export const editGuest = (id, guestId, data) => API.put(`/episodes/${id}/guests/${guestId}`, data);
export const deleteGuest = (id, guestId) => API.delete(`/episodes/${id}/guests/${guestId}`);

// Research endpoints
export const generateResearch = (episodeId) => API.post(`/research/generate/${episodeId}`);
export const refreshResearch = (episodeId) => API.post(`/research/refresh/${episodeId}`);
export const getResearch = (episodeId, params) => API.get(`/research/${episodeId}`, { params });
export const getBookmarkedTopics = (episodeId) => API.get(`/research/${episodeId}/bookmarks`);
export const bookmarkTopic = (researchId) => API.put(`/research/${researchId}/bookmark`);
export const rejectTopic = (researchId) => API.put(`/research/${researchId}/reject`);