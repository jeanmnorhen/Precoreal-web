"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anunciosRelations = exports.produtosRelations = exports.lojasRelations = exports.usuariosRelations = exports.anuncios = exports.produtos = exports.lojas = exports.usuarios = exports.statusPedidoEnum = exports.statusAnuncioEnum = exports.tipoUsuarioEnum = exports.postgisPoint = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
// Tipo customizado para o PostGIS Point (SRID 4326 - WGS84)
exports.postgisPoint = (0, pg_core_1.customType)({
    dataType() {
        return 'geometry(Point,4326)';
    },
    toDriver(value) {
        return value; // Espera formato 'SRID=4326;POINT(longitude latitude)'
    },
    fromDriver(value) {
        return value; // Retorna string 'POINT(longitude latitude)' ou WKB
    }
});
// Enums Globais do Sistema
exports.tipoUsuarioEnum = (0, pg_core_1.pgEnum)('tipo_usuario', ['consumidor', 'lojista']);
exports.statusAnuncioEnum = (0, pg_core_1.pgEnum)('status_anuncio', ['ativo', 'pausado', 'expirado']);
exports.statusPedidoEnum = (0, pg_core_1.pgEnum)('status_pedido', ['aguardando_pagamento', 'pago', 'enviado', 'entregue', 'cancelado']);
// Tabela de Usuários (Centraliza Autenticação e Saldos)
exports.usuarios = (0, pg_core_1.pgTable)('usuarios', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    nome: (0, pg_core_1.varchar)('nome', { length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull(),
    senhaHash: (0, pg_core_1.varchar)('senha_hash', { length: 255 }).notNull(),
    tipo: (0, exports.tipoUsuarioEnum)('tipo').notNull().default('consumidor'),
    saldoCreditos: (0, pg_core_1.integer)('saldo_creditos').notNull().default(0), // Armazenado em centavos
    quantidadeDiamantes: (0, pg_core_1.integer)('quantidade_diamantes').notNull().default(0),
    criadoEm: (0, pg_core_1.timestamp)('criado_em').defaultNow().notNull()
}, (table) => ({
    emailIdx: (0, pg_core_1.uniqueIndex)('usuarios_email_uidx').on(table.email)
}));
// Tabela de Lojas (Estrutura de Tenant e Geolocalização)
exports.lojas = (0, pg_core_1.pgTable)('lojas', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    usuarioProprietarioId: (0, pg_core_1.uuid)('usuario_proprietario_id').references(() => exports.usuarios.id).notNull(),
    nome: (0, pg_core_1.varchar)('nome', { length: 255 }).notNull(),
    descricao: (0, pg_core_1.text)('descricao'),
    enderecoRua: (0, pg_core_1.varchar)('endereco_rua', { length: 255 }).notNull(),
    enderecoNumero: (0, pg_core_1.varchar)('endereco_numero', { length: 20 }).notNull(),
    enderecoBairro: (0, pg_core_1.varchar)('endereco_bairro', { length: 100 }).notNull(),
    enderecoCidade: (0, pg_core_1.varchar)('endereco_cidade', { length: 100 }).notNull(),
    enderecoEstado: (0, pg_core_1.varchar)('endereco_estado', { length: 2 }).notNull(),
    enderecoCep: (0, pg_core_1.varchar)('endereco_cep', { length: 8 }).notNull(),
    localizacao: (0, exports.postgisPoint)('localizacao').notNull(),
    tabloideUrl: (0, pg_core_1.varchar)('tabloide_url', { length: 512 }),
    criadoEm: (0, pg_core_1.timestamp)('criado_em').defaultNow().notNull()
}, (table) => ({
    lojaOwnerIdx: (0, pg_core_1.index)('lojas_owner_idx').on(table.usuarioProprietarioId),
    // Índice espacial GiST para buscas geográficas rápidas
    localizacaoGistIdx: (0, pg_core_1.index)('lojas_localizacao_gist_idx').on(table.localizacao)
}));
// Tabela de Produtos (Catálogo unificado via EAN/GTIN)
exports.produtos = (0, pg_core_1.pgTable)('produtos', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    codigoBarras: (0, pg_core_1.varchar)('codigo_barras', { length: 50 }).notNull(),
    nome: (0, pg_core_1.varchar)('nome', { length: 255 }).notNull(),
    descricao: (0, pg_core_1.text)('descricao'),
    categoria: (0, pg_core_1.varchar)('categoria', { length: 100 }).notNull(),
    marca: (0, pg_core_1.varchar)('marca', { length: 100 }).notNull(),
    precoMedio: (0, pg_core_1.integer)('preco_medio').notNull().default(0),
    listaImagens: (0, pg_core_1.text)('lista_imagens').array(),
    criadoEm: (0, pg_core_1.timestamp)('criado_em').defaultNow().notNull()
}, (table) => ({
    codigoBarrasUidx: (0, pg_core_1.uniqueIndex)('produtos_codigo_barras_uidx').on(table.codigoBarras),
    nomeIdx: (0, pg_core_1.index)('produtos_nome_idx').on(table.nome)
}));
// Tabela de Anúncios (Multi-tenant por loja_id)
exports.anuncios = (0, pg_core_1.pgTable)('anuncios', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    lojaId: (0, pg_core_1.uuid)('loja_id').references(() => exports.lojas.id).notNull(), // Tenant Owner
    produtoId: (0, pg_core_1.uuid)('produto_id').references(() => exports.produtos.id).notNull(),
    titulo: (0, pg_core_1.varchar)('titulo', { length: 255 }).notNull(),
    descricao: (0, pg_core_1.text)('descricao'),
    raioAlcanceKm: (0, pg_core_1.integer)('raio_alcance_km').notNull(),
    custoCreditos: (0, pg_core_1.integer)('custo_creditos').notNull(),
    dataInicio: (0, pg_core_1.timestamp)('data_inicio').notNull(),
    dataFim: (0, pg_core_1.timestamp)('data_fim').notNull(),
    status: (0, exports.statusAnuncioEnum)('status').notNull().default('ativo'),
    criadoEm: (0, pg_core_1.timestamp)('criado_em').defaultNow().notNull()
}, (table) => ({
    anuncioTenantIdx: (0, pg_core_1.index)('anuncios_tenant_idx').on(table.lojaId),
    anuncioStatusIdx: (0, pg_core_1.index)('anuncios_status_idx').on(table.status)
}));
// Definições de Relações
exports.usuariosRelations = (0, drizzle_orm_1.relations)(exports.usuarios, ({ many }) => ({
    lojas: many(exports.lojas)
}));
exports.lojasRelations = (0, drizzle_orm_1.relations)(exports.lojas, ({ one, many }) => ({
    proprietario: one(exports.usuarios, {
        fields: [exports.lojas.usuarioProprietarioId],
        references: [exports.usuarios.id]
    }),
    anuncios: many(exports.anuncios)
}));
exports.produtosRelations = (0, drizzle_orm_1.relations)(exports.produtos, ({ many }) => ({
    anuncios: many(exports.anuncios)
}));
exports.anunciosRelations = (0, drizzle_orm_1.relations)(exports.anuncios, ({ one }) => ({
    loja: one(exports.lojas, {
        fields: [exports.anuncios.lojaId],
        references: [exports.lojas.id]
    }),
    produto: one(exports.produtos, {
        fields: [exports.anuncios.produtoId],
        references: [exports.produtos.id]
    })
}));
