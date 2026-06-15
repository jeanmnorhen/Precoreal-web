'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

interface LojaVinculada {
  id: string;
  nome: string;
  enderecoCidade: string;
  enderecoEstado: string;
}

export default function FuncionarioSelecionarLoja() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [lojas, setLojas] = useState<LojaVinculada[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || (user.tipo !== 'funcionario' && user.tipo !== 'lojista'))) {
      router.push('/login');
      return;
    }
    if (!authLoading && user) {
      api.funcionario.lojas()
        .then((data) => {
          setLojas(data);
          if (data.length === 1) {
            localStorage.setItem('funcionarioLojaId', data[0].id);
            router.push('/funcionario');
          }
        })
        .catch(() => setLojas([]))
        .finally(() => setCarregando(false));
    }
  }, [user, authLoading, router]);

  const handleSelect = (lojaId: string) => {
    localStorage.setItem('funcionarioLojaId', lojaId);
    router.push('/funcionario');
  };

  if (authLoading || carregando) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <span className="inline-flex w-12 h-12 rounded-xl items-center justify-center text-white text-lg font-bold gradient-navy mb-4">R$</span>
        <h1 className="text-2xl font-bold tracking-tight">Loja de trabalho</h1>
        <p className="text-sm mt-1 mb-8" style={{ color: 'var(--color-foreground-muted)' }}>
          Selecione para qual loja deseja registrar atividades hoje
        </p>

        {lojas.length === 0 && (
          <p style={{ color: 'var(--color-foreground-muted)' }}>Nenhuma loja vinculada à sua conta.</p>
        )}

        <div className="space-y-3">
          {lojas.map((loja) => (
            <button key={loja.id} onClick={() => handleSelect(loja.id)}
              className="w-full p-5 rounded-xl text-left transition-all hover:shadow-md animate-fade-in-up"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
              <p className="font-bold">{loja.nome}</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-foreground-muted)' }}>
                {loja.enderecoCidade}, {loja.enderecoEstado}
              </p>
            </button>
          ))}
        </div>

        <Link href="/" className="block mt-8 text-sm" style={{ color: 'var(--color-foreground-muted)' }}>← Voltar ao início</Link>
      </div>
    </main>
  );
}
