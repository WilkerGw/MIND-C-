import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '../components/ui/Table';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

interface Client {
    id?: number;
    fullName: string;
    cpf: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    street: string;
    district: string;
    zipCode: string;
    city: string;
}

export default function Clients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [formData, setFormData] = useState<Client>({
        fullName: '', cpf: '', phone: '', dateOfBirth: '',
        gender: '', street: '', district: '', zipCode: '', city: ''
    });

    useEffect(() => {
        loadClients();
    }, []);

    async function loadClients() {
        try {
            const response = await api.get('/clients');
            setClients(response.data);
        } catch (error) {
            console.error("Erro ao carregar clientes", error);
        }
    }

    async function buscarCep(ev: React.FocusEvent<HTMLInputElement>) {
        const cep = ev.target.value.replace(/\D/g, '');

        if (cep.length !== 8) {
            return;
        }

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (data.erro) {
                alert("CEP não encontrado.");
                return;
            }

            setFormData(prev => ({
                ...prev,
                street: data.logradouro,
                district: data.bairro,
                city: data.localidade
            }));

        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            alert("Erro ao buscar endereço pelo CEP. Verifique sua conexão.");
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        try {
            await api.post('/clients', formData);
            alert('Cliente cadastrado com sucesso!');
            setFormData({
                fullName: '', cpf: '', phone: '', dateOfBirth: '',
                gender: '', street: '', district: '', zipCode: '', city: ''
            });
            loadClients();
        } catch (error: any) {
            console.error("Erro ao salvar:", error);
            const errorMessage = error.response?.data
                ? JSON.stringify(error.response.data, null, 2)
                : 'Erro ao salvar cliente.';
            alert(errorMessage);
        }
    }

    function formatGender(genderCode: string) {
        if (genderCode === 'M') return 'Masculino';
        if (genderCode === 'F') return 'Feminino';
        return genderCode;
    }

    return (
        <div className="space-y-6">
            {/* Formulário de Cadastro */}
            <Card>
                <form onSubmit={handleSave}>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6">
                            <Input
                                label="Nome Completo"
                                required
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                fullWidth
                            />
                        </div>
                        <div className="md:col-span-3">
                            <Input
                                label="CPF"
                                required
                                value={formData.cpf}
                                onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                                fullWidth
                            />
                        </div>
                        <div className="md:col-span-3">
                            <Input
                                label="Telefone"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                fullWidth
                            />
                        </div>

                        <div className="md:col-span-3">
                            <Input
                                type="date"
                                label="Data Nascimento"
                                value={formData.dateOfBirth}
                                onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                fullWidth
                            />
                        </div>
                        <div className="md:col-span-3">
                            <Select
                                label="Gênero"
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                fullWidth
                            >
                                <option value="">Selecione...</option>
                                <option value="M">Masculino</option>
                                <option value="F">Feminino</option>
                                <option value="Outro">Outro</option>
                            </Select>
                        </div>

                        {/* Endereço */}
                        <div className="md:col-span-2">
                            <Input
                                label="CEP"
                                value={formData.zipCode}
                                onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                                onBlur={buscarCep}
                                placeholder="Digite o CEP"
                                fullWidth
                            />
                        </div>
                        <div className="md:col-span-4">
                            <Input
                                label="Rua"
                                value={formData.street}
                                onChange={e => setFormData({ ...formData, street: e.target.value })}
                                fullWidth
                            />
                        </div>
                        <div className="md:col-span-3">
                            <Input
                                label="Bairro"
                                value={formData.district}
                                onChange={e => setFormData({ ...formData, district: e.target.value })}
                                fullWidth
                            />
                        </div>
                        <div className="md:col-span-3">
                            <Input
                                label="Cidade"
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                fullWidth
                            />
                        </div>

                        <div className="col-span-12">
                            <Button type="submit" variant="primary">
                                Cadastrar Cliente
                            </Button>
                        </div>
                    </div>
                </form>
            </Card>

            {/* Lista de Clientes */}
            <Card>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Clientes Cadastrados</h2>

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell as="th">ID</TableCell>
                            <TableCell as="th">Nome</TableCell>
                            <TableCell as="th">CPF</TableCell>
                            <TableCell as="th">Gênero</TableCell>
                            <TableCell as="th">Telefone</TableCell>
                            <TableCell as="th">Cidade</TableCell>
                            <TableCell as="th">Contato</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {clients.map((client) => (
                            <TableRow key={client.id}>
                                <TableCell>{client.id}</TableCell>
                                <TableCell>{client.fullName}</TableCell>
                                <TableCell>{client.cpf}</TableCell>
                                <TableCell>{formatGender(client.gender)}</TableCell>
                                <TableCell>{client.phone}</TableCell>
                                <TableCell>{client.city}</TableCell>
                                <TableCell>
                                    <a
                                        href={`https://wa.me/55${client.phone.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                        title="Conversar no WhatsApp"
                                    >
                                        <WhatsAppIcon />
                                    </a>
                                </TableCell>
                            </TableRow>
                        ))}
                        {clients.length === 0 && (
                            <TableRow><TableCell colSpan={7} align="center" className="text-gray-500 py-6">Nenhum cliente cadastrado.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}