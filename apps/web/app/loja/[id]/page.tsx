'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { TopBar } from '@/components/top-bar';
import { BottomNav } from '@/components/bottom-nav';
import Link from 'next/link';

interface Anuncio {
  id: string;
  titulo: string;
  tipo: 'oferta' | 'promocao' | 'promocao_relampago';
  descricao?: string;
  precoMedio?: number;
  produtoNome?: string;
  dataInicio: string;
  dataFim: string;
  status: string;
}

interface LojaPublic {
  id: string;
  nome: string;
  descricao?: string;
  logoUrl?: string;
  tabloideUrl?: string;
  enderecoRua: string;
  enderecoNumero: string;
  enderecoBairro: string;
  enderecoCidade: string;
  enderecoEstado: string;
  anuncios: Anuncio[];
}

const BADGE_TIPO: Record<string, { label: string; color: string }> = {
  oferta:            { label: 'Oferta',       color: 'var(--color-verde-600)' },
  promocao:          { label: 'Promoção',      color: 'var(--color-terracota-600)' },
  promocao_relampago: { label: 'Relâmpago', color: 'var(--color-destructive)' },
};

export default function LojaPublicPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [loja, setLoja] = useState<LojaPublic | null>(null);
  const [carregando, setCarregando] = useState(true);
  const anuncioRef = useRef<HTMLDivElement>(null);

  const lojaId = params?.id as string;
  const anuncioId = searchParams?.get('anuncio');

  useEffect(() => {
    if (!lojaId) return;
    setCarregando(true);
    api.lojas.publicProfile(lojaId)
      .then(setLoja)
      .catch(() => setLoja(null))
      .finally(() => setCarregando(false));
  }, [lojaId]);

  useEffect(() => {
    if (anuncioRef.current && anuncioId) {
      setTimeout(() => {
        anuncioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [anuncioId, loja]);

  if (carregando) {
    return (
      <main className="min-h-screen flex flex-col">
        <TopBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
               style={{ borderColor: 'var(--color-primary)' }} />
        </div>
        <BottomNav />
      </main>
    );
  }

  if (!loja) {
    return (
      <main className="min-h-screen flex flex-col">
        <TopBar />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-lg font-bold mb-1">Loja não encontrada</p>
          <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
            Esta loja não existe ou foi removida.
          </p>
          <Link href="/" className="mt-4 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
            ← Voltar ao início
          </Link>
        </div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <TopBar />

      <div className="flex-1 max-w-3xl mx-auto w-full pt-6 pb-24 px-4">
        {/* Store header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold flex-shrink-0 overflow-hidden"
               style={{ background: 'var(--color-navy-50)', color: 'var(--color-navy-700)' }}>
            {loja.logoUrl ? (
              <img src={loja.logoUrl} alt={loja.nome} className="w-full h-full object-cover" />
            ) : (
              loja.nome.charAt(0)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold tracking-tight">{loja.nome}</h1>
            {loja.descricao && (
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-foreground-muted)' }}>
                {loja.descricao}
              </p>
            )}
            <p className="text-xs mt-1" style={{ color: 'var(--color-foreground-muted)' }}>
              {loja.enderecoRua}, {loja.enderecoNumero} — {loja.enderecoBairro}, {loja.enderecoCidade}/{loja.enderecoEstado}
            </p>
            {loja.tabloideUrl && (
              <a href={loja.tabloideUrl} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-1 mt-2 text-xs font-semibold transition-opacity hover:opacity-70"
                 style={{ color: 'var(--color-primary)' }}>
                📄 Ver tabloide de ofertas →
              </a>
            )}
          </div>
        </div>

        {/* Anúncios */}
        <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-foreground-muted)' }}>
          Ofertas da loja
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'hsla(140,30%,42%,0.1)', color: 'var(--color-verde-600)' }}>
            {loja.anuncios.length}
          </span>
        </h2>

        {loja.anuncios.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
              Nenhuma oferta disponível no momento.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {loja.anuncios.map((a, i) => {
              const badge = BADGE_TIPO[a.tipo] || BADGE_TIPO.oferta;
              const isHighlighted = a.id === anuncioId;
              return (
                <div
                  key={a.id}
                  id={`anuncio-${a.id}`}
                  ref={isHighlighted ? anuncioRef : undefined}
                  className="p-4 rounded-xl transition-all animate-fade-in-up"
                  style={{
                    background: 'var(--color-card)',
                    border: `1px solid ${isHighlighted ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    boxShadow: isHighlighted ? '0 0 0 2px var(--color-primary)' : 'none',
                    animationDelay: `${i * 0.04}s`,
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base">{a.titulo}</p>
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--color-foreground-muted)' }}>
                        {a.descricao}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0 ml-2"
                      style={{ background: `${badge.color}15`, color: badge.color }}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-extrabold" style={{ color: 'var(--color-verde-600)' }}>
                      R$ {((a as any).precoMedio || 0) / 100 > 0 ? ((a as any).precoMedio / 100).toFixed(2) : '—'}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--color-foreground-muted)' }}>
                      Até {new Date(a.dataFim).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
