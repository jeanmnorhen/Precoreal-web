'use client';

import Link from 'next/link';

export default function FuncionarioPainel() {
  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Painel do Funcionário</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-foreground-muted)' }}>
          Gerencie produtos e ofertas da loja
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/funcionario/produtos"
          className="p-8 rounded-xl text-center transition-all hover:shadow-md hover:-translate-y-0.5"
          style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
          <span className="text-3xl block mb-3">📦</span>
          <h3 className="font-bold text-lg">Produtos</h3>
          <p className="text-sm mt-1" style={{ color: 'var(--color-foreground-muted)' }}>
            Visualizar e gerenciar produtos
          </p>
        </Link>

        <Link href="/funcionario/anuncios"
          className="p-8 rounded-xl text-center transition-all hover:shadow-md hover:-translate-y-0.5"
          style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
          <span className="text-3xl block mb-3">📢</span>
          <h3 className="font-bold text-lg">Ofertas</h3>
          <p className="text-sm mt-1" style={{ color: 'var(--color-foreground-muted)' }}>
            Visualizar ofertas ativas da loja
          </p>
        </Link>
      </div>
    </div>
  );
}
