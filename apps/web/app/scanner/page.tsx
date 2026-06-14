'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarcodeScanner } from '@/components/barcode-scanner';
import { api } from '@/lib/api';
import type { ProdutoScanResultado } from '@precoreal/shared';

interface ProdutoInfo {
  gtin: string;
  lote?: string;
  validade?: Date;
}

interface ScanResponse {
  produto: any;
  ofertasProximas: any[];
}

export default function ScannerPage() {
  const [produto, setProduto] = useState<ProdutoInfo | null>(null);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const router = useRouter();

  const handleScan = async (result: ProdutoScanResultado) => {
    setLoading(true);
    setErro('');

    setProduto({
      gtin: result.gtin,
      lote: result.lote,
      validade: result.validade,
    });

    try {
      let lat: number | undefined;
      let lng: number | undefined;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 }),
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch {}

      const data = await api.scanner.resultado({
        codigoBarras: result.gtin,
        latitude: lat,
        longitude: lng,
      });
      setScanResult(data);
    } catch (err: any) {
      setErro(err.message || 'Produto não encontrado no catálogo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col px-4 py-8 max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
              style={{ background: 'var(--color-muted)' }}>
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Escanear produto</h1>
          <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
            Aponte para o código de barras
          </p>
        </div>
      </div>

      <div className="animate-fade-in-up">
        <BarcodeScanner onScanSuccess={handleScan} />
        <p className="text-center text-sm mt-4" style={{ color: 'var(--color-foreground-muted)' }}>
          Compatível com EAN-13, QR Code e GS1 DataMatrix
        </p>
      </div>

      {loading && (
        <div className="mt-8 text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl"
               style={{ background: 'var(--color-muted)' }}>
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                 style={{ borderColor: 'var(--color-primary)' }} />
            <span className="font-medium">Buscando preços...</span>
          </div>
        </div>
      )}

      {erro && !loading && (
        <div className="mt-8 p-4 rounded-xl text-sm animate-fade-in-up"
             style={{ background: 'hsl(0,50%,95%)', color: 'var(--color-destructive)' }}>
          {erro}
        </div>
      )}

      {scanResult && !loading && (
        <div className="mt-8 glass-card p-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                 style={{ background: 'var(--color-navy-50)' }}>
              ✅
            </div>
            <div>
              <p className="font-bold text-lg">{scanResult.produto.nome || 'Produto identificado'}</p>
              <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
                {scanResult.produto.marca} · {scanResult.produto.categoria}
              </p>
            </div>
          </div>

          <dl className="space-y-3">
            <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <dt className="text-sm font-medium" style={{ color: 'var(--color-foreground-muted)' }}>GTIN / EAN</dt>
              <dd className="font-mono font-bold tracking-wider">{produto?.gtin}</dd>
            </div>
            {produto?.lote && (
              <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <dt className="text-sm font-medium" style={{ color: 'var(--color-foreground-muted)' }}>Lote</dt>
                <dd className="font-mono">{produto.lote}</dd>
              </div>
            )}
            {produto?.validade && (
              <div className="flex justify-between items-center py-2">
                <dt className="text-sm font-medium" style={{ color: 'var(--color-foreground-muted)' }}>Validade</dt>
                <dd className="font-semibold">{new Date(produto.validade).toLocaleDateString('pt-BR')}</dd>
              </div>
            )}
            <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <dt className="text-sm font-medium" style={{ color: 'var(--color-foreground-muted)' }}>Preço médio</dt>
              <dd className="font-bold text-lg" style={{ color: 'var(--color-navy-600)' }}>
                R$ {(scanResult.produto.precoMedio / 100).toFixed(2)}
              </dd>
            </div>
          </dl>

          {scanResult.ofertasProximas.length > 0 && (
            <div className="mt-6">
              <p className="font-bold text-base mb-3">
                Ofertas próximas ({scanResult.ofertasProximas.length})
              </p>
              <div className="space-y-3">
                {scanResult.ofertasProximas.map((oferta: any) => (
                  <div key={oferta.id}
                    className="flex justify-between items-center p-4 rounded-xl"
                    style={{ background: 'var(--color-background)' }}>
                    <div>
                      <p className="font-semibold">{oferta.lojaNome}</p>
                      <p className="text-xs" style={{ color: 'var(--color-foreground-muted)' }}>
                        {oferta.distancia < 1 ? `${(oferta.distancia * 1000).toFixed(0)}m` : `${oferta.distancia.toFixed(1)}km`}
                      </p>
                    </div>
                    <p className="font-bold" style={{ color: 'var(--color-navy-600)' }}>
                      R$ {(oferta.precoMedio / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {scanResult.ofertasProximas.length === 0 && (
            <p className="mt-4 text-sm text-center" style={{ color: 'var(--color-foreground-muted)' }}>
              Nenhuma oferta encontrada perto de você
            </p>
          )}

          <Link href={`/produtos/${scanResult.produto.id}`}
            className="mt-6 w-full py-3 rounded-xl font-bold text-base text-center block transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'var(--color-navy-700)', color: '#fff' }}>
            Ver detalhes →
          </Link>

          <button
            className="mt-3 w-full py-3 rounded-xl font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-foreground-muted)' }}
            onClick={() => { setProduto(null); setScanResult(null); setErro(''); }}>
            Escanear outro produto
          </button>
        </div>
      )}
    </main>
  );
}
