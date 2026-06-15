ALTER TABLE "produtos" DROP CONSTRAINT "produtos_revisado_por_usuarios_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "produtos_revisao_status_idx";--> statement-breakpoint
ALTER TABLE "produtos" DROP COLUMN IF EXISTS "status_revisao";--> statement-breakpoint
ALTER TABLE "produtos" DROP COLUMN IF EXISTS "revisado_por";