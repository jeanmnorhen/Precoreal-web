'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function LojistaProdutos() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = (q?: string) => {
    setCarregando(true);
    api.produtos.buscar(q)
      .then(setProdutos)
      .catch(() => setProdutos([]))
      .finally(() => setCarregando(false));
  };

  useEffect(() => { carregar(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <Link
          href="/lojista/produtos/adicionar"
          className="px-5 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
          style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
        >
          + Adicionar produto
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={busca}
          onChange={(e) => { setBusca(e.target.value); carregar(e.target.value || undefined); }}
          placeholder="Buscar produtos..."
          className="w-full px-5 py-3 rounded-xl text-base outline-none focus:ring-2"
          style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties}
        />
      </div>

      {carregando && (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
        </div>
      )}

      {!carregando && produtos.length === 0 && (
        <div className="text-center py-12" style={{ color: 'var(--color-foreground-muted)' }}>
          <p className="text-lg mb-2">Nenhum produto encontrado</p>
          <Link href="/lojista/produtos/adicionar" className="font-semibold" style={{ color: 'var(--color-primary)' }}>
            Adicionar primeiro produto
          </Link>
        </div>
      )}

      <div className="grid gap-3">
        {produtos.map((p: any) => (
          <div key={p.id} className="flex items-center justify-between p-5 rounded-2xl" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
            <div>
              <p className="font-bold">{p.nome}</p>
              <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
                {p.marca} · {p.categoria} · <span className="font-mono">{p.codigoBarras}</span>
              </p>
            </div>
            <p className="font-bold" style={{ color: 'var(--color-primary)' }}>
              R$ {(p.precoMedio / 100).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
