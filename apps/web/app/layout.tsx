import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Preço Real — Compare preços perto de você',
  description:
    'Encontre os melhores preços de produtos em lojas próximas a você. Escaneie códigos de barras, compare ofertas e economize toda semana.',
  keywords: 'preço real, comparador de preços, ofertas, promoções, supermercado, economia',
  openGraph: {
    title: 'Preço Real — Compare preços perto de você',
    description: 'Encontre os melhores preços em lojas próximas. Escaneie, compare e economize.',
    type: 'website',
    locale: 'pt_BR',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${outfit.className} h-full`}>
      <body className="min-h-full flex flex-col antialiased"
            style={{ background: 'var(--color-background)', color: 'var(--color-foreground)' }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
