'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Oferta {
  id: string;
  titulo: string;
  distancia: number;
  lojaNome: string;
  lojaLatitude: number;
  lojaLongitude: number;
  produtoNome: string;
  codigoBarras: string;
  precoMedio: number;
}

export function OfertasFeed() {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [geoError, setGeoError] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>('');
  const watchIdRef = useRef<number | null>(null);

  const buscarOfertas = useCallback(async (lat: number, lng: number) => {
    try {
      const data = await api.anuncios.proximos(lat, lng);
      setOfertas(data.slice(0, 6));
      setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));
      setGeoError(false);
    } catch {
      setGeoError(true);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setCarregando(false);
      setGeoError(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        buscarOfertas(pos.coords.latitude, pos.coords.longitude);

        watchIdRef.current = navigator.geolocation.watchPosition(
          (newPos) => {
            buscarOfertas(newPos.coords.latitude, newPos.coords.longitude);
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 },
        );
      },
      () => {
        setCarregando(false);
        setGeoError(true);
      },
      { timeout: 5000 },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [buscarOfertas]);

  if (carregando) {
    return (
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">Ofertas perto de você</h2>
            <p className="text-base" style={{ color: 'var(--color-foreground-muted)' }}>
              Buscando ofertas na sua região…
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                 style={{ borderColor: 'var(--color-navy-600)' }} />
          </div>
        </div>
      </section>
    );
  }

  if (geoError) {
    return (
      <section className="py-24 px-6" style={{ background: 'var(--color-background-subtle)' }}>
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">Ofertas perto de você</h2>
          <p className="text-base" style={{ color: 'var(--color-foreground-muted)' }}>
            Ative a geolocalização para ver ofertas da sua região.
          </p>
        </div>
      </section>
    );
  }

  if (ofertas.length === 0) {
    return (
      <section className="py-24 px-6" style={{ background: 'var(--color-background-subtle)' }}>
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">Ofertas perto de você</h2>
          <p className="text-base" style={{ color: 'var(--color-foreground-muted)' }}>
            Nenhuma oferta encontrada na sua região no momento.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6" style={{ background: 'var(--color-background-subtle)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ofertas perto de você</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-foreground-muted)' }}>
              {ofertas.length} ofertas encontradas · atualiza em tempo real
              {ultimaAtualizacao && <span className="ml-2 opacity-60">· {ultimaAtualizacao}</span>}
            </p>
          </div>
          <Link href="/busca"
            className="hidden sm:inline-flex text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-navy-600)' }}>
            Ver todas →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ofertas.map((oferta, i) => (
            <Link key={oferta.id}
              href={`/busca?busca=${encodeURIComponent(oferta.codigoBarras || oferta.produtoNome)}`}
              className="p-5 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 animate-fade-in-up group"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)', animationDelay: `${i * 0.05}s` }}>
              <p className="font-bold text-base mb-1 group-hover:text-navy-600 transition-colors">
                {oferta.titulo}
              </p>
              <p className="text-sm mb-3" style={{ color: 'var(--color-foreground-muted)' }}>
                {oferta.produtoNome}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-navy-600)' }}>
                    {oferta.lojaNome}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-foreground-muted)' }}>
                    {oferta.distancia < 1
                      ? `${(oferta.distancia * 1000).toFixed(0)}m`
                      : `${oferta.distancia.toFixed(1)}km`}
                  </p>
                </div>
                <span className="text-lg font-bold" style={{ color: 'var(--color-navy-700)' }}>
                  R$ {(oferta.precoMedio / 100).toFixed(2)}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link href="/busca"
            className="text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-navy-600)' }}>
            Ver todas as ofertas →
          </Link>
        </div>
      </div>
    </section>
  );
}
