'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarcodeScanner } from '@/components/barcode-scanner';
import { BottomNav } from '@/components/bottom-nav';
import { api } from '@/lib/api';
import type { ProdutoScanResultado } from '@precoreal/shared';

interface ProdutoIdentificado {
  id: string;
  nome: string;
  marca: string;
  categoria: string;
  codigoBarras: string;
  precoMedio: number;
}

export default function ScannerPage() {
  const [produtoScan, setProdutoScan] = useState<ProdutoScanResultado | null>(null);
  const [produto, setProduto] = useState<ProdutoIdentificado | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const router = useRouter();

  const handleScan = async (result: ProdutoScanResultado) => {
    setLoading(true);
    setErro('');
    setProduto(null);
    setConfirmando(false);

    setProdutoScan(result);

    try {
      const data = await api.produtos.porCodigo(result.gtin);
      setProduto({
        id: data.id,
        nome: data.nome,
        marca: data.marca,
        categoria: data.categoria,
        codigoBarras: data.codigoBarras,
        precoMedio: data.precoMedio,
      });
      setConfirmando(true);
    } catch {
      setErro('Produto não identificado');
    } finally {
      setLoading(false);
    }
  };

  const confirmarBusca = () => {
    if (produto) {
      router.push(`/busca?produtoId=${produto.id}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-50" style={{ background: 'var(--color-card)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-3 px-4 h-14 max-w-3xl mx-auto">
          <Link href="/" className="text-lg leading-none hover:opacity-70 transition-opacity" style={{ color: 'var(--color-foreground-muted)' }}>
            ←
          </Link>
          <h1 className="text-lg font-bold tracking-tight">Escanear produto</h1>
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6 pb-24 space-y-6">
        <BarcodeScanner onScanSuccess={handleScan} />

        <p className="text-center text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
          Compatível com EAN-13, QR Code e GS1 DataMatrix
        </p>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 p-4 rounded-xl animate-fade-in"
               style={{ background: 'var(--color-muted)' }}>
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                 style={{ borderColor: 'var(--color-primary)' }} />
            <span className="font-medium text-sm">Identificando produto...</span>
          </div>
        )}

        {/* Produto identificado — confirmação */}
        {confirmando && produto && !loading && (
          <div className="glass-card p-6 animate-scale-in space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                   style={{ background: 'color-mix(in srgb, var(--color-success) 15%, transparent)' }}>
                ✅
              </div>
              <div>
                <p className="font-bold text-lg">{produto.nome}</p>
                <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
                  {produto.marca} · {produto.categoria}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--color-foreground-muted)' }}>Código</span>
              <span className="font-mono font-bold">{produto.codigoBarras}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium" style={{ color: 'var(--color-foreground-muted)' }}>Preço médio</span>
              <span className="font-bold text-lg" style={{ color: 'var(--color-success)' }}>
                R$ {(produto.precoMedio / 100).toFixed(2)}
              </span>
            </div>

            <p className="text-center text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
              Este é o produto que você escaneou?
            </p>

            <div className="flex gap-3">
              <button onClick={confirmarBusca}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}>
                Sim, buscar ofertas
              </button>
              <button onClick={() => { setProduto(null); setConfirmando(false); setProdutoScan(null); }}
                className="flex-1 py-3 rounded-xl font-medium text-sm transition-all hover:opacity-70"
                style={{ border: '1.5px solid var(--color-border)', color: 'var(--color-foreground-muted)' }}>
                Escanear outro
              </button>
            </div>
          </div>
        )}

        {/* Produto não identificado */}
        {erro && !loading && (
          <div className="p-6 rounded-xl text-center animate-fade-in"
               style={{ background: 'color-mix(in srgb, var(--color-destructive) 10%, var(--color-card))', border: '1px solid color-mix(in srgb, var(--color-destructive) 30%, var(--color-card))' }}>
            <p className="text-3xl mb-2">🔍</p>
            <p className="font-bold" style={{ color: 'var(--color-destructive)' }}>Produto não identificado</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-foreground-muted)' }}>
              Nenhum produto encontrado para este código de barras
            </p>
            <button onClick={() => { setErro(''); setProdutoScan(null); }}
              className="mt-4 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
              style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}>
              Escanear outro produto
            </button>
          </div>
        )}

        {/* Estado inicial */}
        {!loading && !confirmando && !erro && !produtoScan && (
          <div className="text-center py-6">
            <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
              Aponte a câmera para o código de barras do produto
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
