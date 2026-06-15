'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const REGRAS_TIPO = {
  oferta:            { label: '📢 Oferta',       maxDias: 15, custoMin: 1,  raioMaxKm: 3,  cor: 'hsla(140,30%,42%,0.1)' },
  promocao:          { label: '🔥 Promoção',      maxDias: 7,  custoMin: 3,  raioMaxKm: 5,  cor: 'hsla(32,80%,50%,0.12)' },
  promocao_relampago: { label: '⚡ Relâmpago',   maxDias: 3,  custoMin: 5,  raioMaxKm: 10, cor: 'hsla(0,60%,50%,0.1)' },
};

export default function AdicionarAnuncio() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [tipo, setTipo] = useState<'oferta' | 'promocao' | 'promocao_relampago'>('oferta');
  const [form, setForm] = useState({
    produtoId: '', titulo: '', descricao: '', raioAlcanceKm: 3,
    custoCreditos: 1, dataInicio: '', dataFim: '',
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api.produtos.buscar()
      .then(setProdutos)
      .catch(() => {});
  }, []);

  const regra = REGRAS_TIPO[tipo];

  const handleTipoChange = (novoTipo: typeof tipo) => {
    setTipo(novoTipo);
    const r = REGRAS_TIPO[novoTipo];
    setForm((prev) => ({
      ...prev,
      raioAlcanceKm: r.raioMaxKm,
      custoCreditos: r.custoMin,
    }));
  };

  const hoje = new Date().toISOString().split('T')[0];

  const calcularDataMax = (dataInicio: string) => {
    if (!dataInicio) return '';
    const d = new Date(dataInicio);
    d.setDate(d.getDate() + regra.maxDias);
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.produtoId) { setErro('Selecione um produto.'); return; }
    setSalvando(true);
    setErro('');
    try {
      await api.anuncios.criar({ ...form, tipo });
      router.push('/lojista/anuncios');
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto animate-fade-in-up">
      <h1 className="text-2xl font-bold mb-2">Criar Anúncio</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--color-foreground-muted)' }}>
        Escolha o tipo e preencha os dados do anúncio
      </p>

      {/* Seletor de tipo */}
      <div className="flex gap-2 mb-6">
        {(Object.entries(REGRAS_TIPO) as [typeof tipo, typeof regra][]).map(([key, r]) => (
          <button
            key={key}
            onClick={() => handleTipoChange(key)}
            className="flex-1 py-3 rounded-xl text-xs font-bold transition-all"
            style={{
              background: tipo === key ? r.cor : 'var(--color-muted)',
              color: tipo === key ? 'var(--color-foreground)' : 'var(--color-foreground-muted)',
              border: tipo === key ? `1.5px solid ${r.cor}` : '1.5px solid transparent',
            }}
          >
            <span className="block text-base mb-0.5">{r.label.split(' ')[0]}</span>
            <span className="block">{r.label.split(' ').slice(1).join(' ')}</span>
          </button>
        ))}
      </div>

      {/* Info do tipo selecionado */}
      <div className="p-4 rounded-xl mb-6 text-xs space-y-1"
           style={{ background: regra.cor }}>
        <p><strong>Validade máxima:</strong> {regra.maxDias} dias</p>
        <p><strong>Créditos mínimos:</strong> {regra.custoMin} crédito(s)/dia</p>
        <p><strong>Raio máximo:</strong> {regra.raioMaxKm} km</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {erro && (
          <div className="p-4 rounded-xl text-sm font-medium" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-destructive)' }}>
            {erro}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1.5">Produto</label>
          <select
            value={form.produtoId}
            onChange={(e) => setForm({ ...form, produtoId: e.target.value })}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2"
            style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties}
          >
            <option value="">Selecione um produto</option>
            {produtos.map((p: any) => (
              <option key={p.id} value={p.id}>{p.nome} - {p.codigoBarras}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Título do Anúncio</label>
          <input type="text" required value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2"
            style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Data Início</label>
            <input type="date" required min={hoje} value={form.dataInicio}
              onChange={(e) => {
                const dataFimMax = calcularDataMax(e.target.value);
                setForm({
                  ...form,
                  dataInicio: e.target.value,
                  dataFim: form.dataFim > dataFimMax ? dataFimMax : form.dataFim,
                });
              }}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2"
              style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Data Fim</label>
            <input type="date" required
              min={form.dataInicio || hoje}
              max={calcularDataMax(form.dataInicio)}
              value={form.dataFim}
              onChange={(e) => setForm({ ...form, dataFim: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2"
              style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties} />
            <p className="text-[11px] mt-1" style={{ color: 'var(--color-foreground-muted)' }}>
              Máx: {regra.maxDias} dias
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Raio (km)</label>
            <input type="number" required min={1} max={regra.raioMaxKm} value={form.raioAlcanceKm}
              onChange={(e) => setForm({ ...form, raioAlcanceKm: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2"
              style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties} />
            <p className="text-[11px] mt-1" style={{ color: 'var(--color-foreground-muted)' }}>
              Máx: {regra.raioMaxKm} km
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Custo (créditos/dia)</label>
            <input type="number" required min={regra.custoMin} value={form.custoCreditos}
              onChange={(e) => setForm({ ...form, custoCreditos: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2"
              style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties} />
            <p className="text-[11px] mt-1" style={{ color: 'var(--color-foreground-muted)' }}>
              Mín: {regra.custoMin} crédito(s)
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Descrição (opcional)</label>
          <textarea value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2"
            style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties} />
        </div>

        <button type="submit" disabled={salvando}
          className="w-full py-3 rounded-xl font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
          style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}>
          {salvando ? 'Criando...' : 'Criar anúncio'}
        </button>
      </form>
    </div>
  );
}
