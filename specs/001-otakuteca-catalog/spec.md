# Feature Specification: Otakuteca v1 — Catálogo público de anime y manga

**Feature Branch**: `001-otakuteca-catalog`

**Created**: 2026-10-01

**Status**: Draft

**Input**: User description: "Especificación: Otakuteca v1 — catálogo digital personal y público para centralizar y compartir el historial de consumo de anime y manga. Un único Administrador (el autor) carga, edita, elimina y marca favoritas las obras; los Visitantes ven el catálogo sin registrarse y lo filtran por Tipo, Estado y Favoritos."

## Contexto

Hoy el seguimiento de lo que el autor vio o leyó vive en su memoria o en aplicaciones de terceros complejas. Cuando un amigo pide recomendaciones o pregunta "¿qué estás viendo?", no hay una forma rápida y visual de compartirlo.

**Meta**: una web pública donde cualquiera vea en segundos el catálogo completo (qué se vio, qué se está viendo, favoritos y pendientes), con estadísticas y un ranking de favoritos, que funcione como escaparate personal y como registro histórico propio.

**Actores**:

- **Administrador (el autor)**: única persona con control total. Carga obras, actualiza estados y progreso, y marca favoritas.
- **Visitante (amigos / terceros)**: consumidor pasivo. Sin cuenta ni conocimientos técnicos. Entra por un enlace, navega las secciones, filtra y mira recomendaciones.

**Mapa del sitio**:

| Sección | Acceso | Qué muestra |
|---------|--------|-------------|
| Inicio | Público | Estadísticas generales: animes vistos, favoritos, mangas leídos |
| Animes | Público | Grilla de todos los animes, con filtros |
| Mangas | Público | Grilla de todos los mangas, con filtros |
| Ranking | Público | Top de animes favoritos en orden |
| Estadísticas | Público | Gráficos del catálogo, incluida una sección por género |
| Pendientes | Público | Obras en estado Pendiente |
| Ruleta | Público | Una obra pendiente elegida al azar (el visitante elige si anime o manga), con toda su información |
| Detalle de obra | Público | Toda la información de una obra |
| `/login` | Oculto | Inicio de sesión del Administrador; sin enlaces desde ninguna parte del sitio |
| `/dashboard` (y todo lo que cuelgue de él) | Privado | Panel de control del Administrador |

## Clarifications

### Session 2026-10-01

- Q: ¿Qué datos tiene una obra? → A: Título, género, URL de la portada, reseña breve (la que se muestra en la tarjeta), reseña ampliada, temporadas/episodios y estado (además del tipo y la marca de favorita ya definidos).
- Q: ¿Dónde vive la administración y cómo se entra? → A: Todo lo del Administrador vive bajo `/dashboard` y es 100 % privado; se entra por `/login`, que no está enlazado en ninguna parte de la web.
- Q: ¿Cómo se organiza la web? → A: Multipágina con las secciones Inicio, Animes, Mangas, Ranking, Estadísticas, Pendientes y Ruleta (antes "Elegir anime"), más una página de detalle por obra.
- Q: ¿Qué muestra el Inicio? → A: Estadísticas generales: cantidad de animes vistos, cantidad de favoritos y cantidad de mangas leídos; el resto de las estadísticas va en la página Estadísticas.
- Q: ¿Qué es el Ranking? → A: El orden de los animes favoritos del autor, como máximo un top 10.
- Q: ¿Qué hace la Ruleta? → A: Toma una obra al azar de los pendientes y la muestra con toda su información; el visitante elige si sortear entre animes o entre mangas.
- Q: ¿Qué incluye Estadísticas? → A: Varios gráficos para darle un toque profesional, con una sección por género.
- Q: ¿Anime y manga muestran progreso? → A: Sí, ambos tienen una barra de progreso.
- Q: ¿Cómo se ordena el Ranking? → A: Hay calificación con estrellas y el Ranking es manual: el Administrador asigna la posición de cada anime favorito (máximo 10); las estrellas se muestran pero no definen el orden.
- Q: ¿Cómo se mide la barra de progreso? → A: Anime: episodios vistos / total de episodios. Manga: capítulos leídos / total de capítulos. Temporadas y tomos son solo informativos.
- Q: ¿Cuántos géneros puede tener una obra? → A: Varios, elegidos de una lista de géneros que el Administrador mantiene en `/dashboard`; una obra suma en cada uno de sus géneros.
- Q: ¿Qué datos son obligatorios al cargar una obra? → A: Título, tipo, estado y URL de la portada. Géneros, reseñas, temporadas/tomos, totales, progreso y estrellas son opcionales.
- Q: ¿Las estrellas admiten medias? → A: Sí, de 0,5 a 5 en pasos de media estrella.
- Q: ¿La sección "Elegir anime" sortea solo animes? → A: No: se renombra a "Ruleta" y el visitante elige si sortear entre animes o mangas pendientes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navegar el catálogo público sin registrarse (Priority: P1)

