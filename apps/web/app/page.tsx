import Link from 'next/link';

const features = [
  {
    icon: '📍',
    title: 'Ofertas perto de você',
    desc: 'Veja anúncios de lojas no seu raio e compare preços em tempo real.',
  },
  {
    icon: '📷',
    title: 'Escaneie qualquer produto',
    desc: 'Use a câmera do celular para ler EAN-13 e QR Codes GS1 instantaneamente.',
  },
  {
    icon: '🛒',
    title: 'Lista de compras inteligente',
    desc: 'Monte sua lista e saiba qual loja tem o menor preço total no bairro.',
  },
  {
    icon: '🏆',
    title: 'Diamantes e recompensas',
    desc: 'Ganhe diamantes por contribuições e troque por descontos exclusivos.',
  },
];

const steps = [
  { number: '01', title: 'Abra o scanner', desc: 'Aponte a câmera para qualquer produto.' },
  { number: '02', title: 'Veja os preços', desc: 'Comparação instantânea entre lojas próximas.' },
  { number: '03', title: 'Economize', desc: 'Escolha a melhor oferta e vá direto à loja.' },
];

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen">

      {/* ── Header ── */}
      <header style={{ borderBottom: '1px solid var(--color-border)' }}
              className="sticky top-0 z-50 backdrop-blur-md"
              >
        <div style={{ background: 'rgba(255,255,255,0.82)' }} className="absolute inset-0" />
        <div className="relative max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-2xl font-bold tracking-tight"
                style={{ color: 'var(--color-primary)' }}>
            Preço<span style={{ color: 'var(--color-foreground)' }}>Real</span>
          </span>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium"
               style={{ color: 'var(--color-foreground-muted)' }}>
            <Link href="#como-funciona" className="hover:opacity-70 transition-opacity">Como funciona</Link>
            <Link href="#recursos" className="hover:opacity-70 transition-opacity">Recursos</Link>
            <Link href="/lojista" className="hover:opacity-70 transition-opacity">Sou lojista</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/scanner"
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}>
              📷 Escanear agora
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative flex-1 flex items-center justify-center overflow-hidden py-24 px-6">
        {/* Fundo com gradiente radial sutil */}
        <div className="absolute inset-0 -z-10"
             style={{
               background: 'radial-gradient(ellipse 80% 60% at 50% -10%, hsla(142,76%,42%,0.12) 0%, transparent 70%)',
             }} />
        {/* Blob decorativo */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl -z-10"
             style={{ background: 'var(--color-brand-300)' }} />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-15 blur-3xl -z-10"
             style={{ background: 'var(--color-brand-400)' }} />

        <div className="text-center max-w-3xl animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8"
               style={{ background: 'var(--color-brand-50)', color: 'var(--color-primary)', border: '1px solid var(--color-brand-200)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-primary)' }} />
            Novidade: Scanner GS1 DataMatrix
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            Pague o{' '}
            <span className="relative inline-block">
              <span style={{
                background: 'linear-gradient(135deg, var(--color-brand-500) 0%, var(--color-brand-700) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                preço real
              </span>
            </span>
            {' '}em cada compra
          </h1>

          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto"
             style={{ color: 'var(--color-foreground-muted)' }}>
            Compare preços de produtos em lojas perto de você. Escaneie o código de barras e encontre a melhor oferta em segundos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/scanner"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                  style={{
                    background: 'var(--color-primary)',
                    color: 'var(--color-primary-foreground)',
                    boxShadow: '0 8px 32px hsla(142,76%,36%,0.35)',
                  }}>
              📷 Escanear produto
            </Link>
            <Link href="/lojista"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-200 hover:scale-105"
                  style={{
                    border: '2px solid var(--color-border)',
                    color: 'var(--color-foreground)',
                    background: 'var(--color-card)',
                  }}>
              🏪 Sou lojista
            </Link>
          </div>

          {/* Prova social */}
          <p className="mt-10 text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
            Gratuito para consumidores · Sem cadastro para escanear
          </p>
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section id="como-funciona" className="py-24 px-6"
               style={{ background: 'var(--color-background-subtle)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Como funciona</h2>
            <p className="text-lg" style={{ color: 'var(--color-foreground-muted)' }}>
              Três passos para nunca mais pagar caro
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="glass-card p-8 text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-5xl font-extrabold mb-4 opacity-15"
                     style={{ color: 'var(--color-primary)' }}>
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p style={{ color: 'var(--color-foreground-muted)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recursos ── */}
      <section id="recursos" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Recursos poderosos</h2>
            <p className="text-lg" style={{ color: 'var(--color-foreground-muted)' }}>
              Tudo que você precisa para economizar de verdade
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title}
                   className="group flex items-start gap-5 p-7 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                   style={{
                     border: '1px solid var(--color-border)',
                     background: 'var(--color-card)',
                   }}>
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                     style={{ background: 'var(--color-brand-50)' }}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-foreground-muted)' }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="gradient-brand rounded-3xl p-12 shadow-2xl"
               style={{ boxShadow: '0 24px 80px hsla(142,76%,36%,0.3)' }}>
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Comece a economizar agora
            </h2>
            <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Escaneie qualquer produto e veja os preços em lojas perto de você. Grátis, sem cadastro.
            </p>
            <Link href="/scanner"
                  className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-lg font-bold bg-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                  style={{ color: 'var(--color-primary)' }}>
              📷 Escanear agora
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-6 text-center text-sm"
              style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-foreground-muted)' }}>
        <p>© {new Date().getFullYear()} Preço Real. Feito com 💚 para o consumidor brasileiro.</p>
      </footer>

    </main>
  );
}
