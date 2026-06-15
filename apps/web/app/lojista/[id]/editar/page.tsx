'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function EditarLojaPage() {
  const params = useParams();
  const router = useRouter();
  const lojaId = params?.id as string;

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    nome: '', descricao: '', enderecoRua: '', enderecoNumero: '',
    enderecoBairro: '', enderecoCidade: '', enderecoEstado: '',
    enderecoCep: '', latitude: '', longitude: '',
    logoUrl: '', tabloideUrl: '',
  });

  useEffect(() => {
    if (!lojaId) return;
    api.lojas.detalhe(lojaId)
      .then((loja: any) => {
        const coords = (loja.localizacao || '').match(/POINT\(([\d.-]+)\s+([\d.-]+)\)/);
        setForm({
          nome: loja.nome || '',
          descricao: loja.descricao || '',
          enderecoRua: loja.enderecoRua || '',
          enderecoNumero: loja.enderecoNumero || '',
          enderecoBairro: loja.enderecoBairro || '',
          enderecoCidade: loja.enderecoCidade || '',
          enderecoEstado: loja.enderecoEstado || '',
          enderecoCep: loja.enderecoCep || '',
          latitude: coords ? coords[2] : '',
          longitude: coords ? coords[1] : '',
          logoUrl: loja.logoUrl || '',
          tabloideUrl: loja.tabloideUrl || '',
        });
      })
      .catch(() => router.push('/lojista'))
      .finally(() => setCarregando(false));
  }, [lojaId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.lojas.atualizar(lojaId, form);
      router.push('/lojista');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
             style={{ borderColor: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up max-w-lg">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Editar loja</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { key: 'nome', label: 'Nome da loja', required: true },
          { key: 'descricao', label: 'Descrição' },
          { key: 'enderecoRua', label: 'Rua', required: true },
          { key: 'enderecoNumero', label: 'Número', required: true },
          { key: 'enderecoBairro', label: 'Bairro', required: true },
          { key: 'enderecoCidade', label: 'Cidade', required: true },
          { key: 'enderecoEstado', label: 'Estado (UF)', required: true, maxLength: 2 },
          { key: 'enderecoCep', label: 'CEP', required: true, maxLength: 8 },
          { key: 'latitude', label: 'Latitude' },
          { key: 'longitude', label: 'Longitude' },
          { key: 'logoUrl', label: 'URL do logo' },
          { key: 'tabloideUrl', label: 'URL do tabloide (PDF)' },
        ].map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>
              {f.label}
            </label>
            <input type="text" required={f.required} maxLength={f.maxLength}
              value={(form as any)[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all focus:ring-2"
              style={{ background: 'var(--color-background)', color: 'var(--color-foreground)', border: '1.5px solid var(--color-border)' }} />
          </div>
        ))}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={salvando}
            className="flex-1 py-3 rounded-lg font-bold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}>
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
          <button type="button" onClick={() => router.push('/lojista')}
            className="px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-80"
            style={{ background: 'var(--color-muted)', color: 'var(--color-foreground)' }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