Un amigo recibe el enlace de Otakuteca y lo abre. Llega al Inicio, ve los números generales y navega por las secciones Animes y Mangas, donde encuentra la grilla de obras: cada tarjeta muestra portada, título, géneros, reseña breve, calificación en estrellas, estado, barra de progreso y si es favorita. No se le pide cuenta ni ningún paso previo. (HU5, RF5, RN1)

**Why this priority**: es la razón de ser del producto. Sin vista pública no hay nada que compartir; con esta vista (y datos cargados) ya hay un MVP mostrable.

**Independent Test**: abrir la URL principal en una ventana de incógnito con obras ya cargadas, navegar a Animes y a Mangas desde el menú y verificar que se ven las grillas completas, sin pedido de inicio de sesión y sin ningún botón de "Agregar", "Editar" ni "Eliminar" ni enlace al inicio de sesión.

**Acceptance Scenarios**:

1. **Given** un catálogo con obras cargadas, **When** un visitante abre la URL principal desde una ventana de incógnito, **Then** ve el Inicio con el menú de secciones sin que se le pida iniciar sesión.
2. **Given** un visitante en cualquier página pública, **When** usa el menú, **Then** puede llegar a Inicio, Animes, Mangas, Ranking, Estadísticas, Pendientes y Ruleta.
3. **Given** un visitante en la sección Animes, **When** la recorre, **Then** ve solo animes, cada uno en una tarjeta con portada, título, géneros, reseña breve, calificación en estrellas, estado y barra de progreso.
4. **Given** un visitante en cualquier página pública, **When** la recorre, **Then** no encuentra controles para agregar, editar ni eliminar obras, ni enlaces a `/login` o `/dashboard`.
5. **Given** una obra marcada como favorita, **When** el visitante la ve en una grilla, **Then** está destacada visualmente respecto de las no favoritas.
6. **Given** un catálogo sin obras de un tipo, **When** el visitante entra a esa sección, **Then** ve el mensaje "Aún no hay obras en esta categoría" en lugar de una página en blanco o un error.

---

### User Story 2 - Ver el detalle de una obra (Priority: P1)

El visitante toca una tarjeta y llega a la página de detalle de la obra, con toda su información: portada, título, tipo, géneros, calificación en estrellas, estado, barra de progreso con temporadas/episodios (o tomos/capítulos), reseña breve, reseña ampliada y si es favorita.

**Why this priority**: la reseña ampliada es la recomendación real del autor; sin el detalle, la tarjeta no alcanza para recomendar.

**Independent Test**: desde Animes, tocar una tarjeta y verificar que se abre su detalle con todos los datos cargados; copiar la dirección del detalle, abrirla en otra ventana de incógnito y verificar que muestra la misma obra.

**Acceptance Scenarios**:

1. **Given** una grilla de obras, **When** el visitante toca una tarjeta, **Then** llega al detalle de esa obra con todos sus datos.
2. **Given** el detalle de una obra, **When** el visitante comparte su dirección, **Then** quien la abra ve esa misma obra directamente.
3. **Given** la dirección de una obra que fue eliminada o no existe, **When** alguien la abre, **Then** ve un mensaje amigable de "obra no encontrada" con una forma de volver al catálogo.

---

### User Story 3 - Filtrar animes y mangas por Estado y Favoritos (Priority: P1)

El visitante quiere saber qué recomienda el autor o qué está consumiendo. En las secciones Animes y Mangas (que ya separan por Tipo) usa los filtros para ver, por ejemplo, solo los mangas completados o solo los animes favoritos. (HU4, RF6)

