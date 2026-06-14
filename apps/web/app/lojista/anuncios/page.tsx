'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function LojistaAnuncios() {
  const [anuncios, setAnuncios] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = () => {
    setCarregando(true);
    api.anuncios.listar()
      .then(setAnuncios)
      .catch(() => setAnuncios([]))
      .finally(() => setCarregando(false));
  };

  useEffect(() => { carregar(); }, []);

  const toggleStatus = async (id: string, statusAtual: string) => {
    const novoStatus = statusAtual === 'ativo' ? 'pausado' : 'ativo';
    try {
      await api.anuncios.atualizar(id, { status: novoStatus });
      carregar();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Anúncios</h1>
        <Link
          href="/lojista/anuncios/adicionar"
          className="px-5 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
          style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
        >
          + Novo anúncio
        </Link>
      </div>

      {carregando && (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
        </div>
      )}

      {!carregando && anuncios.length === 0 && (
        <div className="text-center py-12" style={{ color: 'var(--color-foreground-muted)' }}>
          <p className="text-lg mb-2">Nenhum anúncio criado</p>
          <Link href="/lojista/anuncios/adicionar" className="font-semibold" style={{ color: 'var(--color-primary)' }}>
            Criar primeiro anúncio
          </Link>
        </div>
      )}

      <div className="grid gap-4">
        {anuncios.map((a: any) => {
          const ativo = a.status === 'ativo';
          return (
            <div key={a.id} className="p-5 rounded-2xl" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-lg">{a.titulo}</p>
                  <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
                    Raio: {a.raioAlcanceKm}km · {a.custoCreditos} créditos/dia
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{
                  background: ativo ? 'rgba(22,163,74,0.1)' : 'rgba(239,68,68,0.1)',
                  color: ativo ? 'var(--color-primary)' : 'var(--color-destructive)',
                }}>
                  {ativo ? 'Ativo' : 'Pausado'}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => toggleStatus(a.id, a.status)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                  style={{
                    background: ativo ? 'rgba(239,68,68,0.1)' : 'rgba(22,163,74,0.1)',
                    color: ativo ? 'var(--color-destructive)' : 'var(--color-primary)',
                  }}
                >
                  {ativo ? 'Pausar' : 'Ativar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
