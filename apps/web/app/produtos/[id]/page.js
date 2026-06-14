'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProdutoPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const dynamic_1 = __importDefault(require("next/dynamic"));
const link_1 = __importDefault(require("next/link"));
const api_1 = require("@/lib/api");
const MapaOfertas = (0, dynamic_1.default)(() => import('@/components/mapa-ofertas').then((m) => m.MapaOfertas), {
    ssr: false,
    loading: () => (<div className="rounded-xl flex items-center justify-center" style={{ height: '320px', border: '1px solid var(--color-border)', background: 'var(--color-muted)' }}>
      <span className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>Carregando mapa…</span>
    </div>),
});
function ProdutoPage() {
    const { id } = (0, navigation_1.useParams)();
    const [produto, setProduto] = (0, react_1.useState)(null);
    const [ofertas, setOfertas] = (0, react_1.useState)([]);
    const [carregando, setCarregando] = (0, react_1.useState)(true);
    const [geoError, setGeoError] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (!id)
            return;
        api_1.api.produtos.detalhe(id)
            .then(async (p) => {
            setProduto(p);
            try {
                const pos = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }));
                const ofertas = await api_1.api.anuncios.proximos(pos.coords.latitude, pos.coords.longitude);
                setOfertas(ofertas.filter((a) => a.codigoBarras === p.codigoBarras));
            }
            catch {
                setGeoError(true);
            }
        })
            .catch(() => { })
            .finally(() => setCarregando(false));
    }, [id]);
    if (carregando) {
        return (<main className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }}/>
      </main>);
    }
    if (!produto) {
        return (<main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-xl font-bold">Produto não encontrado</p>
          <link_1.default href="/busca" className="mt-4 inline-block font-semibold" style={{ color: 'var(--color-primary)' }}>
            Buscar produtos
          </link_1.default>
        </div>
      </main>);
    }
    return (<main className="min-h-screen px-6 py-8 max-w-4xl mx-auto animate-fade-in-up">
      <div className="flex items-center gap-4 mb-8">
        <link_1.default href="/busca" className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-70" style={{ background: 'var(--color-muted)' }}>
          ←
        </link_1.default>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{produto.nome}</h1>
          <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
            {produto.marca} · {produto.categoria}
          </p>
        </div>
      </div>

      <div className="p-6 rounded-xl mb-8" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-foreground-muted)' }}>Código de Barras</dt>
            <dd className="font-mono font-bold mt-1">{produto.codigoBarras}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-foreground-muted)' }}>Preço Médio</dt>
            <dd className="font-bold text-2xl mt-1" style={{ color: 'var(--color-navy-600)' }}>
              {produto.precoMedio > 0 ? `R$ ${(produto.precoMedio / 100).toFixed(2)}` : 'N/D'}
            </dd>
          </div>
          {produto.descricao && (<div className="col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-foreground-muted)' }}>Descrição</dt>
              <dd className="mt-1 leading-relaxed" style={{ color: 'var(--color-foreground-muted)' }}>{produto.descricao}</dd>
            </div>)}
        </dl>
      </div>

      <h2 className="text-lg font-bold mb-4">Ofertas próximas</h2>

      {geoError && (<div className="p-4 rounded-xl text-sm mb-4" style={{ background: 'hsla(0,50%,50%,0.08)', color: 'var(--color-destructive)' }}>
          Não foi possível obter sua localização. Ative a geolocalização para ver ofertas próximas.
        </div>)}

      {ofertas.length === 0 && !geoError && (<div className="text-center py-8" style={{ color: 'var(--color-foreground-muted)' }}>
          <p className="text-lg mb-2">Nenhuma oferta encontrada perto de você</p>
          <link_1.default href="/scanner" className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
            Escanear outro produto
          </link_1.default>
        </div>)}

      {ofertas.length > 0 && (<MapaOfertas ofertas={ofertas} className="mb-6"/>)}

      <div className="grid gap-4">
        {ofertas.map((o, i) => (<div key={o.id} className="flex items-center justify-between p-5 rounded-xl transition-all hover:shadow-sm animate-fade-in-up" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)', animationDelay: `${i * 0.06}s` }}>
            <div>
              <p className="font-bold">{o.titulo}</p>
              <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
                {o.lojaNome} · {o.distancia < 1 ? `${(o.distancia * 1000).toFixed(0)}m` : `${o.distancia.toFixed(1)}km`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold" style={{ color: 'var(--color-navy-600)' }}>
                R$ {(o.precoMedio / 100).toFixed(2)}
              </p>
            </div>
          </div>))}
      </div>
    </main>);
}
