# Berkshire RAG

A small RAG (Retrieval-Augmented Generation) demo built on Mastra + Next.js.

## Overview

This repository provides a retrieval-augmented generation (RAG) example using Mastra tooling, OpenAI-compatible models, and a Next.js frontend. It includes ingestion scripts to build a vector store from documents and a simple app/API to query the RAG system.

## Features

- Ingest documents into a vector store (see `scripts/ingest.ts`).
- API route for chat interaction at `src/app/api/chat/route.ts`.
- Agents, tools, and workflows implemented under `src/mastra`.
- Uses Mastra CLI for running and building the app.

## Prerequisites

- Node.js >= 22.13.0 (see `package.json` engines).
- npm or another package manager.
- An OpenAI-compatible API key (or other model provider configured via env).

## Quickstart

1. Install dependencies:

```bash
npm install
```

2. Create a .env file in the project root and set the required environment variables, for example:

```text
OPENAI_API_KEY=sk-...
DATABASE_URL=postgres://user:pass@host:port/db
# any other variables your deployment requires
```

3. Run the development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
npm run start
```

5. Ingest documents (if you want to populate the vector store):

```bash
npx tsx scripts/ingest.ts
```

Note: ingestion uses TypeScript script under `scripts/` — `tsx` is included as a dev dependency so `npx tsx` works without global install.

## Project Structure

- `src/app/` — Next.js app routes and pages.
- `src/components/` — React components (e.g., chat UI).
- `src/lib/` — helpers such as `vector-store.ts`.
- `src/mastra/` — Mastra agents, tools, scorers, and workflows.
- `scripts/` — utility scripts such as `ingest.ts`.
- `documents/` — place source documents to ingest into the vector store.

## Scripts

- `npm run dev` — starts the app in development mode (uses `mastra dev`).
- `npm run build` — builds the app (uses `mastra build`).
- `npm run start` — starts the production server (uses `mastra start`).

## Notes

- The repository uses Mastra tooling (`mastra` dependency) and expects a compatible runtime.
- If you use a different vector store or model provider, update `src/lib/vector-store.ts` and the Mastra configuration accordingly.

## Contributing

If you'd like to contribute, open an issue or submit a pull request. Please include a short description of the change and any relevant testing steps.

## License

