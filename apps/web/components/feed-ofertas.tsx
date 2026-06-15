'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api';
import { OfferCard } from './offer-card';

interface Oferta {
  id: string;
  titulo: string;
  tipo: 'oferta' | 'promocao' | 'promocao_relampago';
  descricao?: string;
  distancia: number;
  lojaNome: string;
  lojaId: string;
  produtoNome: string;
  produtoId: string;
  precoMedio: number;
}

interface FeedOfertasProps {
  searchTerm?: string;
  categoria?: string;
  coordenadas: { lat: number; lng: number } | null;
}

export function FeedOfertas({ searchTerm, categoria, coordenadas }: FeedOfertasProps) {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const carregar = useCallback(async () => {
    if (!coordenadas) return;
    setCarregando(true);
    try {
      let data = (await api.anuncios.proximos(coordenadas.lat, coordenadas.lng) as unknown as Oferta[])
        .filter((item, idx, arr) => arr.findIndex((i) => i.id === item.id) === idx);

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        data = data.filter((o) =>
          o.titulo.toLowerCase().includes(term) ||
          o.lojaNome.toLowerCase().includes(term) ||
          o.produtoNome.toLowerCase().includes(term)
        );
      }

      setOfertas(data);
    } catch {
      setOfertas([]);
    } finally {
      setCarregando(false);
    }
  }, [coordenadas, searchTerm]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (carregando) {
    return (
      <div className="px-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl overflow-hidden animate-pulse"
               style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full" style={{ background: 'var(--color-greige-200)' }} />
              <div className="h-3 rounded w-32" style={{ background: 'var(--color-greige-200)' }} />
            </div>
            <div className="h-44 w-full" style={{ background: 'var(--color-greige-200)' }} />
            <div className="p-4 space-y-2">
              <div className="h-4 rounded w-3/4" style={{ background: 'var(--color-greige-200)' }} />
              <div className="h-3 rounded w-1/2" style={{ background: 'var(--color-greige-200)' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (ofertas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
          {searchTerm
            ? 'Nenhuma oferta encontrada para esta busca'
            : 'Nenhuma oferta encontrada na sua região'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 px-4 mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-foreground-muted)' }}>
          Ofertas
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'hsla(222,47%,95%,1)', color: 'var(--color-navy-600)' }}>
          {ofertas.length}
        </span>
      </div>

      <div className="space-y-3 px-4">
        {ofertas.map((oferta, i) => (
          <OfferCard key={oferta.id} {...oferta} index={i} />
        ))}
      </div>

      <div ref={sentinelRef} className="h-4" />
    </div>
  );
}
