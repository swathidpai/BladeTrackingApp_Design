# WindAI Blade Repair Tracking

React 19 + Vite + Tailwind CSS v4 desktop web app.

## Development Server

```
pnpm install
pnpm dev
```

Runs on `$PORT` (default 3000).

## Key Files

- `src/App.tsx` - Main application component, owns state and view routing
- `src/data.ts` - Seed data, types, and constants
- `src/main.tsx` - React entry point
- `src/index.css` - Global styles, design tokens, and Tailwind CSS import
- `src/components/` - Layout, planner, resolve, modal, and shared UI components
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Vite configuration

## Styling

This project uses **Tailwind CSS v4** for styling. Use Tailwind utility classes directly in JSX. Tailwind is loaded via the Vite plugin — no PostCSS config needed. Design tokens (colours, fonts) are defined in the `@theme` block in `src/index.css`.
