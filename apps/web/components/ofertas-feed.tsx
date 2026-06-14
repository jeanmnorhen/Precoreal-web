'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface Oferta {
  id: string;
  titulo: string;
  descricao?: string;
  distancia: number;
  lojaNome: string;
  lojaId: string;
  produtoNome: string;
  produtoId: string;
  codigoBarras: string;
  precoMedio: number;
  produtoImagem?: string;
}

export function OfertasFeed() {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'denied' | 'ok'>('idle');
  const watchIdRef = useRef<number | null>(null);

  const buscarOfertas = useCallback(async (lat: number, lng: number) => {
    setCarregando(true);
    try {
      const data = await api.anuncios.proximos(lat, lng);
      setOfertas(data);
      setGeoStatus('ok');
    } catch {
      setGeoStatus('denied');
    } finally {
      setCarregando(false);
    }
  }, []);

  const solicitarLocalizacao = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus('denied');
      setCarregando(false);
      return;
    }
    setGeoStatus('loading');
    setCarregando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        buscarOfertas(pos.coords.latitude, pos.coords.longitude);
        watchIdRef.current = navigator.geolocation.watchPosition(
          (newPos) => buscarOfertas(newPos.coords.latitude, newPos.coords.longitude),
          () => {},
          { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 },
        );
      },
      () => { setGeoStatus('denied'); setCarregando(false); },
      { timeout: 5000 },
    );
  }, [buscarOfertas]);

  useEffect(() => {
    solicitarLocalizacao();
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [solicitarLocalizacao]);

  const stories = ['Todas', 'Laticínios', 'Grãos', 'Bebidas', 'Limpeza', 'Higiene', 'Massas', 'Cafés', 'Biscoitos'];

  return (
    <div className="pb-20">
      {/* Banner de localização (quando negada/erro) */}
      {geoStatus === 'denied' && (
        <div className="flex items-center gap-2 px-4 py-3 mx-4 mt-3 rounded-xl"
             style={{ background: 'var(--color-navy-50)', border: '1px solid var(--color-navy-100)' }}>
          <span className="text-lg leading-none">📍</span>
          <p className="text-xs flex-1 font-medium" style={{ color: 'var(--color-navy-700)' }}>
            Ative a localização para aproveitar o Preço Real
          </p>
          <button onClick={solicitarLocalizacao}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all hover:opacity-80"
                  style={{ background: 'var(--color-navy-700)', color: '#fff' }}>
            Já ativei a localização
          </button>
        </div>
      )}

      {/* Stories: Categorias */}
      <div className="px-4 py-3 overflow-x-auto scrollbar-none">
        <div className="flex gap-4">
          {stories.map((cat) => (
            <button key={cat} className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-xs"
                   style={{
                     background: cat === 'Todas' ? 'var(--color-primary)' : 'var(--color-navy-50)',
                     color: cat === 'Todas' ? '#fff' : 'var(--color-navy-700)',
                     border: cat === 'Todas' ? 'none' : '2px solid var(--color-border)',
                   }}>
                {cat === 'Todas' ? '★' : cat.charAt(0)}
              </div>
              <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: 'var(--color-foreground-muted)' }}>
                {cat}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {(carregando || geoStatus === 'loading') && (
        <div className="px-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden animate-pulse"
                 style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full" style={{ background: 'var(--color-greige-200)' }} />
                <div className="h-3 rounded w-32" style={{ background: 'var(--color-greige-200)' }} />
              </div>
              <div className="h-48 w-full" style={{ background: 'var(--color-greige-200)' }} />
              <div className="p-4 space-y-2">
                <div className="h-4 rounded w-3/4" style={{ background: 'var(--color-greige-200)' }} />
                <div className="h-3 rounded w-1/2" style={{ background: 'var(--color-greige-200)' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vazio (geo ok mas sem ofertas) */}
      {geoStatus === 'ok' && !carregando && ofertas.length === 0 && (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
            Nenhuma oferta encontrada na sua região
          </p>
        </div>
      )}

      {/* Feed de ofertas */}
      {ofertas.length > 0 && (
        <div className="space-y-3 px-4">
          {ofertas.map((oferta, i) => (
            <article key={oferta.id}
                     className="rounded-xl overflow-hidden transition-all animate-fade-in-up"
                     style={{
                       background: 'var(--color-card)',
                       border: '1px solid var(--color-border)',
                       animationDelay: `${i * 0.04}s`,
                     }}>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                       style={{ background: 'var(--color-navy-50)', color: 'var(--color-navy-700)' }}>
                    {oferta.lojaNome.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{oferta.lojaNome}</p>
                    <p className="text-xs" style={{ color: 'var(--color-foreground-muted)' }}>
                      {oferta.distancia < 1
                        ? `${(oferta.distancia * 1000).toFixed(0)}m`
                        : `${oferta.distancia.toFixed(1)}km`}
                    </p>
                  </div>
                </div>
                <button className="text-lg leading-none hover:opacity-70 transition-opacity">⋯</button>
              </div>

              <Link href={`/produtos/${oferta.produtoId}`}>
                <div className="h-48 sm:h-56 w-full flex items-center justify-center relative overflow-hidden"
                     style={{ background: 'var(--color-greige-100)' }}>
                  <span className="text-6xl opacity-30">🛒</span>
                  {oferta.distancia < 2 && (
                    <span className="absolute top-3 left-3 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide"
                          style={{ background: 'var(--color-verde-500)', color: '#fff' }}>
                      Próximo
                    </span>
                  )}
                </div>
              </Link>

              <div className="flex items-center justify-between px-4 pt-3">
                <div className="flex items-center gap-3">
                  <button className="text-xl leading-none hover:scale-110 transition-transform">♡</button>
                  <button className="text-xl leading-none hover:scale-110 transition-transform">💬</button>
                  <button className="text-xl leading-none hover:scale-110 transition-transform">↗</button>
                </div>
                <button className="text-xl leading-none hover:scale-110 transition-transform">🔖</button>
              </div>

              <div className="px-4 pt-2 pb-3">
                <p className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--color-verde-600)' }}>
                  R$ {(oferta.precoMedio / 100).toFixed(2)}
                </p>
                <Link href={`/produtos/${oferta.produtoId}`} className="no-underline">
                  <p className="text-sm font-semibold mt-0.5 leading-tight" style={{ color: 'var(--color-foreground)' }}>
                    {oferta.titulo}
                  </p>
                </Link>
                <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--color-foreground-muted)' }}>
                  {oferta.descricao || oferta.produtoNome}
                </p>
                <Link href={`/produtos/${oferta.produtoId}`}
                      className="inline-block mt-2 text-xs font-semibold transition-opacity hover:opacity-70"
                      style={{ color: 'var(--color-primary)' }}>
                  Ver oferta →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
