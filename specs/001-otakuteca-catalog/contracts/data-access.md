# Contract: Acceso a datos (Supabase)

**Feature**: `001-otakuteca-catalog` | Esquema y reglas en [data-model.md](../data-model.md).

El cliente habla con Supabase (PostgREST + Auth) mediante un único cliente en
`src/lib/supabase.ts`, creado con `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`. Esta es
toda la superficie que el sitio usa; nada fuera de esta lista.

## Autenticación

| Operación | Llamada | Resultado esperado |
|-----------|---------|--------------------|
| Iniciar sesión | `auth.signInWithPassword({ email, password })` | OK → sesión; error `invalid_credentials` → mensaje genérico (FR-007) |
| Cerrar sesión | `auth.signOut()` | Sesión eliminada; redirige a `/` (FR-006) |
| Sesión actual | `auth.getSession()` + `auth.onAuthStateChange` | Alimenta `RequireAdmin` |
| Es admin | consulta trivial con `is_admin()` vía RPC `rpc('is_admin')` | `true` solo para el usuario en `admins` |
| Registro | **no se usa**; desactivado en el proyecto Supabase | Cualquier `signUp` externo falla (FR-003) |

## Lectura pública (rol `anon` o `authenticated`)

| ID | Operación | Llamada |
|----|-----------|---------|
| R-1 | Catálogo completo | `from('works').select('*, genres(id, name)')` |
| R-2 | Una obra | `from('works').select('*, genres(id, name)').eq('id', id).eq('type', type).maybeSingle()` → `null` = "Obra no encontrada" |
| R-3 | Géneros | `from('genres').select('id, name').order('name')` |
| R-4 | Uso de un género | `from('work_genres').select('*', { count: 'exact', head: true }).eq('genre_id', id)` |

R-1 alimenta Inicio, Animes, Mangas, Ranking, Estadísticas, Pendientes, Ruleta y `/dashboard`;
todo lo demás se deriva en el cliente (ver "Valores derivados" en el data model). Orden y filtros
se aplican en memoria.

## Escritura (solo Administrador; RLS exige `is_admin()`)

| ID | Operación | Llamada |
|----|-----------|---------|
| W-1 | Alta de obra | `from('works').insert(payload).select('id').single()` y luego W-4 |
| W-2 | Edición de obra | `from('works').update(payload).eq('id', id).select('id')` y luego W-4 |
| W-3 | Baja de obra | `from('works').delete().eq('id', id).select('id')` (cascade en `work_genres`) |
| W-4 | Reemplazar géneros de una obra | `delete` de `work_genres` del `work_id` que no estén en la selección + `insert` de los nuevos |
| W-5 | Alta de género | `from('genres').insert({ name })` |
| W-6 | Renombrar género | `from('genres').update({ name }).eq('id', id).select('id')` |
| W-7 | Baja de género | `from('genres').delete().eq('id', id).select('id')` (cascade: se quita de sus obras) |
| W-8 | Guardar Ranking | `rpc('set_anime_ranking', { p_work_ids: number[] })` |

`payload` = columnas editables de `works`: `title`, `type`, `status`, `cover_url`,
`short_review`, `long_review`, `parts`, `total_units`, `progress`, `rating`, `is_favorite`.
Strings vacíos se envían como `null`. `ranking_position` **no** se envía desde el formulario: solo
la modifica W-8 (o el trigger al desmarcar favorito).

**Importante**: para `update`/`delete`, RLS no devuelve error si el rol no tiene permiso: afecta
0 filas en silencio. Por eso W-2, W-3, W-6 y W-7 piden `.select('id')` y, si vuelven 0 filas sobre
un id que existe, el cliente lo trata como sesión vencida (flujo FR-015), nunca como éxito.

### `set_anime_ranking(p_work_ids bigint[]) returns void`

- Precondición: sesión de admin.
- `p_work_ids`: 0 a 10 ids distintos de animes favoritos, en el orden del top. `[]` vacía el
  Ranking.
- Postcondición: exactamente esos ids tienen `ranking_position` 1..n en ese orden; el resto `null`.
  Atómico: si algo falla, el Ranking anterior queda intacto.

## Errores y traducción a mensajes

| Origen | Código / señal | Mensaje en la UI | Acción |
|--------|----------------|------------------|--------|
| Índice `works_title_type_key` | `23505` | "Ya cargaste «{título}» como {anime/manga}." | Buscar la existente y ofrecer "Editar esa obra" (FR-012) |
| Índice `genres_name_key` | `23505` | "Ese género ya existe." | — |
| Check de progreso | `23514` | "Los vistos/leídos no pueden superar el total." | Marcar campo |
| Otros checks | `23514` | "Revisá los datos marcados." | Marcar campo según nombre del constraint |
| RPC ranking: no admin | `42501` | — | Tratar como sesión vencida |
| RPC ranking: inválido | `22023` / `23514` | "Solo podés rankear hasta 10 animes favoritos." | — |
| Sesión vencida / sin permiso | HTTP 401, `PGRST301` (JWT vencido), `42501` (RLS en insert) o 0 filas en update/delete | Ver flujo FR-015 | Conservar borrador → `/login?next=…&motivo=sesion` |
| Red / 5xx | — | "No pudimos guardar. Revisá tu conexión y probá de nuevo." | El formulario queda como estaba |

## Garantías verificables desde afuera (Principio V, SC-006)

Con solo la clave publicable (rol `anon`):

- `GET /rest/v1/works` → 200 con el catálogo.
- `POST`, `PATCH`, `DELETE` sobre `works`, `genres`, `work_genres` → rechazados (401/403 o 0 filas
  afectadas).
- `POST /rest/v1/rpc/set_anime_ranking` → error `42501`.
- `GET /rest/v1/admins` → lista vacía (RLS sin políticas).
- `POST /auth/v1/signup` → error "Signups not allowed".

Los comandos exactos están en [quickstart.md](../quickstart.md).
