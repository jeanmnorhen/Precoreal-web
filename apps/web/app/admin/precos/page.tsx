'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { createChart, ColorType, type IChartApi } from 'lightweight-charts';

export default function AdminPrecos() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '90d'>('30d');
  const [carregando, setCarregando] = useState(true);
  const [dados, setDados] = useState<{ data: string; precoMedio: number }[]>([]);

  useEffect(() => {
    setCarregando(true);
    api.admin.monitoramentoPrecos({ periodo })
      .then((res) => setDados(res.pontos))
      .catch(() => setDados([]))
      .finally(() => setCarregando(false));
  }, [periodo]);

  useEffect(() => {
    if (!chartContainerRef.current || dados.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#78716c',
        fontFamily: 'Outfit, system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: '#e7e5e4' },
        horzLines: { color: '#e7e5e4' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 350,
      rightPriceScale: {
        borderColor: '#d6d3d1',
      },
      timeScale: {
        borderColor: '#d6d3d1',
        timeVisible: false,
      },
      crosshair: {
        vertLine: {
          labelBackgroundColor: '#1e293b',
        },
        horzLine: {
          labelBackgroundColor: '#1e293b',
        },
      },
    });

    chartRef.current = chart;

    const lineSeries = chart.addLineSeries({
      color: '#1e293b',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => `R$ ${(price / 100).toFixed(2)}`,
      },
    });

    const chartData = dados.map((p) => ({
      time: p.data.split('T')[0],
      value: p.precoMedio,
    }));

    lineSeries.setData(chartData as any);
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
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Monitoramento de Preços</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-foreground-muted)' }}>
            Média de preços dos produtos por período
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

      <div className="p-6 rounded-xl" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
        {carregando ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
          </div>
        ) : dados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium mb-1">Nenhum dado disponível</p>
            <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>Aguardando ofertas e preços para gerar o gráfico</p>
          </div>
        ) : (
          <div ref={chartContainerRef} className="w-full" />
        )}
      </div>
    </div>
  );
}
