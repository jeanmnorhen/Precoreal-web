"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
const google_1 = require("next/font/google");
const providers_1 = require("@/components/providers");
const service_worker_register_1 = require("@/components/service-worker-register");
require("./globals.css");
const outfit = (0, google_1.Outfit)({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800'],
    display: 'swap',
});
exports.metadata = {
    title: 'Preço Real — Compare preços perto de você',
    description: 'Encontre os melhores preços de produtos em lojas próximas a você. Escaneie códigos de barras, compare ofertas e economize toda semana.',
    keywords: 'preço real, comparador de preços, ofertas, promoções, supermercado, economia',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'Preço Real',
    },
    openGraph: {
        title: 'Preço Real — Compare preços perto de você',
        description: 'Encontre os melhores preços em lojas próximas. Escaneie, compare e economize.',
        type: 'website',
        locale: 'pt_BR',
    },
    robots: { index: true, follow: true },
};
function RootLayout({ children, }) {
    return (<html lang="pt-BR" className={`${outfit.className} h-full`}>
      <head>
        <meta name="theme-color" content="#16a34a"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg"/>
      </head>
      <body className="min-h-full flex flex-col antialiased" style={{ background: 'var(--color-background)', color: 'var(--color-foreground)' }}>
        <providers_1.Providers>
          {children}
          <service_worker_register_1.ServiceWorkerRegister />
        </providers_1.Providers>
      </body>
    </html>);
}
