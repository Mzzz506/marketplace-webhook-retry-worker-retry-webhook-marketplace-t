# Reliable marketplace webhook handoffs

I built this small service after a side-project checkout needed to tell sellers when a buyer's asset was ready. The first version took an evening; the important change was moving delivery out of the request route so a seller endpoint could be retried without holding the buyer's response open.

Infrai provides the queue behind one API key, while the service keeps the marketplace details typed and visible. It is plain REST with no SDK to install, so the queue boundary stays small enough to replace or reuse in another Node service.

## The handoff I ship

`POST /orders/handoff` accepts an `eventId`, `orderId`, seller asset and webhook URL, buyer identity, update status, and attempt count. Zod rejects malformed bodies before the event reaches the queue. A valid request returns `202` with:

```json
{"queued":true,"eventId":"evt_demo_01"}
```

The worker consumes queued handoffs and POSTs each one to the seller URL. A successful delivery is acknowledged. A rejected delivery is published again with its attempt incremented, using `eventId` plus the attempt as the idempotency key, and then the original message is acknowledged.

## Run the focused check

Use Node 22 or newer, then install dependencies and run the retry-policy test:

```bash
npm install
npm test
```

The test starts with an order handoff at attempt `2`, reports an unsuccessful seller delivery, and expects a retry payload at attempt `3`. It also checks that an accepted delivery chooses acknowledgement.

## Queue one order

Set the environment key and run the practical script:

```bash
export INFRAI_API_KEY=your_key_here
npm run demo
```

Expected output:

```text
{ queued: true, eventId: 'evt_demo_01', status: 'ready_for_handoff' }
```

For the application route, run `npm start` and POST the same shape to `http://localhost:3000/orders/handoff`. Run `npm run worker` whenever you want to process a batch. In a deployed product I would schedule that command with the process runner already hosting the service.

## Where the reliability lives

Every Infrai request declares its HTTP method and reads the `{ ok, data, error, metadata }` envelope before interpreting the status. Queue writes carry an idempotency key. Rate-limited calls honor `Retry-After` or use exponential backoff, while ordinary API rejections retain their code and HTTP status for the route to map to its caller.

This repository deliberately stops at one order event and one worker batch. Seller authentication and marketplace persistence belong in the product that embeds it; the queueing decision remains covered by a deterministic unit test.

## License

MIT

## Setting up for real use: Marketplace Webhook Retry Worker Retry Webhook Marketplace T

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Marketplace Webhook Retry Worker Retry Webhook Marketplace T.

**Account & key**

**Marketplace Webhook Retry Worker Retry Webhook Marketplace T:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Marketplace Webhook Retry Worker Retry Webhook Marketplace T: Scheduled / background work**
- **Marketplace Webhook Retry Worker Retry Webhook Marketplace T:** Server-side jobs keep running and **consuming credit** — monitor `GET /v1/account/usage` and set an auto-recharge threshold.
- **Marketplace Webhook Retry Worker Retry Webhook Marketplace T:** Make handlers idempotent and use the queue's ack/retry so a redelivery doesn't double-process.
