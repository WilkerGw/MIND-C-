import { useEffect, useState } from 'react';
import api from '../services/api';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Table, TableBody, TableCell, TableHead, TableRow } from '../components/ui/Table';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';

interface ServiceOrder {
    id: number;
    manualOrderNumber?: number;
    clientName: string;
    productName: string;
    createdAt: string;
    deliveryDate: string;
    status: string;
    description: string;
    serviceType: string;

    // Campos Financeiros
    totalValue: number;
    entryValue: number;
    remainingBalance: number;
}

export default function ServiceOrders() {
    const [orders, setOrders] = useState<ServiceOrder[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
    const [newStatus, setNewStatus] = useState('');

    const statusOptions = [
        { value: 'Pendente', label: 'Pendente' },
        { value: 'Em Produção', label: 'Em Produção' },
        { value: 'Aguardando Coleta', label: 'Aguardando Coleta' },
        { value: 'Concluído', label: 'Concluído' },
        { value: 'Entregue', label: 'Entregue' },
        { value: 'Cancelado', label: 'Cancelado' },
    ];

    async function carregarOrders() {
        try {
            const response = await api.get('/serviceorders');
            setOrders(response.data);
        } catch (error) {
            console.error('Erro ao buscar OS:', error);
        }
    }

    useEffect(() => {
        carregarOrders();
    }, []);

    function handleEditClick(order: ServiceOrder) {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setOpenModal(true);
    }

    async function handleSaveStatus() {
        if (!selectedOrder) return;
        try {
            await api.put(`/serviceorders/${selectedOrder.id}`, {
                status: newStatus
            });
            setOpenModal(false);
            carregarOrders();
            alert('Status atualizado!');
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            alert('Erro ao atualizar status');
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Tem certeza que deseja excluir esta Ordem de Serviço?')) return;

        try {
            await api.delete(`/serviceorders/${id}`);
            carregarOrders();
        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir OS.');
        }
    }

    // --- NOVA FUNÇÃO: QUITAR SALDO ---
    async function handleSettleBalance(id: number) {
        if (!confirm('Deseja realmente QUITAR o saldo devedor desta OS?')) return;

        try {
            await api.put(`/serviceorders/${id}/settle`);
            carregarOrders(); // Recarrega para mostrar saldo zerado
            alert('Saldo quitado com sucesso!');
        } catch (error) {
            console.error('Erro ao quitar:', error);
            alert('Erro ao processar pagamento.');
        }
    }

    function formatCurrency(value: number) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }

    function getStatusColor(status: string) {
        switch (status) {
            case 'Concluído':
            case 'Entregue':
                return 'bg-green-100 text-green-800';
            case 'Em Produção':
                return 'bg-yellow-100 text-yellow-800';
            case 'Aguardando Coleta':
                return 'bg-blue-100 text-blue-800';
            case 'Cancelado':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell as="th">Nº OS</TableCell>
                                <TableCell as="th">Cliente / Produto</TableCell>
                                <TableCell as="th">Data</TableCell>
                                <TableCell as="th">Status</TableCell>

                                {/* Colunas Financeiras */}
                                <TableCell as="th">Total</TableCell>
                                <TableCell as="th">Entrada</TableCell>
                                <TableCell as="th">Saldo (Deve)</TableCell>

                                <TableCell as="th" align="center">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id} className="hover:bg-gray-50">
                                    <TableCell>
                                        <div className="font-bold text-emerald-700">
                                            #{order.manualOrderNumber ? order.manualOrderNumber : order.id}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold text-gray-900">{order.clientName}</div>
                                        <div className="text-xs text-gray-500">{order.productName}</div>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </TableCell>

                                    {/* Dados Financeiros */}
                                    <TableCell>{formatCurrency(order.totalValue)}</TableCell>
                                    <TableCell className="text-green-600">{formatCurrency(order.entryValue)}</TableCell>
                                    <TableCell className={`font-bold ${order.remainingBalance > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                        {formatCurrency(order.remainingBalance)}
                                    </TableCell>

                                    <TableCell align="center">
                                        <div className="flex justify-center gap-2">
                                            {/* Botão QUITAR (Só aparece se tiver saldo > 0) */}
                                            {order.remainingBalance > 0 && (
                                                <button
                                                    onClick={() => handleSettleBalance(order.id)}
                                                    className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded bg-green-50"
                                                    title="Quitar Saldo Devedor"
                                                >
                                                    <AttachMoneyIcon />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleEditClick(order)}
                                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                                title="Editar Status"
                                            >
                                                <EditIcon />
                                            </button>

                                            <button
                                                onClick={() => handleDelete(order.id)}
                                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                                title="Excluir"
                                            >
                                                <DeleteIcon />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {orders.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" className="text-gray-500 py-6">
                                        Nenhuma Ordem de Serviço encontrada.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Modal de Edição */}
            <Modal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                title={`Atualizar OS #${selectedOrder?.manualOrderNumber || selectedOrder?.id}`}
            >
                <div className="space-y-4">
                    <div>
                        <p><strong>Cliente:</strong> {selectedOrder?.clientName}</p>
                        <p><strong>Saldo Devedor:</strong> {selectedOrder && formatCurrency(selectedOrder.remainingBalance)}</p>
                    </div>

                    <Select
                        label="Novo Status"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        fullWidth
                    >
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </Select>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="outline" onClick={() => setOpenModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={handleSaveStatus}>
                            Salvar Alterações
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}