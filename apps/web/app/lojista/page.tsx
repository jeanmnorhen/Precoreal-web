'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function LojistaDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [lojas, setLojas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [criandoLoja, setCriandoLoja] = useState(false);

  useEffect(() => {
    Promise.all([
      api.lojista.dashboard(),
      api.lojas.listar(),
    ])
      .then(([s, l]) => { setStats(s); setLojas(l); })
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Olá, {user?.nome}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-foreground-muted)' }}>Bem-vindo ao painel do lojista</p>
        </div>
        <div className="text-right">
          <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>Saldo</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            R$ {((user?.saldoCreditos || 0) / 100).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="p-6 rounded-2xl" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--color-foreground-muted)' }}>Lojas</p>
          <p className="text-3xl font-bold mt-1">{stats?.totalLojas || 0}</p>
        </div>
        <div className="p-6 rounded-2xl" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--color-foreground-muted)' }}>Anúncios Ativos</p>
          <p className="text-3xl font-bold mt-1" style={{ color: 'var(--color-primary)' }}>{stats?.totalAnunciosAtivos || 0}</p>
        </div>
        <div className="p-6 rounded-2xl" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--color-foreground-muted)' }}>Total Anúncios</p>
          <p className="text-3xl font-bold mt-1">{stats?.totalAnuncios || 0}</p>
        </div>
      </div>

      <div className="p-6 rounded-2xl mb-8" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Minhas Lojas</h2>
        </div>

        {lojas.length === 0 && (
          <div className="text-center py-8">
            <p className="mb-4" style={{ color: 'var(--color-foreground-muted)' }}>Você ainda não tem nenhuma loja cadastrada.</p>
            {!criandoLoja ? (
              <button
                onClick={() => setCriandoLoja(true)}
                className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
                style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
              >
                + Cadastrar loja
              </button>
            ) : (
              <LojaForm onSuccess={() => { setCriandoLoja(false); window.location.reload(); }} />
            )}
          </div>
        )}

        {lojas.length > 0 && (
          <div className="space-y-3">
            {lojas.map((loja: any) => (
              <div key={loja.id} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--color-muted)' }}>
                <div>
                  <p className="font-bold">{loja.nome}</p>
                  <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
                    {loja.enderecoCidade}, {loja.enderecoEstado}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/lojista/anuncios/adicionar"
          className="p-6 rounded-2xl text-center font-bold text-lg transition-all hover:scale-[1.02]"
          style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
        >
          + Criar anúncio
        </Link>
        <Link
          href="/lojista/produtos"
          className="p-6 rounded-2xl text-center font-bold text-lg transition-all hover:scale-[1.02]"
          style={{ border: '2px solid var(--color-primary)', color: 'var(--color-primary)' }}
        >
          📦 Gerenciar produtos
        </Link>
      </div>
    </div>
  );
}

function LojaForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    nome: '', descricao: '', enderecoRua: '', enderecoNumero: '',
    enderecoBairro: '', enderecoCidade: '', enderecoEstado: '',
    enderecoCep: '', latitude: '', longitude: '',
  });
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.lojas.criar(form);
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const fields = [
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
  ];

  return (
    <form onSubmit={handleSubmit} className="text-left space-y-4 max-w-md mx-auto mt-6">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="block text-sm font-medium mb-1">{f.label}</label>
          <input
            type="text"
            required={f.required}
            maxLength={f.maxLength}
            value={(form as any)[f.key]}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            className="w-full px-4 py-2 rounded-xl text-sm outline-none focus:ring-2"
            style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties}
          />
        </div>
      ))}
      <button
        type="submit"
        disabled={salvando}
        className="w-full py-3 rounded-xl font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
        style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
      >
        {salvando ? 'Salvando...' : 'Salvar loja'}
      </button>
    </form>
  );
}
