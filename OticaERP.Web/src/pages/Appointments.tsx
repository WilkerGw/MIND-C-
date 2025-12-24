import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Paper,
    Typography,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import api from '../services/api';

// Interfaces
interface Appointment {
    id: number;
    clientName: string;
    appointmentDate: string;
    observation: string;
    status: string;
}

export default function Appointments() {
    // --- ESTADOS DO FORMULÁRIO ---
    const [cpfBusca, setCpfBusca] = useState('');
    const [clienteId, setClienteId] = useState<number | null>(null);
    const [clienteNome, setClienteNome] = useState(''); // Apenas para exibição
    
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [observation, setObservation] = useState('');
    
    // Estado da Lista
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    
    const [mensagem, setMensagem] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);

    // Carregar Dados Iniciais (Apenas agendamentos, sem lista de clientes pesada)
    useEffect(() => {
        carregarAgendamentos();
    }, []);

    async function carregarAgendamentos() {
        try {
            const response = await api.get('/appointments');
            setAppointments(response.data);
        } catch (error) {
            console.error("Erro ao carregar agendamentos", error);
        }
    }

    // --- NOVA FUNÇÃO DE BUSCA POR CPF ---
    async function buscarCliente() {
        if (!cpfBusca) return;
        
        try {
            // Tenta buscar o cliente pelo CPF digitado
            const response = await api.get(`/clients/cpf/${cpfBusca}`);
            
            // Sucesso: Preenche os dados
            setClienteId(response.data.id);
            setClienteNome(response.data.fullName);
            setMensagem(null); // Limpa erros anteriores
        } catch (error) {
            // Erro: Limpa os dados e avisa
            setClienteId(null);
            setClienteNome('');
            setMensagem({ tipo: 'error', texto: 'Cliente não encontrado. Verifique o CPF.' });
        }
    }

    // Salvar Agendamento
    async function handleAgendar(e: React.FormEvent) {
        e.preventDefault();
        
        if (!clienteId || !date || !time) {
            setMensagem({ tipo: 'error', texto: 'Preencha o CPF (busque o cliente), data e hora.' });
            return;
        }

        try {
            const dateTime = new Date(`${date}T${time}:00`).toISOString();

            await api.post('/appointments', {
                clientId: clienteId, // Usa o ID encontrado na busca
                appointmentDate: dateTime,
                observation: observation
            });

            setMensagem({ tipo: 'success', texto: 'Agendamento realizado com sucesso!' });
            
            // Limpar form
            setCpfBusca('');
            setClienteNome('');
            setClienteId(null);
            setObservation('');
            
            // Recarregar lista
            carregarAgendamentos(); 

        } catch (error) {
            console.error(error);
            setMensagem({ tipo: 'error', texto: 'Erro ao criar agendamento.' });
        }
    }

    async function handleExcluir(id: number) {
        if(!confirm("Deseja cancelar este agendamento?")) return;

        try {
            await api.delete(`/appointments/${id}`);
            setAppointments(prev => prev.filter(a => a.id !== id));
            setMensagem({ tipo: 'success', texto: 'Agendamento cancelado.' });
        } catch (error) {
            setMensagem({ tipo: 'error', texto: 'Erro ao cancelar.' });
        }
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <EventIcon fontSize="large" color="primary" />
                Gestão de Agenda
            </Typography>

            {mensagem && (
                <Alert severity={mensagem.tipo} sx={{ mb: 2 }} onClose={() => setMensagem(null)}>
                    {mensagem.texto}
                </Alert>
            )}

            {/* Layout Grid Tailwind */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* 1. Formulário (Ocupa 4 colunas) */}
                <div className="col-span-12 md:col-span-4">
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom color="primary">
                            Novo Horário
                        </Typography>
                        <form onSubmit={handleAgendar}>
                            
                            {/* CAMPO DE BUSCA CPF */}
                            <TextField
                                fullWidth
                                label="CPF do Cliente"
                                value={cpfBusca}
                                onChange={e => setCpfBusca(e.target.value)}
                                onBlur={buscarCliente} // Busca ao sair do campo
                                placeholder="Digite e aperte Tab"
                                sx={{ mb: 2 }}
                                required
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={buscarCliente}>
                                                    <SearchIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            {/* CAMPO DE NOME (READ ONLY) */}
                            <TextField
                                fullWidth
                                label="Cliente Identificado"
                                value={clienteNome}
                                disabled
                                variant="filled"
                                sx={{ mb: 2, bgcolor: clienteNome ? '#e8f5e9' : 'inherit' }}
                            />

                            <TextField
                                fullWidth
                                type="date"
                                label="Data"
                                slotProps={{ inputLabel: { shrink: true } }}
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                sx={{ mb: 2 }}
                                required
                            />

                            <TextField
                                fullWidth
                                type="time"
                                label="Hora"
                                slotProps={{ inputLabel: { shrink: true } }}
                                value={time}
                                onChange={e => setTime(e.target.value)}
                                sx={{ mb: 2 }}
                                required
                            />

                            <TextField
                                fullWidth
                                label="Observação (Ex: Exame de Vista)"
                                multiline
                                rows={2}
                                value={observation}
                                onChange={e => setObservation(e.target.value)}
                                sx={{ mb: 3 }}
                            />

                            <Button 
                                type="submit" 
                                variant="contained" 
                                fullWidth 
                                size="large"
                                disabled={!clienteId} // Bloqueia se não tiver cliente
                            >
                                Confirmar Agendamento
                            </Button>
                        </form>
                    </Paper>
                </div>

                {/* 2. Lista de Agendamentos (Ocupa 8 colunas) */}
                <div className="col-span-12 md:col-span-8">
                    <TableContainer component={Paper} elevation={3}>
                        <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                            <Typography variant="h6">Próximos Agendamentos</Typography>
                        </Box>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Data/Hora</TableCell>
                                    <TableCell>Cliente</TableCell>
                                    <TableCell>Motivo</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {appointments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                            Nenhum agendamento encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    appointments.map((row) => (
                                        <TableRow key={row.id} hover>
                                            <TableCell>
                                                {new Date(row.appointmentDate).toLocaleString('pt-BR', {
                                                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>{row.clientName}</TableCell>
                                            <TableCell>{row.observation || '-'}</TableCell>
                                            <TableCell>
                                                <Chip label="Agendado" color="primary" size="small" variant="outlined" />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton 
                                                    color="error" 
                                                    size="small"
                                                    onClick={() => handleExcluir(row.id)}
                                                    title="Cancelar Agendamento"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
        </Box>
    );
}