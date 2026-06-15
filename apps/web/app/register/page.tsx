'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState<'consumidor' | 'lojista'>('consumidor');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { register } = useAuth();
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
      const userData = await register(nome, email, senha, tipo);
      router.push(redirectMap[userData.tipo] || '/');
    } catch (err: any) {
      setErro(err.message || 'Erro ao cadastrar.');
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
          <h1 className="text-2xl font-bold mt-8 mb-1">Criar conta</h1>
          <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
            Junte-se ao Preço Real
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
            <label htmlFor="nome" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-foreground)' }}>Nome</label>
            <input id="nome" type="text" required value={nome} onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2"
              style={{ background: 'var(--color-card)', color: 'var(--color-foreground)', border: '1.5px solid var(--color-border)' } as React.CSSProperties}
              placeholder="Seu nome" />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-foreground)' }}>Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2"
              style={{ background: 'var(--color-card)', color: 'var(--color-foreground)', border: '1.5px solid var(--color-border)' } as React.CSSProperties}
              placeholder="seu@email.com" />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-foreground)' }}>Senha</label>
            <input id="senha" type="password" required minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2"
              style={{ background: 'var(--color-card)', color: 'var(--color-foreground)', border: '1.5px solid var(--color-border)' } as React.CSSProperties}
              placeholder="Mínimo 6 caracteres" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-foreground)' }}>Tipo de conta</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setTipo('consumidor')}
                className="py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: tipo === 'consumidor' ? 'var(--color-primary)' : 'var(--color-background)',
                  color: tipo === 'consumidor' ? 'var(--color-primary-foreground)' : 'var(--color-foreground)',
                  border: tipo === 'consumidor' ? 'none' : '1.5px solid var(--color-border)',
                }}>
                Consumidor
              </button>
              <button type="button" onClick={() => setTipo('lojista')}
                className="py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: tipo === 'lojista' ? 'var(--color-primary)' : 'var(--color-background)',
                  color: tipo === 'lojista' ? 'var(--color-primary-foreground)' : 'var(--color-foreground)',
                  border: tipo === 'lojista' ? 'none' : '1.5px solid var(--color-border)',
                }}>
                Lojista
              </button>
            </div>
          </div>

          <button type="submit" disabled={carregando}
            className="w-full py-3 rounded-xl font-bold text-base transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}>
            {carregando ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-sm mt-8" style={{ color: 'var(--color-foreground-muted)' }}>
          Já tem conta?{' '}
          <Link href="/login" className="font-semibold" style={{ color: 'var(--color-primary)' }}>
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
