import { useEffect, useState } from "react";
import {
    AttachMoney,
    Today,
    TrendingUp,
    Engineering,
    AddCircle,
} from "@mui/icons-material";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import {
    getDashboardStats,
    getSalesHistory,
    getActiveOrders,
    type DashboardStats,
    type SalesHistory,
    type ActiveOrder,
} from "../services/dashboardService";
import { Card } from "../components/ui/Card"; // Added CardContent to match standard usage if needed, or just Card
import { Button } from "../components/ui/Button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from "../components/ui/Table";

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [history, setHistory] = useState<SalesHistory[]>([]);
    const [orders, setOrders] = useState<ActiveOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [statsData, historyData, ordersData] = await Promise.all([
                    getDashboardStats(),
                    getSalesHistory(),
                    getActiveOrders(),
                ]);
                setStats(statsData);
                setHistory(historyData);
                setOrders(ordersData);
            } catch (error) {
                console.error("Erro ao carregar dados do dashboard", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex w-full items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6  px-3">
            {/* --- CARDS DE VENDAS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Vendas Dia */}
                <Card className="bg-blue-50 border-blue-100">
                    <div className="flex items-center mb-2">
                        <Today className="text-emerald-700 mr-2" />
                        <h6 className="text-slate-300 font-medium">Vendas Hoje</h6>
                    </div>
                    <div className="text-3xl font-bold text-slate-300">
                        {stats?.dailySalesTotal.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                        })}
                    </div>

                    {/* Comparativo Ano Anterior */}
                    <div className="mt-4 p-2 bg-zinc-700 rounded-md shadow-sm shadow-gray-300/40">
                        <p className="text-sm text-slate-300">Mesmo dia ano passado:</p>
                        <p className="font-semibold text-slate-300">
                            {stats?.dailySalesPreviousYear.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            })}
                        </p>
                    </div>
                </Card>

                {/* Vendas Mês */}
                <Card className="bg-green-50 border-green-100">
                    <div className="flex items-center mb-2">
                        <AttachMoney className="text-emerald-700 mr-2" />
                        <h6 className="text-slate-300 font-medium">Vendas Mês Atual</h6>
                    </div>
                    <div className="text-3xl font-bold text-slate-300">
                        {stats?.monthlySalesTotal?.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                        })}
                    </div>

                    {/* Comparativo Ano Anterior */}
                    <div className="mt-4 p-2 bg-zinc-700 rounded-md shadow-sm shadow-gray-300/40">
                        <p className="text-sm text-slate-300">Mesmo mês ano passado:</p>
                        <p className="font-semibold text-slate-300">
                            {stats?.monthlySalesPreviousYear?.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            }) ?? "R$ 0,00"}
                        </p>
                    </div>
                </Card>

                {/* Ordens Pendentes */}
                <Card className="bg-orange-50 border-orange-100 md:col-span-2 lg:col-span-1">
                    <div className="flex items-center mb-2">
                        <Engineering className="text-emerald-700 mr-2" />
                        <h6 className="text-slate-300 font-medium">Ordens em Aberto</h6>
                    </div>
                    <div className="text-3xl font-bold text-slate-300">
                        {stats?.activeServiceOrdersCount}
                    </div>
                </Card>
            </div>

            {/* --- BOTÕES DE ATALHO --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    startIcon={<AddCircle />}
                    onClick={() => navigate("/clients")}
                >
                    Cliente
                </Button>
                <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    startIcon={<AddCircle />}
                    onClick={() => navigate("/products")}
                >
                    Produto
                </Button>
                <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    startIcon={<AddCircle />}
                    onClick={() => navigate("/prescriptions")}
                >
                    Receita
                </Button>
                <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    startIcon={<AddCircle />}
                    onClick={() => navigate("/sales")}
                >
                    Venda
                </Button>
            </div>
            {/* --- TABELA DE ORDENS ATIVAS --- */}
            <Card>
                <div className="flex items-center mb-4">
                    <Engineering className="text-emerald-700 mr-2" />
                    <h2 className="text-xl font-semibold text-slate-300">
                        Ordens de Serviço em Aberto
                    </h2>
                </div>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell as="th">Nº OS</TableCell>
                            <TableCell as="th">Cliente</TableCell>
                            <TableCell as="th">Produto</TableCell>
                            <TableCell as="th">Status</TableCell>
                            <TableCell as="th">Entrega Prevista</TableCell>
                            <TableCell as="th" align="right">
                                Saldo Devedor
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((os) => (
                            <TableRow key={os.id}>
                                <TableCell>{os.manualOrderNumber}</TableCell>
                                <TableCell>{os.clientName}</TableCell>
                                <TableCell>{os.productName}</TableCell>
                                <TableCell>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full shadow-sm shadow-gray-300/40 text-xs font-medium
                                        ${os.status === "Pronto"
                                                ? "bg-green-100 text-emerald-700"
                                                : "bg-zinc-800 text-emerald-700"
                                            }`}
                                    >
                                        {os.status}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {new Date(os.deliveryDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell align="right">
                                    {os.remainingBalance > 0 ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full shadow-sm shadow-gray-300/40 text-sm font-medium  text-red-700 bg-zinc-800">
                                            {os.remainingBalance.toLocaleString("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            })}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium border border-green-200 text-green-700 bg-green-50">
                                            Quitado
                                        </span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {orders.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    align="center"
                                    className="text-gray-500 py-8"
                                >
                                    Nenhuma ordem de serviço pendente.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
            {/* --- GRÁFICO --- */}
            <Card>
                <div className="flex items-center mb-6">
                    <TrendingUp className="text-emerald-700 mr-2" />
                    <h2 className="text-xl font-semibold text-slate-300">
                        Histórico Mensal
                    </h2>
                </div>
                <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={history}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip
                                formatter={(value: any) =>
                                    Number(value).toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    })
                                }
                            />
                            <Line
                                type="monotone"
                                dataKey="totalValue"
                                stroke="#007A55"
                                strokeWidth={3}
                                activeDot={{ r: 8 }}
                                name="Vendas"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
}
