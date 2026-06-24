'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function FuncionarioProdutos() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  const lojaId = typeof window !== 'undefined' ? localStorage.getItem('funcionarioLojaId') : null;

  useEffect(() => {
    if (!lojaId) return;
    setCarregando(true);
    api.funcionario.produtos.listar(lojaId)
      .then(setProdutos)
      .catch(() => setProdutos([]))
      .finally(() => setCarregando(false));
  }, [lojaId]);

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Produtos</h1>

      {carregando && (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
        </div>
      )}

      {!carregando && produtos.length === 0 && (
        <div className="text-center py-12" style={{ color: 'var(--color-foreground-muted)' }}>
          <p>Nenhum produto encontrado para esta loja</p>
        </div>
      )}

      <div className="grid gap-3">
        {produtos.map((row: any, i: number) => {
          const p = row.produtos || row;
          return (
            <div key={p.id}
              className="flex items-center justify-between p-5 rounded-xl transition-all hover:shadow-sm animate-fade-in-up"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)', animationDelay: `${i * 0.04}s` }}>
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
          );
        })}
      </div>
    </div>
  );
}
