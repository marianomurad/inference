# basic-rcs — RCS Business Messaging API Service

## 1. Context & Goal

Build a small HTTP service that sends enriched RCS messages via Google's **RCS Business Messaging (RBM)** API and receives delivery / read / reply events over an HTTPS webhook.

Reference: https://developers.google.com/business-communications/rcs-business-messaging/guides/build/messages/send

**Out of scope for MVP:** admin UI, message templating, customer database, bulk campaigns, multi-tenant agent management, SMS fallback routing.

**Locked decisions (from clarifying Q&A):**
- Stack: **Node.js + TypeScript**, API-only (no frontend).
- Official SDK: **@google/rcsbusinessmessaging**.
- Webhook transport: **HTTPS endpoint** (not Pub/Sub).
- MVP scope: all enriched message types + suggestions, capability check, webhook receiver, file upload.

## 2. Prerequisites (external, one-time)

Before any code runs, the operator must complete these in Google Cloud / Business Communications Developer Console:

1. **GCP project** with billing enabled.
2. **RBM agent** created via the Business Communications Developer Console.
3. **Service account** with role `RCS Business Messaging Agent` (or equivalent). Download JSON key.
4. **OAuth scope** authorized: `https://www.googleapis.com/auth/rcsbusinessmessaging`.
5. **Agent launch status** — at minimum "test mode"; test devices added to the agent for dev.
6. **Webhook URL** registered on the RBM agent, pointing at this service's `/webhooks/rbm` (public HTTPS, signed requests).
7. **Agent ID** and **region** (e.g., `us`, `europe`) known.

## 3. Tech Stack

| Layer           | Choice                         | Why                                           |
|-----------------|--------------------------------|-----------------------------------------------|
| Language        | TypeScript 5.x                 | Type safety on Google's message shapes        |
| Runtime         | Node.js 20 LTS                 | SDK target                                    |
| HTTP framework  | Fastify 4.x                    | Fast, schema-first, good TS types             |
| RBM SDK         | `@google/rcsbusinessmessaging` | Official; handles auth + retries              |
| Auth to Google  | `google-auth-library`          | Service-account OAuth2                        |
| Validation      | Zod                            | Request body validation, shared types         |
| Logging         | Pino                           | JSON logs, fast, Fastify-native               |
| Config          | `dotenv` + Zod-validated env   | Fail fast on missing config                   |
| Tests           | Vitest + supertest             | Unit + route tests                            |
| Lint/format     | ESLint + Prettier              | Workspace consistency                         |
| Package manager | npm                            | Matches workspace convention                  |

## 4. Project Layout

```
basic-rcs/
├── plans/
│   └── rcs-api-implementation.md   (this file)
├── src/
│   ├── index.ts                    app entrypoint
│   ├── config.ts                   env validation (Zod)
│   ├── rbm/
│   │   ├── client.ts               RBM SDK wrapper (auth + region routing)
│   │   ├── messages.ts             send text / richCard / carousel / media
│   │   ├── suggestions.ts          build reply + action chips
│   │   ├── capability.ts           phones:checkCapability
│   │   └── files.ts                file upload (/upload/v1/files)
│   ├── routes/
│   │   ├── send.ts                 POST /messages
│   │   ├── capability.ts           GET  /capability/:phone
│   │   ├── upload.ts               POST /files
│   │   └── webhook.ts              POST /webhooks/rbm
│   ├── schemas/                    Zod schemas for each message type
│   ├── lib/
│   │   ├── logger.ts
│   │   └── errors.ts               typed error shape
│   └── types/rbm.ts                shared TS types
├── tests/
│   ├── routes/
│   └── rbm/
├── .env.example
├── package.json
├── tsconfig.json
├── eslint.config.js
├── .prettierrc
└── README.md
```

## 5. Environment Variables

| Var                              | Required | Example              | Notes                                           |
|----------------------------------|----------|----------------------|-------------------------------------------------|
| `PORT`                           | yes      | `3000`               | HTTP listen port                                |
| `NODE_ENV`                       | yes      | `development`        |                                                 |
| `RBM_AGENT_ID`                   | yes      | `my-brand-agent`     | From RBM console                                |
| `RBM_REGION`                     | yes      | `us`                 | Prefixed onto endpoint host                     |
| `GOOGLE_APPLICATION_CREDENTIALS` | yes      | `/secrets/rbm-sa.json` | Path to service-account JSON                  |
| `WEBHOOK_CLIENT_TOKEN`           | yes      | (random hex)         | Shared secret validated on inbound webhook      |
| `LOG_LEVEL`                      | no       | `info`               | Pino level                                      |

`.env.example` committed; `.env` gitignored.

## 6. HTTP API (this service exposes)

