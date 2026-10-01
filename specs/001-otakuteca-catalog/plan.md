# Implementation Plan: Otakuteca v1 — Catálogo público de anime y manga

**Branch**: `001-otakuteca-catalog` | **Date**: 2026-10-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-otakuteca-catalog/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Convertir la SPA actual (una sola página `Home.tsx` con datos de ejemplo) en un sitio multipágina
con un catálogo real de anime y manga. Las secciones públicas son Inicio, Animes, Mangas, Ranking,
Estadísticas, Pendientes, Ruleta y el detalle de cada obra, de solo lectura. El panel privado
`/dashboard` se usa para cargar, editar y eliminar obras, mantener la lista de géneros y armar el
Ranking, y se entra por `/login`, que no está enlazado en ningún lado.

Enfoque técnico ([research.md](./research.md)): **Supabase** (Postgres + Auth + RLS) consumido
directo desde el cliente y **React Router** para el enrutamiento. La seguridad y las reglas de
negocio críticas (unicidad título + tipo, progreso ≤ total, Ranking único 1–10, solo el admin
escribe) se garantizan en la base con restricciones, triggers y políticas RLS. El cliente trae el
catálogo completo (≤ 200 obras) en cada página y deriva en memoria los filtros, las estadísticas,
el Ranking, los pendientes y la Ruleta. Los gráficos se hacen con Tailwind y framer-motion, sin
librerías nuevas.

## Technical Context

**Language/Version**: TypeScript ~6.0, React 19.2

