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
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    IconButton,
    Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import api from '../services/api';

interface ServiceOrder {
    id: number;
    manualOrderNumber?: number;
    clientName: string;
    productName: string;
    createdAt: string;
    deliveryDate: string;
    status: string;
    description: string;
    serviceType: string;
    
    // Campos Financeiros
    totalValue: number;
    entryValue: number;
    remainingBalance: number;
}

export default function ServiceOrders() {
    const [orders, setOrders] = useState<ServiceOrder[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
    const [newStatus, setNewStatus] = useState('');

    async function carregarOrders() {
        try {
            const response = await api.get('/serviceorders');
            setOrders(response.data);
        } catch (error) {
            console.error('Erro ao buscar OS:', error);
        }
    }

    useEffect(() => {
        carregarOrders();
    }, []);

    function handleEditClick(order: ServiceOrder) {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setOpenModal(true);
    }

    async function handleSaveStatus() {
        if (!selectedOrder) return;
        try {
            await api.put(`/serviceorders/${selectedOrder.id}`, {
                status: newStatus
            });
            setOpenModal(false);
            carregarOrders();
            alert('Status atualizado!');
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            alert('Erro ao atualizar status');
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Tem certeza que deseja excluir esta Ordem de Serviço?')) return;
        
        try {
            await api.delete(`/serviceorders/${id}`);
            carregarOrders();
        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir OS.');
        }
    }

    // --- NOVA FUNÇÃO: QUITAR SALDO ---
    async function handleSettleBalance(id: number) {
        if (!confirm('Deseja realmente QUITAR o saldo devedor desta OS?')) return;

        try {
            await api.put(`/serviceorders/${id}/settle`);
            carregarOrders(); // Recarrega para mostrar saldo zerado
            alert('Saldo quitado com sucesso!');
        } catch (error) {
            console.error('Erro ao quitar:', error);
            alert('Erro ao processar pagamento.');
        }
    }

    function formatCurrency(value: number) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }

    function getStatusColor(status: string) {
        switch (status) {
            case 'Concluído': return 'success';
            case 'Entregue': return 'success';
            case 'Em Produção': return 'warning';
            case 'Aguardando Coleta': return 'info';
            case 'Cancelado': return 'error';
            default: return 'default';
        }
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Gestão de Ordens de Serviço
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nº OS</TableCell>
                            <TableCell>Cliente / Produto</TableCell>
                            <TableCell>Data</TableCell>
                            <TableCell>Status</TableCell>
                            
                            {/* Colunas Financeiras */}
                            <TableCell>Total</TableCell>
                            <TableCell>Entrada</TableCell>
                            <TableCell>Saldo (Deve)</TableCell>
                            
                            <TableCell align="center">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id} hover>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                                        #{order.manualOrderNumber ? order.manualOrderNumber : order.id}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="bold">{order.clientName}</Typography>
                                    <Typography variant="caption" color="text.secondary">{order.productName}</Typography>
                                </TableCell>
                                <TableCell>
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={order.status} 
                                        color={getStatusColor(order.status) as any} 
                                        size="small" 
                                        variant="outlined"
                                    />
                                </TableCell>
                                
                                {/* Dados Financeiros */}
                                <TableCell>{formatCurrency(order.totalValue)}</TableCell>
                                <TableCell sx={{ color: 'green' }}>{formatCurrency(order.entryValue)}</TableCell>
                                <TableCell sx={{ color: order.remainingBalance > 0 ? 'error.main' : 'text.disabled', fontWeight: 'bold' }}>
                                    {formatCurrency(order.remainingBalance)}
                                </TableCell>

                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                        {/* Botão QUITAR (Só aparece se tiver saldo > 0) */}
                                        {order.remainingBalance > 0 && (
                                            <Tooltip title="Quitar Saldo Devedor">
                                                <IconButton 
                                                    color="success" 
                                                    size="small" 
                                                    onClick={() => handleSettleBalance(order.id)}
                                                    sx={{ bgcolor: '#e8f5e9', mr: 1 }} 
                                                >
                                                    <AttachMoneyIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}

                                        <Tooltip title="Editar Status">
                                            <IconButton 
                                                color="primary" 
                                                size="small" 
                                                onClick={() => handleEditClick(order)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        
                                        <Tooltip title="Excluir">
                                            <IconButton 
                                                color="error" 
                                                size="small" 
                                                onClick={() => handleDelete(order.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {orders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    Nenhuma Ordem de Serviço encontrada.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal de Edição */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)}>
                <DialogTitle>
                    Atualizar OS #{selectedOrder?.manualOrderNumber || selectedOrder?.id}
                </DialogTitle>
                <DialogContent sx={{ minWidth: 320, mt: 1 }}>
                    <Typography variant="body2" gutterBottom>
                        <b>Cliente:</b> {selectedOrder?.clientName}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        <b>Saldo Devedor:</b> {selectedOrder && formatCurrency(selectedOrder.remainingBalance)}
                    </Typography>
                    
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Novo Status</InputLabel>
                        <Select
                            value={newStatus}
                            label="Novo Status"
                            onChange={(e) => setNewStatus(e.target.value)}
                        >
                            <MenuItem value="Pendente">Pendente</MenuItem>
                            <MenuItem value="Em Produção">Em Produção</MenuItem>
                            <MenuItem value="Aguardando Coleta">Aguardando Coleta</MenuItem>
                            <MenuItem value="Concluído">Concluído</MenuItem>
                            <MenuItem value="Entregue">Entregue</MenuItem>
                            <MenuItem value="Cancelado">Cancelado</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
                    <Button onClick={handleSaveStatus} variant="contained" color="primary">
                        Salvar Alterações
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}