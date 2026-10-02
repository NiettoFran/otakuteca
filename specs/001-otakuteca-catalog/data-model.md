# Data Model: Otakuteca v1

**Feature**: `001-otakuteca-catalog` | **Fecha**: 2026-10-01 | **Plan**: [plan.md](./plan.md)

Base: Postgres (Supabase), esquema `public`. Nombres técnicos en inglés; etiquetas visibles en
español (Constitución, Restricciones técnicas). La migración real vive en
`supabase/migrations/0001_init.sql`; este documento define su contenido esperado.

## Diagrama

```text
auth.users (Supabase) 1 ──── 0..1 admins
                                   (is_admin() la consulta)

works  N ──── work_genres ──── N  genres
```

---

## Enums

| Tipo | Valores | Etiqueta visible |
|------|---------|------------------|
| `work_type` | `anime`, `manga` | Anime, Manga |
| `work_status` | `pending`, `in_progress`, `completed`, `dropped` | Pendiente, Viendo (anime) / Leyendo (manga), Completado, Abandonado |

`in_progress` es el estado "Consumiendo" de la spec: un único valor guardado que se muestra según
el tipo (FR-022).

---

## Entidad: `works` (Obra)

| Columna | Tipo | Nulo | Default | Regla / Origen |
|---------|------|------|---------|----------------|
| `id` | `bigint generated always as identity` | no | — | PK; usado en `/animes/:id`, `/mangas/:id` |
| `title` | `text` | no | — | Obligatorio; 1–200 caracteres tras recortar (FR-009) |
| `type` | `work_type` | no | — | Obligatorio (FR-009) |
| `status` | `work_status` | no | — | Obligatorio; un único valor (FR-010) |
| `cover_url` | `text` | no | — | Obligatorio; debe empezar con `http://` o `https://` (FR-009, R12) |
| `short_review` | `text` | sí | `null` | Opcional; se recorta en tarjeta (FR-030) |
| `long_review` | `text` | sí | `null` | Opcional; solo en detalle |
| `parts` | `integer` | sí | `null` | Temporadas (anime) / tomos (manga); informativo; ≥ 1 |
| `total_units` | `integer` | sí | `null` | Total de episodios / capítulos; ≥ 1; `null` = desconocido (en emisión) |
| `progress` | `integer` | no | `0` | Episodios vistos / capítulos leídos; ≥ 0 y ≤ `total_units` si existe. Vacío en el formulario → `0` (el cliente nunca envía `null`, FR-009) |
| `rating` | `numeric(2,1)` | sí | `null` | 0,5–5 en pasos de 0,5; `null` = "Sin calificar" |
| `is_favorite` | `boolean` | no | `false` | (FR-009) |
| `ranking_position` | `smallint` | sí | `null` | 1–10; única; solo si `type = 'anime'` y `is_favorite` (FR-016). Puede tener huecos (p. ej. 1, 3) tras una baja o al desmarcar favorito; el sitio numera por orden, no por este valor (FR-026) |
| `created_at` | `timestamptz` | no | `now()` | Fecha de alta |
| `updated_at` | `timestamptz` | no | `now()` | Última modificación (trigger, sin contar cambios de `ranking_position`); define el orden por defecto |

### Restricciones

```sql
check (char_length(btrim(title)) between 1 and 200)
check (cover_url ~* '^https?://')
check (parts is null or parts >= 1)
check (total_units is null or total_units >= 1)
check (progress >= 0)
check (total_units is null or progress <= total_units)                 -- FR-013
check (rating is null or (rating between 0.5 and 5 and rating * 2 = trunc(rating * 2)))
check (ranking_position is null or ranking_position between 1 and 10)
check (ranking_position is null or (type = 'anime' and is_favorite))   -- FR-016

unique index works_title_type_key on works (type, lower(btrim(title)))  -- FR-011 / RN3
unique (ranking_position)                                                -- nulls no colisionan
```

### Normalización automática (trigger `works_before_write`, BEFORE INSERT OR UPDATE)

1. `title := btrim(title)`.
2. Si `status = 'completed'` y `total_units` no es nulo → `progress := total_units`
   (Edge case "Pasar a Completado").
3. Si `is_favorite = false` o `type <> 'anime'` → `ranking_position := null`
   (FR-016: al dejar de ser favorito pierde su posición).
4. `updated_at := now()` en los `INSERT` y en los `UPDATE` que cambian alguna columna además de
   `ranking_position` (comparando `to_jsonb(new) - 'ranking_position' - 'updated_at'` contra
   `old`). Así, guardar el Ranking no altera el orden por defecto de las grillas.

El formulario replica 2 y 3 para que el Administrador lo vea antes de guardar; la base lo
garantiza igual.

### Transiciones de estado

Cualquier estado puede pasar a cualquier otro (no hay flujo obligatorio). El nuevo valor reemplaza
al anterior (FR-010). Efectos:

| Transición | Efecto |
|------------|--------|
| `* → completed` con total conocido | `progress = total_units` (barra llena) |
| `pending → *` | La obra sale de Pendientes y de la Ruleta |
| `* → pending` | La obra entra en Pendientes y en la Ruleta de su tipo |
| `is_favorite: true → false` | Pierde `ranking_position`; deja de destacarse y de figurar en "Favoritos". Los animes que estaban debajo en el Ranking suben un puesto en lo que ve el público (numeración por orden) |
| Baja de una obra rankeada | Igual que el caso anterior: queda un hueco en `ranking_position`, invisible para el público |

---

## Entidad: `genres` (Género)

