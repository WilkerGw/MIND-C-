import { createContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface AuthContextData {
    signed: boolean;
    user: string | null;
    signIn: (user: string, token: string) => void;
    signOut: () => void;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<string | null>(null);

    useEffect(() => {
        const storagedToken = localStorage.getItem('otica_token');
        const storagedUser = localStorage.getItem('otica_user');

        if (storagedToken && storagedUser) {
            // Verifica se o token expirou (opcional, mas recomendado)
            const decoded: any = jwtDecode(storagedToken);
            if (decoded.exp * 1000 < Date.now()) {
                signOut();
            } else {
                setUser(storagedUser);
            }
        }
    }, []);

    function signIn(username: string, token: string) {
        localStorage.setItem('otica_token', token);
        localStorage.setItem('otica_user', username);
        setUser(username);
    }

    function signOut() {
        localStorage.removeItem('otica_token');
        localStorage.removeItem('otica_user');
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ signed: !!user, user, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};