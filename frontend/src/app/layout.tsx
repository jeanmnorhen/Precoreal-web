import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Preço Real | Economize em Tempo Real",
  description: "Encontre os melhores preços, compare ofertas físicas e online, escaneie produtos em lojas e economize de verdade.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="container-movel">
          {children}
        </div>
      </body>
    </html>
  );
}
