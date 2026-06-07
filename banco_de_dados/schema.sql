-- Esquema do Banco de Dados - Preço Real
-- Regra de Ouro: Tudo em Português do Brasil

-- Habilitar a extensão para geolocalização se necessário
-- (Podemos usar campos latitude/longitude para simplicidade e precisão matemática)

-- Tabela de Endereços (Value Object compartilhado)
CREATE TABLE public.enderecos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rua TEXT NOT NULL,
    numero TEXT NOT NULL,
    complemento TEXT,
    bairro TEXT NOT NULL,
    cidade TEXT NOT NULL,
    estado VARCHAR(2) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Usuários (sincronizada com auth.users do Supabase)
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY, -- Referencia auth.users(id)
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    tipo TEXT NOT NULL CHECK (tipo IN ('consumidor', 'lojista')),
    saldo_creditos NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (saldo_creditos >= 0),
    quantidade_diamantes INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_diamantes >= 0),
    endereco_id UUID REFERENCES public.enderecos(id) ON DELETE SET NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Produtos
CREATE TABLE public.produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    categoria TEXT NOT NULL,
    marca TEXT,
    preco NUMERIC(10, 2) NOT NULL CHECK (preco >= 0),
    estoque INTEGER NOT NULL DEFAULT 0 CHECK (estoque >= 0),
    imagens TEXT[] DEFAULT '{}',
    avaliacoes JSONB DEFAULT '[]'::jsonb,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Lojas
CREATE TABLE public.lojas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    endereco_id UUID REFERENCES public.enderecos(id) ON DELETE SET NULL,
    usuario_proprietario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    tabloide_ofertas JSONB DEFAULT '[]'::jsonb, -- lista de imagens ou ofertas
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Anúncios
CREATE TABLE public.anuncios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE NOT NULL,
    produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    raio_alcance NUMERIC(5, 2) NOT NULL CHECK (raio_alcance > 0), -- em km
    custo_creditos NUMERIC(10, 2) NOT NULL CHECK (custo_creditos >= 0),
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ativo', 'pausado', 'expirado')),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT chk_datas CHECK (data_fim > data_inicio)
);

-- Tabela de Métricas/Histórico de Anúncios (Impressões, Cliques, Conversões)
CREATE TABLE public.metricas_anuncios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anuncio_id UUID REFERENCES public.anuncios(id) ON DELETE CASCADE NOT NULL,
    tipo_evento TEXT NOT NULL CHECK (tipo_evento IN ('impressao', 'clique', 'conversao')),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Compras
CREATE TABLE public.compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_comprador_id UUID REFERENCES public.usuarios(id) ON DELETE RESTRICT NOT NULL,
    loja_vendedora_id UUID REFERENCES public.lojas(id) ON DELETE RESTRICT NOT NULL,
    preco_total NUMERIC(10, 2) NOT NULL CHECK (preco_total >= 0),
    status_pedido TEXT NOT NULL CHECK (status_pedido IN ('aguardando_pagamento', 'pago', 'enviado', 'entregue', 'cancelado')),
    forma_pagamento_tipo TEXT NOT NULL CHECK (forma_pagamento_tipo IN ('cartao_credito', 'boleto_bancario', 'pix')),
    forma_pagamento_detalhes JSONB,
    status_entrega TEXT NOT NULL CHECK (status_entrega IN ('pendente', 'enviado', 'entregue')),
    data_entrega TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Itens de Compra
CREATE TABLE public.itens_compra (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compra_id UUID REFERENCES public.compras(id) ON DELETE CASCADE NOT NULL,
    produto_id UUID REFERENCES public.produtos(id) ON DELETE RESTRICT NOT NULL,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    preco_unitario NUMERIC(10, 2) NOT NULL CHECK (preco_unitario >= 0)
);

-- Tabela de Pagamentos
CREATE TABLE public.pagamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compra_id UUID REFERENCES public.compras(id) ON DELETE RESTRICT NOT NULL,
    valor NUMERIC(10, 2) NOT NULL CHECK (valor >= 0),
    moeda VARCHAR(3) NOT NULL DEFAULT 'BRL',
    gateway TEXT NOT NULL,
    status_transacao TEXT NOT NULL CHECK (status_transacao IN ('aprovada', 'recusada', 'pendente')),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Notificações
CREATE TABLE public.notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_destinatario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('promocao', 'pedido', 'mensagem')),
    mensagem TEXT NOT NULL,
    status_leitura TEXT NOT NULL DEFAULT 'nao_lida' CHECK (status_leitura IN ('lida', 'nao_lida')),
    data_envio TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Listas de Compras
CREATE TABLE public.listas_compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    nome TEXT NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Itens da Lista de Compras
CREATE TABLE public.itens_lista_compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lista_id UUID REFERENCES public.listas_compras(id) ON DELETE CASCADE NOT NULL,
    produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE,
    nome_item_customizado TEXT,
    quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
    comprado BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT chk_nome_ou_produto CHECK (
        (produto_id IS NOT NULL) OR (nome_item_customizado IS NOT NULL)
    )
);

-- TRIGGER PARA SINCRONIZAÇÃO COM SUPABASE AUTH
-- Esta função cria automaticamente o perfil público do usuário quando cadastrado via Supabase Auth
CREATE OR REPLACE FUNCTION public.lidar_com_novo_usuario()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, email, tipo, saldo_creditos, quantidade_diamantes)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome', 'Usuário Novo'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'tipo', 'consumidor'),
    0.00,
    0
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger disparada após criação na tabela auth.users do Supabase
CREATE OR REPLACE TRIGGER trigger_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.lidar_com_novo_usuario();
