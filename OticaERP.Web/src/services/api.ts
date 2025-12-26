import axios from 'axios';

const api = axios.create({
    // Aponta direto para o backend rodando na sua máquina
    baseURL: 'http://localhost:5200/api'
});

// Interceptador para adicionar o Token JWT em todas as requisições
api.interceptors.request.use(config => {
    const token = localStorage.getItem('otica_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;