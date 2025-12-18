import { useState, useContext } from 'react';
import { TextField, Button, Paper, Typography, Box, Alert } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { signIn } = useContext(AuthContext);
    const navigate = useNavigate();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        try {
            // Tenta fazer login no Backend
            const response = await api.post('/auth/login', { username, password });
            
            // Se der certo, salva o token e vai para a Home
            signIn(username, response.data.token);
            navigate('/'); 
        } catch (err: any) {
            console.error(err);
            if (err.response) {
                // Erro retornado pelo servidor (ex: 401 Unauthorized)
                setError(err.response.data || 'Usuário ou senha inválidos.');
            } else if (err.request) {
                // Erro de conexão (Servidor desligado ou porta errada)
                setError('Erro de conexão: O servidor não respondeu. Verifique se o Backend está rodando.');
            } else {
                setError('Erro desconhecido ao tentar logar.');
            }
        }
    }

    // Função para criar usuário de teste e mostrar erro detalhado se falhar
    async function handleRegisterTest() {
        setError(''); // Limpa erros anteriores
        try {
            await api.post('/auth/register', { username, password, role: 'Admin' });
            alert('Usuário criado com sucesso! Agora clique em Entrar.');
        } catch (err: any) {
            console.error(err); // Mostra detalhe no F12
            
            if (err.response) {
                // O servidor respondeu com erro (ex: Usuário já existe)
                alert(`Erro do Servidor: ${err.response.data}`);
            } else if (err.request) {
                // O servidor nem respondeu
                alert('Erro de Conexão: O servidor não respondeu. Verifique se o Backend está rodando na porta 5175.');
            } else {
                alert('Erro desconhecido: ' + err.message);
            }
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <Paper elevation={3} className="p-8 w-full max-w-sm">
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <Typography variant="h5" component="h1" className="text-blue-600 font-bold">
                        Ótica ERP
                    </Typography>
                    
                    <Typography variant="subtitle1" className="text-gray-500">
                        Acesso ao Sistema
                    </Typography>

                    {error && <Alert severity="error" className="w-full">{error}</Alert>}

                    <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
                        <TextField 
                            label="Usuário" 
                            variant="outlined" 
                            fullWidth 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField 
                            label="Senha" 
                            type="password" 
                            variant="outlined" 
                            fullWidth 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        
                        <Button type="submit" variant="contained" color="primary" size="large" fullWidth>
                            Entrar
                        </Button>
                    </form>

                    <Box mt={2}>
                         <Button onClick={handleRegisterTest} size="small" color="secondary">
                            Criar Conta de Teste (Admin)
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </div>
    );
}