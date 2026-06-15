'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TopBar } from '@/components/top-bar';
import { BottomNav } from '@/components/bottom-nav';
import { SearchBar } from '@/components/search-bar';
import { CategoryFilters } from '@/components/category-filters';
import { FeedPromocoes } from '@/components/feed-promocoes';
import { FeedOfertas } from '@/components/feed-ofertas';

export default function HomePage() {
  const [coordenadas, setCoordenadas] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'denied' | 'ok'>('idle');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const watchIdRef = useRef<number | null>(null);

  const solicitarLocalizacao = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus('denied');
      return;
    }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordenadas({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus('ok');
        watchIdRef.current = navigator.geolocation.watchPosition(
          (newPos) => setCoordenadas({ lat: newPos.coords.latitude, lng: newPos.coords.longitude }),
          () => {},
          { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 },
        );
      },
      () => { setGeoStatus('denied'); },
      { timeout: 5000 },
    );
  }, []);

  useEffect(() => {
    solicitarLocalizacao();
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [solicitarLocalizacao]);

  return (
    <main className="min-h-screen flex flex-col">
      <TopBar />

      <div className="flex-1 max-w-3xl mx-auto w-full pt-4 pb-24 space-y-4">
        {/* Banner de localização */}
        {geoStatus === 'denied' && (
          <div className="flex items-center gap-2 px-4 py-3 mx-4 rounded-xl"
               style={{ background: 'var(--color-navy-50)', border: '1px solid var(--color-navy-100)' }}>
            <span className="text-lg leading-none">📍</span>
            <p className="text-xs flex-1 font-medium" style={{ color: 'var(--color-navy-700)' }}>
              Ative a localização para ver ofertas perto de você
            </p>
            <button onClick={solicitarLocalizacao}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap"
                    style={{ background: 'var(--color-navy-700)', color: '#fff' }}>
              Tentar novamente
            </button>
          </div>
        )}

        {/* Barra de pesquisa */}
        <div className="px-4">
          <SearchBar onSearch={setSearchTerm} />
        </div>

        {/* Filtros de categoria */}
        <CategoryFilters onSelect={setCategoria} />

        {/* Feed horizontal — Promoções e Promoções Relâmpago */}
        {coordenadas && (
          <FeedPromocoes
            searchTerm={searchTerm}
            categoria={categoria === 'Todas' ? undefined : categoria}
            coordenadas={coordenadas}
          />
        )}

        {/* Feed vertical — Ofertas */}
        {coordenadas && (
          <FeedOfertas
            searchTerm={searchTerm}
            categoria={categoria === 'Todas' ? undefined : categoria}
            coordenadas={coordenadas}
          />
        )}

        {/* Loading inicial */}
        {geoStatus === 'loading' && (
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
