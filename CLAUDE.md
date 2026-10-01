# CLAUDE.md

Este archivo guía a Claude Code (claude.ai/code) cuando trabaja con el código de este repositorio.

## Proyecto

Otakuteca: catálogo personal y público de anime y manga. Vista pública de solo lectura + panel
`/dashboard` protegido para el administrador. Se despliega en Vercel como SPA (`vercel.json`
reescribe todo a `index.html`).

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (sin `tailwind.config`; el tema vive en `src/styles/index.css`) + shadcn/ui
  (estilo `base-nova`, sobre `@base-ui/react`) + `framer-motion` + `lucide-react`
- Estado del servidor: **TanStack Query** (`@tanstack/react-query`); el cliente y sus defaults
  viven en `src/lib/api/queryClient.ts`.
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

## Estructura del código

- **App mínima**: `main.tsx` y `app/App.tsx` solo componen; los providers van en
  `app/providers/` y las rutas en `app/routes/` (un archivo por grupo: públicas, auth, dashboard).
- **Organización por dominio**, cada subcarpeta con su barril:
  - `components/{common,layout,table,works,ui}`
  - `hooks/{app,data}`
  - `lib/{api,catalog,routing,ui,works}`
  - `pages/{public,auth,dashboard}`
- **Archivos pequeños**: todo lo que se pueda separar en archivos más chicos se separa (un
  componente por archivo; tipos, constantes, datos, variantes de animación y hooks en sus propios
  archivos). Separar en archivos no es lo mismo que abstraer: la constitución prohíbe crear
  componentes, hooks o abstracciones "por si acaso" (solo con ≥ 2 usos reales), pero no limita
  dividir el código existente en módulos.
- **Barriles**: cada carpeta expone su API pública con un `index.ts`
  (`export { X } from './X'`) y se importa desde el barril, no desde el archivo interno:
  `import { Home } from '@/pages'`, `import { Button } from '@/components/ui'`,
  `import { cn } from '@/lib'`. Los barriles de nivel superior hacen `export *` de sus
  subcarpetas. Al crear un archivo nuevo, agregarlo a su barril.
- **Carga lazy**: `pages/index.ts` solo expone `public`; `auth` y `dashboard` se importan lazy
  desde su propia carpeta (`app/routes/lazyPages.ts`).

## Convenciones de código

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
- **Tablas del dashboard**: todo listado con muchos datos va en una tabla paginada del lado del
  servidor (Supabase `range` + `count: 'exact'`) con TanStack Query. 10 filas por página por
  defecto, ampliable hasta 100 (`DEFAULT_PAGE_SIZE`, `PAGE_SIZE_OPTIONS` y `pageRange` en
  `src/lib/api/pagination.ts`). Los controles van arriba (`PaginationBar`) y el "Mostrando x–y de
  N" abajo (`PaginationSummary`). Las mutaciones invalidan la `queryKey` del listado.
- **Páginas del dashboard**: todas se ven iguales. (1) Encabezado con `PageHeader` (título +
  descripción de lo que hace la página). (2) Contenido centrado (`mx-auto max-w-3xl`, o `max-w-5xl`
  si hay tabla ancha). (3) Todo botón lleva ícono + texto + tooltip con `TooltipHint`; el
  `cursor: pointer` de los botones es una regla global en `src/styles/index.css`. Los listados
  vacíos o sin resultados usan `PanelEmptyState`, no `EmptyState`.

## Reglas generales

Siempre:

- usar `pnpm`
- preservar la arquitectura existente
- mantener los cambios lo más chicos posible
- reutilizar los componentes existentes antes de crear nuevos
- explicar las decisiones de arquitectura cuando se introduce una abstracción
- mantener cada commit enfocado en una sola responsabilidad

Nunca:

- usar `npm` ni `yarn`
- introducir dependencias innecesarias
- refactorizar código no relacionado
- modificar la configuración de Prettier/ESLint salvo que se pida
- desactivar reglas de lint para silenciar errores
- introducir estado global salvo que sea necesario
- usar default exports
- usar `any` sin una justificación explícita

## Idioma

- **Interfaz de usuario** (textos, botones, errores, metadatos): **español de Argentina con
  voseo** ("mirá", "filtrá") y con tono personal, no corporativo.
- **Código y nombres técnicos**: en inglés.
- **Commits**: en inglés (ver la sección Git).
- **Documentación del repo** (este archivo, `specs/`): en español.

## Git

Commits en **inglés**, siguiendo [Conventional Commits](https://www.conventionalcommits.org/) y
**atómicos**: un commit = un cambio lógico que compila y pasa `pnpm lint` por sí solo.

- Formato: `<tipo>(<alcance opcional>): <descripción>`; descripción en imperativo, minúscula, sin
  punto final y de hasta ~72 caracteres. Ejemplo: `feat(dashboard): add paginated works table`.
- Tipos: `feat`, `fix`, `refactor`, `build`, `docs`, `style`, `test`, `chore`.
- No mezclar en un mismo commit refactors, features y arreglos; separar también los cambios de
  dependencias (`build`) y de documentación (`docs`).
- Si hace falta contexto, explicarlo en el cuerpo del commit (el porqué, no el qué).
- No formatear ni tocar archivos ajenos al cambio (p. ej. `pnpm format` sobre todo el repo
  reescribe `.claude/`, `.specify/` y `specs/`).

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
  `src/lib/works/types.ts`.
- Un `update` filtrado por RLS puede afectar 0 filas sin error: tratarlo como sesión inválida.

## Spec Kit y constitución

El proyecto usa GitHub Spec Kit: cada feature pasa por spec → plan → tasks → implement (skills
`speckit-*`) y vive en `specs/<NNN-feature>/`, en una rama con el mismo nombre. La constitución
`.specify/memory/constitution.md` prevalece sobre cualquier otra práctica; sus puntos clave:

- MVP: elegir siempre la opción más simple; justificar cualquier dependencia nueva.
- Carga de datos 100 % manual: **no** integrar APIs externas de catálogo (MyAnimeList, AniList,
  Kitsu…) ni traer portadas/metadatos automáticamente.
- Cada funcionalidad debe poder validarse haciendo clics en la web, sin leer código.

### Flujo de trabajo

- Antes de ejecutar `/speckit.specify`, ejecutar SIEMPRE primero el hook `before_specify` (skill
  `speckit-git-feature`) para crear la rama de la feature, y esperar su resultado antes de crear
  la spec.
- Tras completar `/speckit.specify`, verificar con `git branch --show-current` que estamos en la
  rama `NNN-nombre-feature` y no en `main`. Si no es así, avisar antes de continuar.
- Al ejecutar `/speckit.plan`, incluir SIEMPRE en `plan.md`, como último paso de la fase final, un
  paso de mantenimiento: "Actualizar `CLAUDE.md` con las decisiones de diseño y convenciones
  nuevas de esta feature, una línea por decisión, con referencia a la spec (p. ej. '[003] ...').
  No incluir entradas por incluir: solo información transversal y relevante para el proyecto que
  puedan aprovechar futuras features."

### Ciclo de vida de las specs

- Estados válidos: Draft, En curso, Publicada, Prevista, Sustituye a `<spec>`.
- Al cerrar una spec, actualizar su campo `Status` en `spec.md` y reflejar el cambio en
  `specs/README.md`.
