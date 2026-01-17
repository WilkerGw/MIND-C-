import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';

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
            const response = await api.get(`/clients/by-cpf/${cpfBusca}`);
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
        if (!confirm("Tem certeza que deseja apagar esta receita?")) return;
        try {
            await api.delete(`/prescriptions/${id}`);
            setPrescriptions(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            alert("Erro ao excluir.");
        }
    }

    // Abre o Modal com detalhes
    const handleOpenDetails = (recipe: Prescription) => {
        setSelectedPrescription(recipe);
        setOpenModal(true);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <DescriptionIcon className="text-blue-600" style={{ fontSize: 40 }} />
                Receituário Óptico
            </h1>

            {mensagem && (
                <div className={`p-4 rounded-md ${mensagem.tipo === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {mensagem.texto}
                    <button onClick={() => setMensagem(null)} className="float-right font-bold ml-2">x</button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* --- LADO ESQUERDO: FORMULÁRIO (OCUPA 8 COLUNAS) --- */}
                <div className="col-span-12 md:col-span-8">
                    <Card>
                        <h2 className="text-xl font-semibold text-blue-600 mb-4">Nova Receita</h2>
                        <form onSubmit={handleSalvar}>

                            {/* Busca Cliente */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="relative">
                                    <Input
                                        label="CPF do Cliente"
                                        value={cpfBusca}
                                        onChange={e => setCpfBusca(e.target.value)}
                                        onBlur={buscarCliente}
                                        placeholder="Digite e aperte Tab"
                                        fullWidth
                                    />
                                    <button
                                        type="button"
                                        onClick={buscarCliente}
                                        className="absolute right-2 top-[34px] text-gray-400 hover:text-gray-600"
                                    >
                                        <SearchIcon />
                                    </button>
                                </div>
                                <Input
                                    label="Cliente Identificado"
                                    value={clienteNome}
                                    disabled
                                    fullWidth
                                    className={clienteNome ? 'bg-green-50' : ''}
                                />
                            </div>

                            <div className="mb-6">
                                <Input
                                    type="date"
                                    label="Data do Exame"
                                    value={examDate}
                                    onChange={e => setExamDate(e.target.value)}
                                    required
                                    fullWidth
                                />
                            </div>

                            <div className="border-t border-gray-200 my-4 pt-4">
                                <h3 className="text-lg font-medium text-gray-700 mb-2">Dados Ópticos</h3>
                            </div>

                            {/* OLHO DIREITO */}
                            <h4 className="text-sm font-bold text-blue-600 mb-2">OLHO DIREITO (OD)</h4>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <Input label="Esférico" value={odEsf} onChange={e => setOdEsf(e.target.value)} />
                                <Input label="Cilíndrico" value={odCil} onChange={e => setOdCil(e.target.value)} />
                                <Input label="Eixo" type="number" value={odEixo} onChange={e => setOdEixo(e.target.value)} />
                            </div>

                            {/* OLHO ESQUERDO */}
                            <h4 className="text-sm font-bold text-blue-600 mb-2">OLHO ESQUERDO (OE)</h4>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <Input label="Esférico" value={oeEsf} onChange={e => setOeEsf(e.target.value)} />
                                <Input label="Cilíndrico" value={oeCil} onChange={e => setOeCil(e.target.value)} />
                                <Input label="Eixo" type="number" value={oeEixo} onChange={e => setOeEixo(e.target.value)} />
                            </div>

                            {/* ADICIONAIS */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <Input label="DNP" value={dnp} onChange={e => setDnp(e.target.value)} />
                                <Input label="Adição" value={adicao} onChange={e => setAdicao(e.target.value)} />
                                <Input label="Altura" value={altura} onChange={e => setAltura(e.target.value)} />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Observações / Lente Sugerida
                                </label>
                                <textarea
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    rows={3}
                                    value={obs}
                                    onChange={e => setObs(e.target.value)}
                                />
                            </div>

                            <Button type="submit" variant="primary" fullWidth size="lg">
                                SALVAR RECEITA
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* --- LADO DIREITO: LISTA (OCUPA 4 COLUNAS) --- */}
                <div className="col-span-12 md:col-span-4">
                    <Card className="h-full">
                        <div className="bg-gray-50 -mx-6 -mt-6 p-4 border-b border-gray-200 mb-4 rounded-t-lg">
                            <h3 className="text-lg font-medium text-gray-800">Últimas Receitas</h3>
                        </div>
                        <div className="overflow-auto max-h-[600px]">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell as="th"><strong>Cliente</strong> (Clique para ver)</TableCell>
                                        <TableCell as="th" align="center">Ação</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {prescriptions.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                            <TableCell onClick={() => handleOpenDetails(row)}>
                                                <div className="font-bold text-blue-600">
                                                    {row.clientName}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(row.examDate).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell align="center">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleExcluir(row.id); }}
                                                    className="text-red-600 hover:text-red-800 p-1"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>
            </div>

            {/* --- MODAL DE DETALHES --- */}
            <Modal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                title="Detalhes da Receita"
            >
                {selectedPrescription && (
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-xl font-bold text-gray-900">{selectedPrescription.clientName}</h4>
                            <p className="text-sm text-gray-500">
                                Exame realizado em: {new Date(selectedPrescription.examDate).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            {/* Visualização OD */}
                            <h5 className="text-sm font-bold text-blue-600 mb-2">Olho Direito (OD)</h5>
                            <div className="flex gap-4 mb-4 bg-blue-50 p-2 rounded">
                                <p><strong>Esf:</strong> {selectedPrescription.odEsferico || '-'}</p>
                                <p><strong>Cil:</strong> {selectedPrescription.odCilindrico || '-'}</p>
                                <p><strong>Eixo:</strong> {selectedPrescription.odEixo}°</p>
                            </div>

                            {/* Visualização OE */}
                            <h5 className="text-sm font-bold text-blue-600 mb-2">Olho Esquerdo (OE)</h5>
                            <div className="flex gap-4 mb-4 bg-blue-50 p-2 rounded">
                                <p><strong>Esf:</strong> {selectedPrescription.oeEsferico || '-'}</p>
                                <p><strong>Cil:</strong> {selectedPrescription.oeCilindrico || '-'}</p>
                                <p><strong>Eixo:</strong> {selectedPrescription.oeEixo}°</p>
                            </div>

                            <div className="border-t border-gray-200 my-2 pt-2 grid grid-cols-3 gap-2">
                                <p><strong>DNP:</strong> {selectedPrescription.dnp}</p>
                                <p><strong>Adição:</strong> {selectedPrescription.adicao}</p>
                                <p><strong>Altura:</strong> {selectedPrescription.altura}</p>
                            </div>

                            {selectedPrescription.observation && (
                                <div className="mt-4 p-3 bg-indigo-50 text-indigo-800 rounded text-sm">
                                    <strong>Obs:</strong> {selectedPrescription.observation}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}