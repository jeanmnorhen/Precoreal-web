'use client';

import Link from 'next/link';

interface OfferCardHorizontalProps {
  id: string;
  titulo: string;
  tipo: 'oferta' | 'promocao' | 'promocao_relampago';
  descricao?: string;
  lojaNome: string;
  produtoId: string;
  precoMedio: number;
  distancia: number;
}

const BADGE_TIPO: Record<string, { label: string; bg: string; color: string }> = {
  oferta:            { label: '📢 Oferta',       bg: 'hsla(140,30%,42%,0.1)', color: 'var(--color-verde-600)' },
  promocao:          { label: '🔥 Promoção',      bg: 'hsla(32,80%,50%,0.12)', color: 'var(--color-terracota-600)' },
  promocao_relampago: { label: '⚡ Relâmpago', bg: 'hsla(0,60%,50%,0.1)',   color: 'var(--color-destructive)' },
};

export function OfferCardHorizontal({
  id, titulo, tipo, lojaNome, produtoId, precoMedio, distancia,
}: OfferCardHorizontalProps) {
  const badge = BADGE_TIPO[tipo] || BADGE_TIPO.oferta;

  return (
    <Link href={`/produtos/${produtoId}`} className="no-underline flex-shrink-0">
      <article
        className="w-44 rounded-xl overflow-hidden transition-all hover:shadow-md animate-fade-in-up"
        style={{
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="h-24 w-full flex items-center justify-center relative"
             style={{ background: 'var(--color-greige-100)' }}>
          <span className="text-3xl opacity-30">🛒</span>
          <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: badge.bg, color: badge.color }}>
            {badge.label}
          </span>
        </div>
        <div className="p-2.5">
          <p className="text-xs font-bold truncate">{lojaNome}</p>
          <p className="text-xs line-clamp-1 mt-0.5" style={{ color: 'var(--color-foreground-muted)' }}>
            {titulo}
          </p>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-sm font-extrabold" style={{ color: 'var(--color-verde-600)' }}>
              R$ {(precoMedio / 100).toFixed(2)}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--color-foreground-muted)' }}>
              {distancia < 1 ? `${(distancia * 1000).toFixed(0)}m` : `${distancia.toFixed(1)}km`}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
