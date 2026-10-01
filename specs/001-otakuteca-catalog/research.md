# Research: Otakuteca v1 — Catálogo público de anime y manga

**Feature**: `001-otakuteca-catalog` | **Fecha**: 2026-10-01 | **Plan**: [plan.md](./plan.md)

Cada decisión resuelve una incógnita del Technical Context. Criterio rector: Constitución,
principio I (ante dos opciones, la más directa) y principio V (la protección se valida en el
servidor).

---

## R1. Persistencia y backend

**Decision**: Supabase (Postgres administrado + Auth + PostgREST) consumido directo desde el
cliente con `@supabase/supabase-js` v2. Sin backend propio ni funciones serverless.

**Rationale**:

- El sitio hoy es una SPA estática en Vercel; necesita datos persistentes que el Administrador
  modifique y que el público lea. Supabase da base de datos, autenticación y API en un solo
  servicio, sin escribir ni desplegar un servidor.
- Las reglas de seguridad viven en la base (Row Level Security): aunque alguien use la clave
  pública fuera de la UI, Postgres rechaza cualquier escritura que no venga del Administrador
  (FR-005, Principio V).
- Las reglas de negocio críticas se expresan como restricciones de Postgres, que son la última
  línea de defensa: unicidad título + tipo (FR-011), un solo estado (FR-010), progreso ≤ total
  (FR-013), estrellas en pasos de 0,5, posición de Ranking única 1–10 (FR-016).
- Plan gratuito suficiente para ≤ 200 obras y un único usuario.

**Alternatives considered**:

- *Vercel Functions + Neon/Vercel Postgres + auth propia (JWT/cookies)*: requiere escribir
  endpoints, hashing de contraseñas, manejo de sesión y validación duplicada. Más código, más
  superficie de error. Rechazado por Principio I.
- *Firebase (Firestore + Auth)*: sin restricciones únicas ni checks declarativos; la unicidad
  título + tipo habría que emularla con documentos índice o transacciones. Rechazado.
- *JSON en el repo + rebuild*: no cumple FR-032 (cambios visibles al recargar) ni permite editar
  desde `/dashboard`. Rechazado.

**Riesgo conocido**: los proyectos gratuitos de Supabase se pausan tras ~7 días sin actividad.
Mitigación v1: el tráfico normal lo evita; si hace falta, un ping programado (GitHub Actions
`schedule`) a la API REST. Se decide en implementación; no bloquea el diseño.

---

## R2. Autenticación del Administrador

**Decision**: Supabase Auth con email + contraseña (`signInWithPassword`). El usuario se crea a
mano en el panel de Supabase; **"Allow new users to sign up" desactivado**. Además, una tabla
`admins` con el `user_id` autorizado y una función `is_admin()` que usan todas las políticas de
escritura (defensa en profundidad: aunque alguien reactivara el registro, un usuario nuevo no
podría escribir).

**Rationale**: cumple FR-001, FR-003 (sin registro), FR-006 (`signOut`), FR-007 (Supabase
devuelve `invalid_credentials` sin distinguir email/contraseña; la UI muestra un único mensaje
genérico). Las credenciales se configuran fuera del sitio (Assumptions). Supabase Auth trae
limitación de intentos incorporada.

**Alternatives considered**: magic link (depende del correo, más lento para un uso frecuente);
OAuth con GitHub (agrega configuración de proveedor sin beneficio para un único usuario);
políticas solo `to authenticated` sin tabla `admins` (más simple, pero un error de configuración
en Supabase abriría la escritura — se acepta la tabla de una fila por Principio V).

---

## R3. Enrutamiento multipágina y protección de `/dashboard`

**Decision**: `react-router` v7 en modo declarativo (`BrowserRouter` + `Routes`), con dos layouts:
`PublicLayout` (menú público) y `DashboardLayout` envuelto en un guard `RequireAdmin` que, sin
sesión válida, hace `<Navigate to="/" replace />` (FR-004). Las rutas de `/login` y `/dashboard`
se cargan con `React.lazy` para que el bundle público no incluya el panel.

**Rationale**: el sitio pasa a tener ~14 rutas con parámetros (`/animes/:id`), query params para
filtros y rutas protegidas. React Router es el estándar, ya resuelve todo eso y Vercel ya tiene la
reescritura SPA configurada en `vercel.json`. El guard en cliente es solo UX: la protección real es
RLS (R1/R2).

**Alternatives considered**:

- *Modo data/framework de React Router (loaders, SSR)*: más conceptos y configuración sin
  necesidad para una SPA chica. Rechazado por Principio I.
- *wouter*: más liviano, pero menos conocido y sin equivalentes directos de `useSearchParams`
  y `Navigate`. La diferencia de peso no justifica salirse del estándar.
- *Router propio con `history.pushState`*: reinventar rutas anidadas y parámetros. Rechazado.

**Rutas en español** (texto visible) y sin enlaces a `/login` ni `/dashboard` desde lo público
(FR-002, FR-019). Ver [contracts/routes.md](./contracts/routes.md).

