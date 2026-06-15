'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function SelecionarLoja() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [lojas, setLojas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [criandoLoja, setCriandoLoja] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    api.lojas.listar()
      .then((data) => {
        setLojas(data);
        if (data.length === 1) {
          localStorage.setItem('lojaId', data[0].id);
          router.push('/lojista');
        }
      })
      .catch(() => setLojas([]))
      .finally(() => setCarregando(false));
  }, [user, authLoading, router]);

  const selecionar = (lojaId: string) => {
    localStorage.setItem('lojaId', lojaId);
    router.push('/lojista');
  };

  if (authLoading || carregando) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
             style={{ borderColor: 'var(--color-primary)' }} />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="inline-flex w-12 h-12 rounded-xl items-center justify-center text-white text-lg font-bold gradient-navy mb-4">
            R$
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Selecione uma loja</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-foreground-muted)' }}>
            {lojas.length > 0
              ? `Você gerencia ${lojas.length} loja(s). Qual deseja administrar?`
              : 'Você ainda não tem lojas cadastradas.'}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {lojas.map((loja: any, i: number) => (
            <button
              key={loja.id}
              onClick={() => selecionar(loja.id)}
              className="w-full p-5 rounded-xl text-left transition-all hover:shadow-md animate-fade-in-up"
              style={{
                border: '1px solid var(--color-border)',
                background: 'var(--color-card)',
                animationDelay: `${i * 0.06}s`,
              }}
            >
              <p className="font-bold text-base">{loja.nome}</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-foreground-muted)' }}>
                {loja.enderecoCidade}, {loja.enderecoEstado}
              </p>
            </button>
          ))}
        </div>

        {!criandoLoja ? (
          <button
            onClick={() => setCriandoLoja(true)}
            className="w-full py-3 rounded-xl font-bold transition-all hover:opacity-90"
            style={{ border: '1.5px dashed var(--color-border)', color: 'var(--color-primary)' }}
          >
            + Adicionar nova loja
          </button>
        ) : (
          <LojaForm onSuccess={() => { setCriandoLoja(false); window.location.reload(); }} />
        )}

        <Link href="/" className="block text-center mt-6 text-sm transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-foreground-muted)' }}>
          ← Voltar ao início
        </Link>
      </div>
    </main>
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
    <form onSubmit={handleSubmit} className="text-left space-y-4 mt-6">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>{f.label}</label>
          <input type="text" required={f.required} maxLength={f.maxLength}
            value={(form as any)[f.key]}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all focus:ring-2"
            style={{ background: 'var(--color-background)', color: 'var(--color-foreground)', border: '1.5px solid var(--color-border)' } as React.CSSProperties} />
        </div>
      ))}
      <button type="submit" disabled={salvando}
        className="w-full py-3 rounded-lg font-bold transition-all hover:opacity-90 disabled:opacity-50"
        style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}>
        {salvando ? 'Salvando...' : 'Salvar loja'}
      </button>
    </form>
  );
}
