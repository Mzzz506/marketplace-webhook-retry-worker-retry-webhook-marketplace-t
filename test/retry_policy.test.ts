import assert from "node:assert/strict";
import test from "node:test";
import { decideDelivery, orderHandoffSchema } from "../src/marketplace_event.js";

test("a rejected seller delivery is queued as the next attempt", () => {
  const event = orderHandoffSchema.parse({
    eventId: "evt_12",
    orderId: "order_44",
    seller: {
      sellerId: "seller_3",
      webhookUrl: "https://seller.example/webhook",
      asset: { assetId: "asset_9", title: "Icon set" }
    },
    buyer: { buyerId: "buyer_8", email: "maker@example.com" },
    update: { status: "ready_for_handoff" },
    attempt: 2
  });

  assert.deepEqual(decideDelivery(event, false), {
    action: "retry",
    next: { ...event, attempt: 3 }
  });
});

test("an accepted seller delivery is acknowledged", () => {
  const event = orderHandoffSchema.parse({
    eventId: "evt_13",
    orderId: "order_45",
    seller: {
      sellerId: "seller_3",
      webhookUrl: "https://seller.example/webhook",
      asset: { assetId: "asset_10", title: "Invoice template" }
    },
    buyer: { buyerId: "buyer_9", email: "founder@example.com" },
    update: { status: "paid" }
  });

  assert.deepEqual(decideDelivery(event, true), { action: "ack" });
});
