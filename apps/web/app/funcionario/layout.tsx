'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

const navItems = [
  { href: '/funcionario', label: 'Painel', icon: '📊' },
  { href: '/funcionario/produtos', label: 'Produtos', icon: '📦' },
  { href: '/funcionario/anuncios', label: 'Ofertas', icon: '📢' },
];

interface Verificacao {
  acessoPermitido: boolean;
  mensagem: string;
  lojaNome: string;
  dentoPerimetro: boolean;
  horarioValido: boolean;
}

export default function FuncionarioLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [lojaNome, setLojaNome] = useState('');
  const [verificacao, setVerificacao] = useState<Verificacao | null>(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    if (!loading && (!user || (user.tipo !== 'funcionario' && user.tipo !== 'lojista'))) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const lojaId = localStorage.getItem('funcionarioLojaId');
    if (!lojaId) {
      router.push('/funcionario/selecionar');
      return;
    }

    const verificar = async () => {
      setVerificando(true);
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }),
        );
        const result = await api.funcionario.verificarAcesso(lojaId, {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setVerificacao(result);
        setLojaNome(result.lojaNome);
      } catch {
        setVerificacao({
          acessoPermitido: false,
          mensagem: 'Não foi possível verificar sua localização.',
          lojaNome: '',
          dentoPerimetro: false,
          horarioValido: false,
        });
      } finally {
        setVerificando(false);
      }
    };

    verificar();
    const interval = setInterval(verificar, 30000);
    return () => clearInterval(interval);
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
      </main>
    );
  }

  if (!user) return null;

  if (pathname === '/funcionario/selecionar') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 flex-shrink-0 p-6 hidden md:flex flex-col"
             style={{ borderRight: '1px solid var(--color-border)', background: 'var(--color-background-subtle)' }}>
        <Link href="/funcionario" className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight no-underline mb-2">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold gradient-navy">R$</span>
          <span style={{ color: 'var(--color-foreground)' }}>
            Preço<span style={{ color: 'var(--color-primary)' }}>Real</span>
          </span>
        </Link>

        {lojaNome && (
          <div className="flex items-center gap-1.5 mb-8 text-xs font-medium" style={{ color: 'var(--color-foreground-muted)' }}>
            <span>🏪</span>
            <span className="truncate">{lojaNome}</span>
          </div>
        )}

        <nav className="flex flex-col gap-1.5 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/funcionario' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: isActive ? 'var(--color-primary)' : 'transparent',
                  color: isActive ? 'var(--color-primary-foreground)' : 'var(--color-foreground)',
                }}>
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/" className="text-sm transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-foreground-muted)' }}>
          ← Voltar ao site
        </Link>
      </aside>

      <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10 max-w-5xl">
        {/* Banner de verificação */}
        {verificando && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6 animate-fade-in"
                style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
             <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: 'var(--color-primary)' }} />
             <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
              Verificando localização e horário...
            </p>
          </div>
        )}

        {!verificando && verificacao && !verificacao.acessoPermitido && (
          <div className="p-5 rounded-xl mb-6 animate-fade-in"
               style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔒</span>
              <div>
                <p className="font-bold" style={{ color: 'var(--color-destructive)' }}>Acesso restrito</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--color-foreground-muted)' }}>
                  {verificacao.mensagem}
                </p>
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-xs">
              <span style={{ color: verificacao.dentoPerimetro ? 'var(--color-success)' : 'var(--color-destructive)' }}>
                {verificacao.dentoPerimetro ? '✅ Dentro do perímetro' : '❌ Fora do perímetro'}
              </span>
              <span style={{ color: verificacao.horarioValido ? 'var(--color-success)' : 'var(--color-destructive)' }}>
                {verificacao.horarioValido ? '✅ Horário válido' : '❌ Fora do horário'}
              </span>
            </div>
          </div>
        )}

        {!verificando && verificacao && verificacao.acessoPermitido && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl mb-6 animate-fade-in"
               style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
            <span>✅</span>
            <p className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>
              Acesso permitido — {verificacao.lojaNome}
            </p>
          </div>
        )}

        {/* Conteúdo condicional */}
        {(!verificacao?.acessoPermitido && !verificando) ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl mb-4">🔒</span>
            <h2 className="text-xl font-bold mb-2">Funcionalidades bloqueadas</h2>
            <p className="text-sm max-w-md" style={{ color: 'var(--color-foreground-muted)' }}>
              Você precisa estar dentro do perímetro da loja e em seu horário de trabalho para gerenciar produtos e ofertas.
            </p>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
