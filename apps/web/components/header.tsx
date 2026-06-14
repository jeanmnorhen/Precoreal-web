'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{ borderBottom: '1px solid var(--color-border)' }}
    >
      <div style={{ background: 'rgba(255,255,255,0.82)' }} className="absolute inset-0" />
      <div className="relative max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-primary)' }}>
          Preço<span style={{ color: 'var(--color-foreground)' }}>Real</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: 'var(--color-foreground-muted)' }}>
          <Link href="/busca" className="hover:opacity-70 transition-opacity">Buscar</Link>
          <Link href="#recursos" className="hover:opacity-70 transition-opacity">Recursos</Link>
          <Link href="/lojista" className="hover:opacity-70 transition-opacity">Sou lojista</Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm hidden sm:block" style={{ color: 'var(--color-foreground-muted)' }}>
                {user.nome}
              </span>
              <button
                onClick={logout}
                className="text-sm font-medium px-3 py-2 rounded-xl transition-colors hover:opacity-70"
                style={{ color: 'var(--color-foreground-muted)' }}
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium px-4 py-2 rounded-xl transition-colors hover:opacity-70"
                style={{ border: '1px solid var(--color-border)' }}
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105"
                style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
              >
                Cadastrar
              </Link>
            </>
          )}
          <Link
            href="/scanner"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
          >
            📷 Escanear
          </Link>
        </div>
      </div>
    </header>
  );
}
