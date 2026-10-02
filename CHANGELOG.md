# Changelog

All notable changes to Otakuteca. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [1.0.1] - 2026-10-02

### Fixed

- `vercel.json`: the SPA rewrite now sends every route to the app, so deep links (e.g.
  `/animes/<id>` or `/dashboard/generos`) resolve on reload instead of returning a 404.

### Added

- `README.md` with the project overview, stack and local setup.

## [1.0.0] - 2026-10-01

### Added

- **Public catalog** (feature `001-otakuteca-catalog`): Home with counters, Anime and Manga grids
  with full cards, work detail pages with shareable URLs, top 10 Ranking, Stats, Pending list and
  Roulette.
- **Filters** by Status and Favorites stored in the URL (`?estado=…&favoritos=1`), combinable, with
  a one-click "Ver todo" reset.
- **Admin panel** (hidden `/login` + `/dashboard`): create, edit and delete works, manage genres and
  edit the Ranking. `RequireAdmin` guard and translated error messages.
- **Form drafts** in `localStorage`: recovered if the session expires or the tab is closed.
- **Supabase** (Postgres + Auth + RLS): `0001_init.sql` migration with tables, normalization
  triggers, RLS policies (public read, write only for `admins`) and the `set_anime_ranking` RPC.
  `seed.sql` with test data for the local database only.
- Responsive public navigation with collapsible menu, empty and error states, fallback cover
  (`cover-fallback.svg`) and Spanish page titles.
- shadcn components: input, textarea, label, select, checkbox, badge, alert-dialog, toggle-group.
- `.env.example` and `CHANGELOG.md`.
- **Dashboard**: paginated works table with server-side filters, genre search, drag-and-drop Ranking
  editor, two-column work form and a hamburger menu on mobile.
- **UI polish**: redesigned Stats (summary tiles, status breakdown), Pending (compact cards),
  Roulette (spin animation), Ranking (podium), Catalog (status counts), Home (favorites, recent and
  shortcut sections), 404 and Login (icons, password toggle), plus an `ErrorState` with a retry
  button.

### Changed

- The home page no longer uses sample data: it now reads the catalog from Supabase.
- Animation variants and `useMotionSet` moved to `src/lib/motion.ts` and `src/hooks/`.
- Routing with `react-router`; the dashboard and login are loaded with `React.lazy` (separate
  chunks).
- `vercel.json`: `X-Robots-Tag: noindex, nofollow` for `/login` and `/dashboard/*`.
- `sitemap.xml` lists the public section routes.

### Dependencies

- `react-router`, `@supabase/supabase-js`.

### Pending

- Manual responsive visual review (T080) and production rollout (T083).
