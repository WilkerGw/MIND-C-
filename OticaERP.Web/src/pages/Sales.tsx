import { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Paper,
    Typography,
    Alert,
    Divider,
    Card,
    CardContent
} from '@mui/material';
import api from '../services/api';

export default function Sales() {
    const [dataVenda, setDataVenda] = useState(new Date().toISOString().split('T')[0]);
    const [numOSManual, setNumOSManual] = useState(''); // Estado para o número da OS

    const [cpfCliente, setCpfCliente] = useState('');
    const [clienteNome, setClienteNome] = useState('');

    const [codProduto, setCodProduto] = useState('');
    const [produtoNome, setProdutoNome] = useState('');
    const [produtoPreco, setProdutoPreco] = useState(0);

    const [valorTotal, setValorTotal] = useState(0);
    const [quantidade, setQuantidade] = useState(1);
    const [valorEntrada, setValorEntrada] = useState(0);

    const [mensagem, setMensagem] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);

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

    async function buscarProduto() {
        if (!codProduto) return;
        try {
            const response = await api.get(`/products/${codProduto}`);
            const prod = response.data;
            setProdutoNome(prod.name);
            setProdutoPreco(prod.sellingPrice);
            setValorTotal(prod.sellingPrice * quantidade);
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

    async function handleFinalizarVenda(e: React.FormEvent) {
        e.preventDefault();

        if (!clienteNome || !produtoNome) {
            setMensagem({ tipo: 'error', texto: 'Preencha um cliente e um produto válidos.' });
            return;
        }

        if (!numOSManual) {
            setMensagem({ tipo: 'error', texto: 'O Número da Ordem de Serviço é obrigatório.' });
            return;
        }

        try {
            const payload = {
                cpfCliente: cpfCliente,
                codigoProduto: codProduto,
                valorTotal: Number(valorTotal),
                quantity: Number(quantidade),
                entryValue: Number(valorEntrada),
                saleDate: new Date(dataVenda).toISOString(),
                customOsNumber: Number(numOSManual) // Envia o número manual
            };

            const response = await api.post('/sales', payload);

            // Usa o número retornado para exibir
            const osDisplay = response.data.displayOrderId;

            setMensagem({
                tipo: 'success',
                texto: `Venda realizada! OS #${osDisplay} registrada com sucesso.`
            });

            // Limpar formulário
            setCpfCliente('');
            setClienteNome('');
            setCodProduto('');
            setProdutoNome('');
            setValorTotal(0);
            setProdutoPreco(0);
            setQuantidade(1);
            setValorEntrada(0);
            setNumOSManual('');
            setDataVenda(new Date().toISOString().split('T')[0]);

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
            <Typography variant="h4" gutterBottom className="mb-6">
                Nova Venda
            </Typography>

            {mensagem && (
                <Alert severity={mensagem.tipo} sx={{ mb: 2 }}>
                    {mensagem.texto}
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Lado Esquerdo: Formulário */}
                <div className="col-span-12 md:col-span-7">
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <form onSubmit={handleFinalizarVenda}>
                            
                            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                                1. Dados Gerais
                            </Typography>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <TextField
                                    fullWidth
                                    label="Data da Venda"
                                    type="date"
                                    value={dataVenda}
                                    onChange={e => setDataVenda(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                />
                                <TextField
                                    fullWidth
                                    label="Número da OS"
                                    type="number"
                                    value={numOSManual}
                                    onChange={e => setNumOSManual(e.target.value)}
                                    placeholder="Ex: 1050"
                                    required // Campo Obrigatório
                                    error={!numOSManual}
                                    helperText="Digite o número da OS do talão"
                                />
                            </div>

                            <Divider sx={{ mb: 3 }} />

                            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                                2. Dados do Cliente
                            </Typography>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                                <div className="col-span-12 md:col-span-4">
                                    <TextField
                                        fullWidth label="CPF do Cliente"
                                        value={cpfCliente}
                                        onChange={e => setCpfCliente(e.target.value)}
                                        onBlur={buscarCliente}
                                        required
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-8">
                                    <TextField
                                        fullWidth label="Nome do Cliente"
                                        value={clienteNome}
                                        disabled variant="filled"
                                    />
                                </div>
                            </div>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                                3. Dados do Produto
                            </Typography>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                                <div className="col-span-12 md:col-span-4">
                                    <TextField
                                        fullWidth label="Cód. Produto"
                                        value={codProduto}
                                        onChange={e => setCodProduto(e.target.value)}
                                        onBlur={buscarProduto}
                                        required
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-8">
                                    <TextField
                                        fullWidth label="Produto Identificado"
                                        value={produtoNome}
                                        disabled variant="filled"
                                    />
                                </div>
                            </div>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="h6" sx={{ mb: 2, color: 'green' }}>
                                4. Fechamento e Pagamento
                            </Typography>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <TextField
                                    fullWidth label="Preço Unitário (R$)"
                                    value={produtoPreco}
                                    disabled type="number"
                                />
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
                                    slotProps={{ htmlInput: { min: 1 } }}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextField
                                    fullWidth label="Valor Total (R$)"
                                    value={valorTotal}
                                    onChange={e => setValorTotal(Number(e.target.value))}
                                    type="number"
                                    required
                                    color="secondary"
                                    focused
                                />
                                <TextField
                                    fullWidth
                                    label="Valor de Entrada (R$)"
                                    value={valorEntrada}
                                    onChange={e => setValorEntrada(Number(e.target.value))}
                                    type="number"
                                    color="success"
                                    focused
                                    helperText={`Resta a pagar: R$ ${(valorTotal - valorEntrada).toFixed(2)}`}
                                />
                            </div>

                            <Box sx={{ mt: 4 }}>
                                <Button type="submit" variant="contained" color="success" size="large" fullWidth>
                                    FINALIZAR VENDA
                                </Button>
                            </Box>
                        </form>
                    </Paper>
                </div>

                {/* Lado Direito: Resumo */}
                <div className="col-span-12 md:col-span-5">
                    <Card sx={{ bgcolor: '#f5f5f5', height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Resumo Financeiro</Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            <Typography variant="subtitle2" color="text.secondary">Data da Venda:</Typography>
                            <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                {dataVenda.split('-').reverse().join('/')}
                            </Typography>

                            {/* EXIBE A OS MANUAL NO RESUMO */}
                            <Typography variant="subtitle2" color="text.secondary">Nº OS (Manual):</Typography>
                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'blue' }}>
                                {numOSManual ? `#${numOSManual}` : '---'}
                            </Typography>

                            <Typography variant="subtitle2" color="text.secondary">Cliente:</Typography>
                            <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold' }}>{clienteNome || '---'}</Typography>

                            <Typography variant="subtitle2" color="text.secondary">Total da Venda:</Typography>
                            <Typography variant="h5" color="text.primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                                R$ {Number(valorTotal).toFixed(2)}
                            </Typography>

                            <Typography variant="subtitle2" color="text.secondary">Entrada:</Typography>
                            <Typography variant="h6" color="success.main" sx={{ mb: 2, fontWeight: 'bold' }}>
                                - R$ {Number(valorEntrada).toFixed(2)}
                            </Typography>

                            <Divider sx={{ mb: 2 }} />

                            <Typography variant="subtitle2" color="text.secondary">Saldo Devedor:</Typography>
                            <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold' }}>
                                R$ {(valorTotal - valorEntrada).toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Box>
    );
}