'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

const REGRAS_TIPO: Record<string, { maxDias: number }> = {
  oferta:            { maxDias: 15 },
  promocao:          { maxDias: 7  },
  promocao_relampago: { maxDias: 3  },
};

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

  const renovar = async (a: any) => {
    const regra = REGRAS_TIPO[a.tipo] || REGRAS_TIPO.oferta;
    const confirma = confirm(
      `Renovar "${a.titulo}"?\n\nCusto: ${a.custoCreditos} crédito(s)\nValidade adicional: ${regra.maxDias} dias\n\nSaldo restante será deduzido automaticamente.`,
    );
    if (!confirma) return;
    try {
      const res = await api.anuncios.renovar(a.id);
      alert(`Anúncio renovado! Créditos restantes: ${res.creditosRestantes}`);
      carregar();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Anúncios</h1>
        <Link href="/lojista/anuncios/adicionar"
          className="px-5 py-2.5 rounded-lg font-bold text-sm transition-all hover:opacity-90"
          style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}>
          + Novo anúncio
        </Link>
      </div>

      {carregando && (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
               style={{ borderColor: 'var(--color-primary)' }} />
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
        {anuncios.map((a: any, i: number) => {
          const ativo = a.status === 'ativo';
          const diasRestantes = ativo
            ? Math.max(0, Math.ceil((new Date(a.dataFim).getTime() - Date.now()) / 86400000))
            : 0;
          return (
            <div key={a.id}
              className="p-5 rounded-xl transition-all hover:shadow-sm animate-fade-in-up"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)', animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-base">{a.titulo}</p>
                  <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
                    Raio: {a.raioAlcanceKm}km · {a.custoCreditos} créditos
                    {ativo && ` · ${diasRestantes}d restantes`}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: ativo ? 'color-mix(in srgb, var(--color-success) 15%, transparent)' : 'color-mix(in srgb, var(--color-destructive) 15%, transparent)',
                    color: ativo ? 'var(--color-success)' : 'var(--color-destructive)',
                  }}>
                  {ativo ? 'Ativo' : 'Pausado'}
                </span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => toggleStatus(a.id, a.status)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
                  style={{
                    background: ativo ? 'color-mix(in srgb, var(--color-destructive) 12%, transparent)' : 'color-mix(in srgb, var(--color-success) 12%, transparent)',
                    color: ativo ? 'var(--color-destructive)' : 'var(--color-success)',
                  }}>
                  {ativo ? 'Pausar' : 'Ativar'}
                </button>
                {ativo && (
                  <button onClick={() => renovar(a)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
                    style={{
                      background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                      color: 'var(--color-primary)',
                    }}>
                    🔄 Renovar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
