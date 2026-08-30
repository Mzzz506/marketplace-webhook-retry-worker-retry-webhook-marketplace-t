import { createServer } from "node:http";
import { ZodError } from "zod";
import { InfraiError, infrai } from "./infrai_queue.js";
import { orderHandoffSchema } from "./marketplace_event.js";

async function readJson(request: NodeJS.ReadableStream): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const server = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/orders/handoff") {
    response.writeHead(404).end();
    return;
  }

  try {
    const event = orderHandoffSchema.parse(await readJson(request));
    await infrai.queue.publish(event, `handoff-${event.eventId}-${event.attempt}`);
    response.writeHead(202, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ queued: true, eventId: event.eventId }));
  } catch (error) {
    if (error instanceof ZodError) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "invalid_order_handoff", issues: error.issues }));
      return;
    }
    if (error instanceof InfraiError) {
      response.writeHead(error.status >= 400 && error.status < 500 ? error.status : 502, {
        "Content-Type": "application/json"
      });
      response.end(JSON.stringify({ error: error.code, message: error.message }));
      return;
    }
    response.writeHead(500).end();
  }
});

const port = Number(process.env.PORT ?? 3000);
server.listen(port, () => console.log(`Marketplace handoff route listening on ${port}`));
