'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BuscaPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const link_1 = __importDefault(require("next/link"));
const api_1 = require("@/lib/api");
function BuscaContent() {
    const searchParams = (0, navigation_1.useSearchParams)();
    const router = (0, navigation_1.useRouter)();
    const [query, setQuery] = (0, react_1.useState)(searchParams.get('busca') || '');
    const [resultados, setResultados] = (0, react_1.useState)([]);
    const [carregando, setCarregando] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const q = searchParams.get('busca');
        if (q) {
            setCarregando(true);
            api_1.api.produtos.buscar(q)
                .then(setResultados)
                .catch(() => setResultados([]))
                .finally(() => setCarregando(false));
        }
    }, [searchParams]);
    const handleSearch = (e) => {
        e.preventDefault();
        router.push(`/busca?busca=${encodeURIComponent(query)}`);
    };
    return (<main className="min-h-screen px-6 py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <link_1.default href="/" className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-70" style={{ background: 'var(--color-muted)' }}>
          ←
        </link_1.default>
        <h1 className="text-2xl font-bold tracking-tight">Buscar produtos</h1>
      </div>

      <form onSubmit={handleSearch} className="mb-10 animate-fade-in-up">
        <div className="flex gap-3">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nome, marca, código de barras..." className="flex-1 px-5 py-3 rounded-xl text-base outline-none transition-all focus:ring-2" style={{ background: 'var(--color-card)', color: 'var(--color-foreground)', border: '1.5px solid var(--color-border)', '--tw-ring-color': 'var(--color-ring)' }}/>
          <button type="submit" className="px-6 py-3 rounded-xl font-bold transition-all hover:opacity-90 active:scale-[0.98]" style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}>
            Buscar
          </button>
        </div>
      </form>

      {carregando && (<div className="text-center py-12">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--color-primary)' }}/>
          <p className="mt-4" style={{ color: 'var(--color-foreground-muted)' }}>Buscando...</p>
        </div>)}

      {!carregando && resultados.length === 0 && searchParams.get('busca') && (<div className="text-center py-12">
          <p className="text-lg font-medium">Nenhum produto encontrado</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-foreground-muted)' }}>Tente outro termo de busca</p>
        </div>)}

      {!carregando && resultados.length > 0 && (<div className="grid gap-4">
          {resultados.map((p, i) => (<link_1.default key={p.id} href={`/produtos/${p.id}`} className="flex items-start gap-5 p-6 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 animate-fade-in-up" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card)', animationDelay: `${i * 0.06}s` }}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'var(--color-navy-50)' }}>
                📦
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{p.nome}</h3>
                <p className="text-sm mt-0.5" style={{ color: 'var(--color-foreground-muted)' }}>
                  {p.marca} · {p.categoria}
                </p>
                <p className="text-xs font-mono mt-1 opacity-50" style={{ color: 'var(--color-foreground-muted)' }}>
                  {p.codigoBarras}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold" style={{ color: 'var(--color-navy-600)' }}>
                  {p.precoMedio > 0 ? `R$ ${(p.precoMedio / 100).toFixed(2)}` : 'N/D'}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-foreground-muted)' }}>preço médio</p>
              </div>
            </link_1.default>))}
        </div>)}

      {!carregando && !searchParams.get('busca') && (<div className="text-center py-12">
          <p className="text-lg" style={{ color: 'var(--color-foreground-muted)' }}>Digite um termo para buscar produtos</p>
        </div>)}
    </main>);
}
function BuscaPage() {
    return (<react_1.Suspense fallback={<main className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }}/>
      </main>}>
      <BuscaContent />
    </react_1.Suspense>);
}
