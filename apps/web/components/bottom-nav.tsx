'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const navItens = [
  { href: '/', label: 'Início', icon: '🏠' },
  { href: '/busca', label: 'Buscar', icon: '🔍' },
  { href: '/scanner', label: 'Scanner', icon: '📷' },
  { href: '/login', label: 'Perfil', icon: '👤', auth: '/lojista' },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
         style={{
           background: 'var(--color-card)',
           borderTop: '1px solid var(--color-border)',
           paddingBottom: 'env(safe-area-inset-bottom, 0px)',
         }}>
      <div className="flex items-center justify-around py-2">
        {navItens.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const href = item.auth && user?.tipo === 'lojista' ? item.auth : item.href;
          return (
            <Link key={item.href} href={href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-0 transition-all"
              style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-foreground-muted)' }}>
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[10px] font-semibold leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
