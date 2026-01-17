import { useState, useContext, useEffect } from "react";
import {
  Menu as MenuIcon,
  Home,
  People,
  Inventory,
  ShoppingCart,
  CalendarMonth,
  Assignment,
  ExitToApp,
  Description,
  Print as PrintIcon,
} from "@mui/icons-material";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getDashboardStats } from "../services/dashboardService";

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [monthlySales, setMonthlySales] = useState(0);

  const GOAL = 3000;

  useEffect(() => {
    getDashboardStats()
      .then((stats) => {
        setMonthlySales(stats.monthlySalesTotal);
        const percentage = Math.min(
          (stats.monthlySalesTotal / GOAL) * 100,
          100
        );
        setProgress(percentage);
      })
      .catch(console.error);
  }, []);

  const menuItems = [
    { text: "Início", icon: <Home />, path: "/" },
    { text: "Clientes", icon: <People />, path: "/clients" },
    { text: "Produtos", icon: <Inventory />, path: "/products" },
    { text: "Vendas", icon: <ShoppingCart />, path: "/sales" },
    { text: "Agendamentos", icon: <CalendarMonth />, path: "/appointments" },
    { text: "O. Serviço", icon: <Assignment />, path: "/service-orders" },
    { text: "Receitas", icon: <Description />, path: "/prescriptions" },
    { text: 'Impressoras', icon: <PrintIcon />, path: '/printers' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-transparent text-white">
      <div className="h-10 flex items-center bg-zinc-800 m-3.5 rounded-2xl">

        <Typography className="flex items-center text-xl tracking-wide text-white">
          <span className="h-11 flex items-center p-2 shadow-sm shadow-gray-300/40 rounded-2xl text-emerald-700 bg-zinc-700 font-extrabold">
            Mind
          </span>
          <span className="ml-1.5 opacity-50 lowercase font-extralight">
            ERP
          </span>
        </Typography>
      </div>

      <nav className="flex-1 overflow-visible bg-zinc-800 m-3.5 rounded-2xl">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.text}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center px-6 py-3 transition-colors duration-200 cursor-pointer rounded-2xl 
                                        ${isActive
                      ? "bg-zinc-700 text-white shadow-sm shadow-gray-300/40"
                      : "text-slate-300 hover:bg-zinc-700 hover:text-white"
                    }`}
                >
                  <span className="mr-3 text-emerald-700">{item.icon}</span>
                  <span className="font-medium">{item.text}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="h-10 flex items-center bg-zinc-800 m-3.5 rounded-2xl overflow-hidden">
        <button
          onClick={() => {
            signOut();
            navigate("/login");
          }}
          className=" cursor-pointer w-full flex items-center px-4 py-2 text-white/50 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
        >
          <ExitToApp className="mr-3 text-red-900" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );

  // Helper component since we removed Mui Typography
  const Typography = ({
    className,
    children,
  }: {
    className?: string;
    children: React.ReactNode;
  }) => <span className={className}>{children}</span>;

  return (
    <div className="flex h-screen bg-zinc-700 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={handleDrawerToggle}
        />
      )}

      {/* Sidebar (Mobile & Desktop) */}
      <aside
        className={`
                fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
                ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
            `}
      >
        <SidebarContent />
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
        {/* Top Header */}
        <header className=" h-10 shadow-sm flex items-center justify-between z-10 bg-zinc-800 m-3.5 rounded-2xl">
          <div className="relative w-[80%]">
            <div
              className="absolute bottom-1 left-0 h-1 bg-[#007A55] transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
            {/* Markers */}
            {Array.from({ length: GOAL / 500 }).map((_, i) => {
              const value = (i + 1) * 500;
              return (
                <div
                  key={value}
                  className="absolute flex bottom-0 w-px h-2 bg-zinc-400 z-10"
                  style={{ left: `${(value / GOAL) * 100}%` }}
                >
                  <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] text-zinc-500 font-medium w-[3rem]">
                    R$ {value}
                  </span>
                </div>
              );
            })}
            {/* Current Value Indicator */}
            <div
              className="absolute bottom-0 -ml-6 z-30 transition-all duration-1000"
              style={{ left: `${progress}%` }}
            >
              <div className="relative flex flex-col items-center">
                <span className="mb-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 rounded-md shadow-sm whitespace-nowrap border border-emerald-200">
                  R$ {monthlySales.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
                <div className="w-3 h-3 bg-emerald-600 border-2 border-white ring-1 ring-emerald-600 rounded-full shadow-sm" />
              </div>
            </div>
          </div>

          <button
            onClick={handleDrawerToggle}
            className="p-2 -ml-2 text-gray-600 rounded-md lg:hidden hover:bg-gray-100"
          >
            <MenuIcon />
          </button>

          <div className="flex-1 px-4 lg:hidden">
            <span className="font-bold text-lg text-slate-800">Ótica ERP</span>
          </div>

          <div className="flex items-center space-x-4 ml-auto shadow-sm shadow-gray-300/40 rounded-2xl p-2 h-full bg-zinc-700">
            <div className="text-right hidden sm:block">
              <p className="font-medium text-slate-300">{user}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-emerald-700 flex items-center justify-center text-slate-300 font-bold">
              {user?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto m-3.5">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
