import { pgTable, uuid, varchar, text, integer, timestamp, date, boolean, pgEnum, index, uniqueIndex, customType } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tipo customizado para o PostGIS Point (SRID 4326 - WGS84)
export const postgisPoint = customType<{ data: string; driverData: string }>({
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
export const tipoUsuarioEnum = pgEnum('tipo_usuario', ['consumidor', 'lojista', 'funcionario', 'admin']);
export const tipoAnuncioEnum = pgEnum('tipo_anuncio', ['oferta', 'promocao', 'promocao_relampago']);
export const statusAnuncioEnum = pgEnum('status_anuncio', ['ativo', 'pausado', 'expirado']);
export const statusPedidoEnum = pgEnum('status_pedido', ['aguardando_pagamento', 'pago', 'enviado', 'entregue', 'cancelado']);
// Tabela de Usuários (Centraliza Autenticação e Saldos)
export const usuarios = pgTable('usuarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: varchar('nome', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  senhaHash: varchar('senha_hash', { length: 255 }).notNull(),
  tipo: tipoUsuarioEnum('tipo').notNull().default('consumidor'),
  saldoCreditos: integer('saldo_creditos').notNull().default(0),
  quantidadeDiamantes: integer('quantidade_diamantes').notNull().default(0),
  criadoEm: timestamp('criado_em').defaultNow().notNull()
}, (table) => ({
  emailIdx: uniqueIndex('usuarios_email_uidx').on(table.email)
}));

// Tabela de Lojas (Estrutura de Tenant e Geolocalização)
export const lojas = pgTable('lojas', {
  id: uuid('id').primaryKey().defaultRandom(),
  usuarioProprietarioId: uuid('usuario_proprietario_id').references(() => usuarios.id).notNull(),
  nome: varchar('nome', { length: 255 }).notNull(),
  descricao: text('descricao'),
  enderecoRua: varchar('endereco_rua', { length: 255 }).notNull(),
  enderecoNumero: varchar('endereco_numero', { length: 20 }).notNull(),
  enderecoBairro: varchar('endereco_bairro', { length: 100 }).notNull(),
  enderecoCidade: varchar('endereco_cidade', { length: 100 }).notNull(),
  enderecoEstado: varchar('endereco_estado', { length: 2 }).notNull(),
  enderecoCep: varchar('endereco_cep', { length: 8 }).notNull(),
  localizacao: postgisPoint('localizacao').notNull(),
  perimetro: postgisPoint('perimetro'), // Point geometry para geofencing + raio
  perimetroRaioMetros: integer('perimetro_raio_metros').notNull().default(100),
  logoUrl: varchar('logo_url', { length: 512 }),
  tabloideUrl: varchar('tabloide_url', { length: 512 }),
  cnpj: varchar('cnpj', { length: 14 }),
  cnpjVerificado: boolean('cnpj_verificado').default(false).notNull(),
  cnpjVerificadoEm: timestamp('cnpj_verificado_em'),
  criadoEm: timestamp('criado_em').defaultNow().notNull()
}, (table) => ({
  lojaOwnerIdx: index('lojas_owner_idx').on(table.usuarioProprietarioId),
  localizacaoGistIdx: index('lojas_localizacao_gist_idx').on(table.localizacao)
}));

// Tabela de Vínculo Funcionário-Loja (com turnos)
export const funcionariosLojas = pgTable('funcionarios_lojas', {
  id: uuid('id').primaryKey().defaultRandom(),
  usuarioId: uuid('usuario_id').references(() => usuarios.id).notNull(),
  lojaId: uuid('loja_id').references(() => lojas.id).notNull(),
  turnos: text('turnos').array(), // JSON array: [{"diaSemana":1,"horaInicio":"08:00","horaFim":"18:00"}]
  criadoEm: timestamp('criado_em').defaultNow().notNull()
}, (table) => ({
  funcionarioLojaUidx: uniqueIndex('funcionarios_loja_uidx').on(table.usuarioId, table.lojaId),
  funcionarioIdx: index('funcionarios_usuario_idx').on(table.usuarioId),
  funcionarioLojaIdx: index('funcionarios_loja_idx').on(table.lojaId)
}));

// Tabela de Produtos (Catálogo unificado via EAN/GTIN)
export const produtos = pgTable('produtos', {
  id: uuid('id').primaryKey().defaultRandom(),
  codigoBarras: varchar('codigo_barras', { length: 50 }).notNull(),
  nome: varchar('nome', { length: 255 }).notNull(),
  descricao: text('descricao'),
  categoria: varchar('categoria', { length: 100 }).notNull(),
  marca: varchar('marca', { length: 100 }).notNull(),
  ncm: varchar('ncm', { length: 8 }),
  precoMedio: integer('preco_medio').notNull().default(0),
  listaImagens: text('lista_imagens').array(),
  criadoEm: timestamp('criado_em').defaultNow().notNull()
}, (table) => ({
  codigoBarrasUidx: uniqueIndex('produtos_codigo_barras_uidx').on(table.codigoBarras),
  nomeIdx: index('produtos_nome_idx').on(table.nome),
}));

// Tabela de Anúncios (Multi-tenant por loja_id)
export const anuncios = pgTable('anuncios', {
  id: uuid('id').primaryKey().defaultRandom(),
  lojaId: uuid('loja_id').references(() => lojas.id).notNull(), // Tenant Owner
  produtoId: uuid('produto_id').references(() => produtos.id).notNull(),
  titulo: varchar('titulo', { length: 255 }).notNull(),
  descricao: text('descricao'),
  tipo: tipoAnuncioEnum('tipo').notNull().default('oferta'),
  raioAlcanceKm: integer('raio_alcance_km').notNull(),
  custoCreditos: integer('custo_creditos').notNull(),
  dataInicio: timestamp('data_inicio').notNull(),
  dataFim: timestamp('data_fim').notNull(),
  status: statusAnuncioEnum('status').notNull().default('ativo'),
  criadoEm: timestamp('criado_em').defaultNow().notNull()
}, (table) => ({
  anuncioTenantIdx: index('anuncios_tenant_idx').on(table.lojaId),
  anuncioStatusIdx: index('anuncios_status_idx').on(table.status),
  anunciaTipoIdx: index('anuncios_tipo_idx').on(table.tipo)
}));

// Tabela de Créditos Gratuitos Mensais para Lojistas
export const creditosGratuitos = pgTable('creditos_gratuitos', {
  id: uuid('id').primaryKey().defaultRandom(),
  usuarioId: uuid('usuario_id').references(() => usuarios.id).notNull(),
  quantidade: integer('quantidade').notNull().default(30),
  concedidoEm: timestamp('concedido_em').defaultNow().notNull(),
  expiraEm: timestamp('expira_em').notNull(),
  expirado: boolean('expirado').notNull().default(false),
}, (table) => ({
  creditoUsuarioIdx: index('creditos_gratuitos_usuario_idx').on(table.usuarioId),
  creditoExpiradoIdx: index('creditos_gratuitos_expirado_idx').on(table.expirado),
}));

// Tabela de Quota da API Cosmos (limite 25 consultas/dia)
export const cosmosQuotas = pgTable('cosmos_quotas', {
  id: uuid('id').primaryKey().defaultRandom(),
  data: date('data').notNull().defaultNow(),
  consultasUtilizadas: integer('consultas_utilizadas').notNull().default(0),
  limiteDiario: integer('limite_diario').notNull().default(25),
}, (table) => ({
  dataUidx: uniqueIndex('cosmos_quotas_data_uidx').on(table.data)
}));

// Definições de Relações
export const usuariosRelations = relations(usuarios, ({ many }) => ({
  lojas: many(lojas),
  vinculosFuncionario: many(funcionariosLojas),
  creditosGratuitos: many(creditosGratuitos),
}));

export const lojasRelations = relations(lojas, ({ one, many }) => ({
  proprietario: one(usuarios, {
    fields: [lojas.usuarioProprietarioId],
    references: [usuarios.id]
  }),
  anuncios: many(anuncios),
  funcionarios: many(funcionariosLojas)
}));

export const produtosRelations = relations(produtos, ({ many }) => ({
  anuncios: many(anuncios)
}));

export const anunciosRelations = relations(anuncios, ({ one }) => ({
  loja: one(lojas, {
    fields: [anuncios.lojaId],
    references: [lojas.id]
  }),
  produto: one(produtos, {
    fields: [anuncios.produtoId],
    references: [produtos.id]
  })
}));

export const creditosGratuitosRelations = relations(creditosGratuitos, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [creditosGratuitos.usuarioId],
    references: [usuarios.id]
  })
}));

export const funcionariosLojasRelations = relations(funcionariosLojas, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [funcionariosLojas.usuarioId],
    references: [usuarios.id]
  }),
  loja: one(lojas, {
    fields: [funcionariosLojas.lojaId],
    references: [lojas.id]
  })
}));