**Why this priority**: sin filtros, un catálogo de decenas de obras no responde la pregunta concreta del visitante ("¿qué me recomendás?").

**Independent Test**: en la sección Animes, con obras en varios estados y algunas favoritas, aplicar cada filtro y sus combinaciones y verificar que la grilla muestra exactamente las obras que cumplen todas las condiciones.

**Acceptance Scenarios**:

1. **Given** la sección Mangas con obras en distintos estados, **When** el visitante filtra por Estado "Completado", **Then** la grilla muestra solo mangas completados.
2. **Given** la sección Animes con algunas favoritas, **When** el visitante activa el filtro "Favoritos", **Then** la grilla muestra solo animes favoritos.
3. **Given** filtros combinados (Estado "Viendo" + "Favoritos"), **When** el visitante los aplica, **Then** la grilla muestra solo los animes favoritos que se están viendo.
4. **Given** una combinación de filtros sin resultados, **When** el visitante la aplica, **Then** ve "Aún no hay obras en esta categoría" y una forma evidente de volver a ver todo.
5. **Given** filtros aplicados, **When** el visitante los limpia, **Then** vuelve a ver todas las obras de la sección.

---

### User Story 4 - Acceso exclusivo del Administrador (Priority: P1)

El autor entra por `/login`, una dirección que conoce de memoria y que no está enlazada en ninguna parte del sitio. Con sesión iniciada accede a `/dashboard`. Nadie más puede entrar: no existe registro de cuentas, y cualquier intento de abrir algo bajo `/dashboard` sin sesión válida termina en la vista pública. (RF1, RN1, CA3)

**Why this priority**: es condición necesaria para publicar el sitio.

**Independent Test**: desde una ventana de incógnito, abrir directamente `/dashboard` y la dirección de agregar obra bajo `/dashboard` y verificar que se redirige a la vista pública; luego abrir `/login`, ingresar las credenciales correctas y verificar que se accede al panel.

**Acceptance Scenarios**:

1. **Given** un visitante sin sesión, **When** intenta abrir cualquier dirección bajo `/dashboard` (p. ej. la de agregar obra), **Then** el sistema bloquea el acceso y lo redirige a la vista pública.
2. **Given** el Administrador en `/login`, **When** ingresa credenciales correctas, **Then** accede a `/dashboard`.
3. **Given** alguien en `/login`, **When** ingresa credenciales incorrectas, **Then** ve un mensaje de error claro que no revela cuál de los datos es incorrecto y no accede al panel.
4. **Given** el Administrador con sesión iniciada, **When** cierra sesión, **Then** pierde el acceso a `/dashboard` hasta volver a iniciar sesión.
5. **Given** cualquier persona, **When** busca una opción para crear una cuenta, **Then** no existe tal opción.

---

### User Story 5 - Agregar una obra al catálogo (Priority: P1)

Desde `/dashboard`, el Administrador carga un anime o manga con todos sus datos: título, tipo, uno o más géneros, URL de la portada, reseña breve, reseña ampliada, temporadas/episodios (o tomos/capítulos), progreso, estado, calificación en estrellas y si es favorita. La obra aparece de inmediato en la vista pública. (HU1, RF2, RF3, RN2, RN3)

**Why this priority**: sin carga de obras, el catálogo está vacío.

**Independent Test**: iniciar sesión, cargar una obra nueva con todos sus datos, abrir la vista pública en otra ventana de incógnito y verificar que la obra aparece en su sección y en su detalle con los datos cargados.

**Acceptance Scenarios**:

1. **Given** el Administrador en el panel, **When** carga "Frieren" como Anime con su portada, géneros Fantasía y Aventura, reseñas, episodios, 4,5 estrellas y estado "Viendo", **Then** la obra queda guardada y aparece en la sección Animes y en su detalle con esos datos.
2. **Given** el formulario de alta, **When** el Administrador intenta guardar sin título, tipo, estado o URL de la portada, **Then** el sistema no guarda e indica qué dato falta.
6. **Given** un anime que el Administrador todavía no vio, **When** lo carga como "Pendiente" con solo título, tipo, estado y portada, **Then** el alta se acepta y la tarjeta se ve completa, sin espacios rotos por los datos faltantes.
3. **Given** que ya existe el anime "Naruto", **When** el Administrador intenta agregar otro anime llamado "Naruto" (incluso escrito "naruto" o con espacios extra), **Then** el sistema rechaza el alta con un error y ofrece ir a editar la obra existente.
4. **Given** que ya existe el anime "Naruto", **When** el Administrador agrega el manga "Naruto", **Then** el alta se acepta, porque es otro formato.
5. **Given** el formulario de alta, **When** el Administrador elige un estado, **Then** solo puede elegir uno de los cuatro estados (nunca dos a la vez).

