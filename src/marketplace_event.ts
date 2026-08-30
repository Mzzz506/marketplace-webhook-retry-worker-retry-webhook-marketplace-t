import { z } from "zod";

export const orderHandoffSchema = z.object({
  eventId: z.string().min(1),
  orderId: z.string().min(1),
  seller: z.object({
    sellerId: z.string().min(1),
    webhookUrl: z.string().url(),
    asset: z.object({ assetId: z.string().min(1), title: z.string().min(1) })
  }),
  buyer: z.object({ buyerId: z.string().min(1), email: z.string().email() }),
  update: z.object({ status: z.enum(["paid", "ready_for_handoff"]) }),
  attempt: z.number().int().nonnegative().default(0)
});

export type OrderHandoff = z.infer<typeof orderHandoffSchema>;

export type DeliveryDecision =
  | { action: "ack" }
  | { action: "retry"; next: OrderHandoff };

export function decideDelivery(event: OrderHandoff, delivered: boolean): DeliveryDecision {
  if (delivered) return { action: "ack" };
  return { action: "retry", next: { ...event, attempt: event.attempt + 1 } };
}
