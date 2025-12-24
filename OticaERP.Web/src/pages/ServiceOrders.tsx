import { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../services/api';

// Interface atualizada com os novos campos
interface ServiceOrder {
    id: number;
    clientName: string;
    productName: string;
    serviceType: string;
    status: string;
    totalValue: number;     // Total
    entryValue: number;     // Entrada
    remainingValue: number; // Saldo
    createdAt: string;
    deliveryDate: string;
}

export default function ServiceOrders() {
    const [orders, setOrders] = useState<ServiceOrder[]>([]);

    useEffect(() => {
        api.get('/serviceorders')
            .then(response => setOrders(response.data))
            .catch(error => console.error("Erro ao buscar OS:", error));
    }, []);

    const handleConcluir = async (id: number) => {
        try {
            await api.put(`/serviceorders/${id}/status`, "Concluída", {
                headers: { "Content-Type": "application/json" }
            });
            setOrders(prev => prev.map(order => 
                order.id === id ? { ...order, status: "Concluída" } : order
            ));
        } catch (error) {
            console.error("Erro ao atualizar status", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'concluída': return 'success';
            case 'pendente': return 'warning';
            case 'cancelada': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                Ordens de Serviço
            </Typography>

            <TableContainer component={Paper} elevation={3}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell><strong>ID</strong></TableCell>
                            <TableCell><strong>Cliente</strong></TableCell>
                            <TableCell><strong>Produto</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            
                            {/* Novas Colunas Financeiras */}
                            <TableCell align="right"><strong>Total</strong></TableCell>
                            <TableCell align="right" sx={{ color: 'primary.main' }}><strong>Entrada</strong></TableCell>
                            <TableCell align="right" sx={{ color: 'red' }}><strong>Saldo Devedor</strong></TableCell>
                            
                            <TableCell><strong>Entrega</strong></TableCell>
                            <TableCell align="center"><strong>Ações</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((row) => (
                            <TableRow key={row.id} hover>
                                <TableCell>#{row.id}</TableCell>
                                <TableCell>{row.clientName}</TableCell>
                                <TableCell>{row.productName}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={row.status} 
                                        color={getStatusColor(row.status)} 
                                        size="small" 
                                    />
                                </TableCell>
                                
                                {/* 1. Valor Total */}
                                <TableCell align="right">
                                    R$ {row.totalValue.toFixed(2)}
                                </TableCell>

                                {/* 2. Valor de Entrada (Azul) */}
                                <TableCell align="right" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                    R$ {row.entryValue.toFixed(2)}
                                </TableCell>

                                {/* 3. Saldo Devedor (Vermelho ou Verde se pago) */}
                                <TableCell align="right" sx={{ color: row.remainingValue > 0 ? 'error.main' : 'success.main', fontWeight: 'bold' }}>
                                    {row.remainingValue > 0 
                                        ? `R$ ${row.remainingValue.toFixed(2)}` 
                                        : 'Pago'}
                                </TableCell>

                                <TableCell>
                                    {new Date(row.deliveryDate).toLocaleDateString()}
                                </TableCell>
                                
                                <TableCell align="center">
                                    <Tooltip title="Editar/Detalhes">
                                        <IconButton size="small" color="primary">
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    {row.status !== 'Concluída' && (
                                        <Tooltip title="Concluir O.S.">
                                            <IconButton size="small" color="success" onClick={() => handleConcluir(row.id)}>
                                                <CheckCircleIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}