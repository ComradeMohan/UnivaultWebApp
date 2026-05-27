# Univault — Firebase Studio Next.js Starter

Univault is a Next.js starter project scaffolded for Firebase hosting and related services. It provides a minimal, production-ready layout, authentication routes, and UI components for building educational or campus resource applications.

Quick pointers
- Source entry: [src/app/page.tsx](src/app/page.tsx#L1)
- Firebase config and providers: [src/firebase](src/firebase)
- Contexts: [src/context/SessionContext.tsx](src/context/SessionContext.tsx#L1)

Prerequisites
- Node.js 18+ (or the version required by Next.js in this project)
- npm, yarn, or pnpm
- A Firebase project with Authentication and Firestore (if you use those APIs)

Install

```bash
npm install
# or
# yarn
```

Local development

```bash
npm run dev
# Opens Next.js in development mode on http://localhost:3000
```

Build & production serve

```bash
npm run build
npm start
```

Firebase deployment (if using Firebase hosting)

1. Install and login to Firebase CLI: `npm i -g firebase-tools` then `firebase login`.
2. Initialize or link the project: `firebase init` (choose Hosting, Functions, Firestore as needed).
3. Deploy: `firebase deploy`.

Project structure (high level)

- `src/app/` — Next.js app routes and pages (App Router)
- `src/components/` — Reusable UI components and primitives
- `src/context/` — React contexts (session management)
- `src/firebase/` — Firebase client/provider/config helpers
- `src/lib/` — Utilities and helpers

Contributing

- Follow the existing code style (TypeScript + React + Tailwind).
- Run linting/tests (if available) before creating PRs.

Notes & troubleshooting
- If you add or update dependencies, scan for security issues in your CI or with your chosen scanner.
- This repo includes a Codacy instructions file; if you use Codacy MCP please run your analyzer after edits.

License

This project template does not include a license file. Add a license if you intend to publish or share.

Enjoy building!
