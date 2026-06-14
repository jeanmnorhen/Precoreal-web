'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoginPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const link_1 = __importDefault(require("next/link"));
const auth_context_1 = require("@/lib/auth-context");
function LoginPage() {
    const [email, setEmail] = (0, react_1.useState)('');
    const [senha, setSenha] = (0, react_1.useState)('');
    const [erro, setErro] = (0, react_1.useState)('');
    const [carregando, setCarregando] = (0, react_1.useState)(false);
    const { login } = (0, auth_context_1.useAuth)();
    const router = (0, navigation_1.useRouter)();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');
        setCarregando(true);
        try {
            await login(email, senha);
            router.push('/');
        }
        catch (err) {
            setErro(err.message || 'Erro ao fazer login.');
        }
        finally {
            setCarregando(false);
        }
    };
    return (<main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="text-center mb-10">
          <link_1.default href="/" className="inline-flex items-center gap-2.5 text-2xl font-extrabold tracking-tight no-underline">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold gradient-navy">
              R$
            </span>
            <span style={{ color: 'var(--color-foreground)' }}>
              Preço<span style={{ color: 'var(--color-primary)' }}>Real</span>
            </span>
          </link_1.default>
          <h1 className="text-2xl font-bold mt-8 mb-1">Entrar</h1>
          <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
            Acesse sua conta para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {erro && (<div className="p-4 rounded-xl text-sm font-medium" style={{ background: 'hsl(0,50%,95%)', color: 'var(--color-destructive)' }}>
              {erro}
            </div>)}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-foreground)' }}>Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2" style={{ background: 'var(--color-card)', color: 'var(--color-foreground)', border: '1.5px solid var(--color-border)', '--tw-ring-color': 'var(--color-ring)' }} placeholder="seu@email.com"/>
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-foreground)' }}>Senha</label>
            <input id="senha" type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2" style={{ background: 'var(--color-card)', color: 'var(--color-foreground)', border: '1.5px solid var(--color-border)', '--tw-ring-color': 'var(--color-ring)' }} placeholder="••••••"/>
          </div>

          <button type="submit" disabled={carregando} className="w-full py-3 rounded-xl font-bold text-base transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50" style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm mt-8" style={{ color: 'var(--color-foreground-muted)' }}>
          Não tem conta?{' '}
          <link_1.default href="/register" className="font-semibold" style={{ color: 'var(--color-primary)' }}>
            Cadastre-se
          </link_1.default>
        </p>
      </div>
    </main>);
}
