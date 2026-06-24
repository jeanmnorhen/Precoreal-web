'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import type { TestExecutionResult, TestSuiteResult } from '@precoreal/api-contracts';

export default function AdminTestes() {
  const [executando, setExecutando] = useState(false);
  const [resultado, setResultado] = useState<TestExecutionResult | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [expandir, setExpandir] = useState<string | null>(null);

  const executar = async () => {
    setExecutando(true);
    setErro(null);
    setResultado(null);
    try {
      const res = await api.admin.testes.executar();
      setResultado(res);
    } catch (err: any) {
      setErro(err.message || 'Erro ao executar testes');
    } finally {
      setExecutando(false);
    }
  };

  const totalSuites = (r: TestExecutionResult['unit'] | TestExecutionResult['e2e']) =>
    r.numPassedSuites + r.numFailedSuites;

  const totalTests = (r: TestExecutionResult['unit'] | TestExecutionResult['e2e']) =>
    r.numPassedTests + r.numFailedTests;

  const statusGeral = (r: TestExecutionResult['unit'] | TestExecutionResult['e2e']) =>
    r.numFailedSuites === 0 && r.numFailedTests === 0;

  const SuiteList = ({ suites, label }: { suites: TestSuiteResult[]; label: string }) => (
    <div className="mt-4">
      <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-foreground-muted)' }}>
        {label} ({suites.length})
      </p>
      <div className="space-y-1">
        {suites.map((s) => (
          <div key={s.name}>
            <button
              onClick={() => setExpandir(expandir === s.name ? null : s.name)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all hover:opacity-80"
              style={{ background: 'var(--color-card)' }}
            >
              <span>{s.status === 'passed' ? '🟢' : '🔴'}</span>
              <span className="flex-1 truncate font-medium" style={{ color: 'var(--color-foreground)' }}>
                {s.name}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-foreground-muted)' }}>
                {(s.duration / 1000).toFixed(1)}s · {s.numPassingTests}/{s.numPassingTests + s.numFailingTests}
              </span>
            </button>
            {expandir === s.name && s.failureMessage && (
              <pre className="mt-1 px-4 py-3 rounded-lg text-xs overflow-x-auto"
                   style={{ background: 'color-mix(in srgb, var(--color-destructive) 6%, transparent)', color: 'var(--color-destructive)', border: '1px solid color-mix(in srgb, var(--color-destructive) 15%, transparent)' }}>
                {s.failureMessage}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Testes</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-foreground-muted)' }}>
            Execução e relatório de testes automatizados
          </p>
        </div>
        <button
          onClick={executar}
          disabled={executando}
          className="px-6 py-2.5 rounded-lg font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
        >
          {executando ? '⏳ Executando...' : '▶ Executar testes'}
        </button>
      </div>

      {executando && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-4"
               style={{ borderColor: 'var(--color-primary)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--color-foreground-muted)' }}>
            Executando testes... isso pode levar até 60 segundos.
          </p>
        </div>
      )}

      {erro && (
        <div className="p-4 rounded-xl mb-6 text-sm"
             style={{ background: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)', color: 'var(--color-destructive)', border: '1px solid color-mix(in srgb, var(--color-destructive) 20%, transparent)' }}>
          {erro}
        </div>
      )}

      {resultado && !executando && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
              <p className="text-3xl font-extrabold" style={{ color: 'var(--color-success)' }}>
                {resultado.unit.numPassedSuites + resultado.e2e.numPassedSuites}/{totalSuites(resultado.unit) + totalSuites(resultado.e2e)}
              </p>
              <p className="text-xs mt-1 uppercase tracking-wider font-medium" style={{ color: 'var(--color-foreground-muted)' }}>
                Suítes
              </p>
            </div>
            <div className="p-5 rounded-xl" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
              <p className="text-3xl font-extrabold" style={{ color: 'var(--color-success)' }}>
                {resultado.unit.numPassedTests + resultado.e2e.numPassedTests}/{totalTests(resultado.unit) + totalTests(resultado.e2e)}
              </p>
              <p className="text-xs mt-1 uppercase tracking-wider font-medium" style={{ color: 'var(--color-foreground-muted)' }}>
                Testes
              </p>
            </div>
            <div className="p-5 rounded-xl" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
              <p className="text-3xl font-extrabold" style={{ color: 'var(--color-primary)' }}>
                {((resultado.unit.duration + resultado.e2e.duration) / 1000).toFixed(1)}s
              </p>
              <p className="text-xs mt-1 uppercase tracking-wider font-medium" style={{ color: 'var(--color-foreground-muted)' }}>
                Duração total
              </p>
            </div>
          </div>

          {resultado.coverage && (
            <div className="p-5 rounded-xl" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
              <p className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-foreground-muted)' }}>
                📊 Cobertura
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Linhas', value: resultado.coverage.lines },
                  { label: 'Statements', value: resultado.coverage.statements },
                  { label: 'Functions', value: resultado.coverage.functions },
                  { label: 'Branches', value: resultado.coverage.branches },
                ].map((c) => (
                  <div key={c.label}>
                    <p className="text-xl font-extrabold" style={{
                      color: c.value >= 80 ? 'var(--color-success)' : c.value >= 50 ? 'var(--color-warning)' : 'var(--color-destructive)'
                    }}>
                      {c.value}%
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-foreground-muted)' }}>{c.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {statusGeral(resultado.unit) && statusGeral(resultado.e2e) ? (
            <div className="px-4 py-3 rounded-xl text-sm font-semibold"
                 style={{ background: 'color-mix(in srgb, var(--color-success) 8%, transparent)', color: 'var(--color-success)' }}>
              ✅ Todos os testes passaram!
            </div>
          ) : (
            <div className="px-4 py-3 rounded-xl text-sm font-semibold"
                 style={{ background: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)', color: 'var(--color-destructive)' }}>
              ❌ {resultado.unit.numFailedSuites + resultado.e2e.numFailedSuites} suíte(s) com falha
            </div>
          )}

          <SuiteList suites={resultado.unit.suites} label="Unitários" />
          <SuiteList suites={resultado.e2e.suites} label="E2E" />
        </div>
      )}

      {!resultado && !executando && !erro && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-4xl mb-4">🧪</span>
          <p className="text-lg font-bold mb-1" style={{ color: 'var(--color-foreground)' }}>
            Nenhum teste executado
          </p>
          <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
            Clique em &quot;Executar testes&quot; para iniciar.
          </p>
        </div>
      )}
    </div>
  );
}
