import { useState, useEffect } from 'react';
import api from '../services/api';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import SearchIcon from '@mui/icons-material/Search';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '../components/ui/Table';

// Interfaces
interface Appointment {
    id: number;
    clientName: string;
    appointmentDate: string;
    observation: string;
    status: string;
}

export default function Appointments() {
    // --- ESTADOS DO FORMULÁRIO ---
    const [cpfBusca, setCpfBusca] = useState('');
    const [clienteId, setClienteId] = useState<number | null>(null);
    const [clienteNome, setClienteNome] = useState(''); // Apenas para exibição

    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [observation, setObservation] = useState('');

    // Estado da Lista
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    const [mensagem, setMensagem] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);

    // Carregar Dados Iniciais (Apenas agendamentos, sem lista de clientes pesada)
    useEffect(() => {
        carregarAgendamentos();
    }, []);

    async function carregarAgendamentos() {
        try {
            const response = await api.get('/appointments');
            setAppointments(response.data);
        } catch (error) {
            console.error("Erro ao carregar agendamentos", error);
        }
    }

    // --- NOVA FUNÇÃO DE BUSCA POR CPF ---
    async function buscarCliente() {
        if (!cpfBusca) return;

        try {
            // Tenta buscar o cliente pelo CPF digitado
            const response = await api.get(`/clients/by-cpf/${cpfBusca}`);

            // Sucesso: Preenche os dados
            setClienteId(response.data.id);
            setClienteNome(response.data.fullName);
            setMensagem(null); // Limpa erros anteriores
        } catch (error) {
            // Erro: Limpa os dados e avisa
            setClienteId(null);
            setClienteNome('');
            setMensagem({ tipo: 'error', texto: 'Cliente não encontrado. Verifique o CPF.' });
        }
    }

    // Salvar Agendamento
    async function handleAgendar(e: React.FormEvent) {
        e.preventDefault();

        if (!clienteId || !date || !time) {
            setMensagem({ tipo: 'error', texto: 'Preencha o CPF (busque o cliente), data e hora.' });
            return;
        }

        try {
            const dateTime = new Date(`${date}T${time}:00`).toISOString();

            await api.post('/appointments', {
                clientId: clienteId, // Usa o ID encontrado na busca
                appointmentDate: dateTime,
                observation: observation
            });

            setMensagem({ tipo: 'success', texto: 'Agendamento realizado com sucesso!' });

            // Limpar form
            setCpfBusca('');
            setClienteNome('');
            setClienteId(null);
            setObservation('');

            // Recarregar lista
            carregarAgendamentos();

        } catch (error) {
            console.error(error);
            setMensagem({ tipo: 'error', texto: 'Erro ao criar agendamento.' });
        }
    }

    async function handleExcluir(id: number) {
        if (!confirm("Deseja cancelar este agendamento?")) return;

        try {
            await api.delete(`/appointments/${id}`);
            setAppointments(prev => prev.filter(a => a.id !== id));
            setMensagem({ tipo: 'success', texto: 'Agendamento cancelado.' });
        } catch (error) {
            setMensagem({ tipo: 'error', texto: 'Erro ao cancelar.' });
        }
    }

    return (
        <div className="space-y-6">
            {mensagem && (
                <div className={`p-4 rounded-md ${mensagem.tipo === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {mensagem.texto}
                    <button onClick={() => setMensagem(null)} className="float-right font-bold ml-2">x</button>
                </div>
            )}

            {/* Layout Grid Tailwind */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* 1. Formulário (Ocupa 4 colunas) */}
                <div className="col-span-12 md:col-span-4">
                    <Card>
                        <h2 className="text-xl font-semibold text-zinc-300 mb-4">
                            Novo Horário
                        </h2>
                        <form onSubmit={handleAgendar}>

                            {/* CAMPO DE BUSCA CPF */}
                            <div className="relative mb-4">
                                <Input
                                    label="CPF do Cliente"
                                    value={cpfBusca}
                                    onChange={e => setCpfBusca(e.target.value)}
                                    onBlur={buscarCliente} // Busca ao sair do campo
                                    placeholder="Digite e aperte Tab"
                                    required
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

                            {/* CAMPO DE NOME (READ ONLY) */}
                            <Input
                                label="Cliente Identificado"
                                value={clienteNome}
                                disabled
                                fullWidth
                                className={clienteNome ? 'bg-green-50' : ''}
                            />

                            <Input
                                type="date"
                                label="Data"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                required
                                fullWidth
                            />

                            <Input
                                type="time"
                                label="Hora"
                                value={time}
                                onChange={e => setTime(e.target.value)}
                                required
                                fullWidth
                            />

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-zinc-400 mb-1">
                                    Observação (Ex: Exame de Vista)
                                </label>
                                <textarea
                                    className="block w-full rounded-md text-zinc-300 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    rows={2}
                                    value={observation}
                                    onChange={e => setObservation(e.target.value)}
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                size="lg"
                                disabled={!clienteId} // Bloqueia se não tiver cliente
                                className={!clienteId ? 'opacity-50 cursor-not-allowed' : ''}
                            >
                                Confirmar Agendamento
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* 2. Lista de Agendamentos (Ocupa 8 colunas) */}
                <div className="col-span-12 md:col-span-8">
                    <Card className="h-full">
                        <div className="-mx-6 -mt-6 p-4 border-b border-zinc-700 mb-4 rounded-t-lg">
                            <h3 className="text-lg font-medium text-zinc-300">Próximos Agendamentos</h3>
                        </div>
                        <div className="overflow-auto">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell as="th">Data/Hora</TableCell>
                                        <TableCell as="th">Cliente</TableCell>
                                        <TableCell as="th">Motivo</TableCell>
                                        <TableCell as="th">Status</TableCell>
                                        <TableCell as="th" align="center">Ações</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {appointments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" className="py-6 text-zinc-400">
                                                Nenhum agendamento encontrado.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        appointments.map((row) => (
                                            <TableRow key={row.id} className="hover:bg-gray-50">
                                                <TableCell>
                                                    {new Date(row.appointmentDate).toLocaleString('pt-BR', {
                                                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </TableCell>
                                                <TableCell className="font-bold text-gray-900">{row.clientName}</TableCell>
                                                <TableCell>{row.observation || '-'}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        Agendado
                                                    </span>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <button
                                                        onClick={() => handleExcluir(row.id)}
                                                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                                                        title="Cancelar Agendamento"
                                                    >
                                                        <DeleteIcon />
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}