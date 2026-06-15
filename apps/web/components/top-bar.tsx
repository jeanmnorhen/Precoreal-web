'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

function perfilHref(tipo?: string) {
  switch (tipo) {
    case 'lojista': return '/lojista';
    case 'funcionario': return '/funcionario';
    case 'admin': return '/admin';
    default: return '/busca';
  }
}

export function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50"
            style={{ background: 'var(--color-card)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between px-4 h-14 max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold gradient-navy">
            R$
          </span>
          <span className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--color-foreground)' }}>
            Preço<span style={{ color: 'var(--color-primary)' }}>Real</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link href="/scanner"
                className="w-9 h-9 rounded-full flex items-center justify-center text-lg transition-colors hover:opacity-80"
                style={{ color: 'var(--color-foreground-muted)' }}
                title="Escanear código de barras">
            📷
          </Link>
          {user ? (
            <>
              <Link href={perfilHref(user.tipo)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors hover:opacity-80"
                    style={{ background: 'var(--color-navy-50)', color: 'var(--color-navy-700)' }}>
                {user.nome.charAt(0).toUpperCase()}
              </Link>
              <button onClick={logout}
                      className="text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors hover:opacity-70"
                      style={{ color: 'var(--color-foreground-muted)' }}>
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login"
                    className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors hover:opacity-70"
                    style={{ color: 'var(--color-foreground-muted)' }}>
                Entrar
              </Link>
              <Link href="/register"
                    className="text-sm font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
                    style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}>
                Cadastrar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
