ALTER TABLE "homepage_content" DROP CONSTRAINT "homepage_content_merchant_id_unique";--> statement-breakpoint
ALTER TABLE "homepage_content" ADD COLUMN "template_id" text DEFAULT 'default' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "homepage_content_merchant_template_idx" ON "homepage_content" USING btree ("merchant_id","template_id");--> statement-breakpoint
ALTER TABLE "tracking_event" ADD CONSTRAINT "tracking_event_event_id_unique" UNIQUE("event_id");