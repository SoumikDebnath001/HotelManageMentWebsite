# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint (flat config in `eslint.config.js`)

There is no test suite configured in this project.

## Environment

- `VITE_API_BASE_URL` is read from `.env` and used as the axios `baseURL` (see `src/Services/axios.js`).

## Architecture

Vite + React 19 SPA, restructured around a **feature-based layout**: domain-specific code (API calls, components, pages tied to one feature) lives under `src/Features/<Domain>/`, while `src/Components/` holds feature-agnostic shared UI (`UI/` primitives, `Layout/` chrome, `Common/` patterns). Folder names are PascalCase throughout, matching the project's existing convention. Only `Features/Auth`, `Components/Layout/Navbar`, `Services/`, and `Pages/` are populated right now — everything else (`Components/UI/*`, `Features/Rooms`, `Features/Booking`, `Routes/`, `Hooks/`, `Context/`, `Store/`, `Utils/`, `Lib/`, `Styles/`, etc.) is scaffolded as empty directories, intentionally left for future work rather than filled with placeholder code.

Routing is `react-router-dom` v7 with a single `BrowserRouter` in `src/App.jsx`, which also mounts one global `<Toaster />` (react-hot-toast) alongside the routes (routes are still defined inline in `App.jsx` — not yet extracted into `Routes/AppRoutes.jsx`). Navigation is done imperatively with the `useNavigate` hook rather than `<Link>` components.

Styling is Tailwind CSS v4 via `@tailwindcss/vite` (configured in `vite.config.js`, entry point `@import "tailwindcss"` in `src/index.css` — not yet split into `Styles/`). Utility classes are used directly in JSX — there are no per-component CSS files. The brand palette and serif logo font are defined once as Tailwind v4 `@theme` tokens in `src/index.css` (`--color-ink`, `--color-accent`, `--color-accent-dark`, `--color-hairline`, `--color-accent-soft`, `--font-serif`) and consumed as regular utilities (`text-ink`, `bg-accent`, `font-serif`, etc.) — extend that block instead of hardcoding brand hex values in components. The Google Fonts (`Playfair Display` / `Cormorant Garamond`) are loaded via `<link>` tags in `index.html`, not a CSS `@import`.

### API layer (`src/Services/`)

All backend calls go through this folder, split into three responsibilities:

- `axios.js` — the shared `axiosInstance`. Base URL comes from `VITE_API_BASE_URL`. A request interceptor attaches the `Authorization` header from `localStorage.getItem("token")` when present.
- `apiHandler.js` — `handleApiRequest(apiCall)`, a wrapper that executes an axios call and **never throws**. It always resolves to `{ data, error }`, translating server errors, network errors, and unexpected errors into a single `error` string (or `null` on success).
- `*.service.js` (e.g. `auth.service.js`) — one file per domain, exporting thin async functions that call `axiosInstance` through `handleApiRequest`:
  ```js
  export const loginSuperAdmin = async (data) => {
    return handleApiRequest(() => axiosInstance.post(`superadmin/login`, data));
  };
  ```
  Add new endpoints by extending a `*.service.js` file in this pattern — never call `axiosInstance` directly from components. Feature folders (`Features/<Domain>/Api/`) are reserved for feature-specific query/mutation wrappers around these services if that indirection is ever needed — today, feature components import straight from `Services/*.service.js`.

Components consume services by awaiting `{ data, error }`, showing `error` via `toast.error(error)`, and otherwise checking `data?.status` before treating the call as successful (`data?.status` is the API's own success flag, distinct from the `error` returned by the wrapper).

### Pages and Components

- `src/Pages/` — top-level, feature-agnostic routes (`HomePage.jsx`, `About.jsx`, `Services.jsx`).
- `src/Features/Auth/Components/` — auth-specific form components (`LoginForm.jsx`, `SigninForm.jsx`). Forms own their own `useState` form state, submit handling, and API calls.
- `src/Features/Auth/Pages/AdminLogin.jsx` — the admin login route (`/admin/auth`), renders `LoginForm`.
- `src/Components/Layout/Navbar/Navbar.jsx` — the public-site navbar (sticky, blurs + shadows past 20px scroll, mobile drawer via `framer-motion`, icons via `react-icons`). Mounted at the top of `Pages/HomePage.jsx`; not used on `AdminLogin`.

### Admin auth (2FA)

`AdminLogin` (route `/admin/auth`) renders `LoginForm`, which is a two-step state machine (`step: "credentials" | "otp"`), not two components:

1. **Credentials step** — email + password submit to `loginSuperAdmin` (`POST superadmin/login`). A successful response means *the OTP was sent*, not that the admin is logged in — no token is issued yet.
2. **OTP step** — the 6-digit code submits to `verifySuperAdminOtp` (`POST superadmin/verify-otp`) with `{ email, otp }`. Only this step's success response carries the `token` that gets written to `localStorage`. Resend re-calls `loginSuperAdmin` and is throttled by a 60s client-side cooldown (`RESEND_COOLDOWN_SECONDS` in `LoginForm.jsx`) — the backend is not asked to enforce this separately.

Signup is intentionally not wired up right now — `SigninForm.jsx` in `Features/Auth/Components/` still exists but is unused/orphaned, kept for when signup comes back.
