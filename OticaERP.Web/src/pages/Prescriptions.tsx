import { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Paper, Typography, Alert, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, 
    DialogActions, Divider, InputAdornment
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import api from '../services/api';

// Interface completa da Receita
interface Prescription {
    id: number;
    clientName: string;
    examDate: string;
    odEsferico: string; odCilindrico: string; odEixo: number;
    oeEsferico: string; oeCilindrico: string; oeEixo: number;
    dnp: string; adicao: string; altura: string;
    observation: string;
}

export default function Prescriptions() {
    // --- ESTADOS DO FORMULÁRIO ---
    const [cpfBusca, setCpfBusca] = useState('');
    const [clienteId, setClienteId] = useState<number | null>(null);
    const [clienteNome, setClienteNome] = useState('');
    const [examDate, setExamDate] = useState('');

    // Dados Ópticos
    const [odEsf, setOdEsf] = useState(''); const [odCil, setOdCil] = useState(''); const [odEixo, setOdEixo] = useState('');
    const [oeEsf, setOeEsf] = useState(''); const [oeCil, setOeCil] = useState(''); const [oeEixo, setOeEixo] = useState('');
    const [dnp, setDnp] = useState(''); const [adicao, setAdicao] = useState(''); const [altura, setAltura] = useState('');
    const [obs, setObs] = useState('');

    // --- LISTA E MODAL ---
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [mensagem, setMensagem] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);

    useEffect(() => {
        carregarReceitas();
    }, []);

    async function carregarReceitas() {
        try {
            const response = await api.get('/prescriptions');
            setPrescriptions(response.data);
        } catch (error) {
            console.error("Erro ao carregar receitas", error);
        }
    }

    async function buscarCliente() {
        if (!cpfBusca) return;
        try {
            const response = await api.get(`/clients/cpf/${cpfBusca}`);
            setClienteId(response.data.id);
            setClienteNome(response.data.fullName);
            setMensagem(null);
        } catch (error) {
            setClienteId(null);
            setClienteNome('');
            setMensagem({ tipo: 'error', texto: 'Cliente não encontrado.' });
        }
    }

    async function handleSalvar(e: React.FormEvent) {
        e.preventDefault();
        if (!clienteId || !examDate) {
            setMensagem({ tipo: 'error', texto: 'Preencha o Cliente e a Data do Exame.' });
            return;
        }

        try {
            const payload = {
                clientId: clienteId,
                examDate: new Date(examDate).toISOString(),
                odEsferico: odEsf, odCilindrico: odCil, odEixo: Number(odEixo),
                oeEsferico: oeEsf, oeCilindrico: oeCil, oeEixo: Number(oeEixo),
                dnp: dnp, adicao: adicao, altura: altura,
                observation: obs
            };

            await api.post('/prescriptions', payload);
            setMensagem({ tipo: 'success', texto: 'Receita registrada com sucesso!' });
            
            // Limpar Campos
            setCpfBusca(''); setClienteId(null); setClienteNome(''); setExamDate('');
            setOdEsf(''); setOdCil(''); setOdEixo('');
            setOeEsf(''); setOeCil(''); setOeEixo('');
            setDnp(''); setAdicao(''); setAltura(''); setObs('');

            carregarReceitas();
        } catch (error) {
            console.error(error);
            setMensagem({ tipo: 'error', texto: 'Erro ao salvar receita.' });
        }
    }

    async function handleExcluir(id: number) {
        if(!confirm("Tem certeza que deseja apagar esta receita?")) return;
        try {
            await api.delete(`/prescriptions/${id}`);
            setPrescriptions(prev => prev.filter(p => p.id !== id));
        } catch(error) {
            alert("Erro ao excluir.");
        }
    }

    // Abre o Modal com detalhes
    const handleOpenDetails = (recipe: Prescription) => {
        setSelectedPrescription(recipe);
        setOpenModal(true);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <DescriptionIcon fontSize="large" color="primary" />
                Receituário Óptico
            </Typography>

            {mensagem && <Alert severity={mensagem.tipo} sx={{ mb: 2 }} onClose={() => setMensagem(null)}>{mensagem.texto}</Alert>}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* --- LADO ESQUERDO: FORMULÁRIO (OCUPA 8 COLUNAS) --- */}
                <div className="col-span-12 md:col-span-8">
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom color="primary">Nova Receita</Typography>
                        <form onSubmit={handleSalvar}>
                            
                            {/* Busca Cliente */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <TextField
                                    fullWidth label="CPF do Cliente"
                                    value={cpfBusca}
                                    onChange={e => setCpfBusca(e.target.value)}
                                    onBlur={buscarCliente}
                                    placeholder="Digite e aperte Tab"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={buscarCliente}><SearchIcon /></IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    fullWidth label="Cliente Identificado"
                                    value={clienteNome} disabled variant="filled"
                                    sx={{ bgcolor: clienteNome ? '#e8f5e9' : 'inherit' }}
                                />
                            </div>

                            <TextField
                                fullWidth type="date" label="Data do Exame"
                                InputLabelProps={{ shrink: true }}
                                value={examDate} onChange={e => setExamDate(e.target.value)}
                                sx={{ mb: 3 }} required
                            />

                            <Divider sx={{ my: 2 }}>Dados Ópticos</Divider>

                            {/* OLHO DIREITO */}
                            <Typography variant="subtitle2" sx={{ color: 'blue', mb: 1 }}>OLHO DIREITO (OD)</Typography>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <TextField label="Esférico" value={odEsf} onChange={e => setOdEsf(e.target.value)} size="small" />
                                <TextField label="Cilíndrico" value={odCil} onChange={e => setOdCil(e.target.value)} size="small" />
                                <TextField label="Eixo" type="number" value={odEixo} onChange={e => setOdEixo(e.target.value)} size="small" />
                            </div>

                            {/* OLHO ESQUERDO */}
                            <Typography variant="subtitle2" sx={{ color: 'blue', mb: 1 }}>OLHO ESQUERDO (OE)</Typography>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <TextField label="Esférico" value={oeEsf} onChange={e => setOeEsf(e.target.value)} size="small" />
                                <TextField label="Cilíndrico" value={oeCil} onChange={e => setOeCil(e.target.value)} size="small" />
                                <TextField label="Eixo" type="number" value={oeEixo} onChange={e => setOeEixo(e.target.value)} size="small" />
                            </div>

                            {/* ADICIONAIS */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <TextField label="DNP" value={dnp} onChange={e => setDnp(e.target.value)} size="small" />
                                <TextField label="Adição" value={adicao} onChange={e => setAdicao(e.target.value)} size="small" />
                                <TextField label="Altura" value={altura} onChange={e => setAltura(e.target.value)} size="small" />
                            </div>

                            <TextField
                                fullWidth label="Observações / Lente Sugerida"
                                multiline rows={2}
                                value={obs} onChange={e => setObs(e.target.value)}
                                sx={{ mb: 3 }}
                            />

                            <Button type="submit" variant="contained" fullWidth size="large">
                                SALVAR RECEITA
                            </Button>
                        </form>
                    </Paper>
                </div>

                {/* --- LADO DIREITO: LISTA (OCUPA 4 COLUNAS) --- */}
                <div className="col-span-12 md:col-span-4">
                    <TableContainer component={Paper} elevation={3} sx={{ maxHeight: 600 }}>
                        <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                            <Typography variant="h6">Últimas Receitas</Typography>
                        </Box>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Cliente</strong> (Clique para ver)</TableCell>
                                    <TableCell align="center">Ação</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {prescriptions.map((row) => (
                                    <TableRow 
                                        key={row.id} hover 
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell onClick={() => handleOpenDetails(row)}>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                {row.clientName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(row.examDate).toLocaleDateString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" color="error" onClick={() => handleExcluir(row.id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>

            {/* --- MODAL DE DETALHES --- */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#e3f2fd' }}>
                    Detalhes da Receita
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {selectedPrescription && (
                        <Box sx={{ pt: 1 }}>
                            <Typography variant="h6" gutterBottom>{selectedPrescription.clientName}</Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Exame realizado em: {new Date(selectedPrescription.examDate).toLocaleDateString()}
                            </Typography>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            {/* Visualização OD */}
                            <Typography variant="subtitle2" color="primary">Olho Direito (OD)</Typography>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <Typography><strong>Esf:</strong> {selectedPrescription.odEsferico || '-'}</Typography>
                                <Typography><strong>Cil:</strong> {selectedPrescription.odCilindrico || '-'}</Typography>
                                <Typography><strong>Eixo:</strong> {selectedPrescription.odEixo}°</Typography>
                            </Box>

                            {/* Visualização OE */}
                            <Typography variant="subtitle2" color="primary">Olho Esquerdo (OE)</Typography>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <Typography><strong>Esf:</strong> {selectedPrescription.oeEsferico || '-'}</Typography>
                                <Typography><strong>Cil:</strong> {selectedPrescription.oeCilindrico || '-'}</Typography>
                                <Typography><strong>Eixo:</strong> {selectedPrescription.oeEixo}°</Typography>
                            </Box>

                            <Divider sx={{ my: 1 }} />
                            
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mb: 2 }}>
                                <Typography><strong>DNP:</strong> {selectedPrescription.dnp}</Typography>
                                <Typography><strong>Adição:</strong> {selectedPrescription.adicao}</Typography>
                                <Typography><strong>Altura:</strong> {selectedPrescription.altura}</Typography>
                            </Box>

                            {selectedPrescription.observation && (
                                <Alert severity="info" icon={false} sx={{ mt: 2 }}>
                                    <strong>Obs:</strong> {selectedPrescription.observation}
                                </Alert>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)} color="primary">Fechar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}