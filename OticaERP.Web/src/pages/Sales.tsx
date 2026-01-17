import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '../components/ui/Table';
import PrintIcon from '@mui/icons-material/Print';
import { printSale } from '../services/PrinterService';

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
    manualOsNumber?: number;
}

export default function Sales() {
    const [salesHistory, setSalesHistory] = useState<SaleHistory[]>([]);
    const cpfInputRef = useRef<HTMLInputElement>(null);

    // Dados da Venda
    const [cpfCliente, setCpfCliente] = useState('');
    const [clientName, setClientName] = useState('');
    const [entryValue, setEntryValue] = useState<string>('');
    const [finalPrice, setFinalPrice] = useState<string>('');
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

    const totalCartValue = cart.reduce((acc, item) => acc + item.subTotal, 0);

    useEffect(() => {
        if (cart.length > 0) {
            setFinalPrice(totalCartValue.toString());
        } else {
            setFinalPrice('');
        }
    }, [cart, totalCartValue]);

    const entryNumber = parseFloat(entryValue) || 0;
    const finalPriceNumber = parseFloat(finalPrice) || 0;
    const remainingBalance = finalPriceNumber - entryNumber;

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
            finalPrice: finalPriceNumber,
            customOsNumber: parseInt(customOsNumber),
            saleDate: saleDate ? new Date(saleDate) : new Date()
        };

        try {
            await api.post('/sales', payload);
            alert('Venda realizada com sucesso!');

            setCart([]);
            setCpfCliente('');
            setClientName('');
            setEntryValue('');
            setFinalPrice('');
            setCustomOsNumber('');
            loadSales();

            if (cpfInputRef.current) {
                cpfInputRef.current.focus();
            }
        } catch (error: any) {
            console.error("Erro na venda:", error);
            const msg = error.response?.data?.message || error.response?.data || "Erro desconhecido";
            alert("Falha na venda: " + (typeof msg === 'object' ? JSON.stringify(msg) : msg));
        }
    }

    async function handlePrint(saleId: number) {
        if (!confirm("Deseja imprimir o comprovante desta venda?")) return;
        try {
            await printSale(saleId);
            alert("Comando de impressão enviado!");
        } catch (error) {
            console.error(error);
            alert("Erro ao imprimir. Verifique se há uma impressora ativa.");
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Cabeçalho da Venda */}
                    <div className="md:col-span-3">
                        <Input
                            label="CPF do Cliente"
                            required
                            value={cpfCliente}
                            onChange={e => setCpfCliente(e.target.value)}
                            onBlur={handleSearchClient}
                            // @ts-ignore
                            ref={cpfInputRef}
                            fullWidth
                        />
                    </div>
                    <div className="md:col-span-5">
                        <Input
                            label="Nome do Cliente"
                            value={clientName}
                            disabled
                            fullWidth
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Input
                            label="Nº Manual da OS"
                            required
                            type="number"
                            value={customOsNumber}
                            onChange={e => setCustomOsNumber(e.target.value)}
                            fullWidth
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Input
                            type="date"
                            label="Data"
                            value={saleDate}
                            onChange={e => setSaleDate(e.target.value)}
                            fullWidth
                        />
                    </div>

                    <div className="col-span-12 my-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-zinc-600"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-2 bg-zinc-600 text-sm text-zinc-300 font-medium rounded-2xl">ADICIONAR PRODUTOS</span>
                            </div>
                        </div>
                    </div>

                    {/* Adicionar Produto */}
                    <div className="md:col-span-3">
                        <Input
                            label="Código do Produto"
                            value={currentProductCode}
                            onChange={e => setCurrentProductCode(e.target.value)}
                            onBlur={handleSearchProduct}
                            fullWidth
                        />
                    </div>
                    <div className="md:col-span-5">
                        <Input
                            label="Nome do Produto"
                            value={currentProductName}
                            disabled
                            fullWidth
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Input
                            label="Qtd"
                            type="number"
                            value={currentQuantity}
                            onChange={e => setCurrentQuantity(parseInt(e.target.value))}
                            fullWidth
                        />
                    </div>
                    <div className="md:col-span-2">
                        <div className="mt-1">  {/* Align with inputs */}
                            <Button variant="primary" fullWidth onClick={handleAddItem} className="h-[42px] mt-[26px]">
                                Adicionar
                            </Button>
                        </div>
                    </div>

                    {/* Resumo do Carrinho */}
                    <div className="col-span-12">
                        <div className="rounded-lg overflow-hidden mt-2">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell as="th">Produto</TableCell>
                                        <TableCell as="th">Qtd</TableCell>
                                        <TableCell as="th">Unitário</TableCell>
                                        <TableCell as="th">Subtotal</TableCell>
                                        <TableCell as="th">Ação</TableCell>
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
                                                <button
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="text-red-900 hover:text-red-700 p-1 rounded-full transition-colors cursor-pointer"
                                                >
                                                    <DeleteIcon className="w-5 h-5" />
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {cart.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" className="text-gray-500 py-6">Carrinho vazio</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* ÁREA DE TOTAIS E FINANCEIRO */}
                        <div className="mt-6 p-6 rounded-lg flex flex-col md:flex-row items-center justify-end gap-8">
                            {/* Total Geral */}
                            <div className="text-lg font-medium text-zinc-300">
                                Total Calculado: {totalCartValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>

                            {/* Input de Valor Final (Editável) */}
                            <div className="w-full md:w-48">
                                <Input
                                    label="Total Final (R$)"
                                    type="number"
                                    className="bg-zinc-800"
                                    value={finalPrice}
                                    onChange={e => setFinalPrice(e.target.value)}
                                // Remove margin bottom for cleaner layout here
                                />
                            </div>

                            {/* Input de Entrada */}
                            <div className="w-full md:w-48">
                                <Input
                                    label="Valor Entrada (R$)"
                                    type="number"
                                    className="bg-zinc-800"
                                    value={entryValue}
                                    onChange={e => setEntryValue(e.target.value)}
                                />
                            </div>

                            {/* Saldo Devedor (Calculado) */}
                            <div className="text-xl font-bold text-red-600">
                                Falta Pagar: {remainingBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                        </div>
                    </div>

                    {/* Botão Finalizar */}
                    <div className="col-span-12 mt-4">
                        <Button variant="primary" size="lg" fullWidth onClick={handleFinalizeSale}>
                            FINALIZAR VENDA
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Histórico */}
            <Card>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Histórico de Vendas</h2>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell as="th">Nº OS</TableCell>
                            <TableCell as="th">Cliente</TableCell>
                            <TableCell as="th">Resumo</TableCell>
                            <TableCell as="th">Data</TableCell>
                            <TableCell as="th">Total</TableCell>
                            <TableCell as="th">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {salesHistory.map((sale) => (
                            <TableRow key={sale.id}>
                                <TableCell><span className="font-bold">#{sale.manualOsNumber || sale.id}</span></TableCell>
                                <TableCell>{sale.clientName}</TableCell>
                                <TableCell>{sale.productsSummary}</TableCell>
                                <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                                <TableCell className="font-medium text-green-700">
                                    {sale.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </TableCell>
                                <TableCell>
                                    <button
                                        onClick={() => handlePrint(sale.id)}
                                        className="text-zinc-600 hover:text-zinc-800 p-1"
                                        title="Imprimir Comprovante"
                                    >
                                        <PrintIcon />
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}