'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Produto {
  id: string;
  nome: string;
  codigoBarras: string;
  categoria: string;
  marca: string;
  precoMedio: number;
  descricao?: string;
  listaImagens?: string[];
}

interface Oferta {
  id: string;
  titulo: string;
  distancia: number;
  lojaNome: string;
  precoMedio: number;
}

export default function ProdutoPage() {
  const { id } = useParams<{ id: string }>();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [geoError, setGeoError] = useState(false);

  useEffect(() => {
    if (!id) return;

    api.produtos.detalhe(id)
      .then(async (p) => {
        setProduto(p);

        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }),
          );
          const ofertas = await api.anuncios.proximos(
            pos.coords.latitude,
            pos.coords.longitude,
          );
          setOfertas(ofertas.filter((a: any) => a.codigoBarras === p.codigoBarras));
        } catch {
          setGeoError(true);
        }
      })
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, [id]);

  if (carregando) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
      </main>
    );
  }

  if (!produto) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-xl font-bold">Produto não encontrado</p>
          <Link href="/busca" className="mt-4 inline-block font-semibold" style={{ color: 'var(--color-primary)' }}>
            Buscar produtos
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/busca" className="w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-70" style={{ background: 'var(--color-muted)' }}>
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{produto.nome}</h1>
          <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
            {produto.marca} · {produto.categoria}
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl mb-8" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-foreground-muted)' }}>Código de Barras</dt>
            <dd className="font-mono font-bold mt-1">{produto.codigoBarras}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-foreground-muted)' }}>Preço Médio</dt>
            <dd className="font-bold text-2xl mt-1" style={{ color: 'var(--color-primary)' }}>
              {produto.precoMedio > 0 ? `R$ ${(produto.precoMedio / 100).toFixed(2)}` : 'N/D'}
            </dd>
          </div>
          {produto.descricao && (
            <div className="col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-foreground-muted)' }}>Descrição</dt>
              <dd className="mt-1" style={{ color: 'var(--color-foreground-muted)' }}>{produto.descricao}</dd>
            </div>
          )}
        </dl>
      </div>

      <h2 className="text-xl font-bold mb-4">Ofertas próximas</h2>

      {geoError && (
        <div className="p-4 rounded-xl text-sm mb-4" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-destructive)' }}>
          Não foi possível obter sua localização. Ative a geolocalização para ver ofertas próximas.
        </div>
      )}

      {ofertas.length === 0 && !geoError && (
        <div className="text-center py-8" style={{ color: 'var(--color-foreground-muted)' }}>
          <p className="text-lg mb-2">Nenhuma oferta encontrada perto de você</p>
          <Link href="/scanner" className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
            Escanear outro produto
          </Link>
        </div>
      )}

      <div className="grid gap-4">
        {ofertas.map((o) => (
          <div
            key={o.id}
            className="flex items-center justify-between p-5 rounded-2xl transition-all"
            style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}
          >
            <div>
              <p className="font-bold">{o.titulo}</p>
              <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
                {o.lojaNome} · {o.distancia < 1 ? `${(o.distancia * 1000).toFixed(0)}m` : `${o.distancia.toFixed(1)}km`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                R$ {(o.precoMedio / 100).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
