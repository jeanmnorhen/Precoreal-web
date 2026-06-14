"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HomePage;
const header_1 = require("@/components/header");
const ofertas_feed_1 = require("@/components/ofertas-feed");
const link_1 = __importDefault(require("next/link"));
function HomePage() {
    return (<main className="flex flex-col min-h-screen">
      <header_1.Header />

      {/* ═══ Hero Compacto ═══ */}
      <section className="relative overflow-hidden pt-16 pb-8 px-6">
        <div className="absolute inset-0 -z-10" style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% -8%, var(--color-navy-100) 0%, transparent 65%)',
        }}/>

        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4" style={{ background: 'var(--color-navy-50)', color: 'var(--color-navy-600)', border: '1px solid var(--color-navy-100)' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-navy-500)' }}/>
                Grátis para consumidores
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                O preço justo
                <br />
                <span className="gradient-navy bg-clip-text text-transparent">
                  ao seu lado
                </span>
              </h1>
              <p className="text-sm sm:text-base mt-3 max-w-md leading-relaxed" style={{ color: 'var(--color-foreground-muted)' }}>
                Compare preços em lojas perto de você. Escaneie, encontre a melhor oferta e economize.
              </p>
            </div>

            <div className="flex gap-3 flex-shrink-0">
              <link_1.default href="/scanner" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md" style={{
            background: 'var(--color-navy-700)',
            color: '#fff',
        }}>
                <span>📷</span>
                Escanear
              </link_1.default>
              <link_1.default href="/busca" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" style={{
            border: '1.5px solid var(--color-border)',
            background: 'var(--color-card)',
            color: 'var(--color-foreground)',
        }}>
                🔍 Buscar
              </link_1.default>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Feed de Ofertas (destaque principal) ═══ */}
      <ofertas_feed_1.OfertasFeed />

      {/* ═══ Recursos (compacto) ═══ */}
      <section className="py-16 px-6" style={{ background: 'var(--color-background-subtle)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
            { icon: '📍', title: 'Ofertas geolocalizadas', desc: 'Anúncios de lojas próximas, ordenados por distância.' },
            { icon: '📷', title: 'Scanner de código de barras', desc: 'Capture qualquer EAN-13 e veja preços na região.' },
            { icon: '🏪', title: 'Portal do lojista', desc: 'Anuncie ofertas e atraia clientes locais.' },
        ].map((item, i) => (<div key={item.title} className="p-5 rounded-xl transition-all duration-200 hover:shadow-sm animate-fade-in-up" style={{
                border: '1px solid var(--color-border)',
                background: 'var(--color-card)',
                animationDelay: `${i * 0.08}s`,
            }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3" style={{ background: 'var(--color-navy-50)' }}>
                  {item.icon}
                </div>
                <h3 className="text-sm font-bold mb-1">{item.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-foreground-muted)' }}>
                  {item.desc}
                </p>
              </div>))}
          </div>
        </div>
      </section>

      {/* ═══ CTA Final ═══ */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="gradient-navy rounded-2xl p-10 sm:p-14 shadow-xl animate-scale-in">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
              Economize hoje
            </h2>
            <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: 'hsla(0,0%,100%,0.7)' }}>
              Grátis, sem cadastro. Escaneie um produto e veja onde está mais barato.
            </p>
            <link_1.default href="/scanner" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" style={{
            background: '#fff',
            color: 'var(--color-navy-700)',
            boxShadow: '0 4px 16px hsla(0,0%,0%,0.1)',
        }}>
              📷 Escanear agora
            </link_1.default>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="py-10 px-6 text-center text-xs" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-foreground-muted)' }}>
        <p className="mb-1">© {new Date().getFullYear()} Preço Real · Comparador de preços inteligente</p>
      </footer>
    </main>);
}
