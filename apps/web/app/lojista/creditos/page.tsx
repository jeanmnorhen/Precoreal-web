'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const VALORES = [
  { label: 'R$ 10,00', centavos: 1000, creditos: 1000 },
  { label: 'R$ 25,00', centavos: 2500, creditos: 2500 },
  { label: 'R$ 50,00', centavos: 5000, creditos: 5000 },
  { label: 'R$ 100,00', centavos: 10000, creditos: 10000 },
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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Carteira de Créditos</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-foreground-muted)' }}>
          Compre créditos para impulsionar seus anúncios
        </p>
      </div>

      <div className="p-6 rounded-2xl mb-8" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--color-foreground-muted)' }}>Saldo Atual</p>
        <p className="text-4xl font-bold mt-1" style={{ color: 'var(--color-primary)' }}>
          R$ {((user?.saldoCreditos || 0) / 100).toFixed(2)}
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--color-foreground-muted)' }}>
          {user?.saldoCreditos || 0} créditos disponíveis
        </p>
      </div>

      <h2 className="text-xl font-bold mb-4">Comprar créditos</h2>

      {!clientSecret ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {VALORES.map((v) => (
            <button
              key={v.centavos}
              onClick={() => comprar(v.centavos)}
              disabled={carregando}
              className="p-6 rounded-2xl text-center transition-all hover:scale-105 disabled:opacity-50"
              style={{ border: '2px solid var(--color-primary)', background: 'var(--color-card)' }}
            >
              <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{v.label}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-foreground-muted)' }}>{v.creditos} créditos</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-2xl text-center" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
          <p className="text-lg font-bold mb-4">Pagamento iniciado!</p>
          <p className="text-sm mb-4" style={{ color: 'var(--color-foreground-muted)' }}>
            ID da transação: {clientSecret.substring(0, 20)}...
          </p>
          <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
            Complete o pagamento na janela aberta do Stripe.
            Os créditos serão adicionados automaticamente após a confirmação.
          </p>
          <button
            onClick={() => setClientSecret(null)}
            className="mt-6 px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-70"
            style={{ border: '1px solid var(--color-border)' }}
          >
            Escolher outro valor
          </button>
        </div>
      )}
    </div>
  );
}