---

## R4. Lectura de datos y frescura (FR-032, SC-003, SC-005)

**Decision**: cada página pública trae el catálogo completo al montarse con una sola consulta
(`works` + géneros embebidos) mediante un hook `useCatalog()`; filtros, Ranking, Pendientes,
Ruleta y estadísticas se calculan en el cliente con funciones puras sobre esa lista. Sin capa de
caché.

**Rationale**: con ≤ 200 obras la consulta pesa decenas de KB; filtrar en memoria es instantáneo
(SC-003 < 1 s). Pedir los datos en cada apertura de página garantiza que los cambios del
Administrador se vean al abrir o recargar (FR-032, SC-005) sin invalidaciones. Un solo hook
reutilizado en ≥ 2 páginas cumple la regla de abstracción del Principio I.

**Alternatives considered**: TanStack Query (caché, reintentos, invalidación: útil a otra escala,
dependencia nueva sin necesidad hoy); consultas filtradas en el servidor por página (más
round-trips, latencia en cada filtro, y la lógica de estadísticas igual quedaría en el cliente);
vistas SQL agregadas para estadísticas (innecesario con 200 filas).

---

## R5. Estado de los filtros

**Decision**: los filtros de Animes/Mangas viven en la URL (`?estado=completado&favoritos=1`)
vía `useSearchParams`. "Limpiar filtros" = navegar a la ruta sin query (FR-023, un solo paso).

**Rationale**: sin estado extra; el botón Atrás funciona y un filtro se puede compartir por link
("mirá mis favoritos"). Encaja con Principio IV.

**Alternatives considered**: `useState` local (se pierde al volver del detalle; no compartible).

---

## R6. Gráficos de Estadísticas (FR-025)

**Decision**: gráficos hechos con Tailwind + SVG/`div` (barras horizontales, barra apilada de
distribución y comparativa anime vs. manga), animados con `framer-motion`, que ya está instalado.
Un único componente `BarChart` reutilizado en las tres secciones (≥ 2 usos).

**Rationale**: los datos son conteos categóricos (estado, tipo, género); barras horizontales son
la forma más legible y se dibujan con pocas líneas. Cero dependencias nuevas, bundle público más
chico (SC-001 < 3 s) y control total de la paleta de la marca (sakura, cian, lavanda, dorado).
Estado vacío propio cuando no hay datos (FR-029, US8-5).

**Alternatives considered**: shadcn `chart` (Recharts, ~100 KB gz extra, pensado para series
temporales y ejes que no se necesitan); Chart.js (canvas, peor accesibilidad, otra dependencia).
Si en v2 aparecen gráficos temporales, se reevalúa shadcn `chart`.

---

## R7. Formularios y validación (FR-009, FR-013)

**Decision**: formulario controlado con `useState` + una función pura `validateWork(input)` que
devuelve errores por campo en español. Inputs de shadcn (`Input`, `Textarea`, `Select`,
`Checkbox`, `Label`). Las restricciones de Postgres repiten las reglas como última línea de
defensa; sus códigos de error se traducen a mensajes por campo
(ver [contracts/data-access.md](./contracts/data-access.md)).

**Rationale**: un único formulario (alta/edición comparten componente) con ~14 campos y reglas
simples (requeridos, rangos, progreso ≤ total). No justifica `react-hook-form` ni `zod`.

**Alternatives considered**: `react-hook-form` + `zod` (dos dependencias para un formulario);
validación solo HTML nativa (no cubre progreso ≤ total ni mensajes con voseo).

---

## R8. Sesión vencida durante una edición (FR-015, SC-009)

**Decision**: el formulario guarda un borrador en `localStorage` (clave `otakuteca:draft:new` o
`otakuteca:draft:<id>`) en cada cambio. Al guardar, si no hay sesión o Supabase responde con error
de autenticación (HTTP 401 / JWT vencido / violación RLS por rol anónimo, o un `update` que
afecta 0 filas porque RLS lo filtró en silencio), se conserva el borrador,
se navega a `/login?next=<ruta>&motivo=sesion` y `/login` muestra el aviso "Tu sesión venció.
Iniciá sesión de nuevo y recuperamos lo que estabas cargando". Tras iniciar sesión se vuelve a
`next` y el formulario se inicializa desde el borrador con un aviso visible. El borrador se borra
al guardar con éxito o al descartar.

**Rationale**: cubre el peor caso (token de refresco inválido) sin backend; `localStorage` sobrevive
la redirección y un cierre accidental de pestaña. `next` solo acepta rutas que empiezan con
`/dashboard` (evita open redirect).

**Alternatives considered**: `sessionStorage` (se pierde si se cierra la pestaña); modal de login
sobre el formulario (más complejo de componer con el guard).

---

## R9. Ranking manual (FR-016, FR-026)

