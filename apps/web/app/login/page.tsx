'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const redirectMap: Record<string, string> = {
    consumidor: '/',
    lojista: '/lojista',
    funcionario: '/funcionario',
    admin: '/admin',
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const userData = await login(email, senha);
      router.push(redirectMap[userData.tipo] || '/');
    } catch (err: any) {
      setErro(err.message || 'Erro ao fazer login.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 text-2xl font-extrabold tracking-tight no-underline">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold gradient-navy">
              R$
            </span>
            <span style={{ color: 'var(--color-foreground)' }}>
              Preço<span style={{ color: 'var(--color-primary)' }}>Real</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold mt-8 mb-1">Entrar</h1>
          <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
            Acesse sua conta para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {erro && (
            <div className="p-4 rounded-xl text-sm font-medium"
                 style={{ background: 'hsl(0,50%,95%)', color: 'var(--color-destructive)' }}>
              {erro}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-foreground)' }}>Email</label>
            <input
              id="email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2"
              style={{ background: 'var(--color-card)', color: 'var(--color-foreground)', border: '1.5px solid var(--color-border)', '--tw-ring-color': 'var(--color-ring)' } as React.CSSProperties}
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-foreground)' }}>Senha</label>
            <input
              id="senha" type="password" required value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2"
              style={{ background: 'var(--color-card)', color: 'var(--color-foreground)', border: '1.5px solid var(--color-border)', '--tw-ring-color': 'var(--color-ring)' } as React.CSSProperties}
              placeholder="••••••"
            />
          </div>

          <button
            type="submit" disabled={carregando}
            className="w-full py-3 rounded-xl font-bold text-base transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm mt-8" style={{ color: 'var(--color-foreground-muted)' }}>
          Não tem conta?{' '}
          <Link href="/register" className="font-semibold" style={{ color: 'var(--color-primary)' }}>
            Cadastre-se
          </Link>
        </p>
      </div>
    </main>
  );
}
