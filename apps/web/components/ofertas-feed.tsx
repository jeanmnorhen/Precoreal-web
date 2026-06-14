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
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'denied' | 'error' | 'ok'>('idle');
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const buscarOfertas = useCallback(async (lat: number, lng: number) => {
    setCarregando(true);
    try {
      const data = await api.anuncios.proximos(lat, lng);
      setOfertas(data.slice(0, 12));
      setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));
      setGeoStatus('ok');
      setCoords({ lat, lng });
    } catch {
      setGeoStatus('error');
    } finally {
      setCarregando(false);
    }
  }, []);

  const solicitarLocalizacao = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus('denied');
      return;
    }

    setGeoStatus('loading');

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
        setGeoStatus('denied');
        setCarregando(false);
      },
      { timeout: 5000 },
    );
  }, [buscarOfertas]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  if (geoStatus === 'idle') {
    return (
      <section className="px-6 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-8 animate-fade-in"
               style={{ background: 'var(--color-navy-50)', color: 'var(--color-navy-600)', border: '1px solid var(--color-navy-100)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-terracota-500)' }} />
            Geolocalização
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 animate-fade-in-up">
            Ofertas <span className="gradient-navy bg-clip-text text-transparent">perto de você</span>
          </h2>

          <p className="text-base md:text-lg max-w-lg mx-auto mb-10 leading-relaxed animate-fade-in-up stagger-1"
             style={{ color: 'var(--color-foreground-muted)' }}>
            Veja anúncios de lojas na sua região. Compare preços e encontre a melhor oferta perto de casa.
          </p>

          <button onClick={solicitarLocalizacao}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-base font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] animate-fade-in-up stagger-2 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-navy-700) 0%, var(--color-navy-900) 100%)',
                    color: '#fff',
                    boxShadow: '0 4px 24px hsla(222,48%,22%,0.25)',
                  }}>
            <span className="text-lg">📍</span>
            Mostrar ofertas da minha região
          </button>

          <div className="flex items-center justify-center gap-6 mt-8 text-sm animate-fade-in-up stagger-3"
               style={{ color: 'var(--color-foreground-muted)' }}>
            <span>🔍 Compare preços</span>
            <span>📍 Lojas próximas</span>
            <span>💰 Economize</span>
          </div>
        </div>
      </section>
    );
  }

  if (geoStatus === 'loading' || (carregando && geoStatus === 'ok')) {
    return (
      <section className="px-6 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Ofertas perto de você</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--color-foreground-muted)' }}>
                Buscando ofertas na sua região…
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-5 rounded-xl animate-pulse"
                   style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
                <div className="h-4 rounded w-3/4 mb-3" style={{ background: 'var(--color-greige-200)' }} />
                <div className="h-3 rounded w-1/2 mb-4" style={{ background: 'var(--color-greige-200)' }} />
                <div className="flex justify-between items-end">
                  <div>
                    <div className="h-3 rounded w-20 mb-1" style={{ background: 'var(--color-greige-200)' }} />
                    <div className="h-2 rounded w-14" style={{ background: 'var(--color-greige-200)' }} />
                  </div>
                  <div className="h-5 rounded w-16" style={{ background: 'var(--color-greige-200)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (geoStatus === 'denied') {
    return (
      <section className="px-6 py-16 sm:py-20" style={{ background: 'var(--color-background-subtle)' }}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6"
               style={{ background: 'var(--color-terracota-50)' }}>
            📍
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">Ative a localização</h2>
          <p className="text-base max-w-md mx-auto mb-8" style={{ color: 'var(--color-foreground-muted)' }}>
            Precisamos da sua localização para mostrar ofertas de lojas próximas. Você pode ativar nas configurações do navegador.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={solicitarLocalizacao}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: 'var(--color-navy-700)', color: '#fff' }}>
              🔄 Tentar novamente
            </button>
            <Link href="/busca"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ border: '1px solid var(--color-border)' }}>
              🔍 Buscar produtos
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!carregando && ofertas.length === 0) {
    return (
      <section className="px-6 py-16 sm:py-20" style={{ background: 'var(--color-background-subtle)' }}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6"
               style={{ background: 'var(--color-navy-50)' }}>
            🏪
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">Nada por aqui ainda</h2>
          <p className="text-base max-w-md mx-auto mb-3" style={{ color: 'var(--color-foreground-muted)' }}>
            Nenhuma oferta encontrada na sua região no momento.
          </p>
          <p className="text-sm max-w-md mx-auto mb-8" style={{ color: 'var(--color-foreground-muted)' }}>
            Que tal buscar um produto ou escanear um código de barras?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/busca"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'var(--color-navy-700)', color: '#fff' }}>
              🔍 Buscar produtos
            </Link>
            <Link href="/scanner"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{ border: '1px solid var(--color-border)' }}>
              📷 Escanear
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                 style={{ background: 'var(--color-verde-50)', color: 'var(--color-verde-700)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-verde-500)' }} />
              Ao vivo
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ofertas <span style={{ color: 'var(--color-primary)' }}>próximas</span>
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-foreground-muted)' }}>
              {ofertas.length} oferta{ofertas.length !== 1 && 's'} encontrada{ofertas.length !== 1 && 's'}
              {ultimaAtualizacao && <span className="ml-2 opacity-60">· {ultimaAtualizacao}</span>}
            </p>
          </div>
          <Link href="/busca"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-navy-600)' }}>
            Ver todas
            <span className="text-lg leading-none">→</span>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ofertas.map((oferta, i) => (
            <Link key={oferta.id}
              href={`/busca?busca=${encodeURIComponent(oferta.codigoBarras || oferta.produtoNome)}`}
              className="group block p-5 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 animate-fade-in-up"
              style={{
                border: '1px solid var(--color-border)',
                background: 'var(--color-card)',
                animationDelay: `${i * 0.04}s`,
              }}>
              <div className="flex items-start justify-between mb-3">
                <p className="font-bold text-sm leading-snug group-hover:text-navy-600 transition-colors line-clamp-2 flex-1">
                  {oferta.titulo}
                </p>
                <span className="text-xs font-semibold ml-3 px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{
                        background: oferta.distancia < 1 ? 'var(--color-verde-50)' : 'var(--color-navy-50)',
                        color: oferta.distancia < 1 ? 'var(--color-verde-700)' : 'var(--color-navy-600)',
                      }}>
                  {oferta.distancia < 1
                    ? `${(oferta.distancia * 1000).toFixed(0)}m`
                    : `${oferta.distancia.toFixed(1)}km`}
                </span>
              </div>

              <p className="text-xs mb-4 line-clamp-1" style={{ color: 'var(--color-foreground-muted)' }}>
                {oferta.produtoNome}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
                       style={{ background: 'var(--color-navy-50)', color: 'var(--color-navy-600)' }}>
                    🏪
                  </div>
                  <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-navy-600)' }}>
                    {oferta.lojaNome}
                  </span>
                </div>
                <span className="text-lg font-extrabold tabular-nums ml-3" style={{ color: 'var(--color-verde-600)' }}>
                  R$ {(oferta.precoMedio / 100).toFixed(2)}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link href="/busca"
                className="inline-flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-navy-600)' }}>
            Ver todas as ofertas
            <span className="text-lg leading-none">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