---

### User Story 6 - Editar, actualizar progreso o eliminar una obra (Priority: P2)

El Administrador corrige errores, actualiza el progreso o el estado de una obra (por ejemplo, pasar un manga de "Pendiente" a "Completado"), o elimina una obra cargada por error. Los cambios se ven al instante en la vista pública. (HU3, RF2, RN2, CA2)

**Why this priority**: mantener el catálogo al día lo hace confiable, pero el producto ya entrega valor con alta y vista pública.

**Independent Test**: iniciar sesión, cambiar el estado de un manga de "Pendiente" a "Completado", recargar la vista pública y verificar el nuevo estado y su progreso; luego eliminar una obra y verificar que desaparece de todas las secciones públicas.

**Acceptance Scenarios**:

1. **Given** un manga en estado "Pendiente", **When** el Administrador lo cambia a "Completado" y guarda, **Then** al recargar la vista pública el manga aparece como "Completado", con su barra de progreso llena, y ya no figura en Pendientes.
2. **Given** un anime en curso, **When** el Administrador actualiza cuántos episodios vio, **Then** la barra de progreso de la vista pública refleja el nuevo avance.
3. **Given** una obra existente, **When** el Administrador le cambia el título a uno que ya usa otra obra del mismo tipo, **Then** el sistema rechaza el cambio con un error claro.
4. **Given** una obra existente, **When** el Administrador elige eliminarla, **Then** el sistema pide confirmación antes de borrarla.
5. **Given** la confirmación de borrado, **When** el Administrador confirma, **Then** la obra desaparece del panel y de todas las secciones públicas (incluidos Ranking, Pendientes y Estadísticas); **When** cancela, **Then** la obra queda intacta.

---

### User Story 7 - Favoritas y Ranking (Priority: P2)

El Administrador marca ciertos animes y mangas como favoritos para destacarlos, y arma el Ranking a mano: le asigna a cada anime favorito que quiera rankear una posición del 1 al 10. El visitante entra a Ranking y ve ese top en orden, con las estrellas de cada anime. (HU2, RF4)

**Why this priority**: es el diferencial de "recomendación" del catálogo, pero depende de que existan obras cargadas.

**Independent Test**: marcar varios animes como favoritos y asignarles posiciones de Ranking, verificar en la vista pública que aparecen destacados y dentro del filtro "Favoritos"; entrar a Ranking y verificar que muestra los animes en el orden asignado (aunque no coincida con sus estrellas), sin superar 10 posiciones.

**Acceptance Scenarios**:

1. **Given** una obra no favorita, **When** el Administrador la marca como favorita, **Then** en la vista pública aparece destacada y dentro del filtro "Favoritos".
2. **Given** una obra favorita, **When** el Administrador la desmarca, **Then** deja de estar destacada, de aparecer en "Favoritos" y, si es anime, sale del Ranking.
3. **Given** animes favoritos con posición asignada, **When** el visitante entra a Ranking, **Then** ve como máximo 10 animes, numerados según la posición asignada, cada uno con sus estrellas y acceso a su detalle.
4. **Given** un anime en el puesto 1 con 4 estrellas y otro en el puesto 2 con 5 estrellas, **When** el visitante entra a Ranking, **Then** el orden respeta las posiciones asignadas, no las estrellas.
5. **Given** el Administrador asignando posiciones, **When** intenta poner dos animes en la misma posición o una posición fuera de 1–10, **Then** el sistema no lo permite (o reacomoda) y nunca quedan posiciones duplicadas.
6. **Given** un anime favorito sin posición asignada, **When** el visitante entra a Ranking, **Then** ese anime no aparece en el Ranking, aunque sigue destacado como favorito en las grillas.
7. **Given** que no hay animes con posición en el Ranking, **When** el visitante entra a Ranking, **Then** ve un estado vacío amigable.

