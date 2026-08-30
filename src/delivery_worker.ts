import { z } from "zod";
import { infrai } from "./infrai_queue.js";
import { decideDelivery, orderHandoffSchema } from "./marketplace_event.js";

const consumedSchema = z.object({
  messages: z.array(z.object({ message_id: z.string(), payload: orderHandoffSchema }))
});

async function deliver(): Promise<number> {
  const batch = consumedSchema.parse(await infrai.queue.consume(10, 30));
  for (const message of batch.messages) {
    const event = message.payload;
    const webhookResponse = await fetch(event.seller.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": event.eventId },
      body: JSON.stringify(event)
    });
    const decision = decideDelivery(event, webhookResponse.ok);
    if (decision.action === "retry") {
      await infrai.queue.publish(
        decision.next,
        `handoff-${decision.next.eventId}-${decision.next.attempt}`
      );
    }
    await infrai.queue.ack(message.message_id);
  }
  return batch.messages.length;
}

deliver()
  .then((count) => console.log(`Processed ${count} webhook deliveries`))
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
