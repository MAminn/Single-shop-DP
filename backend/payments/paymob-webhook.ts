/**
 * Paymob Webhook Handler
 *
 * Handles Paymob transaction callbacks and HMAC-verified webhooks.
 * Registered as a Fastify plugin at /api/webhooks/paymob
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { isPaymobConfigured } from "#root/shared/config/payment";
import { verifyPaymobHmac } from "./paymob-service";
import { Effect } from "effect";
import { query, DatabaseClientService } from "#root/shared/database/drizzle/db";
import { order } from "#root/shared/database/drizzle/schema";
import { eq } from "drizzle-orm";

export async function paymobWebhookPlugin(fastify: FastifyInstance) {
  // Only register if Paymob is configured
  if (!isPaymobConfigured()) {
    fastify.post("/", async (_req, reply) => {
      return reply.code(404).send({ error: "Paymob is not configured" });
    });
    return;
  }

  fastify.post("/", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as Record<string, any>;
      const transactionData = body.obj || body;

      // Verify HMAC if present
      const hmac = (request.query as any)?.hmac || body.hmac;
      if (hmac) {
        const isValid = verifyPaymobHmac(transactionData, hmac);
        if (!isValid) {
          fastify.log.warn("[Paymob] Invalid HMAC signature");
          return reply.code(401).send({ error: "Invalid HMAC signature" });
        }
      }

      // Extract order ID from extras or merchant_order_id
      const orderId =
        transactionData.order?.extras?.orderId ||
        transactionData.extras?.orderId ||
        transactionData.merchant_order_id;

      if (!orderId) {
        fastify.log.warn("[Paymob] No orderId in webhook data");
        return reply.code(400).send({ error: "Missing orderId" });
      }

      const isSuccess = transactionData.success === true || transactionData.success === "true";
      const isPending = transactionData.pending === true || transactionData.pending === "true";
      const transactionId = transactionData.id?.toString() ?? null;

      let paymentStatus: "paid" | "failed" | "processing";
      let orderStatus: "processing" | "pending" = "pending";

      if (isSuccess) {
        paymentStatus = "paid";
        orderStatus = "processing";
      } else if (isPending) {
        paymentStatus = "processing";
      } else {
        paymentStatus = "failed";
      }

      const provideDb = Effect.provideService(DatabaseClientService, request.db);

      await Effect.runPromise(
        query(async (db) => {
          await db
            .update(order)
            .set({
              paymentStatus,
              paymentTransactionId: transactionId,
              paymentGatewayData: transactionData,
              status: orderStatus,
              updatedAt: new Date(),
            })
            .where(eq(order.id, orderId))
            .execute();
        }).pipe(provideDb),
      );

      fastify.log.info(
        `[Paymob] Payment ${paymentStatus} for order ${orderId} (txn: ${transactionId})`,
      );

      return reply.code(200).send({ received: true });
    } catch (error: unknown) {
      fastify.log.error(
        `[Paymob] Webhook error: ${error instanceof Error ? error.message : String(error)}`,
      );
      return reply.code(500).send({
        error: error instanceof Error ? error.message : "Webhook processing failed",
      });
    }
  });

  // Paymob also sends GET callbacks on redirect — handle the redirect URL
  fastify.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    // This handles the case where Paymob redirects back to our callback URL
    const queryParams = request.query as Record<string, string>;
    const success = queryParams.success === "true";
    const orderId = queryParams.merchant_order_id || queryParams.orderId;

    if (orderId) {
      // Redirect to order confirmation
      const baseUrl = process.env.PUBLIC_ORIGIN || process.env.BASE_URL || "http://localhost:3000";
      return reply.redirect(
        `${baseUrl}/order-confirmation?id=${orderId}&payment=${success ? "success" : "failed"}`,
      );
    }

    return reply.redirect("/");
  });
}
