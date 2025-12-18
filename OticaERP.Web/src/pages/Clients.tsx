import { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Paper, Typography, Grid, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import api from '../services/api';

// Definição do Tipo Cliente (igual ao Backend)
interface Client {
    id?: number;
    fullName: string;
    cpf: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    street: string;
    district: string;
    zipCode: string;
    city: string;
}

export default function Clients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [formData, setFormData] = useState<Client>({
        fullName: '', cpf: '', phone: '', dateOfBirth: '',
        gender: '', street: '', district: '', zipCode: '', city: ''
    });

    // Carregar clientes ao abrir a tela
    useEffect(() => {
        loadClients();
    }, []);

    async function loadClients() {
        try {
            const response = await api.get('/clients');
            setClients(response.data);
        } catch (error) {
            console.error("Erro ao carregar clientes", error);
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        try {
            await api.post('/clients', formData);
            alert('Cliente cadastrado com sucesso!');
            setFormData({ // Limpar formulário
                fullName: '', cpf: '', phone: '', dateOfBirth: '',
                gender: '', street: '', district: '', zipCode: '', city: ''
            });
            loadClients(); // Recarregar lista
        } catch (error: any) {
            console.error("Erro ao salvar:", error);
            const errorMessage = error.response?.data
                ? JSON.stringify(error.response.data, null, 2)
                : 'Erro ao salvar cliente.';
            alert(errorMessage);
        }
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Gerenciar Clientes</Typography>

            {/* Formulário de Cadastro */}
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <form onSubmit={handleSave}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Nome Completo" required
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField fullWidth label="CPF" required
                                value={formData.cpf}
                                onChange={e => setFormData({ ...formData, cpf: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField fullWidth label="Telefone"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <TextField fullWidth type="date" label="Data Nascimento" InputLabelProps={{ shrink: true }}
                                value={formData.dateOfBirth}
                                onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Gênero</InputLabel>
                                <Select label="Gênero"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as string })}>
                                    <MenuItem value="Masculino">Masculino</MenuItem>
                                    <MenuItem value="Feminino">Feminino</MenuItem>
                                    <MenuItem value="Outro">Outro</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Endereço */}
                        <Grid item xs={12} md={2}>
                            <TextField fullWidth label="CEP"
                                value={formData.zipCode}
                                onChange={e => setFormData({ ...formData, zipCode: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Rua"
                                value={formData.street}
                                onChange={e => setFormData({ ...formData, street: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField fullWidth label="Bairro"
                                value={formData.district}
                                onChange={e => setFormData({ ...formData, district: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField fullWidth label="Cidade"
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })} />
                        </Grid>

                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" color="primary">
                                Cadastrar Cliente
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {/* Lista de Clientes */}
            <Typography variant="h6" gutterBottom>Clientes Cadastrados</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Nome</TableCell>
                            <TableCell>CPF</TableCell>
                            <TableCell>Telefone</TableCell>
                            <TableCell>Cidade</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {clients.map((client) => (
                            <TableRow key={client.id}>
                                <TableCell>{client.id}</TableCell>
                                <TableCell>{client.fullName}</TableCell>
                                <TableCell>{client.cpf}</TableCell>
                                <TableCell>{client.phone}</TableCell>
                                <TableCell>{client.city}</TableCell>
                            </TableRow>
                        ))}
                        {clients.length === 0 && (
                            <TableRow><TableCell colSpan={5} align="center">Nenhum cliente cadastrado.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}