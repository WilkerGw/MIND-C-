import { useState } from 'react';
import {
    Box, Button, TextField, Paper, Typography, Grid, Alert, Card, CardContent, Divider
} from '@mui/material';
import api from '../services/api';

export default function Appointments() {
    const [cpf, setCpf] = useState('');
    const [clientName, setClientName] = useState('');
    const [phone, setPhone] = useState(''); // Opcional: pode vir do cadastro ou editar na hora
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Buscar cliente ao sair do campo CPF
    async function searchClient() {
        if (!cpf) return;
        try {
            const response = await api.get(`/clients/cpf/${cpf}`);
            setClientName(response.data.fullName);
            setPhone(response.data.phone); // Puxa o telefone do cadastro
            setMessage(null);
        } catch (error) {
            setClientName('');
            setPhone('');
            setMessage({ type: 'error', text: 'Cliente não encontrado.' });
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();

        if (!clientName) {
            setMessage({ type: 'error', text: 'Informe um cliente válido.' });
            return;
        }

        try {
            // Combina Data e Hora para o formato ISO que o Backend espera
            // Ex: 2025-12-25T14:30:00
            const appointmentDateTime = `${date}T${time}:00`;

            const payload = {
                clientId: (await api.get(`/clients/cpf/${cpf}`)).data.id, // Busca ID fresco ou usa estado se tivesse guardado
                contactPhone: phone,
                appointmentDateTime: appointmentDateTime
            };

            await api.post('/appointments', payload);

            setMessage({
                type: 'success',
                text: 'Agendamento realizado! Ordem de Serviço de EXAME aberta automaticamente.'
            });

            // Limpar campos
            setCpf('');
            setClientName('');
            setPhone('');
            setDate('');
            setTime('');

        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: 'Erro ao realizar agendamento.' });
        }
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Agendar Exame de Vista</Typography>

            {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

            <Grid container spacing={3}>
                {/* Formulário */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <form onSubmit={handleSave}>
                            <Typography variant="h6" color="primary" gutterBottom>Dados do Paciente</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth label="CPF" required
                                        value={cpf} onChange={e => setCpf(e.target.value)}
                                        onBlur={searchClient}
                                    />
                                </Grid>
                                <Grid item xs={12} md={8}>
                                    <TextField
                                        fullWidth label="Nome do Paciente" disabled
                                        value={clientName} variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth label="Telefone de Contato" required
                                        value={phone} onChange={e => setPhone(e.target.value)}
                                        helperText="Confirme o telefone para lembretes"
                                    />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="h6" color="primary" gutterBottom>Data e Hora</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth type="date" label="Data" required
                                        InputLabelProps={{ shrink: true }}
                                        value={date} onChange={e => setDate(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth type="time" label="Hora" required
                                        InputLabelProps={{ shrink: true }}
                                        value={time} onChange={e => setTime(e.target.value)}
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 3 }}>
                                <Button type="submit" variant="contained" size="large" fullWidth>
                                    Confirmar Agendamento
                                </Button>
                            </Box>
                        </form>
                    </Paper>
                </Grid>

                {/* Card Informativo */}
                <Grid item xs={12} md={5}>
                    <Card sx={{ bgcolor: '#fff3e0' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="warning.dark">
                                📅 Fluxo de Agendamento
                            </Typography>
                            <Typography variant="body2" paragraph>
                                1. Busque o cliente pelo CPF.
                            </Typography>
                            <Typography variant="body2" paragraph>
                                2. Confirme o telefone de contato.
                            </Typography>
                            <Typography variant="body2" paragraph>
                                3. Escolha data e hora disponíveis.
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Resultado:
                            </Typography>
                            <Typography variant="caption">
                                Será criada uma Ordem de Serviço com status <strong>"Agendado"</strong>.
                                Posteriormente, você poderá marcar se o cliente <strong>Compareceu</strong> ou <strong>Faltou</strong> na tela de OS.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}