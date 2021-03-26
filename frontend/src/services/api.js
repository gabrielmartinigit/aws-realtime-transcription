import axios from 'axios';

const api = axios.create({
    baseURL: 'http://0.0.0.0:5000'
});

export default api;