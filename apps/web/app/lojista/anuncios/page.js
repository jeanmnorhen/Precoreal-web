'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LojistaAnuncios;
const react_1 = require("react");
const link_1 = __importDefault(require("next/link"));
const api_1 = require("@/lib/api");
function LojistaAnuncios() {
    const [anuncios, setAnuncios] = (0, react_1.useState)([]);
    const [carregando, setCarregando] = (0, react_1.useState)(true);
    const carregar = () => {
        setCarregando(true);
        api_1.api.anuncios.listar()
            .then(setAnuncios)
            .catch(() => setAnuncios([]))
            .finally(() => setCarregando(false));
    };
    (0, react_1.useEffect)(() => { carregar(); }, []);
    const toggleStatus = async (id, statusAtual) => {
        const novoStatus = statusAtual === 'ativo' ? 'pausado' : 'ativo';
        try {
            await api_1.api.anuncios.atualizar(id, { status: novoStatus });
            carregar();
        }
        catch (err) {
            alert(err.message);
        }
    };
    return (<div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Anúncios</h1>
        <link_1.default href="/lojista/anuncios/adicionar" className="px-5 py-2.5 rounded-lg font-bold text-sm transition-all hover:opacity-90" style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}>
          + Novo anúncio
        </link_1.default>
      </div>

      {carregando && (<div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }}/>
        </div>)}

      {!carregando && anuncios.length === 0 && (<div className="text-center py-12" style={{ color: 'var(--color-foreground-muted)' }}>
          <p className="text-lg mb-2">Nenhum anúncio criado</p>
          <link_1.default href="/lojista/anuncios/adicionar" className="font-semibold" style={{ color: 'var(--color-primary)' }}>
            Criar primeiro anúncio
          </link_1.default>
        </div>)}

      <div className="grid gap-4">
        {anuncios.map((a, i) => {
            const ativo = a.status === 'ativo';
            return (<div key={a.id} className="p-5 rounded-xl transition-all hover:shadow-sm animate-fade-in-up" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)', animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-base">{a.titulo}</p>
                  <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
                    Raio: {a.raioAlcanceKm}km · {a.custoCreditos} créditos/dia
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{
                    background: ativo ? 'hsla(140,30%,42%,0.1)' : 'hsla(0,50%,50%,0.1)',
                    color: ativo ? 'var(--color-verde-600)' : 'var(--color-destructive)',
                }}>
                  {ativo ? 'Ativo' : 'Pausado'}
                </span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => toggleStatus(a.id, a.status)} className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-80" style={{
                    background: ativo ? 'hsla(0,50%,50%,0.08)' : 'hsla(140,30%,42%,0.08)',
                    color: ativo ? 'var(--color-destructive)' : 'var(--color-verde-600)',
                }}>
                  {ativo ? 'Pausar' : 'Ativar'}
                </button>
              </div>
            </div>);
        })}
      </div>
    </div>);
}