All responses use a uniform error envelope on failure:
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {} } }
```

### 6.1 `POST /messages`
Send a message. Body is a discriminated union by `type`.

**Common fields:**
```json
{
  "to": "+15551234567",
  "trafficType": "TRANSACTION",
  "messageId": "uuid-optional",
  "ttl": "86400s"
}
```

**Variants:**

| `type`     | Additional fields                                                                  |
|------------|------------------------------------------------------------------------------------|
| `text`     | `text` (≤3072 chars), optional `suggestions[]`                                     |
| `richCard` | `card: { title?, description?, orientation, media?, suggestions? (≤4) }`           |
| `carousel` | `cards: [card, card, …]` (2–10), `cardWidth: MEDIUM\|NARROW`                       |
| `media`    | `media: { fileUrl, forceRefresh? }`                                                |

**Returns:** `202 Accepted` with `{ messageId, agentMessage: { name } }`.

**Errors:**
- `404 DEVICE_NOT_RCS_CAPABLE` — number doesn't support RCS.
- `400 VALIDATION_ERROR` — schema failure.
- `413 PAYLOAD_TOO_LARGE` — message exceeds 250 KB.

### 6.2 `GET /capability/:phone`
E.164 phone in path. Calls `phones:checkCapability`.

**Returns:** `{ phone, rcsEnabled: boolean, features: string[] }`.

### 6.3 `POST /files`
Multipart upload. Proxies to RBM `/upload/v1/files?agentId=…`.

**Returns:** `{ fileUrl, thumbnailUrl? }` — caller passes `fileUrl` back into `/messages`.

Size limits enforced: 100 MiB/file.

### 6.4 `POST /webhooks/rbm`
Inbound endpoint registered with the RBM agent.

- Verifies `clientToken` header equals `WEBHOOK_CLIENT_TOKEN`.
- Accepts event types: `DELIVERED`, `READ`, `TTL_EXPIRATION_REVOKED`, user `suggestionResponse`, user `text`, user `userFile`.
- Acks with `200 OK` within 5 s (RBM retries on non-2xx).
- Logs every event; for MVP, no persistence — just structured logs.

## 7. Constraints & Limits (from RBM)

- Message body ≤ **250 KB**
- Text ≤ **3,072 chars**
- Per file / combined attachments ≤ **100 MiB**
- Suggestions per list ≤ **11**; per rich card ≤ **4**
- Phone numbers: **E.164** (`+<country><number>`)
- `messageTrafficType` is **required** — default to `TRANSACTION` if caller omits

## 8. Validation Strategy

All inbound request bodies parsed with Zod. Schemas live in `src/schemas/` and export **both** the TS type (via `z.infer`) and the runtime parser. Outbound RBM calls use SDK types directly — do not re-wrap.

## 9. Error Handling

- Google SDK errors mapped to our envelope via a Fastify error hook.
- Retryable RBM errors (`429`, `5xx`) surface as `503` — the SDK handles one internal retry; we don't add a second layer.
- No retries on `400` / `404` — return immediately to caller.

## 10. Security

- Service-account JSON **never** in repo; mounted as file, path via env var.
- Webhook validated via `clientToken` shared secret in header (per RBM docs).
- No auth on outbound endpoints for MVP (service is internal-only). If exposed publicly later, add API-key middleware — not in scope now.
- CORS disabled (server-to-server only).

## 11. Logging

- Pino JSON logs, one line per request, correlation via `x-request-id`.
- Every `/messages` call logs `{ to (masked: last-4), type, bytes, agentMessageName }`.
- Every webhook event logs `{ eventType, messageId, phone (masked) }`.

## 12. Milestones

| # | Milestone         | Exit criteria                                                                          |
|---|-------------------|----------------------------------------------------------------------------------------|
| 1 | Scaffold + config | `npm run dev` boots; `/health` returns 200; env validated at startup                   |
| 2 | RBM client wrapper| Can send a plain text to a test device; returns `agentMessage.name`                    |
| 3 | Rich messages     | Rich card, carousel, media-by-URL all delivered to test device                         |
| 4 | Suggestions       | Reply + at least dial, openUrl, viewLocation chips rendered on device                  |
| 5 | Capability check  | `/capability/:phone` returns correct boolean for RCS and non-RCS numbers               |
| 6 | File upload       | Upload a JPEG via `/files`; use returned `fileUrl` in a media send                     |
| 7 | Webhook receiver  | `DELIVERED` + `READ` + user-reply events logged end-to-end with a tunnel               |
| 8 | Tests + README    | ≥ 80% route coverage; README documents setup + curl examples                           |

## 13. Manual Verification Plan

Run against a real RBM agent in test mode with a whitelisted device.

1. `curl POST /capability/+15551234567` → expect `rcsEnabled: true`.
2. `curl POST /messages` with each `type` variant; visually confirm on device.
3. `curl POST /files` with a 2 MB JPEG; then send a `media` message with the returned URL.
4. Open rich card → tap a reply chip → confirm webhook receives `suggestionResponse`.
5. Send, then observe `DELIVERED` then `READ` in webhook logs.
6. Send a message with TTL `60s` to an offline device; observe `TTL_EXPIRATION_REVOKED`.

## 14. Open Questions

- Which region (`us`, `europe`, `asia`) is the agent provisioned in? Affects endpoint host.
- Is there a preferred tunneling tool for webhook dev (ngrok, cloudflared, Tailscale Funnel)?
- Should the webhook eventually persist events to a database, or stay log-only? (Out of MVP, but affects milestone 7 design.)

## 15. Not Doing (explicit non-goals)

- No message persistence / history endpoint.
- No UI.
- No SMS fallback.
- No multi-agent / multi-tenant support.
- No rate-limiting on our inbound API (service assumed internal).
- No Pub/Sub path — HTTPS webhook only.
