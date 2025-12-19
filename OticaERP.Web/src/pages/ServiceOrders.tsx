import { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, Select, MenuItem, FormControl,
    Button, Collapse, IconButton, Grid
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, Print } from '@mui/icons-material';
import api from '../services/api';

interface ServiceOrder {
    id: number;
    createdDate: string;
    type: number;
    status: string;
    examResult?: string;
    sale?: {
        product?: { name: string; productCode: string };
        totalValue: number;
        client?: { fullName: string; cpf: string };
    };
    appointment?: {
        appointmentDateTime: string;
        client?: { fullName: string; phone: string };
    };
}

export default function ServiceOrders() {
    const [orders, setOrders] = useState<ServiceOrder[]>([]);

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            const response = await api.get('/serviceorders');
            setOrders(response.data);
        } catch (error) {
            console.error("Erro ao carregar O.S.", error);
        }
    }

    async function updateStatus(id: number, newStatus: string) {
        try {
            await api.put(`/serviceorders/${id}/status`, { status: newStatus });
            loadOrders();
        } catch (error) {
            alert('Erro ao atualizar status.');
        }
    }

    async function updateExamResult(id: number, result: string) {
        try {
            await api.put(`/serviceorders/${id}/exam-result`, { result: result });
            loadOrders();
        } catch (error) {
            alert('Erro ao atualizar resultado do exame.');
        }
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Painel de Ordens de Serviço</Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell />
                            <TableCell><strong>Nº OS</strong></TableCell>
                            <TableCell><strong>Data</strong></TableCell>
                            <TableCell><strong>Tipo</strong></TableCell>
                            <TableCell><strong>Cliente</strong></TableCell>
                            <TableCell><strong>Status Atual</strong></TableCell>
                            <TableCell><strong>Resultado / Ações</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((os) => (
                            <Row
                                key={os.id}
                                row={os}
                                onUpdateStatus={updateStatus}
                                onUpdateResult={updateExamResult}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

function Row({ row, onUpdateStatus, onUpdateResult }: { row: ServiceOrder, onUpdateStatus: any, onUpdateResult: any }) {
    const [open, setOpen] = useState(false);

    // Tipos: 0 = Venda, 1 = Manutencao, 2 = Exame
    const isExam = Number(row.type) === 2;
    const isSale = Number(row.type) === 0;

    const cleanStatus = row.status ? row.status.replace(/"/g, '').trim() : "";

    const statusOptions = isSale
        ? ["Aguardando Laboratório", "Montagem Finalizada", "Disponível para Retirada", "Entregue"]
        : ["Agendado", "Compareceu", "Faltou"];

    const displayDate = new Date(row.createdDate).toLocaleDateString('pt-BR');
    const clientName = isSale ? row.sale?.client?.fullName : row.appointment?.client?.fullName;

    // Função para Baixar PDF
    async function handlePrint() {
        try {
            const response = await api.get(`/serviceorders/${row.id}/pdf`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `OS_${row.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Erro ao gerar PDF. Verifique se o Backend está rodando.');
        }
    }

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                </TableCell>
                <TableCell>#{row.id}</TableCell>
                <TableCell>{displayDate}</TableCell>
                <TableCell>
                    <Chip
                        label={isSale ? "VENDA" : (isExam ? "EXAME" : "MANUTENÇÃO")}
                        color={isSale ? "success" : (isExam ? "warning" : "default")}
                        size="small"
                    />
                </TableCell>
                <TableCell>{clientName || '---'}</TableCell>
                <TableCell>
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <Select
                            value={cleanStatus}
                            onChange={(e) => onUpdateStatus(row.id, e.target.value)}
                            variant="standard"
                        >
                            {statusOptions.map(opt => (
                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </TableCell>
                <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                        {/* Botão de Imprimir */}
                        <IconButton onClick={handlePrint} color="primary" title="Imprimir O.S.">
                            <Print />
                        </IconButton>

                        {/* Botões de Exame (Só aparecem se for Exame e Compareceu) */}
                        {isExam && cleanStatus === "Compareceu" && (
                            <>
                                <Button
                                    variant={row.examResult === "Comprou" ? "contained" : "outlined"}
                                    color="success" size="small" sx={{ fontSize: '0.7rem' }}
                                    onClick={() => onUpdateResult(row.id, "Comprou")}
                                >
                                    Comprou
                                </Button>
                                <Button
                                    variant={row.examResult === "Não Comprou" ? "contained" : "outlined"}
                                    color="error" size="small" sx={{ fontSize: '0.7rem' }}
                                    onClick={() => onUpdateResult(row.id, "Não Comprou")}
                                >
                                    Não
                                </Button>
                            </>
                        )}
                    </Box>
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2, padding: 2, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom component="div">Detalhes</Typography>
                            {isSale && row.sale && (
                                <Grid container spacing={2}>
                                    <Grid item xs={4}><Typography variant="body2"><strong>Produto:</strong> {row.sale.product?.name}</Typography></Grid>
                                    <Grid item xs={4}><Typography variant="body2"><strong>Cód:</strong> {row.sale.product?.productCode}</Typography></Grid>
                                    <Grid item xs={4}><Typography variant="body2"><strong>Valor:</strong> R$ {row.sale.totalValue.toFixed(2)}</Typography></Grid>
                                </Grid>
                            )}
                            {isExam && row.appointment && (
                                <Grid container spacing={2}>
                                    <Grid item xs={6}><Typography variant="body2"><strong>Data:</strong> {new Date(row.appointment.appointmentDateTime).toLocaleString('pt-BR')}</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="body2"><strong>Telefone:</strong> {row.appointment.client?.phone}</Typography></Grid>
                                </Grid>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}