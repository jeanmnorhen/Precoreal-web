DO $$ BEGIN
 CREATE TYPE "public"."status_anuncio" AS ENUM('ativo', 'pausado', 'expirado');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."status_pedido" AS ENUM('aguardando_pagamento', 'pago', 'enviado', 'entregue', 'cancelado');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."tipo_usuario" AS ENUM('consumidor', 'lojista');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "anuncios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loja_id" uuid NOT NULL,
	"produto_id" uuid NOT NULL,
	"titulo" varchar(255) NOT NULL,
	"descricao" text,
	"raio_alcance_km" integer NOT NULL,
	"custo_creditos" integer NOT NULL,
	"data_inicio" timestamp NOT NULL,
	"data_fim" timestamp NOT NULL,
	"status" "status_anuncio" DEFAULT 'ativo' NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lojas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_proprietario_id" uuid NOT NULL,
	"nome" varchar(255) NOT NULL,
	"descricao" text,
	"endereco_rua" varchar(255) NOT NULL,
	"endereco_numero" varchar(20) NOT NULL,
	"endereco_bairro" varchar(100) NOT NULL,
	"endereco_cidade" varchar(100) NOT NULL,
	"endereco_estado" varchar(2) NOT NULL,
	"endereco_cep" varchar(8) NOT NULL,
	"localizacao" "geometry(Point,4326)" NOT NULL,
	"tabloide_url" varchar(512),
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "produtos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"codigo_barras" varchar(50) NOT NULL,
	"nome" varchar(255) NOT NULL,
	"descricao" text,
	"categoria" varchar(100) NOT NULL,
	"marca" varchar(100) NOT NULL,
	"preco_medio" integer DEFAULT 0 NOT NULL,
	"lista_imagens" text[],
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"senha_hash" varchar(255) NOT NULL,
	"tipo" "tipo_usuario" DEFAULT 'consumidor' NOT NULL,
	"saldo_creditos" integer DEFAULT 0 NOT NULL,
	"quantidade_diamantes" integer DEFAULT 0 NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "anuncios" ADD CONSTRAINT "anuncios_loja_id_lojas_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."lojas"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "anuncios" ADD CONSTRAINT "anuncios_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lojas" ADD CONSTRAINT "lojas_usuario_proprietario_id_usuarios_id_fk" FOREIGN KEY ("usuario_proprietario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "anuncios_tenant_idx" ON "anuncios" ("loja_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "anuncios_status_idx" ON "anuncios" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lojas_owner_idx" ON "lojas" ("usuario_proprietario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lojas_localizacao_gist_idx" ON "lojas" ("localizacao");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "produtos_codigo_barras_uidx" ON "produtos" ("codigo_barras");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "produtos_nome_idx" ON "produtos" ("nome");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "usuarios_email_uidx" ON "usuarios" ("email");