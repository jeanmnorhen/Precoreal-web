'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Turno {
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
}

interface Funcionario {
  id: string;
  usuarioId: string;
  nome: string;
  email: string;
  lojaId: string;
  turnos: Turno[];
}

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function LojistaFuncionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTurnosId, setEditTurnosId] = useState<string | null>(null);

  const lojaId = typeof window !== 'undefined' ? localStorage.getItem('lojaId') : null;

  const carregar = () => {
    if (!lojaId) return;
    setCarregando(true);
    api.lojista.funcionarios.listar(lojaId)
      .then(setFuncionarios)
      .catch(() => setFuncionarios([]))
      .finally(() => setCarregando(false));
  };

  useEffect(() => { carregar(); }, [lojaId]);

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Funcionários</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-foreground-muted)' }}>
            Gerencie os funcionários da sua loja
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-lg font-bold text-sm transition-all hover:opacity-90"
          style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}>
          + Adicionar
        </button>
      </div>

      {carregando && (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
               style={{ borderColor: 'var(--color-primary)' }} />
        </div>
      )}

      {!carregando && funcionarios.length === 0 && (
        <div className="text-center py-12" style={{ color: 'var(--color-foreground-muted)' }}>
          <p className="text-lg mb-2">Nenhum funcionário cadastrado</p>
          <p className="text-sm">Adicione funcionários para ajudarem a gerenciar a loja</p>
        </div>
      )}

      <div className="grid gap-4">
        {funcionarios.map((f, i) => (
          <div key={f.id}
            className="p-5 rounded-xl transition-all hover:shadow-sm animate-fade-in-up"
            style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)', animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                     style={{ background: 'var(--color-navy-50)', color: 'var(--color-navy-700)' }}>
                  {f.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">{f.nome}</p>
                  <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>{f.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditTurnosId(f.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                  style={{ background: 'var(--color-muted)', color: 'var(--color-foreground)' }}>
                  Turnos
                </button>
                <button onClick={async () => {
                  if (confirm(`Remover ${f.nome} da loja?`)) {
                    try {
                      await api.lojista.funcionarios.remover(f.id);
                      carregar();
                    } catch (err: any) { alert(err.message); }
                  }
                }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                  style={{ background: 'hsla(0,50%,50%,0.1)', color: 'var(--color-destructive)' }}>
                  Remover
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {f.turnos && f.turnos.length > 0 ? f.turnos.map((t, ti) => (
                <span key={ti}
                  className="text-[11px] px-2 py-1 rounded-lg font-medium"
                  style={{ background: 'var(--color-muted)', color: 'var(--color-foreground-muted)' }}>
                  {DIAS[t.diaSemana]} {t.horaInicio}-{t.horaFim}
                </span>
              )) : (
                <span className="text-xs" style={{ color: 'var(--color-foreground-muted)' }}>Sem turnos definidos</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <AddFuncionarioModal
          lojaId={lojaId!}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); carregar(); }}
        />
      )}

      {editTurnosId && (
        <EditTurnosModal
          funcionarioId={editTurnosId}
          turnosAtuais={funcionarios.find((f) => f.id === editTurnosId)?.turnos || []}
          onClose={() => setEditTurnosId(null)}
          onSuccess={() => { setEditTurnosId(null); carregar(); }}
        />
      )}
    </div>
  );
}

function AddFuncionarioModal({ lojaId, onClose, onSuccess }: { lojaId: string; onClose: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const toggleDia = (dia: number) => {
    const exists = turnos.find((t) => t.diaSemana === dia);
    if (exists) {
      setTurnos(turnos.filter((t) => t.diaSemana !== dia));
    } else {
      setTurnos([...turnos, { diaSemana: dia, horaInicio: '08:00', horaFim: '18:00' }]);
    }
  };

  const updateTurno = (dia: number, field: 'horaInicio' | 'horaFim', value: string) => {
    setTurnos(turnos.map((t) => t.diaSemana === dia ? { ...t, [field]: value } : t));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setErro('Informe o email do funcionário.'); return; }
    if (turnos.length === 0) { setErro('Defina pelo menos um turno.'); return; }
    setSalvando(true);
    setErro('');
    try {
      await api.lojista.funcionarios.adicionar({ email: email.trim(), lojaId, turnos });
      onSuccess();
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="w-full max-w-md rounded-xl p-6 max-h-[90vh] overflow-y-auto animate-scale-in"
           style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Adicionar funcionário</h2>
          <button onClick={onClose} className="text-lg leading-none hover:opacity-70" style={{ color: 'var(--color-foreground-muted)' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {erro && (
            <div className="p-3 rounded-lg text-sm font-medium" style={{ background: 'hsla(0,50%,50%,0.1)', color: 'var(--color-destructive)' }}>
              {erro}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">Email do usuário</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="funcionario@email.com"
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
              style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties} />
            <p className="text-[11px] mt-1" style={{ color: 'var(--color-foreground-muted)' }}>
              O usuário já precisa ter uma conta no Preço Real
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Turnos de trabalho</label>
            <div className="grid grid-cols-7 gap-1 mb-3">
              {DIAS.map((dia, idx) => (
                <button key={idx} type="button" onClick={() => toggleDia(idx)}
                  className="py-1.5 rounded text-[10px] font-semibold transition-all"
                  style={{
                    background: turnos.some((t) => t.diaSemana === idx) ? 'var(--color-primary)' : 'var(--color-muted)',
                    color: turnos.some((t) => t.diaSemana === idx) ? 'var(--color-primary-foreground)' : 'var(--color-foreground-muted)',
                  }}>
                  {dia}
                </button>
              ))}
            </div>
            {turnos.sort((a, b) => a.diaSemana - b.diaSemana).map((t) => (
              <div key={t.diaSemana} className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold w-8">{DIAS[t.diaSemana]}</span>
                <input type="time" value={t.horaInicio}
                  onChange={(e) => updateTurno(t.diaSemana, 'horaInicio', e.target.value)}
                  className="flex-1 px-2 py-1.5 rounded text-xs outline-none"
                  style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties} />
                <span className="text-xs" style={{ color: 'var(--color-foreground-muted)' }}>até</span>
                <input type="time" value={t.horaFim}
                  onChange={(e) => updateTurno(t.diaSemana, 'horaFim', e.target.value)}
                  className="flex-1 px-2 py-1.5 rounded text-xs outline-none"
                  style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties} />
              </div>
            ))}
          </div>

          <button type="submit" disabled={salvando}
            className="w-full py-3 rounded-lg font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}>
            {salvando ? 'Adicionando...' : 'Adicionar funcionário'}
          </button>
        </form>
      </div>
    </div>
  );
}

function EditTurnosModal({ funcionarioId, turnosAtuais, onClose, onSuccess }: {
  funcionarioId: string;
  turnosAtuais: Turno[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [turnos, setTurnos] = useState<Turno[]>(turnosAtuais);
  const [salvando, setSalvando] = useState(false);

  const toggleDia = (dia: number) => {
    const exists = turnos.find((t) => t.diaSemana === dia);
    if (exists) {
      setTurnos(turnos.filter((t) => t.diaSemana !== dia));
    } else {
      setTurnos([...turnos, { diaSemana: dia, horaInicio: '08:00', horaFim: '18:00' }]);
    }
  };

  const updateTurno = (dia: number, field: 'horaInicio' | 'horaFim', value: string) => {
    setTurnos(turnos.map((t) => t.diaSemana === dia ? { ...t, [field]: value } : t));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.lojista.funcionarios.atualizarTurnos(funcionarioId, { turnos });
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="w-full max-w-md rounded-xl p-6 animate-scale-in"
           style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Editar turnos</h2>
          <button onClick={onClose} className="text-lg leading-none hover:opacity-70" style={{ color: 'var(--color-foreground-muted)' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-7 gap-1 mb-3">
            {DIAS.map((dia, idx) => (
              <button key={idx} type="button" onClick={() => toggleDia(idx)}
                className="py-1.5 rounded text-[10px] font-semibold transition-all"
                style={{
                  background: turnos.some((t) => t.diaSemana === idx) ? 'var(--color-primary)' : 'var(--color-muted)',
                  color: turnos.some((t) => t.diaSemana === idx) ? 'var(--color-primary-foreground)' : 'var(--color-foreground-muted)',
                }}>
                {dia}
              </button>
            ))}
          </div>
          {turnos.sort((a, b) => a.diaSemana - b.diaSemana).map((t) => (
            <div key={t.diaSemana} className="flex items-center gap-2">
              <span className="text-xs font-semibold w-8">{DIAS[t.diaSemana]}</span>
              <input type="time" value={t.horaInicio}
                onChange={(e) => updateTurno(t.diaSemana, 'horaInicio', e.target.value)}
                className="flex-1 px-2 py-1.5 rounded text-xs outline-none"
                style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties} />
              <span className="text-xs" style={{ color: 'var(--color-foreground-muted)' }}>até</span>
              <input type="time" value={t.horaFim}
                onChange={(e) => updateTurno(t.diaSemana, 'horaFim', e.target.value)}
                className="flex-1 px-2 py-1.5 rounded text-xs outline-none"
                style={{ background: 'var(--color-input)', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' } as React.CSSProperties} />
            </div>
          ))}

          <button type="submit" disabled={salvando}
            className="w-full py-3 rounded-lg font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}>
            {salvando ? 'Salvando...' : 'Salvar turnos'}
          </button>
        </form>
      </div>
    </div>
  );
}
