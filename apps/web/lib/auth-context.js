'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProvider = AuthProvider;
exports.useAuth = useAuth;
const react_1 = require("react");
const api_1 = require("./api");
const AuthContext = (0, react_1.createContext)(null);
function AuthProvider({ children }) {
    const [user, setUser] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api_1.api.me()
                .then(setUser)
                .catch(() => localStorage.removeItem('token'))
                .finally(() => setLoading(false));
        }
        else {
            setLoading(false);
        }
    }, []);
    const login = (0, react_1.useCallback)(async (email, senha) => {
        const res = await api_1.api.login(email, senha);
        localStorage.setItem('token', res.accessToken);
        setUser(res.user);
    }, []);
    const register = (0, react_1.useCallback)(async (nome, email, senha, tipo) => {
        const res = await api_1.api.register(nome, email, senha, tipo);
        localStorage.setItem('token', res.accessToken);
        setUser(res.user);
    }, []);
    const logout = (0, react_1.useCallback)(() => {
        localStorage.removeItem('token');
        setUser(null);
    }, []);
    return (<AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>);
}
function useAuth() {
    const ctx = (0, react_1.useContext)(AuthContext);
    if (!ctx)
        throw new Error('useAuth deve ser usado dentro de AuthProvider');
    return ctx;
}
