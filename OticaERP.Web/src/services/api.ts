import axios from 'axios';

const api = axios.create({
    // ATENÇÃO: Confirme se o seu backend está mesmo na porta 5175
    // Olhe no terminal do backend: "Now listening on: http://localhost:xxxx"
    baseURL: 'http://localhost:5175/api' 
});

// Toda vez que fizermos uma requisição, vamos ver se tem um Token salvo
api.interceptors.request.use(config => {
    const token = localStorage.getItem('otica_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;