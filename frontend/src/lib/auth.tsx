import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, AuthUser } from './api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  loginWithGitHub: (code: string) => Promise<{ githubToken: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('kryvant_token');
    const storedUser = localStorage.getItem('kryvant_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  function persist(t: string, u: AuthUser) {
    localStorage.setItem('kryvant_token', t);
    localStorage.setItem('kryvant_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  }

  async function login(email: string, password: string) {
    const res = await api.login({ email, password });
    persist(res.token, res.user);
  }

  async function register(email: string, username: string, password: string) {
    const res = await api.register({ email, username, password });
    persist(res.token, res.user);
  }

  async function loginWithGitHub(code: string) {
    const res = await api.loginWithGitHub(code);
    persist(res.token, res.user);
    return { githubToken: res.githubToken };
  }

  function logout() {
    localStorage.removeItem('kryvant_token');
    localStorage.removeItem('kryvant_user');
    localStorage.removeItem('kryvant_github_token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginWithGitHub, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