---

### User Story 8 - Estadísticas (Priority: P2)

El visitante ve en el Inicio tres números generales (animes vistos, favoritos, mangas leídos) y, en la página Estadísticas, varios gráficos sobre el catálogo, con una sección dedicada a géneros.

**Why this priority**: le da un toque profesional al sitio y responde "¿qué le gusta?" de un vistazo, pero no es imprescindible para compartir la lista.

**Independent Test**: con un catálogo conocido (p. ej. 5 animes completados, 3 mangas completados, 4 favoritos), verificar que el Inicio muestra 5, 4 y 3; luego entrar a Estadísticas y verificar que cada gráfico coincide con los datos cargados, incluida la distribución por género.

**Acceptance Scenarios**:

1. **Given** un catálogo con 5 animes en estado "Completado", **When** el visitante abre el Inicio, **Then** ve "5" como cantidad de animes vistos.
2. **Given** un catálogo con 4 obras favoritas (sumando anime y manga), **When** el visitante abre el Inicio, **Then** ve "4" como cantidad de favoritos.
3. **Given** un catálogo con 3 mangas en estado "Completado", **When** el visitante abre el Inicio, **Then** ve "3" como cantidad de mangas leídos.
4. **Given** un catálogo con obras de varios géneros, **When** el visitante abre Estadísticas, **Then** ve una sección por género con la cantidad de obras de cada uno, donde una obra con dos géneros suma en ambos.
5. **Given** un catálogo vacío, **When** el visitante abre Inicio o Estadísticas, **Then** ve los contadores en 0 y un estado vacío amigable en lugar de gráficos rotos.

---

### User Story 9 - Pendientes y Ruleta (Priority: P3)

El visitante (o el propio autor) entra a Pendientes para ver todo lo que está en la lista de espera. En la Ruleta elige si quiere un anime o un manga, y el sitio sortea una obra pendiente de ese tipo y la muestra con toda su información, para resolver el "¿qué miro o leo ahora?".

**Why this priority**: son vistas derivadas del catálogo; suman, pero el producto funciona sin ellas.

**Independent Test**: con varias obras en "Pendiente", entrar a Pendientes y verificar que aparecen solo esas; en la Ruleta, sortear varias veces con "Anime" y varias con "Manga" y verificar que siempre sale una obra pendiente del tipo elegido, nunca una en otro estado ni del otro tipo.

**Acceptance Scenarios**:

1. **Given** obras en distintos estados, **When** el visitante entra a Pendientes, **Then** ve solo las obras en estado "Pendiente", animes y mangas.
2. **Given** la Ruleta, **When** el visitante entra, **Then** ve un selector claro entre "Anime" y "Manga" (con "Anime" elegido por defecto).
3. **Given** varios mangas pendientes, **When** el visitante elige "Manga" y sortea, **Then** ve un manga pendiente elegido al azar con toda su información (como en su detalle).
4. **Given** el resultado de la Ruleta, **When** el visitante pide otra opción, **Then** el sitio sortea de nuevo entre los pendientes del tipo elegido, evitando repetir el mismo de inmediato si hay más de uno.
5. **Given** un resultado de anime, **When** el visitante cambia el selector a "Manga", **Then** el sorteo siguiente se hace solo entre mangas pendientes.
6. **Given** que no hay pendientes del tipo elegido, **When** el visitante sortea, **Then** ve un mensaje amigable indicando que no hay nada pendiente de ese tipo y puede cambiar al otro.

---

### Edge Cases

