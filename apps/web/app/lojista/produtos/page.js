'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LojistaProdutos;
const react_1 = require("react");
const link_1 = __importDefault(require("next/link"));
const api_1 = require("@/lib/api");
function LojistaProdutos() {
    const [produtos, setProdutos] = (0, react_1.useState)([]);
    const [busca, setBusca] = (0, react_1.useState)('');
    const [carregando, setCarregando] = (0, react_1.useState)(true);
    const carregar = (q) => {
        setCarregando(true);
        api_1.api.produtos.buscar(q)
            .then(setProdutos)
            .catch(() => setProdutos([]))
            .finally(() => setCarregando(false));
    };
    (0, react_1.useEffect)(() => { carregar(); }, []);
    return (<div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
        <link_1.default href="/lojista/produtos/adicionar" className="px-5 py-2.5 rounded-lg font-bold text-sm transition-all hover:opacity-90" style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}>
          + Adicionar
        </link_1.default>
      </div>

      <div className="mb-6">
        <input type="text" value={busca} onChange={(e) => { setBusca(e.target.value); carregar(e.target.value || undefined); }} placeholder="Buscar produtos..." className="w-full px-5 py-3 rounded-lg text-base outline-none transition-all focus:ring-2" style={{ background: 'var(--color-card)', color: 'var(--color-foreground)', border: '1.5px solid var(--color-border)' }}/>
      </div>

      {carregando && (<div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }}/>
        </div>)}

      {!carregando && produtos.length === 0 && (<div className="text-center py-12" style={{ color: 'var(--color-foreground-muted)' }}>
          <p className="text-lg mb-2">Nenhum produto encontrado</p>
          <link_1.default href="/lojista/produtos/adicionar" className="font-semibold" style={{ color: 'var(--color-primary)' }}>
            Adicionar primeiro produto
          </link_1.default>
        </div>)}

      <div className="grid gap-3">
        {produtos.map((p, i) => (<div key={p.id} className="flex items-center justify-between p-5 rounded-xl transition-all hover:shadow-sm animate-fade-in-up" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)', animationDelay: `${i * 0.04}s` }}>
            <div>
              <p className="font-bold">{p.nome}</p>
              <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
                {p.marca} · {p.categoria} · <span className="font-mono">{p.codigoBarras}</span>
              </p>
            </div>
            <p className="font-bold" style={{ color: 'var(--color-navy-600)' }}>
              R$ {(p.precoMedio / 100).toFixed(2)}
            </p>
          </div>))}
      </div>
    </div>);
}
