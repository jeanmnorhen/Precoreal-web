'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { ObservabilidadeResponse, FilaStatus, ErroRecente } from '@precoreal/api-contracts';

type TabId = 'health' | 'filas' | 'erros';

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'health', label: 'Saúde', icon: '🩺' },
  { id: 'filas', label: 'Filas', icon: '📨' },
  { id: 'erros', label: 'Erros', icon: '⚠️' },
];

function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'ok' ? 'var(--color-success)' :
    status === 'healthy' ? 'var(--color-success)' :
    status === 'degraded' ? 'var(--color-warning)' : 'var(--color-destructive)';
  const bg =
    status === 'ok' || status === 'healthy' ? 'color-mix(in srgb, var(--color-success) 15%, transparent)' :
    status === 'degraded' ? 'color-mix(in srgb, var(--color-warning) 15%, transparent)' : 'color-mix(in srgb, var(--color-destructive) 15%, transparent)';
  return (
    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
      style={{ color, background: bg }}>
      {status === 'nao_configurado' ? 'n/d' : status}
    </span>
  );
}

function FilaRow({ fila }: { fila: FilaStatus }) {
  return (
    <div className="grid grid-cols-7 gap-2 text-sm py-2.5 px-3 rounded-lg border"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
      <div className="font-bold col-span-1">{fila.nome}</div>
      <div className="text-center">{fila.depth}</div>
      <div className="text-center" style={{ color: 'var(--color-warning)' }}>{fila.ativos}</div>
      <div className="text-center">{fila.aguardando}</div>
      <div className="text-center" style={{ color: 'var(--color-success)' }}>{fila.processados}</div>
      <div className="text-center" style={{ color: 'var(--color-destructive)' }}>{fila.falhos}</div>
      <div className="text-center text-xs">
        <span style={{ color: 'var(--color-success)' }}>+{fila.processadosHoje}</span>
        {' / '}
        <span style={{ color: 'var(--color-destructive)' }}>-{fila.falhosHoje}</span>
      </div>
    </div>
  );
}

function ErrorRow({ erro }: { erro: ErroRecente }) {
  return (
    <div className="flex items-start gap-3 py-2.5 px-3 rounded-lg border text-sm"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
      <span className="text-lg mt-0.5">
        {erro.statusCode >= 500 ? '🔥' : erro.statusCode >= 400 ? '⚠️' : 'ℹ️'}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded font-bold"
            style={{ background: 'var(--color-muted)', color: 'var(--color-foreground-muted)' }}>
            {erro.metodo}
          </span>
          <span className="font-mono text-[11px] font-bold"
            style={{ color: erro.statusCode >= 500 ? 'var(--color-destructive)' : 'var(--color-warning)' }}>
            {erro.statusCode}
          </span>
          <StatusBadge status={erro.statusCode >= 500 ? 'erro' : 'degraded'} />
        </div>
        <p className="mt-1 font-medium truncate">{erro.mensagem}</p>
        <p className="text-[11px] truncate" style={{ color: 'var(--color-foreground-muted)' }}>
          {erro.metodo} {erro.url}
        </p>
        <p className="text-[10px]" style={{ color: 'var(--color-foreground-muted)' }}>
          {new Date(erro.ocorridoEm).toLocaleString('pt-BR')}
        </p>
      </div>
    </div>
  );
}

