# Contract: Rutas y UI

**Feature**: `001-otakuteca-catalog` | Ver [data-model.md](../data-model.md) para los datos que muestra cada ruta.

Es la interfaz que el sitio expone a visitantes y al Administrador. Todo texto visible va en
español de Argentina con voseo (FR-033).

## Rutas públicas (`PublicLayout`: menú + footer, sin sesión requerida)

| Ruta | Página | Query params | Contenido / comportamiento | Requisitos |
|------|--------|--------------|----------------------------|------------|
| `/` | Inicio | — | 3 contadores: Animes vistos, Favoritos, Mangas leídos; en 0 si el catálogo está vacío | FR-024, US8 |
| `/animes` | Animes | `estado`, `favoritos` | Grilla de animes + filtros | FR-020, FR-023, US1, US3 |
| `/animes/:id` | Detalle | — | Toda la info de la obra; "Obra no encontrada" si el id no existe o es manga | FR-018, US2 |
| `/mangas` | Mangas | `estado`, `favoritos` | Grilla de mangas + filtros | FR-020, FR-023 |
| `/mangas/:id` | Detalle | — | Ídem, para mangas | FR-018 |
| `/ranking` | Ranking | — | Hasta 10 animes ordenados por `ranking_position` y numerados 1..n por orden (sin huecos aunque falte una posición), con estrellas y link al detalle | FR-026, US7 |
| `/estadisticas` | Estadísticas | — | Gráficos: por estado, anime vs. manga, por género | FR-025, US8 |
| `/pendientes` | Pendientes | — | Grilla de obras `pending` (anime y manga) | FR-027, US9 |
| `/ruleta` | Ruleta | `tipo` (`anime` por defecto \| `manga`) | Selector Anime/Manga, botón "¡Girá la ruleta!", resultado con la info completa del detalle, "Otra opción" | FR-028, US9 |
| `*` | 404 | — | "Acá no hay nada" + link a Inicio | — |

### Menú público

Ítems en este orden: Inicio · Animes · Mangas · Ranking · Estadísticas · Pendientes · Ruleta.
Presente en todas las páginas públicas, usable en celular (menú colapsable). **Nunca** incluye
enlaces a `/login` o `/dashboard`, ni siquiera con sesión iniciada (FR-002, FR-019).

### Filtros (`/animes`, `/mangas`)

| Param | Valores | Etiqueta |
|-------|---------|----------|
| `estado` | `pendiente`, `en-curso`, `completado`, `abandonado` | Pendiente, Viendo/Leyendo, Completado, Abandonado |
| `favoritos` | `1` (ausente = todos) | "Solo favoritos" |

- Valores desconocidos se ignoran (se muestra todo).
- Combinables (AND). Botón "Ver todo" visible cuando hay algún filtro activo: navega a la ruta sin
  query (un solo paso).
- Sin resultados → estado vacío "Aún no hay obras en esta categoría" + "Ver todo" (US3-4).

### Tarjeta de obra (Animes, Mangas, Pendientes)

Portada 3:4 (fallback `/cover-fallback.svg`), título (máx. 2 líneas con `…`), hasta 3 géneros +
"+N", reseña breve (máx. 3 líneas), estrellas o "Sin calificar", estado, barra de progreso con
"X / Y" (o "X episodios vistos" sin total). Favoritas: borde/insignia dorada. Toda la tarjeta es un
link al detalle. Bloques opcionales vacíos se omiten (FR-020, FR-021, FR-030).

### Detalle de obra (detalle y resultado de la Ruleta)

Portada, título completo, tipo, todos los géneros, estrellas, estado, barra de progreso,
temporadas/tomos (si hay), reseña breve, reseña ampliada, marca de favorita y, si aplica,
la insignia "En mi top 10" con link a `/ranking` (sin número: el detalle carga una sola obra y no
puede calcular el puesto visible, que depende de las demás; ver FR-026). Sin controles de edición.

### Estados vacíos (FR-029)

| Lugar | Mensaje |
|-------|---------|
| Sección/grilla/filtro sin obras | "Aún no hay obras en esta categoría" |
| Ranking vacío | "Todavía no armé mi top. ¡Volvé pronto!" |
| Gráfico sin datos | "Todavía no hay datos para este gráfico" |
| Ruleta sin pendientes del tipo | "No tengo [animes/mangas] pendientes. Probá con [mangas/animes]" + botón para cambiar |
| Error de red | "No pudimos cargar el catálogo. Probá recargar la página" |

## Rutas ocultas / privadas (cargadas con `React.lazy`)

