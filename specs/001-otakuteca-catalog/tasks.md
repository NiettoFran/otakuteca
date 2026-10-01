---

description: "Lista de tareas para implementar Otakuteca v1"
---

# Tasks: Otakuteca v1 — Catálogo público de anime y manga

**Input**: Documentos de diseño en `/specs/001-otakuteca-catalog/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/routes.md](./contracts/routes.md),
[contracts/data-access.md](./contracts/data-access.md), [quickstart.md](./quickstart.md)

**Tests**: no se generan tareas de tests automatizados. No hay framework de tests en v1 (R14). Cada
historia se valida con `pnpm lint`, `pnpm build` y el escenario manual correspondiente de
[quickstart.md](./quickstart.md) (V1–V10).

**Organization**: las tareas se agrupan por historia de usuario para que cada una se implemente y
se valide por separado.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (archivo distinto y sin dependencias pendientes)
- **[Story]**: historia a la que pertenece (US1…US9)
- Cada tarea indica la ruta exacta del archivo

## Convenciones que aplican a todas las tareas

- **pnpm** siempre. Alias `@/` → `src/`. Named exports, sin default exports.
- **Barriles**: todo archivo nuevo se exporta desde el `index.ts` de su carpeta (`src/lib/index.ts`,
  `src/lib/catalog/index.ts`, `src/hooks/index.ts`, `src/components/index.ts`,
  `src/pages/index.ts`, `src/pages/dashboard/index.ts`) y se importa desde el barril.
  **Excepción**: `src/pages/index.ts` NO reexporta `LoginPage` ni nada de `src/pages/dashboard/`,
  para que el panel no entre en el bundle público (se cargan con `React.lazy`).
- **Archivos chicos**: un componente por archivo. Tipos, constantes, variantes de animación y hooks
  van en archivos propios. Por eso los "derivados puros" que el plan agrupa en
  `src/lib/catalog.ts` viven en la carpeta `src/lib/catalog/`, con un archivo por tema.
- TS con `verbatimModuleSyntax` y `erasableSyntaxOnly`: `import type`, sin `enum` ni `namespace`
  (uniones de strings y `as const`).
- Colores solo de la paleta `@theme` de `src/styles/index.css` (`bg-noche`, `text-sakura`,
  `text-dorado`, `text-cian`, `text-lavanda`, `text-niebla`…).
- Animaciones con `framer-motion`, con un set de variantes `full` y otro `reduced`
  (`useReducedMotion`).
- Todo texto visible en español de Argentina con voseo. Los textos exactos están en
  [contracts/routes.md](./contracts/routes.md) y [contracts/data-access.md](./contracts/data-access.md).
- `src/components/ui/` es generado por shadcn: no se edita a mano.

---

## Phase 1: Setup (infraestructura compartida)

**Purpose**: dependencias, componentes base y estructura de carpetas

- [ ] T001 Instalar las dependencias nuevas justificadas en research.md con `pnpm add react-router @supabase/supabase-js` (actualiza `package.json` y `pnpm-lock.yaml`)
- [ ] T002 [P] Agregar los componentes shadcn con `pnpm dlx shadcn@latest add input textarea label select checkbox badge alert-dialog toggle-group` y exportarlos desde `src/components/ui/index.ts`, siguiendo el patrón de `Button`
- [ ] T003 [P] Crear `.env.example` con `VITE_SUPABASE_URL=` y `VITE_SUPABASE_PUBLISHABLE_KEY=` sin valores, y confirmar que `.gitignore` ignora `.env.local` (patrón `*.local`)
- [ ] T004 [P] Crear las carpetas con sus barriles vacíos (`export {}`): `src/hooks/index.ts`, `src/components/index.ts`, `src/lib/catalog/index.ts` y `src/pages/dashboard/index.ts`. Reexportar `src/lib/catalog` desde `src/lib/index.ts`

---

## Phase 2: Foundational (prerrequisitos bloqueantes)

**Purpose**: base de datos, cliente, tipos, router y layout público. Ninguna historia puede empezar
sin esto.

**⚠️ CRITICAL**: completar esta fase antes de cualquier historia de usuario

### Base de datos (Supabase)

- [ ] T005 Escribir la primera parte de `supabase/migrations/0001_init.sql` según [data-model.md](./data-model.md): enums `work_type` (`anime`, `manga`) y `work_status` (`pending`, `in_progress`, `completed`, `dropped`); tablas `works`, `genres`, `work_genres` (PK compuesta, FKs `on delete cascade`, índice en `genre_id`) y `admins` (`user_id uuid` PK → `auth.users.id` `on delete cascade`); todos los `check` de `works` y `genres`; índices únicos `works_title_type_key on works (type, lower(btrim(title)))` y `genres_name_key on genres (lower(btrim(name)))`; `unique (ranking_position)`
- [ ] T006 Agregar a `supabase/migrations/0001_init.sql` la función trigger `works_before_write` (BEFORE INSERT OR UPDATE): `title := btrim(title)`; si `status = 'completed'` y `total_units` no es nulo, `progress := total_units`; si `is_favorite = false` o `type <> 'anime'`, `ranking_position := null`; `updated_at := now()` solo en `INSERT` o si cambió alguna columna además de `ranking_position` (comparar `to_jsonb(new) - 'ranking_position' - 'updated_at'` con `old`), para que guardar el Ranking no altere el orden de las grillas. Agregar también un trigger que haga `btrim(name)` en `genres`
- [ ] T007 Agregar a `supabase/migrations/0001_init.sql` la función `public.is_admin()` (`language sql stable security definer set search_path = ''`), `enable row level security` en las 4 tablas, políticas `select` para `anon` y `authenticated` en `works`, `genres` y `work_genres`, políticas `insert`/`update`/`delete` para `authenticated` con `is_admin()` (`using` y `with check`) en esas tres tablas, y ninguna política en `admins`. Hacer `grant execute` de `is_admin()` a `anon` y `authenticated`
- [ ] T008 Agregar a `supabase/migrations/0001_init.sql` la RPC `set_anime_ranking(p_work_ids bigint[]) returns void` (`security invoker`, `set search_path = ''`): error `42501` si `not public.is_admin()`; error `22023` si `cardinality > 10` o hay ids repetidos; error `22023` si la cantidad de filas con `id = any(p_work_ids) and type = 'anime' and is_favorite` no coincide con `cardinality(p_work_ids)` (validación **explícita**: el `check` no alcanza, porque el trigger de T006 corre antes y anularía la posición en silencio); limpiar todas las posiciones; asignar `ranking_position = ordinal` en el orden recibido (`unnest ... with ordinality`). Contrato en [contracts/data-access.md](./contracts/data-access.md)
- [ ] T009 Levantar Supabase **local** siguiendo "Setup local" de [quickstart.md](./quickstart.md) ([research.md R16](./research.md#r16-entorno-local-y-paso-a-producción)): `pnpm dlx supabase init` (crea `supabase/config.toml`; poner `enable_signup = false` en `[auth]`), `pnpm dlx supabase start` (aplica la migración y el seed), crear el admin en Studio, insertar su UUID en `public.admins` y completar `.env.local` con la URL y la clave publicable **locales**. No se toca el proyecto de producción (eso es T083). No agregar la CLI a `package.json`
- [ ] T010 [P] Crear `supabase/seed.sql` (solo para la base local) con el catálogo de prueba de [quickstart.md](./quickstart.md#datos-de-prueba-sugeridos): géneros, las 10 obras con URLs de portada pegadas a mano, sus `work_genres` y el Ranking (1 Shingeki no Kyojin, 2 Fullmetal Alchemist: Brotherhood). Poner al principio un comentario que diga que lo aplica `supabase start`/`db reset` solo en local y que **nunca** se ejecuta en producción. Si la base local ya estaba levantada, aplicarlo con `pnpm dlx supabase db reset` (y recrear el admin local)

### Cliente y tipos

- [ ] T011 [P] Crear `src/lib/types.ts` con `WorkType`, `WorkStatus`, `Genre` y `Work` tal cual figuran en [data-model.md](./data-model.md#tipos-de-cliente-srclibtypests) y exportarlos (`export type`) desde `src/lib/index.ts`
- [ ] T012 [P] Crear `src/lib/supabase.ts` con un único `createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)`. Si falta alguna variable, tirar un `Error` que diga cuál falta. Tipar las variables en `src/vite-env.d.ts` (interfaz `ImportMetaEnv`) si todavía no lo están, y exportar `supabase` desde `src/lib/index.ts`
- [ ] T013 [P] Crear `src/lib/catalog/labels.ts` con: `TYPE_LABEL` (Anime/Manga); `getStatusLabel(status, type)` (`in_progress` → "Viendo" para anime y "Leyendo" para manga; `pending` → "Pendiente"; `completed` → "Completado"; `dropped` → "Abandonado"); `getUnitLabels(type)` (episodios/temporadas o capítulos/tomos, y "vistos" o "leídos"); `STATUS_SLUG` y su inverso entre `WorkStatus` y los valores de URL `pendiente`, `en-curso`, `completado` y `abandonado`; `TYPE_PATH` (`anime` → `/animes`, `manga` → `/mangas`). Exportar desde `src/lib/catalog/index.ts`
- [ ] T014 [P] Pasar los sets de variantes `MOTION` (`full`/`reduced`) y las transiciones `SPRING`/`SHORT_FADE` de `src/pages/Home.tsx` a `src/lib/motion.ts`, y el hook `useMotionSet` a `src/hooks/useMotionSet.ts`. Exportar cada uno desde su barril
- [ ] T015 Crear `src/hooks/useCatalog.ts` (R-1): `supabase.from('works').select('*, genres(id, name)')` al montar. Devuelve `{ works: Work[], loading, error, reload }` e ignora la respuesta si el componente ya se desmontó. Exportar desde `src/hooks/index.ts` (depende de T011, T012)

### Layout y router

- [ ] T016 [P] Crear `src/lib/navigation.ts` con `PUBLIC_NAV` (`as const`), en este orden: Inicio `/`, Animes `/animes`, Mangas `/mangas`, Ranking `/ranking`, Estadísticas `/estadisticas`, Pendientes `/pendientes`, Ruleta `/ruleta`. Exportar desde `src/lib/index.ts`
- [ ] T017 [P] Crear `src/components/EmptyState.tsx`: ícono opcional, `message` y `children` opcionales para acciones (p. ej. botón "Ver todo"). Estilo prolijo con la paleta. Exportar desde `src/components/index.ts`
- [ ] T018 Crear `src/components/PublicLayout.tsx`: sacar de `src/pages/Home.tsx` el header animado (logo y efecto compacto al hacer scroll) y agregar la navegación con `NavLink` de `react-router` sobre `PUBLIC_NAV`, con el ítem activo marcado (también en `/animes/:id` y `/mangas/:id`). En celular, el menú es colapsable. Agregar un footer simple y `<Outlet />`. **Sin** el botón "Agregar anime" y sin ningún enlace a `/login` o `/dashboard` (FR-002, FR-019). Exportar desde `src/components/index.ts` (depende de T014, T016)
- [ ] T019 [P] Crear `src/pages/NotFoundPage.tsx` con el texto "Acá no hay nada" y un link a Inicio, usando `EmptyState`. Exportar desde `src/pages/index.ts`
- [ ] T020 Reescribir `src/pages/Home.tsx`: borrar los datos de ejemplo `ANIMES`, el buscador por texto, los filtros viejos, la grilla de tarjetas, el header (ahora vive en `PublicLayout`) y el botón "Agregar anime". Dejar solo el hero de bienvenida con links a Animes y Mangas. Pasar el componente `Counter` existente a `src/components/Counter.tsx`, exportado desde el barril, porque lo usa US8 (depende de T014, T018)
- [ ] T021 Montar `<BrowserRouter>` en `src/main.tsx` y reescribir `src/App.tsx` con `<Routes>`: una ruta de layout `PublicLayout` con `index` → `Home` y `*` → `NotFoundPage`. Cada historia agrega sus rutas a este archivo (depende de T018–T020)

**Checkpoint**: `pnpm dev` muestra el Inicio con el menú público, una ruta inexistente muestra
"Acá no hay nada" y `pnpm lint` y `pnpm build` pasan. Los ítems del menú de secciones que todavía
no existen caen en el 404 hasta completar su historia.

---

## Phase 3: User Story 1 - Navegar el catálogo público sin registrarse (Priority: P1) 🎯 MVP

**Goal**: grillas públicas de Animes y Mangas con tarjetas completas, sin cuenta y sin controles de
edición.

**Independent Test**: con `supabase/seed.sql` cargado, abrir `/` en incógnito, ir a Animes y
Mangas desde el menú y verificar que se ven las grillas completas, que las favoritas se destacan,
que el isekai largo no rompe la grilla a 375 px, que no hay botones de Agregar, Editar ni Eliminar
ni enlaces a `/login`, y que una sección vacía muestra "Aún no hay obras en esta categoría"
(quickstart V1).

### Implementation for User Story 1

- [ ] T022 [P] [US1] Crear `public/cover-fallback.svg`: portada de reemplazo en 3:4 con la marca (ícono de Otakuteca sobre fondo noche y degradado de la paleta)
- [ ] T023 [P] [US1] Crear `src/lib/catalog/sort.ts` con `sortWorks(works)`: favoritas primero y, dentro de cada grupo, `updated_at` descendente. Devuelve una copia. Exportar desde `src/lib/catalog/index.ts`
- [ ] T024 [P] [US1] Crear `src/lib/catalog/progress.ts` con `getProgress(work)`. Con `total_units`, devuelve `{ percent, text: 'X / Y' }`. Sin total, devuelve `{ percent: null, text: 'X episodios vistos' | 'X capítulos leídos' }`, sin porcentaje inventado. Usar `getUnitLabels` y exportar desde `src/lib/catalog/index.ts`
- [ ] T025 [P] [US1] Crear `src/components/CoverImage.tsx`: `<img loading='lazy' decoding='async'>` con relación 3:4 fija, `object-cover`, `alt` con el título y `onError` que cambia a `/cover-fallback.svg` una sola vez (sin bucle). Exportar desde `src/components/index.ts`
- [ ] T026 [P] [US1] Crear `src/components/StarRating.tsx` (solo lectura): 5 íconos de `lucide-react` con medias estrellas (`Star`/`StarHalf`) en `text-dorado`; si `rating` es `null` muestra "Sin calificar"; `aria-label` del estilo "4,5 de 5 estrellas" (con coma decimal). Exportar desde `src/components/index.ts`
- [ ] T027 [P] [US1] Crear `src/components/StatusBadge.tsx` con `Badge` de shadcn, un color de la paleta por estado y la etiqueta de `getStatusLabel(status, type)`. Exportar desde `src/components/index.ts`
- [ ] T028 [US1] Crear `src/components/ProgressBar.tsx` usando `getProgress`. Si hay porcentaje, muestra la barra con el texto "X / Y"; si no, solo el texto ("12 episodios vistos"). `role='progressbar'` con `aria-valuenow` y `aria-valuemax` cuando hay total. Exportar desde `src/components/index.ts` (depende de T024)
- [ ] T029 [US1] Agregar a `src/lib/motion.ts` las variantes `grid` y `card` (en `full` y en `reduced`) para las grillas y tarjetas de obras
- [ ] T030 [US1] Crear `src/components/WorkCard.tsx`: toda la tarjeta es un `Link` a `${TYPE_PATH[type]}/${id}`. Muestra `CoverImage`, título con `line-clamp-2`, hasta 3 géneros + "+N", reseña breve con `line-clamp-3`, `StarRating`, `StatusBadge` y `ProgressBar`. Las favoritas llevan borde e insignia dorada. Los bloques opcionales vacíos se omiten sin dejar huecos y la altura se mantiene estable en la grilla (FR-020, FR-030). Exportar desde `src/components/index.ts` (depende de T025–T029)
- [ ] T031 [US1] Crear `src/pages/CatalogPage.tsx` con la prop `type: WorkType`: título de sección, `useCatalog`, filtro por `type`, `sortWorks` y grilla responsive (1 columna en 375 px, más columnas en pantallas anchas) de `WorkCard` con las variantes de animación. Estado de carga; si hay error, `EmptyState` "No pudimos cargar el catálogo. Probá recargar la página"; sin obras, `EmptyState` "Aún no hay obras en esta categoría". Exportar desde `src/pages/index.ts` (depende de T015, T030)
- [ ] T032 [US1] Registrar en `src/App.tsx`, dentro de `PublicLayout`, las rutas `/animes` → `<CatalogPage type='anime' />` y `/mangas` → `<CatalogPage type='manga' />`

**Checkpoint**: US1 se puede validar sola con el seed (quickstart V1, pasos 1–4 y 6).

---

## Phase 4: User Story 2 - Ver el detalle de una obra (Priority: P1)

**Goal**: página de detalle con dirección propia que se puede compartir.

**Independent Test**: desde Animes, tocar la tarjeta de Frieren, ver todos sus datos ("12 / 28"),
abrir la misma URL en otra ventana de incógnito y abrir `/animes/999999` y
`/mangas/<id de Frieren>` para ver "Obra no encontrada" (quickstart V2).

### Implementation for User Story 2

- [ ] T033 [P] [US2] Crear `src/hooks/useWork.ts` (R-2): `useWork(id, type?)` hace `select('*, genres(id, name)').eq('id', id)`, agrega `.eq('type', type)` si se pasa `type`, y usa `.maybeSingle()`. Devuelve `{ work, loading, error, notFound }`; un id no numérico es `notFound` sin consultar. Lo usan `WorkPage` (US2) y `WorkEditPage` (US6). Exportar desde `src/hooks/index.ts`
- [ ] T034 [P] [US2] Crear `src/components/WorkDetail.tsx`: portada grande, título completo, tipo, todos los géneros, `StarRating`, `StatusBadge`, `ProgressBar`, temporadas o tomos si hay ("3 temporadas" / "10 tomos"), reseña breve, reseña ampliada (con `whitespace-pre-line`) y marca de favorita. Sin controles de edición. Los bloques vacíos se omiten. Lo usan `WorkPage` y `RoulettePage`. Exportar desde `src/components/index.ts`
- [ ] T035 [US2] Crear `src/pages/WorkPage.tsx` con la prop `type`: lee `:id` con `useParams` y usa `useWork(id, type)`. Mientras carga muestra un estado de carga. Si no existe o es del otro tipo, `EmptyState` "Obra no encontrada" con link "Volver a Animes" o "Volver a Mangas". Si hay error de red, el mensaje de error. Si está todo bien, `WorkDetail` y un link para volver a la sección. Exportar desde `src/pages/index.ts` (depende de T033, T034)
- [ ] T036 [US2] Registrar en `src/App.tsx` las rutas `/animes/:id` → `<WorkPage type='anime' />` y `/mangas/:id` → `<WorkPage type='manga' />`

**Checkpoint**: US1 + US2 funcionan juntas y cada una se valida por separado.

---

## Phase 5: User Story 3 - Filtrar animes y mangas por Estado y Favoritos (Priority: P1)

**Goal**: filtros combinables en la URL (`?estado=…&favoritos=1`) que se limpian en un solo paso.

**Independent Test**: en `/mangas`, filtrar por "Completado"; en `/animes`, activar "Solo
favoritos" y después sumarle "Viendo"; probar una combinación sin resultados y volver con "Ver
todo"; comprobar que Atrás restaura el filtro (quickstart V3).

### Implementation for User Story 3

- [ ] T037 [P] [US3] Crear `src/lib/catalog/filters.ts`: `parseFilters(searchParams)` → `{ status: WorkStatus | null, favorites: boolean }` (los valores de `estado` desconocidos se ignoran y `favoritos` solo vale `1`); `applyFilters(works, filters)` aplica las condiciones con AND; `hasActiveFilters(filters)`. Exportar desde `src/lib/catalog/index.ts`
- [ ] T038 [P] [US3] Crear `src/components/CatalogFilters.tsx` con las props `type` y `filters`: botones de Estado (Pendiente, Viendo o Leyendo según el tipo, Completado, Abandonado) que se activan y desactivan con un clic, el toggle "Solo favoritos" y el botón "Ver todo" cuando hay algún filtro activo. Escribe en la URL con `setSearchParams` (con historial, para que Atrás funcione). "Ver todo" navega a la ruta sin query. Usable a 375 px. Exportar desde `src/components/index.ts`
- [ ] T039 [US3] Integrar los filtros en `src/pages/CatalogPage.tsx`: leer `useSearchParams` → `parseFilters` → `applyFilters` antes de `sortWorks`, y renderizar `CatalogFilters` arriba de la grilla. Si la combinación no tiene resultados, mostrar `EmptyState` "Aún no hay obras en esta categoría" con el botón "Ver todo" (US3-4) (depende de T037, T038)

**Checkpoint**: las tres historias P1 públicas están completas. Es un MVP público mostrable con
datos del seed.

---

## Phase 6: User Story 4 - Acceso exclusivo del Administrador (Priority: P1)

**Goal**: `/login` oculto, guard sobre todo `/dashboard/*` y cierre de sesión.

**Independent Test**: en incógnito, abrir `/dashboard` y `/dashboard/obras/nueva`, que redirigen a
`/`. En `/login`, una contraseña incorrecta muestra el mensaje genérico y la correcta entra a
`/dashboard`. "Cerrar sesión" bloquea el acceso de nuevo (quickstart V4).

### Implementation for User Story 4

- [ ] T040 [P] [US4] Crear `src/hooks/useSession.ts`: `supabase.auth.getSession()` al montar y suscripción a `onAuthStateChange` (con `unsubscribe` en la limpieza). Cuando hay sesión, consulta `supabase.rpc('is_admin')`. Devuelve `{ session, isAdmin, loading }`. Exportar desde `src/hooks/index.ts`
- [ ] T041 [P] [US4] Crear `src/lib/safeNext.ts` con `safeNext(next: string | null)`: devuelve `next` solo si empieza con `/dashboard` (y no con `//`); si no, `/dashboard`. Así se evita un open redirect. Exportar desde `src/lib/index.ts`
- [ ] T042 [US4] Crear `src/components/RequireAdmin.tsx`. El guard decide **solo al entrar**. Mientras `useSession` carga por primera vez, muestra un indicador de carga. Si al entrar no hay sesión o el usuario no es admin, `<Navigate to='/' replace />` (FR-004). Una vez admitido (un `useRef` lo recuerda mientras el guard siga montado), si la sesión se pierde porque vence o se cierra en otra pestaña, **no** redirige: sigue mostrando `<Outlet />` y cada página resuelve la falta de sesión al guardar (FR-015). El botón "Cerrar sesión" navega a `/` por su cuenta (T043). Exportar desde `src/components/index.ts` (depende de T040)
- [ ] T043 [US4] Crear `src/components/DashboardLayout.tsx` con la navegación del panel (Obras `/dashboard`, Géneros `/dashboard/generos`, Ranking `/dashboard/ranking`), el link "Ver el sitio" a `/` y el botón "Cerrar sesión", que llama a `supabase.auth.signOut()` y navega a `/` con `replace`. Al final, `<Outlet />`. Exportar desde `src/components/index.ts`
- [ ] T044 [US4] Crear `src/pages/LoginPage.tsx` (sin exportarlo desde `src/pages/index.ts`). Formulario de email y contraseña con `Input` y `Label` que llama a `signInWithPassword`. Ante cualquier error de credenciales muestra "El email o la contraseña no son correctos.". Si sale bien, o si ya hay una sesión de admin, navega a `safeNext(searchParams.get('next'))`. Con `motivo=sesion` muestra "Tu sesión venció. Iniciá sesión de nuevo y recuperamos lo que estabas cargando.". Sin registro ni recuperación de contraseña (FR-003, FR-007) (depende de T040, T041)
- [ ] T045 [US4] Crear `src/pages/dashboard/DashboardHome.tsx`: `useCatalog` y un listado de todas las obras con `sortWorks`, mostrando título, tipo, `StatusBadge` y marca de favorita, más el botón "Agregar obra" (link a `/dashboard/obras/nueva`). Sin obras, `EmptyState` que invita a cargar la primera. Exportar desde `src/pages/dashboard/index.ts`
- [ ] T046 [US4] Registrar en `src/App.tsx` las rutas privadas con `React.lazy` + `Suspense`: `/login` → `LoginPage` (`lazy(() => import('@/pages/LoginPage').then(...))`). Para `/dashboard`, `RequireAdmin` → `DashboardLayout` → `index` `DashboardHome`, importado con lazy desde el barril `@/pages/dashboard`. Dentro del guard, agregar `path='*'` → `<Navigate to='/dashboard' replace />`, así cualquier `/dashboard/*` desconocido también pasa por el guard (FR-004)

**Checkpoint**: el acceso del Administrador es seguro. La protección real es la RLS (T007); el guard
es solo UX.

---

## Phase 7: User Story 5 - Agregar una obra al catálogo (Priority: P1)

**Goal**: alta de obras completa desde el panel, con validación, unicidad y lista de géneros.

**Independent Test**: con sesión iniciada, cargar Frieren con todos sus datos y verla en `/animes`
y en su detalle desde otra ventana. Intentar guardar sin título, portada o estado. Cargar
" naruto " como anime (rechazado, con "Editar esa obra") y "Naruto" como manga (aceptado). Probar
vistos > total (quickstart V5).

### Implementation for User Story 5

- [ ] T047 [P] [US5] Agregar a `src/lib/types.ts` el tipo `WorkFormValues` (strings para los inputs numéricos, `genreIds: number[]`, `rating: number | null`) y `WorkPayload` (las columnas editables de [contracts/data-access.md](./contracts/data-access.md#escritura-solo-administrador-rls-exige-is_admin), sin `ranking_position`)
- [ ] T048 [US5] Crear `src/lib/validation.ts`. `validateWork(values)` devuelve errores por campo con los mensajes de la tabla "Formulario de obra" de [contracts/routes.md](./contracts/routes.md): "Poné un título", máximo 200 caracteres, "Elegí un estado", "Pegá la URL de la portada", "Tiene que empezar con http:// o https://", "Tiene que ser 1 o más", "No puede superar el total (Y)". `toWorkPayload(values)` recorta el título, convierte los strings vacíos en `null` (salvo vistos/leídos: vacío → `0`, porque `progress` es `NOT NULL`) y los números con `Number`. Exportar desde `src/lib/index.ts` (depende de T047)
- [ ] T049 [P] [US5] Crear `src/lib/errors.ts`. `isSessionError(error)` es verdadero para HTTP 401, `PGRST301` y `42501`. `translateDbError(error)` devuelve `{ kind: 'duplicate-work' | 'duplicate-genre' | 'progress' | 'check' | 'ranking' | 'session' | 'network', message }` según el código y el nombre de la restricción (`works_title_type_key`, `genres_name_key`, el check de progreso, `23502` como `check`, `22023`), con los mensajes de [contracts/data-access.md](./contracts/data-access.md#errores-y-traducción-a-mensajes). Exportar desde `src/lib/index.ts`
- [ ] T050 [P] [US5] Crear `src/hooks/useGenres.ts` (R-3): `from('genres').select('id, name').order('name')`. Devuelve `{ genres, loading, error, reload }`. Lo usan `WorkForm` y `GenresPage`. Exportar desde `src/hooks/index.ts`
- [ ] T051 [US5] Agregar a `src/components/StarRating.tsx` una variante de entrada (prop `onChange`): 10 pasos de media estrella elegibles con clic o teclado, más la opción "Sin calificar" (`null`). Accesible con `aria-label` en cada paso
- [ ] T052 [US5] Crear `src/components/WorkForm.tsx` (formulario controlado con `useState`) con los campos de la tabla "Formulario de obra" de [contracts/routes.md](./contracts/routes.md). Tipo con `ToggleGroup` Anime/Manga, que cambia las etiquetas a temporadas/episodios/vistos o tomos/capítulos/leídos. Estado con `Select`, con etiquetas según el tipo. URL de portada con vista previa en `CoverImage`. Géneros con `Checkbox` desde `useGenres`, o un aviso si la lista está vacía. Reseñas con `Textarea`. Números con `Input type='number'`. Calificación con `StarRating` editable y favorita con `Checkbox`. Al elegir "Completado" con total cargado, vistos/leídos pasa al total. Muestra los errores de `validateWork` en cada campo. Props: `initialValues`, `onSubmit(values)`, `submitting`, `formError` (un `ReactNode` para errores globales). Exportar desde `src/components/index.ts` (depende de T048, T050, T051)
- [ ] T053 [US5] Crear `src/pages/dashboard/WorkEditPage.tsx` en modo alta (`/dashboard/obras/nueva`). Al enviar, hace W-1 `insert(toWorkPayload(values)).select('id').single()` y después W-4 (`upsert` en `work_genres` con `ignoreDuplicates`). Si W-1 sale bien y W-4 falla: mueve el borrador de `draftKey()` a `draftKey(id)` y navega a `/dashboard/obras/:id` con el aviso "Guardamos la obra, pero no sus géneros. Revisalos y guardá de nuevo." (si el fallo es de sesión, pasa antes por `/login?next=/dashboard/obras/:id&motivo=sesion`); ver "Alta en dos pasos" en [contracts/data-access.md](./contracts/data-access.md). Ante el error `duplicate-work`, busca la obra existente (`ilike('title', titulo).eq('type', type)`, con `\`, `%` y `_` escapados en el título) y muestra "Ya cargaste «X» como anime." con el botón "Editar esa obra" (link a `/dashboard/obras/:id`). Los demás errores se muestran traducidos en `formError`. Si sale bien, navega a `/dashboard`. Exportar desde `src/pages/dashboard/index.ts` (depende de T049, T052)
- [ ] T054 [US5] Crear `src/pages/dashboard/GenresPage.tsx` (FR-016b). Lista de `useGenres` con alta (W-5), renombrar en línea (W-6, `.select('id')`) y eliminar con `AlertDialog`. Antes de confirmar, R-4 cuenta cuántas obras tienen el género y el diálogo dice "Lo tienen N obras"; después corre W-7. Los errores se traducen ("Ese género ya existe."). Si un update/delete devuelve 0 filas o `isSessionError`, navega a `/login?next=/dashboard/generos&motivo=sesion`. Exportar desde `src/pages/dashboard/index.ts` (depende de T049, T050)
- [ ] T055 [US5] Registrar en `src/App.tsx`, dentro del guard, las rutas `obras/nueva` → `WorkEditPage` y `generos` → `GenresPage` (lazy, desde `@/pages/dashboard`)

**Checkpoint**: el catálogo ya se carga desde la web. US1–US5 forman el producto mínimo completo.

---

## Phase 8: User Story 6 - Editar, actualizar progreso o eliminar una obra (Priority: P2)

**Goal**: edición, baja con confirmación y que no se pierda nada si la sesión vence (FR-015).

**Independent Test**: pasar Chainsaw Man de Pendiente a Completado y ver "200 / 200" en público.
Subir los vistos de Frieren. Renombrar una obra a un título duplicado. Eliminar con confirmación,
probando Cancelar y Confirmar. Cerrar sesión en otra pestaña con el formulario a medio llenar,
guardar y comprobar que, al volver a entrar, el formulario se recupera (quickstart V6 y V10).

### Implementation for User Story 6

- [ ] T056 [P] [US6] Crear `src/lib/drafts.ts` con `draftKey(id?)` (`otakuteca:draft:new` o `otakuteca:draft:<id>`), `saveDraft(key, values)`, `loadDraft(key)` y `clearDraft(key)`. Cada acceso a `localStorage` va en `try/catch` (si falla, se sigue sin borrador). Exportar desde `src/lib/index.ts`
- [ ] T057 [US6] Agregar el modo edición a `src/pages/dashboard/WorkEditPage.tsx` (`/dashboard/obras/:id`). Carga la obra con `useWork(id)`; si no existe, muestra `EmptyState` "Obra no encontrada" con un link a `/dashboard`. Pasa los valores de la obra como `initialValues`. Al guardar, hace W-2 `update(payload).eq('id', id).select('id')`; si vuelven 0 filas, lo trata como sesión vencida. Después hace W-4: borra de `work_genres` los géneros que no están en la selección (todos, si está vacía) y hace `upsert` de la selección con `{ onConflict: 'work_id,genre_id', ignoreDuplicates: true }`. Así, reintentar después de un fallo parcial no choca con la PK. Si W-4 falla, el formulario queda como estaba con el error traducido. El duplicado se trata igual que en el alta (depende de T033)
- [ ] T058 [US6] Agregar a `src/pages/dashboard/WorkEditPage.tsx` (modo edición) el botón "Eliminar" con `AlertDialog` "¿Eliminar «X»? No se puede deshacer." y las opciones Cancelar y Eliminar. Al confirmar, hace W-3 `delete().eq('id', id).select('id')`: 0 filas es sesión vencida; si sale bien, navega a `/dashboard`
- [ ] T059 [US6] Agregar a cada fila de `src/pages/dashboard/DashboardHome.tsx` las acciones "Editar" (link a `/dashboard/obras/:id`) y "Eliminar", con el mismo `AlertDialog` y W-3. Si sale bien, hace `reload()` de `useCatalog`; si devuelve 0 filas o `isSessionError`, va a `/login?next=/dashboard&motivo=sesion`
- [ ] T060 [US6] Implementar FR-015 en `src/components/WorkForm.tsx` y `src/pages/dashboard/WorkEditPage.tsx`. `WorkForm` recibe la prop `draftKey` y llama a `saveDraft` en cada cambio. Al montar, si hay borrador (por sesión vencida, por haber salido sin guardar o por un cierre de pestaña: la spec quiere recuperarlo en todos los casos), lo usa como valores iniciales y muestra el aviso "Recuperamos lo que estabas cargando" con el botón "Descartar borrador" (`clearDraft` y vuelve a los valores originales). En `WorkEditPage`, ante `isSessionError`, 0 filas o falta de sesión al guardar (la página sigue abierta aunque la sesión se haya perdido antes: ver T042), conserva el borrador y navega a `/login?next=<pathname>&motivo=sesion`. Si guarda bien, hace `clearDraft` (alta y edición) (depende de T056)

**Checkpoint**: el Administrador puede mantener el catálogo al día sin perder datos.

---

## Phase 9: User Story 7 - Favoritas y Ranking (Priority: P2)

**Goal**: Ranking manual de hasta 10 animes favoritos, editable en el panel y visible en público.

**Independent Test**: con SnK en el puesto 1 y FMA:B en el 2, `/ranking` respeta las posiciones y
no las estrellas, y Frieren (favorita sin posición) no aparece. En el panel, intercambiar las
posiciones, intentar agregar un 11.º anime, desmarcar SnK como favorita y vaciar el Ranking
(quickstart V7).

### Implementation for User Story 7

- [ ] T061 [P] [US7] Crear `src/lib/catalog/ranking.ts`. `getRanking(works)` devuelve los animes con `ranking_position` en orden ascendente, máximo 10. El puesto visible es el índice + 1, no `ranking_position`. `getRankableAnimes(works)` devuelve los animes favoritos sin posición. Exportar `MAX_RANKING = 10` y todo desde `src/lib/catalog/index.ts`
- [ ] T062 [US7] Crear `src/pages/RankingPage.tsx`: `useCatalog` + `getRanking` en una lista numerada por **índice** (#1…#n; nunca se muestra `ranking_position`, que puede tener huecos tras una baja o al desmarcar un favorito, FR-026) con `CoverImage`, título, `StarRating` y un link al detalle. Las variantes de animación respetan `reduced`. Si está vacío, `EmptyState` "Todavía no armé mi top. ¡Volvé pronto!". Exportar desde `src/pages/index.ts` (depende de T061)
- [ ] T063 [P] [US7] Agregar a `src/components/WorkDetail.tsx` la insignia "En mi top 10", con link a `/ranking`, cuando la obra tiene `ranking_position`. No lleva número: el detalle carga una sola obra y el puesto visible depende de las demás (FR-026)
- [ ] T064 [P] [US7] Agregar a `src/components/WorkForm.tsx` el aviso "Sale del Ranking" cuando la obra tiene `ranking_position` y se desmarca como favorita o se cambia el tipo a Manga
- [ ] T065 [US7] Crear `src/pages/dashboard/RankingEditorPage.tsx`. Muestra el top actual (estado local inicializado con `getRanking`) con botones para subir, bajar y quitar, y la lista de favoritos disponibles (`getRankableAnimes`) con el botón "Agregar al top", deshabilitado al llegar a 10 con el aviso "Solo podés rankear hasta 10 animes favoritos.". El botón "Guardar Ranking" llama a W-8 `rpc('set_anime_ranking', { p_work_ids })`; si sale bien, muestra una confirmación y hace `reload()`. Errores: `42501` o `isSessionError` → `/login?next=/dashboard/ranking&motivo=sesion` (sin borrador: los cambios sin guardar se pierden, FR-015); `22023` → "No pudimos guardar el Ranking: hay más de 10 animes o alguno ya no es favorito. Recargá y probá de nuevo."; los demás, traducidos con `translateDbError`. Si no hay animes favoritos, muestra un `EmptyState` que explica que primero hay que marcar favoritos. Exportar desde `src/pages/dashboard/index.ts` (depende de T061)
- [ ] T066 [US7] Registrar en `src/App.tsx` la ruta pública `/ranking` → `RankingPage` y, dentro del guard, `ranking` → `RankingEditorPage` (lazy)

**Checkpoint**: el Ranking funciona de punta a punta y nunca deja posiciones duplicadas (lo
garantiza la RPC).

---

## Phase 10: User Story 8 - Estadísticas (Priority: P2)

**Goal**: 3 contadores en Inicio y la página Estadísticas con gráficos por estado, por tipo y por
género.

**Independent Test**: con el seed, el Inicio muestra 3 animes vistos, 4 favoritos y 1 manga leído.
En `/estadisticas`, Fantasía suma 2 y el isekai cuenta en "Sin género". Con la base vacía, todo
queda en 0 y los gráficos muestran el estado vacío (quickstart V8).

### Implementation for User Story 8

- [ ] T067 [P] [US8] Crear `src/lib/catalog/stats.ts` con estas funciones. `getHomeCounters(works)` devuelve `{ animesWatched, favorites, mangasRead }` (FR-024). `countByStatus(works)` devuelve los 4 estados con la etiqueta neutra "En curso" para `in_progress`. `countByType(works)` devuelve anime y manga desglosados por estado. `countByGenre(works)` cuenta una vez por cada género de cada obra, agrega "Sin género" para las obras sin géneros y ordena de mayor a menor. Exportar desde `src/lib/catalog/index.ts`
- [ ] T068 [P] [US8] Crear `src/components/BarChart.tsx` con barras horizontales hechas con `div`. Props: `title` e `items: { label, value, colorClass }[]`. El ancho es proporcional al máximo y la animación de entrada con `framer-motion` tiene variante `reduced`. Cada barra muestra su valor en texto y una etiqueta accesible ("Fantasía: 2 obras"). Si todos los valores son 0 o no hay ítems, muestra `EmptyState` "Todavía no hay datos para este gráfico". Se usa en los 3 gráficos de Estadísticas. Exportar desde `src/components/index.ts`
- [ ] T069 [US8] Agregar a `src/pages/Home.tsx` la sección de 3 contadores con `useCatalog`, `getHomeCounters` y `Counter`: "Animes vistos", "Favoritos" y "Mangas leídos". Muestran 0 si el catálogo está vacío y el mensaje de error de red si falla la carga (depende de T067)
- [ ] T070 [US8] Crear `src/pages/StatsPage.tsx` con tres secciones de `BarChart`: "Por estado", "Anime vs. manga" (barras por tipo con el desglose por estado) y "Por género", con la aclaración de que una obra con varios géneros suma en cada uno. Exportar desde `src/pages/index.ts` (depende de T067, T068)
- [ ] T071 [US8] Registrar en `src/App.tsx` la ruta `/estadisticas` → `StatsPage`

**Checkpoint**: los números de Inicio y Estadísticas coinciden con un conteo manual (SC-008).

---

## Phase 11: User Story 9 - Pendientes y Ruleta (Priority: P3)

**Goal**: lista de pendientes y sorteo de una obra pendiente por tipo.

**Independent Test**: `/pendientes` muestra solo las obras pendientes, de los dos tipos. En
`/ruleta`, con "Anime" por defecto, girar 5 veces: siempre sale un anime pendiente y nunca el mismo
dos veces seguidas. Pasar a "Manga" y, si no hay pendientes, ver el mensaje amigable (quickstart
V9).

### Implementation for User Story 9

- [ ] T072 [P] [US9] Crear `src/lib/catalog/roulette.ts` con `pickRandomPending(works, type, previousId)`: elige al azar entre `status = 'pending'` y `type`, excluye `previousId` si hay más de un candidato y devuelve `null` si no hay ninguno. Exportar desde `src/lib/catalog/index.ts`
- [ ] T073 [P] [US9] Crear `src/pages/PendingPage.tsx`: `useCatalog`, filtro `status = 'pending'` (anime y manga), `sortWorks` y grilla de `WorkCard`. Si no hay ninguna, `EmptyState` "Aún no hay obras en esta categoría". Exportar desde `src/pages/index.ts`
- [ ] T074 [US9] Crear `src/pages/RoulettePage.tsx`. `ToggleGroup` Anime/Manga sincronizado con `?tipo` (`anime` por defecto; los valores desconocidos cuentan como `anime`), botón "¡Girá la ruleta!" y resultado en `WorkDetail`, con un link al detalle y el botón "Otra opción", que vuelve a sortear pasando el resultado anterior. Al cambiar de tipo se borra el resultado. Si no hay pendientes del tipo, muestra "No tengo animes pendientes. Probá con mangas" (o al revés) con un botón para cambiar de tipo. La animación de giro es corta y respeta `reduced`. Exportar desde `src/pages/index.ts` (depende de T072)
- [ ] T075 [US9] Registrar en `src/App.tsx` las rutas `/pendientes` → `PendingPage` y `/ruleta` → `RoulettePage`

**Checkpoint**: las 9 historias están completas y el menú público no tiene ninguna sección que
caiga en el 404.

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: indexación, revisión transversal y cierre según la Constitución

- [ ] T076 [P] Agregar a `vercel.json` un bloque `headers` con `X-Robots-Tag: noindex, nofollow` para `/login` y `/dashboard/:path*` (R13). No tocar `public/robots.txt`
- [ ] T077 [P] Agregar a `public/sitemap.xml` las rutas públicas de sección (`/animes`, `/mangas`, `/ranking`, `/estadisticas`, `/pendientes`, `/ruleta`), sin `/login` ni `/dashboard`
- [ ] T078 Agregar un `<title>` en español a cada página pública y privada usando los metadatos nativos de React 19 en `src/pages/*.tsx` y `src/pages/dashboard/*.tsx` (p. ej. "Animes · Otakuteca", "Frieren · Otakuteca")
- [ ] T079 Revisar `src/` buscando `login`, `dashboard`, "Agregar" y textos sin voseo en los componentes públicos (`src/components/`, `src/pages/` salvo `LoginPage` y `dashboard/`) y corregir lo que aparezca (FR-019, FR-033)
- [ ] T080 Revisar con DevTools a 375 px y en escritorio: grillas, menú colapsable, filtros, gráficos, Ranking, Ruleta y formularios del panel (SC-007). Ajustar las clases en los componentes afectados de `src/components/` y `src/pages/`
- [ ] T081 Correr `pnpm format`, `pnpm lint` y `pnpm build` sin errores, y comprobar en la salida del build que `LoginPage` y las páginas de `src/pages/dashboard/` quedan en chunks separados del bundle público
- [ ] T082 Ejecutar **contra la base local** los escenarios V1–V10 de [quickstart.md](./quickstart.md) (V1–V3 también sobre `pnpm preview`), incluidos el catálogo de 200 obras de V3 (SC-003) y la base vacía de V8, y los chequeos de seguridad con `curl` de "Verificación de seguridad desde afuera". Al terminar, `pnpm dlx supabase db reset` para volver al seed. Nada de esto toca producción
- [ ] T083 Paso a producción, solo con T082 en verde (sección "Paso a producción" de [quickstart.md](./quickstart.md)): aplicar `0001_init.sql` al proyecto de Supabase de producción, que arranca vacío (**sin** `seed.sql`); desactivar el registro; crear el admin e insertarlo en `public.admins`; cargar las variables de producción en Vercel y desplegar; repetir los `curl` de seguridad contra producción; comprobar `curl -sI https://otakuteca.ntech.studio/login | grep -i x-robots-tag`; cargar el catálogo real a mano desde `/dashboard`; y, con el catálogo cargado, Lighthouse móvil sobre `/` (contenido visible en menos de 3 s, SC-001)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup. **Bloquea todas las historias.** T009 (levantar
  Supabase local) depende de T005–T008; si T010 se termina después, se aplica con `db reset`.
- **US1–US3 (Phases 3–5)**: dependen de Foundational. Para validarlas sin el panel hace falta el
  seed (T010).
- **US4 (Phase 6)**: depende de Foundational. Puede avanzar en paralelo con US1–US3.
- **US5 (Phase 7)**: depende de US4 (panel y guard) y usa `CoverImage` y `StatusBadge` de US1.
- **US6 (Phase 8)**: depende de US5 (`WorkForm`, `WorkEditPage`) y de `useWork` de US2.
- **US7 (Phase 9)**: la vista pública (T061–T063) solo depende de US1 y US2. El editor (T064–T065)
  depende de US5.
- **US8 (Phase 10)**: depende de Foundational y de `Counter` (T020). No depende de otras historias.
- **US9 (Phase 11)**: depende de `WorkCard` (US1) y `WorkDetail` (US2).
- **Polish (Phase 12)**: depende de todas las historias que se quieran entregar. T083 (producción)
  depende de T082 (validación local en verde).

### User Story Dependencies

```text
Foundational ──┬── US1 ──┬── US2 ──┬── US9
               │         │         └── US7 (vista pública)
               │         └── US3
               ├── US4 ── US5 ──┬── US6
               │                └── US7 (editor)
               └── US8
```

### Within Each User Story

- Lógica pura (`src/lib/…`) y hooks antes que los componentes que los usan.
- Componentes antes que las páginas.
- Registrar la ruta en `src/App.tsx` al final de cada historia. Como todas tocan el mismo archivo,
  esas tareas nunca son [P] entre sí.
- Cerrar cada historia con `pnpm lint`, `pnpm build` y su escenario de quickstart.

### Parallel Opportunities

- **Setup**: T002, T003 y T004 en paralelo después de T001.
- **Foundational**: la migración (T005–T008) es un solo archivo y va en secuencia, pero en paralelo
  se pueden hacer T010–T014, T016, T017 y T019.
- **Entre historias**: con Foundational listo, US1 (público), US4 (acceso) y US8 (estadísticas)
  tocan archivos distintos y pueden avanzar a la vez, salvo los registros en `src/App.tsx`.

---

## Parallel Example: User Story 1

```bash
# Lógica pura y componentes atómicos de US1 (archivos distintos):
Task: "T022 [US1] public/cover-fallback.svg"
Task: "T023 [US1] sortWorks en src/lib/catalog/sort.ts"
Task: "T024 [US1] getProgress en src/lib/catalog/progress.ts"
Task: "T025 [US1] CoverImage en src/components/CoverImage.tsx"
Task: "T026 [US1] StarRating en src/components/StarRating.tsx"
Task: "T027 [US1] StatusBadge en src/components/StatusBadge.tsx"
# Después, en secuencia: T028 ProgressBar → T029 variantes → T030 WorkCard → T031 CatalogPage → T032 rutas
```

## Parallel Example: User Story 5

```bash
Task: "T047 [US5] WorkFormValues/WorkPayload en src/lib/types.ts"
Task: "T049 [US5] translateDbError en src/lib/errors.ts"
Task: "T050 [US5] useGenres en src/hooks/useGenres.ts"
# T048 (validation) espera a T047. Después: T051 → T052 WorkForm → T053 alta / T054 géneros → T055 rutas
```

## Parallel Example: User Story 8

```bash
Task: "T067 [US8] stats en src/lib/catalog/stats.ts"
Task: "T068 [US8] BarChart en src/components/BarChart.tsx"
# Después: T069 contadores del Inicio y T070 StatsPage (archivos distintos) → T071 ruta
```

---

## Implementation Strategy

### MVP First (vista pública)

1. Phase 1 (Setup) + Phase 2 (Foundational), con la migración aplicada y el seed cargado.
2. Phase 3 (US1). **Parar y validar** con quickstart V1. Ya es mostrable.
3. Agregar US2 y US3 (detalle y filtros), que completan la vista pública P1.

### Producto mínimo completo (todas las P1)

4. US4 (acceso) y US5 (alta), validadas en local (V4, V5).
5. Si querés publicar ya el producto mínimo: lint, build y V1–V5 en local, y después "Paso a
   producción" de quickstart (T083). Producción arranca vacía y el catálogo real se carga a mano.
   El seed nunca sale de la base local.

### Incremental Delivery (P2 → P3)

6. US6 (edición, baja y borradores) → US7 (Ranking) → US8 (Estadísticas) → US9 (Pendientes y
   Ruleta). Validar cada una con su escenario de quickstart antes de pasar a la siguiente.
7. Phase 12 (Polish) y cierre según la Constitución: lint, build, V1–V10 y `curl` en local (T082),
   y recién después producción, `curl` contra producción y Lighthouse (T083).

---

## Notes

- [P] = archivo distinto y sin dependencias pendientes. Agregar una línea `export` a un barril
  (`src/lib/index.ts`, `src/components/index.ts`, etc.) no impide paralelizar: es un cambio
  trivial de resolver si dos tareas lo tocan a la vez. Las tareas sobre el mismo archivo
  (`supabase/migrations/0001_init.sql`, `src/App.tsx`, `WorkEditPage.tsx`, `WorkForm.tsx`) van en
  secuencia.
- La seguridad la garantiza la RLS (T007–T008), no el guard ni que falten botones. Un
  `update`/`delete` que afecta 0 filas se trata como sesión vencida, nunca como éxito.
- No integrar APIs externas de catálogo ni traer portadas automáticamente (Constitución III).
- No crear componentes ni hooks "por si acaso": los que van fuera de `pages/` tienen 2 o más usos
  reales, o salen de dividir código que ya existe.
- Commit después de cada tarea o grupo lógico. Parar en cada checkpoint para validar la historia.
