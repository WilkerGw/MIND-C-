import { useState, useEffect, useRef } from 'react';
import {
    Box, Button, TextField, Paper, Typography, Grid, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, MenuItem, Select, InputLabel, FormControl, Chip
} from '@mui/material';
import api from '../services/api';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// Tipagem igual ao Backend (Model Product.cs)
interface Product {
    id?: number;
    productCode: string;
    name: string;
    category: string;
    stockQuantity: number;
    costPrice: number;
    sellingPrice: number;
}

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const initialForm = {
        productCode: '',
        name: '',
        category: 'Armação',
        stockQuantity: 0,
        costPrice: 0,
        sellingPrice: 0
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
                costPrice: Number(formData.costPrice),
                sellingPrice: Number(formData.sellingPrice)
                // category já é string
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

    async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/products/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(response.data.message);
            loadProducts();
        } catch (error) {
            console.error(error);
            alert('Erro ao importar produtos. Verifique o formato do arquivo.');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Gerenciar Estoque</Typography>

                <Box>
                    <input
                        type="file"
                        accept=".csv"
                        hidden
                        ref={fileInputRef}
                        onChange={handleImport}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Importar CSV
                    </Button>
                </Box>
            </Box>

            {/* Formulário */}
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <form onSubmit={handleSave}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField fullWidth label="Cód. Produto" required
                                value={formData.productCode}
                                onChange={e => setFormData({ ...formData, productCode: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <TextField fullWidth label="Nome do Produto" required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <FormControl fullWidth>
                                <InputLabel>Categoria</InputLabel>
                                <Select label="Categoria"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as string })}>
                                    <MenuItem value="Armação">Armação</MenuItem>
                                    <MenuItem value="Lente">Lente</MenuItem>
                                    <MenuItem value="Óculos Solar">Óculos Solar</MenuItem>
                                    <MenuItem value="Serviço">Serviço</MenuItem>
                                    <MenuItem value="Lente de Contato">Lente de Contato</MenuItem>
                                    <MenuItem value="Acessório">Acessório</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField fullWidth type="number" label="Qtd. Estoque"
                                value={formData.stockQuantity}
                                onChange={e => setFormData({ ...formData, stockQuantity: Number(e.target.value) })} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField fullWidth type="number" label="Preço de Custo (R$)"
                                value={formData.costPrice}
                                onChange={e => setFormData({ ...formData, costPrice: Number(e.target.value) })} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField fullWidth type="number" label="Preço de Venda (R$)"
                                value={formData.sellingPrice}
                                onChange={e => setFormData({ ...formData, sellingPrice: Number(e.target.value) })} />
                        </Grid>

                        <Grid size={12}>
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
                            <TableCell>P. Custo</TableCell>
                            <TableCell>P. Venda</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell>{p.productCode}</TableCell>
                                <TableCell>{p.name}</TableCell>
                                <TableCell>
                                    <Chip label={p.category} size="small" />
                                </TableCell>
                                <TableCell
                                    sx={{ color: p.stockQuantity < 5 ? 'red' : 'inherit', fontWeight: 'bold' }}>
                                    {p.stockQuantity}
                                </TableCell>
                                <TableCell>
                                    {p.costPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>
                                    {p.sellingPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
