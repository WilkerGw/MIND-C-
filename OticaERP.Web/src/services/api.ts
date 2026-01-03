import axios from 'axios';

const api = axios.create({
    // Usa a variável de ambiente (criada no .env) ou fallback para localhost se não definida
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5200/api'
});

// Interceptador para adicionar o Token JWT em todas as requisições
api.interceptors.request.use(config => {
    const token = localStorage.getItem('otica_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptador de Resposta para tratar erros 401 (Não Autorizado)
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // Se receber 401, remove o token e redireciona pro login
            localStorage.removeItem('otica_token');
            // Opcional: Limpar outros dados de usuário se houver

            // Força o redirecionamento. Em React Router seria navigate('/login'), 
            // mas aqui no axios puro usamos window.location para garantir.
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;