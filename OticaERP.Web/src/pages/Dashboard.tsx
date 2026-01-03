import { useEffect, useState } from 'react';
import {
    Box, Grid, Paper, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, LinearProgress, Chip, IconButton
} from '@mui/material';
import {
    AttachMoney, Today, TrendingUp, Engineering, AddCircle,
    PersonAdd, EventNote, Visibility
} from '@mui/icons-material';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import {
    getDashboardStats, getSalesHistory, getActiveOrders,
    type DashboardStats, type SalesHistory, type ActiveOrder
} from '../services/dashboardService';

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [history, setHistory] = useState<SalesHistory[]>([]);
    const [orders, setOrders] = useState<ActiveOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [statsData, historyData, ordersData] = await Promise.all([
                    getDashboardStats(),
                    getSalesHistory(),
                    getActiveOrders()
                ]);
                setStats(statsData);
                setHistory(historyData);
                setOrders(ordersData);
            } catch (error) {
                console.error("Erro ao carregar dados do dashboard", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) return <LinearProgress />;

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
                Painel Gerencial
            </Typography>

            {/* --- CARDS DE VENDAS --- */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Vendas Dia */}
                <Grid item xs={12} md={6} lg={4}>
                    <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#e3f2fd' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Today color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6" color="textSecondary">Vendas Hoje</Typography>
                        </Box>
                        <Typography variant="h3" fontWeight="bold" color="primary">
                            {stats?.dailySalesTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </Typography>

                        {/* Comparativo Ano Anterior */}
                        <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(255,255,255,0.6)', borderRadius: 1 }}>
                            <Typography variant="body2" color="textSecondary">Mesmo dia ano passado:</Typography>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {stats?.dailySalesPreviousYear.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Vendas Mês */}
                <Grid item xs={12} md={6} lg={4}>
                    <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#e0f2f1' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AttachMoney color="success" sx={{ mr: 1 }} />
                            <Typography variant="h6" color="textSecondary">Vendas Mês Atual</Typography>
                        </Box>
                        <Typography variant="h3" fontWeight="bold" color="success.main">
                            {stats?.monthlySalesTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Ordens Pendentes */}
                <Grid item xs={12} md={12} lg={4}>
                    <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#fff3e0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Engineering color="warning" sx={{ mr: 1 }} />
                            <Typography variant="h6" color="textSecondary">Ordens em Aberto</Typography>
                        </Box>
                        <Typography variant="h3" fontWeight="bold" color="warning.main">
                            {stats?.activeServiceOrdersCount}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Ordens não entregues ou em produção</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* --- GRÁFICO --- */}
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TrendingUp sx={{ mr: 1 }} />
                    <Typography variant="h6">Histórico de Vendas (Últimos 20 meses)</Typography>
                </Box>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart data={history}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                            <Line type="monotone" dataKey="totalValue" stroke="#1976d2" strokeWidth={3} activeDot={{ r: 8 }} name="Vendas" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Paper>

            {/* --- BOTÕES DE ATALHO --- */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={6} md={3}>
                    <Button
                        variant="contained" fullWidth size="large" color="primary"
                        startIcon={<PersonAdd />} onClick={() => navigate('/clients')}
                        sx={{ py: 2 }}
                    >
                        Novo Cliente
                    </Button>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Button
                        variant="contained" fullWidth size="large" color="secondary"
                        startIcon={<AddCircle />} onClick={() => navigate('/products')}
                        sx={{ py: 2 }}
                    >
                        Novo Produto
                    </Button>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Button
                        variant="contained" fullWidth size="large" color="success"
                        startIcon={<AttachMoney />} onClick={() => navigate('/sales')}
                        sx={{ py: 2 }}
                    >
                        Nova Venda
                    </Button>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Button
                        variant="contained" fullWidth size="large" color="info"
                        startIcon={<EventNote />} onClick={() => navigate('/prescriptions')}
                        sx={{ py: 2 }}
                    >
                        Receituário
                    </Button>
                </Grid>
            </Grid>

            {/* --- TABELA DE ORDENS ATIVAS --- */}
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Ordens de Serviço em Aberto</Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Nº OS</TableCell>
                                <TableCell>Cliente</TableCell>
                                <TableCell>Produto</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Entrega Prevista</TableCell>
                                <TableCell align="right">Saldo Devedor</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((os) => (
                                <TableRow key={os.id} hover>
                                    <TableCell>{os.manualOrderNumber}</TableCell>
                                    <TableCell>{os.clientName}</TableCell>
                                    <TableCell>{os.productName}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={os.status} size="small"
                                            color={os.status === 'Pronto' ? 'success' : 'warning'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(os.deliveryDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell align="right">
                                        {os.remainingBalance > 0 ? (
                                            <Chip
                                                label={os.remainingBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                size="small" color="error" variant="outlined"
                                            />
                                        ) : (
                                            <Chip label="Quitado" size="small" color="success" variant="outlined" />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {orders.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">Nenhuma ordem de serviço pendente.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
}
