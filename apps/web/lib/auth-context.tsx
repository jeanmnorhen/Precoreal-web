'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from './api';

interface User {
  id: string;
  nome: string;
  email: string;
  tipo: 'consumidor' | 'lojista' | 'funcionario' | 'admin';
  saldoCreditos?: number;
  quantidadeDiamantes?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<User>;
  register: (nome: string, email: string, senha: string, tipo: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function setTokenCookie(token: string) {
  document.cookie = `token=${token};path=/;max-age=86400;SameSite=Lax`;
}

function removeTokenCookie() {
  document.cookie = 'token=;path=/;max-age=0';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setTokenCookie(token);
      api.me()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token');
          removeTokenCookie();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const res = await api.login(email, senha);
    localStorage.setItem('token', res.accessToken);
    setTokenCookie(res.accessToken);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (nome: string, email: string, senha: string, tipo: string) => {
    const res = await api.register(nome, email, senha, tipo);
    localStorage.setItem('token', res.accessToken);
    setTokenCookie(res.accessToken);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    removeTokenCookie();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