- **Catálogo vacío o sección vacía (CL1)**: si no hay obras cargadas, si una sección no tiene obras o si una combinación de filtros no devuelve resultados, se muestra un estado vacío amigable y prolijo ("Aún no hay obras en esta categoría"). En el panel del Administrador, el estado vacío invita a cargar la primera obra.
- **Títulos excesivamente largos (CL2)**: un título muy largo (p. ej. un isekai moderno de más de 100 caracteres) se recorta con puntos suspensivos o se ajusta en la tarjeta sin deformar la grilla; el título completo se ve en el detalle.
- **Reseña breve larga**: en la tarjeta se recorta sin romper la grilla; completa se ve en el detalle.
- **Portada rota**: si la URL de la portada (obligatoria) deja de cargar, se muestra una imagen de reemplazo con el estilo del sitio, sin romper la tarjeta ni el detalle.
- **Sesión expirada durante una edición (CL3)**: si la sesión vence mientras el Administrador completa un formulario, al intentar guardar el sistema no pierde lo escrito: muestra un aviso claro, lo lleva a `/login` y, al volver, el formulario se recupera con los datos que había ingresado.
- **Visitante que intenta modificar datos por fuera de la interfaz**: cualquier intento de crear, editar o eliminar obras sin sesión válida es rechazado por el sistema, aunque no se use la interfaz visual.
- **Duplicados por diferencias menores de escritura**: "Naruto", "naruto" y " Naruto " se consideran el mismo título para la regla de unicidad dentro de un mismo tipo.
- **Progreso inconsistente**: los episodios vistos (o capítulos leídos) no pueden superar el total cargado; si el total es desconocido (obra en emisión), la barra muestra la cantidad vista (p. ej. "12 episodios vistos") sin un porcentaje falso.
- **Pasar a Completado**: al cambiar una obra a Completado con total conocido, el progreso se completa automáticamente al total.
- **Más de 10 animes favoritos**: solo 10 pueden tener posición en el Ranking; el resto sigue siendo favorito en las grillas.
- **Datos opcionales vacíos**: si una obra no tiene reseña breve, reseña ampliada, géneros o totales, la tarjeta y el detalle omiten ese bloque de forma prolija (sin textos "undefined" ni huecos).
- **Obra sin géneros**: se permite; en Estadísticas se cuenta bajo "Sin género".
- **Muchos géneros en una tarjeta**: la tarjeta muestra los primeros y un indicador "+N"; el detalle muestra todos.
- **Obra sin calificar**: una obra (típicamente Pendiente) puede no tener estrellas; la tarjeta y el detalle muestran "Sin calificar" en lugar de cero estrellas.
- **Catálogo grande**: con hasta 200 obras, cada sección muestra todo en una sola página sin paginación y sigue siendo fluida al filtrar.
- **Pantallas chicas**: grillas, filtros, menú y gráficos se usan cómodamente desde un celular.

## Requirements *(mandatory)*

### Functional Requirements

**Acceso y seguridad**

- **FR-001**: El sistema DEBE permitir la autenticación de un único usuario Administrador desde la dirección `/login` (RF1).
- **FR-002**: `/login` NO DEBE estar enlazado desde ninguna página del sitio.
- **FR-003**: El sistema NO DEBE ofrecer registro de cuentas ni ninguna forma de crear usuarios adicionales.
- **FR-004**: Todo lo que sea del Administrador DEBE vivir bajo `/dashboard`; cualquier dirección bajo `/dashboard` DEBE requerir sesión válida y, sin ella, redirigir a la vista pública (CA3).
- **FR-005**: Toda operación que modifique el catálogo DEBE ser rechazada por el sistema si no proviene de una sesión válida de Administrador, independientemente de lo que muestre la interfaz (RN1).
- **FR-006**: El Administrador DEBE poder cerrar sesión.
- **FR-007**: Ante credenciales incorrectas, el sistema DEBE mostrar un mensaje de error genérico que no indique qué dato falló.

**Gestión de obras (panel de control)**

- **FR-008**: El Administrador DEBE poder crear, ver, editar y eliminar obras desde `/dashboard` (RF2).
- **FR-009**: Cada obra DEBE tener: título (obligatorio), tipo (obligatorio: Anime o Manga), uno o más géneros de la lista de géneros (opcional), URL de la portada (obligatoria), reseña breve (opcional), reseña ampliada (opcional), para anime: temporadas (informativo), total de episodios y episodios vistos (opcionales); para manga: tomos (informativo), total de capítulos y capítulos leídos (opcionales); estado (obligatorio: exactamente uno entre Pendiente, Consumiendo, Completado, Abandonado), calificación en estrellas (opcional, de 0,5 a 5 estrellas en pasos de media estrella) e indicador de favorita (sí/no, por defecto no) (RF3, RF4).
- **FR-010**: Una obra DEBE tener un único estado a la vez; al cambiarlo, el estado anterior se reemplaza (RN2).
- **FR-011**: El sistema DEBE impedir que existan dos obras con el mismo título y el mismo tipo, comparando títulos sin distinguir mayúsculas/minúsculas ni espacios al inicio o al final (RN3).
- **FR-012**: Al detectar un duplicado, el sistema DEBE mostrar un error claro y ofrecer ir a editar la obra existente.
- **FR-013**: El sistema DEBE validar los datos antes de guardar e indicar qué campo falta o es inválido (incluido un progreso mayor que el total).
- **FR-014**: El sistema DEBE pedir confirmación antes de eliminar una obra.
- **FR-015**: Si la sesión vence mientras el Administrador completa un formulario, el sistema DEBE conservar los datos ingresados y restaurarlos después de que vuelva a iniciar sesión, mostrando un aviso claro de lo ocurrido (CL3).
- **FR-016**: El Administrador DEBE poder asignar manualmente a cada anime favorito una posición única de Ranking entre 1 y 10, cambiarla o quitarla; al dejar de ser favorito, el anime pierde su posición.

