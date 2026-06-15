'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/admin', label: 'Visão Geral', icon: '📊' },
  { href: '/admin/precos', label: 'Preços', icon: '💰' },
  { href: '/admin/uso', label: 'Uso', icon: '📈' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.tipo !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
             style={{ borderColor: 'var(--color-primary)' }} />
      </main>
    );
  }

  if (!user || user.tipo !== 'admin') return null;

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 flex-shrink-0 p-6 hidden md:flex flex-col"
             style={{ borderRight: '1px solid var(--color-border)', background: 'var(--color-background-subtle)' }}>
        <Link href="/admin" className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight no-underline mb-10">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold gradient-navy">R$</span>
          <span style={{ color: 'var(--color-foreground)' }}>
            Admin<span style={{ color: 'var(--color-primary)' }}>Real</span>
          </span>
        </Link>
        <nav className="flex flex-col gap-1.5 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));
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

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around p-3"
           style={{ background: 'var(--color-card)', borderTop: '1px solid var(--color-border)' }}>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}
            className="flex flex-col items-center gap-1 text-xs"
            style={{ color: pathname === item.href ? 'var(--color-primary)' : 'var(--color-foreground-muted)' }}>
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10 max-w-6xl">
        {children}
      </main>
    </div>
  );
}
