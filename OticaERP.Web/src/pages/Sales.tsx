import { useState } from 'react';
import {
    Box, Button, TextField, Paper, Typography, Grid, Alert, Divider, Card, CardContent
} from '@mui/material';
import api from '../services/api';

export default function Sales() {
    // Estados do Formulário
    const [cpfCliente, setCpfCliente] = useState('');
    const [clienteNome, setClienteNome] = useState(''); // Para feedback visual

    const [codProduto, setCodProduto] = useState('');
    const [produtoNome, setProdutoNome] = useState(''); // Para feedback visual
    const [produtoPreco, setProdutoPreco] = useState(0);

    const [valorTotal, setValorTotal] = useState(0); // Editável
    const [quantidade, setQuantidade] = useState(1);
    const [mensagem, setMensagem] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);

    // Buscar Cliente pelo CPF ao sair do campo (onBlur)
    async function buscarCliente() {
        if (!cpfCliente) return;
        try {
            const response = await api.get(`/clients/cpf/${cpfCliente}`);
            setClienteNome(response.data.fullName);
            setMensagem(null);
        } catch (error) {
            setClienteNome('');
            setMensagem({ tipo: 'error', texto: 'Cliente não encontrado. Verifique o CPF.' });
        }
    }

    // Buscar Produto pelo Código ao sair do campo (onBlur)
    async function buscarProduto() {
        if (!codProduto) return;
        try {
            const response = await api.get(`/products/${codProduto}`);
            const prod = response.data;
            setProdutoNome(prod.name);
            setProdutoPreco(prod.price);
            setValorTotal(prod.price); // Já preenche o valor total sugerido
            setMensagem(null);

            if (prod.stockQuantity <= 0) {
                setMensagem({ tipo: 'error', texto: 'ATENÇÃO: Produto sem estoque!' });
            }
        } catch (error) {
            setProdutoNome('');
            setValorTotal(0);
            setMensagem({ tipo: 'error', texto: 'Produto não encontrado.' });
        }
    }

    // Finalizar Venda
    async function handleFinalizarVenda(e: React.FormEvent) {
        e.preventDefault();

        if (!clienteNome || !produtoNome) {
            setMensagem({ tipo: 'error', texto: 'Preencha um cliente e um produto válidos.' });
            return;
        }

        try {
            // O Backend espera: CpfCliente, CodigoProduto, ValorTotal, Quantity
            const payload = {
                cpfCliente: cpfCliente,
                codigoProduto: codProduto,
                valorTotal: Number(valorTotal),
                quantity: Number(quantidade)
            };

            const response = await api.post('/sales', payload);

            setMensagem({
                tipo: 'success',
                texto: `Venda realizada! OS #${response.data.serviceOrderId} gerada com sucesso.`
            });

            // Limpar formulário
            setCpfCliente('');
            setClienteNome('');
            setCodProduto('');
            setProdutoNome('');
            setValorTotal(0);
            setProdutoPreco(0);
            setQuantidade(1);

        } catch (error: any) {
            console.error(error);
            setMensagem({
                tipo: 'error',
                texto: error.response?.data?.message || error.response?.data || 'Erro ao realizar venda.'
            });
        }
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Nova Venda</Typography>

            {mensagem && (
                <Alert severity={mensagem.tipo} sx={{ mb: 2 }}>
                    {mensagem.texto}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Lado Esquerdo: Formulário */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <form onSubmit={handleFinalizarVenda}>
                            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>1. Dados do Cliente</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth label="CPF do Cliente"
                                        value={cpfCliente}
                                        onChange={e => setCpfCliente(e.target.value)}
                                        onBlur={buscarCliente} // Busca automática ao sair do campo
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={8}>
                                    <TextField
                                        fullWidth label="Nome do Cliente"
                                        value={clienteNome}
                                        disabled // Campo apenas leitura
                                        variant="filled"
                                    />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>2. Dados do Produto</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth label="Cód. Produto"
                                        value={codProduto}
                                        onChange={e => setCodProduto(e.target.value)}
                                        onBlur={buscarProduto} // Busca automática
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={8}>
                                    <TextField
                                        fullWidth label="Produto Identificado"
                                        value={produtoNome}
                                        disabled
                                        variant="filled"
                                    />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="h6" sx={{ mb: 2, color: 'green' }}>3. Fechamento</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth label="Preço Unitário (R$)"
                                        value={produtoPreco}
                                        disabled
                                        type="number"
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth label="Quantidade"
                                        value={quantidade}
                                        onChange={e => {
                                            const qty = Number(e.target.value);
                                            setQuantidade(qty);
                                            setValorTotal(qty * produtoPreco);
                                        }}
                                        type="number"
                                        required
                                        inputProps={{ min: 1 }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth label="Valor Total (Editável)"
                                        value={valorTotal}
                                        onChange={e => setValorTotal(Number(e.target.value))}
                                        type="number"
                                        required
                                        color="success"
                                        focused
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 4 }}>
                                <Button type="submit" variant="contained" color="success" size="large" fullWidth>
                                    FINALIZAR VENDA E GERAR O.S.
                                </Button>
                            </Box>
                        </form>
                    </Paper>
                </Grid>

                {/* Lado Direito: Resumo (Visual) */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Card sx={{ bgcolor: '#f5f5f5', height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Resumo do Pedido</Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Typography variant="subtitle2" color="text.secondary">Cliente:</Typography>
                            <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                {clienteNome || '---'}
                            </Typography>

                            <Typography variant="subtitle2" color="text.secondary">Item:</Typography>
                            <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                {produtoNome || '---'}
                            </Typography>

                            <Typography variant="subtitle2" color="text.secondary">Total a Pagar:</Typography>
                            <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                                R$ {Number(valorTotal).toFixed(2)}
                            </Typography>

                            <Box sx={{ mt: 4, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                                <Typography variant="caption" color="primary">
                                    ℹ️ Ao finalizar, uma Ordem de Serviço será aberta automaticamente no setor "Laboratório".
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}