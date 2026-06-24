'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function FuncionarioAnuncios() {
  const [anuncios, setAnuncios] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  const lojaId = typeof window !== 'undefined' ? localStorage.getItem('funcionarioLojaId') : null;

  useEffect(() => {
    if (!lojaId) return;
    setCarregando(true);
    api.funcionario.anuncios.listar(lojaId)
      .then(setAnuncios)
      .catch(() => setAnuncios([]))
      .finally(() => setCarregando(false));
  }, [lojaId]);

  const BADGE_TIPO: Record<string, { label: string; bg: string; color: string }> = {
    oferta:            { label: '📢 Oferta',       bg: 'hsla(140,30%,42%,0.1)', color: 'var(--color-success)' },
    promocao:          { label: '🔥 Promoção',      bg: 'hsla(32,80%,50%,0.12)', color: 'var(--color-warning)' },
    promocao_relampago: { label: '⚡ Relâmpago', bg: 'hsla(0,60%,50%,0.1)',   color: 'var(--color-destructive)' },
  };

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Ofertas da Loja</h1>

      {carregando && (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
        </div>
      )}

      {!carregando && anuncios.length === 0 && (
        <div className="text-center py-12" style={{ color: 'var(--color-foreground-muted)' }}>
          <p>Nenhuma oferta ativa no momento</p>
        </div>
      )}

      <div className="grid gap-4">
        {anuncios.map((row: any, i: number) => {
          const a = row.anuncios || row;
          const badge = BADGE_TIPO[a.tipo || 'oferta'] || BADGE_TIPO.oferta;
          const ativo = a.status === 'ativo';

          return (
            <div key={a.id}
              className="p-5 rounded-xl transition-all hover:shadow-sm animate-fade-in-up"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)', animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-base">{a.titulo}</p>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: badge.bg, color: badge.color }}>
                    {badge.label}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: ativo ? 'hsla(140,30%,42%,0.1)' : 'hsla(0,50%,50%,0.1)',
                    color: ativo ? 'var(--color-success)' : 'var(--color-destructive)',
                  }}>
                  {ativo ? 'Ativo' : 'Pausado'}
                </span>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
                Raio: {a.raioAlcanceKm}km · {a.custoCreditos} créditos/dia
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
