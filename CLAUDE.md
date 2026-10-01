# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Otakuteca: catálogo personal y público de anime y manga. Vista pública de solo lectura + panel
`/dashboard` protegido para el administrador. Se despliega en Vercel como SPA (`vercel.json`
reescribe todo a `index.html`).

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (sin `tailwind.config`; el tema vive en `src/styles/index.css`) + shadcn/ui
  (estilo `base-nova`, sobre `@base-ui/react`) + `framer-motion` + `lucide-react`
- Base de datos, auth y seguridad: **Supabase** (Postgres + Supabase Auth + RLS) vía
  `@supabase/supabase-js` v2. No hay backend propio ni funciones serverless.

## Comandos

Usar **siempre `pnpm`** (nunca npm ni yarn).

```bash
pnpm install
pnpm dev            # servidor de desarrollo de Vite
pnpm build          # tsc -b && vite build (el type-check forma parte del build)
pnpm lint           # eslint .
pnpm lint:fix
pnpm format         # prettier --write .
pnpm format:check
pnpm preview
pnpm dlx shadcn@latest add <componente>   # agregar componentes de shadcn
```

No hay framework de tests en v1 (decisión R14 en `specs/001-otakuteca-catalog/research.md`). Una
feature se cierra con `pnpm lint`, `pnpm build` y una verificación manual en el navegador.

## Convenciones de código

- **Archivos pequeños**: todo lo que se pueda separar en archivos más chicos se separa (un
  componente por archivo; tipos, constantes, datos, variantes de animación y hooks en sus propios
  archivos). Separar en archivos no es lo mismo que abstraer: la constitución prohíbe crear
  componentes, hooks o abstracciones "por si acaso" (solo con ≥ 2 usos reales), pero no limita
  dividir el código existente en módulos.
- **Barriles**: cada carpeta expone su API pública con un `index.ts`
  (`export { X } from './X'`) y se importa desde el barril, no desde el archivo interno:
  `import { Home } from '@/pages'`, `import { Button } from '@/components/ui'`,
  `import { cn } from '@/lib'`. Al crear un archivo nuevo, agregarlo a su barril.
- Alias `@/` → `src/`. Named exports (no default exports) para componentes.
- Prettier: sin punto y coma, comillas simples (también en JSX), `printWidth` 100. Ordena los
  imports (builtins → terceros → `@/` → relativos) y las clases de Tailwind (también dentro de
  `cn`, `cva`, `clsx`).
- TS en modo `verbatimModuleSyntax` + `erasableSyntaxOnly`: usar `import type` / `type` inline
  para tipos y no usar `enum` ni `namespace` (usar uniones de strings y objetos `as const`).
- `src/components/ui/` contiene componentes generados por shadcn y está excluido de ESLint; no
  editarlos a mano salvo necesidad.
- Colores: usar la paleta propia definida en `@theme` de `src/styles/index.css` (`bg-noche`,
  `text-sakura`, `text-dorado`, `text-cian`, `text-lavanda`, `text-niebla`, …) en lugar de colores
  arbitrarios.
- Animaciones con `framer-motion` respetando `useReducedMotion` (hay un set de variantes `full` y
  otro `reduced`).

## Idioma

Todo lo que ve el usuario (textos, botones, errores, metadatos) va en **español de Argentina con
voseo** ("mirá", "filtrá") y con tono personal, no corporativo. Código y nombres técnicos pueden ir
en inglés.

## Supabase

- Desarrollo y validación contra **Supabase local** (Docker): `pnpm dlx supabase start` aplica
  `supabase/migrations/` y `supabase/seed.sql`; `pnpm dlx supabase db reset` vuelve al estado
  inicial (borra también los usuarios locales). La CLI no se agrega a `package.json`. El seed
  **nunca** se ejecuta en producción, que solo recibe la migración y el catálogo real cargado a mano.
- Variables en `.env.local` (fuera de git), con los valores **locales**: `VITE_SUPABASE_URL` y
  `VITE_SUPABASE_PUBLISHABLE_KEY`. Los de producción van solo en Vercel. Solo la clave pública va
  al cliente; nunca la service role.
- La seguridad se garantiza con **RLS** en la base, no ocultando botones: lectura pública
  (anónima) y escritura solo para usuarios presentes en la tabla `admins` (función `is_admin()`).
- Migraciones SQL en `supabase/migrations/` (p. ej. `0001_init.sql`). El modelo (`works`,
  `genres`, `work_genres`, `admins`, enums `work_type`/`work_status`, RPC `set_anime_ranking`)
  está documentado en `specs/001-otakuteca-catalog/data-model.md`; los tipos de cliente van en
  `src/lib/types.ts`.
- Un `update` filtrado por RLS puede afectar 0 filas sin error: tratarlo como sesión inválida.

## Spec Kit y constitución

El proyecto usa GitHub Spec Kit: cada feature pasa por spec → plan → tasks → implement (skills
`speckit-*`) y vive en `specs/<NNN-feature>/`, en una rama con el mismo nombre. La constitución
`.specify/memory/constitution.md` prevalece sobre cualquier otra práctica; sus puntos clave:

- MVP: elegir siempre la opción más simple; justificar cualquier dependencia nueva.
- Carga de datos 100 % manual: **no** integrar APIs externas de catálogo (MyAnimeList, AniList,
  Kitsu…) ni traer portadas/metadatos automáticamente.
- Cada funcionalidad debe poder validarse haciendo clics en la web, sin leer código.
