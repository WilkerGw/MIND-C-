import { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Paper, Typography, Grid, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, MenuItem, Select, InputLabel, FormControl, Chip
} from '@mui/material';
import api from '../services/api';

// Tipagem igual ao Backend (Model Product.cs)
interface Product {
    id?: number;
    productCode: string;
    name: string;
    category: number; // Enum no C# é tratado como número por padrão (0, 1, 2...)
    stockQuantity: number;
    price: number;
}

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);

    const initialForm = {
        productCode: '',
        name: '',
        category: 0, // 0 = Armacao (Valor padrão)
        stockQuantity: 0,
        price: 0
    };
    const [formData, setFormData] = useState<Product>(initialForm);

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error("Erro ao carregar produtos", error);
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        try {
            // Conversões necessárias para garantir que números sejam números
            const payload = {
                ...formData,
                stockQuantity: Number(formData.stockQuantity),
                price: Number(formData.price),
                category: Number(formData.category)
            };

            await api.post('/products', payload);
            alert('Produto cadastrado com sucesso!');
            setFormData(initialForm);
            loadProducts();
        } catch (error: any) {
            console.error(error);
            if (error.response?.data) {
                alert(`Erro: ${JSON.stringify(error.response.data)}`);
            } else {
                alert('Erro desconhecido ao salvar produto.');
            }
        }
    }

    // Função para traduzir o número da categoria para texto
    function getCategoryName(id: number) {
        switch (id) {
            case 0: return "Armação";
            case 1: return "Lente";
            case 2: return "Óculos Solar";
            case 3: return "Serviço";
            default: return "Desconhecido";
        }
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Gerenciar Estoque</Typography>

            {/* Formulário */}
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <form onSubmit={handleSave}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <TextField fullWidth label="Cód. Produto" required
                                value={formData.productCode}
                                onChange={e => setFormData({ ...formData, productCode: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <TextField fullWidth label="Nome do Produto" required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Categoria</InputLabel>
                                <Select label="Categoria"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: Number(e.target.value) })}>
                                    <MenuItem value={0}>Armação</MenuItem>
                                    <MenuItem value={1}>Lente</MenuItem>
                                    <MenuItem value={2}>Óculos Solar</MenuItem>
                                    <MenuItem value={3}>Serviço</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <TextField fullWidth type="number" label="Qtd. Estoque"
                                value={formData.stockQuantity}
                                onChange={e => setFormData({ ...formData, stockQuantity: Number(e.target.value) })} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField fullWidth type="number" label="Preço (R$)"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                        </Grid>

                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" color="success">
                                Salvar Produto
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {/* Tabela de Listagem */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Cód</TableCell>
                            <TableCell>Nome</TableCell>
                            <TableCell>Categoria</TableCell>
                            <TableCell>Estoque</TableCell>
                            <TableCell>Preço</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell>{p.productCode}</TableCell>
                                <TableCell>{p.name}</TableCell>
                                <TableCell>
                                    <Chip label={getCategoryName(p.category)} size="small" />
                                </TableCell>
                                <TableCell
                                    sx={{ color: p.stockQuantity < 5 ? 'red' : 'inherit', fontWeight: 'bold' }}>
                                    {p.stockQuantity}
                                </TableCell>
                                <TableCell>
                                    {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}