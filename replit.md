# LRSTORE LiveChat Admin

An AI-powered live chat system for LRSTORE (lrstore.id) — an Indonesian gaming topup store. Includes an admin dashboard, embeddable chat widget, and smart AI assistant powered by OpenAI GPT.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `GROQ_API_KEY` — Groq API key (gratis di console.groq.com)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (`artifacts/api-server`)
- Admin UI: React + Vite + shadcn UI + wouter routing (`artifacts/livechat-admin`)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- AI: OpenAI via `lib/integrations-openai-ai-server`

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/` — DB schema: conversations, messages, widget_sites, admin_settings
- `artifacts/api-server/src/routes/` — Express route handlers (admin, chat, widget, openai, health)
- `artifacts/api-server/src/widget/` — Widget HTML template and loader JS
- `artifacts/livechat-admin/src/pages/` — Admin dashboard pages
- `lib/integrations-openai-ai-server/src/client.ts` — OpenAI client (uses OPENAI_API_KEY)

## Architecture decisions

- **In-memory chat sessions**: widget chat sessions stored in a `Map` keyed by `sessionId` (resets on server restart). Acceptable for MVP; add Redis for persistence.
- **Token-based widget auth**: each embedded site gets a unique `widgetToken`. Widget sessions are validated against the DB on creation.
- **Streaming AI responses**: both admin and widget chat use SSE streaming for real-time responses.
- **Single admin settings row**: `admin_settings` table always has exactly one row (created on first access). AI system prompt, welcome message, and business info are editable from the Settings page.
- **AI provider fallback chain**: `lib/integrations-openai-ai-server` tries: Replit AI Integration → Groq (`GROQ_API_KEY`) → OpenAI (`OPENAI_API_KEY`). Current active: **Groq** (`llama-3.3-70b-versatile`, gratis).

## Product

- **Admin Dashboard** (`/`): Stats overview — total conversations, messages, active widget sites, today's activity
- **Conversations** (`/conversations`, `/conversations/:id`): View all chat logs, full message thread per conversation
- **Widget Sites** (`/widget-sites`): Add sites, get embed code, regenerate tokens, toggle active/inactive
- **Widget Preview** (`/widget-preview`): Live preview of the chat widget iframe
- **Settings** (`/settings`): Configure AI system prompt, business name/description, welcome message
- **Chat Widget** (`/api/widget?token=TOKEN`): Embeddable chat UI served by the API server
- **Widget Loader** (`/api/widget.js`): Script tag embed for external sites

## Embed code

```html
<script src="https://YOUR_DOMAIN/api/widget.js" data-token="YOUR_WIDGET_TOKEN"></script>
```

## User preferences

- Responds in Bahasa Indonesia for customer-facing AI interactions
- AI model: `llama-3.3-70b-versatile` via Groq (gratis, cepat). Fallback: `gpt-4o` jika pakai OpenAI.

## Gotchas

- Frontend forms must use `zod` (not `zod/v4`) with `zodResolver` — zod v4 schema types are incompatible with `@hookform/resolvers/zod`
- `lib/integrations-openai-ai-server` template files (`audio/client.ts`, `image/client.ts`, `client.ts`) all require the API key fallback patch — they originally only accepted the Replit integration env vars
- Widget HTML/JS are served as static files from `artifacts/api-server/src/widget/` — these are NOT bundled (served via `fs.readFileSync` at runtime)
- Chat sessions use in-memory Map — deploying to production with multiple instances would lose session state

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
