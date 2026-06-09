import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:3001/api',
})

// Interceptor: agrega el token JWT a cada request automáticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Auth
export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)
export const getMe = () => api.get('/auth/me')
export const updateProfile = (data) => api.put('/auth/profile', data)

// Tweets
export const createTweet = (data) => api.post('/tweets', data)
export const getTweet = (id) => api.get(`/tweets/${id}`)
export const deleteTweet = (id) => api.delete(`/tweets/${id}`)
export const likeTweet = (id) => api.post(`/tweets/${id}/like`)
export const getTimeline = (cursor) => api.get('/tweets', { params: { cursor } })
export const getFollowingTimeline = (cursor) => api.get('/tweets/following', { params: { cursor } })

// Users
export const getProfile = (username) => api.get(`/users/${username}`)
export const getUserTweets = (username, cursor) => api.get(`/users/${username}/tweets`, { params: { cursor } })
export const followUser = (id) => api.post(`/users/${id}/follow`)
export const getFollowers = (id) => api.get(`/users/${id}/followers`)
export const getFollowing = (id) => api.get(`/users/${id}/following`)
export const getUserLikes = (username) => api.get(`/users/${username}/likes`)

// Search
export const searchUsers = (q) => api.get('/search/users', { params: { q } })

export default api