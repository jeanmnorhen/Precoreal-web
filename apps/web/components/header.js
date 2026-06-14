'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = Header;
const link_1 = __importDefault(require("next/link"));
const auth_context_1 = require("@/lib/auth-context");
function Header() {
    const { user, logout } = (0, auth_context_1.useAuth)();
    return (<header className="sticky top-0 z-50" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <link_1.default href="/" className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight no-underline">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold gradient-navy">
            R$
          </span>
          <span style={{ color: 'var(--color-foreground)' }}>
            Preço<span style={{ color: 'var(--color-primary)' }}>Real</span>
          </span>
        </link_1.default>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide uppercase" style={{ color: 'var(--color-foreground-muted)', letterSpacing: '0.05em' }}>
          <link_1.default href="/busca" className="hover:text-foreground transition-colors">Buscar</link_1.default>
          <link_1.default href="/scanner" className="hover:text-foreground transition-colors">Scanner</link_1.default>
          <link_1.default href="/lojista" className="hover:text-foreground transition-colors">Lojista</link_1.default>
        </nav>

        <div className="flex items-center gap-2.5">
          {user ? (<>
              <span className="text-sm hidden sm:block font-medium" style={{ color: 'var(--color-foreground-muted)' }}>
                {user.nome}
              </span>
              <button onClick={logout} className="text-sm font-medium px-3.5 py-2 rounded-lg border transition-all hover:opacity-70" style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground-muted)' }}>
                Sair
              </button>
            </>) : (<>
              <link_1.default href="/login" className="text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:opacity-70" style={{ color: 'var(--color-foreground-muted)' }}>
                Entrar
              </link_1.default>
              <link_1.default href="/register" className="text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:opacity-90" style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}>
                Cadastrar
              </link_1.default>
            </>)}
        </div>
      </div>
    </header>);
}
