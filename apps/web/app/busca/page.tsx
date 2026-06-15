'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchBar } from '@/components/search-bar';
import { FeedOfertas } from '@/components/feed-ofertas';
import { BottomNav } from '@/components/bottom-nav';
import Link from 'next/link';

function BuscaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('busca') || searchParams.get('produtoId') || '';
  const [coordenadas, setCoordenadas] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoordenadas({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 5000 },
    );
  }, []);

  const handleSearch = (term: string) => {
    if (term.trim()) {
      router.push(`/busca?busca=${encodeURIComponent(term.trim())}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-50" style={{ background: 'var(--color-card)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-3 px-4 h-14 max-w-3xl mx-auto">
          <Link href="/" className="text-lg leading-none hover:opacity-70 transition-opacity" style={{ color: 'var(--color-foreground-muted)' }}>
            ←
          </Link>
          <div className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Buscar produtos, lojas, marcas..."
              autoFocus
            />
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full pt-4 pb-24">
        {query && (
          <div className="px-4 mb-2">
            <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
              Resultados para: <span className="font-semibold" style={{ color: 'var(--color-foreground)' }}>{query}</span>
            </p>
          </div>
        )}

        {coordenadas ? (
          <FeedOfertas
            searchTerm={query}
            coordenadas={coordenadas}
          />
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                 style={{ borderColor: 'var(--color-primary)' }} />
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

export default function BuscaPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
             style={{ borderColor: 'var(--color-primary)' }} />
      </main>
    }>
      <BuscaContent />
    </Suspense>
  );
}