| Columna | Tipo | Nulo | Regla |
|---------|------|------|-------|
| `id` | `bigint generated always as identity` | no | PK |
| `name` | `text` | no | 1–40 caracteres tras recortar; único sin distinguir mayúsculas (FR-016b) |

```sql
check (char_length(btrim(name)) between 1 and 40)
unique index genres_name_key on genres (lower(btrim(name)))
```

## Relación: `work_genres`

| Columna | Tipo | Regla |
|---------|------|-------|
| `work_id` | `bigint` | FK → `works.id` `on delete cascade` |
| `genre_id` | `bigint` | FK → `genres.id` `on delete cascade` (borrar un género lo quita de sus obras, FR-016b) |

PK `(work_id, genre_id)`. Índice en `genre_id` para contar obras por género.

## Entidad: `admins`

| Columna | Tipo | Regla |
|---------|------|-------|
| `user_id` | `uuid` | PK, FK → `auth.users.id` `on delete cascade` |

Una sola fila, insertada a mano tras crear el usuario en Supabase Auth (ver
[quickstart.md](./quickstart.md)). RLS activado y **sin políticas**: nadie la lee por la API; solo
`is_admin()`.

```sql
create function public.is_admin() returns boolean
  language sql stable security definer set search_path = ''
  as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;
```

---

## Row Level Security (FR-005, Principio V)

| Tabla | `select` | `insert` / `update` / `delete` |
|-------|----------|--------------------------------|
| `works` | `anon`, `authenticated`: `true` | `authenticated` con `is_admin()` (`using` y `with check`) |
| `genres` | `anon`, `authenticated`: `true` | `authenticated` con `is_admin()` |
| `work_genres` | `anon`, `authenticated`: `true` | `authenticated` con `is_admin()` |
| `admins` | — (sin políticas) | — |

Todas las obras son públicas en v1 (Assumptions: Visibilidad).

## Función RPC: `set_anime_ranking(p_work_ids bigint[])`

`security invoker` (RLS sigue aplicando). En una transacción:

1. Si `not is_admin()` → error `42501`.
2. Si `cardinality(p_work_ids) > 10` o hay ids repetidos → error `22023`.
3. Si `(select count(*) from public.works where id = any(p_work_ids) and type = 'anime' and
   is_favorite) <> cardinality(p_work_ids)` → error `22023`. Cubre ids inexistentes y obras que no
   son animes favoritos. Esta validación tiene que ser explícita: el `CHECK` no alcanza, porque el
   trigger `works_before_write` corre antes y pondría `ranking_position := null` en silencio.
4. `update works set ranking_position = null where ranking_position is not null`.
5. Asigna `ranking_position = ordinal` (1..n) a cada id en el orden recibido
   (`unnest(p_work_ids) with ordinality`).

Como es una sola llamada, cualquier error revierte todo: nunca queda un estado intermedio.

Contrato completo en [contracts/data-access.md](./contracts/data-access.md).

---

## Tipos de cliente (`src/lib/types.ts`)

```ts
type WorkType = 'anime' | 'manga'
type WorkStatus = 'pending' | 'in_progress' | 'completed' | 'dropped'
type Genre = { id: number; name: string }
type Work = {
  id: number
  title: string
  type: WorkType
  status: WorkStatus
  cover_url: string
  short_review: string | null
  long_review: string | null
  parts: number | null
  total_units: number | null
  progress: number
  rating: number | null
  is_favorite: boolean
  ranking_position: number | null
  created_at: string
  updated_at: string
  genres: Genre[] // embebido vía work_genres
}
```

Escritos a mano (esquema chico); no se usa `supabase gen types` en v1.

---

## Valores derivados (cliente, funciones puras)

| Valor | Definición | Requisito |
|-------|------------|-----------|
| Etiqueta de estado | `in_progress` → "Viendo" (anime) / "Leyendo" (manga); resto según tabla de enums | FR-022 |
| Unidad | anime: "episodios" / "temporadas"; manga: "capítulos" / "tomos" | FR-021 |
| Progreso con total | barra `progress / total_units` + texto "X / Y" | FR-021 |
| Progreso sin total | sin porcentaje; texto "X episodios vistos" / "X capítulos leídos" (barra indeterminada o ausente) | Edge case "Progreso inconsistente" |
| Estrellas | `rating` → 5 íconos con medias; `null` → "Sin calificar" | FR-020 |
| Orden por defecto de grillas | favoritas primero; luego `updated_at` desc | Assumptions |
| Animes vistos (Inicio) | `type = anime ∧ status = completed` | FR-024 |
| Favoritos (Inicio) | `is_favorite` (anime + manga) | FR-024 |
| Mangas leídos (Inicio) | `type = manga ∧ status = completed` | FR-024 |
| Distribución por estado | conteo por `status` (etiqueta neutra "En curso" cuando mezcla tipos) | FR-022, FR-025 |
| Anime vs. manga | conteo por `type`, desglosado por estado | FR-025 |
| Por género | conteo de obras por género (una obra suma en cada uno); obras sin géneros → "Sin género" | FR-025 |
| Ranking | `type = anime ∧ ranking_position ≠ null`, orden ascendente, máx. 10; se numera por índice (1..n), no por `ranking_position` | FR-026 |
| Pendientes | `status = pending` (ambos tipos) | FR-027 |
| Ruleta | aleatorio entre `status = pending ∧ type = elegido`, excluyendo el último resultado si hay > 1 | FR-028 |
| Filtros | `estado` (uno de los 4) ∧ `favoritos` (bool), combinables | FR-023 |

## Volumen

≤ 200 obras, ≤ ~50 géneros, 1 administrador (Assumptions). Una única consulta trae todo el
catálogo con géneros embebidos.
