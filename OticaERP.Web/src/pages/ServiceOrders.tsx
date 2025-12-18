import { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, Select, MenuItem, FormControl,
    Button, Collapse, IconButton, Grid
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
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
            console.log("Dados recebidos da API:", response.data); // Para debug no F12
            setOrders(response.data);
        } catch (error) {
            console.error("Erro ao carregar O.S.", error);
        }
    }

    async function updateStatus(id: number, newStatus: string) {
        try {
            // Agora enviamos um Objeto JSON padrão { status: "..." }
            await api.put(`/serviceorders/${id}/status`, { status: newStatus });
            loadOrders();
        } catch (error) {
            alert('Erro ao atualizar status.');
        }
    }

    async function updateExamResult(id: number, result: string) {
        try {
            // Agora enviamos um Objeto JSON padrão { result: "..." }
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
                            <TableCell><strong>Resultado (Exames)</strong></TableCell>
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

    // LÓGICA ROBUSTA: Converte para número para garantir a comparação
    // Tipo 2 = Exame, Tipo 0 = Venda, Tipo 1 = Manutenção (se houver)
    const isExam = Number(row.type) === 2;
    const isSale = Number(row.type) === 0;

    // Limpa possíveis espaços ou aspas extras que vieram do banco antigo
    const cleanStatus = row.status ? row.status.replace(/"/g, '').trim() : "";

    const statusOptions = isSale
        ? ["Aguardando Laboratório", "Montagem Finalizada", "Disponível para Retirada", "Entregue"]
        : ["Agendado", "Compareceu", "Faltou"];

    const displayDate = new Date(row.createdDate).toLocaleDateString('pt-BR');
    const clientName = isSale ? row.sale?.client?.fullName : row.appointment?.client?.fullName;

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
                        label={isSale ? "VENDA" : "EXAME"}
                        color={isSale ? "success" : "warning"}
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
                    {/* Botões só aparecem se for EXAME e Status for "Compareceu" */}
                    {isExam && cleanStatus === "Compareceu" && (
                        <Box display="flex" gap={1}>
                            <Button
                                variant={row.examResult === "Comprou" ? "contained" : "outlined"}
                                color="success" size="small"
                                onClick={() => onUpdateResult(row.id, "Comprou")}
                            >
                                Comprou
                            </Button>
                            <Button
                                variant={row.examResult === "Não Comprou" ? "contained" : "outlined"}
                                color="error" size="small"
                                onClick={() => onUpdateResult(row.id, "Não Comprou")}
                            >
                                Não Comprou
                            </Button>
                        </Box>
                    )}
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