**Vista pública — estructura**

- **FR-016b**: El Administrador DEBE poder crear, renombrar y eliminar géneros de la lista desde `/dashboard`; los nombres de género son únicos sin distinguir mayúsculas. Eliminar un género en uso DEBE pedir confirmación indicando cuántas obras lo tienen, y lo quita de esas obras.
- **FR-017**: El sitio público DEBE ser multipágina con las secciones Inicio, Animes, Mangas, Ranking, Estadísticas, Pendientes y Ruleta, accesibles desde un menú presente en todas las páginas públicas, sin iniciar sesión (RF5, HU5, CA1).
- **FR-018**: Cada obra DEBE tener una página de detalle pública con dirección propia que muestre toda su información.
- **FR-019**: Ninguna página pública DEBE mostrar controles para agregar, editar ni eliminar obras, ni enlaces a `/login` o `/dashboard` (RN1).

**Vista pública — contenido**

- **FR-020**: Animes y Mangas DEBEN mostrar en grilla todas las obras de su tipo; cada tarjeta DEBE mostrar portada, título, géneros, reseña breve, calificación en estrellas (o "Sin calificar"), estado y barra de progreso, y las favoritas DEBEN destacarse visualmente.
- **FR-021**: Anime y manga DEBEN mostrar una barra de progreso (en tarjeta y detalle): episodios vistos / total de episodios para anime, capítulos leídos / total de capítulos para manga, con el texto "X / Y" junto a la barra. Temporadas y tomos se muestran solo como dato informativo en el detalle.
- **FR-022**: El estado "Consumiendo" DEBE mostrarse al visitante como "Viendo" para anime y "Leyendo" para manga.
- **FR-023**: Animes y Mangas DEBEN permitir filtrar por Estado y por Favoritos, combinar esos filtros y quitarlos en un solo paso (RF6; el Tipo lo da la sección).
- **FR-024**: Inicio DEBE mostrar: cantidad de animes vistos (animes en estado Completado), cantidad de favoritos (anime + manga) y cantidad de mangas leídos (mangas en estado Completado).
- **FR-025**: Estadísticas DEBE mostrar varios gráficos del catálogo — como mínimo, distribución por estado, comparación anime vs. manga y una sección por género con la cantidad de obras de cada uno (una obra suma en cada uno de sus géneros, por lo que la suma puede superar el total de obras).
- **FR-026**: Ranking DEBE mostrar los animes favoritos con posición asignada, ordenados por esa posición (no por estrellas), numerados, con un máximo de 10 y mostrando las estrellas de cada uno.
- **FR-027**: Pendientes DEBE mostrar todas las obras (anime y manga) en estado Pendiente.
- **FR-028**: La Ruleta DEBE permitir elegir entre Anime y Manga y mostrar una obra en estado Pendiente de ese tipo elegida al azar, con toda su información, y permitir volver a sortear.
- **FR-029**: Cuando no hay obras para mostrar en una sección, gráfico o filtro, el sistema DEBE mostrar un estado vacío amigable (CL1).
- **FR-030**: Los títulos y reseñas breves largos DEBEN recortarse o ajustarse sin romper la grilla (CL2), y una portada que no carga DEBE reemplazarse por una imagen genérica; los datos opcionales vacíos se omiten sin dejar huecos.
- **FR-031**: Las secciones DEBEN mostrar todas sus obras en una sola página, sin paginación ni carga infinita.
- **FR-032**: Los cambios guardados por el Administrador DEBEN verse en todas las secciones públicas al abrirlas o recargarlas (CA2).
- **FR-033**: Todos los textos visibles DEBEN estar en español de Argentina, con un tono cercano y personal.

