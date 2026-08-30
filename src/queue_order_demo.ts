import { infrai } from "./infrai_queue.js";
import { orderHandoffSchema } from "./marketplace_event.js";

const event = orderHandoffSchema.parse({
  eventId: "evt_demo_01",
  orderId: "order_1042",
  seller: {
    sellerId: "seller_7",
    webhookUrl: "https://seller.example/webhooks/orders",
    asset: { assetId: "asset_88", title: "Launch checklist" }
  },
  buyer: { buyerId: "buyer_31", email: "buyer@example.com" },
  update: { status: "ready_for_handoff" },
  attempt: 0
});

await infrai.queue.publish(event, `handoff-${event.eventId}-${event.attempt}`);
console.log({ queued: true, eventId: event.eventId, status: event.update.status });