| Ruta | Acceso | Contenido | Requisitos |
|------|--------|-----------|------------|
| `/login` | Oculta (sin enlaces) | Email + contraseña. Con sesión ya iniciada → redirige a `/dashboard` | FR-001, FR-002, FR-007 |
| `/dashboard` | Admin | Listado de todas las obras (título, tipo, estado, favorita) con Editar/Eliminar; botón "Agregar obra"; links a Géneros y Ranking; "Cerrar sesión". Vacío → invita a cargar la primera obra | FR-008, FR-006 |
| `/dashboard/obras/nueva` | Admin | Formulario de alta | FR-009, FR-013, US5 |
| `/dashboard/obras/:id` | Admin | Formulario de edición + "Eliminar" con confirmación | FR-008, FR-014, US6 |
| `/dashboard/generos` | Admin | Lista de géneros: crear, renombrar, eliminar (confirma con "Lo tienen N obras") | FR-016b |
| `/dashboard/ranking` | Admin | Animes favoritos: agregar al top (máx. 10), subir/bajar, quitar; "Guardar Ranking" | FR-016, US7 |

### Guard `RequireAdmin` (todo `/dashboard/*`)

| Situación | Resultado |
|-----------|-----------|
| Sin sesión al abrir cualquier `/dashboard/*` | `Navigate` a `/` (reemplaza historial) (FR-004, US4-1) |
| Sesión válida pero usuario no admin | Igual que sin sesión |
| Sesión cerrada con el botón "Cerrar sesión" del panel | Vuelve a `/` |
| La sesión se pierde con el panel ya abierto (vence o se cierra en otra pestaña) | **No** redirige: la página sigue abierta y editable. El guard solo decide al entrar; una vez admitido, ignora la pérdida de sesión (FR-004, FR-015) |
| Al guardar sin sesión válida (formulario de obra) | Borrador conservado → `/login?next=<ruta>&motivo=sesion` (FR-015) |
| Al guardar sin sesión válida (Ranking, Géneros, eliminar desde el listado) | Mismo aviso y `/login?next=<ruta>&motivo=sesion`; los cambios sin guardar se pierden (FR-015) |

### `/login`

| Query param | Efecto |
|-------------|--------|
| `next` | Ruta a la que volver tras ingresar; solo se acepta si empieza con `/dashboard`, si no se usa `/dashboard` |
| `motivo=sesion` | Muestra: "Tu sesión venció. Iniciá sesión de nuevo y recuperamos lo que estabas cargando." |

Credenciales incorrectas → "El email o la contraseña no son correctos." (mensaje único; FR-007).
No existe opción de registro ni de recuperación de contraseña (FR-003).

### Formulario de obra

| Campo | Control | Obligatorio | Validación (mensaje) |
|-------|---------|-------------|----------------------|
| Título | input | sí | "Poné un título" / máx. 200 |
| Tipo | toggle Anime/Manga | sí | — (cambia etiquetas de temporadas/tomos y episodios/capítulos) |
| Estado | select (4 opciones) | sí | "Elegí un estado" |
| URL de la portada | input url + vista previa | sí | "Pegá la URL de la portada" / "Tiene que empezar con http:// o https://" |
| Géneros | checkboxes de la lista | no | — |
| Reseña breve | textarea | no | — |
| Reseña ampliada | textarea | no | — |
| Temporadas / Tomos | number ≥ 1 | no | "Tiene que ser 1 o más" |
| Total episodios / capítulos | number ≥ 1 | no | "Tiene que ser 1 o más" |
| Vistos / Leídos | number ≥ 0 | no (vacío = 0) | "No puede superar el total (Y)" |
| Calificación | 10 pasos de media estrella + "Sin calificar" | no | — |
| Favorita | checkbox | no (default no) | Al desmarcar: aviso "Sale del Ranking" si tenía posición |

Al elegir "Completado" con total cargado, "Vistos/Leídos" se completa al total.

**Borrador**: el formulario (alta y edición) se guarda como borrador en cada cambio. Al abrirlo, si
hay borrador (por sesión vencida, por haber salido sin guardar o por un cierre de pestaña), se
recupera con el aviso "Recuperamos lo que estabas cargando" y el botón "Descartar borrador". Se
borra al guardar con éxito. Si en un alta la obra se guardó pero sus géneros no, se pasa a la
edición de esa obra con "Guardamos la obra, pero no sus géneros. Revisalos y guardá de nuevo."
(ver [data-access.md](./data-access.md#escritura-solo-administrador-rls-exige-is_admin)). Errores de la base
se traducen según [data-access.md](./data-access.md). Duplicado → "Ya cargaste «X» como anime." +
botón "Editar esa obra" (FR-012).

## Headers (`vercel.json`)

`/login` y `/dashboard/:path*` agregan `X-Robots-Tag: noindex, nofollow`. `sitemap.xml` lista solo
las rutas públicas de sección.
