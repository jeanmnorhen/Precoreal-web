'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api';
import { OfferCardHorizontal } from './offer-card-horizontal';

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

interface FeedPromocoesProps {
  searchTerm?: string;
  categoria?: string;
  coordenadas: { lat: number; lng: number } | null;
}

export function FeedPromocoes({ searchTerm, categoria, coordenadas }: FeedPromocoesProps) {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const carregar = useCallback(async () => {
    if (!coordenadas) return;
    setLoading(true);
    try {
      const data = await api.anuncios.proximos(coordenadas.lat, coordenadas.lng, 'promocao');
      const dataRelampago = await api.anuncios.proximos(coordenadas.lat, coordenadas.lng, 'promocao_relampago');
      const todas = ([...data, ...dataRelampago] as unknown as Oferta[])
        .filter((item, idx, arr) => arr.findIndex((i) => i.id === item.id) === idx);

      let filtradas = todas;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtradas = todas.filter((o) =>
          o.titulo.toLowerCase().includes(term) ||
          o.lojaNome.toLowerCase().includes(term) ||
          o.produtoNome.toLowerCase().includes(term)
        );
      }

      setOfertas(filtradas);
    } catch {
      setOfertas([]);
    } finally {
      setLoading(false);
    }
  }, [coordenadas, searchTerm]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (loading) {
    return (
      <div className="flex gap-3 px-4 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-44 rounded-xl flex-shrink-0 animate-pulse"
               style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <div className="h-24" style={{ background: 'var(--color-muted)' }} />
            <div className="p-2.5 space-y-2">
              <div className="h-3 rounded w-3/4" style={{ background: 'var(--color-muted)' }} />
              <div className="h-2 rounded w-1/2" style={{ background: 'var(--color-muted)' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (ofertas.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 px-4 mb-2">
        <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-foreground)' }}>
          Promoções
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}>
          {ofertas.length}
        </span>
      </div>
      <div
        ref={containerRef}
        className="flex gap-3 px-4 overflow-x-auto scrollbar-none pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {ofertas.map((oferta) => (
          <div key={oferta.id} style={{ scrollSnapAlign: 'start' }}>
            <OfferCardHorizontal {...oferta} />
          </div>
        ))}
      </div>
    </div>
  );
}
