CREATE TABLE IF NOT EXISTS "cosmos_quotas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"data" date DEFAULT now() NOT NULL,
	"consultas_utilizadas" integer DEFAULT 0 NOT NULL,
	"limite_diario" integer DEFAULT 25 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "creditos_gratuitos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"quantidade" integer DEFAULT 30 NOT NULL,
	"concedido_em" timestamp DEFAULT now() NOT NULL,
	"expira_em" timestamp NOT NULL,
	"expirado" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lojas" ADD COLUMN "cnpj" varchar(14);--> statement-breakpoint
ALTER TABLE "lojas" ADD COLUMN "cnpj_verificado" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "lojas" ADD COLUMN "cnpj_verificado_em" timestamp;--> statement-breakpoint
ALTER TABLE "produtos" ADD COLUMN "ncm" varchar(8);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "creditos_gratuitos" ADD CONSTRAINT "creditos_gratuitos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "cosmos_quotas_data_uidx" ON "cosmos_quotas" ("data");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "creditos_gratuitos_usuario_idx" ON "creditos_gratuitos" ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "creditos_gratuitos_expirado_idx" ON "creditos_gratuitos" ("expirado");