**Decision**: columna `ranking_position` (1–10, única, solo anime favorito) en `works`. El
Administrador edita el Ranking en `/dashboard/ranking`: elige hasta 10 animes favoritos y los
ordena (subir/bajar). Al guardar se llama a una función RPC `set_anime_ranking(work_ids bigint[])`
que, en una transacción, limpia todas las posiciones y asigna 1..n en el orden recibido.
Desmarcar favorito pone `ranking_position = null` automáticamente (trigger en la base; un
`CHECK` impide cualquier estado inconsistente).

**Rationale**: reordenar (p. ej. intercambiar 1 y 2) con posiciones únicas exige atomicidad; con
updates sueltos chocaría la restricción única o quedaría un estado intermedio. Una RPC de pocas
líneas es la vía más directa y nunca deja posiciones duplicadas (US7-5).

**Alternatives considered**: campo "posición" dentro del formulario de cada obra (no permite
intercambiar sin pasos intermedios; mala UX); drag & drop (dependencia extra, botones
subir/bajar alcanzan para 10 ítems).

---

## R10. Unicidad título + tipo y oferta de edición (FR-011, FR-012)

**Decision**: índice único `(type, lower(btrim(title)))`. El cliente además recorta el título
antes de guardar. Ante error `23505` en ese índice, el cliente busca la obra existente
(`ilike` sobre el título recortado + tipo) y muestra: "Ya cargaste «Naruto» como anime." con
botón "Editar esa obra".

**Rationale**: la base garantiza la regla aunque haya dos pestañas abiertas; el cliente solo
traduce el error.

**Alternatives considered**: chequeo solo en cliente previo al insert (carrera posible; igual se
mantiene como prevalidación opcional).

---

## R11. Detalle de obra y direcciones (FR-018)

**Decision**: id numérico (`bigint generated always as identity`) y rutas `/animes/:id` y
`/mangas/:id`. Si el id no existe o el tipo no coincide con la sección → página "obra no
encontrada" con link al catálogo (US2-3).

**Rationale**: direcciones cortas y estables aunque cambie el título (un slug se rompería al
corregir un título). Mantener el detalle bajo su sección deja marcado el ítem correcto del menú.

**Alternatives considered**: slug por título (se rompe al editar, requiere unicidad extra); UUID
(direcciones largas y feas para compartir).

---

## R12. Portadas (FR-030, Constitución III)

**Decision**: `<img src={cover_url} loading="lazy" decoding="async">` con `onError` que cambia a
`/cover-fallback.svg` (ilustración con la marca, nuevo archivo en `public/`). Relación 3:4 fija
para que la grilla no se deforme. La base valida que la URL empiece con `http://` o `https://`.

**Rationale**: carga 100 % manual de URLs externas; ningún proxy ni subida de archivos.

---

## R13. Indexación de rutas privadas

**Decision**: header `X-Robots-Tag: noindex, nofollow` para `/login` y `/dashboard/:path*` en
`vercel.json`. **No** se agregan a `robots.txt` (listarlas ahí las publicita). `sitemap.xml` se
amplía solo con las rutas públicas.

**Rationale**: FR-002/FR-019 piden no enlazar `/login`; evitar que un buscador la indexe completa
la intención sin depender de ocultamiento (la seguridad es RLS).

---

## R14. Verificación (Testing)

**Decision**: sin framework de tests automatizados en v1. La verificación es la que fija la
Constitución: `pnpm lint`, `pnpm build` y validación manual en el navegador siguiendo
[quickstart.md](./quickstart.md), más verificación de RLS con `curl` usando la clave pública
(escrituras anónimas deben fallar).

**Rationale**: Principio IV (cada funcionalidad se valida con clics) y Principio I (no agregar
Vitest/Playwright sin necesidad demostrada). Las reglas críticas están garantizadas por
restricciones de la base, verificables con `curl`.

**Alternatives considered**: Vitest para funciones puras (`validateWork`, estadísticas, filtros):
razonable para v2 si la lógica crece; Playwright e2e: costo de setup alto para un MVP.

---

## R15. Configuración y secretos (Principio V)

**Decision**: variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` en `.env.local`
(ya ignorado por `*.local` en `.gitignore`) y en Environment Variables de Vercel. Se commitea un
`.env.example` sin valores. La clave `service_role`/secret **nunca** se usa en el cliente ni se
guarda en el repo.

**Rationale**: la clave publicable está diseñada para exponerse en el navegador; su poder lo
limita RLS. Las contraseñas del Administrador viven solo en Supabase Auth.

---

## Resumen de dependencias nuevas

| Dependencia | Motivo | Por qué lo existente no alcanza |
|-------------|--------|---------------------------------|
| `@supabase/supabase-js` | Datos, auth y RLS | No hay backend ni persistencia en el proyecto |
| `react-router` | Multipágina, parámetros, rutas protegidas | Hoy `App.tsx` renderiza una sola página |

Componentes shadcn a agregar con `pnpm dlx shadcn add` (no son dependencias nuevas: usan
`@base-ui/react` ya instalado): `input`, `textarea`, `label`, `select`, `checkbox`, `badge`,
`alert-dialog`, `toggle-group`.
