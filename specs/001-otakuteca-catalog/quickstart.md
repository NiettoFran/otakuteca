# Quickstart & Validación: Otakuteca v1

**Feature**: `001-otakuteca-catalog` | **Plan**: [plan.md](./plan.md)

Guía para levantar el proyecto y demostrar, con clics y un par de `curl`, que la feature cumple la
spec. Rutas y mensajes esperados: [contracts/routes.md](./contracts/routes.md). Reglas de datos:
[data-model.md](./data-model.md). API: [contracts/data-access.md](./contracts/data-access.md).

## Prerrequisitos

- Node 22+ y `pnpm`.
- Docker (para Supabase local). La CLI de Supabase se usa con `pnpm dlx supabase`, sin instalarla
  en el proyecto ([research.md R16](./research.md#r16-entorno-local-y-paso-a-producción)).
- Para publicar: un proyecto de Supabase (plan gratuito alcanza) y una cuenta de Vercel con el
  repo conectado.

**Regla de oro**: todo se desarrolla y se valida en local. El proyecto de Supabase de producción
arranca vacío, solo recibe la migración y el catálogo real cargado a mano, y nunca ejecuta
`supabase/seed.sql`.

## Setup local (una vez)

1. **Inicializar** (solo la primera vez; crea `supabase/config.toml`):
   ```bash
   pnpm dlx supabase init
   ```
   En `supabase/config.toml`, poner `enable_signup = false` en la sección `[auth]` (FR-003).
2. **Levantar la base local** (aplica `supabase/migrations/` y `supabase/seed.sql`):
   ```bash
   pnpm dlx supabase start     # API http://127.0.0.1:54321 · Studio http://127.0.0.1:54323
   pnpm dlx supabase status    # muestra la clave publicable local
   ```
3. **Variables de entorno**: copiar `.env.example` a `.env.local` y completar con los valores
   locales:
   ```bash
   VITE_SUPABASE_URL=http://127.0.0.1:54321
   VITE_SUPABASE_PUBLISHABLE_KEY=<clave publicable local de `supabase status`>
   ```
4. **Crear al Administrador local**: en Studio → Authentication → *Add user* (email + contraseña,
   *Auto Confirm*). Copiar su `UUID` y en el SQL Editor de Studio:
   ```sql
   insert into public.admins (user_id) values ('<UUID>');
   ```
5. Levantar el sitio:
   ```bash
   pnpm install
   pnpm dev            # http://localhost:5173
   ```

**Volver al estado inicial**: `pnpm dlx supabase db reset` reaplica la migración y el seed.
También borra los usuarios locales, así que después hay que repetir el paso 4.

## Datos de prueba sugeridos

`supabase/seed.sql` los carga solo en la base local (`supabase start` o `db reset`). Catálogo
base usado en los escenarios:

| Título | Tipo | Estado | Total / Vistos | Estrellas | Favorita | Géneros |
|--------|------|--------|----------------|-----------|----------|---------|
| Frieren | Anime | Viendo | 28 / 12 | 4,5 | sí | Fantasía, Aventura |
| Fullmetal Alchemist: Brotherhood | Anime | Completado | 64 / 64 | 5 | sí | Acción, Fantasía |
| Shingeki no Kyojin | Anime | Completado | 87 / 87 | 4 | sí | Acción |
| Spy x Family | Anime | Pendiente | — | — | no | Comedia |
| Mirai Nikki | Anime | Abandonado | 26 / 10 | 2 | no | Thriller |
| Naruto | Anime | Completado | 220 / 220 | 3,5 | no | Shōnen |
| Berserk | Manga | Leyendo | — / 120 | 5 | sí | Fantasía oscura |
| Naruto | Manga | Completado | 700 / 700 | 4 | no | Shōnen |
| Chainsaw Man | Manga | Pendiente | — | — | no | Acción |
| Un isekai con un título de más de 150 caracteres para probar que la tarjeta no se rompa ni deforme la grilla en ninguna pantalla, ni chica ni grande, nunca jamás | Anime | Pendiente | — | — | no | — |

Ranking (incluido en el seed): 1 Shingeki no Kyojin, 2 Fullmetal Alchemist: Brotherhood.
Frieren queda favorita **sin** posición.

Valores esperados con ese catálogo: Inicio → **3** animes vistos, **4** favoritos,
**1** manga leído.

**Orden de los escenarios**: V1–V3, V8 y V9 dan por hecho el seed recién cargado. V5–V7 y V10 lo
modifican. Si hace falta, `db reset` (y el paso 4 del setup) entre medio.

## Escenarios de validación (navegador, ventana de incógnito salvo indicación)

### V1 — Vista pública sin cuenta (US1, FR-017, FR-019, SC-006)

1. Abrir `/`. → Inicio con menú y los contadores 3 / 4 / 1. Sin pedido de login.
2. Recorrer cada ítem del menú. → Llegan las 7 secciones.
3. Buscar en todas las páginas públicas (y en el HTML con *Ver código fuente* / DevTools) la
   palabra `login` o `dashboard`. → No aparece ningún enlace ni botón Agregar/Editar/Eliminar.
4. En `/animes`, la tarjeta del isekai largo se recorta con `…` sin desalinear la grilla
   (escritorio y modo celular de DevTools, 375 px). (SC-007)
5. Editar desde el panel la URL de portada de una obra a `https://example.com/no-existe.jpg`. →
   En la vista pública se ve la imagen de reemplazo, sin romper la tarjeta.
6. Las favoritas se ven destacadas; Spy x Family muestra "Sin calificar" y no deja huecos.

### V2 — Detalle (US2, FR-018)

1. Tocar la tarjeta de Frieren. → `/animes/<id>` con todos los datos, barra "12 / 28".
2. Copiar la URL y abrirla en otra ventana de incógnito. → Misma obra.
3. Abrir `/animes/999999` y `/mangas/<id de Frieren>`. → "Obra no encontrada" con link al
   catálogo.

### V3 — Filtros (US3, FR-023, SC-003)

1. `/mangas` → filtro Estado "Completado". → Solo Naruto (manga).
2. `/animes` → "Solo favoritos". → Frieren, FMA:B, SnK.
3. Agregar Estado "Viendo". → Solo Frieren. La URL refleja ambos filtros.
4. Estado "Abandonado" + favoritos. → "Aún no hay obras en esta categoría" + "Ver todo".
5. "Ver todo". → Vuelven todos los animes en un solo clic.
6. Atrás del navegador restaura el filtro anterior.
7. **Catálogo de 200 obras (SC-003)**: en el SQL Editor de Studio **local**, sumar 190 obras al
   seed:
   ```sql
   insert into public.works (title, type, status, cover_url)
   select 'Obra de prueba ' || g,
          (case when g % 2 = 0 then 'anime' else 'manga' end)::public.work_type,
          (array['pending','in_progress','completed','dropped'])[1 + g % 4]::public.work_status,
          'https://example.com/cover-' || g || '.jpg'
   from generate_series(1, 190) as g;
   ```
   Recargar `/animes` y aplicar y quitar filtros. → La grilla responde al instante (< 1 s), sin
   paginación, y las portadas rotas muestran el reemplazo. Al terminar, `db reset`.

### V4 — Acceso del Administrador (US4, FR-001–FR-007)

1. Sin sesión, abrir `/dashboard` y `/dashboard/obras/nueva`. → Redirige a `/`.
2. `/login` con contraseña incorrecta. → "El email o la contraseña no son correctos." (mismo
   mensaje con email incorrecto).
3. `/login` con credenciales correctas. → `/dashboard`.
4. "Cerrar sesión" y volver a abrir `/dashboard`. → Redirige a `/`.
5. En `/login` no hay opción de registro ni de recuperar contraseña.

### V5 — Alta de obra (US5, FR-009–FR-013)

1. Cargar «Dandadan» completa (anime, Viendo, total 12, vistos 5, géneros, reseñas, 4 estrellas).
   → Aparece en `/animes` y en su detalle (otra ventana, recargar).
2. Intentar guardar sin título / sin portada / sin estado. → No guarda; mensaje en el campo.
3. Cargar anime " naruto " (minúsculas y espacios). → "Ya cargaste «Naruto» como anime." +
   "Editar esa obra" lleva a su edición.
4. Cargar manga "Frieren" (en el seed solo existe como anime). → Se acepta.
5. Vistos 13 con total 12. → "No puede superar el total (12)".
6. Cargar «Blue Lock» (anime, Pendiente) solo con título, tipo, estado y portada, dejando Vistos
   vacío. → Se acepta (vistos = 0); la tarjeta se ve completa.
7. Tiempo de alta completa con el formulario < 3 min. (SC-004)

### V6 — Edición, progreso y baja (US6, FR-014, FR-032)

1. Chainsaw Man: Pendiente → Completado con total 200. → En público: "Completado", barra llena
   "200 / 200", ya no figura en `/pendientes`.
2. Frieren: vistos 12 → 13. → Barra "13 / 28" al recargar.
3. Renombrar Mirai Nikki a "Frieren" (anime). → Error de duplicado.
4. Eliminar Mirai Nikki → aparece confirmación; Cancelar → sigue intacta; Confirmar →
   desaparece de panel, `/animes`, `/estadisticas`.

### V7 — Favoritas y Ranking (US7, FR-016, FR-026)

1. `/ranking` → 1 SnK (4★), 2 FMA:B (5★): el orden respeta posiciones, no estrellas. Frieren no
   aparece.
2. En `/dashboard/ranking` intercambiar 1 y 2 y guardar. → Orden invertido, sin duplicados.
3. Intentar agregar un 11.º anime. → No se permite.
4. Desmarcar favorito de SnK. → Sale del Ranking y de "Solo favoritos"; deja de destacarse. En
   `/ranking`, FMA:B pasa a verse como **#1** (sin hueco, aunque su posición guardada siga en 2).
5. En `/dashboard/ranking`, agregar a Frieren debajo de FMA:B y guardar.
   Anotar el orden de `/animes`. → Guardar el Ranking no cambia el orden de la grilla.
6. Eliminar FMA:B desde el panel. → `/ranking` muestra a Frieren como **#1**, sin hueco. En el
   detalle de Frieren aparece "En mi top 10".
7. Abrir `/dashboard/ranking` en dos pestañas. En la B, desmarcar a Frieren como favorita. En la A,
   guardar el Ranking sin recargar. → "No pudimos guardar el Ranking: hay más de 10 animes o
   alguno ya no es favorito. Recargá y probá de nuevo." y el Ranking anterior queda intacto.
8. Vaciar el Ranking. → `/ranking` muestra el estado vacío.

### V8 — Estadísticas (US8, FR-024, FR-025, SC-008)

1. Comparar contadores de Inicio con un conteo manual de la tabla de datos de prueba.
2. `/estadisticas`: gráfico por estado ("En curso" para Viendo/Leyendo), anime vs. manga y por
   género. Con el seed recién cargado, Fantasía suma 2 (Frieren y FMA:B, que también suma en Acción) y el isekai
   cuenta en "Sin género".
3. Berserk (sin total) muestra "120 capítulos leídos", sin porcentaje.
4. Base vacía: en el SQL Editor de Studio **local**, `truncate public.works, public.genres
   restart identity cascade;`. → Inicio en 0 / 0 / 0 y gráficos con estado vacío, sin errores en
   consola. Después, `db reset` (y el paso 4 del setup). **Nunca** correr esto en producción.

### V9 — Pendientes y Ruleta (US9, FR-027, FR-028)

1. `/pendientes` → Spy x Family, Chainsaw Man (si sigue pendiente), isekai largo. Nada más.
2. `/ruleta` → "Anime" elegido por defecto. Girar 5 veces: siempre un anime pendiente, nunca el
   mismo dos veces seguidas (hay 2).
3. Cambiar a "Manga" y girar. → Solo mangas pendientes. Si no hay: mensaje amigable y botón para
   pasar a Anime.

### V10 — Sesión vencida (FR-015, SC-009)

1. Con sesión, abrir `/dashboard/obras/nueva` y completar varios campos.
2. En otra pestaña, ejecutar *Cerrar sesión* (o borrar `sb-*-auth-token` de `localStorage` en
   DevTools).
3. Volver a la primera pestaña. → El formulario sigue abierto: **no** te saca a `/`. Escribir
   algo más.
4. Guardar. → Aviso de sesión vencida, `/login` con el mensaje correspondiente.
5. Iniciar sesión. → Vuelve al formulario con todos los datos que había escrito (incluido lo del
   paso 3) y un aviso visible.
6. Sin guardar, ir a `/dashboard` y volver a "Agregar obra". → "Recuperamos lo que estabas
   cargando". "Descartar borrador" deja el formulario vacío.
7. Repetir los pasos 2 y 4 en `/dashboard/ranking` con un cambio sin guardar. → Mismo aviso y
   `/login`; al volver, el Ranking muestra lo último guardado (sin borrador, FR-015).

## Verificación de seguridad desde afuera (Principio V, SC-006)

Con la clave publicable (la misma que ve cualquier visitante en el bundle). Primero contra la
base local y, después del deploy, contra producción:

```bash
URL=http://127.0.0.1:54321          # producción: https://<ref>.supabase.co
KEY=<clave publicable>              # la de `supabase status` o la de producción
H=(-H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json")

# Lectura pública: 200 con datos (en producción recién publicada: [])
curl -s "${H[@]}" "$URL/rest/v1/works?select=id,title&limit=3"

# Escrituras anónimas: deben fallar (42501) o no afectar filas ([])
curl -s "${H[@]}" -X POST "$URL/rest/v1/works" \
  -d '{"title":"hack","type":"anime","status":"pending","cover_url":"https://x.y/z.jpg"}'
curl -s "${H[@]}" -H "Prefer: return=representation" -X PATCH "$URL/rest/v1/works?id=gt.0" -d '{"title":"hack"}'
curl -s "${H[@]}" -H "Prefer: return=representation" -X DELETE "$URL/rest/v1/works?id=gt.0"
curl -s "${H[@]}" -X POST "$URL/rest/v1/rpc/set_anime_ranking" -d '{"p_work_ids":[]}'

# Tabla de admins invisible: []
curl -s "${H[@]}" "$URL/rest/v1/admins"

# Registro deshabilitado: error "Signups not allowed"
curl -s -H "apikey: $KEY" -H "Content-Type: application/json" -X POST "$URL/auth/v1/signup" \
  -d '{"email":"intruso@example.com","password":"12345678"}'
```

Resultado esperado: solo la primera llamada devuelve datos; ninguna otra modifica nada (confirmar
recargando la vista pública). El registro deshabilitado en local depende de `enable_signup = false`
en `supabase/config.toml`.

## Cierre de la feature (Constitución, Flujo de trabajo)

En local:

```bash
pnpm lint      # sin errores
pnpm build     # tsc + vite build sin errores
pnpm preview   # repetir V1–V3 sobre el build de producción (contra la base local)
```

Con V1–V10 y los `curl` en verde contra la base local, recién ahí se publica.

## Paso a producción (cuando todo pasó en local)

1. **Proyecto de producción**: crear el proyecto en Supabase y aplicarle la migración, con una de
   estas dos opciones:
   - SQL Editor del proyecto → pegar y ejecutar `supabase/migrations/0001_init.sql`.
   - `pnpm dlx supabase link --project-ref <ref>` y después `pnpm dlx supabase db push`.

   **No** ejecutar `supabase/seed.sql`.
2. **Desactivar registro**: Authentication → Sign In / Providers → Email: desactivar
   *"Allow new users to sign up"*.
3. **Crear al Administrador**: Authentication → Users → *Add user* (*Auto Confirm*) y en el SQL
   Editor: `insert into public.admins (user_id) values ('<UUID>');`.
4. **Vercel**: cargar `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` de producción en
   Settings → Environment Variables (nunca en `.env.local` ni en el repo; **nunca** la clave
   `service_role`/secret) y desplegar.
5. **Verificar el deploy**: los `curl` de seguridad contra producción y que `/login` y `/dashboard`
   respondan con `X-Robots-Tag: noindex`:
   `curl -sI https://otakuteca.ntech.studio/login | grep -i x-robots-tag`.
6. **Cargar el catálogo real** a mano desde `/dashboard` del deploy.
7. Lighthouse (modo móvil, incógnito) sobre `/` con el catálogo real: contenido visible < 3 s
   (SC-001).
