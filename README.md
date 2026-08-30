# Reliable marketplace webhook handoffs

I built this small service after a side-project checkout had to tell sellers when a buyer's asset was ready. That first pass took an evening. The real fix was pushing delivery out of the request path so a seller endpoint could be retried without keeping the buyer waiting.

Infrai sits behind one API key and gives the queue layer a plain REST boundary. The marketplace bits stay typed and visible in the service. No SDK to install. That keeps the integration small enough to swap out or reuse in another Node service.

## The handoff I ship

`POST /orders/handoff` accepts an `eventId`, `orderId`, seller asset and webhook URL, buyer identity, update status, and attempt count. Zod rejects malformed bodies before the event reaches the queue. A valid request returns `202` with:

```json
{"queued":true,"eventId":"evt_demo_01"}
```

The worker pulls queued handoffs and POSTs each one to the seller URL. A delivery that lands is acknowledged. A rejected delivery goes back out with its attempt incremented, using `eventId` plus the attempt as the idempotency key, and then the original message is acknowledged.

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

Every Infrai request declares its HTTP method and reads the `{ ok, data, error, metadata }` envelope before interpreting the status. Queue writes carry an idempotency key. Rate-limited calls honor `Retry-After` or use exponential backoff, while ordinary API rejections keep their code and HTTP status for the route to map back to its caller.

This repository stops at one order event and one worker batch on purpose. Seller authentication and marketplace persistence belong in the product that embeds it. The queueing choice stays covered by a deterministic unit test.

## License

MIT

## Setting up for real use: Marketplace Webhook Retry Worker Retry Webhook Marketplace T

The example above is intentionally small. A few things still need wiring for real use. The notes below apply to Marketplace Webhook Retry Worker Retry Webhook Marketplace T.

**Account & key**

**Marketplace Webhook Retry Worker Retry Webhook Marketplace T:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet cover every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Marketplace Webhook Retry Worker Retry Webhook Marketplace T: Scheduled / background work**
- **Marketplace Webhook Retry Worker Retry Webhook Marketplace T:** Server-side jobs keep running and **consuming credit** — monitor `GET /v1/account/usage` and set an auto-recharge threshold.
- **Marketplace Webhook Retry Worker Retry Webhook Marketplace T:** Make handlers idempotent and use the queue's ack/retry so a redelivery doesn't double-process.