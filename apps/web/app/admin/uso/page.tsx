'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { createChart, ColorType, type IChartApi } from 'lightweight-charts';

interface UsoData {
  volumeBuscas: { data: string; total: number }[];
  produtosMaisBuscados: { produtoId: string; nome: string; totalBuscas: number }[];
  engajamento: { data: string; usuariosAtivos: number }[];
}

export default function AdminUso() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '90d'>('30d');
  const [carregando, setCarregando] = useState(true);
  const [dados, setDados] = useState<UsoData | null>(null);

  useEffect(() => {
    setCarregando(true);
    api.admin.monitoramentoUso({ periodo })
      .then(setDados)
      .catch(() => setDados(null))
      .finally(() => setCarregando(false));
  }, [periodo]);

  useEffect(() => {
    if (!chartContainerRef.current || !dados?.volumeBuscas || dados.volumeBuscas.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'var(--color-foreground-muted)',
        fontFamily: 'Outfit, system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: 'var(--color-border)' },
        horzLines: { color: 'var(--color-border)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      rightPriceScale: {
        borderColor: 'var(--color-border)',
      },
      timeScale: {
        borderColor: 'var(--color-border)',
        timeVisible: false,
      },
    });

    chartRef.current = chart;

    const histogramSeries = chart.addHistogramSeries({
      color: 'var(--color-primary)',
      priceFormat: { type: 'volume' },
      priceScaleId: 'right',
    });

    const chartData = dados.volumeBuscas.map((p) => ({
      time: p.data,
      value: p.total,
      color: 'var(--color-primary)',
    }));

    histogramSeries.setData(chartData as any);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [dados]);

  const periodos = [
    { key: '7d', label: '7 dias' },
    { key: '30d', label: '30 dias' },
    { key: '90d', label: '90 dias' },
  ] as const;

  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Monitoramento de Uso</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-foreground-muted)' }}>
            Atividade do aplicativo e engajamento dos usuários
          </p>
        </div>
        <div className="flex gap-1">
          {periodos.map((p) => (
            <button key={p.key} onClick={() => setPeriodo(p.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: periodo === p.key ? 'var(--color-primary)' : 'var(--color-muted)',
                color: periodo === p.key ? 'var(--color-primary-foreground)' : 'var(--color-foreground)',
              }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Volume de Buscas */}
      <div className="p-6 rounded-xl" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
        <h2 className="text-base font-bold mb-4">📊 Volume de Buscas</h2>
        {carregando ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
          </div>
        ) : !dados?.volumeBuscas || dados.volumeBuscas.length === 0 ? (
          <p className="text-sm py-8 text-center" style={{ color: 'var(--color-foreground-muted)' }}>Nenhum dado disponível</p>
        ) : (
          <div ref={chartContainerRef} className="w-full" />
        )}
      </div>

      {/* Produtos mais buscados */}
      <div className="p-6 rounded-xl" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
        <h2 className="text-base font-bold mb-4">🏆 Produtos Mais Buscados</h2>
        {carregando ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
          </div>
        ) : !dados?.produtosMaisBuscados || dados.produtosMaisBuscados.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: 'var(--color-foreground-muted)' }}>Nenhum dado disponível</p>
        ) : (
          <div className="space-y-2">
            {dados.produtosMaisBuscados.map((p, i) => (
              <div key={p.produtoId}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: 'var(--color-background)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold w-5 text-center" style={{ color: 'var(--color-foreground-muted)' }}>#{i + 1}</span>
                  <span className="font-medium text-sm">{p.nome}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>{p.totalBuscas}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
