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
    Tooltip,
    Select,
    MenuItem,
    FormControl
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PaymentsIcon from '@mui/icons-material/Payments';
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

const STATUS_OPTIONS = [
    "Aguardando Coleta",
    "Aguardando Laboratório",
    "Disponivel para Retirada",
    "Entregue"
];

export default function ServiceOrders() {
    const [orders, setOrders] = useState<ServiceOrder[]>([]);

    useEffect(() => {
        api.get('/serviceorders')
            .then(response => setOrders(response.data))
            .catch(error => console.error("Erro ao buscar OS:", error));
    }, []);

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            await api.put(`/serviceorders/${id}/status`, `"${newStatus}"`, {
                headers: { "Content-Type": "application/json" }
            });
            setOrders(prev => prev.map(order =>
                order.id === id ? { ...order, status: newStatus } : order
            ));
        } catch (error) {
            console.error("Erro ao atualizar status", error);
        }
    };

    const handleSettleBalance = async (id: number) => {
        if (!window.confirm("Deseja marcar o saldo como pago?")) return;

        try {
            await api.put(`/serviceorders/${id}/pay`);
            // Recarrega a lista para garantir que todos os valores (Total, Entrada, Saldo) estejam sincronizados
            const response = await api.get('/serviceorders');
            setOrders(response.data);
        } catch (error) {
            console.error("Erro ao quitar saldo", error);
            alert("Erro ao processar pagamento. Verifique o console.");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Aguardando Coleta': return 'warning';
            case 'Aguardando Laboratório': return 'info';
            case 'Disponivel para Retirada': return 'primary';
            case 'Entregue': return 'success';
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
                                <TableCell sx={{ minWidth: 200 }}>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={STATUS_OPTIONS.includes(row.status) ? row.status : "Aguardando Coleta"}
                                            onChange={(e) => handleStatusChange(row.id, e.target.value)}
                                            sx={{
                                                bgcolor: 'white',
                                                '& .MuiSelect-select': {
                                                    py: 0.5,
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }
                                            }}
                                            renderValue={(selected) => (
                                                <Chip
                                                    label={selected}
                                                    color={getStatusColor(selected)}
                                                    size="small"
                                                    sx={{ fontWeight: 'bold' }}
                                                />
                                            )}
                                        >
                                            {STATUS_OPTIONS.map((option) => (
                                                <MenuItem key={option} value={option}>
                                                    <Chip
                                                        label={option}
                                                        color={getStatusColor(option)}
                                                        size="small"
                                                        sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                                                    />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
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
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                        {row.remainingValue > 0.01 ? (
                                            <>
                                                <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                                                    R$ {row.remainingValue.toFixed(2)}
                                                </Typography>
                                                <Tooltip title="Baixar Pagamento">
                                                    <IconButton
                                                        size="small"
                                                        color="success"
                                                        onClick={() => handleSettleBalance(row.id)}
                                                    >
                                                        <PaymentsIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        ) : (
                                            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                                Pago
                                            </Typography>
                                        )}
                                    </Box>
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
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