### Key Entities

- **Obra**: un anime o manga del catálogo. Atributos: título, tipo (Anime / Manga), géneros (cero o más), URL de la portada, reseña breve, reseña ampliada, temporadas o tomos (informativo), total de episodios o capítulos (opcional si está en emisión), episodios vistos o capítulos leídos, estado (Pendiente / Consumiendo / Completado / Abandonado), calificación (0,5–5 estrellas en pasos de 0,5, opcional), favorita (sí/no), posición en el Ranking (opcional, solo animes favoritos, 1–10, única), fecha de alta y fecha de última modificación. La combinación título + tipo es única.
- **Género**: categoría temática (p. ej. Fantasía, Shōnen, Romance) que el Administrador mantiene en una lista. Nombre único. Una obra puede tener varios géneros y un género puede estar en muchas obras.
- **Administrador**: la única persona autorizada a modificar el catálogo. Se identifica con credenciales propias; no hay otros usuarios ni roles.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un visitante que abre el enlace por primera vez ve el Inicio en menos de 3 segundos y sin ningún paso previo.
- **SC-002**: Un visitante sin instrucciones puede responder "¿qué mangas completó?", "¿cuál es su anime favorito número 1?" o "¿qué le recomendás ver?" en menos de 30 segundos navegando el sitio.
- **SC-003**: Al aplicar o quitar un filtro, la grilla se actualiza de forma percibida como instantánea (menos de 1 segundo) con un catálogo de 200 obras.
- **SC-004**: El Administrador puede cargar una obra nueva completa en menos de 3 minutos.
- **SC-005**: Un cambio hecho por el Administrador es visible en todas las secciones públicas afectadas en la siguiente apertura o recarga, en el 100 % de los casos.
- **SC-006**: El 100 % de los intentos de acceder a `/dashboard` o de modificar obras sin sesión válida son bloqueados, y ninguna página pública contiene enlaces a `/login`.
- **SC-007**: Ninguna tarjeta rompe la alineación de la grilla, incluso con títulos de 150 caracteres o portadas rotas, tanto en celular como en escritorio.
- **SC-008**: Los tres números del Inicio y todos los gráficos de Estadísticas coinciden en el 100 % de los casos con un conteo manual del catálogo.
- **SC-009**: Ante una sesión vencida durante una edición, el Administrador no pierde ningún dato que haya escrito en el formulario.

## Assumptions

- **Calificación**: de 0,5 a 5 estrellas en pasos de media estrella, opcional. Es independiente del Ranking: sirve como valoración visible, no para ordenar el top.
- **Estado "Consumiendo"**: se guarda como un único estado y se muestra como "Viendo" (anime) o "Leyendo" (manga).
- **"Visto" / "Leído"**: un anime cuenta como visto y un manga como leído cuando está en estado Completado.
- **Unicidad (RN3)**: regla obligatoria, comparando título + tipo sin distinguir mayúsculas ni espacios en los extremos. Un mismo título puede existir una vez como Anime y otra como Manga.
- **Portadas**: son obligatorias y se cargan a mano como URL de una imagen externa; no se suben archivos ni se buscan automáticamente (Constitución, principio III).
- **Orden por defecto** de las grillas: favoritas primero y, dentro de cada grupo, las obras modificadas más recientemente.
- **Credenciales del Administrador**: se configuran fuera del sitio (no hay pantalla de alta de usuario ni de recuperación de contraseña en v1).
- **Visibilidad**: todas las obras cargadas son públicas; no existen obras privadas u ocultas en v1.
- **Volumen**: el catálogo de v1 no supera las 200 obras.
- **Fuera de alcance**: múltiples usuarios o listas; integración con MyAnimeList, AniList, Kitsu u otras fuentes externas (toda la carga es manual); subida de imágenes; comentarios, likes o mensajes de visitantes; paginación o scroll infinito; búsqueda por texto; Ranking de mangas.