**Primary Dependencies**: Vite 8, Tailwind CSS 4, shadcn/ui (`@base-ui/react`), framer-motion,
lucide-react (existentes). Nuevas: `react-router` 7 (modo declarativo) y `@supabase/supabase-js`
2. Las razones están en [research.md](./research.md#resumen-de-dependencias-nuevas).

**Storage**: Supabase Postgres (tablas `works`, `genres`, `work_genres`, `admins`; RLS; RPC
`set_anime_ranking`). Ver [data-model.md](./data-model.md). La migración está versionada en
`supabase/migrations/`.

**Testing**: sin framework automatizado en v1 (R14). Verificación con `pnpm lint`, `pnpm build`,
los escenarios manuales V1–V10 de [quickstart.md](./quickstart.md) y los chequeos de RLS con `curl`.

**Target Platform**: navegadores modernos, desde celular (375 px) hasta escritorio. Hosting
estático en Vercel (`vercel.json` ya tiene la reescritura SPA) y Supabase como backend gestionado.

**Project Type**: aplicación web SPA + backend como servicio (sin servidor propio).

**Performance Goals**: Inicio visible en < 3 s en el primer acceso (SC-001); filtrar/limpiar en
< 1 s con 200 obras (SC-003). El panel y el login se cargan con `React.lazy` para no pesar en el
bundle público.

**Constraints**: carga 100 % manual (sin APIs de catálogo ni subida de imágenes); secretos solo
en variables de entorno; todo el texto visible en español de Argentina con voseo; sin paginación
ni búsqueda por texto; ningún enlace público a `/login` o `/dashboard`.

**Scale/Scope**: ≤ 200 obras, ≤ ~50 géneros, 1 administrador; 9 rutas públicas + `/login` + 5
rutas de `/dashboard`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Gate | Pre-research | Post-design |
|-----------|------|--------------|-------------|
| **I. Simplicidad MVP** | Opción más directa; enrutamiento limpio; abstracción solo con ≥ 2 usos | ✅ | ✅ Sin servidor propio (Supabase directo). React Router declarativo con rutas planas y predecibles. Sin TanStack Query, sin form libs, sin librería de gráficos. Componentes compartidos solo con ≥ 2 usos reales (ver Project Structure). Un hook de datos (`useCatalog`) usado en todas las páginas |
| **II. Idioma y tono** | Todo lo visible en es-AR con voseo, tono personal | ✅ | ✅ Rutas (`/estadisticas`, `/pendientes`, `/ruleta`), etiquetas, estados vacíos y errores están definidos con voseo en [contracts/routes.md](./contracts/routes.md) y [contracts/data-access.md](./contracts/data-access.md). Código en inglés |
| **III. Cero alcance fantasma** | Sin APIs externas de catálogo ni automatizaciones | ✅ | ✅ Portadas como URL pegada a mano; fallback local. Sin MAL/AniList/Kitsu. Búsqueda, ranking de mangas y subida de imágenes quedan fuera |
| **IV. Verificable por no técnicos** | UI autoexplicativa; validable con clics | ✅ | ✅ Los filtros viven en la URL (Atrás funciona) y hay botón "Ver todo". Hay estados vacíos explícitos. [quickstart.md](./quickstart.md) valida cada historia con clics (V1–V10) |
| **V. Seguridad por defecto** | Público solo lectura; panel autenticado; secretos fuera del repo; protección en servidor | ✅ | ✅ RLS con `is_admin()` en todas las escrituras y registro desactivado. Tabla `admins` invisible. El guard de cliente es solo UX. `.env.local` está ignorado y hay `.env.example` sin valores. Clave secret nunca en el cliente. `noindex` en rutas privadas. Las escrituras anónimas se verifican con `curl` |
| **Restricciones técnicas** | Stack React + TS + Vite + Tailwind + shadcn en Vercel; cada dependencia nueva justificada | ✅ | ✅ El stack se mantiene. Las 2 dependencias nuevas están justificadas en [research.md](./research.md#resumen-de-dependencias-nuevas). Los componentes shadcn nuevos usan `@base-ui/react`, que ya está instalado |
| **Flujo de trabajo** | spec → plan → tareas; cierre con lint, build y verificación manual | ✅ | ✅ El cierre está definido en [quickstart.md](./quickstart.md#cierre-de-la-feature-constitución-flujo-de-trabajo) |

**Resultado**: pasa sin violaciones. No hace falta Complexity Tracking.

**Nota sobre el código existente**: `src/pages/Home.tsx` tiene un botón "Agregar anime" y un
buscador por texto. Los dos contradicen FR-019 y el alcance (sin búsqueda), así que se eliminan al
reescribir el Inicio. Se reaprovechan la paleta, el header, las variantes de animación y el
`Counter`.

## Project Structure

### Documentation (this feature)

```text
specs/001-otakuteca-catalog/
├── plan.md              # Este archivo
├── research.md          # Phase 0: decisiones R1–R15
├── data-model.md        # Phase 1: esquema, RLS, RPC, valores derivados
├── quickstart.md        # Phase 1: setup + escenarios de validación V1–V10
├── contracts/
│   ├── routes.md        # Rutas, guard, filtros, textos de UI
│   └── data-access.md   # Operaciones Supabase, errores y su traducción
├── checklists/
│   └── requirements.md  # (de /speckit-specify)
└── tasks.md             # Phase 2 (/speckit-tasks; no lo crea este comando)
```

### Source Code (repository root)

```text
supabase/
└── migrations/
    └── 0001_init.sql            # enums, tablas, checks, índices, trigger, is_admin(), RLS, RPC

public/
├── cover-fallback.svg           # NUEVO: portada de reemplazo con la marca
└── sitemap.xml                  # AMPLIAR: rutas públicas de sección

src/
├── main.tsx                     # monta <BrowserRouter>
├── App.tsx                      # REESCRIBIR: <Routes> públicas, /login y /dashboard (lazy)
├── lib/
│   ├── utils.ts                 # existente (cn)
│   ├── supabase.ts              # cliente único (env vars)
│   ├── types.ts                 # Work, Genre, WorkType, WorkStatus
│   ├── catalog.ts               # derivados puros: etiquetas, orden, filtros, stats, ranking, ruleta
│   ├── validation.ts            # validateWork() + traducción de errores de Postgres
│   └── drafts.ts                # borradores del formulario en localStorage (FR-015)
├── hooks/
│   ├── useCatalog.ts            # R-1: trae el catálogo al montar; loading/error
│   └── useSession.ts            # sesión Supabase + is_admin
├── components/
│   ├── ui/                      # shadcn: button (existe) + input, textarea, label, select,
│   │                            #   checkbox, badge, alert-dialog, toggle-group
│   ├── PublicLayout.tsx         # header + menú + footer (sale de Home.tsx actual)
│   ├── DashboardLayout.tsx      # navegación del panel + cerrar sesión
│   ├── RequireAdmin.tsx         # guard de /dashboard/*
│   ├── WorkCard.tsx             # Animes, Mangas, Pendientes
│   ├── WorkDetail.tsx           # página de detalle + resultado de Ruleta
│   ├── CoverImage.tsx           # tarjeta, detalle, ranking, preview del form (fallback)
│   ├── ProgressBar.tsx          # tarjeta + detalle
│   ├── StarRating.tsx           # tarjeta, detalle, ranking (+ variante input en form)
│   ├── StatusBadge.tsx          # tarjeta, detalle, listado del panel
│   ├── EmptyState.tsx           # secciones, filtros, ranking, gráficos, ruleta
│   ├── BarChart.tsx             # 3 gráficos de Estadísticas
│   └── WorkForm.tsx             # alta + edición
└── pages/
    ├── Home.tsx                 # REESCRIBIR: 3 contadores (FR-024)
    ├── CatalogPage.tsx          # /animes y /mangas (prop type) + filtros
    ├── WorkPage.tsx             # /animes/:id, /mangas/:id
    ├── RankingPage.tsx
    ├── StatsPage.tsx
    ├── PendingPage.tsx
    ├── RoulettePage.tsx
    ├── NotFoundPage.tsx
    ├── LoginPage.tsx
    └── dashboard/
        ├── DashboardHome.tsx    # listado + eliminar
        ├── WorkEditPage.tsx     # /dashboard/obras/nueva y /dashboard/obras/:id
        ├── GenresPage.tsx
        └── RankingEditorPage.tsx

.env.example                     # NUEVO: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
vercel.json                      # AMPLIAR: X-Robots-Tag noindex en /login y /dashboard/*
```

**Structure Decision**: un solo proyecto (SPA en la raíz, como hoy) y la carpeta `supabase/`
solo para la migración SQL versionada. No hay `backend/`: Supabase es el backend. Se respetan los
alias existentes de `components.json` (`@/components`, `@/lib`, `@/hooks`). Las carpetas siguen
el patrón actual (`pages/` con barrel `index.ts`, `components/ui/` para shadcn). Cada componente
fuera de `pages/` tiene al menos dos usos reales, anotados arriba (Principio I).

## Orden de implementación sugerido (para `/speckit-tasks`)

1. **Base**: migración SQL, setup de Supabase, env, cliente, tipos y router con layouts vacíos.
2. **US1 + US2 + US3 (P1, vista pública)**: `useCatalog`, `catalog.ts`, WorkCard, WorkDetail,
   CatalogPage con filtros, WorkPage, Inicio. Para el MVP mostrable se pueden cargar datos de
   prueba desde el SQL Editor.
3. **US4 + US5 (P1, acceso y alta)**: login, guard, panel, WorkForm (alta), géneros mínimos.
4. **US6 (P2)**: edición, baja con confirmación, borradores por sesión vencida.
5. **US7 (P2)**: favoritas y editor de Ranking (RPC) + RankingPage.
6. **US8 (P2)**: StatsPage + BarChart.
7. **US9 (P3)**: PendingPage + RoulettePage.
8. **Cierre**: `vercel.json`, sitemap, fallback de portada, lint, build y quickstart V1–V10.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Sin violaciones. Las dos dependencias nuevas no son excepciones a la Constitución, que solo exige
justificarlas: las razones están en [research.md](./research.md#resumen-de-dependencias-nuevas).
