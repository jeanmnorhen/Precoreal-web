'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function AdminCosmos() {
  const [quota, setQuota] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [novoLimite, setNovoLimite] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    api.admin.cosmos.quota()
      .then(setQuota)
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, []);

  const handleAjustar = async () => {
    const limite = parseInt(novoLimite, 10);
    if (isNaN(limite) || limite < 1) return;
    try {
      await api.admin.cosmos.ajustarLimite(limite);
      setMensagem(`Limite alterado para ${limite} consultas/dia.`);
      setQuota((prev: any) => ({ ...prev, limiteDiario: limite, disponiveis: Math.max(0, limite - (prev?.consultasUtilizadas || 0)) }));
    } catch (err: any) {
      setMensagem(err.message);
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
      </div>
    );
  }

  const usadas = quota?.consultasUtilizadas || 0;
  const limite = quota?.limiteDiario || 25;
  const disponiveis = quota?.disponiveis || 0;
  const percentual = Math.round((usadas / limite) * 100);

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl font-bold mb-2">API Cosmos</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--color-foreground-muted)' }}>
        Gerenciamento da integração com o catálogo Cosmos Bluesoft
      </p>

      <div className="p-6 rounded-xl mb-6" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
        <h2 className="text-lg font-bold mb-4">Quota de Consultas</h2>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Hoje</span>
            <span className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
              {usadas} / {limite} consultas
            </span>
          </div>
          <div className="w-full h-3 rounded-full" style={{ background: 'var(--color-muted)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(percentual, 100)}%`,
                background: percentual >= 90 ? 'var(--color-destructive)' : percentual >= 70 ? 'var(--color-terracota-600)' : 'var(--color-primary)',
              }}
            />
          </div>
          <p className="text-xs mt-1.5" style={{ color: 'var(--color-foreground-muted)' }}>
            {disponiveis} consultas disponíveis
          </p>
        </div>

        <div className="p-4 rounded-lg" style={{ background: 'var(--color-background)' }}>
          <h3 className="text-sm font-semibold mb-2">Ajustar limite diário</h3>
          <div className="flex gap-2">
            <input type="number" min={1} value={novoLimite}
              onChange={(e) => setNovoLimite(e.target.value)}
              placeholder={String(limite)}
              className="flex-1 px-4 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties} />
            <button onClick={handleAjustar}
              className="px-4 py-2 rounded-lg text-sm font-bold transition-all hover:opacity-90"
              style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}>
              Salvar
            </button>
          </div>
          {mensagem && (
            <p className="text-xs mt-2" style={{ color: 'var(--color-primary)' }}>{mensagem}</p>
          )}
        </div>
      </div>
    </div>
  );
}
