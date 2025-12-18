import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Login from './pages/Login';
import Layout from './components/Layout'; // Importa o menu lateral
import Clients from './pages/Clients';   // Importa a tela de clientes

// Proteção de Rota
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { signed } = useContext(AuthContext);
  return signed ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Rotas Protegidas dentro do Layout */}
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            {/* Quando acessar /, mostra um texto de boas-vindas */}
            <Route index element={<h2 style={{ textAlign: 'center', marginTop: '50px' }}>Bem-vindo ao Sistema da Ótica! Selecione uma opção no menu.</h2>} />

            {/* Rota de Clientes */}
            <Route path="clients" element={<Clients />} />

            {/* Futuras rotas (ainda não criadas) */}
            <Route path="products" element={<h3>Tela de Produtos (Em breve)</h3>} />
            <Route path="sales" element={<h3>Tela de Vendas (Em breve)</h3>} />
            <Route path="appointments" element={<h3>Tela de Agendamentos (Em breve)</h3>} />
            <Route path="service-orders" element={<h3>Tela de Ordens de Serviço (Em breve)</h3>} />
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;