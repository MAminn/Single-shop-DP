ALTER TABLE "order" ADD COLUMN "suspicious" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "suspicious_reasons" jsonb;