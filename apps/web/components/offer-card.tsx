'use client';

import Link from 'next/link';

interface OfferCardProps {
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
  index?: number;
}

const BADGE_TIPO: Record<string, { label: string; bg: string; color: string }> = {
  oferta:            { label: '📢 Oferta',       bg: 'hsla(140,30%,42%,0.1)', color: 'var(--color-verde-600)' },
  promocao:          { label: '🔥 Promoção',      bg: 'hsla(32,80%,50%,0.12)', color: 'var(--color-terracota-600)' },
  promocao_relampago: { label: '⚡ Relâmpago', bg: 'hsla(0,60%,50%,0.1)',   color: 'var(--color-destructive)' },
};

export function OfferCard({
  id, titulo, tipo, descricao, distancia,
  lojaNome, lojaId, produtoNome, produtoId, precoMedio, index = 0,
}: OfferCardProps) {
  const badge = BADGE_TIPO[tipo] || BADGE_TIPO.oferta;

  return (
    <article
      className="rounded-xl overflow-hidden transition-all animate-fade-in-up"
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        animationDelay: `${index * 0.04}s`,
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href={`/loja/${lojaId}`} className="no-underline">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                 style={{ background: 'var(--color-navy-50)', color: 'var(--color-navy-700)' }}>
              {lojaNome.charAt(0)}
            </div>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/loja/${lojaId}?anuncio=${id}`} className="no-underline">
                <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--color-foreground)' }}>{lojaNome}</p>
              </Link>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: badge.bg, color: badge.color }}>
                {badge.label}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-foreground-muted)' }}>
              {distancia < 1
                ? `${(distancia * 1000).toFixed(0)}m`
                : `${distancia.toFixed(1)}km`}
            </p>
          </div>
        </div>
      </div>

      <Link href={`/loja/${lojaId}?anuncio=${id}`}>
        <div className="h-44 sm:h-48 w-full flex items-center justify-center relative overflow-hidden"
             style={{ background: 'var(--color-greige-100)' }}>
          <span className="text-5xl opacity-30">🛒</span>
          {distancia < 2 && (
            <span className="absolute top-3 left-3 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide"
                  style={{ background: 'var(--color-verde-500)', color: '#fff' }}>
              Perto de você
            </span>
          )}
        </div>
      </Link>

      <div className="px-4 pt-3 pb-4">
        <p className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--color-verde-600)' }}>
          R$ {(precoMedio / 100).toFixed(2)}
        </p>
        <Link href={`/loja/${lojaId}?anuncio=${id}`} className="no-underline">
          <p className="text-sm font-semibold mt-0.5 leading-tight" style={{ color: 'var(--color-foreground)' }}>
            {titulo}
          </p>
        </Link>
        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--color-foreground-muted)' }}>
          {descricao || produtoNome}
        </p>
        <Link href={`/loja/${lojaId}?anuncio=${id}`}
              className="inline-block mt-2 text-xs font-semibold transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-primary)' }}>
          Ver oferta →
        </Link>
      </div>
    </article>
  );
}
