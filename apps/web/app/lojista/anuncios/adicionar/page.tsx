'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function AdicionarAnuncio() {
  const router = useRouter();
  const [lojas, setLojas] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [form, setForm] = useState({
    produtoId: '', titulo: '', descricao: '', raioAlcanceKm: 5,
    custoCreditos: 10, dataInicio: '', dataFim: '',
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    Promise.all([api.lojas.listar(), api.produtos.buscar()])
      .then(([l, p]) => { setLojas(l); setProdutos(p); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.produtoId) { setErro('Selecione um produto.'); return; }
    setSalvando(true);
    setErro('');
    try {
      await api.anuncios.criar(form);
      router.push('/lojista/anuncios');
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-8">Criar Anúncio</h1>

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
          <input
            type="text"
            required
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2"
            style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Descrição</label>
          <textarea
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2"
            style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Raio (km)</label>
            <input
              type="number"
              required
              min={1}
              value={form.raioAlcanceKm}
              onChange={(e) => setForm({ ...form, raioAlcanceKm: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2"
              style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Custo (créditos/dia)</label>
            <input
              type="number"
              required
              min={1}
              value={form.custoCreditos}
              onChange={(e) => setForm({ ...form, custoCreditos: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2"
              style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Data Início</label>
            <input
              type="date"
              required
              value={form.dataInicio}
              onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2"
              style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Data Fim</label>
            <input
              type="date"
              required
              value={form.dataFim}
              onChange={(e) => setForm({ ...form, dataFim: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2"
              style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={salvando}
          className="w-full py-3 rounded-xl font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
          style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
        >
          {salvando ? 'Criando...' : 'Criar anúncio'}
        </button>
      </form>
    </div>
  );
}
