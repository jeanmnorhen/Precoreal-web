import { Header } from '@/components/header';
import { OfertasFeed } from '@/components/ofertas-feed';
import Link from 'next/link';

const features = [
  {
    icon: '📍',
    title: 'Ofertas perto de você',
    desc: 'Anúncios geolocalizados de lojas no seu bairro. Compare preços sem sair de casa.',
  },
  {
    icon: '📷',
    title: 'Scanner inteligente',
    desc: 'Aponte a câmera para qualquer código de barras e veja o preço em todas as lojas próximas.',
  },
  {
    icon: '📊',
    title: 'Histórico de preços',
    desc: 'Acompanhe a variação de preços ao longo do tempo e compre no momento certo.',
  },
  {
    icon: '🏪',
    title: 'Portal do lojista',
    desc: 'Anuncie suas ofertas, gerencie créditos e atraia clientes da sua região.',
  },
];

const steps = [
  { number: '01', title: 'Escaneie', desc: 'Capture o código de barras com a câmera do celular.' },
  { number: '02', title: 'Compare', desc: 'Veja todas as ofertas disponíveis perto de você.' },
  { number: '03', title: 'Economize', desc: 'Escolha o melhor preço e vá direto à loja.' },
];

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen">
      <Header />

      {/* ═══ Hero ═══ */}
      <section className="relative flex-1 flex items-center justify-center overflow-hidden py-28 px-6">
        <div className="absolute inset-0 -z-10"
             style={{
               background: 'radial-gradient(ellipse 70% 50% at 50% -8%, var(--color-navy-100) 0%, transparent 65%)',
             }} />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -z-10 w-[600px] h-[600px] rounded-full opacity-[0.04]"
             style={{ background: 'var(--color-navy-600)' }} />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-10 blur-3xl -z-10"
             style={{ background: 'var(--color-terracota-300)' }} />

        <div className="text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-10 animate-fade-in"
               style={{ background: 'var(--color-navy-50)', color: 'var(--color-navy-600)', border: '1px solid var(--color-navy-100)', letterSpacing: '0.08em' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-navy-500)' }} />
            Grátis para consumidores
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-[-0.03em] mb-8 animate-fade-in-up">
            O preço justo
            <br />
            <span className="relative">
              <span className="relative z-10 gradient-navy bg-clip-text text-transparent">
                ao seu lado
              </span>
              <span className="absolute -bottom-2 left-0 right-0 h-3 rounded-full opacity-20 -z-0"
                    style={{ background: 'var(--color-navy-400)' }} />
            </span>
          </h1>

          <p className="text-lg md:text-xl mb-12 max-w-xl mx-auto leading-relaxed animate-fade-in-up stagger-1"
             style={{ color: 'var(--color-foreground-muted)' }}>
            Compare preços de produtos em lojas perto de você. Escaneie, encontre a melhor oferta e economize toda semana.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-2">
            <Link href="/scanner"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'var(--color-navy-700)',
                    color: '#fff',
                    boxShadow: '0 4px 24px hsla(222,48%,22%,0.25)',
                  }}>
              <span className="text-lg">📷</span>
              Escanear produto
            </Link>
            <Link href="/busca"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    border: '1.5px solid var(--color-border)',
                    color: 'var(--color-foreground)',
                    background: 'var(--color-card)',
                  }}>
              🔍 Buscar ofertas
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Como funciona ═══ */}
      <section className="py-24 px-6" style={{ background: 'var(--color-background-subtle)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">Como funciona</h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--color-foreground-muted)' }}>
              Três passos simples para nunca mais pagar caro
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={step.number}
                   className="glass-card p-8 text-center group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-fade-in-up"
                   style={{ animationDelay: `${0.15 + i * 0.1}s` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-extrabold mx-auto mb-6"
                     style={{ background: 'var(--color-navy-50)', color: 'var(--color-navy-600)' }}>
                  {step.number}
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-foreground-muted)' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Recursos ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">Recursos</h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--color-foreground-muted)' }}>
              Tudo que você precisa para economizar
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <div key={f.title}
                   className="group flex items-start gap-5 p-6 rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 animate-fade-in-up"
                   style={{
                     border: '1px solid var(--color-border)',
                     background: 'var(--color-card)',
                     animationDelay: `${0.15 + i * 0.08}s`,
                   }}>
                <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-lg"
                     style={{ background: 'var(--color-navy-50)' }}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold mb-1">{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-foreground-muted)' }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Feed de Ofertas ═══ */}
      <OfertasFeed />

      {/* ═══ CTA Final ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="gradient-navy rounded-2xl p-12 sm:p-16 shadow-xl animate-scale-in">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
              Comece agora
            </h2>
            <p className="text-base mb-8 max-w-md mx-auto" style={{ color: 'hsla(0,0%,100%,0.7)' }}>
              Escaneie qualquer produto, compare preços e economize. Grátis, sem compromisso.
            </p>
            <Link href="/scanner"
                  className="inline-flex items-center gap-3 px-8 py-3.5 rounded-xl text-base font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: '#fff',
                    color: 'var(--color-navy-700)',
                    boxShadow: '0 4px 16px hsla(0,0%,0%,0.1)',
                  }}>
              📷 Escanear agora
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="py-12 px-6 text-center text-sm"
              style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-foreground-muted)' }}>
        <p className="mb-1">© {new Date().getFullYear()} Preço Real</p>
        <p>Comparador de preços inteligente para o consumidor brasileiro</p>
      </footer>
    </main>
  );
}
