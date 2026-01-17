import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '../components/ui/Table';

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
        <div className="space-y-6">
            {/* Formulário */}
            <Card>
                <form onSubmit={handleSave}>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-3">
                            <Input
                                label="Cód. Produto"
                                required
                                value={formData.productCode}
                                onChange={e => setFormData({ ...formData, productCode: e.target.value })}
                                fullWidth
                            />
                        </div>
                        <div className="md:col-span-5">
                            <Input
                                label="Nome do Produto"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                fullWidth
                            />
                        </div>

                        <div className="md:col-span-4">
                            <Select
                                label="Categoria"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                fullWidth
                            >
                                <option value="Armação">Armação</option>
                                <option value="Lente">Lente</option>
                                <option value="Óculos Solar">Óculos Solar</option>
                                <option value="Serviço">Serviço</option>
                                <option value="Lente de Contato">Lente de Contato</option>
                                <option value="Acessório">Acessório</option>
                            </Select>
                        </div>

                        <div className="md:col-span-3">
                            <Input
                                type="number"
                                label="Qtd. Estoque"
                                value={formData.stockQuantity}
                                onChange={e => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                                fullWidth
                            />
                        </div>
                        <div className="md:col-span-3">
                            <Input
                                type="number"
                                label="Preço de Custo (R$)"
                                value={formData.costPrice}
                                onChange={e => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                                fullWidth
                            />
                        </div>
                        <div className="md:col-span-3">
                            <Input
                                type="number"
                                label="Preço de Venda (R$)"
                                value={formData.sellingPrice}
                                onChange={e => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                                fullWidth
                            />
                        </div>

                        <div className="col-span-12">
                            <Button type="submit" variant="primary">
                                Salvar Produto
                            </Button>
                        </div>
                    </div>
                </form>
            </Card>

            {/* Tabela de Listagem */}
            <Card>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell as="th">Cód</TableCell>
                            <TableCell as="th">Nome</TableCell>
                            <TableCell as="th">Categoria</TableCell>
                            <TableCell as="th">Estoque</TableCell>
                            <TableCell as="th">P. Custo</TableCell>
                            <TableCell as="th">P. Venda</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell>{p.productCode}</TableCell>
                                <TableCell>{p.name}</TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {p.category}
                                    </span>
                                </TableCell>
                                <TableCell className={p.stockQuantity < 5 ? 'text-red-600 font-bold' : 'font-bold'}>
                                    {p.stockQuantity}
                                </TableCell>
                                <TableCell>
                                    {p.costPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </TableCell>
                                <TableCell className="font-bold">
                                    {p.sellingPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
