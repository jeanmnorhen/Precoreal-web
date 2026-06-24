'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const VALORES = [
  { label: 'R$ 10', centavos: 1000, creditos: 10 },
  { label: 'R$ 25', centavos: 2500, creditos: 25 },
  { label: 'R$ 50', centavos: 5000, creditos: 50 },
  { label: 'R$ 100', centavos: 10000, creditos: 100 },
];

export default function LojistaCreditos() {
  const { user } = useAuth();
  const [carregando, setCarregando] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const comprar = async (valorCentavos: number) => {
    setCarregando(true);
    try {
      const res = await api.lojista.comprarCreditos(valorCentavos, '');
      setClientSecret(res.clientSecret);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Carteira de Créditos</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-foreground-muted)' }}>
          Compre créditos para impulsionar seus anúncios
        </p>
      </div>

      <div className="p-6 rounded-xl mb-8" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
        <p className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--color-foreground-muted)' }}>Saldo Atual</p>
        <p className="text-4xl font-bold mt-1" style={{ color: 'var(--color-primary)' }}>
          {(user?.saldoCreditos || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--color-foreground-muted)' }}>
          {user?.saldoCreditos || 0} créditos disponíveis
        </p>
      </div>

      <h2 className="text-lg font-bold mb-4">Comprar créditos</h2>

      {!clientSecret ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {VALORES.map((v) => (
            <button key={v.centavos} onClick={() => comprar(v.centavos)} disabled={carregando}
              className="p-6 rounded-xl text-center transition-all hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50"
              style={{ border: '1.5px solid var(--color-border)', background: 'var(--color-card)' }}>
               <p className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>{v.label}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-foreground-muted)' }}>{v.creditos} créditos</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-xl text-center animate-scale-in"
             style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
          <p className="text-lg font-bold mb-4">Pagamento iniciado!</p>
          <p className="text-sm mb-4" style={{ color: 'var(--color-foreground-muted)' }}>
            ID: {clientSecret.substring(0, 20)}...
          </p>
          <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
            Complete o pagamento na janela aberta do Stripe.
          </p>
          <button onClick={() => setClientSecret(null)}
            className="mt-6 px-6 py-2.5 rounded-lg font-medium transition-opacity hover:opacity-70"
            style={{ border: '1px solid var(--color-border)' }}>
            Escolher outro valor
          </button>
        </div>
      )}
    </div>
  );
}
