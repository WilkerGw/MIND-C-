import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Clients from "./pages/Clients";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Appointments from "./pages/Appointments";
import ServiceOrders from "./pages/ServiceOrders";
import Prescriptions from "./pages/Prescriptions"; // Importe a nova tela

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
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route
              index
              element={
                <h2 style={{ textAlign: "center", marginTop: "50px" }}>
                  Bem-vindo ao Sistema da Ótica!
                </h2>
              }
            />
            <Route path="clients" element={<Clients />} />
            <Route path="products" element={<Products />} />
            <Route path="sales" element={<Sales />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="service-orders" element={<ServiceOrders />} />
            <Route path="prescriptions" element={<Prescriptions />} />{" "}
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
