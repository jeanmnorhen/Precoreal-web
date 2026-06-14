'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BarcodeScanner } from '@/components/barcode-scanner';
import type { ProdutoScanResultado } from '@precoreal/shared';

interface ProdutoInfo {
  gtin: string;
  lote?: string;
  validade?: Date;
}

export default function ScannerPage() {
  const [produto, setProduto] = useState<ProdutoInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (result: ProdutoScanResultado) => {
    setLoading(true);
    setProduto({
      gtin: result.gtin,
      lote: result.lote,
      validade: result.validade,
    });
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col px-4 py-8 max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/"
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:opacity-70"
              style={{ background: 'var(--color-muted)', color: 'var(--color-foreground)' }}>
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Escanear produto</h1>
          <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
            Aponte para o código de barras
          </p>
        </div>
      </div>

      {/* Scanner */}
      <div className="animate-fade-in-up">
        <BarcodeScanner onScanSuccess={handleScan} />
        <p className="text-center text-sm mt-4" style={{ color: 'var(--color-foreground-muted)' }}>
          Compatível com EAN-13, QR Code e GS1 DataMatrix
        </p>
      </div>

      {/* Resultado */}
      {loading && (
        <div className="mt-8 text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl"
               style={{ background: 'var(--color-muted)' }}>
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                 style={{ borderColor: 'var(--color-primary)' }} />
            <span className="font-medium">Buscando preços...</span>
          </div>
        </div>
      )}

      {produto && !loading && (
        <div className="mt-8 glass-card p-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                 style={{ background: 'var(--color-brand-50)' }}>
              ✅
            </div>
            <div>
              <p className="font-bold text-lg">Produto identificado</p>
              <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
                Código lido com sucesso
              </p>
            </div>
          </div>

          <dl className="space-y-3">
            <div className="flex justify-between items-center py-2"
                 style={{ borderBottom: '1px solid var(--color-border)' }}>
              <dt className="text-sm font-medium" style={{ color: 'var(--color-foreground-muted)' }}>
                GTIN / EAN
              </dt>
              <dd className="font-mono font-bold tracking-wider">{produto.gtin}</dd>
            </div>
            {produto.lote && (
              <div className="flex justify-between items-center py-2"
                   style={{ borderBottom: '1px solid var(--color-border)' }}>
                <dt className="text-sm font-medium" style={{ color: 'var(--color-foreground-muted)' }}>
                  Lote
                </dt>
                <dd className="font-mono">{produto.lote}</dd>
              </div>
            )}
            {produto.validade && (
              <div className="flex justify-between items-center py-2">
                <dt className="text-sm font-medium" style={{ color: 'var(--color-foreground-muted)' }}>
                  Validade
                </dt>
                <dd className="font-semibold">
                  {new Date(produto.validade).toLocaleDateString('pt-BR')}
                </dd>
              </div>
            )}
          </dl>

          <button
            className="mt-6 w-full py-3 rounded-xl font-bold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-95"
            style={{
              background: 'var(--color-primary)',
              color: 'var(--color-primary-foreground)',
              boxShadow: '0 4px 16px hsla(142,76%,36%,0.3)',
            }}
            onClick={() => {/* TODO: buscar preços por GTIN */}}
          >
            Ver preços próximos →
          </button>

          <button
            className="mt-3 w-full py-3 rounded-xl font-medium transition-colors hover:opacity-70"
            style={{ color: 'var(--color-foreground-muted)' }}
            onClick={() => setProduto(null)}
          >
            Escanear outro produto
          </button>
        </div>
      )}
    </main>
  );
}
