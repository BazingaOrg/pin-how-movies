# Repository Guidelines

## 🔍 Project Structure & Modules

- **src/app**: App Router entrypoint plus layout and animated search page; keep route logic colocated.

- **src/components**: Reusable UI built with shadcn/ui; document new widgets to preserve visual parity.

- **src/hooks & src/lib**: Shared data and utility layers; import via the `@/*` alias to avoid brittle relative paths.

- **public**: Fonts and static assets; place new media here and reference with `next/image` for automatic optimization.

## 🚀 Build, Test & Development Commands

- `npm run dev`: Starts the Next.js 14 dev server with hot reload; load TMDB env vars via `.env.local` first.

- `npm run build`: Compiles the production bundle; resolve type or lint failures before review.

- `npm run start`: Serves the optimized output of `next build`; use for pre-deploy smoke checks.

- `npm run lint`: Runs `next lint` with project rules; treat warnings as blockers unless justified.

- `node test-api-key.js`: Verifies TMDB credentials before UI debugging.

## 🎨 Coding Style & Naming Conventions

- TypeScript strict mode is enforced; annotate public exports explicitly and rely on inference internally.

- Follow 2-space indentation, single quotes, trailing commas, and prefer functional React components.

- Group Tailwind utilities by layout → spacing → color; extract repeated sets into class-variance-authority variants.

- ESLint (`next/core-web-vitals`, `next/typescript`) is canonical; avoid inline disables without reviewer agreement.

## 🧪 Testing Guidelines

- No automated suite ships yet; manually validate the search flow on desktop and mobile after every change.

- New tests should live under `src/__tests__` with React Testing Library and target search interactions plus API edge cases.

- Capture short GIFs or screenshots of animation states when reporting or fixing regressions.

## 📝 Commit & Pull Request Guidelines

- Use Conventional Commits (`feat:`, `fix:`, `chore:`) to keep history parseable and enable future changelog tooling.

- PRs must outline scope, local checks (`npm run lint`, `npm run build` when relevant), and include UI evidence for visual changes.

- Limit each PR to one concern and call out affected files to focus reviewer attention.

## 🔐 Security & Configuration Notes

- Keep TMDB credentials in `.env.local` and rotate compromised keys immediately; never commit secrets.

- Route all TMDB requests through helpers in `src/lib` so headers, localization, and retries stay consistent.

## 🔗 Reference Links

- Next.js App Router Docs: https://nextjs.org/docs/app

- shadcn/ui Usage Guide: https://ui.shadcn.com/docs

- TMDB API Overview: https://developer.themoviedb.org/reference/intro/getting-started