export default function ObservabilidadePage() {
  const [data, setData] = useState<ObservabilidadeResponse | null>(null);
  const [tab, setTab] = useState<TabId>('health');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    api.admin.observabilidade()
      .then(setData)
      .catch(() => setError('Erro ao carregar dados de observabilidade.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const sp = (ms: number) => ms < 1 ? '<1ms' : ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Observabilidade</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-foreground-muted)' }}>
            Monitoramento do sistema
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
          style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)', opacity: loading ? 0.6 : 1 }}>
          {loading ? '🔄 Carregando...' : '🔄 Atualizar'}
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-lg text-sm font-medium"
          style={{ background: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)', color: 'var(--color-destructive)' }}>
          {error}
        </div>
      )}

      {!data && loading && (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--color-primary)' }} />
        </div>
      )}

      {data && (
        <>
          <div className="flex gap-1 mb-8">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: tab === t.id ? 'var(--color-primary)' : 'transparent',
                  color: tab === t.id ? 'var(--color-primary-foreground)' : 'var(--color-foreground)',
                  border: tab === t.id ? 'none' : '1px solid var(--color-border)',
                }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {tab === 'health' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">
                  {data.health.status === 'healthy' ? '✅' : data.health.status === 'degraded' ? '⚠️' : '❌'}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">Sistema {data.health.status === 'healthy' ? 'saudável' : data.health.status === 'degraded' ? 'degradado' : 'indisponível'}</span>
                    <StatusBadge status={data.health.status} />
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-foreground-muted)' }}>
                    Uptime: {Math.floor(data.health.uptime / 86400)}d {Math.floor((data.health.uptime % 86400) / 3600)}h · {new Date(data.health.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">Banco de Dados</span>
                    <StatusBadge status={data.health.servicos.bancoDeDados.status} />
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-foreground-muted)' }}>
                    Latência: {sp(data.health.servicos.bancoDeDados.latencyMs)}
                  </p>
                  {data.health.servicos.bancoDeDados.error && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-destructive)' }}>{data.health.servicos.bancoDeDados.error}</p>
                  )}
                </div>

                <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">Redis</span>
                    <StatusBadge status={data.health.servicos.redis.status} />
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-foreground-muted)' }}>
                    Latência: {sp(data.health.servicos.redis.latencyMs)}
                  </p>
                  {data.health.servicos.redis.error && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-destructive)' }}>{data.health.servicos.redis.error}</p>
                  )}
                </div>

                <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">Stripe</span>
                    <StatusBadge status={data.health.servicos.stripe.status} />
                  </div>
                  {data.health.servicos.stripe.latencyMs !== undefined && (
                    <p className="text-xs" style={{ color: 'var(--color-foreground-muted)' }}>
                      Latência: {sp(data.health.servicos.stripe.latencyMs)}
                    </p>
                  )}
                  {data.health.servicos.stripe.error && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-destructive)' }}>{data.health.servicos.stripe.error}</p>
                  )}
                </div>

                <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">Storage (Blob)</span>
                    <StatusBadge status={data.health.servicos.storage.status} />
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-foreground-muted)' }}>
                    {data.health.servicos.storage.status === 'nao_configurado' ? 'Token não definido' : 'Operacional'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === 'filas' && (
            <div>
              <div className="grid grid-cols-7 gap-2 text-[11px] font-bold uppercase tracking-wider mb-2 px-3"
                style={{ color: 'var(--color-foreground-muted)' }}>
                <div>Fila</div>
                <div className="text-center">Depth</div>
                <div className="text-center">Ativos</div>
                <div className="text-center">Aguardando</div>
                <div className="text-center">Processados</div>
                <div className="text-center">Falhos</div>
                <div className="text-center">Hoje + / -</div>
              </div>
              <div className="space-y-2">
                {data.filas.map((f) => <FilaRow key={f.nome} fila={f} />)}
              </div>
              {data.filas.length === 0 && (
                <p className="text-sm py-8 text-center" style={{ color: 'var(--color-foreground-muted)' }}>
                  Nenhuma fila encontrada.
                </p>
              )}
            </div>
          )}

          {tab === 'erros' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg font-bold">{data.erros.total}</span>
                <span className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
                  erro{data.erros.total !== 1 ? 's' : ''} capturado{data.erros.total !== 1 ? 's' : ''} (últimos 50)
                </span>
              </div>
              <div className="space-y-2">
                {data.erros.erros.map((e) => <ErrorRow key={e.id} erro={e} />)}
              </div>
              {data.erros.erros.length === 0 && (
                <div className="text-center py-12">
                  <span className="text-4xl">✅</span>
                  <p className="mt-3 text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
                    Nenhum erro capturado. O sistema está funcionando sem falhas.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
