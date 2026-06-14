'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function AdicionarProduto() {
  const router = useRouter();
  const [form, setForm] = useState({
    codigoBarras: '', nome: '', descricao: '', categoria: '', marca: '', precoMedio: 0,
  });
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.produtos.criar(form);
      router.push('/lojista/produtos');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const fields = [
    { key: 'codigoBarras', label: 'Código de Barras', required: true },
    { key: 'nome', label: 'Nome do Produto', required: true },
    { key: 'descricao', label: 'Descrição' },
    { key: 'categoria', label: 'Categoria', required: true },
    { key: 'marca', label: 'Marca', required: true },
  ];

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-8">Adicionar Produto</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-medium mb-1.5">{f.label}</label>
            {f.key === 'descricao' ? (
              <textarea
                value={(form as any)[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2"
                style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties}
              />
            ) : (
              <input
                type="text"
                required={f.required}
                value={(form as any)[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2"
                style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties}
              />
            )}
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium mb-1.5">Preço Médio (em centavos)</label>
          <input
            type="number"
            value={form.precoMedio}
            onChange={(e) => setForm({ ...form, precoMedio: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2"
            style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties}
          />
        </div>

        <button
          type="submit"
          disabled={salvando}
          className="w-full py-3 rounded-xl font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
          style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
        >
          {salvando ? 'Salvando...' : 'Salvar produto'}
        </button>
      </form>
    </div>
  );
}
