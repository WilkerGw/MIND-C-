import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      // Tenta fazer login no Backend
      const response = await api.post("/auth/login", { username, password });

      // Se der certo, salva o token e vai para a Home
      signIn(username, response.data.token);
      navigate("/");
    } catch (err: any) {
      console.error(err);
      if (err.response) {
        // Erro retornado pelo servidor (ex: 401 Unauthorized)
        setError(err.response.data || "Usuário ou senha inválidos.");
      } else if (err.request) {
        // Erro de conexão (Servidor desligado ou porta errada)
        setError(
          "Erro de conexão: O servidor não respondeu. Verifique se o Backend está rodando."
        );
      } else {
        setError("Erro desconhecido ao tentar logar.");
      }
    }
  }

  // Função para criar usuário de teste e mostrar erro detalhado se falhar
  async function handleRegisterTest() {
    setError(""); // Limpa erros anteriores
    try {
      await api.post("/auth/register", { username, password, role: "Admin" });
      alert("Usuário criado com sucesso! Agora clique em Entrar.");
    } catch (err: any) {
      console.error(err); // Mostra detalhe no F12

      if (err.response) {
        // O servidor respondeu com erro (ex: Usuário já existe)
        alert(`Erro do Servidor: ${err.response.data}`);
      } else if (err.request) {
        // O servidor nem respondeu
        alert(
          "Erro de Conexão: O servidor não respondeu. Verifique se o Backend está rodando na porta 5175."
        );
      } else {
        alert("Erro desconhecido: " + err.message);
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-600 p-4">
      <div className="w-full max-w-sm p-8 bg-zinc-800 rounded-2xl">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="h-10 flex items-center bg-zinc-800 m-3.5 rounded-2xl">
            <div className="flex items-center text-xl tracking-wide text-white">
              <span className="h-11 flex items-center p-2 shadow-sm shadow-gray-300/40 rounded-2xl text-emerald-700 bg-zinc-700 font-extrabold">
                Mind
              </span>
              <span className="ml-1.5 opacity-50 lowercase font-extralight">
                ERP
              </span>
            </div>
          </div>

          <p className="text-zinc-500 font-medium">Acesso ao Sistema</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm w-full">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <Input
            label="Usuário"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            label="Senha"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" variant="primary" size="lg" fullWidth>
            Entrar
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleRegisterTest}
            className="text-sm text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors"
          >
            Criar Conta de Teste (Admin)
          </button>
        </div>
      </div>
    </div>
  );
}
