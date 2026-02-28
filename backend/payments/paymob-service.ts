/**
 * Paymob Payment Gateway Service
 *
 * Creates Paymob payment sessions using the Intention API.
 * Only active when PAYMOB_API_KEY + PAYMOB_INTEGRATION_ID are set.
 *
 * Flow:
 * 1. Create a payment intention via Paymob API
 * 2. Redirect customer to Paymob's hosted checkout page
 * 3. Receive webhook callback on payment completion
 */

import { Effect } from "effect";
import { ServerError } from "#root/shared/error/server";
import { getPaymobConfig, isPaymobConfigured } from "#root/shared/config/payment";
import axios from "axios";

const PAYMOB_BASE_URL = "https://accept.paymob.com/v1/intention/";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CreatePaymobSessionInput {
  orderId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  totalInCents: number; // amount in smallest currency unit (piasters for EGP)
  currency: string;
  items: Array<{
    name: string;
    quantity: number;
    priceInCents: number;
  }>;
  successUrl: string;
  cancelUrl: string;
}

export interface PaymobSessionResult {
  sessionId: string;
  paymentUrl: string;
  clientSecret: string;
}

// ─── Service ────────────────────────────────────────────────────────────────

/**
 * Create a Paymob payment intention
 */
export const createPaymobPaymentSession = (
  input: CreatePaymobSessionInput,
) =>
  Effect.tryPromise({
    try: async () => {
      if (!isPaymobConfigured()) {
        throw new Error("Paymob is not configured");
      }

      const config = getPaymobConfig();

      const items = input.items.map((item) => ({
        name: item.name,
        amount: item.priceInCents,
        quantity: item.quantity,
        description: item.name,
      }));

      const [firstName, ...lastParts] = input.customerName.split(" ");
      const lastName = lastParts.join(" ") || firstName;

      const payload = {
        amount: input.totalInCents,
        currency: input.currency.toUpperCase(),
        payment_methods: [Number.parseInt(config.integrationId, 10)],
        items,
        billing_data: {
          first_name: firstName,
          last_name: lastName,
          email: input.customerEmail,
          phone_number: input.customerPhone || "+200000000000",
          apartment: "N/A",
          floor: "N/A",
          street: "N/A",
          building: "N/A",
          shipping_method: "N/A",
          postal_code: "N/A",
          city: "N/A",
          country: "EG",
          state: "N/A",
        },
        extras: {
          orderId: input.orderId,
        },
        redirection_url: input.successUrl,
        notification_url: `${process.env.BASE_URL || process.env.PUBLIC_ORIGIN || "http://localhost:3000"}/api/webhooks/paymob`,
      };

      const response = await axios.post(PAYMOB_BASE_URL, payload, {
        headers: {
          Authorization: `Token ${config.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      const data = response.data;

      // Build the checkout URL
      const iframeId = config.iframeId;
      const paymentToken = data.client_secret;
      const paymentUrl = iframeId
        ? `https://accept.paymob.com/unifiedcheckout/?publicKey=${config.apiKey}&clientSecret=${paymentToken}`
        : `https://accept.paymob.com/unifiedcheckout/?publicKey=${config.apiKey}&clientSecret=${paymentToken}`;

      return {
        sessionId: data.id?.toString() ?? data.intention_id?.toString() ?? "",
        paymentUrl,
        clientSecret: paymentToken,
      } as PaymobSessionResult;
    },
    catch: (error) => {
      const msg =
        axios.isAxiosError(error) && error.response?.data
          ? JSON.stringify(error.response.data)
          : error instanceof Error
            ? error.message
            : "Unknown error";
      return new ServerError({
        tag: "PaymentError",
        message: `Failed to create Paymob payment session: ${msg}`,
        statusCode: 502,
        clientMessage: "Failed to create payment session",
      });
    },
  });

/**
 * Verify Paymob webhook HMAC signature
 */
export function verifyPaymobHmac(
  data: Record<string, any>,
  receivedHmac: string,
): boolean {
  const config = getPaymobConfig();
  if (!config.hmacSecret) return false;

  try {
    const crypto = require("node:crypto");

    // Paymob HMAC calculation uses specific fields concatenated in order
    const hmacFields = [
      "amount_cents",
      "created_at",
      "currency",
      "error_occured",
      "has_parent_transaction",
      "id",
      "integration_id",
      "is_3d_secure",
      "is_auth",
      "is_capture",
      "is_refunded",
      "is_standalone_payment",
      "is_voided",
      "order",
      "owner",
      "pending",
      "source_data.pan",
      "source_data.sub_type",
      "source_data.type",
      "success",
    ];

    const getValue = (obj: any, path: string): string => {
      const parts = path.split(".");
      let val = obj;
      for (const p of parts) {
        val = val?.[p];
      }
      return val?.toString() ?? "";
    };

    const concatenated = hmacFields.map((f) => getValue(data, f)).join("");
    const expectedHmac = crypto
      .createHmac("sha512", config.hmacSecret)
      .update(concatenated)
      .digest("hex");

    return expectedHmac === receivedHmac;
  } catch {
    return false;
  }
}
