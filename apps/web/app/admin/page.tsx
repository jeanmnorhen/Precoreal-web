'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface DashboardData {
  usuariosAtivos: number;
  totalOfertas: number;
  novasLojas: number;
  produtosPendentesRevisao: number;
  produtosPendentesLista: { id: string; nome: string; codigoBarras: string; criadoEm: string }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api.admin.dashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
      </div>
    );
  }

  const widgets = [
    { label: 'Usuários ativos (30d)', value: data?.usuariosAtivos || 0, icon: '👥', color: 'var(--color-navy-600)' },
    { label: 'Ofertas criadas', value: data?.totalOfertas || 0, icon: '📢', color: 'var(--color-terracota-600)' },
    { label: 'Novas lojas (30d)', value: data?.novasLojas || 0, icon: '🏪', color: 'var(--color-verde-600)' },
    { label: 'Revisão pendente', value: data?.produtosPendentesRevisao || 0, icon: '⏳', color: 'var(--color-destructive)' },
  ];

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Administrativo</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-foreground-muted)' }}>
          Métricas e monitoramento do ecossistema
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {widgets.map((w, i) => (
          <div key={w.label}
            className="p-6 rounded-xl transition-all hover:shadow-sm animate-fade-in-up"
            style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)', animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{w.icon}</span>
            </div>
            <p className="text-3xl font-extrabold" style={{ color: w.color }}>
              {w.value}
            </p>
            <p className="text-xs mt-1 uppercase tracking-wider font-medium" style={{ color: 'var(--color-foreground-muted)' }}>
              {w.label}
            </p>
          </div>
        ))}
      </div>

      {/* Produtos pendentes de revisão */}
      <div className="p-6 rounded-xl" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
        <h2 className="text-lg font-bold mb-4">⏳ Produtos Pendentes de Revisão</h2>
        {(!data?.produtosPendentesLista || data.produtosPendentesLista.length === 0) ? (
          <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>Nenhum produto pendente de revisão.</p>
        ) : (
          <div className="space-y-3">
            {data.produtosPendentesLista.map((p, i) => (
              <div key={p.id}
                className="flex items-center justify-between p-4 rounded-lg animate-fade-in-up"
                style={{ background: 'var(--color-background)', animationDelay: `${i * 0.05}s` }}>
                <div>
                  <p className="font-semibold">{p.nome}</p>
                  <p className="text-xs font-mono" style={{ color: 'var(--color-foreground-muted)' }}>
                    {p.codigoBarras}
                  </p>
                </div>
                <p className="text-xs" style={{ color: 'var(--color-foreground-muted)' }}>
                  {new Date(p.criadoEm).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
