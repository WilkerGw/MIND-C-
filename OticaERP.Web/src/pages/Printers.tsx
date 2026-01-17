import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableRow } from '../components/ui/Table';
import { getPrinters, createPrinter, deletePrinter, testPrinter, type Printer } from '../services/PrinterService';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';

export default function Printers() {
    const [printers, setPrinters] = useState<Printer[]>([]);
    const [name, setName] = useState('');
    const [model, setModel] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [connectionPath, setConnectionPath] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadPrinters();
    }, []);

    async function loadPrinters() {
        try {
            const response = await getPrinters();
            setPrinters(response.data);
        } catch (error) {
            console.error("Erro ao carregar impressoras", error);
        }
    }

    async function handleAddPrinter() {
        if (!name || !connectionPath) {
            alert("Nome e Caminho de Conexão são obrigatórios.");
            return;
        }

        try {
            setLoading(true);
            await createPrinter({
                name,
                model,
                serialNumber,
                connectionPath,
                type: 'Thermal',
                isActive: true
            });
            alert("Impressora adicionada com sucesso!");
            setName('');
            setModel('');
            setSerialNumber('');
            setConnectionPath('');
            loadPrinters();
        } catch (error) {
            console.error("Erro ao adicionar impressora", error);
            alert("Erro ao adicionar impressora.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Tem certeza que deseja remover esta impressora?")) return;
        try {
            await deletePrinter(id);
            loadPrinters();
        } catch (error) {
            alert("Erro ao remover impressora.");
        }
    }

    async function handleTest(id: number) {
        try {
            await testPrinter(id);
            alert("Comando de teste enviado!");
        } catch (error: any) {
            const message = error.response?.data?.message || "Erro ao testar impressão. Verifique a conexão.";
            alert(message);
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Nova Impressora</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Input
                        label="Nome (Identificação)"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Ex: Elgin Balcão"
                    />
                    <Input
                        label="Modelo"
                        value={model}
                        onChange={e => setModel(e.target.value)}
                        placeholder="Ex: Elgin i9"
                    />
                    <Input
                        label="Número de Série"
                        value={serialNumber}
                        onChange={e => setSerialNumber(e.target.value)}
                    />
                    <Input
                        label="Caminho (Rede/Compartilhamento)"
                        value={connectionPath}
                        onChange={e => setConnectionPath(e.target.value)}
                        placeholder="Ex: \\PC-CAIXA\Elgin ou 192.168.0.100:9100"
                    />
                </div>
                <div className="mt-4 flex justify-end">
                    <Button variant="primary" onClick={handleAddPrinter} disabled={loading}>
                        {loading ? 'Salvando...' : 'Adicionar Impressora'}
                    </Button>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Impressoras Cadastradas</h2>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell as="th">Nome</TableCell>
                            <TableCell as="th">Modelo</TableCell>
                            <TableCell as="th">Caminho</TableCell>
                            <TableCell as="th">Serial</TableCell>
                            <TableCell as="th">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {printers.map(printer => (
                            <TableRow key={printer.id}>
                                <TableCell>{printer.name}</TableCell>
                                <TableCell>{printer.model}</TableCell>
                                <TableCell>{printer.connectionPath}</TableCell>
                                <TableCell>{printer.serialNumber}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleTest(printer.id)}
                                            className="text-blue-600 hover:text-blue-800 p-1"
                                            title="Testar Impressão"
                                        >
                                            <PrintIcon />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(printer.id)}
                                            className="text-red-600 hover:text-red-800 p-1"
                                            title="Remover"
                                        >
                                            <DeleteIcon />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
