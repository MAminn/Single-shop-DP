ALTER TABLE "layout_settings" DROP CONSTRAINT "layout_settings_merchant_id_unique";--> statement-breakpoint
ALTER TABLE "layout_settings" ADD COLUMN "template_id" text DEFAULT 'default' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "layout_settings_merchant_template_idx" ON "layout_settings" USING btree ("merchant_id","template_id");