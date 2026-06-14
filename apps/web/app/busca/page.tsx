'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Produto {
  id: string;
  nome: string;
  codigoBarras: string;
  categoria: string;
  marca: string;
  precoMedio: number;
  descricao?: string;
}

function BuscaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('busca') || '');
  const [resultados, setResultados] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const q = searchParams.get('busca');
    if (q) {
      setCarregando(true);
      api.produtos.buscar(q)
        .then(setResultados)
        .catch(() => setResultados([]))
        .finally(() => setCarregando(false));
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/busca?busca=${encodeURIComponent(query)}`);
  };

  return (
    <main className="min-h-screen px-6 py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-70" style={{ background: 'var(--color-muted)' }}>
          ←
        </Link>
        <h1 className="text-2xl font-bold">Buscar produtos</h1>
      </div>

      <form onSubmit={handleSearch} className="mb-10">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nome, marca, código de barras..."
            className="flex-1 px-5 py-3 rounded-xl text-base outline-none focus:ring-2"
            style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties}
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
          >
            Buscar
          </button>
        </div>
      </form>

      {carregando && (
        <div className="text-center py-12">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--color-primary)' }} />
          <p className="mt-4" style={{ color: 'var(--color-foreground-muted)' }}>Buscando...</p>
        </div>
      )}

      {!carregando && resultados.length === 0 && searchParams.get('busca') && (
        <div className="text-center py-12">
          <p className="text-lg font-medium">Nenhum produto encontrado</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-foreground-muted)' }}>Tente outro termo de busca</p>
        </div>
      )}

      {!carregando && resultados.length > 0 && (
        <div className="grid gap-4">
          {resultados.map((p) => (
            <Link
              key={p.id}
              href={`/produtos/${p.id}`}
              className="flex items-start gap-5 p-6 rounded-2xl transition-all duration-200 hover:scale-[1.01]"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'var(--color-brand-50)' }}>
                📦
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{p.nome}</h3>
                <p className="text-sm mt-0.5" style={{ color: 'var(--color-foreground-muted)' }}>
                  {p.marca} · {p.categoria}
                </p>
                <p className="text-xs font-mono mt-1 opacity-60" style={{ color: 'var(--color-foreground-muted)' }}>
                  {p.codigoBarras}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                  {p.precoMedio > 0 ? `R$ ${(p.precoMedio / 100).toFixed(2)}` : 'N/D'}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-foreground-muted)' }}>preço médio</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!carregando && !searchParams.get('busca') && (
        <div className="text-center py-12">
          <p className="text-lg" style={{ color: 'var(--color-foreground-muted)' }}>Digite um termo para buscar produtos</p>
        </div>
      )}
    </main>
  );
}

export default function BuscaPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
      </main>
    }>
      <BuscaContent />
    </Suspense>
  );
}
