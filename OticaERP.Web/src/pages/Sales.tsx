import { useState, useEffect, useRef } from 'react';
import {
    Box, Button, TextField, Paper, Typography, Grid, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, IconButton, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

interface Product {
    id: number;
    name: string;
    productCode: string;
    sellingPrice: number;
    stockQuantity: number;
}

interface CartItem {
    productCode: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subTotal: number;
}

interface SaleHistory {
    id: number;
    clientName: string;
    productsSummary: string;
    totalValue: number;
    saleDate: string;
    manualOsNumber?: number; // Novo campo
}

export default function Sales() {
    const [salesHistory, setSalesHistory] = useState<SaleHistory[]>([]);
    const cpfInputRef = useRef<HTMLInputElement>(null);

    // Dados da Venda
    const [cpfCliente, setCpfCliente] = useState('');
    const [clientName, setClientName] = useState('');
    const [entryValue, setEntryValue] = useState<string>('');
    const [finalPrice, setFinalPrice] = useState<string>(''); // Valor Final Editável
    const [customOsNumber, setCustomOsNumber] = useState<string>('');
    const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

    // Produto e Carrinho
    const [currentProductCode, setCurrentProductCode] = useState('');
    const [currentProductName, setCurrentProductName] = useState('');
    const [currentQuantity, setCurrentQuantity] = useState<number>(1);
    const [cart, setCart] = useState<CartItem[]>([]);

    useEffect(() => {
        loadSales();
    }, []);

    async function loadSales() {
        try {
            const response = await api.get('/sales');
            setSalesHistory(response.data);
        } catch (error) {
            console.error("Erro ao carregar vendas", error);
        }
    }

    // --- BUSCAR CLIENTE ---
    async function handleSearchClient() {
        if (!cpfCliente) return;
        try {
            const response = await api.get(`/clients/by-cpf/${cpfCliente}`);
            setClientName(response.data.fullName);
        } catch (error) {
            setClientName('');
            alert("Cliente não encontrado. Verifique o CPF.");
        }
    }

    // --- BUSCAR PRODUTO ---
    async function handleSearchProduct() {
        if (!currentProductCode) return;
        try {
            const response = await api.get(`/products/by-code/${currentProductCode}`);
            setCurrentProductName(response.data.name);
        } catch (error) {
            setCurrentProductName('');
            alert("Produto não encontrado com este código.");
        }
    }

    async function handleAddItem() {
        if (!currentProductCode) {
            alert("Digite o código do produto.");
            return;
        }
        if (currentQuantity <= 0) {
            alert("Quantidade deve ser maior que zero.");
            return;
        }

        try {
            const response = await api.get(`/products/by-code/${currentProductCode}`);
            const product: Product = response.data;

            if (product.stockQuantity < currentQuantity) {
                alert(`Estoque insuficiente. Disponível: ${product.stockQuantity}`);
                return;
            }

            const newItem: CartItem = {
                productCode: product.productCode,
                productName: product.name,
                quantity: currentQuantity,
                unitPrice: product.sellingPrice,
                subTotal: product.sellingPrice * currentQuantity
            };

            setCart([...cart, newItem]);

            // Limpar campos
            setCurrentProductCode('');
            setCurrentProductName('');
            setCurrentQuantity(1);

        } catch (error) {
            console.error("Erro ao buscar produto", error);
            alert("Erro ao adicionar produto. Verifique o código.");
        }
    }

    function handleRemoveItem(index: number) {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    }

    // --- CÁLCULOS FINANCEIROS ---
    const totalCartValue = cart.reduce((acc, item) => acc + item.subTotal, 0);

    // Efeito para atualizar o Valor Final sugerido sempre que o carrinho mudar
    useEffect(() => {
        if (cart.length > 0) {
            setFinalPrice(totalCartValue.toString());
        } else {
            setFinalPrice('');
        }
    }, [cart, totalCartValue]);

    const entryNumber = parseFloat(entryValue) || 0;
    const finalPriceNumber = parseFloat(finalPrice) || 0;
    const remainingBalance = finalPriceNumber - entryNumber; // Saldo baseado no editável

    async function handleFinalizeSale() {
        if (cart.length === 0) {
            alert("O carrinho está vazio.");
            return;
        }
        if (!cpfCliente || !customOsNumber) {
            alert("Preencha o CPF do cliente e o Número da OS.");
            return;
        }
        if (!clientName) {
            alert("Pesquise um cliente válido pelo CPF antes de finalizar.");
            return;
        }

        const payload = {
            cpfCliente: cpfCliente,
            items: cart.map(item => ({
                productCode: item.productCode,
                quantity: item.quantity
            })),
            entryValue: entryNumber,
            finalPrice: finalPriceNumber, // Envia o valor manual
            customOsNumber: parseInt(customOsNumber),
            saleDate: saleDate ? new Date(saleDate) : new Date()
        };

        try {
            await api.post('/sales', payload);
            alert('Venda realizada com sucesso!');

            setCart([]);
            setCpfCliente('');
            setClientName('');
            setCart([]);
            setCpfCliente('');
            setClientName('');
            setEntryValue('');
            setFinalPrice('');
            setCustomOsNumber('');
            setCustomOsNumber('');
            loadSales();

            // Focar no CPF para nova venda
            if (cpfInputRef.current) {
                cpfInputRef.current.focus();
            }
        } catch (error: any) {
            console.error("Erro na venda:", error);
            const msg = error.response?.data?.message || error.response?.data || "Erro desconhecido";
            alert("Falha na venda: " + (typeof msg === 'object' ? JSON.stringify(msg) : msg));
        }
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Nova Venda (PDV)</Typography>

            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={2}>
                    {/* Cabeçalho da Venda */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                            fullWidth
                            label="CPF do Cliente"
                            required
                            value={cpfCliente}
                            onChange={e => setCpfCliente(e.target.value)}
                            onBlur={handleSearchClient}
                            inputRef={cpfInputRef}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 5 }}>
                        <TextField
                            fullWidth
                            label="Nome do Cliente"
                            value={clientName}
                            disabled
                            variant="filled"
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 2 }}>
                        <TextField fullWidth label="Nº Manual da OS" required type="number"
                            value={customOsNumber} onChange={e => setCustomOsNumber(e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                        <TextField fullWidth type="date" label="Data" InputLabelProps={{ shrink: true }}
                            value={saleDate} onChange={e => setSaleDate(e.target.value)} />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Divider sx={{ my: 2 }}><Typography variant="caption">ADICIONAR PRODUTOS</Typography></Divider>
                    </Grid>

                    {/* Adicionar Produto */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                            fullWidth
                            label="Código do Produto"
                            value={currentProductCode}
                            onChange={e => setCurrentProductCode(e.target.value)}
                            onBlur={handleSearchProduct}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 5 }}>
                        <TextField
                            fullWidth
                            label="Nome do Produto"
                            value={currentProductName}
                            disabled
                            variant="filled"
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 2 }}>
                        <TextField fullWidth label="Qtd" type="number"
                            value={currentQuantity} onChange={e => setCurrentQuantity(parseInt(e.target.value))} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                        <Button variant="outlined" fullWidth sx={{ height: '56px' }} onClick={handleAddItem}>
                            Adicionar
                        </Button>
                    </Grid>

                    {/* Resumo do Carrinho */}
                    <Grid size={{ xs: 12 }}>
                        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Produto</TableCell>
                                        <TableCell>Qtd</TableCell>
                                        <TableCell>Unitário</TableCell>
                                        <TableCell>Subtotal</TableCell>
                                        <TableCell>Ação</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {cart.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.productName}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>R$ {item.unitPrice.toFixed(2)}</TableCell>
                                            <TableCell>R$ {item.subTotal.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <IconButton color="error" size="small" onClick={() => handleRemoveItem(index)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {cart.length === 0 && <TableRow><TableCell colSpan={5} align="center">Carrinho vazio</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* ÁREA DE TOTAIS E FINANCEIRO */}
                        <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                            <Grid container spacing={2} alignItems="center" justifyContent="flex-end">
                                {/* Total Geral */}
                                <Grid>
                                    <Typography variant="h6">
                                        Total Calculado: {totalCartValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </Typography>
                                </Grid>

                                {/* Input de Valor Final (Editável) */}
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Total Final (R$)"
                                        type="number"
                                        variant="outlined"
                                        size="small"
                                        sx={{ bgcolor: 'white' }}
                                        value={finalPrice}
                                        onChange={e => setFinalPrice(e.target.value)}
                                    />
                                </Grid>

                                {/* Input de Entrada */}
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Valor Entrada (R$)"
                                        type="number"
                                        variant="outlined"
                                        size="small"
                                        sx={{ bgcolor: 'white' }}
                                        value={entryValue}
                                        onChange={e => setEntryValue(e.target.value)}
                                    />
                                </Grid>

                                {/* Saldo Devedor (Calculado) */}
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <Typography variant="h6" color="error" sx={{ fontWeight: 'bold' }}>
                                        Falta Pagar: {remainingBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>

                    {/* Botão Finalizar */}
                    <Grid size={{ xs: 12 }}>
                        <Button variant="contained" color="success" fullWidth size="large" onClick={handleFinalizeSale}>
                            FINALIZAR VENDA
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Histórico */}
            <Typography variant="h5" gutterBottom>Histórico de Vendas</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nº OS</TableCell>
                            <TableCell>Cliente</TableCell>
                            <TableCell>Resumo</TableCell>
                            <TableCell>Data</TableCell>
                            <TableCell>Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {salesHistory.map((sale) => (
                            <TableRow key={sale.id}>
                                <TableCell><b>#{sale.manualOsNumber || sale.id}</b></TableCell>
                                <TableCell>{sale.clientName}</TableCell>
                                <TableCell>{sale.productsSummary}</TableCell>
                                <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                                <TableCell>{sale.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}