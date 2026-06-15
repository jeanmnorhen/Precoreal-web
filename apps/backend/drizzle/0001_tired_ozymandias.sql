DO $$ BEGIN
 CREATE TYPE "public"."status_revisao" AS ENUM('pendente', 'aprovado', 'rejeitado');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."tipo_anuncio" AS ENUM('oferta', 'promocao', 'promocao_relampago');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TYPE "tipo_usuario" ADD VALUE 'funcionario';--> statement-breakpoint
ALTER TYPE "tipo_usuario" ADD VALUE 'admin';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "funcionarios_lojas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"loja_id" uuid NOT NULL,
	"turnos" text[],
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "anuncios" ADD COLUMN "tipo" "tipo_anuncio" DEFAULT 'oferta' NOT NULL;--> statement-breakpoint
ALTER TABLE "lojas" ADD COLUMN "perimetro" geometry(Point,4326);--> statement-breakpoint
ALTER TABLE "lojas" ADD COLUMN "perimetro_raio_metros" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE "produtos" ADD COLUMN "status_revisao" "status_revisao" DEFAULT 'pendente' NOT NULL;--> statement-breakpoint
ALTER TABLE "produtos" ADD COLUMN "revisado_por" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "funcionarios_lojas" ADD CONSTRAINT "funcionarios_lojas_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "funcionarios_lojas" ADD CONSTRAINT "funcionarios_lojas_loja_id_lojas_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."lojas"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "funcionarios_loja_uidx" ON "funcionarios_lojas" ("usuario_id","loja_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "funcionarios_usuario_idx" ON "funcionarios_lojas" ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "funcionarios_loja_idx" ON "funcionarios_lojas" ("loja_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "produtos" ADD CONSTRAINT "produtos_revisado_por_usuarios_id_fk" FOREIGN KEY ("revisado_por") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "anuncios_tipo_idx" ON "anuncios" ("tipo");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "produtos_revisao_status_idx" ON "produtos" ("status_revisao");